'use client'

import { useCart } from '@/lib/hooks/useCart'

export function CartCount() {
  const { cart } = useCart()
  const total = cart?.item_count ?? 0
  if (total === 0) return null
  return (
    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
      {total > 9 ? '9+' : total}
    </span>
  )
}
