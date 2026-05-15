import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_NAME = 'euro_session'
const PUBLIC_PATHS = ['/', '/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(COOKIE_NAME)?.value
  const isLoggedIn = !!session

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/favicon')

  if (!isLoggedIn && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && pathname === '/login') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
