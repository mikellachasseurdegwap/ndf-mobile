import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '../components/PrimaryButton'
import { register } from '../services/api'
import { colors, radius, shadow, spacing } from '../theme/theme'
import { AuthSession, ExpenseReport } from '../types'

type ConfirmationScreenProps = {
  report: ExpenseReport
  isAuthenticated: boolean
  initialIdentity?: {
    nom: string
    prenom: string
    email: string
  } | null
  onAuthenticated: (session: AuthSession) => void
  onNewReport: () => void
  onHome: () => void
  onReports: () => void
}

function formatAmount(value: string | number) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return `${value} €`
  return `${amount.toFixed(2)} €`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR')
}

export function ConfirmationScreen({
  report,
  isAuthenticated,
  initialIdentity,
  onAuthenticated,
  onNewReport,
  onHome,
  onReports,
}: ConfirmationScreenProps) {
  const [showRegister, setShowRegister] = useState(false)
  const [nom, setNom] = useState(initialIdentity?.nom ?? '')
  const [prenom, setPrenom] = useState(initialIdentity?.prenom ?? '')
  const [email, setEmail] = useState(initialIdentity?.email ?? '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    setError('')
    if (!nom || !prenom || !email || !password) {
      setError('Nom, prénom, email et mot de passe sont obligatoires')
      return
    }

    setLoading(true)
    try {
      onAuthenticated(await register({ nom, prenom, email, password }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={34} color={colors.success} />
      </View>

      <Text style={styles.heading}>Note de frais envoyée</Text>
      <Text style={styles.copy}>
        Votre demande a bien été transmise. Conservez la référence ci-dessous pour le suivi.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Référence</Text>
        <Text selectable style={styles.reference}>{report.id}</Text>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Montant</Text>
          <Text style={styles.infoValue}>{formatAmount(report.montant_total)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Statut</Text>
          <Text style={styles.status}>Envoyée</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{formatDate(report.created_at)}</Text>
        </View>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.nextTitle}>{isAuthenticated ? 'Suivi disponible' : 'Un email vous a été envoyé'}</Text>
        <Text style={styles.nextCopy}>
          {isAuthenticated
            ? 'Vous pouvez retrouver cette note dans le suivi.'
            : 'Vous pouvez créer un compte maintenant pour retrouver vos notes plus facilement, ou garder uniquement la référence.'}
        </Text>
      </View>

      {isAuthenticated ? (
        <PrimaryButton onPress={onReports}>Voir le suivi</PrimaryButton>
      ) : (
        <>
          {!showRegister ? (
            <PrimaryButton onPress={() => setShowRegister(true)}>Créer un compte</PrimaryButton>
          ) : (
            <View style={styles.registerCard}>
              <Text style={styles.nextTitle}>Créer un compte</Text>
              <View style={styles.row}>
                <TextInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
                <TextInput placeholder="Nom" value={nom} onChangeText={setNom} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
              </View>
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.mutedText} style={styles.input} />
              <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.mutedText} style={styles.input} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton onPress={handleRegister} disabled={loading}>{loading ? 'Création...' : 'Créer mon compte'}</PrimaryButton>
            </View>
          )}
        </>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={onNewReport} activeOpacity={0.85}>
        <Text style={styles.secondaryText}>Créer une autre note</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ghostButton} onPress={onHome} activeOpacity={0.85}>
        <Text style={styles.ghostText}>Retour accueil</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'stretch',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  copy: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  label: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  reference: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: colors.mutedText,
    fontSize: 14,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  status: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '900',
  },
  nextCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  nextTitle: {
    color: colors.deepGreen,
    fontSize: 16,
    fontWeight: '900',
  },
  nextCopy: {
    color: colors.deepGreen,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  registerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  secondaryText: {
    color: colors.deepGreen,
    fontWeight: '900',
  },
  ghostButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  ghostText: {
    color: colors.mutedText,
    fontWeight: '800',
  },
})
