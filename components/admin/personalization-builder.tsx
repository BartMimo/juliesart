'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react'
import { PersonalizationField, PersonalizationOption, PersonalizationFieldType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { FIELD_TYPES } from '@/lib/constants'
import { DEFAULT_FONTS } from '@/lib/fonts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

interface PersonalizationBuilderProps {
  productId: string
  fields: PersonalizationField[]
  onFieldsChange: (fields: PersonalizationField[]) => void
}

const OPTION_TYPES: PersonalizationFieldType[] = ['select', 'radio', 'color', 'font', 'icon', 'size']

export function PersonalizationBuilder({ productId, fields, onFieldsChange }: PersonalizationBuilderProps) {
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const supabase = createClient()

  const sorted = [...fields].sort((a, b) => a.sort_order - b.sort_order)

  // ── Add field ──────────────────────────────────────────────────────────────

  const addField = async () => {
    setSaving(true)
    const { data, error } = await supabase
      .from('personalization_fields')
      .insert({
        product_id: productId,
        type: 'text',
        key: `veld_${Date.now()}`,
        label: 'Nieuw veld',
        is_required: true,
        sort_order: fields.length,
      })
      .select('*, options:personalization_options(*)')
      .single()

    if (error) {
      toast.error('Toevoegen mislukt', error.message)
    } else if (data) {
      onFieldsChange([...fields, { ...data, options: data.options ?? [] }])
      setExpandedFieldId(data.id)
      toast.success('Veld toegevoegd')
    }
    setSaving(false)
  }

  // ── Update field ───────────────────────────────────────────────────────────

  const updateField = async (fieldId: string, updates: Partial<PersonalizationField>) => {
    // Optimistic update for instant UI
    onFieldsChange(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f))

    const { error } = await supabase
      .from('personalization_fields')
      .update(updates)
      .eq('id', fieldId)

    if (error) {
      toast.error('Opslaan mislukt', error.message)
      return
    }

    // Auto-fill metadata and options when type is switched to 'font'
    if (updates.type === 'font') {
      const field = fields.find(f => f.id === fieldId)

      // Pre-fill field metadata if still at generated defaults
      const metaUpdates: Partial<PersonalizationField> = {}
      if (field?.key?.startsWith('veld_')) metaUpdates.key = 'lettertype'
      if (field?.label === 'Nieuw veld') {
        metaUpdates.label = 'Lettertype'
        metaUpdates.help_text = 'Kies het lettertype voor de naam op het doosje.'
      }
      if (Object.keys(metaUpdates).length > 0) {
        await supabase.from('personalization_fields').update(metaUpdates).eq('id', fieldId)
      }

      const hasOptions = (field?.options ?? []).filter(o => o.is_active).length > 0
      if (!hasOptions) {
        const defaults = DEFAULT_FONTS.map((f, i) => ({
          label: f.label, value: f.value, font_preview: f.family, sort_order: i,
        }))

        const { data: inserted, error: optErr } = await supabase
          .from('personalization_options')
          .insert(defaults.map(d => ({ ...d, field_id: fieldId })))
          .select()

        if (optErr) {
          toast.error('Standaard lettertypes toevoegen mislukt', optErr.message)
        } else if (inserted) {
          onFieldsChange(
            fields.map(f => f.id === fieldId
              ? { ...f, ...updates, ...metaUpdates, options: [...(f.options ?? []), ...inserted] }
              : f
            )
          )
          toast.success('Standaard lettertypes toegevoegd')
        }
      } else if (Object.keys(metaUpdates).length > 0) {
        onFieldsChange(fields.map(f => f.id === fieldId ? { ...f, ...updates, ...metaUpdates } : f))
      }
    }

    // Auto-fill metadata and options when type is switched to 'icon'
    if (updates.type === 'icon') {
      const field = fields.find(f => f.id === fieldId)

      const metaUpdates: Partial<PersonalizationField> = {}
      if (field?.key?.startsWith('veld_')) metaUpdates.key = 'icoon'
      if (field?.label === 'Nieuw veld') {
        metaUpdates.label = 'Icoon'
        metaUpdates.help_text = 'Kies het logo dat op het product wordt gegraveerd.'
      }
      if (Object.keys(metaUpdates).length > 0) {
        await supabase.from('personalization_fields').update(metaUpdates).eq('id', fieldId)
      }

      const hasOptions = (field?.options ?? []).filter(o => o.is_active).length > 0
      if (!hasOptions) {
        const defaults = [
          { label: 'Hartje',     value: 'hartje' },
          { label: 'Bloemetje',  value: 'bloemetje' },
          { label: 'Dinosaurus', value: 'dinosaurus' },
          { label: 'Aapje',     value: 'aapje' },
          { label: 'Beertje',   value: 'beertje' },
          { label: 'Traktor',   value: 'traktor' },
        ]

        const { data: inserted, error: optErr } = await supabase
          .from('personalization_options')
          .insert(defaults.map((d, i) => ({ ...d, field_id: fieldId, sort_order: i })))
          .select()

        if (optErr) {
          toast.error('Standaard iconen toevoegen mislukt', optErr.message)
        } else if (inserted) {
          onFieldsChange(
            fields.map(f => f.id === fieldId
              ? { ...f, ...updates, ...metaUpdates, options: [...(f.options ?? []), ...inserted] }
              : f
            )
          )
          toast.success('Standaard iconen toegevoegd')
        }
      } else if (Object.keys(metaUpdates).length > 0) {
        onFieldsChange(fields.map(f => f.id === fieldId ? { ...f, ...updates, ...metaUpdates } : f))
      }
    }
  }

  // ── Delete field ───────────────────────────────────────────────────────────

  const deleteField = async (fieldId: string) => {
    if (!confirm('Weet je zeker dat je dit veld wil verwijderen? Alle bijbehorende opties worden ook verwijderd.')) return

    const { error } = await supabase
      .from('personalization_fields')
      .delete()
      .eq('id', fieldId)

    if (error) {
      toast.error('Verwijderen mislukt', error.message)
    } else {
      onFieldsChange(fields.filter(f => f.id !== fieldId))
      toast.success('Veld verwijderd')
    }
  }

  // ── Move field up/down ─────────────────────────────────────────────────────

  const moveField = async (fieldId: string, direction: 'up' | 'down') => {
    const idx = sorted.findIndex(f => f.id === fieldId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === sorted.length - 1) return

    // Reorder the array, then assign sequential sort_orders 0,1,2…
    const reordered = [...sorted]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]

    const withNewOrder = reordered.map((f, i) => ({ ...f, sort_order: i }))
    onFieldsChange(withNewOrder)

    const updates = withNewOrder.map(f =>
      supabase.from('personalization_fields').update({ sort_order: f.sort_order }).eq('id', f.id)
    )
    const results = await Promise.all(updates)
    const failed = results.find(r => r.error)
    if (failed?.error) toast.error('Volgorde opslaan mislukt', failed.error.message)
  }

  // ── Add option ─────────────────────────────────────────────────────────────

  const addOption = async (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    const { data, error } = await supabase
      .from('personalization_options')
      .insert({
        field_id: fieldId,
        value: `optie_${Date.now()}`,
        label: 'Nieuwe optie',
        sort_order: field.options?.length ?? 0,
      })
      .select()
      .single()

    if (error) {
      toast.error('Optie toevoegen mislukt', error.message)
    } else if (data) {
      onFieldsChange(fields.map(f =>
        f.id === fieldId ? { ...f, options: [...(f.options ?? []), data] } : f
      ))
    }
  }

  // ── Update option ──────────────────────────────────────────────────────────

  const updateOption = async (fieldId: string, optionId: string, updates: Partial<PersonalizationOption>) => {
    // Optimistic update
    onFieldsChange(fields.map(f =>
      f.id === fieldId
        ? { ...f, options: (f.options ?? []).map(o => o.id === optionId ? { ...o, ...updates } : o) }
        : f
    ))

    const { error } = await supabase
      .from('personalization_options')
      .update(updates)
      .eq('id', optionId)

    if (error) {
      toast.error('Optie opslaan mislukt', error.message)
    }
  }

  // ── Delete option ──────────────────────────────────────────────────────────

  const deleteOption = async (fieldId: string, optionId: string) => {
    const { error } = await supabase
      .from('personalization_options')
      .delete()
      .eq('id', optionId)

    if (error) {
      toast.error('Optie verwijderen mislukt', error.message)
    } else {
      onFieldsChange(fields.map(f =>
        f.id === fieldId ? { ...f, options: (f.options ?? []).filter(o => o.id !== optionId) } : f
      ))
    }
  }

  // ── Move option up/down ────────────────────────────────────────────────────

  const moveOption = async (fieldId: string, optionId: string, direction: 'up' | 'down') => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    const sortedOpts = [...(field.options ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sortedOpts.findIndex(o => o.id === optionId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === sortedOpts.length - 1) return

    // Reorder the array, then assign sequential sort_orders 0,1,2…
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[sortedOpts[idx], sortedOpts[swapIdx]] = [sortedOpts[swapIdx], sortedOpts[idx]]
    const withNewOrder = sortedOpts.map((o, i) => ({ ...o, sort_order: i }))

    onFieldsChange(fields.map(f =>
      f.id === fieldId ? { ...f, options: withNewOrder } : f
    ))

    const updates = withNewOrder.map(o =>
      supabase.from('personalization_options').update({ sort_order: o.sort_order }).eq('id', o.id)
    )
    const results = await Promise.all(updates)
    const failed = results.find(r => r.error)
    if (failed?.error) toast.error('Volgorde opslaan mislukt', failed.error.message)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-2xl">
          <p className="text-neutral-400 text-sm mb-2">Geen personalisatievelden geconfigureerd.</p>
          <p className="text-xs text-neutral-300">Voeg velden toe om klanten dit product te laten personaliseren.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((field, index) => (
            <FieldCard
              key={field.id}
              field={field}
              index={index}
              total={sorted.length}
              expanded={expandedFieldId === field.id}
              onToggle={() => setExpandedFieldId(expandedFieldId === field.id ? null : field.id)}
              onUpdate={(updates) => updateField(field.id, updates)}
              onDelete={() => deleteField(field.id)}
              onMoveUp={() => moveField(field.id, 'up')}
              onMoveDown={() => moveField(field.id, 'down')}
              onAddOption={() => addOption(field.id)}
              onUpdateOption={(optionId, updates) => updateOption(field.id, optionId, updates)}
              onDeleteOption={(optionId) => deleteOption(field.id, optionId)}
              onMoveOption={(optionId, dir) => moveOption(field.id, optionId, dir)}
            />
          ))}
        </div>
      )}

      <Button onClick={addField} variant="outline" size="sm" loading={saving} className="w-full">
        <Plus className="h-4 w-4" />
        Veld toevoegen
      </Button>
    </div>
  )
}

// ─── FieldCard ────────────────────────────────────────────────────────────────

interface FieldCardProps {
  field: PersonalizationField
  index: number
  total: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<PersonalizationField>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAddOption: () => void
  onUpdateOption: (optionId: string, updates: Partial<PersonalizationOption>) => void
  onDeleteOption: (optionId: string) => void
  onMoveOption: (optionId: string, direction: 'up' | 'down') => void
}

function FieldCard({
  field, index, total, expanded, onToggle,
  onUpdate, onDelete, onMoveUp, onMoveDown,
  onAddOption, onUpdateOption, onDeleteOption, onMoveOption,
}: FieldCardProps) {
  const hasOptions = OPTION_TYPES.includes(field.type)
  const options = [...(field.options ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  // Local state — synced with field prop via useEffect
  const [localLabel, setLocalLabel] = useState(field.label)
  const [localKey, setLocalKey] = useState(field.key)
  const [localPlaceholder, setLocalPlaceholder] = useState(field.placeholder ?? '')
  const [localMaxLength, setLocalMaxLength] = useState(field.max_length?.toString() ?? '')
  const [localHelpText, setLocalHelpText] = useState(field.help_text ?? '')

  // Keep local state in sync when field changes externally
  useEffect(() => { setLocalLabel(field.label) }, [field.label])
  useEffect(() => { setLocalKey(field.key) }, [field.key])
  useEffect(() => { setLocalPlaceholder(field.placeholder ?? '') }, [field.placeholder])
  useEffect(() => { setLocalMaxLength(field.max_length?.toString() ?? '') }, [field.max_length])
  useEffect(() => { setLocalHelpText(field.help_text ?? '') }, [field.help_text])

  return (
    <div className={cn(
      'border rounded-2xl bg-white overflow-hidden transition-all',
      expanded ? 'border-brand-300 shadow-soft' : 'border-neutral-200'
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Move buttons */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 rounded hover:bg-neutral-100 text-neutral-300 hover:text-neutral-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Omhoog"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-0.5 rounded hover:bg-neutral-100 text-neutral-300 hover:text-neutral-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Omlaag"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Field info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-neutral-800 truncate">{field.label}</span>
            <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full shrink-0">
              {FIELD_TYPES.find(t => t.value === field.type)?.label ?? field.type}
            </span>
            {field.is_required && (
              <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full shrink-0">Verplicht</span>
            )}
            {!field.is_active && (
              <span className="text-xs bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-full shrink-0">Inactief</span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">key: {field.key}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-full hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
            title="Verwijder veld"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-neutral-100 px-4 py-4 space-y-4 bg-neutral-50/50">

          {/* Type + Key */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Type</label>
              <select
                value={field.type}
                onChange={e => onUpdate({ type: e.target.value as PersonalizationFieldType })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {FIELD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Interne sleutel (key)"
              value={localKey}
              onChange={e => setLocalKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              onBlur={() => onUpdate({ key: localKey })}
              helpText="Unieke interne naam"
            />
          </div>

          {/* Label */}
          <Input
            label="Label (weergavenaam)"
            value={localLabel}
            onChange={e => setLocalLabel(e.target.value)}
            onBlur={() => onUpdate({ label: localLabel })}
          />

          {/* Text-specific fields */}
          {field.type === 'text' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Placeholder"
                value={localPlaceholder}
                onChange={e => setLocalPlaceholder(e.target.value)}
                onBlur={() => onUpdate({ placeholder: localPlaceholder })}
              />
              <Input
                label="Max. tekens"
                type="number"
                value={localMaxLength}
                onChange={e => setLocalMaxLength(e.target.value)}
                onBlur={() => onUpdate({ max_length: localMaxLength ? parseInt(localMaxLength) : null })}
              />
            </div>
          )}

          {/* Help text */}
          <Input
            label="Helptekst (optioneel)"
            value={localHelpText}
            onChange={e => setLocalHelpText(e.target.value)}
            onBlur={() => onUpdate({ help_text: localHelpText })}
            helpText="Wordt als toelichting getoond bij het veld"
          />

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={field.is_required}
                onChange={e => onUpdate({ is_required: e.target.checked })}
                className="w-4 h-4 accent-brand-500 rounded"
              />
              <span className="font-medium">Verplicht veld</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={field.is_active}
                onChange={e => onUpdate({ is_active: e.target.checked })}
                className="w-4 h-4 accent-brand-500 rounded"
              />
              <span className="font-medium">Actief</span>
            </label>
          </div>

          {/* Options */}
          {hasOptions && (
            <div className="border-t border-neutral-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-700">
                  Opties
                  {options.length > 0 && (
                    <span className="ml-1.5 text-xs font-normal text-neutral-400">({options.length})</span>
                  )}
                </h4>
                <Button size="sm" variant="secondary" onClick={onAddOption}>
                  <Plus className="h-3.5 w-3.5" />
                  Optie toevoegen
                </Button>
              </div>

              {options.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-3">
                  Nog geen opties. Klik op &quot;Optie toevoegen&quot;.
                </p>
              ) : (
                <div className="space-y-2">
                  {options.map((option, optIndex) => (
                    <OptionRow
                      key={option.id}
                      option={option}
                      fieldType={field.type}
                      index={optIndex}
                      total={options.length}
                      onUpdate={updates => onUpdateOption(option.id, updates)}
                      onDelete={() => onDeleteOption(option.id)}
                      onMoveUp={() => onMoveOption(option.id, 'up')}
                      onMoveDown={() => onMoveOption(option.id, 'down')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── OptionRow ────────────────────────────────────────────────────────────────

function OptionRow({
  option, fieldType, index, total,
  onUpdate, onDelete, onMoveUp, onMoveDown,
}: {
  option: PersonalizationOption
  fieldType: PersonalizationFieldType
  index: number
  total: number
  onUpdate: (updates: Partial<PersonalizationOption>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [localLabel, setLocalLabel] = useState(option.label)
  const [localValue, setLocalValue] = useState(option.value)
  const [localFontPreview, setLocalFontPreview] = useState(option.font_preview ?? '')
  const [localColorHex, setLocalColorHex] = useState(option.color_hex ?? '#c8a87a')
  const [localPriceModifier, setLocalPriceModifier] = useState(option.price_modifier.toString())

  // Sync local state when option prop changes externally
  useEffect(() => { setLocalLabel(option.label) }, [option.label])
  useEffect(() => { setLocalValue(option.value) }, [option.value])
  useEffect(() => { setLocalFontPreview(option.font_preview ?? '') }, [option.font_preview])
  useEffect(() => { setLocalColorHex(option.color_hex ?? '#c8a87a') }, [option.color_hex])
  useEffect(() => { setLocalPriceModifier(option.price_modifier.toString()) }, [option.price_modifier])

  return (
    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2.5">
      {/* Move buttons */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-0.5 rounded hover:bg-neutral-100 text-neutral-300 hover:text-neutral-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          title="Omhoog"
        >
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-0.5 rounded hover:bg-neutral-100 text-neutral-300 hover:text-neutral-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          title="Omlaag"
        >
          <ArrowDown className="h-3 w-3" />
        </button>
      </div>

      {/* Color picker */}
      {fieldType === 'color' && (
        <input
          type="color"
          value={localColorHex}
          onChange={e => setLocalColorHex(e.target.value)}
          onBlur={() => onUpdate({ color_hex: localColorHex })}
          className="w-8 h-8 rounded-full cursor-pointer border border-neutral-200 p-0.5 shrink-0"
          title="Kies kleur"
        />
      )}

      {/* Label */}
      <input
        className="flex-1 min-w-0 text-sm text-neutral-700 border-0 bg-transparent focus:outline-none"
        value={localLabel}
        onChange={e => setLocalLabel(e.target.value)}
        onBlur={() => onUpdate({ label: localLabel })}
        placeholder="Label"
      />

      {/* Value (internal) */}
      <input
        className="w-24 text-xs text-neutral-500 border-0 bg-neutral-50 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400 shrink-0"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={() => onUpdate({ value: localValue })}
        placeholder="waarde"
        title="Interne waarde"
      />

      {/* Font preview CSS (font fields only) */}
      {fieldType === 'font' && (
        <input
          className="w-28 text-xs text-neutral-500 border-0 bg-neutral-50 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400 shrink-0"
          value={localFontPreview}
          onChange={e => setLocalFontPreview(e.target.value)}
          onBlur={() => onUpdate({ font_preview: localFontPreview })}
          placeholder="CSS font naam"
          title="Font preview (CSS waarde, bijv. 'Pacifico', cursive)"
        />
      )}

      {/* Price modifier */}
      <input
        type="number"
        className="w-16 text-xs text-neutral-500 border-0 bg-neutral-50 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400 shrink-0"
        value={localPriceModifier}
        onChange={e => setLocalPriceModifier(e.target.value)}
        onBlur={() => onUpdate({ price_modifier: parseFloat(localPriceModifier) || 0 })}
        placeholder="+/- €"
        step="0.01"
        title="Prijsmodifier"
      />

      {/* Active toggle */}
      <label className="flex items-center shrink-0" title="Actief">
        <input
          type="checkbox"
          checked={option.is_active}
          onChange={e => onUpdate({ is_active: e.target.checked })}
          className="w-3.5 h-3.5 accent-brand-500"
        />
      </label>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded-full hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors shrink-0"
        title="Verwijder optie"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
