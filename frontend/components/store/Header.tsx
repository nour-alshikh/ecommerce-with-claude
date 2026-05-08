'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CartDrawer } from './CartDrawer'
import { CartCount } from './CartCount'

export function Header() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const isAdmin = (session?.user as { role?: string })?.role === 'admin'
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Close user menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus() }
    }
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            Store
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex" aria-label="Main navigation">
            <Link href="/products" className="hover:text-gray-900">Products</Link>
            {isAdmin && (
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-700">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Open cart"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <CartCount />
            </button>

            {status === 'loading' ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />
            ) : session ? (
              <div className="relative" ref={menuRef}>
                <button
                  ref={menuButtonRef}
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls="user-menu"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {session.user?.name?.split(' ')[0]}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div
                    id="user-menu"
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                  >
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      onClick={() => setMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <hr className="my-1 border-gray-100" role="separator" />
                    <button
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
