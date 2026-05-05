'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import type { Product, ProductVariant } from '@/lib/types'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function ProductDetail({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null,
  )
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)

  const images = product.images ?? []
  const currentImg = images[activeImg]

  const effectivePrice = selectedVariant
    ? product.effective_price + selectedVariant.price_modifier
    : product.effective_price

  const isOutOfStock = selectedVariant
    ? selectedVariant.stock === 0
    : product.stock === 0

  const handleAddToCart = () => {
    addItem(product, selectedVariant?.id ?? null, selectedVariant?.name ?? null)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Image gallery */}
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
          {currentImg ? (
            <Image
              src={currentImg.url}
              alt={currentImg.alt_text ?? product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-200">
              <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === activeImg ? 'border-indigo-500' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image src={img.url} alt={img.alt_text ?? ''} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-400">
          <Link href="/products" className="hover:text-gray-600">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category?.slug}`} className="hover:text-gray-600">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{product.name}</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-400">SKU: {product.sku}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">{formatPrice(effectivePrice)}</span>
          {product.sale_price && (
            <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
          {product.sale_price && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-600">
              {Math.round(((product.price - product.sale_price) / product.price) * 100)}% off
            </span>
          )}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              {selectedVariant ? `Size / Option: ${selectedVariant.name}` : 'Select an option'}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  disabled={v.stock === 0}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    selectedVariant?.id === v.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : v.stock === 0
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                      : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock badge */}
        <div>
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Out of stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              In stock
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`rounded-full py-3 text-base font-semibold shadow-sm transition ${
            added
              ? 'bg-green-600 text-white'
              : isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          {added ? '✓ Added to cart' : isOutOfStock ? 'Out of stock' : 'Add to cart'}
        </button>

        {/* Description */}
        <div className="border-t border-gray-100 pt-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Description</h2>
          <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
        </div>
      </div>
    </div>
  )
}
