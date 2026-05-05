import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="text-lg font-bold text-gray-900">
            Store <span className="text-xs font-normal text-gray-400">admin</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-1">
          <NavLink href="/admin" exact>Dashboard</NavLink>
          <NavLink href="/admin/products">Products</NavLink>
          <NavLink href="/admin/categories">Categories</NavLink>
        </nav>
        <div className="border-t border-gray-200 p-4">
          <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">
            ← Back to store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 lg:hidden">
          <Link href="/" className="text-lg font-bold text-gray-900">Store Admin</Link>
          <nav className="flex gap-3 text-sm">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/admin/products" className="text-gray-600 hover:text-gray-900">Products</Link>
            <Link href="/admin/categories" className="text-gray-600 hover:text-gray-900">Categories</Link>
          </nav>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

function NavLink({ href, children, exact }: { href: string; children: React.ReactNode; exact?: boolean }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    >
      {children}
    </Link>
  )
}
