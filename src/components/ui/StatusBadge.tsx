import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

type BadgeStatus = 'paid' | 'pending' | 'grace' | 'overdue' | 'defaulted' | 'confirmed' | 'active' | 'completed' | 'cancelled' | string;

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md';
}

// Matches PDF components page exactly:
// ✓ PAID (green filled) | ○ PENDING (grey) | ⏳ GRACE (amber) | ! OVERDUE (amber outline)
// ✕ DEFAULT (red) | ✓ CONFIRMED (green pale)
const CFG: Record<string, { bg: string; color: string; label: string }> = {
  paid:      { bg: Colors.greenConfirm, color: Colors.white,    label: '✓ PAID'      },
  active:    { bg: Colors.greenConfirm, color: Colors.white,    label: '✓ PAID'      },
  pending:   { bg: Colors.bgLight,      color: Colors.textMed,  label: '○ PENDING'   },
  grace:     { bg: Colors.amberBg,      color: Colors.amber,    label: '⏳ GRACE'     },
  overdue:   { bg: Colors.amberBg,      color: Colors.amber,    label: '! OVERDUE'   },
  defaulted: { bg: Colors.redBg,        color: Colors.red,      label: '✕ DEFAULT'   },
  confirmed: { bg: Colors.greenPale,    color: Colors.greenDeep,label: '✓ CONFIRMED' },
  completed: { bg: Colors.greenPale,    color: Colors.greenDeep,label: 'DONE'        },
  cancelled: { bg: Colors.bgLight,      color: Colors.textLight,label: 'CANCELLED'   },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const c = CFG[status] ?? CFG.pending;
  const sm = size === 'sm';
  return (
    <View style={[styles.base, sm && styles.sm, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, sm && styles.labelSm, { color: c.color }]}>
        {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, alignSelf: 'flex-start' },
  sm:      { paddingHorizontal: 7, paddingVertical: 2 },
  label:   { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.4 },
  labelSm: { fontSize: 9 },
});
