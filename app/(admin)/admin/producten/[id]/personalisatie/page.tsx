'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PersonalizationField, Product } from '@/types'
import { PersonalizationBuilder } from '@/components/admin/personalization-builder'
import { Spinner } from '@/components/ui/spinner'

interface Props {
  params: Promise<{ id: string }>
}

export default function PersonalisatiePage({ params }: Props) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [fields, setFields] = useState<PersonalizationField[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: productData }, { data: fieldsData }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase
          .from('personalization_fields')
          .select('*, options:personalization_options(*)')
          .eq('product_id', id)
          .order('sort_order'),
      ])

      setProduct(productData)
      setFields(
        (fieldsData ?? []).map((f) => ({
          ...f,
          options: (f.options ?? []).sort(
            (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
          ),
        }))
      )
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-2xl">
        <p className="text-neutral-500">Product niet gevonden.</p>
        <Link href="/admin/producten" className="text-brand-500 hover:underline text-sm mt-2 inline-block">
          ← Terug naar producten
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href={`/admin/producten/${id}`}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors mt-0.5 shrink-0"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-0.5">Personalisatie</p>
          <h1 className="text-2xl font-extrabold text-neutral-800 truncate">{product.name}</h1>
        </div>
        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-semibold mt-2 shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Bekijk product
        </Link>
      </div>

      {/* Explanation card */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 text-sm text-brand-700 space-y-1">
        <p className="font-semibold">Hoe werkt personalisatie?</p>
        <p className="text-brand-600 text-xs leading-relaxed">
          Voeg hier velden toe die klanten kunnen invullen bij het bestellen. Gebruik <strong>tekstveld</strong> voor namen,{' '}
          <strong>kleurkeuze</strong> voor kleuren, <strong>letterkeuze</strong> voor lettertypen, enzovoort.
          De volgorde bepaalt de weergave op de productpagina.
        </p>
      </div>

      {/* Builder */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <PersonalizationBuilder
          productId={id}
          fields={fields}
          onFieldsChange={setFields}
        />
      </div>

      {/* Field type legend */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-5">
        <h3 className="text-sm font-bold text-neutral-700 mb-3">Veldtypen uitgelegd</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
          {[
            { type: 'Tekstveld', desc: 'Vrij invoerveld, bijv. voor een naam' },
            { type: 'Dropdown', desc: 'Uitklapmenu met vaste opties' },
            { type: 'Radio knoppen', desc: 'Pillen/knoppen waaruit één keuze' },
            { type: 'Kleurkeuze', desc: 'Circulaire kleurpickers met kleurcode' },
            { type: 'Letterkeuze', desc: 'Kaarten die een font als preview tonen' },
            { type: 'Icoonkeuze', desc: 'Grid van emoji- of symboolutleg' },
            { type: 'Maat', desc: 'Optieblokken voor maatkeuze' },
          ].map(({ type, desc }) => (
            <div key={type} className="flex gap-2">
              <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full shrink-0 font-medium">{type}</span>
              <span className="text-neutral-500 leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
