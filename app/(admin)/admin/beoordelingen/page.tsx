import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { ReviewModeration } from '@/components/admin/review-moderation'

export const metadata: Metadata = {
  title: 'Beoordelingen — Julies Art Admin',
}

export default async function BeoordelingenPage() {
  const supabase = createAdminClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, product:products(id, name, slug)')
    .order('created_at', { ascending: false })
    .limit(200)

  const pending = (reviews ?? []).filter((r) => r.status === 'pending').length

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold text-neutral-800">Beoordelingen</h1>
          {pending > 0 && (
            <span className="bg-amber-400 text-white text-xs font-black px-2.5 py-1 rounded-full">
              {pending} nieuw
            </span>
          )}
        </div>
        <p className="text-neutral-500 text-sm">
          Bekijk en modereer klantbeoordelingen voordat ze zichtbaar zijn op de productpagina.
        </p>
      </div>

      <ReviewModeration initialReviews={(reviews ?? []) as any} />
    </div>
  )
}
