'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { ProductCard } from './product-card'
import { SectionReveal, StaggerReveal, staggerItem } from './section-reveal'

type FeaturedProduct = {
  id: string
  [key: string]: any
}

type FeaturedProductsClientProps = {
  products: FeaturedProduct[]
}

export function FeaturedProductsClient({
  products,
}: FeaturedProductsClientProps) {
  return (
    <section className="bg-cream py-14">
      <div className="container-brand">
        <SectionReveal className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-500">
              Onze favorieten
            </p>
            <h2 className="heading-section text-3xl text-neutral-800 sm:text-4xl">
              Bestsellers & uitgelicht
            </h2>
            <p className="mt-2 max-w-md text-neutral-500">
              Onze meest geliefde producten, geliefd door ouders en opa's en oma's
              overal in Nederland.
            </p>
          </div>

          <Link
            href="/winkel"
            className="whitespace-nowrap text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            <span className="flex items-center gap-2">
              Alle producten <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </SectionReveal>

        <StaggerReveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard
                product={{
                  ...product,
                  personalization_fields: product.personalization_fields ?? [],
                }}
                priority={index < 2}
              />
            </motion.div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}