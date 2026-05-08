'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

interface Coupon {
  id: number
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount: number | null
  max_discount_amount: number | null
  max_uses: number | null
  uses: number
  is_active: boolean
  expires_at: string | null
}

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  min_order_amount: '',
  max_discount_amount: '',
  max_uses: '',
  is_active: true,
  expires_at: '',
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/coupons')
      setCoupons(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (c: Coupon) => {
    setEditing(c)
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      min_order_amount: c.min_order_amount != null ? String(c.min_order_amount) : '',
      max_discount_amount: c.max_discount_amount != null ? String(c.max_discount_amount) : '',
      max_uses: c.max_uses != null ? String(c.max_uses) : '',
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
    })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
      max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active,
      expires_at: form.expires_at || null,
    }
    try {
      if (editing) {
        const { data } = await api.put(`/admin/coupons/${editing.id}`, payload)
        setCoupons((prev) => prev.map((c) => c.id === editing.id ? data.data : c))
        setMsg('Coupon updated.')
      } else {
        const { data } = await api.post('/admin/coupons', payload)
        setCoupons((prev) => [data.data, ...prev])
        setMsg('Coupon created.')
      }
      setShowForm(false)
    } catch {
      setMsg('Save failed.')
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon?')) return
    try {
      await api.delete(`/admin/coupons/${id}`)
      setCoupons((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setMsg('Delete failed.')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Coupon
        </button>
      </div>

      {msg && (
        <div className="mb-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{msg}</div>
      )}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Code</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Value {form.type === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Min Order Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.min_order_amount}
                onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            {form.type === 'percentage' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Max Discount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.max_discount_amount}
                  onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Max Uses</label>
              <input
                type="number"
                min="1"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Expires At</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3 text-right">Uses</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No coupons yet.</td></tr>
              ) : coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{c.code}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                    {c.min_order_amount != null && (
                      <span className="ml-1 text-xs text-gray-400">min {formatPrice(c.min_order_amount)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {c.uses}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(c)} className="text-xs font-medium text-indigo-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs font-medium text-red-500 hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
