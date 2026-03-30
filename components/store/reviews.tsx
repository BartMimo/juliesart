'use client'

import { useEffect, useState } from 'react'
import { Star, Pencil, User, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Review } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function Stars({
  rating,
  size = 'sm',
}: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i <= rating ? 'fill-peach-400 text-peach-400' : 'fill-neutral-200 text-neutral-200'
          )}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Rating Summary
// ─────────────────────────────────────────────
function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100),
  }))

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-brand-50 rounded-2xl border border-brand-100 mb-8">
      {/* Average */}
      <div className="text-center shrink-0">
        <p className="text-5xl font-black text-neutral-800 leading-none mb-2">
          {avg.toFixed(1)}
        </p>
        <Stars rating={Math.round(avg)} size="md" />
        <p className="text-xs text-neutral-500 mt-1.5">
          {reviews.length} {reviews.length === 1 ? 'beoordeling' : 'beoordelingen'}
        </p>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-20 bg-brand-200" />

      {/* Distribution */}
      <div className="flex-1 w-full space-y-1.5">
        {dist.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-right text-neutral-500 font-semibold shrink-0">{star}</span>
            <Star className="h-3 w-3 fill-peach-300 text-peach-300 shrink-0" />
            <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-peach-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-neutral-400 shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Single Review Card
// ─────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = (review.body?.length ?? 0) > 200
  const bodyText = review.body ?? ''

  return (
    <div className="py-5 border-b border-neutral-100 last:border-b-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-brand-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-800 leading-tight">{review.author_name}</p>
            <p className="text-xs text-neutral-400">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      {bodyText && (
        <div className="ml-11">
          <p className="text-sm text-neutral-600 leading-relaxed">
            {isLong && !expanded ? `${bodyText.slice(0, 200)}…` : bodyText}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-brand-500 font-semibold mt-1.5 hover:text-brand-600 transition-colors"
            >
              {expanded ? (
                <><ChevronUp className="h-3.5 w-3.5" /> Minder tonen</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" /> Meer lezen</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Star Input (interactive)
// ─────────────────────────────────────────────
function StarInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  const labels = ['', 'Slecht', 'Matig', 'Goed', 'Erg goed', 'Uitstekend']

  return (
    <div>
      <div
        className="flex gap-1"
        onMouseLeave={() => setHovered(0)}
        role="group"
        aria-label="Beoordeling geven"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(0)}
            aria-label={`${i} ${i === 1 ? 'ster' : 'sterren'}`}
            className="p-0.5 rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors',
                i <= display
                  ? 'fill-peach-400 text-peach-400'
                  : 'fill-neutral-200 text-neutral-200'
              )}
            />
          </button>
        ))}
      </div>
      {display > 0 && (
        <p className="text-xs text-brand-600 font-semibold mt-1">{labels[display]}</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Write Review Form
// ─────────────────────────────────────────────
function WriteReviewForm({
  productId,
  defaultName,
  onSubmitted,
}: {
  productId: string
  defaultName: string
  onSubmitted: () => void
}) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState(defaultName)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Kies een aantal sterren', 'Geef aan hoe je het product beoordeelt.')
      return
    }
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Vul je naam in', 'Minimaal 2 tekens vereist.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating,
          author_name: name.trim(),
          body: body.trim() || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Er ging iets mis. Probeer het opnieuw.')
        return
      }

      onSubmitted()
    } catch {
      toast.error('Er ging iets mis. Controleer je internetverbinding.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star rating */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Jouw beoordeling <span className="text-red-400">*</span>
        </label>
        <StarInput value={rating} onChange={setRating} />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          Naam <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jouw naam"
          maxLength={80}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition-shadow"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          Jouw recensie <span className="text-neutral-400 font-normal">(optioneel)</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Vertel anderen wat je van dit product vindt…"
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none transition-shadow"
        />
        <p className="text-xs text-neutral-400 mt-1 text-right">{body.length}/1000</p>
      </div>

      <Button type="submit" loading={loading} size="lg">
        Beoordeling plaatsen
      </Button>
    </form>
  )
}

// ─────────────────────────────────────────────
// Main ReviewSection
// ─────────────────────────────────────────────
export function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      // Fetch approved reviews
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      setReviews(data ?? [])

      // Check login + get name
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        setUserName(profile?.full_name ?? '')
      }

      setLoading(false)
    }

    load()
  }, [productId])

  const handleSubmitted = () => {
    setSubmitted(true)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="py-8">
        <Spinner />
      </div>
    )
  }

  const canWriteReview = isLoggedIn && !submitted

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading-section text-2xl text-neutral-800 mb-1">
            Beoordelingen
          </h2>
          {reviews.length > 0 && (
            <p className="text-sm text-neutral-500">
              {reviews.length} {reviews.length === 1 ? 'beoordeling' : 'beoordelingen'}
            </p>
          )}
        </div>

        {canWriteReview && !showForm && (
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowForm(true)}
          >
            <Pencil className="h-4 w-4" />
            Schrijf een recensie
          </Button>
        )}
      </div>

      {/* Rating summary */}
      <RatingSummary reviews={reviews} />

      {/* Write review form */}
      {submitted && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl px-6 py-5">
          <p className="text-green-700 font-semibold text-sm">
            ✓ Bedankt voor je beoordeling!
          </p>
          <p className="text-green-600 text-sm mt-1">
            Je recensie wordt zo snel mogelijk goedgekeurd en verschijnt daarna op deze pagina.
          </p>
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white border border-brand-200 rounded-2xl p-6 shadow-soft">
          <h3 className="font-bold text-neutral-800 mb-5 flex items-center gap-2">
            <Pencil className="h-4 w-4 text-brand-500" />
            Schrijf een recensie
          </h3>
          <WriteReviewForm
            productId={productId}
            defaultName={userName}
            onSubmitted={handleSubmitted}
          />
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-2xl">
          <div className="flex justify-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-6 w-6 fill-neutral-200 text-neutral-200" />
            ))}
          </div>
          <p className="text-neutral-500 font-semibold mb-1">Nog geen beoordelingen</p>
          <p className="text-neutral-400 text-sm mb-4">Wees de eerste die dit product beoordeelt!</p>
          {!isLoggedIn && (
            <a
              href="/inloggen"
              className="text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors"
            >
              Log in om een beoordeling te schrijven →
            </a>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card divide-y divide-neutral-50 px-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Login prompt (not logged in, reviews exist) */}
      {!isLoggedIn && reviews.length > 0 && (
        <p className="text-sm text-neutral-500 mt-4 text-center">
          <a href="/inloggen" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Log in
          </a>{' '}
          om een beoordeling te schrijven.
        </p>
      )}
    </div>
  )
}
