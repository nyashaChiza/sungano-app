import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Goal } from '../../types';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import GoalRing from '../../components/goals/GoalRing';
import MilestoneStrip from '../../components/goals/MilestoneStrip';
import DepositListItem from '../../components/goals/DepositListItem';
import Button from '../../components/ui/Button';
import Money from '../../components/ui/Money';
import Avatar from '../../components/ui/Avatar';
import ProgressBar from '../../components/ui/ProgressBar';

interface GoalDetailScreenProps {
  goal: Goal;
  onBack: () => void;
  onDeposit: () => void;
}

export default function GoalDetailScreen({ goal, onBack, onDeposit }: GoalDetailScreenProps) {
  const progress = goal.currentAmount / goal.targetAmount;
  const recentDeposits = goal.deposits.slice(0, 10);

  const handleCopyAccount = () => {
    if (goal.targetAccount) {
      Clipboard.setString(goal.targetAccount.accountNumber);
      Alert.alert('Copied', 'Account number copied to clipboard');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <Text style={styles.backText}>‹ Back</Text>
              </TouchableOpacity>
              {goal.type === 'group' && (
                <View style={styles.groupBadge}>
                  <Text style={styles.groupBadgeText}>👥 Group Goal</Text>
                </View>
              )}
            </View>
            <View style={styles.headerTitle}>
              <Text style={styles.emoji}>{goal.emoji}</Text>
              <Text style={styles.name}>{goal.name}</Text>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Goal Ring */}
          <View style={styles.ringSection}>
            <GoalRing
              currentAmount={goal.currentAmount}
              targetAmount={goal.targetAmount}
              currency={goal.currency}
              size={200}
              strokeWidth={14}
            />
          </View>

          {/* Milestone Strip */}
          <View style={styles.milestoneCard}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <MilestoneStrip milestones={goal.milestones} currentProgress={progress} />
          </View>

          {/* Deposit Schedule */}
          {goal.targetAccount && (
            <View style={styles.scheduleCard}>
              <Text style={styles.sectionTitle}>Deposit to</Text>
              <View style={styles.accountRow}>
                <View style={styles.bankIcon}>
                  <Text style={styles.bankIconText}>🏦</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.bankName}>{goal.targetAccount.bankName}</Text>
                  <Text style={styles.accountName}>{goal.targetAccount.accountName}</Text>
                  <Text style={styles.accountNumber}>{goal.targetAccount.accountNumber}</Text>
                </View>
                <TouchableOpacity onPress={handleCopyAccount} style={styles.copyBtn} activeOpacity={0.7}>
                  <Text style={styles.copyBtnText}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleLabel}>Frequency</Text>
                  <Text style={styles.scheduleValue}>{goal.depositFrequency}</Text>
                </View>
                <View style={styles.scheduleDivider} />
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleLabel}>Suggested amount</Text>
                  <Money amount={goal.suggestedDepositAmount} currency={goal.currency} size={14} color={Colors.greenDeep} />
                </View>
                <View style={styles.scheduleDivider} />
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleLabel}>Due date</Text>
                  <Text style={styles.scheduleValue}>
                    {new Date(goal.targetDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Member Progress (group only) */}
          {goal.type === 'group' && goal.members && (
            <View style={styles.membersCard}>
              <Text style={styles.sectionTitle}>Member Progress</Text>
              {goal.members.map(member => {
                const memberProgress = member.currentAmount / member.targetAmount;
                return (
                  <View key={member.id} style={styles.memberProgress}>
                    <Avatar name={member.name} size={36} trustScore={member.trustScore} />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberPct}>{Math.round(memberProgress * 100)}%</Text>
                      </View>
                      <ProgressBar
                        value={member.currentAmount}
                        max={member.targetAmount}
                        height={6}
                        fill={Colors.greenDeep}
                        track={Colors.greenSubtle}
                      />
                      <View style={styles.memberAmounts}>
                        <Money amount={member.currentAmount} currency={goal.currency} size={12} color={Colors.greenDeep} />
                        <Text style={styles.memberSeparator}> / </Text>
                        <Money amount={member.targetAmount} currency={goal.currency} size={12} color={Colors.textMed} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Deposit History */}
          <View style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Deposit History</Text>
            {recentDeposits.length > 0 ? (
              recentDeposits.map(deposit => (
                <DepositListItem key={deposit.id} deposit={deposit} />
              ))
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>No deposits yet. Record your first deposit!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyBar}>
        <Button
          label="Record Deposit"
          onPress={onDeposit}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  groupBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  groupBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.white,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 36,
  },
  name: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.white,
    flex: 1,
  },
  body: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  ringSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  milestoneCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingBottom: Spacing.xxl,
  },
  scheduleCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.lg,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankIconText: {
    fontSize: 22,
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  accountName: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
  },
  accountNumber: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.textDark,
    marginTop: 2,
  },
  copyBtn: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  copyBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.textMed,
  },
  scheduleRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  scheduleItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  scheduleLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 10,
    color: Colors.textMed,
    textAlign: 'center',
  },
  scheduleValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textDark,
    textTransform: 'capitalize',
  },
  scheduleDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  membersCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  memberProgress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberInfo: {
    flex: 1,
    gap: 6,
  },
  memberNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textDark,
  },
  memberPct: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.greenDeep,
  },
  memberAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSeparator: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textLight,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyHistory: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.card,
  },
});
