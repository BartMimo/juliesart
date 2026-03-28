'use client'

import { Heart, Truck, Shield, RefreshCw } from 'lucide-react'
import { TRUST_BADGES } from '@/lib/constants'
import { SectionReveal, StaggerReveal, staggerItem } from './section-reveal'
import { motion } from 'framer-motion'

const iconMap: Record<string, React.ElementType> = {
  heart: Heart,
  truck: Truck,
  shield: Shield,
  refresh: RefreshCw,
}

export function TrustBadges({ variant = 'section' }: { variant?: 'section' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-4">
        {TRUST_BADGES.map((badge) => {
          const Icon = iconMap[badge.icon]
          return (
            <div key={badge.icon} className="flex items-center gap-2 text-sm text-neutral-600">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-brand-600" />
              </div>
              <span className="font-semibold">{badge.title}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-r from-brand-50 via-cream to-peach-50">
      <div className="container-brand">
        <StaggerReveal className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_BADGES.map((badge) => {
            const Icon = iconMap[badge.icon]
            return (
              <motion.div
                key={badge.icon}
                variants={staggerItem}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center">
                  <Icon className="h-6 w-6 text-brand-500" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-800 text-sm">{badge.title}</h4>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{badge.description}</p>
                </div>
              </motion.div>
            )
          })}
        </StaggerReveal>
      </div>
    </section>
  )
}
