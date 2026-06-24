import { useState } from 'react'
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AdminScreen } from './src/screens/AdminScreen'
import { AuthScreen } from './src/screens/AuthScreen'
import { ConfirmationScreen } from './src/screens/ConfirmationScreen'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { NewReportScreen } from './src/screens/NewReportScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { ReportsScreen } from './src/screens/ReportsScreen'
import { colors, radius, spacing } from './src/theme/theme'
import { AuthSession, ExpenseReport } from './src/types'

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
      <View style={styles.guestCard}>
        <Text style={styles.guestTitle}>Bienvenue sur l'application de note de frais</Text>
        <TouchableOpacity style={styles.guestPrimary} onPress={onNewReportPress} activeOpacity={0.85}>
          <Text style={styles.guestPrimaryText}>Nouvelle NDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.guestSecondary} onPress={onLoginPress} activeOpacity={0.85}>
          <Text style={styles.guestSecondaryText}>Se connecter / créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 58,
    height: 50,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  tabItemActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.deepGreen,
  },
  guestHome: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  guestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  guestEyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  guestTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  guestCopy: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  guestPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  guestPrimaryText: {
    color: colors.deepGreen,
    fontWeight: '900',
  },
  guestSecondary: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  guestSecondaryText: {
    color: colors.deepGreen,
    fontWeight: '800',
  },
})
