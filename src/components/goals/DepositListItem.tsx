import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoalDeposit } from '../../types';
import { Colors, Fonts, Spacing } from '../../constants/theme';
import Money from '../ui/Money';
import Avatar from '../ui/Avatar';

interface DepositListItemProps {
  deposit: GoalDeposit;
}

export default function DepositListItem({ deposit }: DepositListItemProps) {
  const isConfirmed = deposit.status === 'confirmed';
  return (
    <View style={styles.row}>
      <Avatar name={deposit.memberName} size={36} />
      <View style={styles.info}>
        <Text style={styles.name}>{deposit.memberName}</Text>
        <Text style={styles.date}>
          {new Date(deposit.depositDate).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </Text>
      </View>
      <View style={styles.right}>
        <Money amount={deposit.amount} currency={deposit.currency} size={15} color={Colors.textDark} />
        <View style={[styles.statusDot, { backgroundColor: isConfirmed ? Colors.greenConfirm : Colors.amber }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textDark,
  },
  date: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
});
