import { StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../../theme/theme'

export const styles = StyleSheet.create({
  guestHome: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  guestHero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  guestTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 25,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  guestSubtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  guestActions: {
    gap: spacing.sm,
  },
  guestPrimary: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  guestPrimaryText: {
    color: colors.deepGreen,
    fontWeight: '900',
  },
  guestSecondary: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  guestSecondaryText: {
    color: colors.deepGreen,
    fontWeight: '800',
  },
})
