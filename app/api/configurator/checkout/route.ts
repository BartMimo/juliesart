import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { EngravingPosition } from '@/types'

export const runtime = 'nodejs'

interface CheckoutBody {
  productId: string
  uploadUrl: string
  engravingPosition: EngravingPosition
  customerName: string
  customerEmail: string
  note?: string
}

export async function POST(request: NextRequest) {
  let body: CheckoutBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  const { productId, uploadUrl, engravingPosition, customerName, customerEmail, note } = body

  if (!productId || !uploadUrl || !engravingPosition || !customerName || !customerEmail) {
    return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('id, name, price, images:product_images(url, is_primary)')
    .eq('id', productId)
    .eq('is_active', true)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Product niet gevonden' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'ideal', 'bancontact'],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Gravure — ${product.name}`,
            description: `Gravure op maat voor ${product.name}`,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      order_type: 'configurator',
      product_id: product.id,
      product_name: product.name,
      upload_url: uploadUrl,
      engraving_position: JSON.stringify(engravingPosition),
      customer_name: customerName,
      customer_email: customerEmail,
      note: note ?? '',
    },
    success_url: `${siteUrl}/configurator/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/configurator?geannuleerd=1`,
  })

  return NextResponse.json({ url: session.url })
}
