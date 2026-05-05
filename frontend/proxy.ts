import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_ROUTES = ['/admin']
const AUTH_REQUIRED_ROUTES = ['/checkout', '/orders', '/profile']

export async function proxy(request: NextRequest) {
  const { nextUrl } = request
  const pathname = nextUrl.pathname

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isAuthRequired = AUTH_REQUIRED_ROUTES.some((r) => pathname.startsWith(r))

  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', nextUrl))
    }
    if ((token as { role?: string }).role !== 'admin') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  if (isAuthRequired && !token) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
