import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { RoundMember, Payment } from '../../types';
import { Colors, Fonts, Spacing } from '../../constants/theme';
import Avatar from '../ui/Avatar';
import StatusBadge from '../ui/StatusBadge';
import Money from '../ui/Money';

interface MemberRowProps {
  member: RoundMember;
  payment?: Payment;
  currency: string;
  isRecipient?: boolean;
}

export default function MemberRow({ member, payment, currency, isRecipient }: MemberRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => payment?.proofUrl && setExpanded(!expanded)}
        activeOpacity={payment?.proofUrl ? 0.7 : 1}
        style={styles.row}
      >
        <Avatar name={member.name} size={38} trustScore={member.trustScore} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{member.name}</Text>
            {isRecipient && (
              <View style={styles.recipientBadge}>
                <Text style={styles.recipientText}>Recipient</Text>
              </View>
            )}
          </View>
          <Text style={styles.trust}>Trust {member.trustScore}</Text>
        </View>
        <View style={styles.right}>
          {payment ? (
            <View style={styles.paymentInfo}>
              <StatusBadge status={payment.status} size="sm" />
              {payment.amount && (
                <Money amount={payment.amount} currency={currency} size={12} color={Colors.textMed} style={{ marginTop: 2 }} />
              )}
            </View>
          ) : (
            <StatusBadge status={member.currentPaymentStatus} size="sm" />
          )}
        </View>
      </TouchableOpacity>
      {expanded && payment?.proofUrl && (
        <View style={styles.proofSection}>
          <Text style={styles.proofLabel}>Payment proof</Text>
          {payment.note && (
            <Text style={styles.note}>{payment.note}</Text>
          )}
          {payment.paidAt && (
            <Text style={styles.date}>
              Paid {new Date(payment.paidAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textDark,
  },
  trust: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: 2,
  },
  recipientBadge: {
    backgroundColor: Colors.greenPale,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  recipientText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.greenDeep,
  },
  right: {
    alignItems: 'flex-end',
  },
  paymentInfo: {
    alignItems: 'flex-end',
  },
  proofSection: {
    backgroundColor: Colors.greenPale,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 10,
  },
  proofLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.greenDeep,
    marginBottom: 4,
  },
  note: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    marginBottom: 4,
  },
  date: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textLight,
  },
});
