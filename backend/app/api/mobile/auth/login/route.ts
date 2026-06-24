import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export async function POST(req: NextRequest) {
  try {
    const validation = loginSchema.safeParse(await req.json())
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.issues[0].message }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: validation.data.email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const passwordOk = await bcrypt.compare(validation.data.password, user.password_hash)
    if (!passwordOk) {
      return NextResponse.json({ success: false, error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const token = signToken({ userId: user.id, role: user.role, email: user.email })

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('[MOBILE LOGIN ERROR]', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
