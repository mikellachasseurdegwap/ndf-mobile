import { StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../../theme/theme'

export const styles = StyleSheet.create({
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
})
