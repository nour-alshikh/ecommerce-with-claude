import Link from 'next/link'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">← Products</Link>
        <h1 className="text-2xl font-bold text-gray-900">New product</h1>
      </div>
      <ProductForm />
    </div>
  )
}
