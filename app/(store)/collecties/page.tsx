import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CollectiesLayout } from '@/components/store/winkel2-client'
import { Category, Product } from '@/types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Collecties — Julies Art',
  description: 'Ontdek onze volledige collectie gepersonaliseerde kindercadeaus van hout, op naam van jouw kind.',
}

export default async function CollectiesPage() {
  const supabase = await createClient()

  const [{ data: categoriesRaw }, { data: productsRaw }] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('products').select(`
      *,
      images:product_images(*),
      personalization_fields(id),
      product_categories(category_id)
    `).eq('is_active', true).order('created_at', { ascending: false }),
  ])

  const categories = (categoriesRaw ?? []) as Category[]
  const products = (productsRaw ?? []).map(p => ({
    ...p,
    personalization_fields: p.personalization_fields ?? [],
    // Flatten category ids for easy client-side filtering
    category_ids: (p.product_categories ?? []).map((pc: { category_id: string }) => pc.category_id),
  })) as (Product & { category_ids: string[] })[]

  const maxProductPrice = products.length > 0
    ? Math.ceil(Math.max(...products.map(p => p.price)) / 10) * 10
    : 200

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>
      <div className="container-brand pt-8 pb-6">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-5">
          <Link href="/" className="hover:text-brand-500 transition-colors font-medium">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-600 font-semibold">Collecties</span>
        </nav>
        <div>
          <h1 className="heading-display text-3xl sm:text-4xl text-neutral-800">
            Onze <span className="text-gradient-brand">collectie</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-1.5">
            Gepersonaliseerde kindercadeaus van hout, op naam van jouw kind
          </p>
        </div>
      </div>

      <CollectiesLayout
        allProducts={products}
        categories={categories}
        maxProductPrice={maxProductPrice}
      />
    </div>
  )
}
