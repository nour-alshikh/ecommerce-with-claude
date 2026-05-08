import { act } from '@testing-library/react'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/lib/types'

const mockProduct: Product = {
  id: 1,
  name: 'Test Shirt',
  slug: 'test-shirt',
  description: 'A test product',
  short_description: 'Test',
  price: 29.99,
  sale_price: null,
  effective_price: 29.99,
  stock: 10,
  sku: 'TST-001',
  status: 'active',
  is_featured: false,
  views_count: 0,
  category: { id: 1, name: 'Clothing', slug: 'clothing', image_url: null, parent_id: null, sort_order: 0 },
  images: [],
  variants: [],
  created_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  act(() => useCartStore.setState({ items: [] }))
})

describe('cartStore', () => {
  test('starts empty', () => {
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('addItem adds a new item', () => {
    act(() => useCartStore.getState().addItem(mockProduct))
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].product.id).toBe(1)
    expect(items[0].quantity).toBe(1)
    expect(items[0].unitPrice).toBe(29.99)
  })

  test('addItem increments quantity for duplicate', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().addItem(mockProduct)
    })
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  test('addItem treats different variants as separate items', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct, 1, 'M')
      useCartStore.getState().addItem(mockProduct, 2, 'L')
    })
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  test('removeItem removes the correct item', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().removeItem(mockProduct.id, null)
    })
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('updateQty changes quantity', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().updateQty(mockProduct.id, null, 5)
    })
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  test('updateQty with qty < 1 removes item', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().updateQty(mockProduct.id, null, 0)
    })
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('clearCart empties all items', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().clearCart()
    })
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('totalItems returns sum of quantities', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().addItem({ ...mockProduct, id: 2 })
    })
    expect(useCartStore.getState().totalItems()).toBe(3)
  })

  test('totalPrice returns sum of unit prices × quantities', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().addItem(mockProduct)
    })
    expect(useCartStore.getState().totalPrice()).toBeCloseTo(59.98)
  })

  test('sale price is used as unit price when set', () => {
    const saleProduct = { ...mockProduct, sale_price: 19.99, effective_price: 19.99 }
    act(() => useCartStore.getState().addItem(saleProduct))
    expect(useCartStore.getState().items[0].unitPrice).toBe(19.99)
  })
})
