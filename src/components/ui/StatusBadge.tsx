import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';
import { PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
  paid: { bg: Colors.greenConfirm, text: Colors.white, label: '✓ PAID' },
  pending: { bg: Colors.bgLight, text: Colors.textMed, label: 'PENDING' },
  overdue: { bg: Colors.amberBg, text: Colors.amber, label: 'OVERDUE' },
  grace: { bg: Colors.amberBg, text: Colors.amber, label: 'GRACE' },
  defaulted: { bg: Colors.redBg, text: Colors.red, label: 'DEFAULT' },
  confirmed: { bg: Colors.greenPale, text: Colors.greenDeep, label: 'CONFIRMED' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const isSmall = size === 'sm';
  return (
    <View style={[
      styles.badge,
      { backgroundColor: config.bg },
      isSmall && styles.badgeSm,
    ]}>
      <Text style={[
        styles.label,
        { color: config.text },
        isSmall && styles.labelSm,
      ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  labelSm: {
    fontSize: 9,
  },
});
