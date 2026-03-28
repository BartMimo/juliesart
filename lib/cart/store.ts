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

  // Computed
  itemCount: number
  subtotal: number
  discountAmount: number
  total: number

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  applyDiscount: (code: string, type: DiscountType, value: number) => void
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

      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      },

      get discountAmount() {
        const { subtotal, discountType, discountValue } = get()
        if (!discountType || !discountValue) return 0
        return calculateDiscount(subtotal, discountType, discountValue)
      },

      get total() {
        const { subtotal, discountAmount } = get()
        const shipping = subtotal >= 50 ? 0 : 4.95
        return Math.max(0, subtotal - discountAmount + shipping)
      },

      addItem: (newItem) => {
        set((state) => {
          // Check if same product + same personalizations already exists
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              personalizationsMatch(item.personalizations, newItem.personalizations)
          )

          if (existingIndex >= 0) {
            // Increment quantity
            const items = [...state.items]
            items[existingIndex] = {
              ...items[existingIndex],
              quantity: Math.min(items[existingIndex].quantity + newItem.quantity, 10),
            }
            return { items }
          }

          // Add new item
          return {
            items: [...state.items, { ...newItem, id: generateCartItemId() }],
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(quantity, 10) } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [], discountCode: null, discountType: null, discountValue: null })
      },

      applyDiscount: (code, type, value) => {
        set({ discountCode: code, discountType: type, discountValue: value })
      },

      removeDiscount: () => {
        set({ discountCode: null, discountType: null, discountValue: null })
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
      }),
    }
  )
)
