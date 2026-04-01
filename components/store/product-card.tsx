'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0]
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const hasPersonalization = (product.personalization_fields?.length ?? 0) > 0

  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link href={`/product/${product.slug}`} className="group block bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm hover:shadow-hover hover:border-brand-100 transition-all duration-300">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-brand-50 to-peach-50">
          {/* Sold out overlay */}
          {product.is_sold_out && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
              <span
                className="text-2xl font-extrabold text-neutral-700/70 tracking-widest uppercase rotate-[-20deg] select-none"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
              >
                Uitverkocht
              </span>
            </div>
          )}
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-104"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-40">🎀</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-peach-400 text-white shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.is_featured && !hasDiscount && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-brand-600 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5" />
                Favoriet
              </span>
            )}
          </div>

          {/* Personalization badge */}
          {hasPersonalization && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-semibold text-white">✦ Personaliseerbaar</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-neutral-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-neutral-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
