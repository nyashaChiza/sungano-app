import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Goal } from '../../types';
import { Colors, Fonts, Shadow, Radius, Spacing } from '../../constants/theme';
import ProgressBar from '../ui/ProgressBar';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
}

function formatDueDate(dateStr: string): string {
  const dueDate = new Date(dateStr);
  const now = new Date();
  const daysLeft = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft < 30) return `${daysLeft}d left`;
  return dueDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function GoalCard({ goal, onPress }: GoalCardProps) {
  const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const percentage = Math.round(progress * 100);
  const dueDateLabel = formatDueDate(goal.targetDate);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.wrapper}>
      <View style={[styles.card, Shadow.card]}>
        <View style={styles.topRow}>
          <View style={styles.nameGroup}>
            <Text style={styles.name} numberOfLines={1}>{goal.name}</Text>
            <Text style={styles.due}>{dueDateLabel}</Text>
          </View>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>

        <ProgressBar
          value={goal.currentAmount}
          max={goal.targetAmount}
          height={6}
          fill={Colors.greenDeep}
          track={Colors.greenSubtle}
          milestones={[0.25, 0.5, 0.75]}
        />
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
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  nameGroup: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 15,
    color: Colors.textDark,
  },
  due: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
  },
  percentage: {
    fontFamily: Fonts.mono,
    fontSize: 15,
    color: Colors.greenDeep,
    flexShrink: 0,
  },
});
