import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient, getUser } from '@/lib/supabase/server'
import { formatDate, formatPrice, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { ArrowLeft, Package } from 'lucide-react'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Bestellingdetails' }

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/inloggen')

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
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/account/bestellingen"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-600 transition-colors font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar bestellingen
      </Link>

      {/* Order header */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Bestelling</p>
            <h2 className="text-2xl font-extrabold text-neutral-800">{order.order_number}</h2>
            <p className="text-sm text-neutral-500">Geplaatst op {formatDate(order.created_at)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold border w-fit ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        {/* Timeline */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Besteld', date: order.created_at, done: true },
            { label: 'Betaald', date: order.paid_at, done: !!order.paid_at },
            { label: 'Verzonden', date: order.shipped_at, done: !!order.shipped_at },
            { label: 'Afgeleverd', date: order.delivered_at, done: !!order.delivered_at },
          ].map((step) => (
            <div key={step.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              step.done ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-400'
            }`}>
              <span>{step.done ? '✓' : '○'}</span>
              <span>{step.label}</span>
              {step.date && step.done && (
                <span className="opacity-70">{formatDate(step.date, { day: 'numeric', month: 'short' })}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <h3 className="font-bold text-neutral-800 mb-4">Producten</h3>
        <div className="divide-y divide-neutral-100">
          {(order.items ?? []).map((item: {
            id: string
            product_name: string
            product_image: string | null
            product_slug: string
            quantity: number
            unit_price: number
            total_price: number
            personalizations: Array<{ field_key: string; field_label: string; field_type: string; display_value: string | null; value: string }>
          }) => (
            <div key={item.id} className="py-4 flex gap-4">
              {/* Image */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                {item.product_image ? (
                  <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-6 w-6 text-neutral-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-800 text-sm">{item.quantity}× {item.product_name}</p>
                {/* Personalizations */}
                {(item.personalizations ?? []).map((p) => (
                  <div key={p.field_key} className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500">
                    <span className="font-medium">{p.field_label}:</span>
                    <span className="text-neutral-700">{p.display_value ?? p.value}</span>
                  </div>
                ))}
                <p className="text-xs text-neutral-400 mt-1">{formatPrice(item.unit_price)} per stuk</p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-neutral-800">{formatPrice(item.total_price)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-neutral-100 pt-4 space-y-2 text-sm">
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

      {/* Shipping address */}
      {order.shipping_address_line1 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
          <h3 className="font-bold text-neutral-800 mb-3">Bezorgadres</h3>
          <address className="not-italic text-sm text-neutral-600 leading-relaxed">
            {order.shipping_name}<br />
            {order.shipping_address_line1}<br />
            {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
            {order.shipping_postal_code} {order.shipping_city}<br />
            Nederland
          </address>
        </div>
      )}
    </div>
  )
}
