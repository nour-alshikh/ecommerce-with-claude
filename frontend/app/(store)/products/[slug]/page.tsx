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
    const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
    return {
      title: product.name,
      description: product.short_description || product.description?.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.short_description || product.description?.slice(0, 160),
        type: 'website',
        images: primaryImage ? [{ url: primaryImage.url, alt: product.name }] : [],
      },
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

  const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: primaryImage?.url,
    offers: {
      '@type': 'Offer',
      price: product.effective_price,
      priceCurrency: 'USD',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </div>
  )
}
