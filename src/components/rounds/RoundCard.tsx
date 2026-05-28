import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Round, PaymentStatus, RoundStatus } from '../../types';
import { Colors, Fonts, Shadow, Radius, Spacing } from '../../constants/theme';
import StatusBadge from '../ui/StatusBadge';
import Money from '../ui/Money';

interface RoundCardProps {
  round: Round;
  onPress: () => void;
}

function getAccentColor(status: RoundStatus): string {
  switch (status) {
    case 'active': return Colors.greenDeep;
    case 'pending': return Colors.amber;
    case 'complete': return Colors.greenConfirm;
    case 'dissolved': return Colors.textLight;
    default: return Colors.greenDeep;
  }
}

function getStatusDotColor(status: PaymentStatus): string {
  switch (status) {
    case 'paid': return Colors.greenConfirm;
    case 'confirmed': return Colors.greenDeep;
    case 'pending': return Colors.border;
    case 'overdue': return Colors.amber;
    case 'grace': return Colors.amber;
    case 'defaulted': return Colors.red;
    default: return Colors.border;
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.card, Shadow.card]}>
        <View style={[styles.accent, { backgroundColor: accentColor }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{round.name}</Text>
              <View style={styles.amountRow}>
                <Money amount={round.amount} currency={round.currency} size={18} color={Colors.textDark} />
                <Text style={styles.frequency}>/ {round.frequency}</Text>
              </View>
            </View>
            {myMember && (
              <StatusBadge status={myMember.currentPaymentStatus} size="sm" />
            )}
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.cycleText}>
              Cycle {round.currentCycleIndex + 1} of {round.cycles.length}
            </Text>
            <Text style={styles.paidCount}>
              {paidCount}/{round.members.length} paid
            </Text>
          </View>

          <View style={styles.dotsRow}>
            {round.members.map(member => (
              <View
                key={member.id}
                style={[
                  styles.dot,
                  { backgroundColor: getStatusDotColor(member.currentPaymentStatus) },
                  member.id === round.myMemberId && styles.dotMine,
                ]}
              />
            ))}
          </View>

          {isMyPayoutCycle && (
            <View style={styles.payoutBadge}>
              <Text style={styles.payoutBadgeText}>🎉 Your payout this cycle</Text>
            </View>
          )}

          {currentCycle && (
            <View style={styles.footer}>
              <Text style={styles.dueDate}>
                Due {new Date(currentCycle.dueDate).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  accent: {
    width: 4,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  frequency: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    marginLeft: 4,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cycleText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.textMed,
  },
  paidCount: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.greenDeep,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotMine: {
    borderWidth: 2,
    borderColor: Colors.greenDeep,
  },
  payoutBadge: {
    backgroundColor: Colors.greenPale,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  payoutBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.greenDeep,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  dueDate: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
  },
});
