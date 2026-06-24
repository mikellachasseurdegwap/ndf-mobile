import { useEffect, useState } from 'react'
import { Linking, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SectionTitle } from '../components/SectionTitle'
import { generatePdf, listReports } from '../services/api'
import { colors } from '../theme/theme'
import { ExpenseReport } from '../types'
import { styles } from './ReportsScreen.styles'

const statusLabels: Record<ExpenseReport['statut'], string> = {
  draft: 'Brouillon',
  submitted: 'En attente',
  approved: 'Validée',
  rejected: 'Rejetée',
  paid: 'Remboursée',
}

export function ReportsScreen({ token }: { token: string }) {
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadReports() {
    setLoading(true)
    setError('')
    try {
      setReports(await listReports(token))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  async function handlePdf(reportId: string) {
    setPdfLoading(reportId)
    setError('')
    try {
      const data = await generatePdf(reportId)
      setPdfUrls((current) => ({ ...current, [reportId]: data.pdf_url }))
      await Linking.openURL(data.pdf_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur PDF')
    } finally {
      setPdfLoading(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReports} />} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Suivi</Text>
      <Text style={styles.copy}>Retrouvez les notes envoyées depuis votre compte.</Text>

      <SectionTitle>Mes demandes</SectionTitle>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {reports.length === 0 && !loading ? (
        <View style={styles.emptyCard}>
          <Ionicons name="file-tray-outline" size={30} color={colors.green} />
          <Text style={styles.emptyTitle}>Aucune demande</Text>
          <Text style={styles.emptyText}>Vos notes de frais envoyées apparaîtront ici.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {reports.map((report) => (
            <View key={report.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="receipt-outline" size={20} color={colors.deepGreen} />
                </View>
                <View style={styles.main}>
                  <Text style={styles.title}>{report.objet_action}</Text>
                  <Text style={styles.meta}>{new Date(report.created_at).toLocaleDateString('fr-FR')} · {report.commission}</Text>
                  <Text style={styles.route}>{`${report.ville_depart} -> ${report.ville_arrivee}`}</Text>
                </View>
                <Text style={styles.amount}>{Number(report.montant_total).toFixed(2)} €</Text>
              </View>
              <Text style={styles.badge}>{statusLabels[report.statut]}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.detailButton} onPress={() => setSelectedId(selectedId === report.id ? null : report.id)}>
                  <Text style={styles.detailText}>{selectedId === report.id ? 'Masquer détail' : 'Voir détail'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pdfButton} onPress={() => handlePdf(report.id)} disabled={pdfLoading === report.id}>
                  <Text style={styles.pdfText}>{pdfLoading === report.id ? 'Génération...' : pdfUrls[report.id] ? 'Ouvrir PDF' : 'Télécharger PDF'}</Text>
                </TouchableOpacity>
              </View>
              {selectedId === report.id && (
                <View style={styles.detailBox}>
                  <SectionTitle>Détail d'une NDF</SectionTitle>
                  <InfoLine label="Référence" value={report.id} />
                  <InfoLine label="Commission" value={report.commission} />
                  <InfoLine label="Objet" value={report.objet_action} />
                  <InfoLine label="Date action" value={new Date(report.date_action).toLocaleDateString('fr-FR')} />
                  <InfoLine label="Trajet" value={formatTrajet(report.ville_depart, report.ville_arrivee)} />
                  <InfoLine label="Montant total" value={`${Number(report.montant_total).toFixed(2)} €`} />
                  <InfoLine label="Statut" value={statusLabels[report.statut]} />
                  <View style={styles.separator} />
                  {report.expenses?.length ? report.expenses.map((expense) => (
                    <View key={expense.id} style={styles.expenseLine}>
                      <Text style={styles.expenseTitle}>{expense.description}</Text>
                      <Text style={styles.meta}>{expense.categorie} · {new Date(expense.date_depense).toLocaleDateString('fr-FR')}</Text>
                      <Text style={styles.meta}>Montant déclaré : {Number(expense.montant).toFixed(2)} €</Text>
                      <Text style={styles.amountSmall}>{Number(expense.montant_retenu ?? expense.montant).toFixed(2)} €</Text>
                      <Text style={styles.meta}>Justificatifs : {countJustificatifs(expense.justificatif_url)}</Text>
                    </View>
                  )) : <Text style={styles.meta}>Aucune dépense détaillée reçue.</Text>}
                  {report.statut === 'rejected' && report.commentaire_tresorier ? (
                    <Text style={styles.rejected}>Commentaire trésorier : {report.commentaire_tresorier}</Text>
                  ) : null}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

function countJustificatifs(value?: string | null) {
  if (!value) return 0
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.length : 1
  } catch {
    return 1
  }
}

function formatTrajet(depart?: string, arrivee?: string) {
  if (!depart && !arrivee) return 'Non renseigné'
  return `${depart || 'Non renseigné'} -> ${arrivee || 'Non renseigné'}`
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}
