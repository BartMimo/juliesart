import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { product_id, rating, body, author_name } = await request.json()

  // Validate inputs
  if (!product_id || typeof product_id !== 'string') {
    return NextResponse.json({ error: 'Ongeldig product' }, { status: 400 })
  }
  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Geef een beoordeling van 1 tot 5 sterren' }, { status: 400 })
  }
  if (!author_name || typeof author_name !== 'string' || author_name.trim().length < 2) {
    return NextResponse.json({ error: 'Vul je naam in (minimaal 2 tekens)' }, { status: 400 })
  }
  if (body && typeof body === 'string' && body.length > 1000) {
    return NextResponse.json({ error: 'Je recensie mag maximaal 1000 tekens bevatten' }, { status: 400 })
  }

  // Get current user (optional — guests are allowed)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if this user has already reviewed this product
  if (user) {
    const adminClient = createAdminClient()
    const { data: existing } = await adminClient
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Je hebt dit product al beoordeeld.' },
        { status: 409 }
      )
    }
  }

  // Insert review via admin client (bypasses RLS, validated above)
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('reviews').insert({
    product_id,
    user_id: user?.id ?? null,
    author_name: author_name.trim(),
    rating: Math.round(rating),
    body: body?.trim() || null,
    status: 'pending',
  })

  if (error) {
    console.error('Review insert error:', error)
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
