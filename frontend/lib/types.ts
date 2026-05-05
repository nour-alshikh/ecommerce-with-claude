export interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
  parent_id: number | null
  sort_order: number
  children?: Category[]
}

export interface ProductImage {
  id: number
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
}

export interface ProductVariant {
  id: number
  name: string
  sku: string | null
  price_modifier: number
  stock: number
  sort_order: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  sale_price: number | null
  effective_price: number
  stock: number
  sku: string
  status: 'active' | 'inactive' | 'draft'
  is_featured: boolean
  views_count: number
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
  created_at: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ProductFilters {
  q?: string
  category?: string
  min_price?: number
  max_price?: number
  sort?: 'latest' | 'price_asc' | 'price_desc' | 'popular'
  page?: number
  per_page?: number
}

export interface CartItem {
  product: Product
  variantId: number | null
  variantName: string | null
  quantity: number
  unitPrice: number
}
