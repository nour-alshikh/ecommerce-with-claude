'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { addressApi, paymentApi } from '@/lib/api'
import { useCart } from '@/lib/hooks/useCart'
import type { Address } from '@/lib/types'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

// ── Step 1: Address selection ─────────────────────────────────────────────

function AddressStep({ onNext }: { onNext: (addressId: number) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list().then((r) => r.data.data as Address[]),
  })

  const [selected, setSelected] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    full_name: '', phone: '', line1: '', line2: '',
    city: '', state: '', postal_code: '', country: 'US', label: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSaveAddress = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const res = await addressApi.create({ ...form, is_default: !data?.length })
      const newAddress = res.data.data as Address
      setSelected(newAddress.id)
      setShowForm(false)
    } catch {
      setSaveError('Failed to save address. Please check your inputs.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse h-40 rounded-xl bg-gray-100" />
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Shipping Address</h2>

      {data && data.length > 0 && (
        <ul className="mb-4 space-y-3">
          {data.map((addr) => (
            <li key={addr.id}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selected === addr.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selected === addr.id}
                  onChange={() => setSelected(addr.id)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{addr.full_name}</p>
                  {addr.label && <p className="text-gray-400 text-xs">{addr.label}</p>}
                  <p className="text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p className="text-gray-600">{addr.city}, {addr.state} {addr.postal_code}</p>
                  <p className="text-gray-600">{addr.country}</p>
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-indigo-600 hover:underline"
        >
          + Add new address
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 p-5">
          <h3 className="mb-3 font-medium text-gray-900">New Address</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'full_name', label: 'Full Name', col: 2 },
              { name: 'label', label: 'Label (optional)', col: 2 },
              { name: 'line1', label: 'Street Address', col: 2 },
              { name: 'line2', label: 'Apt, suite, etc.', col: 2 },
              { name: 'city', label: 'City', col: 1 },
              { name: 'state', label: 'State', col: 1 },
              { name: 'postal_code', label: 'ZIP Code', col: 1 },
              { name: 'country', label: 'Country', col: 1 },
            ].map(({ name, label, col }) => (
              <div key={name} className={col === 2 ? 'col-span-2' : ''}>
                <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
                <input
                  type="text"
                  value={form[name as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            ))}
          </div>
          {saveError && <p className="mt-2 text-xs text-red-600">{saveError}</p>}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveAddress}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save address'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => selected && onNext(selected)}
        disabled={!selected}
        className="mt-6 w-full rounded-full bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-40"
      >
        Continue to Review
      </button>
    </div>
  )
}

// ── Step 2: Order Review + Payment redirect ───────────────────────────────

function ReviewStep({
  addressId,
  onBack,
}: {
  addressId: number
  onBack: () => void
}) {
  const { cart } = useCart()
  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list().then((r) => r.data.data as Address[]),
  })

  const address = addresses?.find((a) => a.id === addressId)

  const initiatePayment = useMutation({
    mutationFn: () => {
      const sessionId = localStorage.getItem('cart_session_id') ?? undefined
      return paymentApi.initiatePayment(addressId, sessionId).then((r) => r.data.data)
    },
    onSuccess: (data) => {
      window.location.href = data.iframe_url
    },
  })

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Review Order</h2>

      {address && (
        <div className="mb-5 rounded-xl bg-gray-50 p-4 text-sm">
          <p className="mb-1 font-medium text-gray-700">Shipping to</p>
          <p className="text-gray-600">{address.full_name}</p>
          <p className="text-gray-600">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
          <p className="text-gray-600">{address.city}, {address.state} {address.postal_code}</p>
        </div>
      )}

      {cart && (
        <ul className="mb-5 divide-y divide-gray-100 rounded-xl border border-gray-100">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-700">
                {item.product.name}
                {item.variant ? ` — ${item.variant.name}` : ''}{' '}
                <span className="text-gray-400">×{item.quantity}</span>
              </span>
              <span className="font-medium">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      )}

      {cart && (
        <div className="space-y-1 rounded-xl bg-gray-50 px-4 py-3 text-sm">
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
          <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        </div>
      )}

      {initiatePayment.isError && (
        <p className="mt-3 text-sm text-red-600">Something went wrong. Please try again.</p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={onBack}
          disabled={initiatePayment.isPending}
          className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={() => initiatePayment.mutate()}
          disabled={initiatePayment.isPending}
          className="flex-1 rounded-full bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-40"
        >
          {initiatePayment.isPending ? 'Redirecting…' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  )
}

// ── Checkout page orchestrator ────────────────────────────────────────────

const STEPS = ['Address', 'Review']

export default function CheckoutPage() {
  const [step, setStep] = useState(0)
  const [addressId, setAddressId] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <AddressStep
          onNext={(id) => { setAddressId(id); setStep(1) }}
        />
      )}

      {step === 1 && addressId && (
        <ReviewStep
          addressId={addressId}
          onBack={() => setStep(0)}
        />
      )}
    </div>
  )
}
