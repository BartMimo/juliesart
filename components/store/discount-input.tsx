'use client'

import { useState } from 'react'
import { Tag, X, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'

export function DiscountInput() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { discountCode, discountType, discountValue, discountAmount, subtotal, applyDiscount, removeDiscount } = useCartStore()
  const cartSubtotal = subtotal || 0
  const toast = useToast()

  // Use store getter (computed)
  const storeSubtotal = useCartStore(
    (s) => s.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  )

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/kortingscode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), subtotal: storeSubtotal }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error ?? 'Kortingscode niet geldig')
        return
      }

      applyDiscount(data.code.code, data.code.type, data.code.value)
      setCode('')
      toast.success(`Kortingscode "${data.code.code}" toegepast!`, `Je bespaart ${formatPrice(data.discountAmount)}.`)
    } catch {
      toast.error('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (discountCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-700">{discountCode}</span>
          <span className="text-green-600">— {formatPrice(discountAmount ?? 0)} korting</span>
        </div>
        <button
          onClick={removeDiscount}
          className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        placeholder="Kortingscode"
        className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm bg-white"
      />
      <button
        onClick={handleApply}
        disabled={!code.trim() || loading}
        className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? 'Controleren…' : 'Toepassen'}
      </button>
    </div>
  )
}
