import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { User } from '../../types'
import { colors } from '../../theme/theme'
import { tabs } from '../../navigation/tabs'
import { TabKey } from '../../navigation/navigation.types'
import { styles } from './BottomTabBar.styles'

type BottomTabBarProps = {
  activeTab: TabKey
  user: User | null
  onTabPress: (tab: TabKey) => void
}

export function BottomTabBar({ activeTab, user, onTabPress }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        if (!user && tab.key === 'reports') return null
        if (tab.key === 'admin' && user?.role !== 'admin') return null

        const isActive = activeTab === tab.key

        return (
          <TouchableOpacity key={tab.key} style={[styles.tabItem, isActive && styles.tabItemActive]} onPress={() => onTabPress(tab.key)} activeOpacity={0.85}>
            <Ionicons name={tab.icon} size={21} color={isActive ? colors.deepGreen : colors.mutedText} />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
