import { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SectionTitle } from '../components/SectionTitle'
import { listReports } from '../services/api'
import { colors, radius, spacing } from '../theme/theme'
import { ExpenseReport } from '../types'

const statusLabels: Record<ExpenseReport['statut'], string> = {
  draft: 'Brouillon',
  submitted: 'En attente',
  approved: 'Validée',
  rejected: 'Rejetée',
  paid: 'Remboursée',
}

export function ReportsScreen({ token }: { token: string }) {
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [loading, setLoading] = useState(false)
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
                  <Text style={styles.meta}>{report.commission}</Text>
                  <Text style={styles.route}>{`${report.ville_depart} -> ${report.ville_arrivee}`}</Text>
                </View>
                <Text style={styles.amount}>{Number(report.montant_total).toFixed(2)} €</Text>
              </View>
              <Text style={styles.badge}>{statusLabels[report.statut]}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
    textAlign: 'center',
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
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
  amount: {
    color: colors.text,
    fontWeight: '900',
  },
  badge: {
    alignSelf: 'flex-start',
    color: colors.deepGreen,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: spacing.md,
    fontSize: 12,
    fontWeight: '800',
  },
})
