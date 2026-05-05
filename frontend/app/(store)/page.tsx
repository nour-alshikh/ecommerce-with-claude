import Image from 'next/image'
import Link from 'next/link'
import { fetchCategories, fetchProducts } from '@/lib/api'
import { ProductCard } from '@/components/store/ProductCard'

export const revalidate = 60

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchProducts({ per_page: 8 }).then((r) => r.data.filter((p) => p.is_featured)).catch(() => []),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 py-20 text-center text-white sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Shop the latest
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
          Electronics, clothing, home goods, and more — all in one place.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow-md hover:bg-indigo-50"
        >
          Shop now
        </Link>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Shop by category</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-md"
                >
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      width={80}
                      height={80}
                      className="mx-auto mb-3 h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center">
                      <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured products */}
        {featured.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Featured products</h2>
              <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
