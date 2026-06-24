import { ReactNode } from 'react'
import { GestureResponderEvent, Text, TouchableOpacity } from 'react-native'
import { styles } from './PrimaryButton.styles'

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
