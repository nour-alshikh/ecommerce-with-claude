'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { AdminPagination } from '@/components/admin/AdminPagination'

interface Review {
  id: number
  status: string
  rating: number
  title: string | null
  comment: string
  created_at: string
  user: { id: number; name: string }
  product: { id: number; name: string }
}

const STARS = [1, 2, 3, 4, 5]

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<number | null>(null)

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page) }
      if (status) params.status = status
      const { data } = await api.get('/admin/reviews', { params })
      setReviews(data.data)
      setMeta(data.meta)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [status])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActioning(id)
    try {
      const { data } = await api.post(`/admin/reviews/${id}/${action}`)
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: data.data.status } : r))
    } finally {
      setActioning(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center text-gray-400">
            No {status} reviews.
          </div>
        ) : reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-gray-900">{r.user.name}</span>
                  <span className="text-xs text-gray-400">on</span>
                  <span className="font-medium text-gray-700">{r.product.name}</span>
                  <StatusBadge status={r.status} />
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 flex items-center gap-0.5">
                  {STARS.map((s) => (
                    <svg
                      key={s}
                      className={`h-4 w-4 ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {r.title && <p className="mt-2 font-medium text-gray-900">{r.title}</p>}
                <p className="mt-1 text-sm text-gray-600 line-clamp-3">{r.comment}</p>
              </div>
              {r.status === 'pending' && (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleAction(r.id, 'approve')}
                    disabled={actioning === r.id}
                    className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'reject')}
                    disabled={actioning === r.id}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AdminPagination
        currentPage={meta.current_page}
        lastPage={meta.last_page}
        total={meta.total}
        itemLabel="reviews"
        onPageChange={load}
      />
    </div>
  )
}
