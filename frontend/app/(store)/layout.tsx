import { Header } from '@/components/store/Header'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Store. All rights reserved.
      </footer>
    </>
  )
}
