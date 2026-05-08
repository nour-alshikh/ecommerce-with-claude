'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { wishlistApi } from '@/lib/api'
import type { WishlistItem } from '@/lib/types'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const qc = useQueryClient()

  if (status === 'unauthenticated') redirect('/auth/login')

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.list().then((r) => r.data.data as WishlistItem[]),
    enabled: !!session,
  })

  const remove = useMutation({
    mutationFn: (productId: number) => wishlistApi.remove(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] })
      qc.invalidateQueries({ queryKey: ['wishlist-ids'] })
      toast.success('Removed from wishlist')
    },
  })

  if (isLoading || status === 'loading') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200 mb-8" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
              <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const items = data ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Wishlist</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <svg className="h-16 w-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <div>
            <p className="font-medium text-gray-700">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-gray-400">Save products you love for later.</p>
          </div>
          <Link href="/products" className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const primary = item.product.images?.find((i) => i.is_primary) ?? item.product.images?.[0]
            return (
              <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Link href={`/products/${item.product.slug}`} className="relative aspect-square block overflow-hidden bg-gray-50">
                  {primary ? (
                    <Image src={primary.url} alt={primary.alt_text ?? item.product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-200">
                      <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <Link href={`/products/${item.product.slug}`} className="line-clamp-2 font-semibold text-gray-900 hover:text-indigo-600 text-sm">
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-base font-bold text-gray-900">{formatPrice(item.product.effective_price)}</p>
                  {item.product.sale_price && (
                    <p className="text-sm text-gray-400 line-through">{formatPrice(item.product.price)}</p>
                  )}

                  <div className="mt-auto flex gap-2 pt-4">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="flex-1 rounded-full bg-gray-900 py-2 text-center text-sm font-medium text-white hover:bg-gray-700"
                    >
                      View product
                    </Link>
                    <button
                      onClick={() => remove.mutate(item.product_id)}
                      disabled={remove.isPending}
                      aria-label={`Remove ${item.product.name} from wishlist`}
                      className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:border-red-300 hover:text-red-500 disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
