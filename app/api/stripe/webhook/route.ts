import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/email/resend'
import Stripe from 'stripe'

// Stripe sends raw body — must not parse as JSON
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Only handle successful payments
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const sessionSnapshot = event.data.object as Stripe.CheckoutSession

  // Prevent duplicate order creation
  if (sessionSnapshot.payment_status !== 'paid') {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  // Check if order already exists
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', sessionSnapshot.id)
    .single()

  if (existingOrder) {
    console.log(`Order already exists for session ${sessionSnapshot.id}`)
    return NextResponse.json({ received: true })
  }

  // Retrieve full session from Stripe to ensure all fields (including shipping_details)
  // are present regardless of the webhook endpoint's API version
  const session = await stripe.checkout.sessions.retrieve(sessionSnapshot.id)

  try {
    // Parse cart items from metadata
    const cartItems = JSON.parse(session.metadata?.cart_items ?? '[]')
    const discountCodeId = session.metadata?.discount_code_id || null
    const discountCode = session.metadata?.discount_code || null
    const userId = session.metadata?.user_id || null

    // Get shipping details
    const shippingDetails = session.shipping_details
    const shippingCost = session.shipping_cost
    const shippingAmount = shippingCost ? shippingCost.amount_total / 100 : 0

    // Calculate amounts
    const subtotalCents = session.amount_subtotal ?? 0
    const totalCents = session.amount_total ?? 0
    const discountCents = session.total_details?.amount_discount ?? 0

    const subtotal = subtotalCents / 100
    const total = totalCents / 100
    const discountAmount = discountCents / 100

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        email: session.customer_details?.email ?? '',
        customer_name: shippingDetails?.name ?? session.customer_details?.name ?? null,
        phone: session.customer_details?.phone ?? null,
        status: 'paid',
        subtotal,
        discount_amount: discountAmount,
        discount_code: discountCode || null,
        discount_code_id: discountCodeId || null,
        shipping_amount: shippingAmount,
        tax_amount: 0, // Included in prices (incl. BTW)
        total,
        stripe_payment_intent_id: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
        stripe_session_id: session.id,
        shipping_name: shippingDetails?.name ?? null,
        shipping_address_line1: shippingDetails?.address?.line1 ?? null,
        shipping_address_line2: shippingDetails?.address?.line2 ?? null,
        shipping_city: shippingDetails?.address?.city ?? null,
        shipping_postal_code: shippingDetails?.address?.postal_code ?? null,
        shipping_country: shippingDetails?.address?.country ?? 'NL',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Failed to create order:', orderError)
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
    }

    // Create order items + personalization values
    for (const item of cartItems) {
      // Fetch product image from DB if not in metadata
      let productImage = item.productImage ?? null
      if (!productImage) {
        const { data: img } = await supabase
          .from('product_images')
          .select('url')
          .eq('product_id', item.productId)
          .order('sort_order')
          .limit(1)
          .single()
        productImage = img?.url ?? null
      }

      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.productName,
          product_slug: item.productSlug,
          product_image: productImage,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.unitPrice * item.quantity,
        })
        .select()
        .single()

      // Decrement stock atomically (only if track_inventory = true)
      if (!itemError && item.productId) {
        await supabase.rpc('decrement_product_stock', {
          p_product_id: item.productId,
          p_qty: item.quantity,
        })
      }

      if (!itemError && orderItem && item.personalizations?.length > 0) {
        await supabase.from('order_item_personalizations').insert(
          item.personalizations.map((p: {
            fieldKey: string
            fieldLabel: string
            fieldType: string
            value: string
            displayValue: string
          }) => ({
            order_item_id: orderItem.id,
            field_key: p.fieldKey,
            field_label: p.fieldLabel,
            field_type: p.fieldType,
            value: p.value,
            display_value: p.displayValue,
          }))
        )
      }
    }

    // Increment discount code usage
    if (discountCodeId) {
      await supabase.rpc('increment_discount_usage', { code_id: discountCodeId })
    }

    // Fetch complete order for email
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          personalizations:order_item_personalizations(*)
        )
      `)
      .eq('id', order.id)
      .single()

    // Send confirmation email
    if (completeOrder) {
      try {
        await sendOrderConfirmationEmail(completeOrder)
      } catch (emailError) {
        // Don't fail the webhook if email fails
        console.error('Email sending failed:', emailError)
      }
    }

    console.log(`Order ${order.order_number} created successfully for session ${session.id}`)
    return NextResponse.json({ received: true, orderId: order.id })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
