'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Check } from 'lucide-react'
import { PersonalizationField, PersonalizationValues } from '@/types'
import { Input } from '@/components/ui/input'
import { cn, getFieldTypeLabel } from '@/lib/utils'

interface PersonalizationFormProps {
  fields: PersonalizationField[]
  values: PersonalizationValues
  onChange: (values: PersonalizationValues) => void
  errors?: Partial<PersonalizationValues>
}

export function PersonalizationForm({
  fields,
  values,
  onChange,
  errors = {},
}: PersonalizationFormProps) {
  const activeFields = [...fields]
    .filter((f) => f.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  const handleChange = useCallback(
    (key: string, value: string) => {
      onChange({ ...values, [key]: value })
    },
    [values, onChange]
  )

  if (activeFields.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-neutral-800 text-lg">
          Personaliseer dit product
        </h3>
        <span className="text-xs text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full font-semibold">
          Jouw keuzes
        </span>
      </div>

      <div className="space-y-5">
        {activeFields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.key] ?? ''}
            onChange={(val) => handleChange(field.key, val)}
            error={errors[field.key]}
          />
        ))}
      </div>

      {/* Summary of selections */}
      {Object.keys(values).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-50 border border-brand-100 rounded-2xl p-4"
        >
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">
            Jouw keuzes:
          </p>
          <ul className="space-y-1">
            {activeFields.map((field) => {
              const val = values[field.key]
              if (!val) return null
              // Find display label for option-based fields
              const option = field.options?.find((o) => o.value === val)
              const displayVal = option?.label ?? val
              return (
                <li key={field.key} className="flex items-center gap-2 text-sm text-neutral-700">
                  <Check className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                  <span className="font-semibold text-neutral-600">{field.label}:</span>
                  {option?.color_hex && (
                    <span
                      className="w-4 h-4 rounded-full border border-neutral-200 inline-block"
                      style={{ backgroundColor: option.color_hex }}
                    />
                  )}
                  <span>{displayVal}</span>
                </li>
              )
            })}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

// Individual field renderer
function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: PersonalizationField
  value: string
  onChange: (val: string) => void
  error?: string
}) {
  const options = (field.options ?? []).filter((o) => o.is_active).sort((a, b) => a.sort_order - b.sort_order)

  switch (field.type) {
    case 'text':
      return (
        <div>
          <Input
            label={field.label}
            placeholder={field.placeholder ?? ''}
            required={field.is_required}
            maxLength={field.max_length ?? undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={error}
            helpText={field.help_text ?? undefined}
          />
          {field.max_length && (
            <div className="mt-1 flex justify-end">
              <span className={cn(
                'text-xs',
                value.length > field.max_length * 0.8 ? 'text-amber-500' : 'text-neutral-400'
              )}>
                {value.length}/{field.max_length}
              </span>
            </div>
          )}
        </div>
      )

    case 'color':
      return (
        <ColorField
          field={field}
          options={options}
          value={value}
          onChange={onChange}
          error={error}
        />
      )

    case 'font':
      return (
        <FontField
          field={field}
          options={options}
          value={value}
          onChange={onChange}
          error={error}
        />
      )

    case 'icon':
      return (
        <IconField
          field={field}
          options={options}
          value={value}
          onChange={onChange}
          error={error}
        />
      )

    case 'size':
    case 'radio':
      return (
        <RadioField
          field={field}
          options={options}
          value={value}
          onChange={onChange}
          error={error}
        />
      )

    case 'select':
      return (
        <SelectField
          field={field}
          options={options}
          value={value}
          onChange={onChange}
          error={error}
        />
      )

    default:
      return null
  }
}

// Color picker field
function ColorField({ field, options, value, onChange, error }: FieldComponentProps) {
  return (
    <div>
      <FieldLabel field={field} />
      <div className="flex flex-wrap gap-3 mt-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative w-10 h-10 rounded-full border-2 transition-all duration-200',
              value === option.value
                ? 'border-neutral-800 scale-110 shadow-md'
                : 'border-transparent hover:scale-105'
            )}
            style={{ backgroundColor: option.color_hex ?? '#ccc' }}
            title={option.label}
          >
            {value === option.value && (
              <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
            )}
          </button>
        ))}
      </div>
      {/* Selected label */}
      {value && (
        <p className="mt-2 text-sm text-neutral-500">
          Geselecteerd: <span className="font-semibold text-neutral-700">
            {options.find(o => o.value === value)?.label ?? value}
          </span>
        </p>
      )}
      {field.help_text && <p className="mt-1 text-xs text-neutral-400">{field.help_text}</p>}
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// Font selector field
function FontField({ field, options, value, onChange, error }: FieldComponentProps) {
  return (
    <div>
      <FieldLabel field={field} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'border-2 rounded-xl p-3 text-center transition-all duration-200',
              value === option.value
                ? 'border-brand-500 bg-brand-50'
                : 'border-neutral-200 hover:border-brand-300 bg-white'
            )}
          >
            <div
              className="text-xl text-neutral-800 mb-1"
              style={{ fontFamily: option.font_preview ?? option.label }}
            >
              Sophie
            </div>
            <div className="text-xs font-semibold text-neutral-500">{option.label}</div>
          </button>
        ))}
      </div>
      {field.help_text && <p className="mt-2 text-xs text-neutral-400">{field.help_text}</p>}
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// Icon selector field
function IconField({ field, options, value, onChange, error }: FieldComponentProps) {
  return (
    <div>
      <FieldLabel field={field} />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'border-2 rounded-xl p-3 text-center transition-all duration-200',
              value === option.value
                ? 'border-brand-500 bg-brand-50 shadow-soft'
                : 'border-neutral-200 hover:border-brand-300 bg-white'
            )}
          >
            <div className="text-2xl mb-1">
              {/* Show image if available, otherwise emoji from label */}
              {option.image_url ? (
                <img src={option.image_url} alt={option.label} className="w-8 h-8 mx-auto object-contain" />
              ) : (
                option.label.match(/[\p{Emoji}]/u)?.[0] ?? '✨'
              )}
            </div>
            <div className="text-xs font-medium text-neutral-600 leading-tight">
              {option.label.replace(/[\p{Emoji}]/gu, '').trim()}
            </div>
          </button>
        ))}
      </div>
      {field.help_text && <p className="mt-2 text-xs text-neutral-400">{field.help_text}</p>}
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// Radio / size field
function RadioField({ field, options, value, onChange, error }: FieldComponentProps) {
  return (
    <div>
      <FieldLabel field={field} />
      <div className="flex flex-wrap gap-3 mt-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200',
              value === option.value
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-neutral-200 hover:border-brand-300 text-neutral-700 bg-white'
            )}
          >
            {option.label}
            {option.price_modifier !== 0 && (
              <span className="ml-1 text-xs opacity-80">
                ({option.price_modifier > 0 ? '+' : ''}{option.price_modifier.toFixed(2)})
              </span>
            )}
          </button>
        ))}
      </div>
      {field.help_text && <p className="mt-2 text-xs text-neutral-400">{field.help_text}</p>}
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// Dropdown field
function SelectField({ field, options, value, onChange, error }: FieldComponentProps) {
  return (
    <div>
      <FieldLabel field={field} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'mt-2 w-full px-4 py-3 rounded-xl border bg-white text-sm text-neutral-800',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
          'transition-all duration-200',
          error ? 'border-red-300' : 'border-neutral-200 hover:border-brand-300'
        )}
      >
        <option value="">— Maak een keuze —</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.price_modifier !== 0 &&
              ` (${option.price_modifier > 0 ? '+' : ''}€${Math.abs(option.price_modifier).toFixed(2)})`}
          </option>
        ))}
      </select>
      {field.help_text && <p className="mt-1.5 text-xs text-neutral-400">{field.help_text}</p>}
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// Shared types
type FieldComponentProps = {
  field: PersonalizationField
  options: NonNullable<PersonalizationField['options']>
  value: string
  onChange: (val: string) => void
  error?: string
}

// Shared label component
function FieldLabel({ field }: { field: PersonalizationField }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-neutral-700">
        {field.label}
        {field.is_required && <span className="text-brand-500 ml-1">*</span>}
      </label>
      {field.help_text && (
        <div className="relative group/tooltip">
          <HelpCircle className="h-4 w-4 text-neutral-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-800 text-white text-xs rounded-lg px-2.5 py-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 text-center">
            {field.help_text}
          </div>
        </div>
      )}
    </div>
  )
}

// Validate personalization form
export function validatePersonalizationForm(
  fields: PersonalizationField[],
  values: PersonalizationValues
): { valid: boolean; errors: Partial<PersonalizationValues> } {
  const errors: Partial<PersonalizationValues> = {}
  let valid = true

  fields
    .filter((f) => f.is_active)
    .forEach((field) => {
      const value = values[field.key]

      if (field.is_required && (!value || value.trim() === '')) {
        errors[field.key] = `${field.label} is verplicht`
        valid = false
      }

      if (field.type === 'text' && field.max_length && value && value.length > field.max_length) {
        errors[field.key] = `Maximaal ${field.max_length} tekens toegestaan`
        valid = false
      }
    })

  return { valid, errors }
}
