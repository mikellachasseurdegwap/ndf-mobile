import { StyleSheet } from 'react-native'
import { colors, radius, shadow, spacing } from '../theme/theme'

export const styles = StyleSheet.create({
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
