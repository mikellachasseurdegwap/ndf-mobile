import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signResetToken } from '@/lib/auth'
import { sendEmailResetPassword } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email requis' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Toujours répondre success pour ne pas révéler si l'email existe
    if (user) {
      const token = signResetToken(user.id, user.email)
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reinitialiser-mot-de-passe?token=${token}`
      await sendEmailResetPassword(user.email, resetUrl)
    }

    return NextResponse.json(
      { success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
