'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem, CartPersonalizationValue, DiscountType } from '@/types'
import { calculateDiscount } from '@/lib/utils'

interface CartState {
  items: CartItem[]
  discountCode: string | null
  discountType: DiscountType | null
  discountValue: number | null
  discountAmount: number

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  applyDiscount: (code: string, type: DiscountType, value: number | string) => void
  removeDiscount: () => void
}

function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function personalizationsMatch(
  a: CartPersonalizationValue[],
  b: CartPersonalizationValue[]
): boolean {
  if (a.length !== b.length) return false
  const aMap = Object.fromEntries(a.map((p) => [p.fieldKey, p.value]))
  const bMap = Object.fromEntries(b.map((p) => [p.fieldKey, p.value]))
  return JSON.stringify(aMap) === JSON.stringify(bMap)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: null,
      discountType: null,
      discountValue: null,
      discountAmount: 0,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              personalizationsMatch(item.personalizations, newItem.personalizations)
          )

          let items: CartItem[]
          if (existingIndex >= 0) {
            items = [...state.items]
            items[existingIndex] = {
              ...items[existingIndex],
              quantity: Math.min(items[existingIndex].quantity + newItem.quantity, 10),
            }
          } else {
            items = [...state.items, { ...newItem, id: generateCartItemId() }]
          }

          const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
          const discountAmount = state.discountType && state.discountValue
            ? calculateDiscount(subtotal, state.discountType, state.discountValue)
            : 0

          return { items, discountAmount }
        })
      },

      removeItem: (id) => {
        set((state) => {
          const items = state.items.filter((item) => item.id !== id)
          const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
          const discountAmount = state.discountType && state.discountValue
            ? calculateDiscount(subtotal, state.discountType, state.discountValue)
            : 0
          return { items, discountAmount }
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => {
          const items = state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(quantity, 10) } : item
          )
          const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
          const discountAmount = state.discountType && state.discountValue
            ? calculateDiscount(subtotal, state.discountType, state.discountValue)
            : 0
          return { items, discountAmount }
        })
      },

      clearCart: () => {
        set({ items: [], discountCode: null, discountType: null, discountValue: null, discountAmount: 0 })
      },

      applyDiscount: (code, type, value) => {
        const numericValue = Number(value)
        const { items } = get()
        const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
        const discountAmount = calculateDiscount(subtotal, type, numericValue)
        set({ discountCode: code, discountType: type, discountValue: numericValue, discountAmount })
      },

      removeDiscount: () => {
        set({ discountCode: null, discountType: null, discountValue: null, discountAmount: 0 })
      },
    }),
    {
      name: 'julies-art-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items and discount, not computed values
      partialize: (state) => ({
        items: state.items,
        discountCode: state.discountCode,
        discountType: state.discountType,
        discountValue: state.discountValue,
        discountAmount: state.discountAmount,
      }),
    }
  )
)
