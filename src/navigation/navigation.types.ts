import { Ionicons } from '@expo/vector-icons'

export type TabKey = 'dashboard' | 'new' | 'reports' | 'admin' | 'profile' | 'confirmation'

export type TabItem = {
  key: TabKey
  label: string
  icon: keyof typeof Ionicons.glyphMap
}
