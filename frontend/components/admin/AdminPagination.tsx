'use client'

interface Props {
  currentPage: number
  lastPage: number
  total: number
  itemLabel: string
  onPageChange: (page: number) => void
}

function getPageWindow(current: number, last: number): (number | '…')[] {
  const pages = new Set([1, last])
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= last) pages.add(i)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | '…')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
}

export function AdminPagination({ currentPage, lastPage, total, itemLabel, onPageChange }: Props) {
  if (lastPage <= 1) return null

  const pages = getPageWindow(currentPage, lastPage)

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
      <span>{total.toLocaleString()} {itemLabel}</span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[2rem] rounded px-2 py-1 text-center ${
                p === currentPage
                  ? 'bg-gray-900 text-white font-medium'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  )
}
