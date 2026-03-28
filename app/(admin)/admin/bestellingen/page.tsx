import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDateShort, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Bestellingen' }

export default async function AdminBestellingenPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_number, email, customer_name, status, total, created_at,
      items:order_items(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const statusCounts = (orders ?? []).reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Bestellingen</h1>
        <p className="text-neutral-500 text-sm mt-1">{orders?.length ?? 0} bestellingen</p>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getOrderStatusColor(status)}`}>
            {getOrderStatusLabel(status)}: {count}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Bestelling</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden md:table-cell">Klant</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Bedrag</th>
              <th className="text-right px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden sm:table-cell">Datum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-4">
                  <Link href={`/admin/bestellingen/${order.id}`} className="hover:text-brand-600 transition-colors">
                    <p className="font-semibold text-neutral-800">{order.order_number}</p>
                    <p className="text-xs text-neutral-400">
                      {Array.isArray(order.items) ? order.items.length : 0} product(en)
                    </p>
                  </Link>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <p className="text-neutral-700">{order.customer_name ?? '—'}</p>
                  <p className="text-xs text-neutral-400 truncate max-w-[200px]">{order.email}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-neutral-800">{formatPrice(order.total)}</span>
                </td>
                <td className="px-5 py-4 text-right text-neutral-400 hidden sm:table-cell">
                  {formatDateShort(order.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(orders?.length ?? 0) === 0 && (
          <div className="p-12 text-center text-neutral-400 text-sm">
            Nog geen bestellingen ontvangen.
          </div>
        )}
      </div>
    </div>
  )
}
