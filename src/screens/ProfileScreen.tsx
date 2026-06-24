import { ScrollView, Text, View } from 'react-native'
import { PrimaryButton } from '../components/PrimaryButton'
import { SectionTitle } from '../components/SectionTitle'
import { User } from '../types'
import { styles } from './ProfileScreen.styles'

type ProfileScreenProps = {
  user: User
  onLogout: () => void
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Profil</Text>
      <Text style={styles.copy}>Informations de votre compte mobile.</Text>

      <View style={styles.card}>
        <SectionTitle>Compte</SectionTitle>
        <Text style={styles.label}>Nom</Text>
        <Text style={styles.value}>{user.prenom} {user.nom}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <PrimaryButton variant="secondary" onPress={onLogout}>Déconnexion</PrimaryButton>
    </ScrollView>
  )
}
