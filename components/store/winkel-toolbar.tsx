'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'

const sortOptions = [
  { value: 'nieuwst', label: 'Nieuwst' },
  { value: 'prijs-laag', label: 'Prijs: laag → hoog' },
  { value: 'prijs-hoog', label: 'Prijs: hoog → laag' },
  { value: 'naam', label: 'Naam A–Z' },
]

interface WinkelToolbarProps {
  total: number
  currentSort: string
  currentCategorie: string
}

export function WinkelToolbar({ total, currentSort, currentCategorie }: WinkelToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'nieuwst') {
      params.delete('sorteren')
    } else {
      params.set('sorteren', value)
    }
    router.push(`/winkel?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-neutral-500">
        <span className="font-semibold text-neutral-800">{total}</span>{' '}
        {total === 1 ? 'product' : 'producten'}
        {currentCategorie && <span className="text-neutral-400"> in deze categorie</span>}
      </p>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-neutral-400 shrink-0" />
        <select
          value={currentSort || 'nieuwst'}
          onChange={(e) => handleSort(e.target.value)}
          className="text-sm font-semibold text-neutral-700 bg-transparent border-none outline-none cursor-pointer pr-1"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
