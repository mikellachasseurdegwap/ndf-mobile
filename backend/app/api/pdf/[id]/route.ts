import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Styles du PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#003366',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#003366',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#666666',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#003366',
    marginBottom: 6,
    backgroundColor: '#f0f4f8',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '40%',
    fontFamily: 'Helvetica-Bold',
    color: '#444444',
  },
  value: {
    width: '60%',
    color: '#222222',
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#003366',
    padding: 6,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  col1: { width: '20%' },
  col2: { width: '30%' },
  col3: { width: '20%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: '#003366',
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#003366',
    marginRight: 10,
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#003366',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    height: 80,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 4,
  },
})

// Composant PDF
function NdfDocument({ report }: { report: any }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title },
          'Note de Frais — Fédération Française de Spéléologie'
        ),
        React.createElement(Text, { style: styles.subtitle },
          `École Française de Spéléologie — Réf. ${report.id}`
        )
      ),

      // Infos générales
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Informations générales'),
        React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Commission :'),
          React.createElement(Text, { style: styles.value }, report.commission)
        ),
        React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Objet / Action :'),
          React.createElement(Text, { style: styles.value }, report.objet_action)
        ),
        React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Date de l\'action :'),
          React.createElement(Text, { style: styles.value },
            new Date(report.date_action).toLocaleDateString('fr-FR')
          )
        ),
        React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Trajet :'),
          React.createElement(Text, { style: styles.value },
            `${report.ville_depart} → ${report.ville_arrivee}`
          )
        ),
        report.user && React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Membre :'),
          React.createElement(Text, { style: styles.value },
            `${report.user.prenom} ${report.user.nom} — ${report.user.email}`
          )
        ),
      ),

      // Tableau des dépenses
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Détail des dépenses'),
        React.createElement(
          View,
          { style: styles.table },
          // En-tête tableau
          React.createElement(
            View,
            { style: styles.tableHeader },
            React.createElement(Text, { style: [styles.tableHeaderText, styles.col1] }, 'Date'),
            React.createElement(Text, { style: [styles.tableHeaderText, styles.col2] }, 'Description'),
            React.createElement(Text, { style: [styles.tableHeaderText, styles.col3] }, 'Catégorie'),
            React.createElement(Text, { style: [styles.tableHeaderText, styles.col4] }, 'Montant'),
            React.createElement(Text, { style: [styles.tableHeaderText, styles.col5] }, 'Retenu')
          ),
          // Lignes dépenses
          ...report.expenses.map((expense: any, index: number) =>
            React.createElement(
              View,
              { style: index % 2 === 0 ? styles.tableRow : styles.tableRowAlt, key: expense.id },
              React.createElement(Text, { style: styles.col1 },
                new Date(expense.date_depense).toLocaleDateString('fr-FR')
              ),
              React.createElement(Text, { style: styles.col2 }, expense.description),
              React.createElement(Text, { style: styles.col3 }, expense.categorie),
              React.createElement(Text, { style: styles.col4 },
                `${Number(expense.montant).toFixed(2)} €`
              ),
              React.createElement(Text, { style: styles.col5 },
                `${Number(expense.montant_retenu).toFixed(2)} €`
              ),
            )
          ),
        ),

        // Total
        React.createElement(
          View,
          { style: styles.total },
          React.createElement(Text, { style: styles.totalLabel }, 'TOTAL REMBOURSÉ :'),
          React.createElement(Text, { style: styles.totalValue },
            `${Number(report.montant_total).toFixed(2)} €`
          )
        )
      ),

      // Champs comptables trésorier
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Informations comptables (trésorier)'),
        React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Compte analytique :'),
          React.createElement(Text, { style: styles.value }, report.compte_analytique ?? '—')
        ),
        React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Ligne d\'objectif :'),
          React.createElement(Text, { style: styles.value }, report.ligne_objectif ?? '—')
        ),
        React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Pièce comptable :'),
          React.createElement(Text, { style: styles.value }, report.piece_comptable ?? '—')
        ),
        React.createElement(
          View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Statut :'),
          React.createElement(Text, { style: styles.value }, report.statut.toUpperCase())
        ),
      ),

      // Signatures
      React.createElement(
        View,
        { style: styles.signature },
        React.createElement(
          View,
          { style: styles.signatureBox },
          React.createElement(Text, { style: styles.signatureLabel }, 'Signature du membre :'),
        ),
        React.createElement(
          View,
          { style: styles.signatureBox },
          React.createElement(Text, { style: styles.signatureLabel }, 'Signature du trésorier :'),
        ),
      ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText },
          `Généré le ${new Date().toLocaleDateString('fr-FR')} — FFS/EFS`
        ),
        React.createElement(Text, { style: styles.footerText },
          `Réf. ${report.id}`
        ),
      )
    )
  )
}

// GET /api/pdf/[id] — Générer le PDF officiel FFS
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.cookies.get('token')?.value
    const payload = token ? verifyToken(token) : null

    // Récupérer la NDF complète
    const report = await prisma.expenseReport.findUnique({
      where: {id},
      include: {
        expenses: true,
        user: true,
      },
    })

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Note de frais introuvable' },
        { status: 404 }
      )
    }

    // Vérifier droits : admin ou propriétaire (les soumissions anonymes sont accessibles par UUID)
    if (payload && payload.role !== 'admin' && report.user_id && report.user_id !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Accès interdit' },
        { status: 403 }
      )
    }

    // Générer le PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(NdfDocument, { report }) as any
    )

    // Uploader le PDF sur R2
    const filename = `pdfs/ndf-${report.id}.pdf`
    const pdfUrl = await uploadToR2(
      Buffer.from(pdfBuffer),
      filename,
      'application/pdf'
    )

    // Sauvegarder en BDD
    if (payload?.userId) {
      await prisma.pdfExport.create({
        data: {
          report_id: report.id,
          pdf_url: pdfUrl,
          generated_by: payload.userId,
        },
      })
    }

    return NextResponse.json(
      { success: true, data: { pdf_url: pdfUrl } },
      { status: 200 }
    )
  } catch (error) {
    console.error('[PDF ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur génération PDF' },
      { status: 500 }
    )
  }
}
