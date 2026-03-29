'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, Package, ExternalLink } from 'lucide-react'
import { formatPrice, formatDateShort } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'

type Personalization = {
  field_label: string
  display_value: string | null
  value: string
}

type TodoOrderItem = {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  personalizations: Personalization[]
}

type TodoOrder = {
  id: string
  order_number: string
  email: string
  customer_name: string | null
  status: string
  total: number
  created_at: string
  shipping_name: string | null
  shipping_city: string | null
  items: TodoOrderItem[]
}

export function TodoOrderList({ orders: initialOrders }: { orders: TodoOrder[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [marking, setMarking] = useState<Set<string>>(new Set())
  const toast = useToast()

  const handleMarkShipped = async (orderId: string, orderNumber: string) => {
    setMarking((prev) => new Set(prev).add(orderId))

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped' }),
      })

      if (!res.ok) throw new Error()

      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      toast.success(`Bestelling ${orderNumber} gemarkeerd als verzonden`)
    } catch {
      toast.error('Er ging iets mis. Probeer het opnieuw.')
      setMarking((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h2 className="font-bold text-neutral-800 text-lg mb-1">Alles verzonden!</h2>
        <p className="text-neutral-400 text-sm">Er zijn geen openstaande bestellingen meer.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isMarking = marking.has(order.id)
        return (
          <div
            key={order.id}
            className={`bg-white rounded-2xl border shadow-card p-5 flex gap-4 items-start transition-opacity ${isMarking ? 'opacity-50' : 'border-neutral-100'}`}
          >
            {/* Checkbox knop */}
            <button
              onClick={() => handleMarkShipped(order.id, order.order_number)}
              disabled={isMarking}
              title="Markeer als verzonden"
              className="mt-0.5 shrink-0 text-neutral-300 hover:text-green-500 transition-colors disabled:cursor-not-allowed"
            >
              {isMarking
                ? <CheckCircle2 className="h-7 w-7 text-green-500 animate-pulse" />
                : <Circle className="h-7 w-7" />
              }
            </button>

            {/* Bestelinfo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Link
                    href={`/admin/bestellingen/${order.id}`}
                    className="font-bold text-neutral-800 hover:text-brand-600 transition-colors inline-flex items-center gap-1.5"
                  >
                    {order.order_number}
                    <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                  </Link>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {order.customer_name ?? order.email}
                    {order.shipping_city ? ` · ${order.shipping_city}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-neutral-800">{formatPrice(order.total)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{formatDateShort(order.created_at)}</p>
                </div>
              </div>

              {/* Producten */}
              <div className="space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-sm">
                    <Package className="h-4 w-4 text-neutral-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-neutral-700 font-medium">
                        {item.quantity}× {item.product_name}
                      </span>
                      {item.personalizations.length > 0 && (
                        <div className="flex flex-wrap gap-x-3 mt-0.5">
                          {item.personalizations.map((p, i) => (
                            <span key={i} className="text-xs text-neutral-400">
                              {p.field_label}: <span className="text-neutral-600">{p.display_value ?? p.value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
