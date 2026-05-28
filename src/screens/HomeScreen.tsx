import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import TrustRing from '../components/ui/TrustRing';
import RingsPattern from '../components/brand/RingsPattern';
import RoundCard from '../components/rounds/RoundCard';
import GoalCard from '../components/goals/GoalCard';
import Money from '../components/ui/Money';
import { useRounds } from '../hooks/useRounds';
import { useGoals } from '../hooks/useGoals';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  user: {
    name: string;
    trustScore: { score: number };
  };
  onRoundPress: (roundId: string) => void;
  onGoalPress: (goalId: string) => void;
  onCreatePress: () => void;
  onTrustPress: () => void;
}

export default function HomeScreen({
  user,
  onRoundPress,
  onGoalPress,
  onCreatePress,
  onTrustPress,
}: HomeScreenProps) {
  const { rounds } = useRounds();
  const { goals } = useGoals();

  const firstName = user.name.split(' ')[0];
  const activeRounds = rounds.filter(r => r.status === 'active');
  const activeGoals = goals.filter(g => g.status === 'active');

  const pendingPayment = activeRounds.find(r => {
    const member = r.members.find(m => m.id === r.myMemberId);
    return member && ['pending', 'overdue', 'grace'].includes(member.currentPaymentStatus);
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <RingsPattern width={width} height={180} color={Colors.white} opacity={0.1} />
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.greeting}>
                <Text style={styles.greetingText}>Good morning,</Text>
                <Text style={styles.name}>{firstName}</Text>
              </View>
              <TouchableOpacity onPress={onTrustPress} style={styles.trustRingButton}>
                <TrustRing score={user.trustScore.score} size={68} strokeWidth={5} showLabel />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Payment Due Banner */}
          {pendingPayment && (
            <TouchableOpacity
              onPress={() => onRoundPress(pendingPayment.id)}
              activeOpacity={0.9}
              style={styles.actionBanner}
            >
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerTitle}>Payment due</Text>
                <Text style={styles.bannerSub}>{pendingPayment.name}</Text>
              </View>
              <View style={styles.bannerRight}>
                <Money
                  amount={pendingPayment.amount}
                  currency={pendingPayment.currency}
                  size={17}
                  color={Colors.white}
                />
                <Text style={styles.bannerArrow}>›</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.greenPale }]}>
              <Text style={styles.statValue}>{activeRounds.length}</Text>
              <Text style={styles.statLabel}>Active Rounds</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.amberBg }]}>
              <Money
                amount={goals.reduce((acc, g) => acc + g.currentAmount, 0)}
                currency="NGN"
                size={16}
                color={Colors.textDark}
              />
              <Text style={styles.statLabel}>Total Saved</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.bgLight }]}>
              <Text style={styles.statValue}>{activeGoals.length}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
          </View>

          {/* My Rounds */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Rounds</Text>
              <Text style={styles.sectionCount}>{activeRounds.length} active</Text>
            </View>
            {activeRounds.map(round => (
              <RoundCard key={round.id} round={round} onPress={() => onRoundPress(round.id)} />
            ))}
            {activeRounds.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔄</Text>
                <Text style={styles.emptyTitle}>No active rounds</Text>
                <Text style={styles.emptyBody}>Join or create a savings round to get started.</Text>
              </View>
            )}
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Goals</Text>
              <Text style={styles.sectionCount}>{activeGoals.length} active</Text>
            </View>
            {activeGoals.slice(0, 2).map(goal => (
              <GoalCard key={goal.id} goal={goal} onPress={() => onGoalPress(goal.id)} />
            ))}
            {activeGoals.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎯</Text>
                <Text style={styles.emptyTitle}>No active goals</Text>
                <Text style={styles.emptyBody}>Set a savings goal to track your progress.</Text>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={onCreatePress} style={styles.fab} activeOpacity={0.85}>
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
  scroll: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.greenDeep,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  greeting: {},
  greetingText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  name: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.white,
  },
  trustRingButton: {
    padding: 4,
  },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  actionBanner: {
    backgroundColor: Colors.greenDeep,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  bannerLeft: {},
  bannerTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  bannerSub: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.white,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bannerArrow: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 24,
    color: Colors.white,
    lineHeight: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.textDark,
  },
  statLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: Colors.textMed,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 19,
    color: Colors.textDark,
  },
  sectionCount: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: 4,
  },
  emptyBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    textAlign: 'center',
    lineHeight: 20,
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
