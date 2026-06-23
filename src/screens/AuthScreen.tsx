import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { PrimaryButton } from '../components/PrimaryButton'
import { login, register } from '../services/api'
import { colors, radius, shadow, spacing } from '../theme/theme'
import { AuthSession } from '../types'

type AuthScreenProps = {
  onAuthenticated: (session: AuthSession) => void
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const session = mode === 'login'
        ? await login(email, password)
        : await register({ nom, prenom, email, password })
      onAuthenticated(session)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.heading}>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</Text>
        <Text style={styles.copy}>Accédez à votre espace membre FFS/EFS.</Text>

        {mode === 'register' && (
          <View style={styles.row}>
            <TextInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
            <TextInput placeholder="Nom" value={nom} onChangeText={setNom} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
          </View>
        )}

        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.mutedText} style={styles.input} />
        <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.mutedText} style={styles.input} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton onPress={handleSubmit} disabled={loading}>
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </PrimaryButton>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.switchButton}>
          <Text style={styles.switchText}>
            {mode === 'login' ? 'Pas encore de compte ? Inscription' : 'Déjà un compte ? Connexion'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  copy: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
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
  switchButton: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  switchText: {
    color: colors.green,
    fontWeight: '800',
  },
})
