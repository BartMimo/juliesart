import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/store/product-grid'
import { Winkel2Hero, MobileSort } from '@/components/store/winkel2-client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Winkel — Julies Art',
  description: 'Ontdek onze volledige collectie gepersonaliseerde kindercadeaus.',
}

interface WinkelPageProps {
  searchParams: Promise<{ zoeken?: string; categorie?: string; sorteren?: string }>
}

const sortOptions = [
  { value: 'nieuwst', label: 'Nieuwst' },
  { value: 'prijs-laag', label: 'Prijs: laag → hoog' },
  { value: 'prijs-hoog', label: 'Prijs: hoog → laag' },
  { value: 'naam', label: 'Naam A–Z' },
]

export default async function Winkel2Page({ searchParams }: WinkelPageProps) {
  const { zoeken, categorie, sorteren } = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order')

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      personalization_fields(id)
    `)
    .eq('is_active', true)

  if (zoeken) {
    query = query.ilike('name', `%${zoeken}%`)
  }

  if (categorie) {
    const cat = categories?.find((c) => c.slug === categorie)
    if (cat) query = query.eq('category_id', cat.id)
  }

  switch (sorteren) {
    case 'prijs-laag':
      query = query.order('price', { ascending: true })
      break
    case 'prijs-hoog':
      query = query.order('price', { ascending: false })
      break
    case 'naam':
      query = query.order('name', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query

  const activeCat = categories?.find((c) => c.slug === categorie)
  const productList = (products ?? []).map((p) => ({
    ...p,
    personalization_fields: p.personalization_fields ?? [],
  }))

  const pageTitle = zoeken
    ? `Zoekresultaten voor "${zoeken}"`
    : activeCat
      ? activeCat.name
      : 'Onze collectie'

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* ── Hero banner ── */}
      <Winkel2Hero
        title={pageTitle}
        zoeken={zoeken ?? ''}
        total={productList.length}
        sorteren={sorteren ?? 'nieuwst'}
      />

      <div className="container-brand py-10">
        <div className="flex gap-10">

          {/* ── Sidebar — desktop ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Categories */}
              <div>
                <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em] mb-4">
                  Categorieën
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/winkel2"
                    className={cn(
                      'flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200',
                      !categorie
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'text-neutral-600 hover:bg-white hover:shadow-soft hover:text-neutral-800'
                    )}
                  >
                    <span>Alles</span>
                    {!categorie && <span className="text-[10px] opacity-70">{productList.length}</span>}
                  </Link>
                  {categories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/winkel2?categorie=${cat.slug}`}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200',
                        categorie === cat.slug
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'text-neutral-600 hover:bg-white hover:shadow-soft hover:text-neutral-800'
                      )}
                    >
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Sort */}
              <div>
                <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em] mb-4">
                  Sorteren
                </p>
                <div className="space-y-1">
                  {sortOptions.map((opt) => (
                    <Link
                      key={opt.value}
                      href={`/winkel2?${new URLSearchParams({
                        ...(categorie ? { categorie } : {}),
                        ...(zoeken ? { zoeken } : {}),
                        ...(opt.value !== 'nieuwst' ? { sorteren: opt.value } : {}),
                      }).toString()}`}
                      className={cn(
                        'flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200',
                        (sorteren ?? 'nieuwst') === opt.value
                          ? 'bg-white shadow-soft text-brand-600'
                          : 'text-neutral-500 hover:bg-white hover:shadow-soft hover:text-neutral-800'
                      )}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile category pills */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-hide">
              <Link
                href="/winkel2"
                className={cn(
                  'shrink-0 px-5 py-2 rounded-full text-sm font-bold border-2 transition-all',
                  !categorie
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-300'
                )}
              >
                Alles
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/winkel2?categorie=${cat.slug}`}
                  className={cn(
                    'shrink-0 px-5 py-2 rounded-full text-sm font-bold border-2 transition-all',
                    categorie === cat.slug
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-300'
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-neutral-500">
                <span className="font-bold text-neutral-800">{productList.length}</span>{' '}
                {productList.length === 1 ? 'product' : 'producten'}
                {activeCat && <span className="text-neutral-400"> in {activeCat.name}</span>}
              </p>

              <MobileSort
                sorteren={sorteren ?? 'nieuwst'}
                categorie={categorie}
                zoeken={zoeken}
              />
            </div>

            {/* Grid */}
            <ProductGrid
              products={productList}
              emptyMessage={
                zoeken
                  ? `Geen producten gevonden voor "${zoeken}".`
                  : 'Momenteel zijn er geen producten beschikbaar in deze categorie.'
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
