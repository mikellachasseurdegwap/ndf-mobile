import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/expenses — Toutes les NDF (trésorier)
export async function GET(req: NextRequest) {
  try {
    // Vérifier JWT + role admin
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès réservé au trésorier' },
        { status: 403 }
      )
    }

    // Récupérer les filtres depuis l'URL
    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const commission = searchParams.get('commission')

    // Construire les filtres dynamiquement
    const where: any = {
      statut: { not: 'draft' }, // On exclut les brouillons
    }

    if (statut) where.statut = statut
    if (commission) where.commission = commission

    // Récupérer toutes les NDF
    const reports = await prisma.expenseReport.findMany({
      where,
      include: {
        expenses: true,
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
      orderBy: { submitted_at: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: reports },
      { status: 200 }
    )
  } catch (error) {
    console.error('[ADMIN EXPENSES GET ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}