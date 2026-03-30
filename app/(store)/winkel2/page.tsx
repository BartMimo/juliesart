import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Winkel2FilterBar, Winkel2Grid } from '@/components/store/winkel2-client'
import { Category } from '@/types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Winkel — Julies Art',
  description: 'Ontdek onze volledige collectie gepersonaliseerde kindercadeaus van hout, op naam van jouw kind.',
}

interface WinkelPageProps {
  searchParams: Promise<{ zoeken?: string; categorie?: string; sorteren?: string }>
}

export default async function Winkel2Page({ searchParams }: WinkelPageProps) {
  const { zoeken, categorie, sorteren } = await searchParams
  const supabase = await createClient()

  const { data: categoriesRaw } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  const categories = (categoriesRaw ?? []) as Category[]

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      personalization_fields(id)
    `)
    .eq('is_active', true)

  if (zoeken) query = query.ilike('name', `%${zoeken}%`)

  if (categorie) {
    const cat = categories.find(c => c.slug === categorie)
    if (cat) query = query.eq('category_id', cat.id)
  }

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
  const activeCat = categories.find(c => c.slug === categorie)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>

      {/* ── Page header ── */}
      <div className="container-brand pt-8 pb-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-5">
          <Link href="/" className="hover:text-brand-500 transition-colors font-medium">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-600 font-semibold">Winkel</span>
          {activeCat && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-neutral-600 font-semibold">{activeCat.name}</span>
            </>
          )}
        </nav>

        {/* Title */}
        <div className="flex items-end gap-4">
          <div>
            <h1 className="heading-display text-3xl sm:text-4xl text-neutral-800">
              {zoeken ? (
                <>Resultaten voor <span className="text-gradient-brand">&ldquo;{zoeken}&rdquo;</span></>
              ) : activeCat ? (
                activeCat.name
              ) : (
                <>Onze <span className="text-gradient-brand">collectie</span></>
              )}
            </h1>
            <p className="text-neutral-500 text-sm mt-1.5">
              Gepersonaliseerde kindercadeaus van hout, op naam van jouw kind
            </p>
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar ── */}
      <Winkel2FilterBar
        categories={categories}
        zoeken={zoeken ?? ''}
        categorie={categorie ?? ''}
        sorteren={sorteren ?? 'nieuwst'}
        total={productList.length}
      />

      {/* ── Product grid ── */}
      <div className="container-brand py-10">
        <Winkel2Grid
          products={productList}
          zoeken={zoeken ?? ''}
        />
      </div>

    </div>
  )
}
