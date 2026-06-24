import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyResetToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    const payload = verifyResetToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Lien invalide ou expiré' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    const password_hash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash },
    })

    return NextResponse.json(
      { success: true, message: 'Mot de passe mis à jour avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
