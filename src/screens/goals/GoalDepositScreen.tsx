import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Goal, ProofType } from '../../types';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import Money from '../../components/ui/Money';
import Button from '../../components/ui/Button';

interface GoalDepositScreenProps {
  goal: Goal;
  onBack: () => void;
  onSubmit: (amount: number, proofType: ProofType, proofUri: string, depositDate: string, note?: string) => Promise<void>;
}

const PROOF_TYPES: { type: ProofType; emoji: string; label: string }[] = [
  { type: 'screenshot', emoji: '📱', label: 'Screenshot' },
  { type: 'receipt', emoji: '🧾', label: 'Receipt' },
  { type: 'photo', emoji: '📷', label: 'Photo' },
  { type: 'transfer', emoji: '💸', label: 'Transfer' },
];

export default function GoalDepositScreen({ goal, onBack, onSubmit }: GoalDepositScreenProps) {
  const [amountText, setAmountText] = useState(goal.suggestedDepositAmount.toString());
  const [selectedType, setSelectedType] = useState<ProofType | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = parseFloat(amountText.replace(/,/g, '')) || 0;
  const runningTotal = goal.currentAmount + amount;
  const runningPercentage = Math.min((runningTotal / goal.targetAmount) * 100, 100);
  const canSubmit = amount > 0 && selectedType !== null && hasFile && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedType) return;
    setIsSubmitting(true);
    try {
      await onSubmit(amount, selectedType, 'mock-deposit-proof', depositDate, note || undefined);
      Alert.alert(
        'Deposit Recorded!',
        `₦${amount.toLocaleString()} has been added to your goal.`,
        [{ text: 'Great!', onPress: onBack }]
      );
    } catch {
      Alert.alert('Error', 'Failed to record deposit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>‹ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Record Deposit</Text>
            <Text style={styles.goalName}>{goal.emoji} {goal.name}</Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Account Reminder */}
          {goal.targetAccount && (
            <View style={styles.accountCard}>
              <Text style={styles.accountReminder}>💡 Remember to deposit to</Text>
              <View style={styles.accountRow}>
                <Text style={styles.bankName}>{goal.targetAccount.bankName}</Text>
                <Text style={styles.accountNumber}>{goal.targetAccount.accountNumber}</Text>
              </View>
              <Text style={styles.accountName}>{goal.targetAccount.accountName}</Text>
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Deposit amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="numeric"
                style={styles.amountInput}
                selectionColor={Colors.greenDeep}
              />
            </View>

            {/* Running Total Preview */}
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Current balance</Text>
                <Money amount={goal.currentAmount} currency={goal.currency} size={13} color={Colors.textMed} />
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>+ This deposit</Text>
                <Money amount={amount} currency={goal.currency} size={13} color={Colors.greenDeep} />
              </View>
              <View style={[styles.previewRow, styles.previewTotal]}>
                <Text style={styles.previewTotalLabel}>New balance</Text>
                <Money amount={runningTotal} currency={goal.currency} size={15} color={Colors.textDark} />
              </View>
              <View style={styles.previewProgress}>
                <View style={styles.previewBar}>
                  <View style={[styles.previewFill, { width: `${runningPercentage}%` }]} />
                </View>
                <Text style={styles.previewPct}>{Math.round(runningPercentage)}% of target</Text>
              </View>
            </View>
          </View>

          {/* Proof Type */}
          <View>
            <Text style={styles.sectionTitle}>Proof type</Text>
            <View style={styles.typeGrid}>
              {PROOF_TYPES.map(item => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => setSelectedType(item.type)}
                  style={[styles.typeCard, selectedType === item.type && styles.typeCardSelected]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeEmoji}>{item.emoji}</Text>
                  <Text style={[styles.typeLabel, selectedType === item.type && styles.typeLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upload */}
          <TouchableOpacity
            onPress={() => setHasFile(true)}
            style={[styles.uploadArea, hasFile && styles.uploadDone]}
            activeOpacity={0.8}
          >
            {hasFile ? (
              <View style={styles.uploadDoneContent}>
                <Text style={styles.uploadDoneIcon}>✓</Text>
                <Text style={styles.uploadDoneText}>Proof attached</Text>
              </View>
            ) : (
              <View style={styles.uploadContent}>
                <Text style={styles.uploadIcon}>⬆️</Text>
                <Text style={styles.uploadText}>Tap to attach proof</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Date */}
          <View>
            <Text style={styles.sectionTitle}>Deposit date</Text>
            <View style={styles.dateInput}>
              <Text style={styles.dateIcon}>📅</Text>
              <TextInput
                value={depositDate}
                onChangeText={setDepositDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
                style={styles.dateText}
              />
            </View>
          </View>

          {/* Optional note */}
          <View>
            <Text style={styles.sectionTitle}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Any notes about this deposit..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={2}
              style={styles.noteInput}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        <Button
          label={isSubmitting ? 'Recording...' : 'Record Deposit'}
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
          fullWidth
          size="lg"
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 24,
  },
  backBtn: {
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.white,
    marginBottom: 4,
  },
  goalName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  body: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  accountCard: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.greenSubtle,
  },
  accountReminder: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.greenDeep,
    marginBottom: Spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  accountNumber: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: Colors.textDark,
  },
  accountName: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  amountSection: {
    gap: Spacing.md,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.greenDeep,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  currencySymbol: {
    fontFamily: Fonts.mono,
    fontSize: 28,
    color: Colors.textMed,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: 32,
    color: Colors.textDark,
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
  },
  previewTotal: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  previewTotalLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  previewProgress: {
    marginTop: Spacing.sm,
    gap: 6,
  },
  previewBar: {
    height: 6,
    backgroundColor: Colors.greenSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  previewFill: {
    height: '100%',
    backgroundColor: Colors.greenDeep,
    borderRadius: 3,
  },
  previewPct: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: Colors.textMed,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  typeCardSelected: {
    borderColor: Colors.greenDeep,
    backgroundColor: Colors.greenPale,
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: Colors.textMed,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: Colors.greenDeep,
    fontFamily: Fonts.bodySemiBold,
  },
  uploadArea: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  uploadDone: {
    borderColor: Colors.greenConfirm,
    borderStyle: 'solid',
    backgroundColor: Colors.greenPale,
  },
  uploadContent: {
    alignItems: 'center',
    gap: 6,
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textMed,
  },
  uploadDoneContent: {
    alignItems: 'center',
    gap: 4,
  },
  uploadDoneIcon: {
    fontSize: 24,
    color: Colors.greenConfirm,
  },
  uploadDoneText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.greenDeep,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dateIcon: {
    fontSize: 18,
  },
  dateText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.textDark,
  },
  noteInput: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textDark,
    minHeight: 80,
    textAlignVertical: 'top',
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
