'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, BarChart2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap = {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  BarChart2,
  Eye,
}

export type StatsCardIcon = keyof typeof iconMap

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: StatsCardIcon
  trend?: { value: number; label: string }
  color?: 'brand' | 'peach' | 'lavender' | 'mint' | 'neutral'
  className?: string
}

const colorMap = {
  brand: {
    bg: 'bg-brand-50',
    icon: 'bg-brand-500 text-white',
    trend_up: 'text-brand-600',
  },
  peach: {
    bg: 'bg-peach-50',
    icon: 'bg-peach-400 text-white',
    trend_up: 'text-peach-500',
  },
  lavender: {
    bg: 'bg-lavender-50',
    icon: 'bg-lavender-400 text-white',
    trend_up: 'text-lavender-500',
  },
  mint: {
    bg: 'bg-mint-50',
    icon: 'bg-mint-300 text-white',
    trend_up: 'text-mint-300',
  },
  neutral: {
    bg: 'bg-neutral-50',
    icon: 'bg-neutral-700 text-white',
    trend_up: 'text-neutral-600',
  },
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'brand',
  className,
}: StatsCardProps) {
  const colors = colorMap[color]
  const Icon = iconMap[icon]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'bg-white rounded-2xl border border-neutral-100 shadow-card p-6',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-500 mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-neutral-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-semibold',
              trend.value >= 0 ? 'text-green-600' : 'text-red-500'
            )}>
              {trend.value >= 0
                ? <TrendingUp className="h-3.5 w-3.5" />
                : <TrendingDown className="h-3.5 w-3.5" />
              }
              <span>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', colors.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )
}
