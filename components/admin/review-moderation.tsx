'use client'

import { useState } from 'react'
import { Star, Check, X, RotateCcw } from 'lucide-react'
import { Review } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'

type ReviewWithProduct = Review & {
  product: { id: string; name: string; slug: string } | null
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i <= rating ? 'fill-peach-400 text-peach-400' : 'fill-neutral-200 text-neutral-200'
          )}
        />
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'In afwachting', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Goedgekeurd', className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Afgewezen', className: 'bg-red-50 text-red-600 border-red-200' },
}

export function ReviewModeration({ initialReviews }: { initialReviews: ReviewWithProduct[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [filter, setFilter] = useState<Filter>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const toast = useToast()

  const pendingCount = reviews.filter((r) => r.status === 'pending').length

  const filtered = reviews.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Er ging iets mis')
        return
      }

      // Optimistic update
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      )

      const messages: Record<string, string> = {
        approved: 'Beoordeling goedgekeurd',
        rejected: 'Beoordeling afgewezen',
        pending: 'Beoordeling teruggezet naar In afwachting',
      }
      toast.success(messages[status])
    } catch {
      toast.error('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setProcessing(null)
    }
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'pending', label: 'In afwachting' },
    { value: 'all', label: 'Alle' },
    { value: 'approved', label: 'Goedgekeurd' },
    { value: 'rejected', label: 'Afgewezen' },
  ]

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all',
              filter === value
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300'
            )}
          >
            {label}
            {value === 'pending' && pendingCount > 0 && (
              <span className={cn(
                'text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                filter === 'pending' ? 'bg-white text-brand-600' : 'bg-amber-400 text-white'
              )}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 py-16 text-center shadow-card">
          <p className="text-neutral-400 text-sm">Geen beoordelingen gevonden.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {filtered.map((review) => {
              const isProcessing = processing === review.id
              const statusInfo = STATUS_LABELS[review.status]

              return (
                <div key={review.id} className="px-6 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Stars rating={review.rating} />
                        <span
                          className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded-full border',
                            statusInfo.className
                          )}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <p className="font-bold text-sm text-neutral-800 mb-0.5">
                        {review.author_name}
                      </p>

                      {review.product && (
                        <p className="text-xs text-brand-500 font-semibold mb-2">
                          {review.product.name}
                        </p>
                      )}

                      {review.body && (
                        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                          {review.body}
                        </p>
                      )}

                      <p className="text-xs text-neutral-400 mt-2">
                        {formatDate(review.created_at)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 shrink-0">
                      {review.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateStatus(review.id, 'approved')}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Goedkeuren
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(review.id, 'rejected')}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Afwijzen
                          </button>
                        </>
                      )}
                      {(review.status === 'approved' || review.status === 'rejected') && (
                        <button
                          type="button"
                          onClick={() => updateStatus(review.id, 'pending')}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Terugzetten
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
