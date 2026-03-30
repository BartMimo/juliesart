'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Mail, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatPrice, formatDate } from '@/lib/utils'
import { Order } from '@/types'

export default function BetalingSucesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-neutral-500">Je bestelling wordt bevestigd…</p>
        </div>
      </div>
    }>
      <BetalingSucesContent />
    </Suspense>
  )
}

function BetalingSucesContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { clearCart } = useCartStore()

  useEffect(() => {
    async function fetchOrder() {
      if (!sessionId) {
        setLoading(false)
        return
      }

      // Retry up to 8 times with 1.5s delay to wait for webhook
      for (let attempt = 0; attempt < 8; attempt++) {
        try {
          const res = await fetch(`/api/stripe/checkout?session_id=${sessionId}`)
          if (res.ok) {
            const data = await res.json()
            if (data.order) {
              setOrder(data.order)
              clearCart()
              setLoading(false)
              return
            }
          }
        } catch {
          // ignore, keep retrying
        }
        await new Promise((r) => setTimeout(r, 1500))
      }

      // Give up after retries — still show success without order details
      clearCart()
      setLoading(false)
    }

    fetchOrder()
  }, [sessionId, clearCart])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-neutral-500">Je bestelling wordt bevestigd…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 min-h-[70vh]">
      <div className="container-brand max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-800 mb-3">
            Bedankt voor je bestelling!
          </h1>
          <p className="text-neutral-500 text-lg mb-8">
            Je betaling is ontvangen en je bestelling is bevestigd.
            Je ontvangt een bevestigingsmail op het opgegeven e-mailadres.
          </p>

          {/* Order summary card */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 mb-8 text-left"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Bestelnummer</p>
                  <p className="font-bold text-neutral-800 text-lg">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Datum</p>
                  <p className="font-semibold text-neutral-700">{formatDate(order.created_at)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {(order.items ?? []).map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-semibold text-neutral-800">
                        {item.quantity}× {item.product_name}
                      </p>
                      {(item.personalizations ?? []).map((p) => (
                        <p key={p.field_key} className="text-xs text-neutral-400 mt-0.5">
                          {p.field_label}: {p.display_value ?? p.value}
                        </p>
                      ))}
                    </div>
                    <span className="font-semibold text-neutral-700 shrink-0 ml-4">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-100 pt-4 flex justify-between font-bold text-neutral-800">
                <span>Totaal betaald</span>
                <span className="text-brand-500">{formatPrice(order.total)}</span>
              </div>
            </motion.div>
          )}

          {/* What's next */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Mail, title: 'Bevestigingsmail', desc: 'Je ontvangt een e-mail met alle details van je bestelling.' },
              { icon: Package, title: 'Personaliseren', desc: 'We gaan direct aan de slag met het personaliseren van je producten.' },
              { icon: ArrowRight, title: 'Verzending', desc: 'Je pakketje is er over 3–5 werkdagen — net op tijd!' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-brand-50 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <p className="font-bold text-neutral-800 text-sm mb-1">{title}</p>
                <p className="text-xs text-neutral-500">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {order && (
              <Button asChild size="lg">
                <Link href={`/account/bestellingen/${order.id}`}>
                  Bekijk je bestelling
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link href="/winkel">
                Verder winkelen
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
