import { NextRequest, NextResponse } from 'next/server'
import { stripe, cartItemsToLineItems, getOrCreateStripeCoupon, getShippingOptions } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CartItem } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, discountCode, successUrl, cancelUrl }: {
      items: CartItem[]
      discountCode?: string
      successUrl: string
      cancelUrl: string
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Winkelwagen is leeg' }, { status: 400 })
    }

    // Get current user (optional — support guest checkout too)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Build line items
    const lineItems = cartItemsToLineItems(items)
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

    // Handle discount code
    let discounts: { coupon: string }[] = []
    let discountCodeRecord = null

    if (discountCode) {
      const adminClient = createAdminClient()
      const { data: discount } = await adminClient
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (discount) {
        const now = new Date()
        const isValidDate = new Date(discount.valid_from) <= now &&
          (!discount.valid_until || new Date(discount.valid_until) >= now)
        const isUnderMaxUses = !discount.max_uses || discount.current_uses < discount.max_uses
        const meetsMinOrder = !discount.min_order_amount || subtotal >= discount.min_order_amount

        if (isValidDate && isUnderMaxUses && meetsMinOrder) {
          const couponId = await getOrCreateStripeCoupon(discount)
          discounts = [{ coupon: couponId }]
          discountCodeRecord = discount
        }
      }
    }

    // Shipping options
    const shippingOptions = getShippingOptions(subtotal)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      automatic_payment_methods: { enabled: true },
      line_items: lineItems,
      discounts: discounts.length > 0 ? discounts : undefined,
      shipping_address_collection: {
        allowed_countries: ['NL', 'BE', 'DE'],
      },
      shipping_options: shippingOptions,
      phone_number_collection: { enabled: true },
      customer_email: user?.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'nl',
      metadata: {
        user_id: user?.id ?? '',
        discount_code_id: discountCodeRecord?.id ?? '',
        discount_code: discountCode ?? '',
      },
    })

    // Sla cart-data op in Supabase (niet-blokkerend — mag niet de checkout onderbreken)
    try {
      const adminClient = createAdminClient()
      await adminClient.from('checkout_sessions').insert({
        stripe_session_id: session.id,
        cart_items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          personalizations: item.personalizations,
        })),
      })
    } catch (insertError) {
      // Loggen maar niet blokkeren — webhook valt terug op lege cart
      console.error('checkout_sessions insert failed:', insertError)
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: `Betalingsfout: ${message}` },
      { status: 500 }
    )
  }
}

// GET — fetch order by session ID (for success page)
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Geen sessie ID' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          personalizations:order_item_personalizations(*)
        )
      `)
      .eq('stripe_session_id', sessionId)
      .single()

    if (!order) {
      // Webhook may not have fired yet — return basic success
      return NextResponse.json({ order: null })
    }

    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ order: null })
  }
}
