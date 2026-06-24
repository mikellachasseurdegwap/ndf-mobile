import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { PrimaryButton } from '../components/PrimaryButton'
import { forgotPassword, login, register } from '../services/api'
import { colors, radius, shadow, spacing } from '../theme/theme'
import { AuthSession } from '../types'

type AuthScreenProps = {
  onAuthenticated: (session: AuthSession) => void
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'forgot') {
        setSuccess(await forgotPassword(email))
        return
      }

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
        <Text style={styles.heading}>{mode === 'login' ? 'Connexion' : mode === 'register' ? 'Créer un compte' : 'Mot de passe oublié'}</Text>
        <Text style={styles.copy}>
          {mode === 'forgot' ? 'Entrez votre email pour recevoir un lien de réinitialisation.' : 'Accédez à votre espace membre FFS/EFS.'}
        </Text>

        {mode === 'register' && (
          <View style={styles.row}>
            <TextInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
            <TextInput placeholder="Nom" value={nom} onChangeText={setNom} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
          </View>
        )}

        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.mutedText} style={styles.input} />
        {mode !== 'forgot' && (
          <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.mutedText} style={styles.input} />
        )}

        {mode === 'login' && (
          <TouchableOpacity onPress={() => { setMode('forgot'); setError(''); setSuccess('') }} style={styles.forgotButton}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <PrimaryButton onPress={handleSubmit} disabled={loading}>
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : mode === 'register' ? 'Créer mon compte' : 'Envoyer le lien'}
        </PrimaryButton>

        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }} style={styles.switchButton}>
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
  success: {
    color: colors.success,
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 13,
    fontWeight: '700',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  forgotText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '800',
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
