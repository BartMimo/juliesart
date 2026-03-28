import { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/store/product-grid'
import { WinkelToolbar } from '@/components/store/winkel-toolbar'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Search, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Winkel',
  description: 'Ontdek onze volledige collectie gepersonaliseerde kindercadeaus.',
}

interface WinkelPageProps {
  searchParams: Promise<{ zoeken?: string; categorie?: string; sorteren?: string }>
}

export default async function WinkelPage({ searchParams }: WinkelPageProps) {
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
    query = query.textSearch('fts', zoeken, { type: 'websearch', config: 'dutch' })
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

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-brand py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4">
            <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-neutral-600 font-medium">Winkel</span>
            {activeCat && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-neutral-600 font-medium">{activeCat.name}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800">
                {zoeken
                  ? `Zoekresultaten voor "${zoeken}"`
                  : activeCat
                    ? activeCat.name
                    : 'Onze collectie'}
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                Gepersonaliseerde kindercadeaus, met liefde gemaakt
              </p>
            </div>

            {/* Search */}
            <form method="GET" action="/winkel" className="sm:ml-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  name="zoeken"
                  defaultValue={zoeken ?? ''}
                  placeholder="Zoek een product..."
                  className="pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-full w-full sm:w-64 focus:outline-none focus:border-brand-300 focus:bg-white transition-all"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container-brand py-8">
        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                  Categorie
                </p>
                <nav className="space-y-0.5">
                  <Link
                    href="/winkel"
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors',
                      !categorie
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                    )}
                  >
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors',
                      !categorie ? 'bg-brand-500' : 'bg-neutral-300'
                    )} />
                    Alles
                  </Link>
                  {categories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/winkel?categorie=${cat.slug}`}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors',
                        categorie === cat.slug
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                      )}
                    >
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full transition-colors',
                        categorie === cat.slug ? 'bg-brand-500' : 'bg-neutral-300'
                      )} />
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile category pills */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-hide">
              <Link
                href="/winkel"
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all',
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
                  href={`/winkel?categorie=${cat.slug}`}
                  className={cn(
                    'shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all',
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
            <div className="bg-white rounded-2xl border border-neutral-100 px-5 py-3.5 mb-6">
              <Suspense fallback={<div className="h-5" />}>
                <WinkelToolbar
                  total={products?.length ?? 0}
                  currentSort={sorteren ?? 'nieuwst'}
                  currentCategorie={categorie ?? ''}
                />
              </Suspense>
            </div>

            {/* Grid */}
            <ProductGrid
              products={(products ?? []).map((p) => ({
                ...p,
                personalization_fields: p.personalization_fields ?? [],
              }))}
              emptyMessage={
                zoeken
                  ? `Geen producten gevonden voor "${zoeken}".`
                  : 'Momenteel zijn er geen producten beschikbaar.'
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
