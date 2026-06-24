import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function getAdminPayload(req: NextRequest) {
  const header = req.headers.get('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  const payload = token ? verifyToken(token) : null
  return payload?.role === 'admin' ? payload : null
}

export async function GET(req: NextRequest) {
  try {
    const payload = getAdminPayload(req)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé au trésorier' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const commission = searchParams.get('commission')

    const where: any = {
      statut: { not: 'draft' },
    }

    if (statut && statut !== 'all') where.statut = statut
    if (commission) where.commission = commission

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

    return NextResponse.json({ success: true, data: reports }, { status: 200 })
  } catch (error) {
    console.error('[MOBILE ADMIN EXPENSES GET ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
