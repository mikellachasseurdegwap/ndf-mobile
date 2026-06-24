import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendEmailConfirmationSoumission, sendEmailSoumission } from '@/lib/email'

// Barèmes kilométriques FFS 2026
const BAREMES = {
  voiture: 0.36,
  moto: 0.14,
  covoiturage: 0.40,
}

// Schéma de validation Zod
const expenseSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Email invalide').optional(),
  commission: z.string().min(1, 'Commission requise'),
  objet_action: z.string().min(1, 'Objet requis'),
  date_action: z.string().min(1, 'Date requise'),
  ville_depart: z.string().min(1, 'Ville de départ requise'),
  ville_arrivee: z.string().min(1, 'Ville d\'arrivée requise'),
  expenses: z.array(z.object({
    categorie: z.enum(['voiture', 'moto', 'train', 'bus', 'avion', 'hotel', 'repas', 'autre']),
    description: z.string().min(1, 'Description requise'),
    montant: z.number().positive('Montant invalide'),
    justificatif_url: z.string().optional(),
    justificatif_urls: z.array(z.string()).optional(),
    date_depense: z.string().min(1, 'Date requise'),
    km: z.number().optional(),
  })),
})

// Fonction calcul montant retenu selon règles FFS
function calculerMontantRetenu(
  categorie: string,
  montant: number,
  km?: number
): number {
  if (categorie === 'voiture' && km) {
    return Math.round(km * BAREMES.voiture * 100) / 100
  }
  if (categorie === 'moto' && km) {
    return Math.round(km * BAREMES.moto * 100) / 100
  }
  if (categorie === 'repas') {
    return Math.min(montant, 25) // Plafond 25€ par repas
  }
  if (categorie === 'hotel') {
    return Math.min(montant, 100) // Plafond par défaut province
  }
  return montant
}

// POST /api/expenses — Créer une note de frais
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validation Zod
    const validation = expenseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Vérifier délai de 30 jours
    const expenses = data.expenses
    const now = new Date()
    for (const expense of expenses) {
      const dateDepense = new Date(expense.date_depense)
      const diffJours = Math.floor(
        (now.getTime() - dateDepense.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffJours > 30) {
        return NextResponse.json(
          { success: false, error: `Délai de 30 jours dépassé pour la dépense du ${expense.date_depense}` },
          { status: 400 }
        )
      }
    }

    // Récupérer user_id si connecté (JWT optionnel)
    let userId: string | null = null
    let user: { nom: string; prenom: string; email: string } | null = null
    const token = req.cookies.get('token')?.value
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        userId = payload.userId
        user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { nom: true, prenom: true, email: true },
        })
      }
    }

    const demandeur = {
      nom: user?.nom ?? data.nom,
      prenom: user?.prenom ?? data.prenom,
      email: user?.email ?? data.email ?? null,
    }

    // Calculer montants retenus et total
    const expensesAvecMontants = expenses.map((e) => ({
      ...e,
      montant_retenu: calculerMontantRetenu(e.categorie, e.montant, e.km),
    }))

    const montantTotal = expensesAvecMontants.reduce(
      (sum, e) => sum + e.montant_retenu,
      0
    )

    // Créer la note de frais en BDD
    const report = await prisma.expenseReport.create({
      data: {
        user_id: userId,
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
          create: expensesAvecMontants.map((e) => ({
            categorie: e.categorie,
            description: e.description,
            montant: e.montant,
            montant_retenu: e.montant_retenu,
            justificatif_url: e.justificatif_urls?.length
              ? JSON.stringify(e.justificatif_urls)
              : (e.justificatif_url ?? null),
            date_depense: new Date(e.date_depense),
          })),
        },
      },
      include: { expenses: true },
    })

    const nomComplet = `${demandeur.prenom} ${demandeur.nom}`

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
      console.error('[EXPENSES EMAIL ERROR]', emailError)
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: report.id,
          statut: report.statut,
          montant_total: montantTotal,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[EXPENSES POST ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET /api/expenses — Liste des NDF du membre connecté
export async function GET(req: NextRequest) {
  try {
    // Vérifier JWT
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

    // Récupérer les NDF du membre
    const reports = await prisma.expenseReport.findMany({
      where: { user_id: payload.userId },
      include: { expenses: true },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: reports },
      { status: 200 }
    )
  } catch (error) {
    console.error('[EXPENSES GET ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
