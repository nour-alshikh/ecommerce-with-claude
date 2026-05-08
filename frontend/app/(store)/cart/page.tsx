'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/hooks/useCart'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem, applyCoupon, removeCoupon } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')

  const handleApplyCoupon = async () => {
    setCouponError('')
    try {
      await applyCoupon.mutateAsync(couponInput.trim().toUpperCase())
      setCouponInput('')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: { code?: string[] } } } })?.response?.data?.errors?.code?.[0] ??
        'Invalid coupon code.'
      setCouponError(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <svg className="h-20 w-20 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="mt-1 text-gray-500">Looks like you haven't added anything yet.</p>
        </div>
        <Link href="/products" className="rounded-full bg-gray-900 px-8 py-3 font-medium text-white hover:bg-gray-700">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
            {cart.items.map((item) => {
              const primaryImg = item.product.images?.find((i) => i.is_primary) ?? item.product.images?.[0]
              return (
                <li key={item.id} className="flex gap-5 p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    {primaryImg ? (
                      <Image src={primaryImg.url} alt={primaryImg.alt_text ?? item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-200">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.product.slug}`} className="font-medium text-gray-900 hover:underline">
                        {item.product.name}
                      </Link>
                      <span className="shrink-0 font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
                    </div>
                    {item.variant && <p className="text-sm text-gray-400">{item.variant.name}</p>}
                    <p className="text-sm text-gray-400">{formatPrice(item.unit_price)} each</p>

                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                          disabled={updateItem.isPending}
                          className="px-3 py-1 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="min-w-[2.5rem] text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          disabled={updateItem.isPending}
                          className="px-3 py-1 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="text-sm text-gray-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-{formatPrice(cart.discount)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>

          {/* Coupon */}
          {cart.coupon ? (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
              <span className="text-sm font-medium text-green-700">{cart.coupon.code}</span>
              <button
                onClick={() => removeCoupon.mutate()}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Coupon code"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim() || applyCoupon.isPending}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
            </div>
          )}

          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-full bg-gray-900 py-3 text-center text-sm font-semibold text-white hover:bg-gray-700"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
