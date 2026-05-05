import Link from 'next/link'

export default function AdminDashboard() {
  const cards = [
    { label: 'Products', href: '/admin/products', icon: '📦', desc: 'Manage your product catalog' },
    { label: 'Categories', href: '/admin/categories', icon: '🗂️', desc: 'Organize product categories' },
    { label: 'Orders', href: '/admin/orders', icon: '🛒', desc: 'View and manage orders (Phase 4)' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">{card.icon}</div>
            <h2 className="mt-3 text-base font-semibold text-gray-900">{card.label}</h2>
            <p className="mt-1 text-sm text-gray-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
