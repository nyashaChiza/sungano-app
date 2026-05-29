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
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import { useGoalsStore, Goal } from '../../store/goalsStore';
import ProgressBar from '../../components/ui/ProgressBar';

const { width } = Dimensions.get('window');

type TabFilter = 'all' | 'solo' | 'group';

interface GoalsHubScreenProps {
  onGoalPress: (goalId: string) => void;
  onCreateGoal: () => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  const n = amount.toLocaleString();
  if (currency === 'USD') return `$${n}`;
  if (currency === 'NGN') return `₦${n}`;
  if (currency === 'ZWG') return `ZWG ${n}`;
  return `${currency} ${n}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysLeft(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function dueDateLabel(dateStr: string): string {
  const d = daysLeft(dateStr);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return 'Due today';
  if (d < 30) return `${d}d left`;
  return `Due ${formatDate(dateStr)}`;
}

function dueDateColor(dateStr: string): string {
  const d = daysLeft(dateStr);
  if (d < 0) return Colors.red;
  if (d < 14) return Colors.amber;
  return Colors.textMed;
}

// ─── Goal icon — coloured rounded square with initial ───────────────────────

function GoalInitial({ name, size = 44 }: { name: string; size?: number }) {
  const COLORS = [Colors.greenDeep, '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const idx = name.charCodeAt(0) % COLORS.length;
  const bg = COLORS[idx];
  return (
    <View style={[gi.box, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg + '22' }]}>
      <Text style={[gi.letter, { color: bg, fontSize: size * 0.42 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const gi = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: Fonts.displayBold },
});

// ─── Empty illustration ──────────────────────────────────────────────────────

function EmptyIllustration() {
  return (
    <Svg width={80} height={72} viewBox="0 0 80 72" fill="none">
      <Rect x={20} y={22} width={40} height={38} rx={6} stroke={Colors.greenDeep} strokeWidth={1.5} fill={Colors.greenPale} />
      <Line x1={40} y1={14} x2={40} y2={22} stroke={Colors.greenDeep} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={40} cy={10} r={4} stroke={Colors.greenDeep} strokeWidth={1.5} />
      <Path d="M28 40 H52 M28 48 H44" stroke={Colors.greenDeep} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Active goal card ────────────────────────────────────────────────────────

function ActiveGoalCard({ goal, onPress }: { goal: Goal; onPress: () => void }) {
  const progress = goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0;
  const pct = Math.round(progress * 100);
  const currency = goal.currency ?? 'USD';
  const dateColor = dueDateColor(goal.target_date);
  const dateLabel = dueDateLabel(goal.target_date);
  const memberCount = goal.members?.length ?? 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={gc.wrapper}>
      <View style={[gc.card, Shadow.card]}>
        <View style={gc.topRow}>
          <GoalInitial name={goal.name} size={44} />
          <View style={gc.info}>
            <View style={gc.nameLine}>
              <Text style={gc.name} numberOfLines={1}>{goal.name}</Text>
              <View style={gc.amountCol}>
                <Text style={gc.amountCurrent}>
                  {formatCurrency(goal.current_amount, currency)}
                </Text>
                <Text style={gc.amountTarget}>
                  / {formatCurrency(goal.target_amount, currency)}
                </Text>
              </View>
            </View>
            <View style={gc.metaRow}>
              <Text style={[gc.due, { color: dateColor }]}>{dateLabel}</Text>
              {goal.type === 'group' && memberCount > 0 && (
                <View style={gc.memberBadge}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Circle cx={9} cy={8} r={3.5} stroke={Colors.greenDeep} strokeWidth={1.5} />
                    <Path d="M3 20c0-3.3 2.7-6 6-6" stroke={Colors.greenDeep} strokeWidth={1.5} strokeLinecap="round" />
                    <Circle cx={17} cy={8} r={3.5} stroke={Colors.greenDeep} strokeWidth={1.5} />
                    <Path d="M13 20c0-3.3 2.7-6 6-6" stroke={Colors.greenDeep} strokeWidth={1.5} strokeLinecap="round" />
                  </Svg>
                  <Text style={gc.memberCount}>{memberCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <ProgressBar
          value={goal.current_amount}
          max={goal.target_amount}
          height={6}
          fill={Colors.greenDeep}
          track={Colors.greenSubtle}
          milestones={[0.25, 0.5, 0.75]}
        />

        <View style={gc.bottomRow}>
          <Text style={gc.pct}>{pct}%</Text>
          <Text style={gc.depositsLeft}>
            {goal.frequency ? `${goal.frequency} deposits` : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Completed goal card ─────────────────────────────────────────────────────

function CompletedGoalCard({ goal, onPress }: { goal: Goal; onPress: () => void }) {
  const currency = goal.currency ?? 'USD';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={gc.wrapper}>
      <View style={[gc.card, Shadow.card, gc.completedCard]}>
        <GoalInitial name={goal.name} size={40} />
        <View style={gc.completedInfo}>
          <Text style={gc.name}>{goal.name}</Text>
          <Text style={gc.amountTarget}>
            {formatCurrency(goal.target_amount, currency)} · Completed
          </Text>
        </View>
        <View style={gc.doneBadge}>
          <Text style={gc.doneText}>DONE</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const gc = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  topRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  info: { flex: 1, gap: 4 },
  nameLine: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  name: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.textDark, flex: 1, marginRight: 8 },
  amountCol: { alignItems: 'flex-end' },
  amountCurrent: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.textDark },
  amountTarget: { fontFamily: Fonts.bodyRegular, fontSize: 11, color: Colors.textMed },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  due: { fontFamily: Fonts.bodyRegular, fontSize: 12 },
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.greenPale, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  memberCount: { fontFamily: Fonts.bodyMedium, fontSize: 11, color: Colors.greenDeep },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pct: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.greenDeep },
  depositsLeft: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed },
  completedInfo: { flex: 1, gap: 2 },
  doneBadge: {
    backgroundColor: Colors.greenPale, borderWidth: 1, borderColor: Colors.greenSubtle,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill,
  },
  doneText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.greenDeep, letterSpacing: 0.5 },
});

// ─── main screen ─────────────────────────────────────────────────────────────

export default function GoalsHubScreen({ onGoalPress, onCreateGoal }: GoalsHubScreenProps) {
  const { goals, isLoading, fetchGoals } = useGoalsStore();
  const [filter, setFilter] = useState<TabFilter>('all');

  useEffect(() => { fetchGoals(); }, []);

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed' || g.status === 'cancelled');

  const filteredActive = filter === 'solo'
    ? activeGoals.filter(g => g.type === 'solo')
    : filter === 'group'
      ? activeGoals.filter(g => g.type === 'group')
      : activeGoals;

  const totalSaved = activeGoals.reduce((s, g) => s + g.current_amount, 0);
  const primaryCurrency = activeGoals[0]?.currency ?? 'USD';

  const TABS: Array<{ key: TabFilter; label: string }> = [
    { key: 'all',   label: 'All' },
    { key: 'solo',  label: 'Solo' },
    { key: 'group', label: 'Group' },
  ];

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerTop}>
            <Text style={s.title}>My Goals</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/goals/create')} style={s.addBtn} activeOpacity={0.85}>
              <Text style={s.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Stats bar */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statNum}>{activeGoals.length}</Text>
              <Text style={s.statLabel}>Active</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statNum}>{formatCurrency(totalSaved, primaryCurrency)}</Text>
              <Text style={s.statLabel}>Saved</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statNum}>{completedGoals.length}</Text>
              <Text style={s.statLabel}>Complete</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── Filter tabs ── */}
      <View style={s.filterRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setFilter(t.key)}
            style={s.filterTab}
            activeOpacity={0.7}
          >
            <Text style={[s.filterLabel, filter === t.key && s.filterLabelActive]}>{t.label}</Text>
            {filter === t.key && <View style={s.filterUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={Colors.greenDeep} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {filteredActive.map(g => (
            <ActiveGoalCard key={g.id} goal={g} onPress={() => onGoalPress(g.id)} />
          ))}

          {filteredActive.length === 0 && (
            <View style={s.emptyState}>
              <EmptyIllustration />
              <Text style={s.emptyTitle}>No goals yet</Text>
              <Text style={s.emptyBody}>Create a goal and track your deposits — solo or with a group.</Text>
              <TouchableOpacity onPress={onCreateGoal} style={s.emptyBtn} activeOpacity={0.85}>
                <Text style={s.emptyBtnText}>+ Create my first goal</Text>
              </TouchableOpacity>
            </View>
          )}

          {(filter === 'all' || filter === 'solo') && completedGoals.length > 0 && (
            <>
              <Text style={s.sectionDivider}>COMPLETED</Text>
              {completedGoals.map(g => (
                <CompletedGoalCard key={g.id} goal={g} onPress={() => onGoalPress(g.id)} />
              ))}
            </>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* ── FAB ── */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/goals/create')}
        style={s.fab}
        activeOpacity={0.85}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { backgroundColor: Colors.greenDeep, paddingBottom: Spacing.xl, overflow: 'hidden' },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },
  addBtn: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute', right: Spacing.xl,
  },
  addBtnText: { color: Colors.white, fontSize: 22, lineHeight: 26, fontFamily: Fonts.bodyRegular },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl, alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontFamily: Fonts.mono, fontSize: 16, color: Colors.white },
  statLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', position: 'relative' },
  filterLabel: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.textMed },
  filterLabelActive: { fontFamily: Fonts.bodySemiBold, color: Colors.greenDeep },
  filterUnderline: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: Colors.greenDeep, borderRadius: 1,
  },
  list: { padding: Spacing.lg },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionDivider: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.textMed,
    letterSpacing: 1.2, textAlign: 'center', marginVertical: Spacing.lg,
  },
  emptyState: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.xxl, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  emptyTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 17, color: Colors.textDark },
  emptyBody: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: Spacing.sm, backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.pill,
  },
  emptyBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.white },
  fab: {
    position: 'absolute', bottom: 16, right: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.greenDeep,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.card, shadowOpacity: 0.25, elevation: 8,
  },
  fabText: { fontSize: 28, color: Colors.white, lineHeight: 32 },
});
