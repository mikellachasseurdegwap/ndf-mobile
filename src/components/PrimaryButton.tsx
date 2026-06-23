import { ReactNode } from 'react'
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { colors, radius, spacing } from '../theme/theme'

type PrimaryButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  onPress?: (event: GestureResponderEvent) => void
  disabled?: boolean
}

export function PrimaryButton({ children, variant = 'primary', onPress, disabled }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, variant === 'danger' && styles.dangerText]}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
