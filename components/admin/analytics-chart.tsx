'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { formatPrice, formatDateShort } from '@/lib/utils'

interface RevenueChartProps {
  data: { date: string; orders: number; revenue: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a87048" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#a87048" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDateShort(v)}
          tick={{ fontSize: 11, fill: '#a3a3a3' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `€${v}`}
          tick={{ fontSize: 11, fill: '#a3a3a3' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'revenue' ? formatPrice(value) : value,
            name === 'revenue' ? 'Omzet' : 'Bestellingen',
          ]}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e4d0b8',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            fontSize: '13px',
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#a87048"
          strokeWidth={2}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface TopProductsChartProps {
  data: { product_name: string; total_sold: number; revenue: number }[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = data.map((d) => ({
    name: d.product_name.length > 20 ? d.product_name.slice(0, 20) + '…' : d.product_name,
    verkocht: d.total_sold,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} width={130} />
        <Tooltip
          formatter={(v: number) => [v, 'Verkocht']}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e4d0b8', fontSize: '13px' }}
        />
        <Bar dataKey="verkocht" fill="#a87048" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
