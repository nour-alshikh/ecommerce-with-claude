'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { StatusBadge } from '@/components/admin/StatusBadge'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

interface CustomerDetail {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  orders_count: number
  orders_sum_total: number | null
  orders: Array<{
    id: number
    status: string
    total: number
    item_count: number
    created_at: string
  }>
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/customers/${id}`)
      .then(({ data }) => setCustomer(data.data))
      .finally(() => setLoading(false))
  }, [id])

  const handleBan = async () => {
    if (!confirm(`${customer?.role === 'banned' ? 'Unban' : 'Ban'} this customer?`)) return
    setActioning(true)
    try {
      const endpoint = customer?.role === 'banned' ? `/admin/customers/${id}/unban` : `/admin/customers/${id}/ban`
      const { data } = await api.post(endpoint)
      setCustomer((prev) => prev ? { ...prev, role: data.data.role } : prev)
      setMsg(customer?.role === 'banned' ? 'Customer unbanned.' : 'Customer banned.')
    } catch {
      setMsg('Action failed.')
    } finally {
      setActioning(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  if (loading) return <div className="animate-pulse h-96 rounded-2xl bg-gray-100" />
  if (!customer) return <p className="text-gray-400">Customer not found.</p>

  const isBanned = customer.role === 'banned'

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/customers" className="text-sm text-indigo-600 hover:underline">← Customers</Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{customer.name}</h1>
        </div>
        <StatusBadge status={isBanned ? 'banned' : 'active'} />
      </div>

      {msg && (
        <div className="mb-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{msg}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order history */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Order History</h2>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-left text-xs font-semibold uppercase text-gray-400">
                <tr>
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Items</th>
                  <th className="pb-2 text-right">Total</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customer.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="py-2">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-indigo-600 hover:underline">
                        #{o.id}
                      </Link>
                    </td>
                    <td className="py-2"><StatusBadge status={o.status} /></td>
                    <td className="py-2 text-right text-gray-600">{o.item_count}</td>
                    <td className="py-2 text-right font-medium">{formatPrice(o.total)}</td>
                    <td className="py-2 text-right text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Profile */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 font-semibold text-gray-900">Profile</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase">Email</dt>
                <dd className="text-gray-700">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase">Member since</dt>
                <dd className="text-gray-700">{new Date(customer.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase">Total orders</dt>
                <dd className="text-gray-700">{customer.orders_count}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase">Lifetime spent</dt>
                <dd className="font-semibold text-gray-900">{formatPrice(customer.orders_sum_total ?? 0)}</dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 font-semibold text-gray-900">Actions</h2>
            <button
              onClick={handleBan}
              disabled={actioning}
              className={`w-full rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40 ${
                isBanned
                  ? 'border-green-200 text-green-700 hover:bg-green-50'
                  : 'border-red-200 text-red-600 hover:bg-red-50'
              }`}
            >
              {actioning ? '…' : isBanned ? 'Unban Customer' : 'Ban Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
