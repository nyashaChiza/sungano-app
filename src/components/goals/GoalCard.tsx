import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Goal } from '../../store/goalsStore';
import { Colors, Fonts, Shadow, Radius, Spacing } from '../../constants/theme';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
}

function dueDateLabel(dateStr: string) {
  const due = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((due.getTime() - now.getTime()) / 86_400_000);
  if (days < 0)  return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return 'Due ' + due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dueDateColor(dateStr: string) {
  const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  if (days < 0)  return Colors.red;
  if (days <= 14) return Colors.amber;
  return Colors.textMed;
}

function currSym(c: string) {
  return c === 'USD' ? '$' : c === 'ZAR' ? 'R' : c + ' ';
}

// Segmented progress bar matching PDF — 4 equal segments with milestone markers
function SegmentedBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  // 4 segments at 25% each — color the filled portion green, unfilled pale
  const segments = [0.25, 0.5, 0.75, 1.0];
  return (
    <View style={bar.row}>
      {segments.map((threshold, i) => {
        const segStart = i * 0.25;
        const filled = pct >= threshold ? 1 : pct > segStart ? (pct - segStart) / 0.25 : 0;
        return (
          <View key={i} style={bar.seg}>
            <View style={[bar.fill, { flex: filled, backgroundColor: Colors.greenDeep }]} />
            <View style={[bar.empty, { flex: 1 - filled }]} />
          </View>
        );
      })}
    </View>
  );
}
const bar = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 3, height: 7 },
  seg:  { flex: 1, flexDirection: 'row', borderRadius: 4, overflow: 'hidden', backgroundColor: Colors.greenSubtle },
  fill: { backgroundColor: Colors.greenDeep },
  empty:{ backgroundColor: 'transparent' },
});

export default function GoalCard({ goal, onPress }: GoalCardProps) {
  const pct  = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
  const sym  = currSym(goal.currency ?? 'USD');
  const isGrp = goal.type === 'group' && (goal.members?.length ?? 0) > 1;

  // deposits remaining
  const depositsLeft = (goal as any).deposits_remaining ?? null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.wrapper}>
      <View style={[styles.card, Shadow.card]}>
        {/* Top row: emoji + name / due + percentage */}
        <View style={styles.topRow}>
          <View style={styles.nameGroup}>
            <Text style={styles.name} numberOfLines={1}>{goal.name}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.due, { color: dueDateColor(goal.target_date) }]}>
                {dueDateLabel(goal.target_date)}
              </Text>
              {isGrp && (
                <Text style={styles.groupBadge}>
                  👥 {goal.members!.length}
                </Text>
              )}
            </View>
          </View>

          {/* Right: pct + amounts stacked */}
          <View style={styles.rightGroup}>
            <Text style={styles.pct}>{pct}%</Text>
            <Text style={styles.amounts} numberOfLines={1}>
              {sym}{goal.current_amount.toFixed(0)}{' '}
              <Text style={styles.amountsSlash}>/ {sym}{goal.target_amount.toFixed(0)}</Text>
            </Text>
          </View>
        </View>

        {/* Segmented progress bar */}
        <SegmentedBar value={goal.current_amount} max={goal.target_amount} />

        {/* Bottom line */}
        <Text style={styles.depositsLeft}>
          {depositsLeft != null
            ? `${depositsLeft} deposit${depositsLeft !== 1 ? 's' : ''} left`
            : goal.status === 'completed' ? 'Completed' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md },
  nameGroup: { flex: 1, gap: 3 },
  name: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.textDark },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  due:  { fontFamily: Fonts.bodyRegular, fontSize: 12 },
  groupBadge: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed },
  rightGroup: { alignItems: 'flex-end', gap: 2 },
  pct:     { fontFamily: Fonts.mono, fontSize: 15, color: Colors.greenDeep },
  amounts: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.greenDeep },
  amountsSlash: { color: Colors.textLight },
  depositsLeft: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed },
});
