import { StyleSheet } from 'react-native'
import { colors, radius, shadow, spacing } from '../theme/theme'

export const styles = StyleSheet.create({
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
