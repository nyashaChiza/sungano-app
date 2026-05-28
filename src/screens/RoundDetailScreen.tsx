import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Round } from '../types';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import ProgressBar from '../components/ui/ProgressBar';
import MemberRow from '../components/rounds/MemberRow';
import PaymentBoard from '../components/rounds/PaymentBoard';
import StatusBadge from '../components/ui/StatusBadge';
import Money from '../components/ui/Money';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

interface RoundDetailScreenProps {
  round: Round;
  onBack: () => void;
  onRecordPayment: () => void;
}

export default function RoundDetailScreen({ round, onBack, onRecordPayment }: RoundDetailScreenProps) {
  const currentCycle = round.cycles[round.currentCycleIndex];
  const myMember = round.members.find(m => m.id === round.myMemberId);
  const myPayment = currentCycle?.payments.find(p => p.memberId === round.myMemberId);
  const paidCount = currentCycle
    ? currentCycle.payments.filter(p => ['paid', 'confirmed'].includes(p.status)).length
    : 0;
  const recipient = round.members.find(m => m.id === currentCycle?.recipientMemberId);
  const totalPayout = round.amount * (round.members.length - 1);
  const canRecordPayment = myMember && ['pending', 'overdue', 'grace'].includes(myMember.currentPaymentStatus);

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
              <StatusBadge status={round.status === 'active' ? 'confirmed' : 'pending'} />
            </View>
            <Text style={styles.roundName}>{round.name}</Text>
            <View style={styles.amountRow}>
              <Money amount={round.amount} currency={round.currency} size={28} color={Colors.white} />
              <Text style={styles.frequency}> / {round.frequency}</Text>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Cycle Header */}
          {currentCycle && (
            <View style={styles.cycleCard}>
              <View style={styles.cycleHeader}>
                <View>
                  <Text style={styles.cycleLabel}>Current Cycle</Text>
                  <Text style={styles.cycleTitle}>Cycle {currentCycle.cycleNumber} of {round.cycles.length}</Text>
                </View>
                <View style={styles.dueBox}>
                  <Text style={styles.dueLabel}>Due</Text>
                  <Text style={styles.dueDate}>
                    {new Date(currentCycle.dueDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short',
                    })}
                  </Text>
                </View>
              </View>
              <ProgressBar
                value={paidCount}
                max={round.members.length}
                height={8}
                fill={Colors.greenDeep}
                track={Colors.greenSubtle}
              />
              <Text style={styles.progressText}>{paidCount} of {round.members.length} members paid</Text>
            </View>
          )}

          {/* Recipient */}
          {recipient && (
            <View style={styles.recipientCard}>
              <Text style={styles.recipientLabel}>Payout recipient this cycle</Text>
              <View style={styles.recipientRow}>
                <Avatar name={recipient.name} size={44} trustScore={recipient.trustScore} />
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{recipient.name}</Text>
                  <Money amount={totalPayout} currency={round.currency} size={18} color={Colors.greenDeep} />
                </View>
                {recipient.id === round.myMemberId && (
                  <View style={styles.myPayoutBadge}>
                    <Text style={styles.myPayoutText}>That's you! 🎉</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Payment Board */}
          {currentCycle && (
            <PaymentBoard round={round} cycle={currentCycle} />
          )}

          {/* Members */}
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Members</Text>
            <View style={styles.membersList}>
              {round.members.map(member => {
                const payment = currentCycle?.payments.find(p => p.memberId === member.id);
                return (
                  <MemberRow
                    key={member.id}
                    member={member}
                    payment={payment}
                    currency={round.currency}
                    isRecipient={member.id === currentCycle?.recipientMemberId}
                  />
                );
              })}
            </View>
          </View>

          {/* Upcoming Cycles */}
          <View style={styles.upcomingSection}>
            <Text style={styles.sectionTitle}>All Cycles</Text>
            {round.cycles.map((cycle, index) => (
              <View key={cycle.id} style={[styles.cycleRow, index === round.currentCycleIndex && styles.cycleRowActive]}>
                <View style={[styles.cycleNumber, index === round.currentCycleIndex && styles.cycleNumberActive]}>
                  <Text style={[styles.cycleNumText, index === round.currentCycleIndex && styles.cycleNumTextActive]}>
                    {cycle.cycleNumber}
                  </Text>
                </View>
                <View style={styles.cycleInfo}>
                  <Text style={styles.cycleMember}>
                    {round.members.find(m => m.id === cycle.recipientMemberId)?.name}
                  </Text>
                  <Text style={styles.cycleDue}>
                    {new Date(cycle.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={[
                  styles.cycleStatusDot,
                  { backgroundColor: cycle.status === 'complete' ? Colors.greenConfirm : cycle.status === 'active' ? Colors.greenDeep : Colors.border },
                ]} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      {canRecordPayment && (
        <View style={styles.stickyBar}>
          <Button
            label="Record my payment"
            onPress={onRecordPayment}
            fullWidth
            size="lg"
          />
        </View>
      )}
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
    marginBottom: Spacing.lg,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  roundName: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  frequency: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  body: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  cycleCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cycleLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginBottom: 2,
  },
  cycleTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.textDark,
  },
  dueBox: {
    alignItems: 'flex-end',
  },
  dueLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
  },
  dueDate: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.amber,
  },
  progressText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
  },
  recipientCard: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.greenSubtle,
  },
  recipientLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.greenDeep,
    marginBottom: Spacing.sm,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: 3,
  },
  myPayoutBadge: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  myPayoutText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.white,
  },
  membersSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  membersList: {},
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  upcomingSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cycleRowActive: {
    backgroundColor: Colors.greenPale,
  },
  cycleNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cycleNumberActive: {
    backgroundColor: Colors.greenDeep,
  },
  cycleNumText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textMed,
  },
  cycleNumTextActive: {
    color: Colors.white,
  },
  cycleInfo: {
    flex: 1,
  },
  cycleMember: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textDark,
  },
  cycleDue: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: 1,
  },
  cycleStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
