import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Round } from '../../store/roundsStore';
import { Colors, Fonts, Shadow, Radius, Spacing } from '../../constants/theme';

interface RoundCardProps {
  round: Round;
  onPress: () => void;
}

// Accent bar colour matches status exactly as per PDF
function accentFor(status: string) {
  if (status === 'active')    return Colors.greenDeep;
  if (status === 'completed') return Colors.greenConfirm;
  if (status === 'pending')   return Colors.amber;
  return Colors.textLight;
}

// Dot colour per payment status
function dotFor(status: string) {
  if (status === 'paid' || status === 'confirmed') return Colors.greenConfirm;
  if (status === 'overdue')   return Colors.amber;
  if (status === 'defaulted') return Colors.red;
  if (status === 'grace')     return Colors.amber;
  return Colors.border;
}

function freqLabel(freq: string) {
  if (freq === 'weekly')   return 'wk';
  if (freq === 'biweekly') return '2wk';
  return 'mo';
}

function currencySymbol(currency: string) {
  if (currency === 'USD') return '$';
  if (currency === 'ZAR') return 'R';
  return currency + ' ';
}

// Status badge that matches PDF design exactly
function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    active:    { bg: Colors.greenConfirm, color: Colors.white,   label: '✓ PAID'    },
    pending:   { bg: Colors.bgLight,      color: Colors.textMed, label: '○ PENDING' },
    completed: { bg: Colors.greenPale,    color: Colors.greenDeep, label: 'DONE'    },
    cancelled: { bg: Colors.bgLight,      color: Colors.textLight, label: 'CANCELLED'},
  };

  // If the card itself has a payment status context use that
  const c = cfg[status] ?? cfg.pending;

  return (
    <View style={[pill.base, { backgroundColor: c.bg }]}>
      <Text style={[pill.text, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}
const pill = StyleSheet.create({
  base: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  text: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.3 },
});

export default function RoundCard({ round, onPress }: RoundCardProps) {
  const accent   = accentFor(round.status);
  const cycle    = round.current_cycle;
  const payments = cycle?.payments ?? [];
  const paidCount = payments.filter(p => p.status === 'paid' || ['paid','confirmed'].includes(p.status)).length;
  const sym      = currencySymbol(round.currency ?? 'USD');
  const isPayoutCycle = payments.some((p: any) => p.is_recipient);

  // Determine the right status badge — if I've paid this cycle show PAID, else show round status
  const myPayment = payments.find((p: any) => p.is_mine);
  const badgeStatus = myPayment?.status === 'paid' ? 'active' : round.status;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.wrapper}>
      <View style={[styles.card, Shadow.card]}>
        {/* Accent bar — left edge, matches PDF exactly */}
        <View style={[styles.accent, { backgroundColor: accent }]} />

        <View style={styles.content}>
          {/* Row 1: name + status badge */}
          <View style={styles.row1}>
            <Text style={styles.name} numberOfLines={1}>{round.name}</Text>
            <StatusPill status={badgeStatus} />
          </View>

          {/* Row 2: amount / freq · cycle info */}
          <Text style={styles.meta}>
            <Text style={styles.amount}>{sym}{round.contribution_amount}</Text>
            <Text style={styles.metaMuted}> / {freqLabel(round.cycle_frequency ?? 'monthly')}</Text>
            {cycle && (
              <Text style={styles.metaMuted}>  ·  Cycle {cycle.cycle_number} of {round.total_cycles}</Text>
            )}
            {!cycle && round.total_cycles && (
              <Text style={styles.metaMuted}>  ·  {round.total_cycles} cycles</Text>
            )}
          </Text>

          {/* Payout banner */}
          {isPayoutCycle && (
            <View style={styles.payoutBanner}>
              <Text style={styles.payoutText}>🎯 Your payout this cycle</Text>
            </View>
          )}

          {/* Row 3: payment dots + paid count — matches PDF grid */}
          <View style={styles.row3}>
            <View style={styles.dotsWrap}>
              {payments.length > 0
                ? payments.map((p: any) => (
                    <View key={p.id} style={[styles.dot, { backgroundColor: dotFor(p.status) }]} />
                  ))
                : Array.from({ length: round.total_cycles ?? 6 }).map((_, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: Colors.border }]} />
                  ))
              }
            </View>
            <Text style={styles.paidLabel}>
              {payments.length > 0
                ? `${paidCount} of ${payments.length} paid`
                : `${round.number_of_members ?? round.total_cycles} members`
              }
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accent: { width: 4 },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingVertical: 14, gap: 6 },

  row1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  name: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.textDark, flex: 1 },

  meta: { fontSize: 13 },
  amount: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.textDark },
  metaMuted: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },

  payoutBanner: { backgroundColor: Colors.greenPale, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4, alignSelf: 'flex-start' },
  payoutText:   { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.greenDeep },

  row3: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dotsWrap: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  paidLabel: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed, flexShrink: 0, marginLeft: Spacing.sm },
});
