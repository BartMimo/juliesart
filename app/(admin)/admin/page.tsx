import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/stats-card'
import { RevenueChart } from '@/components/admin/analytics-chart'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { formatPrice, formatDateShort, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch overview stats
  const [
    { count: totalOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: recentOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).neq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders')
      .select('*, items:order_items(count)')
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    // Revenue by day (last 14 days)
    supabase.from('orders')
      .select('created_at, total, status')
      .neq('status', 'pending')
      .neq('status', 'cancelled')
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // Calculate total revenue
  const totalRevenue = (revenueData ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)

  // Aggregate revenue by day for chart
  const revenueByDay = (revenueData ?? []).reduce((acc: Record<string, { orders: number; revenue: number }>, order: { created_at: string; total: number }) => {
    const date = order.created_at.split('T')[0]
    if (!acc[date]) acc[date] = { orders: 0, revenue: 0 }
    acc[date].orders += 1
    acc[date].revenue += order.total
    return acc
  }, {})

  const chartData = Object.entries(revenueByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }))

  // Low stock alert
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, stock_quantity')
    .eq('is_active', true)
    .eq('track_inventory', true)
    .lt('stock_quantity', 5)
    .limit(3)

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Welkom terug! Hier is een overzicht van vandaag.</p>
      </div>

      {/* Alerts */}
      {(lowStockProducts?.length ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-700">Lage voorraad waarschuwing</p>
            <p className="text-sm text-amber-600 mt-0.5">
              {lowStockProducts?.map((p) => `${p.name} (${p.stock_quantity} resterend)`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totale omzet"
          value={formatPrice(totalRevenue)}
          subtitle="Afgelopen 14 dagen"
          icon="TrendingUp"
          color="brand"
        />
        <StatsCard
          title="Bestellingen"
          value={totalOrders ?? 0}
          subtitle="Totaal"
          icon="ShoppingCart"
          color="peach"
        />
        <StatsCard
          title="Klanten"
          value={totalCustomers ?? 0}
          subtitle="Geregistreerd"
          icon="Users"
          color="lavender"
        />
        <StatsCard
          title="Actieve producten"
          value={totalProducts ?? 0}
          icon="Package"
          color="mint"
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-neutral-800 text-lg">Omzet — afgelopen 14 dagen</h2>
        </div>
        {chartData.length > 0 ? (
          <RevenueChart data={chartData} />
        ) : (
          <div className="h-[280px] flex items-center justify-center text-neutral-400 text-sm">
            Nog geen omzetdata beschikbaar
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-800 text-lg">Recente bestellingen</h2>
          <Link
            href="/admin/bestellingen"
            className="text-sm text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            Alle bestellingen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-neutral-100">
          {(recentOrders ?? []).length === 0 ? (
            <div className="p-10 text-center text-neutral-400 text-sm">
              Nog geen bestellingen ontvangen.
            </div>
          ) : (
            (recentOrders ?? []).map((order: {
              id: string
              order_number: string
              email: string
              customer_name: string | null
              status: string
              total: number
              created_at: string
            }) => (
              <Link
                key={order.id}
                href={`/admin/bestellingen/${order.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-800 text-sm">{order.order_number}</p>
                  <p className="text-xs text-neutral-400 truncate">
                    {order.customer_name ?? order.email}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-neutral-800 text-sm">{formatPrice(order.total)}</p>
                  <p className="text-xs text-neutral-400">{formatDateShort(order.created_at)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
