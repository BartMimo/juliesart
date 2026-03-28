'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { PersonalizationField, PersonalizationOption, PersonalizationFieldType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { FIELD_TYPES } from '@/lib/constants'
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

    if (!error && data) {
      const newFields = [...fields, { ...data, options: data.options ?? [] }]
      onFieldsChange(newFields)
      setExpandedFieldId(data.id)
      toast.success('Veld toegevoegd')
    }
    setSaving(false)
  }

  const updateField = async (fieldId: string, updates: Partial<PersonalizationField>) => {
    const { error } = await supabase
      .from('personalization_fields')
      .update(updates)
      .eq('id', fieldId)

    if (!error) {
      onFieldsChange(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)))
    }
  }

  const deleteField = async (fieldId: string) => {
    if (!confirm('Weet je zeker dat je dit veld wil verwijderen? Alle bijbehorende opties worden ook verwijderd.')) return

    const { error } = await supabase.from('personalization_fields').delete().eq('id', fieldId)
    if (!error) {
      onFieldsChange(fields.filter((f) => f.id !== fieldId))
      toast.success('Veld verwijderd')
    }
  }

  const addOption = async (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return

    const { data, error } = await supabase
      .from('personalization_options')
      .insert({
        field_id: fieldId,
        value: `optie_${Date.now()}`,
        label: 'Nieuwe optie',
        sort_order: (field.options?.length ?? 0),
      })
      .select()
      .single()

    if (!error && data) {
      onFieldsChange(
        fields.map((f) =>
          f.id === fieldId ? { ...f, options: [...(f.options ?? []), data] } : f
        )
      )
    }
  }

  const updateOption = async (fieldId: string, optionId: string, updates: Partial<PersonalizationOption>) => {
    await supabase.from('personalization_options').update(updates).eq('id', optionId)

    onFieldsChange(
      fields.map((f) =>
        f.id === fieldId
          ? { ...f, options: (f.options ?? []).map((o) => (o.id === optionId ? { ...o, ...updates } : o)) }
          : f
      )
    )
  }

  const deleteOption = async (fieldId: string, optionId: string) => {
    await supabase.from('personalization_options').delete().eq('id', optionId)
    onFieldsChange(
      fields.map((f) =>
        f.id === fieldId ? { ...f, options: (f.options ?? []).filter((o) => o.id !== optionId) } : f
      )
    )
  }

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-2xl">
          <p className="text-neutral-400 text-sm mb-3">
            Geen personalisatievelden geconfigureerd.
          </p>
          <p className="text-xs text-neutral-300 mb-4">
            Voeg velden toe om klanten dit product te laten personaliseren.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...fields].sort((a, b) => a.sort_order - b.sort_order).map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              expanded={expandedFieldId === field.id}
              onToggle={() => setExpandedFieldId(expandedFieldId === field.id ? null : field.id)}
              onUpdate={(updates) => updateField(field.id, updates)}
              onDelete={() => deleteField(field.id)}
              onAddOption={() => addOption(field.id)}
              onUpdateOption={(optionId, updates) => updateOption(field.id, optionId, updates)}
              onDeleteOption={(optionId) => deleteOption(field.id, optionId)}
            />
          ))}
        </div>
      )}

      <Button
        onClick={addField}
        variant="outline"
        size="sm"
        loading={saving}
        className="w-full"
      >
        <Plus className="h-4 w-4" />
        Veld toevoegen
      </Button>
    </div>
  )
}

interface FieldCardProps {
  field: PersonalizationField
  expanded: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<PersonalizationField>) => void
  onDelete: () => void
  onAddOption: () => void
  onUpdateOption: (optionId: string, updates: Partial<PersonalizationOption>) => void
  onDeleteOption: (optionId: string) => void
}

function FieldCard({ field, expanded, onToggle, onUpdate, onDelete, onAddOption, onUpdateOption, onDeleteOption }: FieldCardProps) {
  const hasOptions = OPTION_TYPES.includes(field.type)
  const options = (field.options ?? []).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className={cn('border rounded-2xl bg-white overflow-hidden transition-all', expanded ? 'border-brand-300 shadow-soft' : 'border-neutral-200')}>
      {/* Field header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical className="h-4 w-4 text-neutral-300 cursor-grab shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-neutral-800 truncate">{field.label}</span>
            <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
              {FIELD_TYPES.find(t => t.value === field.type)?.label ?? field.type}
            </span>
            {field.is_required && (
              <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full">Verplicht</span>
            )}
            {!field.is_active && (
              <span className="text-xs bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-full">Inactief</span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">key: {field.key}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="p-1.5 rounded-full hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded config */}
      {expanded && (
        <div className="border-t border-neutral-100 px-4 py-4 space-y-4 bg-neutral-50/50">
          {/* Basic settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Type</label>
              <select
                value={field.type}
                onChange={(e) => onUpdate({ type: e.target.value as PersonalizationFieldType })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Interne sleutel (key)"
              value={field.key}
              onChange={(e) => onUpdate({ key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              helpText="Unieke interne naam"
            />
          </div>

          <Input
            label="Label (weergavenaam)"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />

          {field.type === 'text' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Placeholder"
                value={field.placeholder ?? ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
              />
              <Input
                label="Max. tekens"
                type="number"
                value={field.max_length ?? ''}
                onChange={(e) => onUpdate({ max_length: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          )}

          <Input
            label="Helptekst (optioneel)"
            value={field.help_text ?? ''}
            onChange={(e) => onUpdate({ help_text: e.target.value })}
            helpText="Wordt als toelichting getoond bij het veld"
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={field.is_required}
                onChange={(e) => onUpdate({ is_required: e.target.checked })}
                className="w-4 h-4 accent-brand-500 rounded"
              />
              <span className="font-medium">Verplicht veld</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={field.is_active}
                onChange={(e) => onUpdate({ is_active: e.target.checked })}
                className="w-4 h-4 accent-brand-500 rounded"
              />
              <span className="font-medium">Actief</span>
            </label>
          </div>

          {/* Options section for non-text fields */}
          {hasOptions && (
            <div className="border-t border-neutral-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-700">Opties</h4>
                <Button size="sm" variant="secondary" onClick={onAddOption}>
                  <Plus className="h-3.5 w-3.5" />
                  Optie toevoegen
                </Button>
              </div>

              {options.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-3">Nog geen opties. Voeg een optie toe.</p>
              ) : (
                <div className="space-y-2">
                  {options.map((option) => (
                    <OptionRow
                      key={option.id}
                      option={option}
                      fieldType={field.type}
                      onUpdate={(updates) => onUpdateOption(option.id, updates)}
                      onDelete={() => onDeleteOption(option.id)}
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

function OptionRow({
  option,
  fieldType,
  onUpdate,
  onDelete,
}: {
  option: PersonalizationOption
  fieldType: PersonalizationFieldType
  onUpdate: (updates: Partial<PersonalizationOption>) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2.5">
      {/* Color preview */}
      {fieldType === 'color' && (
        <input
          type="color"
          value={option.color_hex ?? '#ffffff'}
          onChange={(e) => onUpdate({ color_hex: e.target.value })}
          className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 shrink-0"
          title="Kies kleur"
        />
      )}

      <input
        className="flex-1 min-w-0 text-sm text-neutral-700 border-0 bg-transparent focus:outline-none"
        value={option.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Label"
      />
      <input
        className="w-28 text-xs text-neutral-500 border-0 bg-neutral-50 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
        value={option.value}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="waarde"
      />

      {fieldType === 'font' && (
        <input
          className="w-28 text-xs text-neutral-500 border-0 bg-neutral-50 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
          value={option.font_preview ?? ''}
          onChange={(e) => onUpdate({ font_preview: e.target.value })}
          placeholder="Font naam"
        />
      )}

      <input
        type="number"
        className="w-16 text-xs text-neutral-500 border-0 bg-neutral-50 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
        value={option.price_modifier}
        onChange={(e) => onUpdate({ price_modifier: parseFloat(e.target.value) || 0 })}
        placeholder="+/- €"
        step="0.01"
      />

      <label className="flex items-center shrink-0" title="Actief">
        <input
          type="checkbox"
          checked={option.is_active}
          onChange={(e) => onUpdate({ is_active: e.target.checked })}
          className="w-3.5 h-3.5 accent-brand-500"
        />
      </label>

      <button
        onClick={onDelete}
        className="p-1 rounded-full hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
