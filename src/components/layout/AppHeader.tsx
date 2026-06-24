import { Image, Text, View } from 'react-native'
import { styles } from './AppHeader.styles'

export function AppHeader() {
  return (
    <View style={styles.header}>
      <Image source={require('../../../assets/ffs-logo.png')} style={styles.logo} resizeMode="contain" />
      <View style={styles.headerText}>
        <Text style={styles.title}>Notes de Frais</Text>
        <Text style={styles.subtitle}>Fédération Française de Spéléologie</Text>
      </View>
    </View>
  )
}
