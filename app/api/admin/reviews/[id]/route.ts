import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ReviewStatus } from '@/types'

const VALID_STATUSES: ReviewStatus[] = ['approved', 'rejected', 'pending']

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { status } = await request.json()

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })
  }

  // Verify admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  // Update via admin client
  const adminClient = createAdminClient()
  const { data: review, error } = await adminClient
    .from('reviews')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, review })
}
