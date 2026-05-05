'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface Props {
  currentPage: number
  lastPage: number
  total: number
}

export function Pagination({ currentPage, lastPage, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (lastPage <= 1) return null

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2,
  )

  return (
    <div className="flex items-center justify-between pt-8">
      <p className="text-sm text-gray-500">
        Page {currentPage} of {lastPage} ({total} products)
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          Prev
        </button>
        {pages.map((p, i) => {
          const prev = pages[i - 1]
          const showEllipsis = prev && p - prev > 1
          return (
            <span key={p} className="flex gap-1">
              {showEllipsis && (
                <span className="px-2 py-1.5 text-sm text-gray-400">…</span>
              )}
              <button
                onClick={() => goTo(p)}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  p === currentPage
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            </span>
          )
        })}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
