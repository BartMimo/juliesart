import Stripe from 'stripe'
import { CartItem, DiscountCode } from '@/types'
import { formatPrice } from '@/lib/utils'

// Initialize Stripe server-side client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

// Convert cart items to Stripe line items
export function cartItemsToLineItems(items: CartItem[]): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => {
    // Build personalization description
    const personalizationLines = item.personalizations.map(
      (p) => `${p.fieldLabel}: ${p.displayValue || p.value}`
    )

    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.productName,
          description: personalizationLines.length > 0
            ? personalizationLines.join(' | ')
            : undefined,
          images: item.productImage ? [item.productImage] : undefined,
          metadata: {
            product_id: item.productId,
            product_slug: item.productSlug,
            // Store personalization as JSON string for webhook use
            personalizations: JSON.stringify(item.personalizations),
          },
        },
        unit_amount: Math.round(item.unitPrice * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }
  })
}

// Create or retrieve a Stripe coupon for a discount code
export async function getOrCreateStripeCoupon(discount: DiscountCode): Promise<string> {
  // If already synced to Stripe, use existing coupon
  if (discount.stripe_coupon_id) {
    try {
      await stripe.coupons.retrieve(discount.stripe_coupon_id)
      return discount.stripe_coupon_id
    } catch {
      // Coupon no longer exists in Stripe, create a new one
    }
  }

  // Supabase returns NUMERIC columns as strings — ensure we work with numbers
  const value = Number(discount.value)

  const coupon = await stripe.coupons.create({
    id: `JA_${discount.code}_${Date.now()}`,
    name: discount.code,
    ...(discount.type === 'percentage'
      ? { percent_off: value }
      : { amount_off: Math.round(value * 100), currency: 'eur' }
    ),
    duration: 'once',
    max_redemptions: discount.max_uses ?? undefined,
  })

  return coupon.id
}

// Calculate shipping for Stripe
export function getShippingOptions(subtotal: number): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const FREE_THRESHOLD = 50

  if (subtotal >= FREE_THRESHOLD) {
    return [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'eur' },
          display_name: 'Gratis verzending',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 2 },
            maximum: { unit: 'business_day', value: 5 },
          },
        },
      },
    ]
  }

  return [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: 495, currency: 'eur' },
        display_name: 'Standaard verzending',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 2 },
          maximum: { unit: 'business_day', value: 5 },
        },
      },
    },
  ]
}
