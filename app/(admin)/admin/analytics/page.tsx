import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/stats-card'
import { RevenueChart, TopProductsChart } from '@/components/admin/analytics-chart'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Analytics' }

function parseReferrer(referrer: string | null): string {
  if (!referrer) return 'Direct / Bookmark'
  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, '')
    const known: Record<string, string> = {
      'google.com': 'Google',
      'google.nl': 'Google',
      'google.be': 'Google',
      'instagram.com': 'Instagram',
      'l.instagram.com': 'Instagram',
      'facebook.com': 'Facebook',
      'm.facebook.com': 'Facebook',
      'l.facebook.com': 'Facebook',
      'pinterest.com': 'Pinterest',
      'nl.pinterest.com': 'Pinterest',
      'twitter.com': 'Twitter / X',
      'x.com': 'Twitter / X',
      't.co': 'Twitter / X',
      'etsy.com': 'Etsy',
      'bing.com': 'Bing',
      'duckduckgo.com': 'DuckDuckGo',
    }
    return known[hostname] ?? hostname
  } catch {
    return 'Onbekend'
  }
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalPageViews },
    { count: totalOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: revenueData },
    { data: pageViewsData },
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
    // Page views with referrer and location
    supabase.from('page_views')
      .select('path, referrer, city, country')
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

  // All pages sorted by views
  const pathCounts = (pageViewsData ?? []).reduce((acc: Record<string, number>, pv: { path: string }) => {
    acc[pv.path] = (acc[pv.path] ?? 0) + 1
    return acc
  }, {})
  const allPaths = Object.entries(pathCounts).sort(([, a], [, b]) => b - a)

  // Locations (city + country)
  const locationCounts = (pageViewsData ?? []).reduce((acc: Record<string, number>, pv: { city: string | null; country: string | null }) => {
    if (!pv.city) return acc
    const label = pv.country ? `${pv.city}, ${pv.country}` : pv.city
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})
  const topLocations = Object.entries(locationCounts).sort(([, a], [, b]) => b - a)

  // Traffic sources
  const sourceCounts = (pageViewsData ?? []).reduce((acc: Record<string, number>, pv: { referrer: string | null }) => {
    const source = parseReferrer(pv.referrer)
    acc[source] = (acc[source] ?? 0) + 1
    return acc
  }, {})
  const trafficSources = Object.entries(sourceCounts).sort(([, a], [, b]) => b - a)

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

        {/* Locations */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
          <h2 className="font-bold text-neutral-800 text-lg mb-6">Locaties</h2>
          {topLocations.length > 0 ? (
            <div className="space-y-3">
              {topLocations.slice(0, 10).map(([location, views], index) => (
                <div key={location} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-400 w-5">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700 truncate">{location}</p>
                    <div className="mt-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mint-400 rounded-full"
                        style={{ width: `${(views / topLocations[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-neutral-600 shrink-0">{views}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-neutral-400 text-sm">
              Nog geen locatiedata — beschikbaar na eerste bezoek via Vercel
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic sources */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
          <h2 className="font-bold text-neutral-800 text-lg mb-6">Verkeersbronnen</h2>
          {trafficSources.length > 0 ? (
            <div className="space-y-3">
              {trafficSources.map(([source, views], index) => (
                <div key={source} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-400 w-5">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700 truncate">{source}</p>
                    <div className="mt-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-peach-400 rounded-full"
                        style={{ width: `${(views / trafficSources[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-neutral-600 shrink-0">{views}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-neutral-400 text-sm">
              Nog geen verkeersdata
            </div>
          )}
        </div>
      </div>

      {/* All pages */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <h2 className="font-bold text-neutral-800 text-lg mb-1">Alle pagina's</h2>
        <p className="text-neutral-400 text-sm mb-6">{allPaths.length} pagina{allPaths.length !== 1 ? "'s" : ''} bezocht in de afgelopen 30 dagen</p>
        {allPaths.length > 0 ? (
          <div className="divide-y divide-neutral-50">
            {allPaths.map(([path, views], index) => (
              <div key={path} className="flex items-center gap-3 py-2.5">
                <span className="text-xs font-bold text-neutral-300 w-6 shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700 truncate">{path || '/'}</p>
                  <div className="mt-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-400 rounded-full"
                      style={{ width: `${(views / allPaths[0][1]) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-neutral-600 shrink-0 tabular-nums">{views}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex items-center justify-center text-neutral-400 text-sm">
            Nog geen paginaweergave data
          </div>
        )}
      </div>
    </div>
  )
}
