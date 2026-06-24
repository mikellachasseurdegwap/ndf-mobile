import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/theme'
import { styles } from './GuestHome.styles'

type GuestHomeProps = {
  onNewReportPress: () => void
  onLoginPress: () => void
}

export function GuestHome({ onNewReportPress, onLoginPress }: GuestHomeProps) {
  return (
    <View style={styles.guestHome}>
      <View style={styles.guestHero}>
        <Text style={styles.guestTitle}>Bienvenue à la Fédération Française de Spéléologie</Text>
        <Text style={styles.guestSubtitle}>Créer, envoyer et suivre vos notes depuis votre mobile.</Text>
      </View>

      <View style={styles.guestActions}>
        <TouchableOpacity style={styles.guestPrimary} onPress={onNewReportPress} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color={colors.deepGreen} />
          <Text style={styles.guestPrimaryText}>Nouvelle NDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.guestSecondary} onPress={onLoginPress} activeOpacity={0.85}>
          <Ionicons name="person-outline" size={18} color={colors.deepGreen} />
          <Text style={styles.guestSecondaryText}>Se connecter / créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
