import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CollectiesLayout } from '@/components/store/winkel2-client'
import { Category } from '@/types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Collecties — Julies Art',
  description: 'Ontdek onze volledige collectie gepersonaliseerde kindercadeaus van hout, op naam van jouw kind.',
}

interface CollectiesPageProps {
  searchParams: Promise<{
    zoeken?: string
    categorieen?: string
    sorteren?: string
    personaliseren?: string
    sale?: string
    prijs_min?: string
    prijs_max?: string
  }>
}

export default async function CollectiesPage({ searchParams }: CollectiesPageProps) {
  const { zoeken, categorieen, sorteren, personaliseren, sale, prijs_min, prijs_max } = await searchParams
  const supabase = await createClient()

  const { data: categoriesRaw } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  const categories = (categoriesRaw ?? []) as Category[]

  // Fetch all active products (with images + fields) for price range
  let query = supabase
    .from('products')
    .select(`*, images:product_images(*), personalization_fields(id)`)
    .eq('is_active', true)

  // Search
  if (zoeken) query = query.ilike('name', `%${zoeken}%`)

  // Personaliseerbaar
  if (personaliseren === '1') query = query.eq('is_personalizable', true)

  // Sale
  if (sale === '1') query = query.eq('is_sale', true)

  // Price range
  const parsedMin = prijs_min ? parseFloat(prijs_min) : null
  const parsedMax = prijs_max ? parseFloat(prijs_max) : null
  if (parsedMin !== null && !isNaN(parsedMin)) query = query.gte('price', parsedMin)
  if (parsedMax !== null && !isNaN(parsedMax)) query = query.lte('price', parsedMax)

  // Categories (multi-select, OR logic)
  if (categorieen) {
    const catSlugs = categorieen.split(',').filter(Boolean)
    const matchedCats = categories.filter(c => catSlugs.includes(c.slug))
    if (matchedCats.length > 0) {
      const { data: pc } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', matchedCats.map(c => c.id))
      const ids = [...new Set((pc ?? []).map((r: { product_id: string }) => r.product_id))]
      query = ids.length > 0 ? query.in('id', ids) : query.eq('id', 'none')
    }
  }

  // Sort
  switch (sorteren) {
    case 'prijs-laag': query = query.order('price', { ascending: true }); break
    case 'prijs-hoog': query = query.order('price', { ascending: false }); break
    case 'naam': query = query.order('name', { ascending: true }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query
  const productList = (products ?? []).map(p => ({
    ...p,
    personalization_fields: p.personalization_fields ?? [],
  }))

  // Determine max price for slider (from all active products, not filtered)
  const { data: allPrices } = await supabase
    .from('products')
    .select('price')
    .eq('is_active', true)
  const maxProductPrice = allPrices && allPrices.length > 0
    ? Math.ceil(Math.max(...allPrices.map((p: { price: number }) => p.price)) / 10) * 10
    : 200

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>
      {/* Page header */}
      <div className="container-brand pt-8 pb-6">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-5">
          <Link href="/" className="hover:text-brand-500 transition-colors font-medium">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-600 font-semibold">Collecties</span>
        </nav>
        <div>
          <h1 className="heading-display text-3xl sm:text-4xl text-neutral-800">
            {zoeken ? (
              <>Resultaten voor <span className="text-gradient-brand">&ldquo;{zoeken}&rdquo;</span></>
            ) : (
              <>Onze <span className="text-gradient-brand">collectie</span></>
            )}
          </h1>
          <p className="text-neutral-500 text-sm mt-1.5">
            Gepersonaliseerde kindercadeaus van hout, op naam van jouw kind
          </p>
        </div>
      </div>

      <CollectiesLayout
        products={productList}
        categories={categories}
        filters={{
          zoeken: zoeken ?? '',
          categorieen: categorieen ?? '',
          sorteren: sorteren ?? 'nieuwst',
          personaliseren: personaliseren === '1',
          sale: sale === '1',
          prijs_min: parsedMin,
          prijs_max: parsedMax,
        }}
        maxProductPrice={maxProductPrice}
      />
    </div>
  )
}
