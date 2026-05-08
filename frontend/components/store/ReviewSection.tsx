'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reviewApi } from '@/lib/api'
import type { Review } from '@/lib/types'

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-gray-200'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </span>
  )
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <span className="flex items-center gap-1" role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          <svg
            className={`h-7 w-7 transition-colors ${n <= (hovered || value) ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </span>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{review.user_name}</p>
          <StarRating rating={review.rating} />
        </div>
        <time className="shrink-0 text-xs text-gray-400">
          {new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </time>
      </div>
      {review.title && <p className="mt-3 font-medium text-gray-800">{review.title}</p>}
      {review.comment && <p className="mt-1 text-sm leading-relaxed text-gray-600">{review.comment}</p>}
    </article>
  )
}

export function ReviewSection({ productSlug }: { productSlug: string }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productSlug],
    queryFn: () => reviewApi.list(productSlug).then((r) => r.data),
  })

  const submit = useMutation({
    mutationFn: () => reviewApi.submit(productSlug, { rating, title: title || undefined, comment: comment || undefined }),
    onSuccess: () => {
      toast.success('Review submitted! It will appear once approved.')
      queryClient.invalidateQueries({ queryKey: ['reviews', productSlug] })
      setRating(0)
      setTitle('')
      setComment('')
      setSubmitted(true)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to submit review.')
    },
  })

  const reviews: Review[] = data?.data ?? []
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm text-gray-500">
              {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* Submit form */}
      {session && !submitted && (
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Write a review</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Rating</label>
              <InteractiveStars value={rating} onChange={setRating} />
            </div>
            <div>
              <label htmlFor="review-title" className="mb-1 block text-sm font-medium text-gray-700">
                Title <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                placeholder="Summarise your experience"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label htmlFor="review-comment" className="mb-1 block text-sm font-medium text-gray-700">
                Comment <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Tell others what you thought about this product"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
              />
            </div>
            <button
              onClick={() => submit.mutate()}
              disabled={rating === 0 || submit.isPending}
              className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              {submit.isPending ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No reviews yet. {session ? 'Be the first to review this product!' : 'Sign in to leave a review.'}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  )
}
