'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { slugify } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  slug: z.string().min(1, 'Slug is verplicht'),
  short_description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Prijs moet groter zijn dan 0'),
  category_id: z.string().optional().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function NieuwProductPage() {
  const router = useRouter()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, is_featured: false },
  })

  const nameValue = watch('name')
  useEffect(() => {
    if (nameValue) setValue('slug', slugify(nameValue))
  }, [nameValue, setValue])

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setCategories(data ?? [])
    })
  }, [])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const { data: created, error } = await supabase
      .from('products')
      .insert({ ...data, category_id: data.category_id || null })
      .select()
      .single()

    if (error) {
      toast.error('Kon product niet aanmaken', error.message)
    } else {
      toast.success('Product aangemaakt!')
      router.push(`/admin/producten/${created.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/producten" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-neutral-500" />
        </Link>
        <h1 className="text-2xl font-extrabold text-neutral-800">Nieuw product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 space-y-5">
        <Input label="Productnaam" required error={errors.name?.message} {...register('name')} />
        <Input label="Slug" required helpText="/product/jouw-slug" error={errors.slug?.message} {...register('slug')} />
        <Textarea label="Korte beschrijving" rows={2} {...register('short_description')} />
        <Input label="Prijs (€)" type="number" step="0.01" min="0.01" required error={errors.price?.message} {...register('price')} />

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Categorie</label>
          <select className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" {...register('category_id')}>
            <option value="">— Geen categorie —</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-700">
            <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('is_active')} /> Actief
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-700">
            <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('is_featured')} /> Uitgelicht
          </label>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={saving}>
          <Save className="h-4 w-4" />
          Product aanmaken & verder bewerken
        </Button>
      </form>
    </div>
  )
}
