import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { AddToCartButton } from './AddToCartButton'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function ProductCard({ product }: { product: Product }) {
  const primary = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
  const isOnSale = product.sale_price !== null
  const isOutOfStock = product.stock === 0 && (!product.variants || product.variants.length === 0)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-gray-50">
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.alt_text ?? product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isOnSale && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-gray-500 px-2 py-0.5 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {product.category?.name}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center gap-2 pt-2">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.effective_price)}
            </span>
            {isOnSale && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </Link>

        <div className="mt-3">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
