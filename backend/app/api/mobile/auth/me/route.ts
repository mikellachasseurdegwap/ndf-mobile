import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function getBearerToken(req: NextRequest) {
  const header = req.headers.get('authorization')
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}

export async function GET(req: NextRequest) {
  try {
    const token = getBearerToken(req)
    const payload = token ? verifyToken(token) : null
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, nom: true, prenom: true, email: true, role: true, created_at: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('[MOBILE ME ERROR]', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
