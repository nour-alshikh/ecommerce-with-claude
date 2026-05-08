import { auth } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getOrders(token: string, page = 1) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orders?page=${page}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    },
  )
  if (!res.ok) return null
  return res.json()
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped:    'bg-purple-100 text-purple-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-gray-100 text-gray-600',
    refunded:   'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const token = (session.user as { token?: string })?.token ?? ''
  const result = await getOrders(token)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Order History</h1>

      {!result || result.data.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <svg className="h-16 w-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div>
            <p className="font-medium text-gray-700">No orders yet</p>
            <p className="mt-1 text-sm text-gray-400">Start shopping to see your orders here.</p>
          </div>
          <Link href="/products" className="rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {result.data.map((order: {
            id: number
            status: string
            total: number
            created_at: string
            items: Array<{ product_name: string; quantity: number }>
          }) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">Order #{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
                <p className="mt-1 text-sm text-gray-400 line-clamp-1">
                  {order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total)}
                </p>
                <p className="mt-1 text-xs text-indigo-600">View details →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
