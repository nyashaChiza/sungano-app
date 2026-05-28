import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

interface SplitMember {
  id: string;
  name: string;
  percentage: number;
}

interface SplitBarProps {
  members: SplitMember[];
}

const SEGMENT_COLORS = [
  Colors.greenDeep,
  Colors.greenAction,
  Colors.greenConfirm,
  Colors.amber,
  '#3B82F6',
  '#8B5CF6',
];

export default function SplitBar({ members }: SplitBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {members.map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.segment,
              {
                flex: member.percentage,
                backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {members.map((member, index) => (
          <View key={member.id} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }]} />
            <Text style={styles.legendName}>{member.name.split(' ')[0]}</Text>
            <Text style={styles.legendPct}>{member.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  bar: {
    height: 12,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
  segment: {
    height: '100%',
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
  },
  legendPct: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.textDark,
  },
});
