'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { SectionReveal, StaggerReveal, staggerItem } from './section-reveal'

const categoryEmojis: Record<string, string> = {
  tandendoosjes: '🦷',
  'houten-koffertjes': '🧳',
  'siliconen-slabbers': '🍼',
  kraamcadeaus: '🎀',
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

type CategoryGridClientProps = {
  categories: Category[]
}

export function CategoryGridClient({ categories }: CategoryGridClientProps) {
  return (
    <section className="bg-white py-20">
      <div className="container-brand">
        <SectionReveal className="mb-12 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-500">
            Onze categorieën
          </p>
          <h2 className="heading-section text-3xl text-neutral-800 sm:text-4xl">
            Wat zoek je vandaag?
          </h2>
          <p className="mt-2 text-neutral-500">
            Ontdek onze collecties en vind het perfecte cadeau voor jouw kleintje.
          </p>
        </SectionReveal>

        <StaggerReveal className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {categories.map((category) => (
            <motion.div key={category.id} variants={staggerItem}>
              <Link
                href={`/winkel/${category.slug}`}
                className="group block overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all duration-300 hover:border-brand-200 hover:shadow-hover"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-50 to-peach-50">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl transition-transform duration-300 group-hover:scale-125">
                        {categoryEmojis[category.slug] ?? '🎁'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-neutral-800 transition-colors group-hover:text-brand-600">
                    {category.name}
                  </h3>

                  {category.description ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500">
                      {category.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-500 transition-all group-hover:gap-2">
                    Bekijken <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}