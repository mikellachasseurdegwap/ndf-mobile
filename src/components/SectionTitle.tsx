import { Text } from 'react-native'
import { styles } from './SectionTitle.styles'

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>
}
