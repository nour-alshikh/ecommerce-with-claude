import type { MetadataRoute } from 'next'
import { fetchCategories, fetchProducts } from '@/lib/api'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const [products, categories] = await Promise.all([
    fetchProducts({ per_page: 200 }).then((r) => r.data).catch(() => []),
    fetchCategories().catch(() => []),
  ])

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/products?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
