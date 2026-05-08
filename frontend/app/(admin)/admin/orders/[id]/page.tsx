'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { StatusBadge } from '@/components/admin/StatusBadge'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const TRANSITIONS: Record<string, string[]> = {
  pending:    ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
  refunded:   [],
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/orders/${id}`)
      setOrder(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const { data } = await api.patch(`/admin/orders/${id}/status`, { status: newStatus })
      setOrder((prev) => ({ ...prev, ...data.data }))
      setMsg(`Status updated to ${newStatus}.`)
    } catch {
      setMsg('Failed to update status.')
    } finally {
      setUpdating(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const handleRefund = async () => {
    if (!confirm('Issue a full refund for this order?')) return
    setRefunding(true)
    try {
      const { data } = await api.post(`/admin/orders/${id}/refund`)
      setOrder((prev) => ({ ...prev, ...data.data }))
      setMsg('Refund issued successfully.')
    } catch {
      setMsg('Refund failed.')
    } finally {
      setRefunding(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  if (loading) {
    return <div className="animate-pulse h-96 rounded-2xl bg-gray-100" />
  }

  if (!order) return <p className="text-gray-400">Order not found.</p>

  const status = order.status as string
  const allowedNext = TRANSITIONS[status] ?? []
  const items = (order.items as Array<{
    id: number; product_name: string; variant_name?: string; quantity: number; unit_price: number; subtotal: number
  }>)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-indigo-600 hover:underline">← Orders</Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Order #{order.id as number}</h1>
        </div>
        <StatusBadge status={status} />
      </div>

      {msg && (
        <div className="mb-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{msg}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Items</h2>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 text-left text-xs font-semibold uppercase text-gray-400">
              <tr>
                <th className="pb-2">Product</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Unit</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.variant_name && <p className="text-xs text-gray-400">{item.variant_name}</p>}
                  </td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-500">{formatPrice(item.unit_price)}</td>
                  <td className="py-2 text-right font-medium">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm text-right">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>{formatPrice(order.subtotal as number)}</span>
            </div>
            {(order.discount as number) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span><span>-{formatPrice(order.discount as number)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-gray-900">
              <span>Total</span><span>{formatPrice(order.total as number)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 font-semibold text-gray-900">Customer</h2>
            <p className="text-sm font-medium text-gray-900">{(order.customer as { name: string })?.name}</p>
            <p className="text-sm text-gray-500">{(order.customer as { email: string })?.email}</p>
            <Link
              href={`/admin/customers/${(order.customer as { id: number })?.id}`}
              className="mt-2 block text-xs text-indigo-600 hover:underline"
            >
              View profile →
            </Link>
          </div>

          {/* Shipping */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 font-semibold text-gray-900">Shipping</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{order.shipping_name as string}</p>
              <p>{order.shipping_line1 as string}</p>
              <p>{order.shipping_city as string}, {order.shipping_state as string} {order.shipping_postal_code as string}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 font-semibold text-gray-900">Actions</h2>
            <div className="space-y-2">
              {allowedNext.map((next) => (
                <button
                  key={next}
                  onClick={() => handleStatus(next)}
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium capitalize text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Mark as {next}
                </button>
              ))}
              {status === 'delivered' && (
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  {refunding ? 'Issuing refund…' : 'Issue Refund'}
                </button>
              )}
              {allowedNext.length === 0 && status !== 'delivered' && (
                <p className="text-xs text-gray-400">No further actions available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
