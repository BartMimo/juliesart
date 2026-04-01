'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, Lock, ShoppingBag, Sparkles, RotateCcw, ChevronRight, Pencil,
} from 'lucide-react'
import { Product, PersonalizationField, PersonalizationFieldType, PersonalizationOption } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { FONTS, getFontPreviewStyle } from '@/lib/fonts'

// ─── Fallback option sets ─────────────────────────────────────────────────────

function makeFallback(list: Partial<PersonalizationOption>[]): PersonalizationOption[] {
  return list.map((o, i) => ({
    id: `fb-${i}`,
    field_id: '',
    value: o.value ?? '',
    label: o.label ?? '',
    image_url: o.image_url ?? null,
    color_hex: o.color_hex ?? null,
    font_preview: o.font_preview ?? null,
    price_modifier: 0,
    sort_order: i,
    is_active: true,
  }))
}

const FALLBACK_FONTS = makeFallback(
  FONTS.map(f => ({ value: f.value, label: f.name, font_preview: f.family }))
)

const FALLBACK_ICONS = makeFallback([
  { value: 'ster',      label: '⭐ Ster' },
  { value: 'hartje',    label: '❤️ Hartje' },
  { value: 'vlinder',   label: '🦋 Vlinder' },
  { value: 'bloem',     label: '🌸 Bloem' },
  { value: 'maan',      label: '🌙 Maantje' },
  { value: 'regenboog', label: '🌈 Regenboog' },
  { value: 'kroon',     label: '👑 Kroontje' },
  { value: 'geen',      label: '✕ Geen logo' },
])

const FALLBACK_COLORS = makeFallback([
  { value: 'naturel',  label: 'Naturel',     color_hex: '#c8a87a' },
  { value: 'wit',      label: 'Wit',         color_hex: '#f5f0e8' },
  { value: 'roze',     label: 'Zacht roze',  color_hex: '#f9c8c8' },
  { value: 'mint',     label: 'Mintgroen',   color_hex: '#b4e0c8' },
  { value: 'blauw',    label: 'Lichtblauw',  color_hex: '#b8d8f0' },
  { value: 'lavendel', label: 'Lavendel',    color_hex: '#d0c0e8' },
  { value: 'geel',     label: 'Geel',        color_hex: '#f5e0a0' },
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEmojiAndText(label: string): { emoji: string; text: string } {
  const m = label.match(/^([\p{Emoji}\p{Emoji_Presentation}]+)\s*/u)
  if (m) return { emoji: m[1], text: label.slice(m[0].length).trim() }
  return { emoji: '', text: label }
}

function getActiveOptions(field: PersonalizationField, fallback: PersonalizationOption[]): PersonalizationOption[] {
  const db = (field.options ?? []).filter(o => o.is_active).sort((a, b) => a.sort_order - b.sort_order)
  return db.length > 0 ? db : fallback
}

function isLightColor(hex: string | null): boolean {
  if (!hex) return false
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 180
}

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEP_META: Record<string, { icon: string; subtitle: string }> = {
  product: { icon: '🎁', subtitle: 'Welk product wil je personaliseren?' },
  font:    { icon: '✍️', subtitle: 'Hoe ziet de naam eruit op jouw product?' },
  text:    { icon: '💬', subtitle: 'Wiens naam of tekst komt erop?' },
  icon:    { icon: '✨', subtitle: 'Voeg een persoonlijk symbolisch detail toe' },
  color:   { icon: '🎨', subtitle: 'In welke kleur wil je jouw product?' },
  select:  { icon: '📋', subtitle: 'Maak een keuze' },
  radio:   { icon: '📋', subtitle: 'Maak een keuze' },
  size:    { icon: '📏', subtitle: 'Kies de gewenste maat' },
}

type StepType = 'product' | PersonalizationFieldType

interface StepDef {
  id: string
  type: StepType
  label: string
  field: PersonalizationField | null
}

// ─── Main configurator ────────────────────────────────────────────────────────

export function Winkel3Configurator({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  const selectedProduct = products.find(p => p.id === productId) ?? null

  const activeFields = useMemo(() => {
    if (!selectedProduct) return []
    return (selectedProduct.personalization_fields ?? [])
      .filter(f => f.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [selectedProduct])

  const steps: StepDef[] = useMemo(() => [
    { id: '__product__', type: 'product', label: 'Kies je product', field: null },
    ...activeFields.map(f => ({ id: f.id, type: f.type as StepType, label: f.label, field: f })),
  ], [activeFields])

  const scrollToStep = (index: number) => {
    setTimeout(() => {
      const el = stepRefs.current[index]
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 110
      window.scrollTo({ top, behavior: 'smooth' })
    }, 200)
  }

  const handleProductSelect = (id: string) => {
    setProductId(id)
    setFieldValues({})
    setCurrentStepIndex(1)
    setDone(false)
    scrollToStep(1)
  }

  const handleFieldComplete = (key: string, value: string) => {
    const newValues = { ...fieldValues, [key]: value }
    setFieldValues(newValues)
    const nextIndex = currentStepIndex + 1
    if (nextIndex >= steps.length) {
      setDone(true)
    } else {
      setCurrentStepIndex(nextIndex)
      scrollToStep(nextIndex)
    }
  }

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index)
    setDone(false)
    scrollToStep(index)
  }

  const handleReset = () => {
    setProductId('')
    setFieldValues({})
    setCurrentStepIndex(0)
    setDone(false)
    scrollToStep(0)
  }

  // Derived values for preview panel
  const fontField = activeFields.find(f => f.type === 'font')
  const fontOptions = fontField ? getActiveOptions(fontField, FALLBACK_FONTS) : []
  const selectedFontOption = fontField ? fontOptions.find(o => o.value === fieldValues[fontField.key]) : null
  const fontFamily = selectedFontOption?.font_preview ?? undefined

  const textField = activeFields.find(f => f.type === 'text')
  const nameValue = textField ? (fieldValues[textField.key] ?? '') : ''

  const colorField = activeFields.find(f => f.type === 'color')
  const colorOptions = colorField ? getActiveOptions(colorField, FALLBACK_COLORS) : []
  const selectedColorOption = colorField ? (colorOptions.find(o => o.value === fieldValues[colorField.key]) ?? null) : null

  const iconField = activeFields.find(f => f.type === 'icon')
  const iconOptions = iconField ? getActiveOptions(iconField, FALLBACK_ICONS) : []
  const selectedIconOption = iconField ? (iconOptions.find(o => o.value === fieldValues[iconField.key]) ?? null) : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>

      <div className="container-brand py-10 lg:py-14">
        <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] gap-10 xl:gap-14 items-start">

          {/* ── Steps column ─────────────────────────── */}
          <div>
            {steps.map((step, index) => {
              const meta = STEP_META[step.type] ?? { icon: '📝', subtitle: '' }
              const isCompleted = index < currentStepIndex || (done && index < steps.length)
              const isActive = index === currentStepIndex && !done
              const isLocked = index > currentStepIndex && !done
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} ref={el => { stepRefs.current[index] = el }}>
                  <StepWrapper
                    index={index}
                    label={step.label}
                    icon={meta.icon}
                    subtitle={meta.subtitle}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    isLocked={isLocked}
                    isLast={isLast}
                    onEdit={isCompleted ? () => handleGoToStep(index) : undefined}
                  >
                    <AnimatePresence mode="wait">
                      {/* ── Active content ── */}
                      {isActive && (
                        <motion.div
                          key="active"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-5 pb-3">
                            {step.type === 'product' && (
                              <ProductStep products={products} selected={productId} onSelect={handleProductSelect} />
                            )}
                            {step.type === 'font' && step.field && (
                              <FontStep
                                field={step.field}
                                selected={fieldValues[step.field.key] ?? ''}
                                namePreview={nameValue || 'Uw naam'}
                                onSelect={v => handleFieldComplete(step.field!.key, v)}
                              />
                            )}
                            {step.type === 'text' && step.field && (
                              <NameStep
                                field={step.field}
                                value={fieldValues[step.field.key] ?? ''}
                                onChange={v => setFieldValues(fv => ({ ...fv, [step.field!.key]: v }))}
                                onSubmit={() => {
                                  const v = (fieldValues[step.field!.key] ?? '').trim()
                                  if (v) handleFieldComplete(step.field!.key, v)
                                }}
                                fontFamily={fontFamily}
                              />
                            )}
                            {step.type === 'icon' && step.field && (
                              <IconStep
                                field={step.field}
                                selected={fieldValues[step.field.key] ?? ''}
                                onSelect={v => handleFieldComplete(step.field!.key, v)}
                              />
                            )}
                            {step.type === 'color' && step.field && (
                              <ColorStep
                                field={step.field}
                                selected={fieldValues[step.field.key] ?? ''}
                                onSelect={v => handleFieldComplete(step.field!.key, v)}
                              />
                            )}
                            {(step.type === 'select' || step.type === 'radio' || step.type === 'size') && step.field && (
                              <GenericOptionStep
                                field={step.field}
                                selected={fieldValues[step.field.key] ?? ''}
                                onSelect={v => handleFieldComplete(step.field!.key, v)}
                              />
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* ── Completed summary ── */}
                      {isCompleted && (
                        <motion.div
                          key="completed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pt-2 pb-1"
                        >
                          {step.type === 'product' && selectedProduct && (
                            <ProductCompletedSummary product={selectedProduct} />
                          )}
                          {step.type !== 'product' && step.field && fieldValues[step.field.key] && (
                            <FieldCompletedSummary
                              field={step.field}
                              value={fieldValues[step.field.key]}
                              fontFamily={fontFamily}
                              nameValue={nameValue}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </StepWrapper>
                </div>
              )
            })}

            {/* Mobile: final CTA after done */}
            <AnimatePresence>
              {done && selectedProduct && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="lg:hidden mt-6"
                >
                  <MobileOrderCTA
                    product={selectedProduct}
                    fieldValues={fieldValues}
                    activeFields={activeFields}
                    onReset={handleReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sticky preview column ─────────────────── */}
          <div className="hidden lg:block sticky top-24">
            <PreviewPanel
              product={selectedProduct}
              fieldValues={fieldValues}
              activeFields={activeFields}
              fontFamily={fontFamily}
              nameValue={nameValue}
              selectedColorOption={selectedColorOption}
              selectedIconOption={selectedIconOption}
              done={done}
              onReset={handleReset}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Hero header ──────────────────────────────────────────────────────────────

function HeroHeader() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #fdf6ee 0%, #f8ede0 45%, #fef0f5 100%)',
        borderBottom: '1px solid rgba(168,112,72,0.08)',
      }}
    >
      <div className="container-brand py-12 md:py-16 relative z-10">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-7">
          <Link href="/" className="hover:text-brand-500 transition-colors font-semibold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-600 font-semibold">Maak je cadeau</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 text-brand-600 text-[11px] font-black px-4 py-1.5 rounded-full mb-5 border border-brand-100/80 tracking-widest uppercase shadow-soft backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Persoonlijke cadeausamensteller
          </div>
          <h1 className="heading-display text-4xl sm:text-5xl text-neutral-800 leading-[1.08] mb-3">
            Maak het{' '}
            <span className="text-gradient-brand">jouw eigen</span>
          </h1>
          <p className="text-neutral-500 text-base sm:text-lg leading-relaxed max-w-md">
            Doorloop de stappen en stel stap voor stap jouw unieke houten cadeau samen — helemaal op naam.
          </p>
        </motion.div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.12] blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #a87048, transparent 70%)' }} />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #c080a0, transparent 70%)' }} />
    </div>
  )
}

// ─── Step wrapper ─────────────────────────────────────────────────────────────

function StepWrapper({
  index, label, icon, subtitle,
  isActive, isCompleted, isLocked, isLast,
  onEdit, children,
}: {
  index: number
  label: string
  icon: string
  subtitle: string
  isActive: boolean
  isCompleted: boolean
  isLocked: boolean
  isLast: boolean
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4 sm:gap-5 mb-3">
      {/* Badge + connector line */}
      <div className="flex flex-col items-center shrink-0 pt-1.5">
        <motion.div
          animate={
            isActive
              ? { scale: [1, 1.07, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
              : { scale: 1 }
          }
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 transition-all duration-350',
            isCompleted
              ? 'bg-brand-500 border-brand-500 text-white shadow-[0_2px_12px_rgba(168,112,72,0.4)]'
              : isActive
              ? 'bg-white border-brand-400 text-brand-600 shadow-[0_0_0_4px_rgba(168,112,72,0.12)]'
              : 'bg-white border-neutral-200 text-neutral-300'
          )}
        >
          {isCompleted
            ? <Check className="h-4 w-4" strokeWidth={3} />
            : isLocked
            ? <Lock className="h-3.5 w-3.5" />
            : <span>{index + 1}</span>
          }
        </motion.div>
        {!isLast && (
          <div className={cn(
            'w-px flex-1 mt-2 min-h-8 rounded-full transition-all duration-500',
            isCompleted ? 'bg-brand-200' : 'bg-neutral-200'
          )} />
        )}
      </div>

      {/* Card */}
      <div className={cn(
        'flex-1 min-w-0 rounded-2xl border transition-all duration-300 mb-2',
        isActive
          ? 'bg-white border-brand-200 shadow-[0_4px_28px_rgba(168,112,72,0.1)]'
          : isCompleted
          ? 'bg-white border-neutral-100 shadow-[0_1px_6px_rgba(0,0,0,0.04)]'
          : 'bg-white/50 border-neutral-100 opacity-40 pointer-events-none select-none'
      )}>
        {/* Card header */}
        <div className="px-5 pt-4 pb-0 flex items-center gap-3">
          <span className="text-lg leading-none shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className={cn(
                'font-bold text-sm sm:text-[15px] leading-tight',
                isActive ? 'text-neutral-800' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
              )}>
                {label}
              </h2>
              {isActive && (
                <span className="text-[10px] font-black tracking-widest uppercase text-brand-500 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                  Nu
                </span>
              )}
            </div>
            {subtitle && isActive && (
              <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{subtitle}</p>
            )}
          </div>
          {isCompleted && onEdit && (
            <button
              onClick={onEdit}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-600 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-brand-50"
            >
              <Pencil className="h-3 w-3" />
              Wijzig
            </button>
          )}
        </div>

        {/* Card body */}
        <div className="px-5 pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Completed summaries ──────────────────────────────────────────────────────

function ProductCompletedSummary({ product }: { product: Product }) {
  const primaryImg = product.images?.find(img => img.is_primary) ?? product.images?.[0]
  return (
    <div className="flex items-center gap-3">
      {primaryImg ? (
        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-neutral-100">
          <Image src={primaryImg.url} alt={product.name} fill className="object-cover" sizes="40px" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 text-lg">🎁</div>
      )}
      <div>
        <p className="font-bold text-neutral-700 text-sm leading-tight">{product.name}</p>
        <p className="text-xs text-brand-500 font-semibold">{formatPrice(product.price)}</p>
      </div>
    </div>
  )
}

function FieldCompletedSummary({
  field, value, fontFamily, nameValue,
}: {
  field: PersonalizationField
  value: string
  fontFamily?: string
  nameValue: string
}) {
  const option = (field.options ?? []).find(o => o.value === value)
  const displayLabel = option?.label ?? value

  if (field.type === 'color') {
    return (
      <div className="flex items-center gap-2.5">
        <span
          className="w-4 h-4 rounded-full border border-neutral-200 shrink-0"
          style={{ backgroundColor: option?.color_hex ?? '#ccc' }}
        />
        <span className="text-sm font-semibold text-neutral-700">{displayLabel}</span>
      </div>
    )
  }

  if (field.type === 'font') {
    const ff = option?.font_preview ?? fontFamily
    return (
      <div className="flex items-center gap-2.5">
        <span className="text-lg text-brand-600" style={getFontPreviewStyle(ff)}>
          {nameValue || displayLabel}
        </span>
        <span className="text-xs text-neutral-400">({displayLabel})</span>
      </div>
    )
  }

  if (field.type === 'text') {
    return <span className="text-sm font-bold text-neutral-700">"{value}"</span>
  }

  if (field.type === 'icon') {
    const { emoji, text } = getEmojiAndText(displayLabel)
    return (
      <div className="flex items-center gap-2">
        {option?.image_url ? (
          <Image src={option.image_url} alt={text} width={20} height={20} className="object-contain" />
        ) : (
          <span className="text-base">{emoji}</span>
        )}
        <span className="text-sm font-semibold text-neutral-700">{text || displayLabel}</span>
      </div>
    )
  }

  return <span className="text-sm font-semibold text-neutral-700">{displayLabel}</span>
}

// ─── Product step ─────────────────────────────────────────────────────────────

function ProductStep({
  products, selected, onSelect,
}: {
  products: Product[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
        Scroll door de collectie en kies het product dat jij wil personaliseren.
      </p>

      <div
        className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, i) => {
          const img = product.images?.find(img => img.is_primary) ?? product.images?.[0]
          const isSelected = selected === product.id

          return (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              type="button"
              onClick={() => onSelect(product.id)}
              className={cn(
                'snap-center shrink-0 w-44 sm:w-48 rounded-2xl border-2 overflow-hidden text-left transition-all duration-300 group',
                isSelected
                  ? 'border-brand-500 shadow-[0_8px_32px_rgba(168,112,72,0.28)] scale-[1.03]'
                  : 'border-transparent bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-brand-200 hover:shadow-[0_4px_20px_rgba(168,112,72,0.14)] hover:scale-[1.01]'
              )}
            >
              {/* Image */}
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg, #faf6f0, #f0e8d8)' }}
              >
                {img ? (
                  <Image
                    src={img.url}
                    alt={img.alt ?? product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="192px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl opacity-30">🎀</span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-sm z-10">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3.5 bg-white">
                <p className="font-bold text-neutral-800 text-xs leading-tight mb-1.5 line-clamp-2">{product.name}</p>
                <p className="text-brand-600 font-extrabold text-sm">{formatPrice(product.price)}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {products.length > 3 && (
        <p className="text-[11px] text-neutral-300 mt-1.5 text-center tracking-wide">← scroll voor meer producten →</p>
      )}
    </div>
  )
}

// ─── Font step ────────────────────────────────────────────────────────────────

function FontStep({
  field, selected, namePreview, onSelect,
}: {
  field: PersonalizationField
  selected: string
  namePreview: string
  onSelect: (v: string) => void
}) {
  const options = getActiveOptions(field, FALLBACK_FONTS)

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
        {field.help_text ?? 'Kies het lettertype dat op jouw product komt.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={cn(
              'relative rounded-2xl border-2 overflow-hidden transition-all duration-250 text-left',
              selected === opt.value
                ? 'border-brand-500 shadow-[0_6px_20px_rgba(168,112,72,0.2)]'
                : 'border-neutral-100 bg-white hover:border-brand-200 hover:shadow-soft'
            )}
          >
            {/* Preview */}
            {opt.image_url ? (
              <div className="relative h-20 bg-neutral-50">
                <Image src={opt.image_url} alt={opt.label} fill className="object-contain p-3" sizes="280px" />
              </div>
            ) : (
              <div
                className="h-20 flex items-center justify-center px-4 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #fdf6ee, #f5ede0)' }}
              >
                <span
                  className="text-2xl sm:text-3xl text-brand-700 text-center leading-tight truncate max-w-full"
                  style={getFontPreviewStyle(opt.font_preview)}
                >
                  {namePreview}
                </span>
              </div>
            )}

            {/* Label */}
            <div className="px-4 py-2.5 bg-white flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600">{opt.label}</span>
              {opt.price_modifier !== 0 && (
                <span className="text-xs text-neutral-400 ml-2">
                  {opt.price_modifier > 0 ? '+' : ''}{formatPrice(Math.abs(opt.price_modifier))}
                </span>
              )}
              {selected === opt.value && (
                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center ml-auto">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ─── Name step ────────────────────────────────────────────────────────────────

function NameStep({
  field, value, onChange, onSubmit, fontFamily,
}: {
  field: PersonalizationField
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  fontFamily?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const maxLength = field.max_length ?? 24

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 360)
  }, [])

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
        {field.help_text ?? 'Voer de naam of tekst in die op het product moet komen.'}
      </p>

      <div className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit() }}
            placeholder={field.placeholder ?? 'bijv. Sophie'}
            maxLength={maxLength}
            className={cn(
              'w-full px-5 py-4 rounded-2xl border-2 bg-white text-neutral-800 font-semibold text-base',
              'placeholder:font-normal placeholder:text-neutral-300',
              'focus:outline-none transition-all duration-200',
              value
                ? 'border-brand-400 shadow-[0_0_0_4px_rgba(168,112,72,0.08)]'
                : 'border-neutral-200 hover:border-brand-200 focus:border-brand-400 focus:shadow-[0_0_0_4px_rgba(168,112,72,0.08)]'
            )}
            style={{ fontFamily: fontFamily ?? 'inherit' }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-neutral-300 font-medium tabular-nums pointer-events-none">
            {value.length}/{maxLength}
          </span>
        </div>

        {/* Live preview */}
        <AnimatePresence>
          {value.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center py-5 px-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #fdf6ee, #f0e4d0)' }}
            >
              <span
                className="text-3xl sm:text-4xl text-brand-700 text-center leading-tight"
                style={{ fontFamily: fontFamily ?? 'inherit' }}
              >
                {value}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className={cn(
            'w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200',
            value.trim()
              ? 'bg-brand-500 text-white shadow-[0_4px_16px_rgba(168,112,72,0.3)] hover:bg-brand-600 hover:shadow-[0_6px_20px_rgba(168,112,72,0.4)] hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
          )}
        >
          {value.trim() ? `Bevestig: "${value}"` : 'Vul eerst een naam in'}
        </button>
      </div>
    </div>
  )
}

// ─── Icon step ────────────────────────────────────────────────────────────────

function IconStep({
  field, selected, onSelect,
}: {
  field: PersonalizationField
  selected: string
  onSelect: (v: string) => void
}) {
  const options = getActiveOptions(field, FALLBACK_ICONS)

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
        {field.help_text ?? "Kies een logo als persoonlijk detail, of ga zonder."}
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
        {options.map((opt, i) => {
          const { emoji, text } = getEmojiAndText(opt.label)
          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.28 }}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                'relative aspect-square rounded-2xl border-2 overflow-hidden flex flex-col items-center justify-center gap-1 transition-all duration-250',
                selected === opt.value
                  ? 'border-brand-500 bg-brand-50 shadow-[0_4px_16px_rgba(168,112,72,0.2)] scale-[1.05]'
                  : 'border-neutral-100 bg-white hover:border-brand-200 hover:scale-[1.02] shadow-[0_1px_4px_rgba(0,0,0,0.05)]'
              )}
            >
              {opt.image_url ? (
                <div className="relative w-full h-full p-2">
                  <Image src={opt.image_url} alt={opt.label} fill className="object-contain p-1" sizes="80px" />
                </div>
              ) : (
                <>
                  <span className="text-xl leading-none">{emoji || '✨'}</span>
                  <span className="text-[9px] font-semibold text-neutral-500 text-center leading-tight px-0.5">{text}</span>
                </>
              )}
              {selected === opt.value && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Color step ───────────────────────────────────────────────────────────────

function ColorStep({
  field, selected, onSelect,
}: {
  field: PersonalizationField
  selected: string
  onSelect: (v: string) => void
}) {
  const options = getActiveOptions(field, FALLBACK_COLORS)

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
        {field.help_text ?? 'In welke kleur wil je jouw product ontvangen?'}
      </p>
      <div className="flex flex-wrap gap-4">
        {options.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.28 }}
            type="button"
            onClick={() => onSelect(opt.value)}
            title={opt.label}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                'w-11 h-11 rounded-full transition-all duration-200 flex items-center justify-center',
                selected === opt.value
                  ? 'ring-2 ring-offset-2 ring-brand-400 scale-110 shadow-md'
                  : 'hover:scale-110 ring-2 ring-transparent ring-offset-2'
              )}
              style={{
                backgroundColor: opt.color_hex ?? '#ccc',
                border: '2px solid rgba(0,0,0,0.06)',
              }}
            >
              {selected === opt.value && (
                <Check
                  className="h-4 w-4 drop-shadow"
                  style={{ color: isLightColor(opt.color_hex) ? '#a87048' : 'white' }}
                  strokeWidth={3}
                />
              )}
            </div>
            <span className={cn(
              'text-[10px] font-semibold text-center leading-tight max-w-[52px]',
              selected === opt.value ? 'text-brand-600' : 'text-neutral-400'
            )}>
              {opt.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ─── Generic option step ──────────────────────────────────────────────────────

function GenericOptionStep({
  field, selected, onSelect,
}: {
  field: PersonalizationField
  selected: string
  onSelect: (v: string) => void
}) {
  const options = (field.options ?? []).filter(o => o.is_active).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div>
      {field.help_text && <p className="text-sm text-neutral-500 mb-4">{field.help_text}</p>}
      <div className="flex flex-wrap gap-2.5">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={cn(
              'px-5 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all duration-200',
              selected === opt.value
                ? 'border-brand-500 bg-brand-500 text-white shadow-soft'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-300'
            )}
          >
            {opt.label}
            {opt.price_modifier !== 0 && (
              <span className="ml-1 font-normal opacity-75 text-xs">
                ({opt.price_modifier > 0 ? '+' : ''}{formatPrice(Math.abs(opt.price_modifier))})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Preview panel (desktop sticky) ──────────────────────────────────────────

function PreviewPanel({
  product, fieldValues, activeFields,
  fontFamily, nameValue,
  selectedColorOption, selectedIconOption,
  done, onReset,
}: {
  product: Product | null
  fieldValues: Record<string, string>
  activeFields: PersonalizationField[]
  fontFamily?: string
  nameValue: string
  selectedColorOption: PersonalizationOption | null
  selectedIconOption: PersonalizationOption | null
  done: boolean
  onReset: () => void
}) {
  const primaryImg = product?.images?.find(img => img.is_primary) ?? product?.images?.[0]
  const completedFields = activeFields.filter(f => fieldValues[f.key])

  return (
    <div className="rounded-3xl overflow-hidden border border-neutral-100 shadow-[0_8px_48px_rgba(0,0,0,0.08)] bg-white">
      {/* Product image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #faf6f0, #f0e8d8)' }}
      >
        {primaryImg ? (
          <Image
            src={primaryImg.url}
            alt={primaryImg.alt ?? product?.name ?? ''}
            fill
            className="object-cover transition-all duration-700"
            sizes="420px"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-1">
              <Sparkles className="h-7 w-7 text-brand-400" />
            </div>
            <p className="font-bold text-neutral-400 text-sm">Jouw ontwerp verschijnt hier</p>
            <p className="text-xs text-neutral-300 leading-relaxed">Begin met stap 1 — kies je product</p>
          </div>
        )}

        {/* Color tint overlay */}
        {selectedColorOption?.color_hex && (
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{ backgroundColor: selectedColorOption.color_hex, opacity: 0.18, mixBlendMode: 'multiply' }}
          />
        )}

        {/* Name overlay */}
        <AnimatePresence>
          {nameValue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35 }}
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-10"
            >
              <p
                className="text-white text-2xl text-center drop-shadow-lg leading-tight"
                style={{ fontFamily: fontFamily ?? 'inherit' }}
              >
                {nameValue}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon badge */}
        <AnimatePresence>
          {selectedIconOption && selectedIconOption.value !== 'geen' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 200 }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/92 backdrop-blur-sm flex items-center justify-center shadow-md text-xl border border-white/60"
            >
              {selectedIconOption.image_url ? (
                <Image
                  src={selectedIconOption.image_url}
                  alt={selectedIconOption.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              ) : (
                <span>{getEmojiAndText(selectedIconOption.label).emoji}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info section */}
      <div className="p-5">
        {/* Product name */}
        {product ? (
          <div className="mb-4">
            {product.category?.name && (
              <p className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-1">
                {product.category.name}
              </p>
            )}
            <h3 className="font-bold text-neutral-800 text-lg leading-tight">{product.name}</h3>
          </div>
        ) : (
          <div className="mb-4">
            <p className="font-bold text-neutral-300 text-base">Nog geen product gekozen</p>
          </div>
        )}

        {/* Completed selections */}
        {completedFields.length > 0 && (
          <div className="space-y-2 mb-4 pb-4 border-b border-neutral-100">
            {completedFields.map(f => {
              const val = fieldValues[f.key]
              const option = (f.options ?? []).find(o => o.value === val)
              const display = option?.label ?? val

              return (
                <div key={f.key} className="flex items-center gap-2.5 text-sm">
                  <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-neutral-400 text-xs w-20 shrink-0">{f.label}</span>
                  {f.type === 'color' && option?.color_hex && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-neutral-100 shrink-0"
                      style={{ backgroundColor: option.color_hex }}
                    />
                  )}
                  {f.type === 'font' && option?.font_preview ? (
                    <span className="font-semibold text-neutral-700 text-sm" style={getFontPreviewStyle(option.font_preview)}>
                      {nameValue || display}
                    </span>
                  ) : (
                    <span className="font-semibold text-neutral-700 text-xs truncate">{display}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Price + CTA */}
        {product && (
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-neutral-800">{formatPrice(product.price)}</span>
              <span className="text-xs text-neutral-400">incl. BTW</span>
            </div>

            <button
              type="button"
              disabled={!done}
              className={cn(
                'w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300',
                done
                  ? 'bg-brand-500 text-white shadow-[0_4px_20px_rgba(168,112,72,0.32)] hover:bg-brand-600 hover:shadow-[0_6px_28px_rgba(168,112,72,0.42)] hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {done ? 'Toevoegen aan winkelwagen' : 'Stel je cadeau samen…'}
            </button>

            {done && (
              <button
                type="button"
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Opnieuw beginnen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Mobile order CTA ─────────────────────────────────────────────────────────

function MobileOrderCTA({
  product, fieldValues, activeFields, onReset,
}: {
  product: Product
  fieldValues: Record<string, string>
  activeFields: PersonalizationField[]
  onReset: () => void
}) {
  const completedFields = activeFields.filter(f => fieldValues[f.key])

  return (
    <div className="rounded-3xl overflow-hidden border border-brand-100 shadow-[0_8px_40px_rgba(168,112,72,0.14)]">
      <div
        className="px-6 py-5 text-center"
        style={{ background: 'linear-gradient(135deg, #a87048, #c49060)' }}
      >
        <h2 className="text-white font-bold text-lg">Klaar om te bestellen!</h2>
        <p className="text-white/70 text-sm mt-0.5">{product.name}</p>
      </div>

      <div className="bg-white px-6 py-4 divide-y divide-neutral-50">
        {completedFields.map(f => {
          const val = fieldValues[f.key]
          const option = (f.options ?? []).find(o => o.value === val)
          const display = option?.label ?? val
          return (
            <div key={f.key} className="flex items-center gap-3 py-2.5">
              <Check className="h-3.5 w-3.5 text-brand-400 shrink-0" />
              <span className="text-xs text-neutral-400 w-20 shrink-0">{f.label}</span>
              {option?.color_hex && (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-neutral-100 shrink-0"
                  style={{ backgroundColor: option.color_hex }}
                />
              )}
              <span className="text-sm font-semibold text-neutral-700 truncate">{display}</span>
            </div>
          )
        })}
      </div>

      <div className="bg-neutral-50 px-6 py-5 space-y-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-black text-neutral-800">{formatPrice(product.price)}</span>
          <span className="text-xs text-neutral-400">incl. BTW & gratis bezorging</span>
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold bg-brand-500 text-white shadow-[0_4px_20px_rgba(168,112,72,0.32)] hover:bg-brand-600 transition-all active:scale-[0.99]"
        >
          <ShoppingBag className="h-5 w-5" />
          Toevoegen aan winkelwagen
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Opnieuw beginnen
        </button>
      </div>
    </div>
  )
}
