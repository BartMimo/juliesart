'use client'

import { Product } from '@/types'
import { ProductCard } from './product-card'
import { StaggerReveal, staggerItem } from './section-reveal'
import { motion } from 'framer-motion'

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
}

export function ProductGrid({ products, emptyMessage = 'Geen producten gevonden.' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-neutral-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div key={product.id} variants={staggerItem}>
          <ProductCard product={product} priority={index < 4} />
        </motion.div>
      ))}
    </StaggerReveal>
  )
}
