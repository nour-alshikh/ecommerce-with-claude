import axios from 'axios'
import { getSession } from 'next-auth/react'
import type {
  Address,
  Category,
  Order,
  PaginatedResponse,
  Product,
  ProductFilters,
  ServerCart,
} from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

// ── Client-side axios instance (with auth token) ──────────────────────────
const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()
  const token = (session?.user as { token?: string })?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  },
)

export default api

// ── Server-side fetch helpers (no auth, for RSC / SSG / ISR) ─────────────
async function serverFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v)
    })
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json()
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await serverFetch<{ data: Category[] }>('/categories')
  return data.data
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const params: Record<string, string> = {}
  if (filters.q) params.q = filters.q
  if (filters.category) params.category = filters.category
  if (filters.min_price !== undefined) params.min_price = String(filters.min_price)
  if (filters.max_price !== undefined) params.max_price = String(filters.max_price)
  if (filters.sort) params.sort = filters.sort
  if (filters.page) params.page = String(filters.page)
  if (filters.per_page) params.per_page = String(filters.per_page)
  return serverFetch<PaginatedResponse<Product>>('/products', params)
}

export async function fetchProduct(slug: string): Promise<Product> {
  const data = await serverFetch<{ data: Product }>(`/products/${slug}`)
  return data.data
}

// ── Cart API (client-side) ────────────────────────────────────────────────
export const cartApi = {
  get: (sessionId?: string) =>
    api.get<{ data: ServerCart }>('/cart', {
      headers: sessionId ? { 'X-Session-Id': sessionId } : {},
    }),

  addItem: (productId: number, variantId: number | null, quantity: number, sessionId?: string) =>
    api.post<{ data: ServerCart }>(
      '/cart/items',
      { product_id: productId, variant_id: variantId, quantity },
      { headers: sessionId ? { 'X-Session-Id': sessionId } : {} },
    ),

  updateItem: (itemId: number, quantity: number, sessionId?: string) =>
    api.patch<{ data: ServerCart }>(
      `/cart/items/${itemId}`,
      { quantity },
      { headers: sessionId ? { 'X-Session-Id': sessionId } : {} },
    ),

  removeItem: (itemId: number, sessionId?: string) =>
    api.delete<{ data: ServerCart }>(`/cart/items/${itemId}`, {
      headers: sessionId ? { 'X-Session-Id': sessionId } : {},
    }),

  clear: (sessionId?: string) =>
    api.delete('/cart', {
      headers: sessionId ? { 'X-Session-Id': sessionId } : {},
    }),

  applyCoupon: (code: string, sessionId?: string) =>
    api.post<{ data: ServerCart }>(
      '/cart/coupon',
      { code },
      { headers: sessionId ? { 'X-Session-Id': sessionId } : {} },
    ),

  removeCoupon: (sessionId?: string) =>
    api.delete<{ data: ServerCart }>('/cart/coupon', {
      headers: sessionId ? { 'X-Session-Id': sessionId } : {},
    }),
}

// ── Address API ───────────────────────────────────────────────────────────
export const addressApi = {
  list: () => api.get<{ data: Address[] }>('/addresses'),
  create: (data: Omit<Address, 'id'>) => api.post<{ data: Address }>('/addresses', data),
  update: (id: number, data: Partial<Omit<Address, 'id'>>) =>
    api.put<{ data: Address }>(`/addresses/${id}`, data),
  remove: (id: number) => api.delete(`/addresses/${id}`),
}

// ── Payment API ───────────────────────────────────────────────────────────
export const paymentApi = {
  createIntent: (addressId: number) =>
    api.post<{ data: { order_id: number; client_secret: string } }>('/payments/intent', {
      address_id: addressId,
    }),
}

// ── Order API ─────────────────────────────────────────────────────────────
export const orderApi = {
  list: (page = 1) =>
    api.get<{ data: Order[]; meta: { current_page: number; last_page: number; total: number } }>(
      `/orders?page=${page}`,
    ),
  get: (id: number) => api.get<{ data: Order }>(`/orders/${id}`),
  cancel: (id: number) => api.post<{ data: Order }>(`/orders/${id}/cancel`),
}
