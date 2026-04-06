import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDateShort } from '@/lib/utils'
import { Plus, Pencil, Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Producten' }

export default async function AdminProductenPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      images:product_images(url, is_primary),
      personalization_fields(id)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Producten</h1>
          <p className="text-neutral-500 text-sm mt-1">{products?.length ?? 0} producten totaal</p>
        </div>
        <Button asChild size="md">
          <Link href="/admin/producten/nieuw">
            <Plus className="h-4 w-4" />
            Nieuw product
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Product</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden sm:table-cell">Categorie</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Prijs</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden lg:table-cell">Voorraad</th>
              <th className="text-left px-4 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="text-right px-5 py-3.5 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(products ?? []).map((product) => {
              const primaryImage = product.images?.find((i: { is_primary: boolean; url: string }) => i.is_primary) ?? product.images?.[0]
              return (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        {primaryImage ? (
                          <Image src={primaryImage.url} alt={product.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-lg">🎀</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-neutral-800 truncate">{product.name}</p>
                          {product.is_featured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                        </div>
                        {(product.personalization_fields?.length ?? 0) > 0 && (
                          <p className="text-xs text-brand-500">Personaliseerbaar</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-neutral-600 hidden sm:table-cell">
                    {(product.category as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-neutral-800">{formatPrice(product.price)}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    {product.track_inventory ? (
                      <span className={`font-semibold tabular-nums ${
                        (product.stock_quantity ?? 0) <= 0
                          ? 'text-red-600'
                          : (product.stock_quantity ?? 0) < 5
                          ? 'text-amber-600'
                          : 'text-neutral-800'
                      }`}>
                        {product.stock_quantity ?? 0}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      product.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {product.is_active ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/producten/${product.id}`}
                        className="p-2 rounded-lg hover:bg-brand-50 text-neutral-400 hover:text-brand-600 transition-colors"
                        title="Bewerken"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(products?.length ?? 0) === 0 && (
          <div className="p-12 text-center text-neutral-400 text-sm">
            Nog geen producten. <Link href="/admin/producten/nieuw" className="text-brand-500 underline">Maak het eerste product aan</Link>.
          </div>
        )}
      </div>
    </div>
  )
}
