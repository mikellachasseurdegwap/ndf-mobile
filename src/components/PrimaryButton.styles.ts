import { StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../theme/theme'

export const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.deepGreen,
    fontSize: 14,
    fontWeight: '800',
  },
  dangerText: {
    color: colors.danger,
  },
})
