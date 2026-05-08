'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '@/lib/api'
import type { ServerCart } from '@/lib/types'

function getSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  let id = localStorage.getItem('cart_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('cart_session_id', id)
  }
  return id
}

export function useCart() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const sessionId = getSessionId()
      const res = await cartApi.get(sessionId)
      return res.data.data as ServerCart
    },
    staleTime: 30_000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cart'] })

  const addItem = useMutation({
    mutationFn: (vars: { productId: number; variantId: number | null; quantity?: number }) =>
      cartApi.addItem(vars.productId, vars.variantId, vars.quantity ?? 1, getSessionId()),
    onSuccess: invalidate,
  })

  const updateItem = useMutation({
    mutationFn: (vars: { itemId: number; quantity: number }) =>
      cartApi.updateItem(vars.itemId, vars.quantity, getSessionId()),
    onSuccess: invalidate,
  })

  const removeItem = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId, getSessionId()),
    onSuccess: invalidate,
  })

  const applyCoupon = useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code, getSessionId()),
    onSuccess: invalidate,
  })

  const removeCoupon = useMutation({
    mutationFn: () => cartApi.removeCoupon(getSessionId()),
    onSuccess: invalidate,
  })

  return {
    cart: query.data,
    isLoading: query.isLoading,
    addItem,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
  }
}
