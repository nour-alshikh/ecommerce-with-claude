'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { StatsCard } from '@/components/admin/StatsCard'
import { StatusBadge } from '@/components/admin/StatusBadge'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

interface Stats {
  revenue: { today: number; week: number; month: number }
  orders: { today: number; week: number; month: number; pending: number; processing: number }
  customers: { total: number; this_month: number }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [topProducts, setTopProducts] = useState<Array<{ product_id: number; product_name: string; total_sold: number; total_revenue: number }>>([])
  const [recentOrders, setRecentOrders] = useState<Array<{ id: number; status: string; total: number; created_at: string; customer: { name: string } }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').then((r) => setStats(r.data.data)),
      api.get('/admin/stats/top-products').then((r) => setTopProducts(r.data.data)),
      api.get('/admin/orders?per_page=5').then((r) => setRecentOrders(r.data.data)),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Revenue Today" value={formatPrice(stats?.revenue.today ?? 0)} />
        <StatsCard label="Revenue This Month" value={formatPrice(stats?.revenue.month ?? 0)} />
        <StatsCard label="Orders This Month" value={stats?.orders.month ?? 0} sub={`${stats?.orders.pending ?? 0} pending`} />
        <StatsCard label="Total Customers" value={stats?.customers.total ?? 0} sub={`+${stats?.customers.this_month ?? 0} this month`} trend="up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-400">No orders yet.</td></tr>
              ) : recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      #{o.id}
                    </Link>
                    <p className="text-xs text-gray-400">{o.customer?.name}</p>
                  </td>
                  <td className="py-2"><StatusBadge status={o.status} /></td>
                  <td className="py-2 text-right font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top products */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {topProducts.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-400">No sales yet.</td></tr>
              ) : topProducts.map((p, i) => (
                <tr key={p.product_id}>
                  <td className="py-2">
                    <span className="mr-3 text-xs font-bold text-gray-300">#{i + 1}</span>
                    <span className="font-medium text-gray-900">{p.product_name}</span>
                  </td>
                  <td className="py-2 text-right">
                    <span className="font-medium text-gray-700">{p.total_sold} sold</span>
                    <p className="text-xs text-gray-400">{formatPrice(p.total_revenue)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { href: '/admin/orders?status=pending', label: 'Pending Orders', count: stats?.orders.pending },
          { href: '/admin/reviews', label: 'Pending Reviews', count: null },
          { href: '/admin/coupons', label: 'Manage Coupons', count: null },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 hover:shadow-sm"
          >
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
            {item.count !== undefined && item.count !== null && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {item.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
