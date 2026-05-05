'use client'

import { useCartStore } from '@/store/cartStore'

export function CartCount() {
  const total = useCartStore((s) => s.totalItems())
  if (total === 0) return null
  return (
    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
      {total > 9 ? '9+' : total}
    </span>
  )
}
