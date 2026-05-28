import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Goal } from '../../types';
import { Colors, Fonts, Shadow, Radius, Spacing } from '../../constants/theme';
import ProgressBar from '../ui/ProgressBar';
import Money from '../ui/Money';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
}

function getDueDateColor(dateStr: string): string {
  const dueDate = new Date(dateStr);
  const now = new Date();
  const daysLeft = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return Colors.red;
  if (daysLeft < 30) return Colors.amber;
  return Colors.textMed;
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
  const progress = goal.currentAmount / goal.targetAmount;
  const percentage = Math.round(progress * 100);
  const dueDateColor = getDueDateColor(goal.targetDate);
  const dueDateLabel = formatDueDate(goal.targetDate);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.card, Shadow.card]}>
        <View style={styles.header}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{goal.emoji}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{goal.name}</Text>
            <View style={styles.metaRow}>
              {goal.type === 'group' && goal.members && (
                <View style={styles.groupBadge}>
                  <Text style={styles.groupBadgeText}>👥 {goal.members.length} members</Text>
                </View>
              )}
              <Text style={[styles.dueDate, { color: dueDateColor }]}>{dueDateLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <ProgressBar
            value={goal.currentAmount}
            max={goal.targetAmount}
            height={8}
            fill={Colors.greenDeep}
            track={Colors.greenSubtle}
            milestones={[0.25, 0.5, 0.75]}
          />
          <View style={styles.progressLabels}>
            <View style={styles.amountRow}>
              <Money amount={goal.currentAmount} currency={goal.currency} size={14} color={Colors.greenDeep} />
              <Text style={styles.separator}> / </Text>
              <Money amount={goal.targetAmount} currency={goal.currency} size={14} color={Colors.textMed} />
            </View>
            <Text style={styles.percentage}>{percentage}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  emoji: {
    fontSize: 22,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupBadge: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
  },
  groupBadgeText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: Colors.textMed,
  },
  dueDate: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
  },
  progressSection: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
  percentage: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: Colors.greenDeep,
  },
});
