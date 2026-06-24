import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Routes publiques (accessibles sans token)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/nouvelle-ndf',
  '/confirmation',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/expenses',
  '/api/pdf',
]

// Routes réservées aux admins
const ADMIN_ROUTES = [
  '/api/admin',
  '/admin',
]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Laisser passer les routes publiques
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  if (isPublic) return NextResponse.next()

  // Laisser passer les assets Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Vérifier le token JWT
  const token = req.cookies.get('token')?.value
  if (!token) {
    // Requête API → 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }
    // Page → redirect login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Vérifier accès admin
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  if (isAdminRoute && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé au trésorier' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}