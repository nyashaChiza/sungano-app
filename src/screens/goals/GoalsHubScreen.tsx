import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { Goal } from '../../types';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import GoalCard from '../../components/goals/GoalCard';
import Money from '../../components/ui/Money';

type TabFilter = 'all' | 'solo' | 'group';

interface GoalsHubScreenProps {
  goals: Goal[];
  onGoalPress: (goalId: string) => void;
  onCreateGoal: () => void;
}

function JarIllustration() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      <Ellipse cx={40} cy={25} rx={22} ry={6} fill={Colors.greenSubtle} />
      <Path d="M18 25 Q15 50 20 65 Q30 75 40 75 Q50 75 60 65 Q65 50 62 25 Z" fill={Colors.greenPale} stroke={Colors.greenSubtle} strokeWidth={1.5} />
      <Ellipse cx={40} cy={55} rx={12} ry={4} fill={Colors.greenSubtle} opacity={0.5} />
      <Path d="M30 40 Q40 48 50 40" stroke={Colors.greenDeep} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export default function GoalsHubScreen({ goals, onGoalPress, onCreateGoal }: GoalsHubScreenProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredGoals = goals.filter(g => {
    if (g.status !== 'active') return false;
    if (activeTab === 'solo') return g.type === 'solo';
    if (activeTab === 'group') return g.type === 'group';
    return true;
  });

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'complete').length;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <Text style={styles.title}>My Goals</Text>
            {/* Stats Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              <View style={styles.pillsRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillLabel}>Saved</Text>
                  <Money amount={totalSaved} currency="NGN" size={14} color={Colors.white} />
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillLabel}>Target</Text>
                  <Money amount={totalTarget} currency="NGN" size={14} color={Colors.white} />
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillLabel}>Active</Text>
                  <Text style={styles.pillValue}>{activeCount}</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillLabel}>Done</Text>
                  <Text style={styles.pillValue}>{completedCount}</Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Tab Bar */}
          <View style={styles.tabs}>
            {(['all', 'solo', 'group'] as TabFilter[]).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Goal Cards */}
          {filteredGoals.length > 0 ? (
            filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onPress={() => onGoalPress(goal.id)} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <JarIllustration />
              <Text style={styles.emptyTitle}>No {activeTab !== 'all' ? activeTab + ' ' : ''}goals yet</Text>
              <Text style={styles.emptyBody}>
                Set a savings goal to start tracking your progress and building good habits.
              </Text>
              <TouchableOpacity onPress={onCreateGoal} style={styles.emptyBtn} activeOpacity={0.85}>
                <Text style={styles.emptyBtnText}>+ Create your first goal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={onCreateGoal} style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    backgroundColor: Colors.greenDeep,
    paddingBottom: 24,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 28,
    color: Colors.white,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  pillsScroll: {
    marginHorizontal: -Spacing.xl,
    paddingLeft: Spacing.xl,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  pillLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  pillValue: {
    fontFamily: Fonts.displayBold,
    fontSize: 14,
    color: Colors.white,
  },
  body: {
    padding: Spacing.xl,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 4,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.lg,
  },
  tabActive: {
    backgroundColor: Colors.greenPale,
  },
  tabText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textMed,
  },
  tabTextActive: {
    color: Colors.greenDeep,
    fontFamily: Fonts.bodySemiBold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 18,
    color: Colors.textDark,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.xl,
  },
  emptyBtn: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
  },
  emptyBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
    shadowOpacity: 0.25,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: Colors.white,
    lineHeight: 32,
    fontFamily: Fonts.bodyRegular,
  },
});
