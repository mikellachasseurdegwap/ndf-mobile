import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '../components/PrimaryButton'
import { SectionTitle } from '../components/SectionTitle'
import { colors, radius, shadow, spacing } from '../theme/theme'
import { User } from '../types'

type DashboardScreenProps = {
  user: User
  onNewReportPress: () => void
  onReportsPress: () => void
}

export function DashboardScreen({ user, onNewReportPress, onReportsPress }: DashboardScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Espace membre</Text>
        <Text style={styles.heading}>Bonjour {user.prenom}</Text>
        <Text style={styles.copy}>Créez une note de frais et suivez son traitement depuis votre espace mobile.</Text>
        <PrimaryButton onPress={onNewReportPress}>+ Nouvelle NDF</PrimaryButton>
      </View>

      <SectionTitle>Actions rapides</SectionTitle>
      <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={onNewReportPress}>
        <View style={styles.actionIcon}>
          <Ionicons name="create-outline" size={24} color={colors.deepGreen} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Déclarer une dépense</Text>
          <Text style={styles.actionCopy}>Remplir une note avec les barèmes FFS.</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={22} color={colors.green} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={onReportsPress}>
        <View style={styles.actionIcon}>
          <Ionicons name="receipt-outline" size={24} color={colors.deepGreen} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Voir mes demandes</Text>
          <Text style={styles.actionCopy}>Suivre les notes enregistrées en base.</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={22} color={colors.green} />
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow,
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  copy: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  actionCopy: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: spacing.xs,
  },
})
