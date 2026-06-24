import { useEffect, useState } from 'react'
import { Image, Linking, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SectionTitle } from '../components/SectionTitle'
import { generatePdf, listAdminReports, updateAdminReport } from '../services/api'
import { colors, radius, spacing } from '../theme/theme'
import { ExpenseReport } from '../types'

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

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  copy: {
    color: colors.mutedText,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.mutedText,
    fontWeight: '800',
    fontSize: 12,
  },
  filterTextActive: {
    color: colors.deepGreen,
  },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.mutedText,
    marginTop: spacing.xs,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  main: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  meta: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 3,
  },
  route: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  amount: {
    color: colors.text,
    fontWeight: '900',
  },
  badge: {
    color: colors.deepGreen,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '800',
  },
  dateLine: {
    color: colors.green,
    fontSize: 12,
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.deepGreen,
    fontWeight: '900',
  },
  detailBox: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: colors.mutedText,
  },
  infoValue: {
    flex: 1,
    color: colors.text,
    fontWeight: '800',
    textAlign: 'right',
  },
  sectionSmall: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  expenseLine: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  expenseTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  amountSmall: {
    color: colors.deepGreen,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  justificatifs: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  justificatifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  justificatifImage: {
    width: 58,
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  justificatifFile: {
    width: 58,
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  justificatifInfo: {
    flex: 1,
  },
  justificatifTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  justificatifLink: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },
  warning: {
    color: colors.warning,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    fontWeight: '800',
  },
  rejectBox: {
    marginTop: spacing.md,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  rejectConfirm: {
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    padding: spacing.md,
    alignItems: 'center',
  },
  rejectConfirmText: {
    color: colors.surface,
    fontWeight: '900',
  },
  adminActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  approveButton: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    padding: spacing.md,
    alignItems: 'center',
  },
  approveText: {
    color: colors.success,
    fontWeight: '900',
  },
  rejectButton: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    alignItems: 'center',
  },
  rejectText: {
    color: colors.danger,
    fontWeight: '900',
  },
  paidButton: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.blueSoft,
    padding: spacing.md,
    alignItems: 'center',
  },
  paidText: {
    color: colors.blue,
    fontWeight: '900',
  },
})
