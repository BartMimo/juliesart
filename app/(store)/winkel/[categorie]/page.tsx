import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/store/product-grid'
import { SectionReveal } from '@/components/store/section-reveal'

interface CategoryPageProps {
  params: Promise<{ categorie: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorie } = await params
  const supabase = await createClient()
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', categorie).single()

  if (!cat) return { title: 'Categorie niet gevonden' }

  return {
    title: cat.name,
    description: cat.description ?? `Bekijk onze ${cat.name.toLowerCase()} collectie.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorie } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorie)
    .eq('is_active', true)
    .single()

  if (!category) notFound()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      personalization_fields(id)
    `)
    .eq('is_active', true)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  return (
    <div className="py-12">
      <div className="container-brand">
        <SectionReveal className="mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand-500 mb-1">Categorie</p>
            <h1 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-3">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-neutral-500 leading-relaxed">{category.description}</p>
            )}
          </div>
        </SectionReveal>

        <ProductGrid
          products={(products ?? []).map((p) => ({
            ...p,
            personalization_fields: p.personalization_fields ?? [],
          }))}
          emptyMessage={`Momenteel zijn er geen producten in de categorie "${category.name}".`}
        />
      </div>
    </div>
  )
}
