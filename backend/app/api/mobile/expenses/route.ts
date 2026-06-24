import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendEmailConfirmationSoumission, sendEmailSoumission } from '@/lib/email'

const BAREMES = {
  voiture: 0.36,
  moto: 0.14,
}

const expenseSchema = z.object({
  nom: z.string().min(1, 'Nom requis').optional(),
  prenom: z.string().min(1, 'Prénom requis').optional(),
  email: z.string().email('Email invalide').optional(),
  commission: z.string().min(1, 'Commission requise'),
  objet_action: z.string().min(1, 'Objet requis'),
  date_action: z.string().min(1, 'Date action requise'),
  ville_depart: z.string().min(1, 'Ville de départ requise'),
  ville_arrivee: z.string().min(1, 'Ville arrivée requise'),
  expenses: z.array(z.object({
    categorie: z.enum(['voiture', 'moto', 'train', 'bus', 'avion', 'hotel', 'repas', 'autre']),
    description: z.string().min(1, 'Description requise'),
    montant: z.number().positive('Montant invalide'),
    date_depense: z.string().min(1, 'Date dépense requise'),
    km: z.number().optional(),
    justificatif_url: z.string().optional(),
    justificatif_urls: z.array(z.string()).optional(),
  })).min(1, 'Au moins une dépense requise'),
})

function getPayload(req: NextRequest) {
  const header = req.headers.get('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  return token ? verifyToken(token) : null
}

function calculerMontantRetenu(categorie: string, montant: number, km?: number) {
  if (categorie === 'voiture' && km) return Math.round(km * BAREMES.voiture * 100) / 100
  if (categorie === 'moto' && km) return Math.round(km * BAREMES.moto * 100) / 100
  if (categorie === 'repas') return Math.min(montant, 25)
  if (categorie === 'hotel') return Math.min(montant, 100)
  return montant
}

export async function GET(req: NextRequest) {
  try {
    const payload = getPayload(req)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const reports = await prisma.expenseReport.findMany({
      where: { user_id: payload.userId },
      include: { expenses: true },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ success: true, data: reports })
  } catch (error) {
    console.error('[MOBILE EXPENSES GET ERROR]', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getPayload(req)
    const validation = expenseSchema.safeParse(await req.json())
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.issues[0].message }, { status: 400 })
    }

    const data = validation.data
    if (!payload && (!data.nom || !data.prenom || !data.email)) {
      return NextResponse.json(
        { success: false, error: 'Nom, prénom et email requis pour une soumission sans compte' },
        { status: 400 }
      )
    }

    const now = new Date()
    for (const expense of data.expenses) {
      const dateDepense = new Date(expense.date_depense)
      const diffJours = Math.floor((now.getTime() - dateDepense.getTime()) / (1000 * 60 * 60 * 24))
      if (diffJours > 30) {
        return NextResponse.json(
          { success: false, error: `Délai de 30 jours dépassé pour la dépense du ${expense.date_depense}` },
          { status: 400 }
        )
      }
    }

    const expenses = data.expenses.map((expense) => ({
      ...expense,
      montant_retenu: calculerMontantRetenu(expense.categorie, expense.montant, expense.km),
    }))
    const montantTotal = expenses.reduce((sum, expense) => sum + expense.montant_retenu, 0)
    const user = payload
      ? await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { nom: true, prenom: true, email: true },
        })
      : null
    const demandeur = {
      nom: user?.nom ?? data.nom ?? '',
      prenom: user?.prenom ?? data.prenom ?? '',
      email: user?.email ?? data.email ?? null,
    }

    const report = await prisma.expenseReport.create({
      data: {
        user_id: payload?.userId ?? null,
        demandeur_nom: demandeur.nom,
        demandeur_prenom: demandeur.prenom,
        demandeur_email: demandeur.email,
        commission: data.commission,
        objet_action: data.objet_action,
        date_action: new Date(data.date_action),
        ville_depart: data.ville_depart,
        ville_arrivee: data.ville_arrivee,
        montant_total: montantTotal,
        statut: 'submitted',
        submitted_at: new Date(),
        expenses: {
          create: expenses.map((expense) => ({
            categorie: expense.categorie,
            description: expense.description,
            montant: expense.montant,
            montant_retenu: expense.montant_retenu,
            justificatif_url: expense.justificatif_urls?.length
              ? JSON.stringify(expense.justificatif_urls)
              : (expense.justificatif_url ?? null),
            date_depense: new Date(expense.date_depense),
          })),
        },
      },
      include: { expenses: true },
    })

    const nomComplet = `${demandeur.prenom} ${demandeur.nom}`.trim()

    try {
      await sendEmailSoumission(report.id, nomComplet, montantTotal)

      if (demandeur.email) {
        await sendEmailConfirmationSoumission(
          demandeur.email,
          nomComplet,
          report.id,
          montantTotal
        )
      }
    } catch (emailError) {
      console.error('[MOBILE EXPENSES EMAIL ERROR]', emailError)
    }

    return NextResponse.json({ success: true, data: report }, { status: 201 })
  } catch (error) {
    console.error('[MOBILE EXPENSES POST ERROR]', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
