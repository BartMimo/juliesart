'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DiscountCode } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toaster'
import { formatPrice, formatDateShort } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  code: z.string().min(3, 'Minimaal 3 tekens').max(20).regex(/^[A-Z0-9]+$/, 'Alleen hoofdletters en cijfers'),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0.01),
  min_order_amount: z.coerce.number().min(0).optional().nullable(),
  max_uses: z.coerce.number().int().min(1).optional().nullable(),
  valid_from: z.string(),
  valid_until: z.string().optional().nullable(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function KortingscodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const supabase = createClient()

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'percentage',
      valid_from: new Date().toISOString().split('T')[0],
    },
  })
  const discountType = watch('type')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false })
      setCodes(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const { data: created, error } = await supabase
      .from('discount_codes')
      .insert({
        ...data,
        min_order_amount: data.min_order_amount || null,
        max_uses: data.max_uses || null,
        valid_until: data.valid_until || null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Kon kortingscode niet aanmaken', error.message)
    } else {
      setCodes([created, ...codes])
      toast.success('Kortingscode aangemaakt!')
      reset()
      setDialogOpen(false)
    }
    setSaving(false)
  }

  const toggleActive = async (code: DiscountCode) => {
    const { error } = await supabase
      .from('discount_codes')
      .update({ is_active: !code.is_active })
      .eq('id', code.id)

    if (!error) {
      setCodes(codes.map((c) => c.id === code.id ? { ...c, is_active: !c.is_active } : c))
    }
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Kortingscode verwijderen?')) return
    const { error } = await supabase.from('discount_codes').delete().eq('id', id)
    if (!error) {
      setCodes(codes.filter((c) => c.id !== id))
      toast.success('Kortingscode verwijderd')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Kortingscodes</h1>
          <p className="text-neutral-500 text-sm mt-1">{codes.length} codes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="md">
              <Plus className="h-4 w-4" />
              Nieuwe code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Kortingscode aanmaken</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Code"
                  placeholder="WELKOM10"
                  required
                  error={errors.code?.message}
                  className="uppercase"
                  {...register('code')}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                  }}
                />
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Type</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    {...register('type')}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Vast bedrag (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={discountType === 'percentage' ? 'Korting (%)' : 'Kortingsbedrag (€)'}
                  type="number"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  min="0.01"
                  required
                  error={errors.value?.message}
                  {...register('value')}
                />
                <Input
                  label="Min. bestelbedrag (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  helpText="Optioneel"
                  {...register('min_order_amount')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Max. gebruik" type="number" min="1" helpText="Leeg = onbeperkt" {...register('max_uses')} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Geldig vanaf" type="date" required {...register('valid_from')} />
                <Input label="Geldig tot" type="date" helpText="Leeg = altijd geldig" {...register('valid_until')} />
              </div>

              <Input label="Interne beschrijving" helpText="Optionele notitie voor jezelf" {...register('description')} />

              <Button type="submit" size="lg" className="w-full" loading={saving}>
                Aanmaken
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Code</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Waarde</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden md:table-cell">Gebruik</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden sm:table-cell">Geldig tot</th>
              <th className="text-right px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {codes.map((code) => (
              <tr key={code.id} className={`hover:bg-neutral-50 transition-colors ${!code.is_active ? 'opacity-50' : ''}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-brand-400" />
                    <span className="font-bold text-neutral-800 font-mono">{code.code}</span>
                  </div>
                  {code.description && <p className="text-xs text-neutral-400 mt-0.5">{code.description}</p>}
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-neutral-800">
                    {code.type === 'percentage' ? `${code.value}%` : formatPrice(code.value)}
                  </span>
                  {code.min_order_amount && (
                    <p className="text-xs text-neutral-400">min. {formatPrice(code.min_order_amount)}</p>
                  )}
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-neutral-600">
                    {code.current_uses} / {code.max_uses ?? '∞'}
                  </span>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell text-neutral-600">
                  {code.valid_until ? formatDateShort(code.valid_until) : '—'}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleActive(code)}
                      className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                      title={code.is_active ? 'Deactiveren' : 'Activeren'}
                    >
                      {code.is_active
                        ? <ToggleRight className="h-5 w-5 text-green-500" />
                        : <ToggleLeft className="h-5 w-5 text-neutral-400" />
                      }
                    </button>
                    <button
                      onClick={() => deleteCode(code.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {codes.length === 0 && (
          <div className="p-12 text-center text-neutral-400 text-sm">
            Nog geen kortingscodes aangemaakt.
          </div>
        )}
      </div>
    </div>
  )
}
