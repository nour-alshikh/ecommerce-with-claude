import { ImageResponse } from 'next/og'
import { fetchProduct } from '@/lib/api'

export const runtime = 'edge'
export const alt = 'Product'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await fetchProduct(slug).catch(() => null)

  const name = product?.name ?? 'Product'
  const price = product
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        product.effective_price,
      )
    : ''
  const category = product?.category?.name ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {category && (
          <p style={{ color: '#a5b4fc', fontSize: 24, margin: '0 0 12px', fontWeight: 500 }}>
            {category}
          </p>
        )}
        <h1 style={{ color: '#fff', fontSize: 64, fontWeight: 800, margin: '0 0 20px', lineHeight: 1.1 }}>
          {name.length > 50 ? name.slice(0, 50) + '…' : name}
        </h1>
        {price && (
          <p style={{ color: '#e0e7ff', fontSize: 40, fontWeight: 700, margin: 0 }}>{price}</p>
        )}
        <p style={{ position: 'absolute', top: 60, right: 60, color: '#818cf8', fontSize: 28, fontWeight: 700 }}>
          Store
        </p>
      </div>
    ),
    { ...size },
  )
}
