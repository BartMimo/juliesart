import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { formatDate, formatPrice, getOrderStatusLabel } from '@/lib/utils'
import { ArrowLeft, Package, Pen } from 'lucide-react'
import { EngravingPosition } from '@/types'

export const metadata: Metadata = { title: 'Bestellingdetails' }

interface Props { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        personalizations:order_item_personalizations(*)
      )
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/bestellingen" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-neutral-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-neutral-800">{order.order_number}</h1>
          <p className="text-neutral-400 text-sm">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-800">Producten</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {(order.items ?? []).map((item: {
                id: string
                product_name: string
                product_image: string | null
                product_slug: string
                quantity: number
                unit_price: number
                total_price: number
                personalizations: Array<{ field_key: string; field_label: string; field_type: string; value: string; display_value: string | null }>
              }) => (
                <div key={item.id} className="px-6 py-5 flex gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                    {item.product_image ? (
                      <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-5 w-5 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-800 text-sm">{item.quantity}× {item.product_name}</p>
                    {/* Personalization values — the key admin feature */}
                    {(item.personalizations ?? []).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.personalizations.map((p) => (
                          <div key={p.field_key} className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-neutral-500">{p.field_label}:</span>
                            {p.field_type === 'color' && (
                              <span className="text-xs text-neutral-400">
                                <span className="font-medium text-neutral-700">{p.display_value ?? p.value}</span>
                              </span>
                            )}
                            <span className="text-neutral-700 font-medium">{p.display_value ?? p.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 mt-1">{formatPrice(item.unit_price)} per stuk</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-neutral-800">{formatPrice(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="border-t border-neutral-100 px-6 py-4 space-y-2 text-sm bg-neutral-50/50 rounded-b-2xl">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotaal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Korting {order.discount_code && `(${order.discount_code})`}</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Verzending</span>
                <span>{order.shipping_amount === 0 ? 'Gratis' : formatPrice(order.shipping_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-800 text-base border-t border-neutral-200 pt-3">
                <span>Totaal</span>
                <span className="text-brand-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order sidebar */}
        <div className="space-y-4">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-5">
            <h3 className="font-bold text-neutral-800 mb-3">Klantgegevens</h3>
            <div className="space-y-2 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-800">{order.customer_name ?? '—'}</p>
              <p>{order.email}</p>
              {order.phone && <p>{order.phone}</p>}
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_address_line1 && (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-5">
              <h3 className="font-bold text-neutral-800 mb-3">Bezorgadres</h3>
              <address className="not-italic text-sm text-neutral-600 leading-relaxed">
                {order.shipping_name}<br />
                {order.shipping_address_line1}<br />
                {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
                {order.shipping_postal_code} {order.shipping_city}
              </address>
            </div>
          )}

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-5">
            <h3 className="font-bold text-neutral-800 mb-3">Betaling</h3>
            <div className="space-y-2 text-sm">
              {order.stripe_payment_intent_id && (
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Stripe ID</p>
                  <p className="text-neutral-600 text-xs font-mono break-all mt-0.5">{order.stripe_payment_intent_id}</p>
                </div>
              )}
              {order.paid_at && (
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Betaald op</p>
                  <p className="text-neutral-700 mt-0.5">{formatDate(order.paid_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer notes */}
          {order.customer_notes && (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-5">
              <h3 className="font-bold text-neutral-800 mb-2">Opmerking klant</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{order.customer_notes}</p>
            </div>
          )}

          {/* Gravure configurator details */}
          {order.order_type === 'configurator' && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-4">
              <h3 className="font-bold text-amber-800 flex items-center gap-2">
                <Pen className="h-4 w-4" />
                Gravure-informatie
              </h3>

              {order.upload_url && (
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">Geüpload ontwerp</p>
                  <a href={order.upload_url} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={order.upload_url}
                      alt="Klant ontwerp"
                      width={300}
                      height={200}
                      className="rounded-xl border border-amber-200 object-contain bg-white max-h-40 w-full"
                    />
                    <p className="text-xs text-amber-600 mt-1 hover:underline">Origineel openen ↗</p>
                  </a>
                </div>
              )}

              {order.engraving_position && (
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">Graveerlocatie</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(['x', 'y', 'width', 'height'] as const).map((field) => {
                      const pos = order.engraving_position as EngravingPosition
                      return (
                        <div key={field} className="bg-white rounded-xl px-3 py-2 border border-amber-100">
                          <p className="text-xs text-amber-500 font-semibold">
                            {field === 'x' ? 'Links' : field === 'y' ? 'Boven' : field === 'width' ? 'Breedte' : 'Hoogte'}
                          </p>
                          <p className="text-neutral-800 font-bold">{Math.round(pos[field])}%</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
