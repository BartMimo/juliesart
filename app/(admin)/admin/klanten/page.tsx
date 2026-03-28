import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Mail, User, CheckCircle, XCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Klanten' }

export default async function AdminKlantenPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  // Count orders per customer
  const { data: orderCounts } = await supabase
    .from('orders')
    .select('user_id, count:id')
    .neq('status', 'pending')

  const orderCountMap = (orderCounts ?? []).reduce((acc: Record<string, number>, o: { user_id: string; count: string }) => {
    if (o.user_id) acc[o.user_id] = (acc[o.user_id] ?? 0) + 1
    return acc
  }, {})

  const marketingCount = (customers ?? []).filter((c) => c.marketing_consent).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Klanten</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {customers?.length ?? 0} klanten — {marketingCount} ingeschreven voor marketing
          </p>
        </div>
        {/* Export hint */}
        <p className="text-xs text-neutral-400">
          Export via Supabase Dashboard → Tabel: profiles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-4 text-center">
          <p className="text-2xl font-extrabold text-neutral-800">{customers?.length ?? 0}</p>
          <p className="text-xs text-neutral-400 mt-1">Totale klanten</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-4 text-center">
          <p className="text-2xl font-extrabold text-brand-500">{marketingCount}</p>
          <p className="text-xs text-neutral-400 mt-1">Marketing consent</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-4 text-center">
          <p className="text-2xl font-extrabold text-peach-400">
            {Object.keys(orderCountMap).length}
          </p>
          <p className="text-xs text-neutral-400 mt-1">Hebben besteld</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-4 text-center">
          <p className="text-2xl font-extrabold text-lavender-400">
            {(customers?.length ?? 0) - Object.keys(orderCountMap).length}
          </p>
          <p className="text-xs text-neutral-400 mt-1">Nog niet besteld</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Klant</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden md:table-cell">E-mail</th>
              <th className="text-center px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Marketing</th>
              <th className="text-center px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden sm:table-cell">Bestellingen</th>
              <th className="text-right px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Lid sinds</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(customers ?? []).map((customer) => (
              <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm shrink-0">
                      {(customer.full_name ?? customer.email ?? 'K').charAt(0).toUpperCase()}
                    </div>
                    <p className="font-semibold text-neutral-800 truncate">
                      {customer.full_name ?? '—'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <a href={`mailto:${customer.email}`} className="text-neutral-600 hover:text-brand-600 truncate block max-w-[200px]">
                    {customer.email}
                  </a>
                </td>
                <td className="px-4 py-4 text-center">
                  {customer.marketing_consent ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-4 w-4 text-neutral-300 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-4 text-center text-neutral-600 font-semibold hidden sm:table-cell">
                  {orderCountMap[customer.id] ?? 0}
                </td>
                <td className="px-5 py-4 text-right text-neutral-400 text-xs">
                  {formatDate(customer.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(customers?.length ?? 0) === 0 && (
          <div className="p-12 text-center text-neutral-400 text-sm">
            Nog geen klanten geregistreerd.
          </div>
        )}
      </div>
    </div>
  )
}
