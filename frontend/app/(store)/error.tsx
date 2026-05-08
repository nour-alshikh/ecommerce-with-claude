'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-500">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
