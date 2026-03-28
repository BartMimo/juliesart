'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { CartItem } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/cart/store'

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { removeItem, updateQuantity } = useCartStore()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4"
    >
      {/* Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
        {item.productImage ? (
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎀</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${item.productSlug}`}
          className="font-semibold text-sm text-neutral-800 hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
        >
          {item.productName}
        </Link>

        {/* Personalizations */}
        {item.personalizations.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {item.personalizations.map((p) => (
              <div key={p.fieldKey} className="flex items-center gap-1.5 text-xs text-neutral-500">
                {p.fieldType === 'color' && p.value && (
                  <span
                    className="w-3 h-3 rounded-full border border-neutral-200 inline-block shrink-0"
                    style={{ backgroundColor: p.displayValue.startsWith('#') ? p.displayValue : undefined }}
                  />
                )}
                <span className="truncate">
                  {p.fieldLabel}: <span className="text-neutral-700 font-medium">{p.displayValue || p.value}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Price + quantity */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= 10}
              className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price + remove */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-neutral-800">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-full hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
              aria-label="Verwijderen"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
