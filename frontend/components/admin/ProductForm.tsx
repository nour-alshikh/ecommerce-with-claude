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
  price_modifier: number | ''
  stock: number | ''
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProductForm({ product }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const isEdit = !!product

  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
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
    product?.variants?.map((v) => ({
      id: v.id,
      name: v.name,
      price_modifier: v.price_modifier,
      stock: v.stock,
    })) ?? [],
  )

  useEffect(() => {
    api.get('/admin/categories').then(({ data }) => setCategories(data.data))
  }, [])

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleNameChange = (name: string) => {
    set('name', name)
    if (!slugManuallyEdited) {
      set('slug', toSlug(name))
    }
  }

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    set('slug', slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))
  }

  const addVariant = () =>
    setVariants((prev) => [...prev, { name: '', price_modifier: 0, stock: 0 }])

  const removeVariant = (i: number) =>
    setVariants((prev) => prev.filter((_, idx) => idx !== i))

  const updateVariant = (i: number, key: string, value: unknown) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        sale_price: form.sale_price === '' ? null : Number(form.sale_price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
        variants: variants.map((v) => ({
          ...v,
          price_modifier: Number(v.price_modifier) || 0,
          stock: Number(v.stock) || 0,
        })),
      }

      if (product) {
        await api.put(`/admin/products/${product.id}`, payload)
      } else {
        await api.post('/admin/products', payload)
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data
      if (resp?.errors) {
        const flat: Record<string, string> = {}
        Object.entries(resp.errors).forEach(([k, v]) => { flat[k] = v[0] })
        setErrors(flat)
      } else {
        setErrors({ _global: resp?.message ?? 'Something went wrong.' })
      }
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

  const inputCls = (field?: string) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400 ${
      field && errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`
  const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors._global && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errors._global}</div>
      )}

      {/* Basic info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Basic info</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputCls('name')}
              placeholder="e.g. Classic White T-Shirt"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className={labelCls}>
              Slug *
              {!slugManuallyEdited && !isEdit && (
                <span className="ml-2 text-[10px] font-normal normal-case text-indigo-500">auto-generated</span>
              )}
            </label>
            <input
              required
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={inputCls('slug')}
              placeholder="classic-white-t-shirt"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
            <p className="mt-1 text-[11px] text-gray-400">Used in the product URL. Only a–z, 0–9, and hyphens.</p>
          </div>

          <div>
            <label className={labelCls}>Category *</label>
            <select
              required
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              className={inputCls('category_id')}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>}
          </div>

          <div>
            <label className={labelCls}>SKU</label>
            <input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              className={inputCls('sku')}
              placeholder="e.g. SHIRT-WHT-001"
            />
            {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls()}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={inputCls('description')}
            placeholder="Describe the product…"
          />
        </div>

        <div>
          <label className={labelCls}>Short description <span className="font-normal normal-case text-gray-400">(shown in listing cards)</span></label>
          <input
            value={form.short_description}
            onChange={(e) => set('short_description', e.target.value)}
            className={inputCls()}
            placeholder="One-line summary shown in product cards"
            maxLength={500}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => set('is_featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          <span className="text-sm text-gray-700">Featured — show on homepage</span>
        </label>
      </div>

      {/* Pricing & stock */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Pricing & stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className={`${inputCls('price')} pl-7`}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label className={labelCls}>Sale price <span className="font-normal normal-case text-gray-400">(optional)</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.sale_price}
                onChange={(e) => set('sale_price', e.target.value)}
                className={`${inputCls('sale_price')} pl-7`}
                placeholder="Leave blank for no sale"
              />
            </div>
            {errors.sale_price && <p className="mt-1 text-xs text-red-600">{errors.sale_price}</p>}
          </div>

          <div>
            <label className={labelCls}>Stock <span className="font-normal normal-case text-gray-400">(base, if no variants)</span></label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
              className={inputCls('stock')}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Variants</h2>
            <p className="mt-0.5 text-xs text-gray-400">Add sizes, colours, or any other options. Each variant has its own stock.</p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add variant
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-8 text-center">
            <p className="text-sm font-medium text-gray-500">No variants added</p>
            <p className="mt-1 text-xs text-gray-400">The stock field above applies to the whole product.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_140px_100px_36px] gap-3 px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Option name</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Price adjustment</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Stock</span>
              <span />
            </div>

            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_100px_36px] items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
                <input
                  required
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  placeholder="e.g. Small, Red, 256GB…"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">±$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={v.price_modifier}
                    onChange={(e) => updateVariant(i, 'price_modifier', e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                  placeholder="0"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  aria-label={`Remove variant ${v.name || i + 1}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            <p className="text-xs text-gray-400 px-1">
              Price adjustment is added to the base price. Use negative values for cheaper variants.
            </p>
          </div>
        )}
      </div>

      {/* Images (edit mode only) */}
      {product && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Images</h2>
          {product.images && product.images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {product.images.map((img) => (
                <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[9px] text-white py-0.5">Primary</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No images yet.</p>
          )}
          <div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
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
