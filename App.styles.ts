import { StyleSheet } from 'react-native'
import { colors, radius, spacing } from './src/theme/theme'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 58,
    height: 50,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  tabItemActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.deepGreen,
  },
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
