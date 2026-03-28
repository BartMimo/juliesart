import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { path, product_id, session_id, referrer } = await request.json()

    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Don't track admin pages
    if (path.startsWith('/admin')) {
      return NextResponse.json({ ok: true })
    }

    await supabase.from('page_views').insert({
      path,
      product_id: product_id ?? null,
      session_id: session_id ?? null,
      referrer: referrer ?? null,
      user_agent: request.headers.get('user-agent') ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Analytics failures should be silent
    return NextResponse.json({ ok: true })
  }
}
