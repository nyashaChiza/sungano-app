import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import TrustRing from '../components/ui/TrustRing';
import RingsPattern from '../components/brand/RingsPattern';
import RoundCard from '../components/rounds/RoundCard';
import GoalCard from '../components/goals/GoalCard';
import { useRounds } from '../hooks/useRounds';
import { useGoals } from '../hooks/useGoals';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  user: {
    name: string;
    trustScore: {
      score: number;
      tier: string;
      onTimePayments: number;
      defaultCount: number;
    };
  };
  onRoundPress: (roundId: string) => void;
  onGoalPress: (goalId: string) => void;
  onCreatePress: () => void;
  onTrustPress: () => void;
}

function getTierLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Building';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function HomeScreen({
  user,
  onRoundPress,
  onGoalPress,
  onTrustPress,
}: HomeScreenProps) {
  const { rounds } = useRounds();
  const { goals } = useGoals();

  const firstName = (user.name ?? '').split(' ')[0];
  const activeRounds = rounds.filter(r => r.status === 'active');
  const activeGoals = goals.filter(g => g.status === 'active');
  const trustScore = user.trustScore ?? { score: 0, onTimePayments: 0, defaultCount: 0 };
  const tierLabel = getTierLabel(trustScore.score);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <RingsPattern width={width} height={260} color={Colors.white} opacity={0.07} />
          <SafeAreaView edges={['top']}>
            <View style={styles.topRow}>
              <Text style={styles.dateText}>{getFormattedDate()}</Text>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={22} color={Colors.white} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>

            <Text style={styles.greeting}>Mhoro, {firstName}</Text>

            <TouchableOpacity
              onPress={onTrustPress}
              activeOpacity={0.85}
              style={styles.trustRow}
            >
              <View style={styles.trustRingWrap}>
                <TrustRing score={trustScore.score} size={88} strokeWidth={6} dark />
              </View>
              <View style={styles.trustInfo}>
                <Text style={styles.trustLabel}>YOUR TRUST SCORE</Text>
                <Text style={styles.trustTier}>{tierLabel}</Text>
                <Text style={styles.trustStats}>
                  {trustScore.onTimePayments} rounds completed · {trustScore.defaultCount} defaults
                </Text>
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* My Rounds */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My rounds</Text>
            <Text style={styles.sectionMeta}>{activeRounds.length} active</Text>
          </View>

          {activeRounds.map(round => (
            <RoundCard key={round.id} round={round} onPress={() => onRoundPress(round.id)} />
          ))}

          {activeRounds.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No active rounds</Text>
              <Text style={styles.emptyBody}>
                Join or create a savings round to get started.
              </Text>
            </View>
          )}

          {/* Goals */}
          <View style={[styles.sectionHeader, styles.sectionHeaderGap]}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <Text style={styles.sectionMeta}>{activeGoals.length} active</Text>
          </View>

          {activeGoals.slice(0, 3).map(goal => (
            <GoalCard key={goal.id} goal={goal} onPress={() => onGoalPress(goal.id)} />
          ))}

          {activeGoals.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No active goals</Text>
              <Text style={styles.emptyBody}>
                Set a savings goal to track your progress.
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dateText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  bellBtn: {
    position: 'relative',
    padding: 4,
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.amber,
    borderWidth: 1.5,
    borderColor: Colors.greenDeep,
  },
  greeting: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
    color: Colors.white,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  trustRingWrap: {},
  trustInfo: {
    flex: 1,
  },
  trustLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  trustTier: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.white,
    marginBottom: 4,
  },
  trustStats: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionHeaderGap: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 20,
    color: Colors.textDark,
  },
  sectionMeta: {
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
    marginBottom: Spacing.md,
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
});
