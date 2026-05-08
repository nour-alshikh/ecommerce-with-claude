'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { StatusBadge } from '@/components/admin/StatusBadge'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

interface OrderRow {
  id: number
  status: string
  total: number
  created_at: string
  item_count: number
  customer: { id: number; name: string; email: string }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page) }
      if (status) params.status = status
      if (q) params.q = q
      const { data } = await api.get('/admin/orders', { params })
      setOrders(data.data)
      setMeta(data.meta)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [status])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Orders</h1>

      <form onSubmit={(e) => { e.preventDefault(); load(1) }} className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Search customer name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">All statuses</option>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No orders found.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{o.customer?.name}</p>
                    <p className="text-xs text-gray-400">{o.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.item_count}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs font-medium text-indigo-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{meta.total} orders</span>
          <div className="flex gap-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => load(p)}
                className={`rounded px-3 py-1 ${p === meta.current_page ? 'bg-gray-900 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
