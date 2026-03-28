import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  helpText?: string
  required?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helpText, required, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-neutral-700 mb-1.5"
          >
            {label}
            {required && <span className="text-brand-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={4}
          className={cn(
            'w-full px-4 py-3 rounded-xl border text-neutral-800 bg-white resize-none',
            'placeholder:text-neutral-400',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-50',
            error
              ? 'border-red-300 focus:ring-red-400'
              : 'border-neutral-200 hover:border-brand-300',
            className
          )}
          {...props}
        />
        {helpText && !error && (
          <p className="mt-1.5 text-xs text-neutral-500">{helpText}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
