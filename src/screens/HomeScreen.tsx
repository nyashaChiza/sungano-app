import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, RefreshControl, ActivityIndicator,
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
  onRoundPress: (id: string) => void;
  onGoalPress:  (id: string) => void;
  onCreatePress: () => void;
  onTrustPress: () => void;
}

function getTierLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Building';
}

function getDayDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export default function HomeScreen({ user, onRoundPress, onGoalPress, onTrustPress }: HomeScreenProps) {
  const { rounds, isLoading: rLoading, fetchRounds } = useRounds();
  const { goals,  isLoading: gLoading, fetchGoals  } = useGoals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await Promise.all([fetchRounds(), fetchGoals()]); }
    finally { setRefreshing(false); }
  }, [fetchRounds, fetchGoals]);

  const firstName   = (user.name ?? '').split(' ')[0];
  const ts          = user.trustScore ?? { score: 0, onTimePayments: 0, defaultCount: 0 };
  const tierLabel   = getTierLabel(ts.score);
  const visRounds   = rounds.filter(r => r.status !== 'cancelled');
  const visGoals    = goals.filter(g => g.status !== 'cancelled');
  const activeCount = visRounds.filter(r => r.status === 'active').length;
  const goalCount   = visGoals.filter(g => g.status === 'active').length;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} colors={[Colors.greenDeep]} />
        }
      >
        {/* ── Green header ── */}
        <View style={styles.header}>
          <RingsPattern width={width} height={280} color={Colors.white} opacity={0.07} />
          <SafeAreaView edges={['top']}>

            {/* Date + bell */}
            <View style={styles.topBar}>
              <Text style={styles.dateText}>{getDayDate()}</Text>
              <TouchableOpacity style={styles.bellWrap} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={22} color={Colors.white} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>

            {/* Greeting — matches "Mhoro, Tendai" from PDF */}
            <Text style={styles.greeting}>Mhoro, {firstName}</Text>

            {/* Trust row — ring left, info right */}
            <TouchableOpacity onPress={onTrustPress} activeOpacity={0.85} style={styles.trustRow}>
              <TrustRing score={ts.score} size={88} strokeWidth={6} dark />
              <View style={styles.trustInfo}>
                <Text style={styles.trustLabel}>YOUR TRUST SCORE</Text>
                <Text style={styles.trustTier}>{tierLabel}</Text>
                <Text style={styles.trustStats}>
                  {ts.onTimePayments} rounds completed · {ts.defaultCount} defaults
                </Text>
              </View>
            </TouchableOpacity>

          </SafeAreaView>
        </View>

        {/* ── White body ── */}
        <View style={styles.body}>

          {/* My rounds section */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>My rounds</Text>
            {activeCount > 0 && <Text style={styles.sectionMeta}>{activeCount} active</Text>}
          </View>

          {rLoading ? (
            <ActivityIndicator color={Colors.greenDeep} style={styles.loader} />
          ) : visRounds.length > 0 ? (
            visRounds.map(r => (
              <RoundCard key={r.id} round={r} onPress={() => onRoundPress(r.id)} />
            ))
          ) : (
            <EmptyInline icon="refresh-circle-outline" text="No rounds yet — join or create one." />
          )}

          {/* Goals section */}
          <View style={[styles.sectionRow, styles.sectionGap]}>
            <Text style={styles.sectionTitle}>Goals</Text>
            {goalCount > 0 && <Text style={styles.sectionMeta}>{goalCount} active</Text>}
          </View>

          {gLoading ? (
            <ActivityIndicator color={Colors.greenDeep} style={styles.loader} />
          ) : visGoals.length > 0 ? (
            visGoals.slice(0, 3).map(g => (
              <GoalCard key={g.id} goal={g} onPress={() => onGoalPress(g.id)} />
            ))
          ) : (
            <EmptyInline icon="flag-outline" text="No goals yet — start saving toward something." />
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function EmptyInline({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.emptyRow}>
      <Ionicons name={icon} size={18} color={Colors.textLight} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bgLight },
  scroll:      { flexGrow: 1 },

  // Header
  header:      { backgroundColor: Colors.greenDeep, paddingBottom: 28, overflow: 'hidden' },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, marginBottom: 4 },
  dateText:    { fontFamily: Fonts.bodyRegular, fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  bellWrap:    { padding: 4, position: 'relative' },
  notifDot:    { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.amber, borderWidth: 1.5, borderColor: Colors.greenDeep },
  greeting:    { fontFamily: Fonts.displayBold, fontSize: 28, color: Colors.white, paddingHorizontal: Spacing.xl, marginBottom: 20 },

  // Trust row
  trustRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, gap: 18 },
  trustInfo:   { flex: 1 },
  trustLabel:  { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, marginBottom: 3 },
  trustTier:   { fontFamily: Fonts.displayBold, fontSize: 22, color: Colors.white, marginBottom: 3 },
  trustStats:  { fontFamily: Fonts.bodyRegular, fontSize: 12, color: 'rgba(255,255,255,0.6)' },

  // Body
  body:        { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  sectionRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionGap:  { marginTop: Spacing.xl },
  sectionTitle:{ fontFamily: Fonts.displaySemiBold, fontSize: 20, color: Colors.textDark },
  sectionMeta: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },
  loader:      { marginVertical: Spacing.xl },

  emptyRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', marginBottom: Spacing.md },
  emptyText:   { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },
});
