import { notFound } from 'next/navigation'
import { fetchProduct, fetchProducts } from '@/lib/api'
import { ProductDetail } from '@/components/store/ProductDetail'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const result = await fetchProducts({ per_page: 100 })
    return result.data.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const product = await fetchProduct(slug)
    return {
      title: product.name,
      description: product.short_description,
    }
  } catch {
    return { title: 'Product not found' }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  let product
  try {
    product = await fetchProduct(slug)
  } catch {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ProductDetail product={product} />
    </div>
  )
}
