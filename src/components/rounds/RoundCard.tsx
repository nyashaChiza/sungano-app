import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Round, PaymentStatus, RoundStatus } from '../../types';
import { Colors, Fonts, Shadow, Radius, Spacing } from '../../constants/theme';
import StatusBadge from '../ui/StatusBadge';

interface RoundCardProps {
  round: Round;
  onPress: () => void;
}

function getAccentColor(status: RoundStatus): string {
  switch (status) {
    case 'active':   return Colors.greenDeep;
    case 'pending':  return Colors.amber;
    case 'complete': return Colors.greenConfirm;
    default:         return Colors.textLight;
  }
}

function getDotColor(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
    case 'confirmed': return Colors.greenConfirm;
    case 'overdue':
    case 'grace':     return Colors.amber;
    case 'defaulted': return Colors.red;
    default:          return Colors.border;
  }
}

function freqLabel(freq: Round['frequency']): string {
  switch (freq) {
    case 'weekly':    return 'wk';
    case 'biweekly':  return '2wk';
    case 'monthly':   return 'mo';
    default:          return freq;
  }
}

export default function RoundCard({ round, onPress }: RoundCardProps) {
  const accentColor = getAccentColor(round.status);
  const currentCycle = round.cycles[round.currentCycleIndex];
  const paidCount = currentCycle
    ? currentCycle.payments.filter(p => ['paid', 'confirmed'].includes(p.status)).length
    : 0;
  const myMember = round.members.find(m => m.id === round.myMemberId);
  const isMyPayoutCycle = currentCycle?.recipientMemberId === round.myMemberId;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.wrapper}>
      <View style={[styles.card, Shadow.card]}>
        <View style={[styles.accent, { backgroundColor: accentColor }]} />

        <View style={styles.content}>
          {/* Name + status badge */}
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{round.name}</Text>
            {myMember && <StatusBadge status={myMember.currentPaymentStatus} size="sm" />}
          </View>

          {/* Amount · cycle */}
          <Text style={styles.meta}>
            <Text style={styles.amount}>
              {round.currency === 'USD' ? '$' : round.currency}{round.amount}
            </Text>
            <Text style={styles.metaMuted}>
              {' '}/ {freqLabel(round.frequency)}
              {currentCycle
                ? `  ·  Cycle ${round.currentCycleIndex + 1} of ${round.cycles.length}`
                : ''}
            </Text>
          </Text>

          {/* Payout highlight */}
          {isMyPayoutCycle && (
            <View style={styles.payoutChip}>
              <Ionicons name="radio-button-on" size={12} color={Colors.greenDeep} />
              <Text style={styles.payoutChipText}>Your payout this cycle</Text>
            </View>
          )}

          {/* Dots + paid count */}
          <View style={styles.bottomRow}>
            <View style={styles.dotsRow}>
              {round.members.map(member => (
                <View
                  key={member.id}
                  style={[
                    styles.dot,
                    { backgroundColor: getDotColor(member.currentPaymentStatus) },
                    member.id === round.myMemberId && styles.dotMine,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.paidCount}>
              {paidCount} of {round.members.length} paid
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    flex: 1,
  },
  meta: {
    fontSize: 13,
  },
  amount: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.textDark,
  },
  metaMuted: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
  },
  payoutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.greenPale,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  payoutChipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.greenDeep,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    flex: 1,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dotMine: {
    borderWidth: 1.5,
    borderColor: Colors.greenDeep,
  },
  paidCount: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginLeft: Spacing.sm,
    flexShrink: 0,
  },
});
