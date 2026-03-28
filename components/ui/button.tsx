'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'peach'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const variantStyles = {
      primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-soft hover:shadow-hover active:scale-[0.98]',
      secondary: 'bg-brand-100 hover:bg-brand-200 text-brand-700 active:scale-[0.98]',
      outline: 'border-2 border-brand-300 hover:border-brand-500 text-brand-600 hover:bg-brand-50 active:scale-[0.98]',
      ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 active:scale-[0.98]',
      danger: 'bg-red-500 hover:bg-red-600 text-white active:scale-[0.98]',
      peach: 'bg-peach-300 hover:bg-peach-400 text-white shadow-soft hover:shadow-hover active:scale-[0.98]',
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm font-semibold rounded-full gap-1.5',
      md: 'px-5 py-2.5 text-sm font-semibold rounded-full gap-2',
      lg: 'px-7 py-3.5 text-base font-bold rounded-full gap-2',
      xl: 'px-10 py-4 text-lg font-bold rounded-full gap-3',
      icon: 'p-2.5 rounded-full',
    }

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Bezig…
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

// Animated version with Framer Motion
export function AnimatedButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.button> & { className?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export { Button }
