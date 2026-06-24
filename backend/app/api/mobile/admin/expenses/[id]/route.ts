import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendEmailRejet, sendEmailValidation } from '@/lib/email'

const updateSchema = z.object({
  action: z.enum(['approve', 'reject', 'paid']),
  commentaire: z.string().optional(),
  compte_analytique: z.string().optional(),
  ligne_objectif: z.string().optional(),
  piece_comptable: z.string().optional(),
})

function getAdminPayload(req: NextRequest) {
  const header = req.headers.get('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  const payload = token ? verifyToken(token) : null
  return payload?.role === 'admin' ? payload : null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAdminPayload(req)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé au trésorier' },
        { status: 403 }
      )
    }

    const { id } = await params
    const validation = updateSchema.safeParse(await req.json())
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validation.data
    if (data.action === 'reject' && !data.commentaire?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Motif du rejet obligatoire' },
        { status: 400 }
      )
    }

    const report = await prisma.expenseReport.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Note de frais introuvable' },
        { status: 404 }
      )
    }

    const statutMap = {
      approve: 'approved',
      reject: 'rejected',
      paid: 'paid',
    } as const

    const updated = await prisma.expenseReport.update({
      where: { id },
      data: {
        statut: statutMap[data.action],
        commentaire: data.commentaire ?? null,
        compte_analytique: data.compte_analytique ?? null,
        ligne_objectif: data.ligne_objectif ?? null,
        piece_comptable: data.piece_comptable ?? null,
        paid_at: data.action === 'paid' ? new Date() : undefined,
      },
    })

    const membreEmail = report.user?.email ?? report.demandeur_email
    const nomMembre = report.user
      ? `${report.user.prenom} ${report.user.nom}`
      : `${report.demandeur_prenom ?? ''} ${report.demandeur_nom ?? ''}`.trim()

    if (membreEmail) {
      try {
        if (data.action === 'approve') {
          await sendEmailValidation(membreEmail, nomMembre, id)
        }
        if (data.action === 'reject' && data.commentaire) {
          await sendEmailRejet(membreEmail, nomMembre, id, data.commentaire)
        }
      } catch (emailError) {
        console.error('[MOBILE ADMIN EMAIL ERROR]', emailError)
      }
    }

    return NextResponse.json(
      { success: true, data: { statut: updated.statut } },
      { status: 200 }
    )
  } catch (error) {
    console.error('[MOBILE ADMIN EXPENSES PATCH ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
