'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { GripVertical, X, Star, Loader2, ImagePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductImage } from '@/types'
import { useToast } from '@/components/ui/toaster'

interface ImageUploaderProps {
  productId: string
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
}

export function ImageUploader({ productId, images, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const draggedId = useRef<string | null>(null)
  const toast = useToast()
  const supabase = createClient()

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    const newImages: ProductImage[] = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is te groot (max 5MB)`)
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { contentType: file.type })

      if (uploadError) {
        toast.error(`Kon ${file.name} niet uploaden`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      // Save to DB
      const { data: image, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: publicUrl,
          alt: file.name.replace(/\.[^.]+$/, ''),
          sort_order: images.length + newImages.length,
          is_primary: images.length === 0 && newImages.length === 0,
        })
        .select()
        .single()

      if (!dbError && image) {
        newImages.push(image)
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages])
      toast.success(`${newImages.length} afbeelding(en) geüpload`)
    }

    setUploading(false)
    // Reset file input
    e.target.value = ''
  }, [productId, images, onImagesChange, supabase, toast])

  const handleDelete = async (image: ProductImage) => {
    // Delete from Supabase storage
    const path = new URL(image.url).pathname.split('/product-images/')[1]
    if (path) {
      await supabase.storage.from('product-images').remove([path])
    }

    // Delete from DB
    await supabase.from('product_images').delete().eq('id', image.id)

    const updated = images.filter((i) => i.id !== image.id)
    // Ensure there's always a primary
    if (image.is_primary && updated.length > 0) {
      await supabase.from('product_images').update({ is_primary: true }).eq('id', updated[0].id)
      updated[0].is_primary = true
    }

    onImagesChange(updated)
    toast.success('Afbeelding verwijderd')
  }

  const handleSetPrimary = async (image: ProductImage) => {
    // Remove primary from all
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
    // Set new primary
    await supabase.from('product_images').update({ is_primary: true }).eq('id', image.id)

    const updated = images.map((i) => ({ ...i, is_primary: i.id === image.id }))
    onImagesChange(updated)
  }

  const handleDragStart = (id: string) => {
    draggedId.current = id
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedId.current !== id) setDragOverId(id)
  }

  const handleDrop = async (targetId: string) => {
    setDragOverId(null)
    const fromId = draggedId.current
    draggedId.current = null
    if (!fromId || fromId === targetId) return

    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
    const fromIdx = sorted.findIndex(i => i.id === fromId)
    const toIdx = sorted.findIndex(i => i.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return

    const reordered = [...sorted]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)

    const updated = reordered.map((img, idx) => ({ ...img, sort_order: idx }))
    onImagesChange(updated)

    // Persist to DB
    await Promise.all(
      updated.map(img => supabase.from('product_images').update({ sort_order: img.sort_order }).eq('id', img.id))
    )
  }

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <label className={`
        block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
        ${uploading ? 'opacity-50 cursor-not-allowed border-neutral-200' : 'border-neutral-200 hover:border-brand-400 hover:bg-brand-50'}
      `}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="sr-only"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
            <p className="text-sm text-neutral-500 font-medium">Uploaden…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center">
              <ImagePlus className="h-6 w-6 text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">
              Klik om afbeeldingen te uploaden
            </p>
            <p className="text-xs text-neutral-400">JPG, PNG, WebP — max 5MB per afbeelding</p>
          </div>
        )}
      </label>

      {/* Image grid */}
      {sortedImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {sortedImages.map((image) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(image.id)}
              onDragOver={(e) => handleDragOver(e, image.id)}
              onDrop={() => handleDrop(image.id)}
              onDragLeave={() => setDragOverId(null)}
              onDragEnd={() => { draggedId.current = null; setDragOverId(null) }}
              className={`relative group aspect-square rounded-xl overflow-hidden bg-neutral-100 border-2 transition-all cursor-grab active:cursor-grabbing ${
                dragOverId === image.id
                  ? 'border-brand-400 scale-105 shadow-lg'
                  : 'border-neutral-200'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? 'Product afbeelding'}
                fill
                className="object-cover pointer-events-none"
                sizes="120px"
              />

              {/* Drag handle */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-black/40 rounded-md flex items-center justify-center">
                  <GripVertical className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              {/* Primary badge */}
              {image.is_primary && (
                <div className="absolute top-1.5 left-1.5">
                  <span className="bg-brand-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="h-2.5 w-2.5 fill-white" /> Hoofd
                  </span>
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(image)}
                    title="Stel in als hoofdafbeelding"
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-brand-50 transition-colors"
                  >
                    <Star className="h-4 w-4 text-brand-500" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(image)}
                  title="Verwijderen"
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
