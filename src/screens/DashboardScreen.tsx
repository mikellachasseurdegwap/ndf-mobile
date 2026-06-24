import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '../components/PrimaryButton'
import { SectionTitle } from '../components/SectionTitle'
import { colors } from '../theme/theme'
import { User } from '../types'
import { styles } from './DashboardScreen.styles'

type DashboardScreenProps = {
  user: User
  onNewReportPress: () => void
  onReportsPress: () => void
}

export function DashboardScreen({ user, onNewReportPress, onReportsPress }: DashboardScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Espace membre</Text>
        <Text style={styles.heading}>Bonjour {user.prenom}</Text>
        <Text style={styles.copy}>Créez une note de frais et suivez son traitement depuis votre espace mobile.</Text>
        <PrimaryButton onPress={onNewReportPress}>+ Nouvelle NDF</PrimaryButton>
      </View>

      <SectionTitle>Actions rapides</SectionTitle>
      <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={onNewReportPress}>
        <View style={styles.actionIcon}>
          <Ionicons name="create-outline" size={24} color={colors.deepGreen} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Déclarer une dépense</Text>
          <Text style={styles.actionCopy}>Remplir une note avec les barèmes FFS.</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={22} color={colors.green} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={onReportsPress}>
        <View style={styles.actionIcon}>
          <Ionicons name="receipt-outline" size={24} color={colors.deepGreen} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Voir mes demandes</Text>
          <Text style={styles.actionCopy}>Suivre les notes enregistrées en base.</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={22} color={colors.green} />
      </TouchableOpacity>
    </ScrollView>
  )
}
