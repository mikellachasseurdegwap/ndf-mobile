import { NextResponse } from 'next/server'

// POST /api/auth/logout — Déconnexion
export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  )

  // Supprimer le cookie JWT
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}