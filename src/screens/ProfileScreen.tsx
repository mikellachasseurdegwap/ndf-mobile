import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { PrimaryButton } from '../components/PrimaryButton'
import { SectionTitle } from '../components/SectionTitle'
import { colors, radius, spacing } from '../theme/theme'
import { User } from '../types'

type ProfileScreenProps = {
  user: User
  onLogout: () => void
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Profil</Text>
      <Text style={styles.copy}>Informations de votre compte mobile.</Text>

      <View style={styles.card}>
        <SectionTitle>Compte</SectionTitle>
        <Text style={styles.label}>Nom</Text>
        <Text style={styles.value}>{user.prenom} {user.nom}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
        <Text style={styles.label}>Rôle</Text>
        <Text style={styles.value}>{user.role}</Text>
      </View>

      <PrimaryButton variant="secondary" onPress={onLogout}>Déconnexion</PrimaryButton>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
})
