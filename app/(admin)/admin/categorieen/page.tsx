'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toaster'
import { slugify } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  slug: z.string().min(1, 'Slug is verplicht'),
  description: z.string().optional(),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function CategorieenPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sort_order: 0, is_active: true },
  })
  const nameVal = watch('name')
  useEffect(() => {
    if (!editingId && nameVal) setValue('slug', slugify(nameVal))
  }, [nameVal, editingId, setValue])

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data ?? [])
      setLoading(false)
    })
  }, [])

  const openNew = () => {
    setEditingId(null)
    reset({ sort_order: categories.length, is_active: true })
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingId(cat.id)
    reset({
      name: cat.name, slug: cat.slug,
      description: cat.description ?? '',
      sort_order: cat.sort_order, is_active: cat.is_active,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)

    if (editingId) {
      const { error } = await supabase.from('categories').update(data).eq('id', editingId)
      if (!error) {
        setCategories(categories.map((c) => c.id === editingId ? { ...c, ...data } : c))
        toast.success('Categorie bijgewerkt')
      }
    } else {
      const { data: created, error } = await supabase.from('categories').insert(data).select().single()
      if (!error && created) {
        setCategories([...categories, created].sort((a, b) => a.sort_order - b.sort_order))
        toast.success('Categorie aangemaakt')
      } else if (error) {
        toast.error('Kon categorie niet aanmaken', error.message)
      }
    }

    setDialogOpen(false)
    setSaving(false)
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Categorie verwijderen? Producten in deze categorie verliezen hun categorietoewijzing.')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(categories.filter((c) => c.id !== id))
      toast.success('Categorie verwijderd')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-neutral-800">Categorieën</h1>
        <Button size="md" onClick={openNew}>
          <Plus className="h-4 w-4" /> Nieuwe categorie
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Naam</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden md:table-cell">Slug</th>
              <th className="text-center px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Volgorde</th>
              <th className="text-center px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-4 font-semibold text-neutral-800">{cat.name}</td>
                <td className="px-4 py-4 text-neutral-400 font-mono text-xs hidden md:table-cell">{cat.slug}</td>
                <td className="px-4 py-4 text-center text-neutral-600">{cat.sort_order}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    cat.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                  }`}>{cat.is_active ? 'Actief' : 'Inactief'}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-brand-50 text-neutral-400 hover:text-brand-600 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="p-12 text-center text-neutral-400 text-sm">Nog geen categorieën aangemaakt.</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Categorie bewerken' : 'Nieuwe categorie'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <Input label="Naam" required error={errors.name?.message} {...register('name')} />
            <Input label="Slug" required helpText="/collecties/jouw-slug" error={errors.slug?.message} {...register('slug')} />
            <Textarea label="Beschrijving" rows={2} {...register('description')} />
            <Input label="Sorteervolgorde" type="number" min="0" {...register('sort_order')} />
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-700">
              <input type="checkbox" className="w-4 h-4 accent-brand-500" {...register('is_active')} /> Actief
            </label>
            <Button type="submit" size="lg" className="w-full" loading={saving}>
              <Save className="h-4 w-4" />
              {editingId ? 'Opslaan' : 'Aanmaken'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
