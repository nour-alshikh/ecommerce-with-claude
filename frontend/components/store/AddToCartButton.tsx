'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCart } from '@/lib/hooks/useCart'
import type { Product } from '@/lib/types'

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const hasVariants = product.variants && product.variants.length > 0
  const isOutOfStock = product.stock === 0 && !hasVariants

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-gray-100 py-2 text-xs font-medium text-gray-400"
      >
        Out of stock
      </button>
    )
  }

  if (hasVariants) {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="block w-full rounded-lg border border-indigo-600 py-2 text-center text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
      >
        View options
      </Link>
    )
  }

  const handleAdd = () => {
    addItem.mutate(
      { productId: product.id, variantId: null, quantity: 1 },
      {
        onSuccess: () => {
          setAdded(true)
          toast.success(`${product.name} added to cart`)
          setTimeout(() => setAdded(false), 2000)
        },
        onError: () => toast.error('Failed to add to cart'),
      },
    )
  }

  return (
    <button
      onClick={handleAdd}
      disabled={addItem.isPending || added}
      className={`w-full rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
        added ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {added ? '✓ Added' : addItem.isPending ? 'Adding…' : 'Add to cart'}
    </button>
  )
}
