import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendEmailValidation, sendEmailRejet } from '@/lib/email'

// Schéma de validation
const updateSchema = z.object({
  action: z.enum(['approve', 'reject', 'paid']),
  commentaire: z.string().optional(),
  compte_analytique: z.string().optional(),
  ligne_objectif: z.string().optional(),
  piece_comptable: z.string().optional(),
})

// PATCH /api/admin/expenses/[id] — Valider / Rejeter / Rembourser
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier JWT + role admin
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

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès réservé au trésorier' },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Validation Zod
    const validation = updateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Vérifier que la NDF existe
    const report = await prisma.expenseReport.findUnique({
      where: {id},
      include: { user: true },
    })

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Note de frais introuvable' },
        { status: 404 }
      )
    }

    // Mapper l'action vers le statut
    const statutMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      paid: 'paid',
    }

    // Mettre à jour la NDF
    const updated = await prisma.expenseReport.update({
      where: {id},
      data: {
        statut: statutMap[data.action] as any,
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
          await sendEmailValidation(
            membreEmail,
            nomMembre,
            id
          )
        }

        if (data.action === 'reject' && data.commentaire) {
          await sendEmailRejet(
            membreEmail,
            nomMembre,
            id,
            data.commentaire
          )
        }
      } catch (emailError) {
        console.error('[ADMIN EMAIL ERROR]', emailError)
      }
    }

    return NextResponse.json(
      { success: true, data: { statut: updated.statut } },
      { status: 200 }
    )
  } catch (error) {
    console.error('[ADMIN PATCH ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
