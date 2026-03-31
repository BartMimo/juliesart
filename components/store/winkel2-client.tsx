'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react'
import { Product, Category } from '@/types'
import { formatPrice, cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// STICKY FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────

const sortOptions = [
  { value: 'nieuwst', label: 'Nieuwst' },
  { value: 'prijs-laag', label: 'Prijs oplopend' },
  { value: 'prijs-hoog', label: 'Prijs aflopend' },
  { value: 'naam', label: 'Naam A–Z' },
]

interface FilterBarProps {
  categories: Category[]
  zoeken: string
  categorie: string
  sorteren: string
  total: number
}

export function Winkel2FilterBar({ categories, zoeken, categorie, sorteren, total }: FilterBarProps) {
  const [query, setQuery] = useState(zoeken)
  const [scrolled, setScrolled] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const buildUrl = (params: Record<string, string>) => {
    const p = new URLSearchParams()
    if (params.categorie) p.set('categorie', params.categorie)
    if (params.zoeken) p.set('zoeken', params.zoeken)
    if (params.sorteren && params.sorteren !== 'nieuwst') p.set('sorteren', params.sorteren)
    return `/winkel${p.toString() ? `?${p.toString()}` : ''}`
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = buildUrl({ categorie, zoeken: query.trim(), sorteren })
  }

  const activeSort = sortOptions.find(o => o.value === (sorteren || 'nieuwst')) ?? sortOptions[0]

  return (
    <div
      className={cn(
        'sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b transition-all duration-300',
        scrolled ? 'border-brand-100 shadow-soft' : 'border-transparent'
      )}
    >
      <div className="container-brand">
        {/* Desktop filter bar */}
        <div className="hidden md:flex items-center gap-0 py-3">

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mr-6 flex-shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Zoek een product..."
              className="pl-10 pr-8 py-2.5 text-sm font-medium bg-white border border-brand-100 rounded-xl w-52 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); window.location.href = buildUrl({ categorie, sorteren }) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
            <Link
              href={buildUrl({ sorteren })}
              className={cn(
                'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                !categorie
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-white hover:text-neutral-800 hover:shadow-soft'
              )}
            >
              Alles
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={buildUrl({ categorie: cat.slug, sorteren })}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  categorie === cat.slug
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-white hover:text-neutral-800 hover:shadow-soft'
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Count + Sort */}
          <div className="flex items-center gap-4 ml-6 flex-shrink-0">
            <span className="text-sm text-neutral-400">
              <span className="font-bold text-neutral-700">{total}</span> {total === 1 ? 'product' : 'producten'}
            </span>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-100 rounded-xl text-sm font-semibold text-neutral-700 hover:border-brand-300 transition-colors"
              >
                {activeSort.label}
                <ChevronDown className={cn('h-4 w-4 text-neutral-400 transition-transform', sortOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-hover border border-brand-100 overflow-hidden z-50"
                  >
                    {sortOptions.map(opt => (
                      <Link
                        key={opt.value}
                        href={buildUrl({ categorie, zoeken: query.trim(), sorteren: opt.value })}
                        onClick={() => setSortOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors',
                          (sorteren || 'nieuwst') === opt.value
                            ? 'text-brand-600 bg-brand-50'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        )}
                      >
                        {opt.label}
                        {(sorteren || 'nieuwst') === opt.value && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        )}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile filter bar */}
        <div className="flex md:hidden flex-col gap-3 py-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Zoek een product..."
              className="w-full pl-10 pr-10 py-3 text-sm font-medium bg-white border border-brand-100 rounded-2xl focus:outline-none focus:border-brand-400 transition-all"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); window.location.href = buildUrl({ categorie, sorteren }) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Category pills row + sort */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
              <Link href={buildUrl({ sorteren })} className={cn('shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all', !categorie ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-neutral-600 border-neutral-200')}>Alles</Link>
              {categories.map(cat => (
                <Link key={cat.id} href={buildUrl({ categorie: cat.slug, sorteren })} className={cn('shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all', categorie === cat.slug ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-neutral-600 border-neutral-200')}>{cat.name}</Link>
              ))}
            </div>
            <select
              defaultValue={sorteren || 'nieuwst'}
              onChange={e => { window.location.href = buildUrl({ categorie, zoeken: query, sorteren: e.target.value }) }}
              className="shrink-0 text-xs font-bold text-neutral-700 bg-white border border-brand-100 rounded-xl px-2 py-2 outline-none"
            >
              {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────

function PremiumProductCard({ product, index }: { product: Product; index: number }) {
  const primaryImage = product.images?.find(img => img.is_primary) ?? product.images?.[0]
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0
  const hasPersonalization = (product.personalization_fields?.length ?? 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        {/* Image container */}
        <div className="relative overflow-hidden rounded-2xl mb-4 bg-gradient-to-br from-brand-50 to-peach-50" style={{ aspectRatio: '1/1' }}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-20">🎀</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/20 transition-all duration-500" />

          {/* CTA on hover */}
          <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-hover">
              <span className="text-xs font-bold text-brand-600">Bekijk product</span>
              <ArrowRight className="h-4 w-4 text-brand-500" />
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-peach-400 text-white shadow-sm">
                −{discountPercent}%
              </span>
            )}
            {product.is_featured && !hasDiscount && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-brand-600 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5" />
                Favoriet
              </span>
            )}
          </div>

          {/* Personaliseerbaar badge */}
          {hasPersonalization && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/90 text-white backdrop-blur-sm">
                ✦ Op naam
              </span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="px-1">
          {product.category && (
            <p className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="font-bold text-neutral-800 text-sm leading-snug mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-neutral-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT GRID
// ─────────────────────────────────────────────────────────────────────────────

interface ProductGridProps {
  products: Product[]
  zoeken: string
}

export function Winkel2Grid({ products, zoeken }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-100 to-peach-100 flex items-center justify-center mx-auto mb-6 shadow-soft">
          <ShoppingBag className="h-10 w-10 text-brand-400" />
        </div>
        <h3 className="heading-section text-xl text-neutral-800 mb-2">
          {zoeken ? `Niets gevonden voor "${zoeken}"` : 'Geen producten gevonden'}
        </h3>
        <p className="text-neutral-500 text-sm mb-6 max-w-xs">
          Probeer een andere zoekterm of bekijk onze volledige collectie.
        </p>
        <Link
          href="/winkel"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
        >
          Bekijk alles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
      {products.map((product, index) => (
        <PremiumProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}
