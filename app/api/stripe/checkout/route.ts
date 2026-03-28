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
        // Check validity
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
      payment_method_types: ['card', 'ideal', 'bancontact'],
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
        // Serialize cart for webhook
        cart_items: JSON.stringify(items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          personalizations: item.personalizations?.map((p) => ({
            fieldKey: p.fieldKey,
            fieldLabel: p.fieldLabel,
            fieldType: p.fieldType,
            value: p.value,
            displayValue: p.displayValue,
          })),
        }))),
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het starten van de betaling.' },
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
