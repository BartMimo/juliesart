'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductImage, PersonalizationField, Category } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageUploader } from '@/components/admin/image-uploader'
import { PersonalizationBuilder } from '@/components/admin/personalization-builder'
import { useToast } from '@/components/ui/toaster'
import { slugify } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  slug: z.string().min(1, 'Slug is verplicht'),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Prijs moet groter zijn dan 0'),
  compare_at_price: z.coerce.number().min(0).optional().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_sold_out: z.boolean(),
  is_personalizable: z.boolean(),
  is_sale: z.boolean(),
  track_inventory: z.boolean(),
  stock_quantity: z.coerce.number().int().optional().nullable(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const isNew = params.id === 'nieuw'
  const productId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [personalizationFields, setPersonalizationFields] = useState<PersonalizationField[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, is_featured: false, is_sold_out: false, is_personalizable: false, is_sale: false, track_inventory: false, stock_quantity: null },
  })

  const nameValue = watch('name')
  const slugValue = watch('slug')
  const trackInventory = watch('track_inventory')

  // Auto-generate slug from name when it's still a concept slug
  useEffect(() => {
    if (nameValue && slugValue?.startsWith('concept-')) {
      setValue('slug', slugify(nameValue))
    }
  }, [nameValue])

  useEffect(() => {
    async function load() {
      // Load categories
      const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      setCategories(cats ?? [])

      if (isNew) {
        // Create a draft product immediately so images can be uploaded right away
        const { data: draft, error } = await supabase
          .from('products')
          .insert({
            name: '',
            slug: `concept-${Date.now()}`,
            price: 0.01,
            is_active: false,
            is_featured: false,
            is_sold_out: false,
          })
          .select()
          .single()

        if (!error && draft) {
          router.replace(`/admin/producten/${draft.id}`)
        } else {
          setLoading(false)
        }
        return
      }

      // Load selected categories from junction table (for existing products)
      const { data: pc } = await supabase
        .from('product_categories')
        .select('category_id')
        .eq('product_id', params.id)
      if (pc && pc.length > 0) {
        setSelectedCategoryIds(pc.map((r: { category_id: string }) => r.category_id))
      }

      const { data: p } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          personalization_fields(*, options:personalization_options(*))
        `)
        .eq('id', params.id)
        .single()

      if (p) {
        setProduct(p)
        setImages(p.images ?? [])
        setPersonalizationFields(p.personalization_fields ?? [])

        // Populate form
        setValue('name', p.name)
        setValue('slug', p.slug)
        setValue('short_description', p.short_description ?? '')
        setValue('description', p.description ?? '')
        setValue('price', p.price)
        setValue('compare_at_price', p.compare_at_price ?? null)
        setValue('is_active', p.is_active)
        setValue('is_featured', p.is_featured)
        setValue('is_sold_out', p.is_sold_out)
        setValue('is_personalizable', p.is_personalizable ?? false)
        setValue('is_sale', p.is_sale ?? false)
        setValue('track_inventory', p.track_inventory ?? false)
        setValue('stock_quantity', p.stock_quantity ?? null)
        setValue('meta_title', p.meta_title ?? '')
        setValue('meta_description', p.meta_description ?? '')
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const onSubmit = async (data: FormData) => {
    setSaving(true)

    const payload = {
      ...data,
      compare_at_price: data.compare_at_price || null,
      stock_quantity: data.track_inventory ? (data.stock_quantity ?? null) : null,
      // Primary category = first selected (for backwards compat with breadcrumbs/display)
      category_id: selectedCategoryIds[0] ?? null,
    }

    const savedProductId = productId

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', savedProductId)

    if (error) {
      toast.error('Kon product niet opslaan', error.message)
      setSaving(false)
      return
    }

    // Sync junction table: delete all then re-insert selected
    await supabase.from('product_categories').delete().eq('product_id', savedProductId)
    if (selectedCategoryIds.length > 0) {
      await supabase.from('product_categories').insert(
        selectedCategoryIds.map(catId => ({ product_id: savedProductId, category_id: catId }))
      )
    }

    toast.success('Product opgeslagen!')
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je dit product wil verwijderen? Dit kan niet ongedaan worden gemaakt.')) return

    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      toast.error('Kon product niet verwijderen')
    } else {
      toast.success('Product verwijderd')
      router.push('/admin/producten')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/producten" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-800">
              {isNew ? 'Nieuw product' : (product?.name ?? 'Product bewerken')}
            </h1>
            {!isNew && <p className="text-neutral-400 text-sm">/{product?.slug}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/product/${product?.slug}`} target="_blank">
                  <Eye className="h-4 w-4" />
                  Bekijken
                </Link>
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Verwijderen
              </Button>
            </>
          )}
          <Button onClick={handleSubmit(onSubmit)} size="md" loading={saving}>
            <Save className="h-4 w-4" />
            Opslaan
          </Button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 space-y-4">
            <h2 className="font-bold text-neutral-800">Basisinformatie</h2>
            <Input label="Productnaam" required error={errors.name?.message} {...register('name')} />
            <Input
              label="Slug (URL)"
              required
              error={errors.slug?.message}
              helpText="Wordt gebruikt in de URL: /product/jouw-slug"
              {...register('slug')}
            />
            <Textarea
              label="Korte beschrijving"
              rows={2}
              helpText="Wordt getoond in productkaarten en bovenaan de productpagina"
              {...register('short_description')}
            />
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Volledige beschrijving
                <span className="text-neutral-400 font-normal ml-1">(HTML ondersteund)</span>
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none font-mono"
                rows={8}
                {...register('description')}
              />
            </div>
          </div>

          {/* Images */}
          {!isNew && product && (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
              <h2 className="font-bold text-neutral-800 mb-4">Afbeeldingen</h2>
              <ImageUploader
                productId={product.id}
                images={images}
                onImagesChange={setImages}
              />
            </div>
          )}

          {/* Personalization */}
          {!isNew && product && (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-neutral-800">Personalisatieopties</h2>
                <Link
                  href={`/admin/producten/${product.id}/personalisatie`}
                  className="text-xs text-brand-500 font-semibold hover:text-brand-600"
                >
                  Uitgebreid beheer →
                </Link>
              </div>
              <PersonalizationBuilder
                productId={product.id}
                fields={personalizationFields}
                onFieldsChange={setPersonalizationFields}
              />
            </div>
          )}

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 space-y-4">
            <h2 className="font-bold text-neutral-800">SEO</h2>
            <Input
              label="Meta titel"
              helpText="Laat leeg om de productnaam te gebruiken"
              {...register('meta_title')}
            />
            <Textarea
              label="Meta omschrijving"
              rows={2}
              helpText="Max. 160 tekens voor beste SEO-resultaat"
              {...register('meta_description')}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 space-y-4">
            <h2 className="font-bold text-neutral-800">Prijs</h2>
            <Input
              label="Verkoopprijs (€)"
              type="number"
              step="0.01"
              required
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Originele prijs (€)"
              type="number"
              step="0.01"
              helpText="Optioneel — toont doorgestreepte prijs"
              {...register('compare_at_price')}
            />
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 space-y-4">
            <h2 className="font-bold text-neutral-800">Voorraad</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('track_inventory')} />
              <div>
                <span className="text-sm font-semibold text-neutral-700">Voorraad bijhouden</span>
                <p className="text-xs text-neutral-400">Bijhouden hoeveel er op voorraad is</p>
              </div>
            </label>
            {trackInventory && (
              <Input
                label="Aantal op voorraad"
                type="number"
                step="1"
                helpText="Loopt automatisch af bij bestellingen. Bestellen blijft mogelijk bij 0 of lager."
                {...register('stock_quantity')}
              />
            )}
          </div>

          {/* Category + status */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 space-y-4">
            <h2 className="font-bold text-neutral-800">Organisatie</h2>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Categorieën</label>
              {categories.length === 0 ? (
                <p className="text-xs text-neutral-400">Geen categorieën gevonden.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={e => {
                          setSelectedCategoryIds(prev =>
                            e.target.checked
                              ? [...prev, cat.id]
                              : prev.filter(id => id !== cat.id)
                          )
                        }}
                        className="w-4 h-4 accent-brand-500 rounded shrink-0"
                      />
                      <span className="text-sm text-neutral-700 group-hover:text-neutral-900">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {selectedCategoryIds.length > 1 && (
                <p className="text-xs text-neutral-400 mt-2">
                  Eerste aangevinkte categorie wordt als primaire weergegeven.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('is_active')} />
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Actief</span>
                  <p className="text-xs text-neutral-400">Zichtbaar in de winkel</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('is_featured')} />
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Uitgelicht</span>
                  <p className="text-xs text-neutral-400">Getoond op de homepage</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('is_sold_out')} />
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Uitverkocht</span>
                  <p className="text-xs text-neutral-400">Toont uitverkocht-overlay op het product</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('is_personalizable')} />
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Personaliseerbaar</span>
                  <p className="text-xs text-neutral-400">Toon "Op naam" badge + filterbaar in winkel</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('is_sale')} />
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Sale</span>
                  <p className="text-xs text-neutral-400">Toon sale-badge + filterbaar in winkel</p>
                </div>
              </label>
            </div>
          </div>

          {!isNew && (
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Snel navigeren</p>
              <div className="space-y-2">
                <Link
                  href={`/admin/producten/${productId}/personalisatie`}
                  className="flex items-center justify-between text-sm text-neutral-600 hover:text-brand-600 font-medium py-1"
                >
                  Personalisatie beheren <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
