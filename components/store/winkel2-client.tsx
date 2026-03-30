'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface Winkel2HeroProps {
  title: string
  zoeken: string
  total: number
  sorteren: string
}

export function Winkel2Hero({ title, zoeken, total, sorteren }: Winkel2HeroProps) {
  const [query, setQuery] = useState(zoeken)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('zoeken', query.trim())
    window.location.href = `/winkel2?${params.toString()}`
  }

  const handleClear = () => {
    setQuery('')
    window.location.href = '/winkel2'
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-[#fdf8f4] to-peach-50">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-peach-100/50 blur-3xl pointer-events-none" />

      <div className="container-brand relative py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-500 mb-3">
            <span className="w-5 h-px bg-brand-400" />
            Gepersonaliseerde kindercadeaus
          </p>

          {/* Title */}
          <h1 className="heading-display text-4xl sm:text-5xl text-neutral-800 mb-6 leading-[1.1]">
            {zoeken ? (
              <>Resultaten voor <span className="text-gradient-brand">&ldquo;{zoeken}&rdquo;</span></>
            ) : (
              <>Onze <span className="text-gradient-brand">collectie</span></>
            )}
          </h1>

          {/* Search */}
          <form onSubmit={handleSubmit} className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek een product..."
              className="w-full pl-12 pr-14 py-4 text-sm font-medium bg-white border-2 border-white rounded-2xl shadow-hover focus:outline-none focus:border-brand-300 transition-all placeholder:text-neutral-400"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-3 py-2 text-xs font-bold transition-colors"
            >
              Zoek
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
