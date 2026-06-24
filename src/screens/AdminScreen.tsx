import { useEffect, useState } from 'react'
import { Image, Linking, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SectionTitle } from '../components/SectionTitle'
import { generatePdf, listAdminReports, updateAdminReport } from '../services/api'
import { colors } from '../theme/theme'
import { ExpenseReport } from '../types'
import { styles } from './AdminScreen.styles'

const filters: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'submitted', label: 'En attente' },
  { value: 'approved', label: 'Validées' },
  { value: 'rejected', label: 'Rejetées' },
  { value: 'paid', label: 'Remboursées' },
]

const statusLabels: Record<ExpenseReport['statut'], string> = {
  draft: 'Brouillon',
  submitted: 'En attente',
  approved: 'Validée',
  rejected: 'Rejetée',
  paid: 'Remboursée',
}

export function AdminScreen({ token }: { token: string }) {
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadReports(nextFilter = filter) {
    setLoading(true)
    setError('')
    try {
      setReports(await listAdminReports(token, nextFilter))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports(filter)
  }, [filter])

  async function handleAction(reportId: string, action: 'approve' | 'reject' | 'paid') {
    if (action === 'reject' && !commentaire.trim()) {
      setError('Motif du rejet obligatoire')
      return
    }

    setActionLoading(`${reportId}-${action}`)
    setError('')
    try {
      await updateAdminReport(token, reportId, {
        action,
        commentaire: action === 'reject' ? commentaire : undefined,
      })
      setRejectId(null)
      setCommentaire('')
      await loadReports()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handlePdf(reportId: string) {
    setActionLoading(`${reportId}-pdf`)
    setError('')
    try {
      const data = await generatePdf(reportId)
      await Linking.openURL(data.pdf_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur PDF')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadReports()} />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Administration</Text>
      <Text style={styles.copy}>Gestion mobile des notes de frais soumises.</Text>

      <View style={styles.filters}>
        {filters.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[styles.filterChip, filter === item.value && styles.filterChipActive]}
            onPress={() => setFilter(item.value)}
          >
            <Text style={[styles.filterText, filter === item.value && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && reports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="file-tray-outline" size={30} color={colors.green} />
          <Text style={styles.emptyTitle}>Aucune note</Text>
          <Text style={styles.emptyText}>Aucune note de frais pour ce filtre.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {reports.map((report) => (
            <View key={report.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.main}>
                  <Text style={styles.title}>{report.objet_action}</Text>
                  <Text style={styles.meta}>{getMemberLabel(report)}</Text>
                  <Text style={styles.route}>{report.ville_depart} {'->'} {report.ville_arrivee}</Text>
                </View>
                <View style={styles.amountBox}>
                  <Text style={styles.amount}>{Number(report.montant_total).toFixed(2)} €</Text>
                  <Text style={styles.badge}>{statusLabels[report.statut]}</Text>
                </View>
              </View>

              <Text style={styles.dateLine}>
                Action du {formatDate(report.date_action)}
                {report.submitted_at ? ` · Soumise le ${formatDate(report.submitted_at)}` : ''}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setExpandedId(expandedId === report.id ? null : report.id)}>
                  <Text style={styles.secondaryText}>{expandedId === report.id ? 'Masquer détail' : 'Voir détail'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => handlePdf(report.id)} disabled={actionLoading === `${report.id}-pdf`}>
                  <Text style={styles.secondaryText}>{actionLoading === `${report.id}-pdf` ? 'PDF...' : 'Générer PDF'}</Text>
                </TouchableOpacity>
              </View>

              {expandedId === report.id && (
                <View style={styles.detailBox}>
                  <SectionTitle>Détail NDF</SectionTitle>
                  <InfoLine label="Commission" value={report.commission} />
                  <InfoLine label="Statut" value={statusLabels[report.statut]} />
                  <InfoLine label="Référence" value={report.id} />
                  {report.commentaire ? <Text style={styles.warning}>Commentaire : {report.commentaire}</Text> : null}

                  <Text style={styles.sectionSmall}>Dépenses</Text>
                  {report.expenses?.map((expense) => (
                    <View key={expense.id} style={styles.expenseLine}>
                      <Text style={styles.expenseTitle}>{expense.description}</Text>
                      <Text style={styles.meta}>{expense.categorie} · {formatDate(expense.date_depense)}</Text>
                      <Text style={styles.amountSmall}>{Number(expense.montant_retenu ?? expense.montant).toFixed(2)} €</Text>
                      <Justificatifs value={expense.justificatif_url} />
                    </View>
                  ))}
                </View>
              )}

              {rejectId === report.id && (
                <View style={styles.rejectBox}>
                  <TextInput
                    placeholder="Motif du rejet"
                    value={commentaire}
                    onChangeText={setCommentaire}
                    placeholderTextColor={colors.mutedText}
                    style={styles.input}
                  />
                  <TouchableOpacity style={styles.rejectConfirm} onPress={() => handleAction(report.id, 'reject')}>
                    <Text style={styles.rejectConfirmText}>Confirmer le rejet</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.adminActions}>
                {report.statut === 'submitted' && (
                  <>
                    <TouchableOpacity style={styles.approveButton} onPress={() => handleAction(report.id, 'approve')} disabled={Boolean(actionLoading)}>
                      <Text style={styles.approveText}>{actionLoading === `${report.id}-approve` ? '...' : 'Valider'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectButton} onPress={() => setRejectId(rejectId === report.id ? null : report.id)} disabled={Boolean(actionLoading)}>
                      <Text style={styles.rejectText}>Rejeter</Text>
                    </TouchableOpacity>
                  </>
                )}
                {report.statut === 'approved' && (
                  <TouchableOpacity style={styles.paidButton} onPress={() => handleAction(report.id, 'paid')} disabled={Boolean(actionLoading)}>
                    <Text style={styles.paidText}>{actionLoading === `${report.id}-paid` ? '...' : 'Marquer remboursé'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

function getMemberLabel(report: ExpenseReport) {
  if (!report.user) return 'Membre non connecté'
  return `${report.user.prenom} ${report.user.nom} · ${report.user.email}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR')
}

function countJustificatifs(value?: string | null) {
  return parseJustificatifs(value).length
}

function parseJustificatifs(value?: string | null) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((url): url is string => typeof url === 'string' && url.length > 0) : [value]
  } catch {
    return [value]
  }
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|webp)(\?|#|$)/i.test(url)
}

function Justificatifs({ value }: { value?: string | null }) {
  const urls = parseJustificatifs(value)

  if (!urls.length) {
    return <Text style={styles.meta}>Aucun justificatif joint</Text>
  }

  return (
    <View style={styles.justificatifs}>
      <Text style={styles.meta}>Justificatifs : {urls.length}</Text>
      {urls.map((url, index) => (
        <TouchableOpacity key={`${url}-${index}`} style={styles.justificatifCard} onPress={() => Linking.openURL(url)} activeOpacity={0.85}>
          {isImageUrl(url) ? (
            <Image source={{ uri: url }} style={styles.justificatifImage} resizeMode="cover" />
          ) : (
            <View style={styles.justificatifFile}>
              <Ionicons name="document-attach-outline" size={24} color={colors.deepGreen} />
            </View>
          )}
          <View style={styles.justificatifInfo}>
            <Text style={styles.justificatifTitle}>Justificatif {index + 1}</Text>
            <Text style={styles.justificatifLink}>Ouvrir</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}
