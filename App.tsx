import { useState } from 'react'
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AuthScreen } from './src/screens/AuthScreen'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { NewReportScreen } from './src/screens/NewReportScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { ReportsScreen } from './src/screens/ReportsScreen'
import { colors, radius, spacing } from './src/theme/theme'
import { AuthSession } from './src/types'

type TabKey = 'dashboard' | 'new' | 'reports' | 'profile'

const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'dashboard', label: 'Accueil', icon: 'home-outline' },
  { key: 'new', label: 'NDF', icon: 'add-circle-outline' },
  { key: 'reports', label: 'Suivi', icon: 'receipt-outline' },
  { key: 'profile', label: 'Profil', icon: 'person-outline' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [session, setSession] = useState<AuthSession | null>(null)

  function renderScreen() {
    if (!session) return <AuthScreen onAuthenticated={setSession} />

    if (activeTab === 'dashboard') {
      return (
        <DashboardScreen
          user={session.user}
          onNewReportPress={() => setActiveTab('new')}
          onReportsPress={() => setActiveTab('reports')}
        />
      )
    }

    if (activeTab === 'new') {
      return <NewReportScreen token={session.token} onSubmitted={() => setActiveTab('reports')} />
    }

    if (activeTab === 'reports') {
      return <ReportsScreen token={session.token} />
    }

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

      {session && (
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <TouchableOpacity key={tab.key} style={[styles.tabItem, isActive && styles.tabItemActive]} onPress={() => setActiveTab(tab.key)} activeOpacity={0.85}>
                <Ionicons name={tab.icon} size={21} color={isActive ? colors.deepGreen : colors.mutedText} />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </SafeAreaView>
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
})
