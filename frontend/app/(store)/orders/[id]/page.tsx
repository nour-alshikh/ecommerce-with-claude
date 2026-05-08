import { auth } from '@/lib/auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

async function getOrder(token: string, id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    },
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch order')
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
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

interface OrderPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ payment_intent?: string }>
}

export default async function OrderDetailPage({ params, searchParams }: OrderPageProps) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { id } = await params
  const { payment_intent } = await searchParams
  const token = (session.user as { token?: string })?.token ?? ''

  const result = await getOrder(token, id)
  if (!result) notFound()

  const order = result.data
  const justPaid = !!payment_intent

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {justPaid && (
        <div className="mb-6 rounded-2xl bg-green-50 p-5 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-green-800">Payment received!</h2>
          <p className="mt-1 text-sm text-green-700">
            Your order is confirmed. You'll receive a confirmation email shortly.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Items */}
        <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Items</h2>
          <ul className="divide-y divide-gray-100">
            {order.items.map((item: {
              id: number
              product_name: string
              variant_name: string | null
              quantity: number
              unit_price: number
              subtotal: number
            }) => (
              <li key={item.id} className="flex justify-between py-3 text-sm">
                <span className="text-gray-700">
                  {item.product_name}
                  {item.variant_name ? ` — ${item.variant_name}` : ''}{' '}
                  <span className="text-gray-400">×{item.quantity}</span>
                </span>
                <span className="font-medium text-gray-900">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Shipping */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-3 font-semibold text-gray-900">Shipping Address</h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-medium text-gray-900">{order.shipping_name}</p>
            <p>{order.shipping_line1}{order.shipping_line2 ? `, ${order.shipping_line2}` : ''}</p>
            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
            <p>{order.shipping_country}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-3 font-semibold text-gray-900">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.shipping > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/orders" className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          ← All Orders
        </Link>
        <Link href="/products" className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
