import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

const registerSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
})

export async function POST(req: NextRequest) {
  try {
    const validation = registerSchema.safeParse(await req.json())
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.issues[0].message }, { status: 400 })
    }

    const data = validation.data
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password_hash: await bcrypt.hash(data.password, 12),
        role: 'user',
      },
    })

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
    }, { status: 201 })
  } catch (error) {
    console.error('[MOBILE REGISTER ERROR]', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
