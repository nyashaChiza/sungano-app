import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../../../src/constants/theme';
import { useGoals } from '../../../src/hooks/useGoals';
import { GoalRing } from '../../../src/components/goals/GoalRing';
import { MilestoneStrip } from '../../../src/components/goals/MilestoneStrip';
import Button from '../../../src/components/ui/Button';
import { Money } from '../../../src/components/ui/Money';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';

export default function GoalDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentGoal, fetchGoal, isLoading } = useGoals();

  useEffect(() => {
    if (id) {
      fetchGoal(id);
    }
  }, [id]);

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid goal ID</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.greenDeep} />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentGoal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.textLight} />
          <Text style={styles.errorText}>Goal not found</Text>
          <Button
            label="Go Back"
            onPress={() => router.back()}
            variant="primary"
            size="lg"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const progress = currentGoal.target_amount > 0
    ? (currentGoal.current_amount / currentGoal.target_amount) * 100
    : 0;

  const handleRecordDeposit = () => {
    router.push(`/goals/${id}/deposit`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.goalName}>{currentGoal.name}</Text>
          <StatusBadge status={currentGoal.status as any} size="sm" />
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Ring */}
        <View style={styles.progressSection}>
          <GoalRing progress={progress} />
        </View>

        {/* Progress Info */}
        <View style={styles.progressInfoCard}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressLabel}>Current</Text>
              <Money amount={currentGoal.current_amount} currency={currentGoal.currency} />
            </View>
            <View style={styles.progressDivider} />
            <View>
              <Text style={styles.progressLabel}>Target</Text>
              <Money amount={currentGoal.target_amount} currency={currentGoal.currency} />
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.min(progress, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress)}% Complete</Text>
        </View>

        {/* Milestone Strip */}
        <View style={styles.milestoneSection}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <MilestoneStrip progress={progress} />
        </View>

        {/* Goal Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>
              {currentGoal.type === 'solo' ? 'Solo' : 'Group'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target Date</Text>
            <Text style={styles.detailValue}>
              {new Date(currentGoal.target_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Currency</Text>
            <Text style={styles.detailValue}>{currentGoal.currency}</Text>
          </View>
        </View>

        {/* Recent Deposits */}
        {currentGoal.members && currentGoal.members.length > 0 && (
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Members</Text>
            {currentGoal.members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <View>
                  <Text style={styles.memberName}>{member.user_name}</Text>
                  <Money amount={member.amount_contributed} currency={currentGoal.currency} />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.footer}>
        <Button
          label="Record Deposit"
          onPress={handleRecordDeposit}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.greenDeep,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    gap: Spacing.xs,
  },
  goalName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.white,
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  progressSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  progressInfoCard: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.greenSubtle,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.greenSubtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.greenDeep,
  },
  progressPercent: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.greenDeep,
    textAlign: 'center',
  },
  progressLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginBottom: Spacing.xs,
  },
  milestoneSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  detailLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
  },
  detailValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textDark,
  },
  membersSection: {
    marginBottom: Spacing.lg,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  memberName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginVertical: Spacing.lg,
  },
  errorButton: {
    marginTop: Spacing.lg,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
  },
});
