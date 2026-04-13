'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Upload, Package, MapPin, ShoppingBag, ChevronRight, ChevronLeft, Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, EngravingPosition } from '@/types'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/cart/store'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DragState {
  active: boolean
  startX: number
  startY: number
  mode: 'draw' | 'move' | 'resize-se' | 'resize-sw' | 'resize-ne' | 'resize-nw' | null
  initPos: EngravingPosition | null
}

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Tekening', icon: Upload },
  { label: 'Product', icon: Package },
  { label: 'Locatie', icon: MapPin },
  { label: 'Bestelling', icon: ShoppingBag },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 md:mb-12">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                done ? 'bg-amber-500 text-white' : active ? 'bg-amber-600 text-white ring-4 ring-amber-200' : 'bg-neutral-100 text-neutral-400'
              }`}>
                {done ? <Check className="h-4.5 w-4.5" strokeWidth={2.5} /> : <Icon className="h-4.5 w-4.5" />}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-amber-700' : done ? 'text-amber-600' : 'text-neutral-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 md:w-20 h-0.5 mx-1 mb-4 transition-colors duration-300 ${i < current ? 'bg-amber-400' : 'bg-neutral-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1 – Upload tekening ───────────────────────────────────────────────────

function StepUpload({
  uploadUrl,
  onUploaded,
}: {
  uploadUrl: string | null
  onUploaded: (url: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Ongeldig bestandstype. Gebruik JPG, PNG, SVG of WebP.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Bestand is te groot. Maximum is 10 MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/configurator/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload mislukt')
      onUploaded(json.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload mislukt. Probeer opnieuw.')
    } finally {
      setUploading(false)
    }
  }, [onUploaded])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
          dragging ? 'border-amber-400 bg-amber-50' : uploadUrl ? 'border-amber-300 bg-amber-50' : 'border-neutral-200 hover:border-amber-300 hover:bg-amber-50/40'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {uploadUrl ? (
          <div className="p-4">
            <div className="relative aspect-square max-h-72 mx-auto rounded-xl overflow-hidden bg-neutral-100">
              <Image src={uploadUrl} alt="Geüploade tekening" fill className="object-contain" sizes="400px" />
            </div>
            <p className="text-center text-sm text-amber-700 font-medium mt-3 flex items-center justify-center gap-1.5">
              <Check className="h-4 w-4" /> Geüpload — klik om te wijzigen
            </p>
          </div>
        ) : (
          <div className="py-16 px-8 text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                <p className="text-sm text-neutral-500">Uploaden...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Upload className="h-7 w-7 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-700">Sleep je tekening hierheen</p>
                  <p className="text-sm text-neutral-400 mt-1">of klik om te bladeren</p>
                </div>
                <p className="text-xs text-neutral-400">JPG, PNG, SVG of WebP · max. 10 MB</p>
              </div>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
          <X className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  )
}

// ── Step 2 – Kies product ─────────────────────────────────────────────────────

function StepProduct({
  selected,
  onSelect,
}: {
  selected: Product | null
  onSelect: (p: Product) => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('is_active', true)
      .not('engraving_area', 'is', null)
      .order('name')
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Er zijn nog geen producten beschikbaar voor gravure.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => {
        const primaryImage = (p.images ?? []).find((img: { is_primary: boolean }) => img.is_primary) ?? (p.images ?? [])[0]
        const isSelected = selected?.id === p.id
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 focus:outline-none ${
              isSelected
                ? 'border-amber-500 ring-4 ring-amber-100 shadow-lg'
                : 'border-neutral-100 hover:border-amber-300 hover:shadow-md'
            }`}
          >
            <div className="relative aspect-square bg-neutral-50">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-10 w-10 text-neutral-200" />
                </div>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow">
                  <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="font-semibold text-neutral-800 text-sm leading-snug">{p.name}</p>
              {p.short_description && (
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{p.short_description}</p>
              )}
              <p className="text-amber-600 font-bold text-sm mt-2">{formatPrice(p.price)}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Step 3 – Graveerlocatie ───────────────────────────────────────────────────

function StepLocation({
  product,
  uploadUrl,
  position,
  onPosition,
}: {
  product: Product
  uploadUrl: string
  position: EngravingPosition | null
  onPosition: (pos: EngravingPosition) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState>({ active: false, startX: 0, startY: 0, mode: null, initPos: null })
  // Trigger re-render when drag becomes active/inactive for cursor updates
  const [isDragging, setIsDragging] = useState(false)

  const area = product.engraving_area!
  const primaryImage = (product.images ?? []).find((img: { is_primary: boolean }) => img.is_primary) ?? (product.images ?? [])[0]

  const clamp = useCallback((pos: EngravingPosition): EngravingPosition => {
    const minW = 5, minH = 5
    let { x, y, width, height } = pos
    width  = Math.max(minW, Math.min(width,  area.width))
    height = Math.max(minH, Math.min(height, area.height))
    x = Math.max(area.x, Math.min(x, area.x + area.width  - width))
    y = Math.max(area.y, Math.min(y, area.y + area.height - height))
    return { x, y, width, height }
  }, [area])

  // Works for both MouseEvent and PointerEvent (both have clientX/clientY)
  const toPercent = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      px: ((clientX - rect.left) / rect.width)  * 100,
      py: ((clientY - rect.top)  / rect.height) * 100,
    }
  }, [])

  const applyMove = useCallback((clientX: number, clientY: number) => {
    const drag = dragRef.current
    if (!drag.active || !drag.mode) return
    const { px, py } = toPercent(clientX, clientY)
    const dx = px - drag.startX
    const dy = py - drag.startY
    const init = drag.initPos!
    let next: EngravingPosition

    if (drag.mode === 'draw') {
      next = clamp({
        x: Math.min(px, drag.startX),
        y: Math.min(py, drag.startY),
        width:  Math.abs(px - drag.startX),
        height: Math.abs(py - drag.startY),
      })
    } else if (drag.mode === 'move') {
      next = clamp({ ...init, x: init.x + dx, y: init.y + dy })
    } else if (drag.mode === 'resize-se') {
      next = clamp({ ...init, width: Math.max(5, init.width + dx), height: Math.max(5, init.height + dy) })
    } else if (drag.mode === 'resize-sw') {
      const w = Math.max(5, init.width - dx)
      next = clamp({ x: init.x + init.width - w, y: init.y, width: w, height: Math.max(5, init.height + dy) })
    } else if (drag.mode === 'resize-ne') {
      const h = Math.max(5, init.height - dy)
      next = clamp({ x: init.x, y: init.y + init.height - h, width: Math.max(5, init.width + dx), height: h })
    } else {
      // resize-nw
      const w = Math.max(5, init.width - dx)
      const h = Math.max(5, init.height - dy)
      next = clamp({ x: init.x + init.width - w, y: init.y + init.height - h, width: w, height: h })
    }
    onPosition(next)
  }, [clamp, toPercent, onPosition])

  // ── Pointer events (mouse + touch) ──────────────────────────────────────────

  const startDrag = useCallback((
    e: React.PointerEvent,
    mode: DragState['mode'],
    currentPosition: EngravingPosition | null,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const { px, py } = toPercent(e.clientX, e.clientY)
    dragRef.current = { active: true, startX: px, startY: py, mode, initPos: currentPosition }
    setIsDragging(true)
  }, [toPercent])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    e.preventDefault()
    applyMove(e.clientX, e.clientY)
  }, [applyMove])

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false
    setIsDragging(false)
  }, [])

  // Container pointer-down → draw fresh box
  const onContainerPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).dataset.handle) return
    const { px, py } = toPercent(e.clientX, e.clientY)
    // Start with a small box at tap point so it's immediately visible
    onPosition(clamp({ x: px - 5, y: py - 5, width: 10, height: 10 }))
    startDrag(e, 'draw', { x: px, y: py, width: 0, height: 0 })
  }, [toPercent, clamp, onPosition, startDrag])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <p className="text-sm text-neutral-500 text-center">
        Tik of sleep binnen het{' '}
        <span className="font-semibold text-amber-700">gele graveergebied</span>{' '}
        om de locatie te bepalen. Versleep de hoeken om het formaat aan te passen.
      </p>

      {/* Interactive container */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-neutral-100 shadow-sm select-none bg-neutral-50"
        style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'crosshair' }}
        onPointerDown={onContainerPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Product image */}
        {primaryImage ? (
          <div className="relative w-full" style={{ paddingBottom: '100%' }}>
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 672px"
              draggable={false}
            />
          </div>
        ) : (
          <div className="aspect-square bg-neutral-100 flex items-center justify-center">
            <Package className="h-16 w-16 text-neutral-200" />
          </div>
        )}

        {/* Allowed engraving area */}
        <div
          className="absolute border-2 border-dashed border-amber-400 bg-amber-400/10 pointer-events-none"
          style={{ left: `${area.x}%`, top: `${area.y}%`, width: `${area.width}%`, height: `${area.height}%` }}
        />

        {/* Selected engraving box */}
        {position && (
          <div
            className="absolute"
            style={{ left: `${position.x}%`, top: `${position.y}%`, width: `${position.width}%`, height: `${position.height}%` }}
          >
            {/* Drawing preview — draggable to move */}
            <div
              className="absolute inset-0 overflow-hidden border-2 border-amber-500 rounded opacity-75"
              data-handle="move"
              style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
              onPointerDown={(e) => startDrag(e, 'move', position)}
            >
              <Image
                src={uploadUrl}
                alt="Gravure preview"
                fill
                className="object-contain"
                sizes="200px"
                draggable={false}
              />
            </div>

            {/* Resize handles — large touch targets */}
            {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
              <div
                key={corner}
                data-handle={corner}
                // 44×44px touch target, visible dot in center
                className="absolute flex items-center justify-center"
                style={{
                  width: 44, height: 44, touchAction: 'none',
                  cursor: `${corner}-resize`,
                  ...(corner === 'nw' ? { top: -22, left: -22 } :
                     corner === 'ne' ? { top: -22, right: -22 } :
                     corner === 'sw' ? { bottom: -22, left: -22 } :
                                       { bottom: -22, right: -22 }),
                }}
                onPointerDown={(e) => startDrag(e, `resize-${corner}` as DragState['mode'], position)}
              >
                <div className="w-4 h-4 bg-white border-2 border-amber-500 rounded-sm shadow-md" />
              </div>
            ))}
          </div>
        )}
      </div>

      {position && (
        <div className="text-xs text-neutral-400 text-center">
          Positie: {Math.round(position.x)}% × {Math.round(position.y)}%
          &ensp;|&ensp;Grootte: {Math.round(position.width)}% × {Math.round(position.height)}%
        </div>
      )}
    </div>
  )
}

// ── Step 4 – Toevoegen aan winkelwagen ───────────────────────────────────────

function StepOrder({
  product,
  uploadUrl,
  position,
}: {
  product: Product
  uploadUrl: string
  position: EngravingPosition
}) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const primaryImage = (product.images ?? []).find((img: { is_primary: boolean }) => img.is_primary) ?? (product.images ?? [])[0]

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: primaryImage?.url ?? null,
      quantity: 1,
      unitPrice: product.price,
      basePrice: product.price,
      personalizations: [
        {
          fieldKey: 'gravure_upload',
          fieldLabel: 'Gravure ontwerp',
          fieldType: 'text',
          value: uploadUrl,
          displayValue: 'Geüpload ontwerp',
        },
        {
          fieldKey: 'gravure_positie',
          fieldLabel: 'Graveerlocatie',
          fieldType: 'text',
          value: JSON.stringify(position),
          displayValue: `X: ${Math.round(position.x)}%, Y: ${Math.round(position.y)}% — ${Math.round(position.width)}% × ${Math.round(position.height)}%`,
        },
      ],
    })
    router.push('/winkelwagen')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Overzicht */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 space-y-4">
        <h3 className="font-bold text-neutral-800">Overzicht</h3>
        <div className="flex gap-4 items-start">
          {primaryImage && (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-amber-100 shrink-0">
              <Image src={primaryImage.url} alt={product.name} fill className="object-cover" sizes="64px" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-800">{product.name}</p>
            <p className="text-amber-600 font-bold">{formatPrice(product.price)}</p>
            <p className="text-xs text-neutral-500 mt-1">
              Gravure op {Math.round(position.width)}% &times; {Math.round(position.height)}% van het product
            </p>
          </div>
        </div>

        <div className="border-t border-amber-100 pt-3">
          <p className="text-xs text-neutral-500 mb-2">Jouw ontwerp:</p>
          <div className="relative w-full max-h-28 rounded-xl overflow-hidden bg-white border border-amber-100">
            <Image src={uploadUrl} alt="Jouw tekening" width={400} height={112} className="object-contain w-full max-h-28" />
          </div>
        </div>

        <div className="border-t border-amber-100 pt-3 text-sm text-neutral-600 space-y-1">
          <p><span className="font-semibold">Graveerlocatie:</span> X: {Math.round(position.x)}%, Y: {Math.round(position.y)}%</p>
          <p><span className="font-semibold">Afmeting:</span> {Math.round(position.width)}% × {Math.round(position.height)}%</p>
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={handleAddToCart}>
        <ShoppingBag className="h-4 w-4" />
        Toevoegen aan winkelwagen
      </Button>
      <p className="text-xs text-neutral-400 text-center">
        Je kunt daarna nog andere producten toevoegen en afrekenen via de winkelwagen.
      </p>
    </div>
  )
}

// ── Main configurator page ────────────────────────────────────────────────────

export default function ConfiguratorPage() {
  const [step, setStep] = useState(0)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [position, setPosition] = useState<EngravingPosition | null>(null)

  const canNext = [
    !!uploadUrl,
    !!product,
    !!position,
    false, // step 3 doesn't have a next (submit goes to Stripe)
  ][step]

  const next = () => setStep(s => Math.min(s + 1, 3))
  const back = () => setStep(s => Math.max(s - 1, 0))

  // Reset position when product changes
  const handleProductSelect = (p: Product) => {
    setProduct(p)
    setPosition(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-800 tracking-tight">Gravure configurator</h1>
          <p className="text-neutral-500 mt-2 text-base md:text-lg">
            Maak jouw unieke gravure in vier eenvoudige stappen.
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl p-6 md:p-10">
          <h2 className="text-lg font-bold text-neutral-700 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center">
              {step + 1}
            </span>
            {['Upload je tekening', 'Kies een product', 'Kies de graveerlocatie', 'Bestelling plaatsen'][step]}
          </h2>

          {step === 0 && (
            <StepUpload uploadUrl={uploadUrl} onUploaded={setUploadUrl} />
          )}
          {step === 1 && (
            <StepProduct selected={product} onSelect={handleProductSelect} />
          )}
          {step === 2 && product && uploadUrl && (
            <StepLocation
              product={product}
              uploadUrl={uploadUrl}
              position={position}
              onPosition={setPosition}
            />
          )}
          {step === 3 && product && uploadUrl && position && (
            <StepOrder product={product} uploadUrl={uploadUrl} position={position} />
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={back}
                disabled={step === 0}
                className={step === 0 ? 'invisible' : ''}
              >
                <ChevronLeft className="h-4 w-4" />
                Vorige
              </Button>
              <Button
                size="md"
                onClick={next}
                disabled={!canNext}
              >
                Volgende
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <Button variant="ghost" size="sm" onClick={back}>
                <ChevronLeft className="h-4 w-4" />
                Terug
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
