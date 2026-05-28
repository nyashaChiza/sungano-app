import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Round, Cycle } from '../../types';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import ProgressBar from '../ui/ProgressBar';
import Avatar from '../ui/Avatar';

interface PaymentBoardProps {
  round: Round;
  cycle: Cycle;
}

export default function PaymentBoard({ round, cycle }: PaymentBoardProps) {
  const paidMembers = round.members.filter(m => {
    const payment = cycle.payments.find(p => p.memberId === m.id);
    return payment && ['paid', 'confirmed'].includes(payment.status);
  });
  const recipient = round.members.find(m => m.id === cycle.recipientMemberId);
  const paidCount = paidMembers.length;
  const totalCount = round.members.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cycle {cycle.cycleNumber} Progress</Text>
        <Text style={styles.count}>{paidCount}/{totalCount} paid</Text>
      </View>

      <ProgressBar
        value={paidCount}
        max={totalCount}
        height={10}
        fill={Colors.greenDeep}
        track={Colors.greenSubtle}
      />

      {recipient && (
        <View style={styles.recipientSection}>
          <Text style={styles.recipientLabel}>This cycle's recipient</Text>
          <View style={styles.recipientRow}>
            <Avatar name={recipient.name} size={32} trustScore={recipient.trustScore} />
            <Text style={styles.recipientName}>{recipient.name}</Text>
          </View>
        </View>
      )}

      <View style={styles.avatarRow}>
        {round.members.map(member => {
          const payment = cycle.payments.find(p => p.memberId === member.id);
          const isPaid = payment && ['paid', 'confirmed'].includes(payment.status);
          return (
            <View key={member.id} style={styles.memberSlot}>
              <View style={[styles.avatarWrapper, !isPaid && styles.avatarUnpaid]}>
                <Avatar name={member.name} size={34} />
              </View>
              {isPaid && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 15,
    color: Colors.textDark,
  },
  count: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.greenDeep,
  },
  recipientSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: Spacing.md,
  },
  recipientLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginBottom: Spacing.sm,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipientName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.greenDeep,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
  },
  memberSlot: {
    position: 'relative',
  },
  avatarWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarUnpaid: {
    opacity: 0.4,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.greenConfirm,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  checkText: {
    fontSize: 8,
    color: Colors.white,
    fontFamily: Fonts.bodySemiBold,
  },
});
