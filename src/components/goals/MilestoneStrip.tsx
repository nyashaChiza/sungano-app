import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoalMilestone } from '../../types';
import { Colors, Fonts, Spacing } from '../../constants/theme';

interface MilestoneStripProps {
  milestones: GoalMilestone[];
  currentProgress: number;
}

export default function MilestoneStrip({ milestones, currentProgress }: MilestoneStripProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      {milestones.map((milestone, index) => {
        const reached = currentProgress >= milestone.percentage / 100;
        const active = Math.abs(currentProgress - milestone.percentage / 100) < 0.05;
        return (
          <View
            key={milestone.id}
            style={[
              styles.stop,
              { left: `${milestone.percentage}%` as any },
            ]}
          >
            <View style={[
              styles.dot,
              reached && styles.dotReached,
              active && styles.dotActive,
            ]}>
              {reached && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.label, reached && styles.labelReached]}>
              {milestone.label}
            </Text>
            {milestone.reachedAt && (
              <Text style={styles.date}>
                {new Date(milestone.reachedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    position: 'relative',
    marginHorizontal: Spacing.lg,
  },
  line: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.greenSubtle,
    borderRadius: 1,
  },
  stop: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -12 }],
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotReached: {
    backgroundColor: Colors.greenConfirm,
    borderColor: Colors.greenConfirm,
  },
  dotActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.greenDeep,
    borderColor: Colors.greenDeep,
    transform: [{ translateY: -2 }],
  },
  checkmark: {
    fontSize: 12,
    color: Colors.white,
    fontFamily: Fonts.bodySemiBold,
  },
  label: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 10,
    color: Colors.textMed,
    marginTop: 4,
  },
  labelReached: {
    color: Colors.greenDeep,
    fontFamily: Fonts.bodySemiBold,
  },
  date: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 9,
    color: Colors.textLight,
  },
});
