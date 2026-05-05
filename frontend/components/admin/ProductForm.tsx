'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'
import type { Category, Product } from '@/lib/types'

interface Props {
  product?: Product
}

interface VariantInput {
  id?: number
  name: string
  price_modifier: number
  stock: number
}

export function ProductForm({ product }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    category_id: product?.category?.id ? String(product.category.id) : '',
    price: product?.price ?? '',
    sale_price: product?.sale_price ?? '',
    stock: product?.stock ?? 0,
    sku: product?.sku ?? '',
    status: product?.status ?? 'active',
    is_featured: product?.is_featured ?? false,
    description: product?.description ?? '',
    short_description: product?.short_description ?? '',
  })

  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants?.map((v) => ({ id: v.id, name: v.name, price_modifier: v.price_modifier, stock: v.stock })) ?? [],
  )

  useEffect(() => {
    api.get('/admin/categories').then(({ data }) => setCategories(data.data))
  }, [])

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const addVariant = () =>
    setVariants((prev) => [...prev, { name: '', price_modifier: 0, stock: 0 }])

  const removeVariant = (i: number) =>
    setVariants((prev) => prev.filter((_, idx) => idx !== i))

  const updateVariant = (i: number, key: string, value: unknown) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        sale_price: form.sale_price === '' ? null : Number(form.sale_price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
        variants: variants.map((v) => ({ ...v, price_modifier: Number(v.price_modifier), stock: Number(v.stock) })),
      }

      if (product) {
        await api.put(`/admin/products/${product.id}`, payload)
      } else {
        await api.post('/admin/products', payload)
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product || !e.target.files?.length) return
    const fd = new FormData()
    Array.from(e.target.files).forEach((f) => fd.append('images[]', f))
    await api.post(`/admin/products/${product.id}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    router.refresh()
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400'
  const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Basic info</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name *</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>SKU *</label>
            <input required value={form.sku} onChange={(e) => set('sku', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <select required value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Short description</label>
          <input value={form.short_description} onChange={(e) => set('short_description', e.target.value)} className={inputCls} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => set('is_featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          <span className="text-sm text-gray-700">Featured product</span>
        </label>
      </div>

      {/* Pricing & stock */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Pricing & stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Price *</label>
            <input type="number" min={0} step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Sale price</label>
            <input type="number" min={0} step="0.01" value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} className={inputCls} placeholder="Leave blank for no sale" />
          </div>
          <div>
            <label className={labelCls}>Stock</label>
            <input type="number" min={0} value={form.stock} onChange={(e) => set('stock', e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Variants <span className="text-xs font-normal text-gray-400">(sizes, options)</span></h2>
          <button type="button" onClick={addVariant} className="text-sm font-medium text-indigo-600 hover:underline">+ Add</button>
        </div>
        {variants.length === 0 ? (
          <p className="text-sm text-gray-400">No variants. The product has a single stock quantity above.</p>
        ) : (
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  placeholder="Name (e.g. S, M, L)"
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price mod"
                  value={v.price_modifier}
                  onChange={(e) => updateVariant(i, 'price_modifier', e.target.value)}
                  className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                  className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images (edit mode only) */}
      {product && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Images</h2>
          <div className="flex flex-wrap gap-3">
            {product.images?.map((img) => (
              <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                {img.is_primary && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[9px] text-white py-0.5">Primary</span>
                )}
              </div>
            ))}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Upload images
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
