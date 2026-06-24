import { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { PrimaryButton } from '../components/PrimaryButton'
import { forgotPassword, login, register } from '../services/api'
import { colors } from '../theme/theme'
import { AuthSession } from '../types'
import { styles } from './AuthScreen.styles'

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
