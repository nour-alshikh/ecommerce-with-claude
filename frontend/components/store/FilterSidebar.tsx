'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
}

export function FilterSidebar({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') ?? '')

  const currentCategory = searchParams.get('category') ?? ''

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams],
  )

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('min_price', minPrice)
    else params.delete('min_price')
    if (maxPrice) params.set('max_price', maxPrice)
    else params.delete('max_price')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAll = () => {
    setMinPrice('')
    setMaxPrice('')
    router.push(pathname)
  }

  const hasFilters = searchParams.toString() !== ''

  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-indigo-600 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Category
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParam('category', null)}
                className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  !currentCategory
                    ? 'bg-indigo-50 font-medium text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    currentCategory === cat.slug
                      ? 'bg-indigo-50 font-medium text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Price range */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Price range
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            />
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="mt-2 w-full rounded-lg bg-gray-900 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
          >
            Apply
          </button>
        </div>
      </div>
    </aside>
  )
}
