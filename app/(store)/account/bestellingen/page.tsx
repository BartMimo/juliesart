import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrice, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { Package, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Mijn bestellingen' }

export default async function BestellingenPage() {
  const user = await getUser()
  if (!user) redirect('/inloggen')

  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        personalizations:order_item_personalizations(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-neutral-800 text-lg">Mijn bestellingen</h2>

      {(!orders || orders.length === 0) ? (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-12 text-center">
          <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="font-semibold text-neutral-600 mb-2">Nog geen bestellingen</p>
          <p className="text-sm text-neutral-400 mb-6">
            Je hebt nog niets besteld. Bekijk onze collectie!
          </p>
          <Link
            href="/collecties"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-full transition-colors text-sm"
          >
            Naar de winkel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-neutral-100 shadow-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wide">Bestelling</p>
                <p className="font-bold text-neutral-800">{order.order_number}</p>
                <p className="text-sm text-neutral-500">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
                <span className="font-bold text-neutral-800">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Items preview */}
            <div className="space-y-2 mb-4">
              {(order.items ?? []).slice(0, 2).map((item: { id: string; product_name: string; quantity: number; personalizations: Array<{ field_key: string; field_label: string; display_value: string | null; value: string }> }) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-400">{item.quantity}×</span>
                  <span className="font-medium text-neutral-700">{item.product_name}</span>
                  {item.personalizations?.slice(0, 1).map((p: { field_key: string; field_label: string; display_value: string | null; value: string }) => (
                    <span key={p.field_key} className="text-neutral-400">
                      ({p.field_label}: {p.display_value ?? p.value})
                    </span>
                  ))}
                </div>
              ))}
              {(order.items?.length ?? 0) > 2 && (
                <p className="text-sm text-neutral-400">+ {(order.items?.length ?? 0) - 2} meer producten</p>
              )}
            </div>

            <Link
              href={`/account/bestellingen/${order.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              Bekijk details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))
      )}
    </div>
  )
}
