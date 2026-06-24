import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/expenses/[id] — Détail d'une NDF
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier JWT
    const { id } = await params
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

    // Récupérer la NDF
    const report = await prisma.expenseReport.findUnique({
      where: {id},
      include: { expenses: true },
    })

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Note de frais introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que c'est bien sa NDF (sauf admin)
    if (payload.role !== 'admin' && report.user_id !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Accès interdit' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: true, data: report },
      { status: 200 }
    )
  } catch (error) {
    console.error('[EXPENSES GET ID ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}