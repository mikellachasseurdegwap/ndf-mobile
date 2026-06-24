import { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '../components/PrimaryButton'
import { register } from '../services/api'
import { colors } from '../theme/theme'
import { AuthSession, ExpenseReport } from '../types'
import { styles } from './ConfirmationScreen.styles'

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
