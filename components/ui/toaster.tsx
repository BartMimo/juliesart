'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { create } from 'zustand'

// Toast store
type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

// Hook to use toasts
export function useToast() {
  const { addToast } = useToastStore()

  return {
    toast: (toast: Omit<Toast, 'id'>) => addToast(toast),
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),
  }
}

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          open
          onOpenChange={(open) => { if (!open) removeToast(toast.id) }}
          duration={4000}
          className={cn(
            'group relative flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-4 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'duration-300',
            toast.type === 'success' && 'border-green-200',
            toast.type === 'error' && 'border-red-200',
            toast.type === 'info' && 'border-blue-200',
          )}
        >
          <span className="mt-0.5 shrink-0">{icons[toast.type]}</span>
          <div className="flex-1 min-w-0">
            <ToastPrimitive.Title className="text-sm font-semibold text-neutral-800">
              {toast.title}
            </ToastPrimitive.Title>
            {toast.description && (
              <ToastPrimitive.Description className="text-sm text-neutral-500 mt-0.5">
                {toast.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded-full p-1 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-neutral-400" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm" />
    </ToastPrimitive.Provider>
  )
}
