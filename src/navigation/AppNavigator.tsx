import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import TabBar, { TabName } from './TabNavigator';
import { useNavStore } from '../store/navStore';
import HomeScreen from '../screens/HomeScreen';
import RoundsScreen from '../screens/RoundsScreen';
import TrustScoreScreen from '../screens/TrustScoreScreen';
import GoalsHubScreen from '../screens/goals/GoalsHubScreen';
import { User } from '../types';

type Screen =
  | { name: 'home' }
  | { name: 'rounds' }
  | { name: 'goals' }
  | { name: 'profile' }
  | { name: 'trustScore' };

interface AppNavigatorProps {
  user: User;
}

export default function AppNavigator({ user }: AppNavigatorProps) {
  const router = useRouter();
  const { pendingTab, setPendingTab } = useNavStore();

  // Use pendingTab as the starting tab so navigating back from an Expo Router
  // screen lands on the right tab immediately (no flash of home then rounds).
  const startTab = pendingTab ?? 'home';
  const [activeTab, setActiveTab] = useState<TabName>(startTab);
  const [screenStack, setScreenStack] = useState<Screen[]>([{ name: startTab }]);

  // When pendingTab is set (e.g. after creating a round), switch to that tab
  // and clear it. Using [pendingTab] so this works whether the navigator
  // remounts (fresh push) or is already mounted in the background (replace).
  useEffect(() => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setScreenStack([{ name: pendingTab }]);
      setPendingTab(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTab]);

  const currentScreen = screenStack[screenStack.length - 1];

  const push = (screen: Screen) => setScreenStack(prev => [...prev, screen]);
  const pop = () => setScreenStack(prev => prev.slice(0, -1));

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    setScreenStack([{ name: tab }]);
  };

  const showTabBar = ['home', 'rounds', 'goals', 'profile'].includes(currentScreen.name);

  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'home':
        return (
          <HomeScreen
            user={user}
            onRoundPress={id => router.push({ pathname: '/(app)/rounds/[id]', params: { id } })}
            onGoalPress={id => router.push({ pathname: '/(app)/goals/[id]', params: { id } })}
            onCreatePress={() => router.push('/(app)/goals/create')}
            onTrustPress={() => push({ name: 'trustScore' })}
          />
        );

      case 'rounds':
        return (
          <RoundsScreen
            onRoundPress={id => router.push({ pathname: '/(app)/rounds/[id]', params: { id } })}
            onCreatePress={() => router.push('/(app)/rounds/create')}
          />
        );

      case 'goals':
        return (
          <GoalsHubScreen
            onGoalPress={id => router.push({ pathname: '/(app)/goals/[id]', params: { id } })}
            onCreateGoal={() => router.push('/(app)/goals/create')}
          />
        );

      case 'profile':
        return (
          <TrustScoreScreen
            trustScore={user.trustScore}
            userName={user.name}
            onBack={() => setScreenStack([{ name: 'home' }])}
          />
        );

      case 'trustScore':
        return (
          <TrustScoreScreen
            trustScore={user.trustScore}
            userName={user.name}
            onBack={pop}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        {renderScreen()}
      </View>
      {showTabBar && (
        <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  screen: {
    flex: 1,
  },
});
