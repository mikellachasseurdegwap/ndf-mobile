import { StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../theme/theme'

export const styles = StyleSheet.create({
  title: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
})
