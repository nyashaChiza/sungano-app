import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface MoneyProps {
  amount: number;
  currency?: string;
  size?: number;
  color?: string;
  weight?: 'regular' | 'medium';
  style?: TextStyle;
}

function formatAmount(amount: number, currency: string): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG')}`;
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'KES') {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  }
  if (currency === 'GHS') {
    return `GH₵${amount.toLocaleString('en-GH')}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export default function Money({
  amount,
  currency = 'NGN',
  size = 16,
  color = Colors.textDark,
  weight = 'medium',
  style,
}: MoneyProps) {
  return (
    <Text style={[styles.base, { fontSize: size, color }, style]}>
      {formatAmount(amount, currency)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.mono,
  },
});
