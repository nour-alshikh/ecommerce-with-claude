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

// Local cart item (Zustand / localStorage)
export interface CartItem {
  product: Product
  variantId: number | null
  variantName: string | null
  quantity: number
  unitPrice: number
}

// Server-side cart types
export interface ServerCartItem {
  id: number
  product_id: number
  variant_id: number | null
  quantity: number
  unit_price: number
  subtotal: number
  product: Product
  variant: ProductVariant | null
}

export interface ServerCart {
  id: number
  items: ServerCartItem[]
  coupon: { code: string; type: 'percentage' | 'fixed'; value: number } | null
  subtotal: number
  discount: number
  total: number
  item_count: number
}

export interface Address {
  id: number
  label: string | null
  full_name: string
  phone: string | null
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export interface OrderItem {
  id: number
  product_id: number
  variant_id: number | null
  product_name: string
  variant_name: string | null
  unit_price: number
  quantity: number
  subtotal: number
}

export interface WishlistItem {
  id: number
  product_id: number
  product: Product
  created_at: string
}

export interface Review {
  id: number
  user_name: string
  rating: number
  title: string | null
  comment: string | null
  created_at: string
}

export interface Order {
  id: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  coupon_code: string | null
  items: OrderItem[]
  payment: { status: string; provider_id: string } | null
  shipping_name: string | null
  shipping_line1: string | null
  shipping_line2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_postal_code: string | null
  shipping_country: string | null
  notes: string | null
  created_at: string
}
