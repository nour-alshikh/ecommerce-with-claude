'use client'

import { useSession } from 'next-auth/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { wishlistApi } from '@/lib/api'

export function WishlistButton({ productId }: { productId: number }) {
  const { data: session } = useSession()
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['wishlist-ids'],
    queryFn: () => wishlistApi.ids().then((r) => r.data.data as number[]),
    enabled: !!session,
  })

  const wishlisted = data?.includes(productId) ?? false

  const toggle = useMutation({
    mutationFn: () => wishlisted ? wishlistApi.remove(productId) : wishlistApi.add(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist-ids'] })
      qc.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    },
    onError: () => toast.error('Could not update wishlist'),
  })

  if (!session) return null

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle.mutate() }}
      disabled={toggle.isPending}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlisted}
      className="rounded-full p-2 text-gray-400 transition hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-40"
    >
      <svg
        className={`h-5 w-5 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'fill-none'}`}
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}
