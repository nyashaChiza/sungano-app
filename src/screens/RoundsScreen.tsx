import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Polyline, Circle, Path } from 'react-native-svg';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import { useRoundsStore, Round, Payment } from '../store/roundsStore';
import { useAuthStore } from '../store/authStore';
import RingsPattern from '../components/brand/RingsPattern';

const { width } = Dimensions.get('window');

type Filter = 'all' | 'active' | 'pending' | 'done';

interface RoundsScreenProps {
  onRoundPress: (roundId: string) => void;
  onCreatePress: () => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function freqLabel(freq: string): string {
  const map: Record<string, string> = {
    weekly: 'wk', biweekly: '2wk', monthly: 'mo',
    daily: 'day', quarterly: 'qtr',
  };
  return map[freq] ?? freq;
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'USD') return `$${amount.toLocaleString()}`;
  if (currency === 'NGN') return `₦${amount.toLocaleString()}`;
  if (currency === 'ZWG') return `ZWG ${amount.toLocaleString()}`;
  return `${currency} ${amount.toLocaleString()}`;
}

function formatNextPayout(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function dotColor(status: Payment['status']): string {
  switch (status) {
    case 'paid':      return Colors.greenConfirm;
    case 'overdue':   return Colors.amber;
    case 'defaulted': return Colors.red;
    default:          return Colors.border;
  }
}

// ─── sub-components ─────────────────────────────────────────────────────────

function StatusPill({ status, myStatus }: { status: Round['status']; myStatus?: Payment['status'] }) {
  if (status === 'completed' || status === 'cancelled') {
    return (
      <View style={[pill.base, pill.done]}>
        <Text style={[pill.text, pill.doneText]}>DONE</Text>
      </View>
    );
  }
  if (myStatus === 'paid') {
    return (
      <View style={[pill.base, pill.paid]}>
        <Text style={[pill.text, pill.paidText]}>✓ PAID</Text>
      </View>
    );
  }
  if (myStatus === 'overdue') {
    return (
      <View style={[pill.base, pill.overdue]}>
        <Text style={[pill.text, pill.overdueText]}>OVERDUE</Text>
      </View>
    );
  }
  return (
    <View style={[pill.base, pill.pending]}>
      <View style={pill.pendingDot} />
      <Text style={[pill.text, pill.pendingText]}>PENDING</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 5,
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  pending: { backgroundColor: Colors.bgLight, borderWidth: 1, borderColor: Colors.border },
  pendingText: { color: Colors.textMed },
  pendingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textLight },
  paid: { backgroundColor: Colors.greenConfirm },
  paidText: { color: Colors.white },
  overdue: { backgroundColor: Colors.amberBg },
  overdueText: { color: Colors.amber },
  done: { backgroundColor: Colors.greenPale, borderWidth: 1, borderColor: Colors.greenSubtle },
  doneText: { color: Colors.greenDeep },
});

function ActiveRoundCard({
  round,
  userId,
  onPress,
}: {
  round: Round;
  userId?: string;
  onPress: () => void;
}) {
  const cycle = round.current_cycle;
  const payments = cycle?.payments ?? [];
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const total = payments.length || round.number_of_members;
  const myPayment = payments.find(p => p.user_id === userId);
  const isMyPayout = cycle?.recipient_id === userId;
  const accentColor = myPayment?.status === 'pending' || myPayment?.status === 'overdue'
    ? Colors.amber
    : Colors.greenDeep;

  const cycleText = cycle
    ? `Cycle ${cycle.cycle_number} of ${round.number_of_members}`
    : `${round.number_of_members} cycles`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={card.wrapper}>
      <View style={[card.card, Shadow.card]}>
        <View style={[card.accent, { backgroundColor: accentColor }]} />
        <View style={card.body}>
          <View style={card.topRow}>
            <Text style={card.name} numberOfLines={1}>{round.name}</Text>
            <StatusPill status={round.status} myStatus={myPayment?.status} />
          </View>

          <Text style={card.meta}>
            <Text style={card.monoAmount}>
              {formatCurrency(round.contribution_amount, round.currency)}
            </Text>
            <Text style={card.metaMuted}> / {freqLabel(round.frequency)}  ·  {cycleText}</Text>
          </Text>

          {isMyPayout && (
            <View style={card.payoutChip}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={9} stroke={Colors.greenDeep} strokeWidth={2} />
                <Circle cx={12} cy={12} r={4} fill={Colors.greenDeep} />
              </Svg>
              <Text style={card.payoutText}>Your payout this cycle</Text>
            </View>
          )}

          <View style={card.bottomRow}>
            <View style={card.dots}>
              {payments.length > 0
                ? payments.map(p => (
                    <View
                      key={p.id}
                      style={[card.dot, { backgroundColor: dotColor(p.status) },
                        p.user_id === userId && card.dotMine]}
                    />
                  ))
                : Array.from({ length: round.number_of_members }).map((_, i) => (
                    <View key={i} style={[card.dot, { backgroundColor: Colors.border }]} />
                  ))
              }
            </View>
            <Text style={card.paidCount}>{paidCount} of {total} paid</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CompletedRoundCard({ round, onPress }: { round: Round; onPress: () => void }) {
  const endDate = round.updated_at
    ? formatNextPayout(round.updated_at)
    : '';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={card.wrapper}>
      <View style={[card.card, Shadow.card, card.completedCard]}>
        <View style={card.checkCircle}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Polyline
              points="5,13 9,17 19,7"
              stroke={Colors.greenDeep}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={card.completedBody}>
          <Text style={card.name}>{round.name}</Text>
          <Text style={card.metaMuted}>
            {formatCurrency(round.contribution_amount, round.currency)} / {freqLabel(round.frequency)}
            {'  ·  '}{round.number_of_members} cycles
            {endDate ? `  ·  ${endDate}` : ''}
          </Text>
        </View>
        <StatusPill status="completed" />
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  completedCard: { alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  accent: { width: 4 },
  body: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  name: { fontFamily: Fonts.displaySemiBold, fontSize: 16, color: Colors.textDark, flex: 1 },
  meta: { fontSize: 13 },
  monoAmount: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.textDark },
  metaMuted: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },
  payoutChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.greenPale, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill,
  },
  payoutText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.greenDeep },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: 5, flex: 1, flexWrap: 'wrap' },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dotMine: { borderWidth: 1.5, borderColor: Colors.greenDeep },
  paidCount: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed, marginLeft: Spacing.sm, flexShrink: 0 },
  checkCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.greenPale,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  completedBody: { flex: 1, gap: 3 },
});

// ─── main screen ────────────────────────────────────────────────────────────

export default function RoundsScreen({ onRoundPress, onCreatePress }: RoundsScreenProps) {
  const { rounds, isLoading, fetchRounds } = useRoundsStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { fetchRounds(); }, []);

  const activeRounds    = rounds.filter(r => r.status === 'active');
  const completedRounds = rounds.filter(r => r.status === 'completed' || r.status === 'cancelled');

  const filteredActive = filter === 'done' ? [] :
    filter === 'pending'
      ? activeRounds.filter(r =>
          r.current_cycle?.payments.find(p => p.user_id === user?.id)?.status === 'pending')
      : activeRounds;

  const filteredCompleted = filter === 'all' || filter === 'done' ? completedRounds : [];

  // Stats
  const totalInRotation = activeRounds.reduce(
    (sum, r) => sum + r.contribution_amount * r.number_of_members, 0,
  );
  const primaryCurrency = activeRounds[0]?.currency ?? 'USD';

  const nextPayout = activeRounds
    .filter(r => r.current_cycle?.due_date)
    .sort((a, b) =>
      new Date(a.current_cycle!.due_date).getTime() - new Date(b.current_cycle!.due_date).getTime()
    )[0];

  const FILTERS: Array<{ key: Filter; label: string }> = [
    { key: 'all',     label: 'All' },
    { key: 'active',  label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'done',    label: 'Done' },
  ];

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <RingsPattern width={width} height={200} color={Colors.white} opacity={0.07} />
        <SafeAreaView edges={['top']}>
          <View style={s.headerTop}>
            <Text style={s.headerTitle}>My Rounds</Text>
            <TouchableOpacity onPress={onCreatePress} style={s.addBtn} activeOpacity={0.85}>
              <Text style={s.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={s.statsRow}>
            <View style={s.statBlock}>
              <Text style={s.statLabel}>IN ROTATION</Text>
              <Text style={s.statValue}>
                {formatCurrency(totalInRotation, primaryCurrency)}
              </Text>
              <Text style={s.statSub}>across {activeRounds.length} rounds</Text>
            </View>

            <View style={s.statDivider} />

            <View style={s.statBlock}>
              <Text style={s.statLabel}>NEXT PAYOUT</Text>
              {nextPayout ? (
                <>
                  <Text style={s.statValue}>
                    {formatNextPayout(nextPayout.current_cycle!.due_date)}
                  </Text>
                  <Text style={s.statSub}>
                    {nextPayout.name} · {formatCurrency(nextPayout.contribution_amount * nextPayout.number_of_members, nextPayout.currency)}
                  </Text>
                </>
              ) : (
                <Text style={s.statSub}>No upcoming payouts</Text>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── Filter tabs ── */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={s.filterTab}
            activeOpacity={0.7}
          >
            <Text style={[s.filterLabel, filter === f.key && s.filterLabelActive]}>
              {f.label}
            </Text>
            {filter === f.key && <View style={s.filterUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={Colors.greenDeep} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        >
          {filteredActive.map(round => (
            <ActiveRoundCard
              key={round.id}
              round={round}
              userId={user?.id}
              onPress={() => onRoundPress(round.id)}
            />
          ))}

          {filteredActive.length === 0 && filteredCompleted.length === 0 && (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>No rounds here</Text>
              <Text style={s.emptyBody}>Create or join a savings round to get started.</Text>
            </View>
          )}

          {filteredCompleted.length > 0 && (
            <>
              <Text style={s.sectionDivider}>COMPLETED</Text>
              {filteredCompleted.map(round => (
                <CompletedRoundCard
                  key={round.id}
                  round={round}
                  onPress={() => onRoundPress(round.id)}
                />
              ))}
            </>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* ── FAB ── */}
      <TouchableOpacity onPress={() => router.push('/(app)/rounds/create')} style={s.fab} activeOpacity={0.85}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { backgroundColor: Colors.greenDeep, overflow: 'hidden', paddingBottom: Spacing.xl },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.xl,
  },
  addBtnText: { color: Colors.white, fontSize: 22, lineHeight: 26, fontFamily: Fonts.bodyRegular },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  statBlock: { flex: 1, gap: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  statLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
  },
  statValue: {
    fontFamily: Fonts.mono,
    fontSize: 22,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statSub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  filterLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textMed,
  },
  filterLabelActive: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.greenDeep,
  },
  filterUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.greenDeep,
    borderRadius: 1,
  },
  list: { padding: Spacing.lg },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionDivider: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.textMed,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginVertical: Spacing.lg,
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
  emptyTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.textDark, marginBottom: 4 },
  emptyBody: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 16,
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
  fabText: { fontSize: 28, color: Colors.white, lineHeight: 32 },
});
