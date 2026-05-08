export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full animate-pulse space-y-4 lg:w-60">
          <div className="h-6 w-32 rounded bg-gray-200" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-gray-100" />
          ))}
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-100" />
                  <div className="h-6 w-1/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
