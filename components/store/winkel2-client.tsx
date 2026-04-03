'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, Sparkles, ShoppingBag, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { Product, Category } from '@/types'
import { formatPrice, cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Filters {
  zoeken: string
  categorieen: string       // comma-separated slugs
  sorteren: string
  personaliseren: boolean
  sale: boolean
  prijs_min: number | null
  prijs_max: number | null
}

interface CollectiesLayoutProps {
  products: Product[]
  categories: Category[]
  filters: Filters
  maxProductPrice: number
}

// ─────────────────────────────────────────────────────────────────────────────
// URL BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildUrl(filters: Partial<Filters> & { prijs_min?: number | null; prijs_max?: number | null }) {
  const p = new URLSearchParams()
  if (filters.zoeken)       p.set('zoeken', filters.zoeken)
  if (filters.categorieen)  p.set('categorieen', filters.categorieen)
  if (filters.sorteren && filters.sorteren !== 'nieuwst') p.set('sorteren', filters.sorteren)
  if (filters.personaliseren) p.set('personaliseren', '1')
  if (filters.sale)         p.set('sale', '1')
  if (filters.prijs_min != null && filters.prijs_min > 0)    p.set('prijs_min', String(filters.prijs_min))
  if (filters.prijs_max != null)                              p.set('prijs_max', String(filters.prijs_max))
  return `/collecties${p.toString() ? `?${p.toString()}` : ''}`
}

// ─────────────────────────────────────────────────────────────────────────────
// SORT OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const sortOptions = [
  { value: 'nieuwst',    label: 'Nieuwst' },
  { value: 'prijs-laag', label: 'Prijs oplopend' },
  { value: 'prijs-hoog', label: 'Prijs aflopend' },
  { value: 'naam',       label: 'Naam A–Z' },
]

// ─────────────────────────────────────────────────────────────────────────────
// PRICE RANGE SLIDER
// ─────────────────────────────────────────────────────────────────────────────

interface PriceSliderProps {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
}

function PriceSlider({ min, max, valueMin, valueMax, onChange }: PriceSliderProps) {
  const [localMin, setLocalMin] = useState(valueMin)
  const [localMax, setLocalMax] = useState(valueMax)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setLocalMin(valueMin) }, [valueMin])
  useEffect(() => { setLocalMax(valueMax) }, [valueMax])

  const pct = (v: number) => ((v - min) / (max - min)) * 100

  return (
    <div className="px-1 pb-1">
      {/* Price labels */}
      <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-3">
        <span>{formatPrice(localMin)}</span>
        <span>{formatPrice(localMax)}</span>
      </div>

      {/* Slider track */}
      <div ref={trackRef} className="relative h-5 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1.5 rounded-full bg-neutral-200" />
        {/* Active range */}
        <div
          className="absolute h-1.5 rounded-full bg-brand-500"
          style={{ left: `${pct(localMin)}%`, right: `${100 - pct(localMax)}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={localMin}
          onChange={e => {
            const v = Math.min(Number(e.target.value), localMax - 1)
            setLocalMin(v)
          }}
          onMouseUp={() => onChange(localMin, localMax)}
          onTouchEnd={() => onChange(localMin, localMax)}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
          style={{ zIndex: localMin >= localMax - 1 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={localMax}
          onChange={e => {
            const v = Math.max(Number(e.target.value), localMin + 1)
            setLocalMax(v)
          }}
          onMouseUp={() => onChange(localMin, localMax)}
          onTouchEnd={() => onChange(localMin, localMax)}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE SWITCH
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-0.5 group"
    >
      <span className={cn('text-sm font-medium transition-colors', checked ? 'text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-800')}>
        {label}
      </span>
      <div className={cn('relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0', checked ? 'bg-brand-500' : 'bg-neutral-200')}>
        <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PANEL (sidebar content)
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPanelProps {
  categories: Category[]
  filters: Filters
  maxProductPrice: number
}

function FilterPanel({ categories, filters, maxProductPrice }: FilterPanelProps) {
  const selectedCats = filters.categorieen ? filters.categorieen.split(',').filter(Boolean) : []

  const toggleCategory = (slug: string) => {
    const next = selectedCats.includes(slug)
      ? selectedCats.filter(s => s !== slug)
      : [...selectedCats, slug]
    window.location.href = buildUrl({ ...filters, categorieen: next.join(',') })
  }

  const handlePriceChange = (min: number, max: number) => {
    window.location.href = buildUrl({
      ...filters,
      prijs_min: min > 0 ? min : null,
      prijs_max: max < maxProductPrice ? max : null,
    })
  }

  const handleToggle = (key: 'personaliseren' | 'sale', value: boolean) => {
    window.location.href = buildUrl({ ...filters, [key]: value })
  }

  const hasActiveFilters = selectedCats.length > 0 || filters.personaliseren || filters.sale ||
    (filters.prijs_min != null && filters.prijs_min > 0) ||
    (filters.prijs_max != null && filters.prijs_max < maxProductPrice)

  return (
    <div className="space-y-6">
      {/* Clear all */}
      {hasActiveFilters && (
        <Link
          href={buildUrl({ sorteren: filters.sorteren, zoeken: filters.zoeken })}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Alle filters wissen
        </Link>
      )}

      {/* Categories */}
      <div>
        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Categorie</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleCategory(cat.slug)}
                className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer',
                  selectedCats.includes(cat.slug)
                    ? 'bg-brand-500 border-brand-500'
                    : 'border-neutral-300 group-hover:border-brand-400'
                )}
              >
                {selectedCats.includes(cat.slug) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggleCategory(cat.slug)}
                className={cn(
                  'text-sm transition-colors cursor-pointer',
                  selectedCats.includes(cat.slug) ? 'font-semibold text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-800'
                )}
              >
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-100" />

      {/* Price range */}
      <div>
        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Prijs</h3>
        <PriceSlider
          min={0}
          max={maxProductPrice}
          valueMin={filters.prijs_min ?? 0}
          valueMax={filters.prijs_max ?? maxProductPrice}
          onChange={handlePriceChange}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-100" />

      {/* Toggles */}
      <div>
        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Eigenschappen</h3>
        <div className="space-y-3">
          <Toggle
            label="Personaliseerbaar"
            checked={filters.personaliseren}
            onChange={v => handleToggle('personaliseren', v)}
          />
          <Toggle
            label="Sale"
            checked={filters.sale}
            onChange={v => handleToggle('sale', v)}
          />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export function CollectiesLayout({ products, categories, filters, maxProductPrice }: CollectiesLayoutProps) {
  const [query, setQuery] = useState(filters.zoeken)
  const [scrolled, setScrolled] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = buildUrl({ ...filters, zoeken: query.trim() })
  }

  const activeSort = sortOptions.find(o => o.value === (filters.sorteren || 'nieuwst')) ?? sortOptions[0]

  const selectedCats = filters.categorieen ? filters.categorieen.split(',').filter(Boolean) : []
  const activeFilterCount =
    selectedCats.length +
    (filters.personaliseren ? 1 : 0) +
    (filters.sale ? 1 : 0) +
    ((filters.prijs_min != null && filters.prijs_min > 0) || (filters.prijs_max != null && filters.prijs_max < maxProductPrice) ? 1 : 0)

  return (
    <>
      {/* Sticky top bar */}
      <div className={cn(
        'sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b transition-all duration-300',
        scrolled ? 'border-brand-100 shadow-soft' : 'border-transparent'
      )}>
        <div className="container-brand">
          <div className="flex items-center gap-3 py-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Zoek een product..."
                className="w-full pl-10 pr-8 py-2.5 text-sm font-medium bg-white border border-brand-100 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); window.location.href = buildUrl({ ...filters, zoeken: '' }) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {/* Mobile: filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className={cn(
                'lg:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors',
                activeFilterCount > 0
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white border-brand-100 text-neutral-700 hover:border-brand-300'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white/30 text-white text-xs font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Count */}
            <span className="hidden sm:block text-sm text-neutral-400 flex-shrink-0">
              <span className="font-bold text-neutral-700">{products.length}</span> {products.length === 1 ? 'product' : 'producten'}
            </span>

            {/* Sort dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-100 rounded-xl text-sm font-semibold text-neutral-700 hover:border-brand-300 transition-colors"
              >
                <span className="hidden sm:inline">{activeSort.label}</span>
                <span className="sm:hidden">Sorteren</span>
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
                        href={buildUrl({ ...filters, sorteren: opt.value })}
                        onClick={() => setSortOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors',
                          (filters.sorteren || 'nieuwst') === opt.value
                            ? 'text-brand-600 bg-brand-50'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        )}
                      >
                        {opt.label}
                        {(filters.sorteren || 'nieuwst') === opt.value && (
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
      </div>

      {/* Main content: sidebar + grid */}
      <div className="container-brand py-8">
        <div className="flex gap-8 items-start">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-20">
            <FilterPanel
              categories={categories}
              filters={filters}
              maxProductPrice={maxProductPrice}
            />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <Winkel2Grid products={products} zoeken={filters.zoeken} />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100">
                <h2 className="font-black text-neutral-800">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
              <div className="p-5">
                <FilterPanel
                  categories={categories}
                  filters={filters}
                  maxProductPrice={maxProductPrice}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────

function PremiumProductCard({ product, index }: { product: Product; index: number }) {
  const primaryImage = product.images?.find(img => img.is_primary) ?? product.images?.[0]
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
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

          <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/20 transition-all duration-500" />

          {product.is_sold_out && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
              <span className="text-2xl font-extrabold text-neutral-700/70 tracking-widest uppercase rotate-[-20deg] select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                Uitverkocht
              </span>
            </div>
          )}

          <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-hover">
              <span className="text-xs font-bold text-brand-600">Bekijk product</span>
              <ArrowRight className="h-4 w-4 text-brand-500" />
            </div>
          </div>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {(product.is_sale || hasDiscount) && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-peach-400 text-white shadow-sm">
                {hasDiscount ? `−${discountPercent}%` : 'Sale'}
              </span>
            )}
            {product.is_featured && !(product.is_sale || hasDiscount) && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-brand-600 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5" />
                Favoriet
              </span>
            )}
          </div>

          {product.is_personalizable && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/90 text-white backdrop-blur-sm">
                ✦ Op naam
              </span>
            </div>
          )}
        </div>

        <div className="px-1">
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
          Probeer andere filters of bekijk onze volledige collectie.
        </p>
        <Link
          href="/collecties"
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
