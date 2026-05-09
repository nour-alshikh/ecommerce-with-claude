'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Settings {
  store_name: string
  store_email: string
  currency: string
  tax_rate: string
  low_stock_threshold: string
  free_shipping_threshold: string
  maintenance_mode: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setSettings(data.data))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      const { data } = await api.put('/admin/settings', settings)
      setSettings(data.data)
      setMsg('Settings saved.')
    } catch {
      setMsg('Failed to save settings.')
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  if (loading) return <div className="animate-pulse h-96 rounded-2xl bg-gray-100" />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      {msg && (
        <div className="mb-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{msg}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Store Info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Store Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Store Name</label>
              <input
                value={settings?.store_name ?? ''}
                onChange={(e) => setSettings((s) => s ? { ...s, store_name: e.target.value } : s)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Store Email</label>
              <input
                type="email"
                value={settings?.store_email ?? ''}
                onChange={(e) => setSettings((s) => s ? { ...s, store_email: e.target.value } : s)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Commerce */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Commerce</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Currency</label>
              <select
                value={settings?.currency ?? 'USD'}
                onChange={(e) => setSettings((s) => s ? { ...s, currency: e.target.value } : s)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings?.tax_rate ?? ''}
                onChange={(e) => setSettings((s) => s ? { ...s, tax_rate: e.target.value } : s)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Free Shipping Over ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings?.free_shipping_threshold ?? ''}
                onChange={(e) => setSettings((s) => s ? { ...s, free_shipping_threshold: e.target.value } : s)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Low Stock Threshold (units)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings?.low_stock_threshold ?? ''}
                onChange={(e) => setSettings((s) => s ? { ...s, low_stock_threshold: e.target.value } : s)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Maintenance</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.maintenance_mode === '1'}
              onChange={(e) => setSettings((s) => s ? { ...s, maintenance_mode: e.target.checked ? '1' : '0' } : s)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-sm text-gray-700">Enable maintenance mode (storefront hidden from guests)</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
