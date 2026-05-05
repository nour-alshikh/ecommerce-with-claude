import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ProductForm } from '@/components/admin/ProductForm'
import type { Product } from '@/lib/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const token = (session?.user as { token?: string })?.token

  const res = await fetch(`${BASE}/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) return <p className="p-6 text-red-600">Product not found.</p>

  const { data: product }: { data: Product } = await res.json()

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">← Products</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit: {product.name}</h1>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
