import { StyleSheet, Text } from 'react-native'
import { colors, spacing } from '../theme/theme'

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>
}

const styles = StyleSheet.create({
  title: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
})
