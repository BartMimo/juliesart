import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateDiscount } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const { code, subtotal } = await request.json()

  if (!code) {
    return NextResponse.json({ error: 'Geen kortingscode opgegeven' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: discount, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !discount) {
    return NextResponse.json({ error: 'Kortingscode niet gevonden' }, { status: 404 })
  }

  if (!discount.is_active) {
    return NextResponse.json({ error: 'Deze kortingscode is niet meer actief' }, { status: 400 })
  }

  const now = new Date()
  if (new Date(discount.valid_from) > now) {
    return NextResponse.json({ error: 'Deze kortingscode is nog niet geldig' }, { status: 400 })
  }
  if (discount.valid_until && new Date(discount.valid_until) < now) {
    return NextResponse.json({ error: 'Deze kortingscode is verlopen' }, { status: 400 })
  }
  if (discount.max_uses && discount.current_uses >= discount.max_uses) {
    return NextResponse.json({ error: 'Deze kortingscode is niet meer beschikbaar' }, { status: 400 })
  }
  if (discount.min_order_amount && subtotal < discount.min_order_amount) {
    return NextResponse.json({
      error: `Minimale bestelling van €${discount.min_order_amount.toFixed(2)} vereist voor deze code`
    }, { status: 400 })
  }

  const discountAmount = calculateDiscount(subtotal, discount.type, discount.value)

  return NextResponse.json({
    code: discount,
    discountAmount,
  })
}
