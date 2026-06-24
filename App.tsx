import { useState } from 'react'
import { SafeAreaView, StatusBar, View } from 'react-native'
import { AppHeader } from './src/components/layout/AppHeader'
import { BottomTabBar } from './src/components/layout/BottomTabBar'
import { GuestHome } from './src/features/home/GuestHome'
import { TabKey } from './src/navigation/navigation.types'
import { AdminScreen, AuthScreen, ConfirmationScreen, DashboardScreen, NewReportScreen, ProfileScreen, ReportsScreen } from './src/screens'
import { colors } from './src/theme/theme'
import { AuthSession, ExpenseReport } from './src/types'
import { styles } from './App.styles'

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
      <AppHeader />

      <View style={styles.content}>{renderScreen()}</View>

      <BottomTabBar activeTab={activeTab} user={session?.user ?? null} onTabPress={setActiveTab} />
    </SafeAreaView>
  )
}
