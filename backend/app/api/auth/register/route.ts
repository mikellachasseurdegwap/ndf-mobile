import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

// Schéma de validation
const registerSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  expense_report_id: z.string().optional(),
})

// POST /api/auth/register — Inscription membre
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validation Zod
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(data.password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password_hash,
        role: 'user',
      },
    })

    // Lier la NDF à l'utilisateur si un ID est fourni
    if (data.expense_report_id) {
      await prisma.expenseReport.update({
        where: { id: data.expense_report_id },
        data: { user_id: user.id },
      })
    }

    // Générer le token JWT
    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    })

    // Créer la réponse avec cookie httpOnly
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
          },
        },
      },
      { status: 201 }
    )

    // Poser le cookie JWT
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
