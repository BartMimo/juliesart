'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, Tag, Shield } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import { CartItemRow } from '@/components/store/cart-item'
import { DiscountInput } from '@/components/store/discount-input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATE } from '@/lib/constants'
import { useToast } from '@/components/ui/toaster'

export default function WinkelwagenPage() {
  const { items, discountCode, discountType, discountValue, discountAmount } = useCartStore()
  const [checkingOut, setCheckingOut] = useState(false)
  const toast = useToast()

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE
  const total = Math.max(0, subtotal - discountAmount + shipping)

  const handleCheckout = async () => {
    if (items.length === 0) return
    setCheckingOut(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          discountCode: discountCode ?? undefined,
          successUrl: `${window.location.origin}/afrekenen/succes?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/winkelwagen`,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error ?? 'Er ging iets mis bij het starten van de betaling.')
        setCheckingOut(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      toast.error('Er ging iets mis. Probeer het opnieuw.')
      setCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container-brand max-w-lg mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-brand-500" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-3">
            Je winkelwagen is leeg
          </h1>
          <p className="text-neutral-500 mb-8">
            Voeg een product toe en kom terug — we hebben mooie dingen voor je!
          </p>
          <Button asChild size="lg">
            <Link href="/collecties">
              <ShoppingBag className="h-5 w-5" />
              Ga winkelen
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container-brand">
        <h1 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-10">
          Jouw winkelwagen
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="bg-white rounded-2xl border border-neutral-100 shadow-card p-5"
              >
                <CartItemRow item={item} />
              </motion.div>
            ))}

            {/* Continue shopping */}
            <Link
              href="/collecties"
              className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold mt-2 transition-colors"
            >
              ← Verder winkelen
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 space-y-5 lg:sticky lg:top-24">
              <h2 className="font-bold text-neutral-800 text-lg">Besteloverzicht</h2>

              {/* Discount code */}
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600 mb-2">
                  <Tag className="h-4 w-4" />
                  Kortingscode
                </div>
                <DiscountInput />
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 text-sm border-t border-neutral-100 pt-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotaal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Korting {discountCode && `(${discountCode})`}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Verzending</span>
                  <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                </div>
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-brand-600 bg-brand-50 rounded-lg px-3 py-2">
                    Nog <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> tot gratis verzending!
                  </p>
                )}
                <div className="flex justify-between font-bold text-neutral-800 text-base border-t border-neutral-200 pt-3">
                  <span>Totaal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-neutral-400 text-right">Incl. 21% BTW</p>
              </div>

              {/* Checkout button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                loading={checkingOut}
              >
                {checkingOut ? 'Doorsturen naar betaling…' : (
                  <>
                    Veilig afrekenen
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Payment icons */}
              <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-neutral-400 text-center">
                <Shield className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span>Veilig betalen via</span>
                <span className="font-semibold text-neutral-500">iDEAL · Mastercard · Visa · Bancontact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
