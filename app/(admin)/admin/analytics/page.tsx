import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/stats-card'
import { RevenueChart, TopProductsChart } from '@/components/admin/analytics-chart'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Analytics' }

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalPageViews },
    { count: totalOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: revenueData },
    { data: topPathsData },
    { data: topProductsData },
  ] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('orders').select('*', { count: 'exact', head: true }).neq('status', 'pending').neq('status', 'cancelled'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    // Revenue by day (last 30 days)
    supabase.from('orders')
      .select('created_at, total')
      .neq('status', 'pending')
      .neq('status', 'cancelled')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at'),
    // Top pages
    supabase.from('page_views')
      .select('path')
      .gte('created_at', thirtyDaysAgo),
    // Top products by order items
    supabase.from('order_items')
      .select('product_name, quantity, total_price'),
  ])

  const totalRevenue = (revenueData ?? []).reduce((s: number, o: { total: number }) => s + o.total, 0)

  // Aggregate revenue by day
  const revenueByDay = (revenueData ?? []).reduce((acc: Record<string, { orders: number; revenue: number }>, o: { created_at: string; total: number }) => {
    const date = o.created_at.split('T')[0]
    if (!acc[date]) acc[date] = { orders: 0, revenue: 0 }
    acc[date].orders += 1
    acc[date].revenue += o.total
    return acc
  }, {})

  const chartData = Object.entries(revenueByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, ...d }))

  // Top paths
  const pathCounts = (topPathsData ?? []).reduce((acc: Record<string, number>, pv: { path: string }) => {
    acc[pv.path] = (acc[pv.path] ?? 0) + 1
    return acc
  }, {})
  const topPaths = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  // Top products
  const productStats = (topProductsData ?? []).reduce((acc: Record<string, { total_sold: number; revenue: number }>, item: { product_name: string; quantity: number; total_price: number }) => {
    if (!acc[item.product_name]) acc[item.product_name] = { total_sold: 0, revenue: 0 }
    acc[item.product_name].total_sold += item.quantity
    acc[item.product_name].revenue += item.total_price
    return acc
  }, {})

  const topProducts = Object.entries(productStats)
    .sort(([, a], [, b]) => b.total_sold - a.total_sold)
    .slice(0, 5)
    .map(([product_name, data]) => ({ product_name, ...data }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Analytics</h1>
        <p className="text-neutral-500 text-sm mt-1">Overzicht van de afgelopen 30 dagen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Paginaweergaven" value={totalPageViews ?? 0} subtitle="30 dagen" icon="Eye" color="brand" />
        <StatsCard title="Bestellingen" value={totalOrders ?? 0} icon="ShoppingCart" color="peach" />
        <StatsCard title="Omzet" value={formatPrice(totalRevenue)} subtitle="30 dagen" icon="TrendingUp" color="mint" />
        <StatsCard title="Klanten" value={totalCustomers ?? 0} icon="Users" color="lavender" />
        <StatsCard title="Actieve producten" value={totalProducts ?? 0} icon="Package" color="neutral" />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <h2 className="font-bold text-neutral-800 text-lg mb-6">Omzet per dag — afgelopen 30 dagen</h2>
        {chartData.length > 0 ? (
          <RevenueChart data={chartData} />
        ) : (
          <div className="h-[280px] flex items-center justify-center text-neutral-400 text-sm">
            Nog geen omzetdata
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products chart */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
          <h2 className="font-bold text-neutral-800 text-lg mb-6">Meest verkochte producten</h2>
          {topProducts.length > 0 ? (
            <TopProductsChart data={topProducts} />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-neutral-400 text-sm">
              Nog geen verkoopdata
            </div>
          )}
        </div>

        {/* Top pages */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
          <h2 className="font-bold text-neutral-800 text-lg mb-6">Meest bezochte pagina's</h2>
          {topPaths.length > 0 ? (
            <div className="space-y-3">
              {topPaths.map(([path, views], index) => (
                <div key={path} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-400 w-5">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700 truncate">{path || '/'}</p>
                    <div className="mt-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full"
                        style={{ width: `${(views / topPaths[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-neutral-600 shrink-0">{views}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-neutral-400 text-sm">
              Nog geen paginaweergave data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
