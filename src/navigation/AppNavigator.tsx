import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import TabBar, { TabName } from './TabNavigator';
import HomeScreen from '../screens/HomeScreen';
import RoundsScreen from '../screens/RoundsScreen';
import RoundDetailScreen from '../screens/RoundDetailScreen';
import TrustScoreScreen from '../screens/TrustScoreScreen';
import ProofUploadScreen from '../screens/ProofUploadScreen';
import GoalsHubScreen from '../screens/goals/GoalsHubScreen';
import GoalDetailScreen from '../screens/goals/GoalDetailScreen';
import GoalDepositScreen from '../screens/goals/GoalDepositScreen';
import CreateGoalFlow from '../screens/goals/CreateGoalFlow';
import { useRounds } from '../hooks/useRounds';
import { useGoals } from '../hooks/useGoals';
import { User } from '../types';

type Screen =
  | { name: 'home' }
  | { name: 'rounds' }
  | { name: 'goals' }
  | { name: 'profile' }
  | { name: 'roundDetail'; roundId: string }
  | { name: 'proofUpload'; roundId: string; cycleId: string }
  | { name: 'trustScore' }
  | { name: 'goalDetail'; goalId: string }
  | { name: 'goalDeposit'; goalId: string }
  | { name: 'createGoal' };

interface AppNavigatorProps {
  user: User;
}

export default function AppNavigator({ user }: AppNavigatorProps) {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [screenStack, setScreenStack] = useState<Screen[]>([{ name: 'home' }]);
  const { rounds, recordPayment } = useRounds();
  const { goals, recordDeposit, createGoal } = useGoals();

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
            onRoundPress={id => push({ name: 'roundDetail', roundId: id })}
            onGoalPress={id => push({ name: 'goalDetail', goalId: id })}
            onCreatePress={() => push({ name: 'createGoal' })}
            onTrustPress={() => push({ name: 'trustScore' })}
          />
        );

      case 'rounds':
        return (
          <RoundsScreen
            onRoundPress={id => push({ name: 'roundDetail', roundId: id })}
            onCreatePress={() => {}}
          />
        );

      case 'goals':
        return (
          <GoalsHubScreen
            onGoalPress={id => push({ name: 'goalDetail', goalId: id })}
            onCreateGoal={() => push({ name: 'createGoal' })}
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

      case 'roundDetail': {
        const round = rounds.find(r => r.id === currentScreen.roundId);
        if (!round) return null;
        const currentCycle = round.cycles[round.currentCycleIndex];
        return (
          <RoundDetailScreen
            round={round}
            onBack={pop}
            onRecordPayment={() => push({ name: 'proofUpload', roundId: round.id, cycleId: currentCycle?.id || '' })}
          />
        );
      }

      case 'proofUpload': {
        const round = rounds.find(r => r.id === currentScreen.roundId);
        if (!round) return null;
        return (
          <ProofUploadScreen
            round={round}
            cycleId={currentScreen.cycleId}
            onBack={pop}
            onSubmit={async (proofType, proofUri, note) => {
              await recordPayment(round.id, currentScreen.cycleId, round.amount, proofType, proofUri, note);
            }}
          />
        );
      }

      case 'trustScore':
        return (
          <TrustScoreScreen
            trustScore={user.trustScore}
            userName={user.name}
            onBack={pop}
          />
        );

      case 'goalDetail': {
        const goal = goals.find(g => g.id === currentScreen.goalId);
        if (!goal) return null;
        return (
          <GoalDetailScreen
            goal={goal}
            onBack={pop}
            onDeposit={() => push({ name: 'goalDeposit', goalId: goal.id })}
          />
        );
      }

      case 'goalDeposit': {
        const goal = goals.find(g => g.id === currentScreen.goalId);
        if (!goal) return null;
        return (
          <GoalDepositScreen
            goal={goal}
            onBack={pop}
            onSubmit={async (amount, proofType, proofUri, depositDate, note) => {
              await recordDeposit(goal.id, amount, proofType, proofUri, depositDate, note);
            }}
          />
        );
      }

      case 'createGoal':
        return (
          <CreateGoalFlow
            onBack={pop}
            onComplete={async (data) => {
              await createGoal({
                name: data.name,
                emoji: data.emoji,
                type: data.type,
                targetAmount: data.targetAmount,
                currency: data.currency,
                targetDate: data.targetDate,
                depositFrequency: data.depositFrequency,
              });
            }}
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
