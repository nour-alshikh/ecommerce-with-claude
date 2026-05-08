'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useCart } from '@/lib/hooks/useCart'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, isLoading, updateItem, removeItem } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)
  const headingId = 'cart-drawer-heading'

  // Focus trap + Escape key
  useEffect(() => {
    if (!open) return

    const drawer = drawerRef.current
    if (!drawer) return

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      if (focusable.length === 0) { e.preventDefault(); return }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 id={headingId} className="text-lg font-semibold text-gray-900">
            Cart{cart && cart.item_count > 0 ? ` (${cart.item_count})` : ''}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-gray-400" aria-live="polite">Loading…</div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <svg className="h-16 w-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-700">Your cart is empty</p>
                <p className="mt-1 text-sm text-gray-400">Add some products to get started.</p>
              </div>
              <Link
                href="/products"
                onClick={onClose}
                className="rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100" aria-label="Cart items">
              {cart.items.map((item) => {
                const primaryImg = item.product.images?.find((i) => i.is_primary) ?? item.product.images?.[0]
                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50" aria-hidden="true">
                      {primaryImg ? (
                        <Image src={primaryImg.url} alt="" fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-200">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={onClose}
                          className="line-clamp-1 text-sm font-medium text-gray-900 hover:underline focus:outline-none focus-visible:underline"
                        >
                          {item.product.name}
                        </Link>
                        <span className="shrink-0 text-sm font-semibold text-gray-900">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                      {item.variant && (
                        <p className="text-xs text-gray-400">{item.variant.name}</p>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border border-gray-200" role="group" aria-label={`Quantity for ${item.product.name}`}>
                          <button
                            onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                            aria-label={`Decrease quantity of ${item.product.name}`}
                            className="px-2 py-1 text-gray-500 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-medium" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                            aria-label={`Increase quantity of ${item.product.name}`}
                            className="px-2 py-1 text-gray-500 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem.mutate(item.id)}
                          aria-label={`Remove ${item.product.name} from cart`}
                          className="text-xs text-gray-400 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5">
            {cart.coupon && (
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-green-700">Coupon: {cart.coupon.code}</span>
                <span className="font-medium text-green-700">-{formatPrice(cart.discount)}</span>
              </div>
            )}
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(cart.total)}</span>
            </div>
            <Link
              href="/cart"
              onClick={onClose}
              className="mb-2 block w-full rounded-full border border-gray-300 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
            >
              View cart
            </Link>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full rounded-full bg-gray-900 py-3 text-center text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
