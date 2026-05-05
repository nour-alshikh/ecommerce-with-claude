import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/lib/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, variantId?: number | null, variantName?: string | null) => void
  removeItem: (productId: number, variantId: number | null) => void
  updateQty: (productId: number, variantId: number | null, qty: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, variantId = null, variantName = null) {
        const unitPrice = variantId
          ? product.effective_price +
            (product.variants.find((v) => v.id === variantId)?.price_modifier ?? 0)
          : product.effective_price

        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.variantId === variantId,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.variantId === variantId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            }
          }
          return {
            items: [...state.items, { product, variantId, variantName, quantity: 1, unitPrice }],
          }
        })
      },

      removeItem(productId, variantId) {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.variantId === variantId),
          ),
        }))
      },

      updateQty(productId, variantId, qty) {
        if (qty < 1) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.variantId === variantId ? { ...i, quantity: qty } : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: 'cart' },
  ),
)
