import { useState } from 'react'
import { Image, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AdminScreen } from './src/screens/AdminScreen'
import { AuthScreen } from './src/screens/AuthScreen'
import { ConfirmationScreen } from './src/screens/ConfirmationScreen'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { NewReportScreen } from './src/screens/NewReportScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { ReportsScreen } from './src/screens/ReportsScreen'
import { colors } from './src/theme/theme'
import { AuthSession, ExpenseReport } from './src/types'
import { styles } from './App.styles'

type TabKey = 'dashboard' | 'new' | 'reports' | 'admin' | 'profile' | 'confirmation'

const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'dashboard', label: 'Accueil', icon: 'home-outline' },
  { key: 'new', label: 'NDF', icon: 'add-circle-outline' },
  { key: 'reports', label: 'Suivi', icon: 'receipt-outline' },
  { key: 'admin', label: 'Admin', icon: 'shield-checkmark-outline' },
  { key: 'profile', label: 'Profil', icon: 'person-outline' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [session, setSession] = useState<AuthSession | null>(null)
  const [lastSubmittedReport, setLastSubmittedReport] = useState<ExpenseReport | null>(null)
  const [lastGuestIdentity, setLastGuestIdentity] = useState<{ nom: string; prenom: string; email: string } | null>(null)

  function handleAuthenticated(authSession: AuthSession) {
    setSession(authSession)
    setActiveTab('dashboard')
  }

  function renderScreen() {
    if (activeTab === 'dashboard') {
      if (!session) {
        return (
          <GuestHome
            onNewReportPress={() => setActiveTab('new')}
            onLoginPress={() => setActiveTab('profile')}
          />
        )
      }
      return (
        <DashboardScreen
          user={session.user}
          onNewReportPress={() => setActiveTab('new')}
          onReportsPress={() => setActiveTab('reports')}
        />
      )
    }

    if (activeTab === 'new') {
      return (
        <NewReportScreen
          token={session?.token ?? null}
          onSubmitted={(report, identity) => {
            setLastSubmittedReport(report)
            setLastGuestIdentity(identity ?? null)
            setActiveTab('confirmation')
          }}
        />
      )
    }

    if (activeTab === 'confirmation' && lastSubmittedReport) {
      return (
        <ConfirmationScreen
          report={lastSubmittedReport}
          isAuthenticated={Boolean(session)}
          initialIdentity={lastGuestIdentity}
          onAuthenticated={handleAuthenticated}
          onNewReport={() => setActiveTab('new')}
          onHome={() => setActiveTab('dashboard')}
          onReports={() => setActiveTab(session ? 'reports' : 'profile')}
        />
      )
    }

    if (activeTab === 'reports') {
      if (!session) return <AuthScreen onAuthenticated={handleAuthenticated} />
      return <ReportsScreen token={session.token} />
    }

    if (activeTab === 'admin') {
      if (!session) return <AuthScreen onAuthenticated={handleAuthenticated} />
      if (session.user.role !== 'admin') return <DashboardScreen user={session.user} onNewReportPress={() => setActiveTab('new')} onReportsPress={() => setActiveTab('reports')} />
      return <AdminScreen token={session.token} />
    }

    if (!session) return <AuthScreen onAuthenticated={handleAuthenticated} />
    return <ProfileScreen user={session.user} onLogout={() => setSession(null)} />
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Image source={require('./assets/ffs-logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Notes de Frais</Text>
          <Text style={styles.subtitle}>Fédération Française de Spéléologie</Text>
        </View>
      </View>

      <View style={styles.content}>{renderScreen()}</View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          if (!session && tab.key === 'reports') return null
          if (tab.key === 'admin' && session?.user.role !== 'admin') return null
            const isActive = activeTab === tab.key
            return (
              <TouchableOpacity key={tab.key} style={[styles.tabItem, isActive && styles.tabItemActive]} onPress={() => setActiveTab(tab.key)} activeOpacity={0.85}>
                <Ionicons name={tab.icon} size={21} color={isActive ? colors.deepGreen : colors.mutedText} />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            )
        })}
      </View>
    </SafeAreaView>
  )
}

function GuestHome({ onNewReportPress, onLoginPress }: { onNewReportPress: () => void; onLoginPress: () => void }) {
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
