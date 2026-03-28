'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, ArrowRight, Truck } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CartItemRow } from './cart-item'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATE } from '@/lib/constants'

interface CartSidebarProps {
  open: boolean
  onClose: () => void
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, discountCode, discountAmount } = useCartStore()
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE
  const total = Math.max(0, subtotal - discountAmount + shipping)
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-500" />
                <h2 className="font-bold text-neutral-800 text-lg">
                  Winkelwagen
                  {items.length > 0 && (
                    <span className="ml-2 text-sm font-semibold text-neutral-400">
                      ({items.reduce((s, i) => s + i.quantity, 0)})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            {/* Free shipping progress */}
            {freeShippingRemaining > 0 && items.length > 0 && (
              <div className="px-6 py-3 bg-brand-50 border-b border-brand-100">
                <div className="flex items-center gap-2 text-sm text-brand-700 mb-2">
                  <Truck className="h-4 w-4" />
                  <span>
                    Nog <strong>{formatPrice(freeShippingRemaining)}</strong> tot gratis verzending!
                  </span>
                </div>
                <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
            {shipping === 0 && items.length > 0 && (
              <div className="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2 text-sm text-green-700 font-semibold">
                <Truck className="h-4 w-4" />
                Gratis verzending! 🎉
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center py-16"
                  >
                    <div className="text-6xl mb-4">🛍️</div>
                    <p className="font-semibold text-neutral-700 text-lg mb-2">
                      Je winkelwagen is leeg
                    </p>
                    <p className="text-neutral-400 text-sm mb-6">
                      Voeg een product toe om te beginnen.
                    </p>
                    <Button onClick={onClose} variant="outline" size="sm">
                      Verder winkelen
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItemRow key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-neutral-100 px-6 py-5 space-y-4 bg-neutral-50/50">
                {/* Subtotal */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotaal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Korting ({discountCode})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Verzending</span>
                    <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-800 text-base pt-2 border-t border-neutral-200">
                    <span>Totaal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-neutral-400 text-right">Incl. BTW</p>
                </div>

                {/* CTA buttons */}
                <div className="space-y-2">
                  <Button
                    asChild
                    size="lg"
                    className="w-full"
                    onClick={onClose}
                  >
                    <Link href="/winkelwagen">
                      Naar winkelwagen
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2 transition-colors"
                  >
                    Verder winkelen
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
