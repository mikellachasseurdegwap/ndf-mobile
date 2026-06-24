import { NextRequest, NextResponse } from 'next/server'

// Le dépôt mobile garde uniquement les routes API.
// Les API gèrent elles-mêmes l'authentification via JWT ou headers Authorization.
const API_ROUTES = ['/api']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  return NextResponse.json(
    { success: false, error: 'Route web supprimée dans le backend mobile' },
    { status: 404 }
  )
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
