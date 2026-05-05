import { Suspense } from 'react'
import { fetchCategories, fetchProducts } from '@/lib/api'
import { FilterSidebar } from '@/components/store/FilterSidebar'
import { ProductGrid } from '@/components/store/ProductGrid'
import { SortDropdown } from '@/components/store/SortDropdown'
import { Pagination } from '@/components/store/Pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Products' }

interface PageProps {
  searchParams: Promise<Record<string, string | string[]>>
}

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const q = str(sp.q)
  const category = str(sp.category)
  const min_price = str(sp.min_price) ? Number(str(sp.min_price)) : undefined
  const max_price = str(sp.max_price) ? Number(str(sp.max_price)) : undefined
  const sort = (str(sp.sort) as 'latest' | 'price_asc' | 'price_desc' | 'popular') ?? 'latest'
  const page = str(sp.page) ? Number(str(sp.page)) : 1

  const [categories, result] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchProducts({ q, category, min_price, max_price, sort, page }).catch(() => ({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    })),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {q ? `Search: "${q}"` : category ? categories.find((c) => c.slug === category)?.name ?? 'Products' : 'All Products'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{result.meta.total} product{result.meta.total !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar — wrapped in Suspense because it uses useSearchParams internally */}
        <Suspense fallback={<div className="w-60 animate-pulse rounded-2xl bg-gray-100 h-64" />}>
          <FilterSidebar categories={categories} />
        </Suspense>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {result.data.length} of {result.meta.total}
            </p>
            <Suspense>
              <SortDropdown />
            </Suspense>
          </div>

          <ProductGrid products={result.data} />

          <Suspense>
            <Pagination
              currentPage={result.meta.current_page}
              lastPage={result.meta.last_page}
              total={result.meta.total}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
