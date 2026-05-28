import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoalType, DepositFrequency } from '../../types';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import Button from '../../components/ui/Button';
import SplitBar from '../../components/goals/SplitBar';
import Money from '../../components/ui/Money';

interface CreateGoalFlowProps {
  onBack: () => void;
  onComplete: (data: CreateGoalData) => Promise<void>;
}

interface CreateGoalData {
  name: string;
  emoji: string;
  type: GoalType;
  targetAmount: number;
  currency: string;
  targetDate: string;
  depositFrequency: DepositFrequency;
  bankName: string;
  accountNumber: string;
  accountName: string;
  memberEmails?: string[];
  splits?: Record<string, number>;
}

const EMOJIS = ['🏠', '✈️', '💻', '🚗', '🎓', '💍', '🏋️', '🎯', '💰', '🛍️', '🏖️', '📱'];
const FREQUENCIES: DepositFrequency[] = ['daily', 'weekly', 'biweekly', 'monthly'];

const STEP_TITLES = [
  'Goal Type',
  'Goal Details',
  'Deposit Schedule',
  'Target Account',
  'Invite Members',
  'Review & Create',
];

export default function CreateGoalFlow({ onBack, onComplete }: CreateGoalFlowProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [goalType, setGoalType] = useState<GoalType>('solo');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [targetAmountText, setTargetAmountText] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [frequency, setFrequency] = useState<DepositFrequency>('monthly');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState<Array<{ id: string; name: string; email: string; percentage: number }>>([]);

  const targetAmount = parseFloat(targetAmountText.replace(/,/g, '')) || 0;
  const suggestedDeposit = frequency === 'monthly' ? Math.ceil(targetAmount / 12)
    : frequency === 'weekly' ? Math.ceil(targetAmount / 52)
    : frequency === 'biweekly' ? Math.ceil(targetAmount / 26)
    : Math.ceil(targetAmount / 365);

  const addMember = () => {
    if (!memberEmail.trim()) return;
    const newMember = {
      id: 'invited-' + Date.now(),
      name: memberEmail.split('@')[0],
      email: memberEmail.trim(),
      percentage: Math.floor(100 / (members.length + 2)),
    };
    const newMembers = [...members, newMember].map((m, i, arr) => ({
      ...m,
      percentage: Math.floor(100 / (arr.length + 1)),
    }));
    setMembers(newMembers);
    setMemberEmail('');
  };

  const goNext = () => {
    if (step === 4 && goalType === 'solo') {
      setStep(5);
      return;
    }
    setStep(s => Math.min(s + 1, 5));
  };

  const goBack = () => {
    if (step === 0) {
      onBack();
    } else if (step === 5 && goalType === 'solo') {
      setStep(3);
    } else {
      setStep(s => s - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({
        name,
        emoji,
        type: goalType,
        targetAmount,
        currency: 'NGN',
        targetDate: targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        depositFrequency: frequency,
        bankName,
        accountNumber,
        accountName,
      });
      Alert.alert('Goal Created!', `"${name}" has been set up. Start saving!`, [
        { text: 'Let\'s go!', onPress: onBack },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (() => {
    if (step === 1) return name.trim().length > 0 && targetAmount > 0;
    if (step === 3) return bankName.trim() && accountNumber.trim() && accountName.trim();
    return true;
  })();

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>What kind of goal?</Text>
            <Text style={styles.stepSub}>Choose how you want to save towards this goal.</Text>
            <View style={styles.typeCards}>
              <TouchableOpacity
                onPress={() => setGoalType('solo')}
                style={[styles.typeCard, goalType === 'solo' && styles.typeCardSelected]}
                activeOpacity={0.85}
              >
                <Text style={styles.typeCardEmoji}>👤</Text>
                <Text style={[styles.typeCardTitle, goalType === 'solo' && styles.typeCardTitleSelected]}>Solo</Text>
                <Text style={styles.typeCardDesc}>Save by yourself with your own schedule and targets.</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGoalType('group')}
                style={[styles.typeCard, goalType === 'group' && styles.typeCardSelected]}
                activeOpacity={0.85}
              >
                <Text style={styles.typeCardEmoji}>👥</Text>
                <Text style={[styles.typeCardTitle, goalType === 'group' && styles.typeCardTitleSelected]}>Group</Text>
                <Text style={styles.typeCardDesc}>Invite others to save towards a shared target together.</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Name your goal</Text>
            <Text style={styles.stepSub}>Give your goal a name and pick an icon.</Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={[styles.emojiBtn, emoji === e && styles.emojiBtnSelected]}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. New Laptop, Family Holiday..."
                placeholderTextColor={Colors.textLight}
                style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target amount (₦)</Text>
              <TextInput
                value={targetAmountText}
                onChangeText={setTargetAmountText}
                keyboardType="numeric"
                placeholder="500,000"
                placeholderTextColor={Colors.textLight}
                style={[styles.input, styles.monoInput]}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target date</Text>
              <TextInput
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
                style={styles.input}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Deposit schedule</Text>
            <Text style={styles.stepSub}>How often will you deposit?</Text>
            <View style={styles.freqGrid}>
              {FREQUENCIES.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={[styles.freqPill, frequency === f && styles.freqPillSelected]}
                >
                  <Text style={[styles.freqText, frequency === f && styles.freqTextSelected]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {targetAmount > 0 && (
              <View style={styles.suggestedCard}>
                <Text style={styles.suggestedLabel}>Suggested deposit</Text>
                <Money amount={suggestedDeposit} currency="NGN" size={28} color={Colors.greenDeep} />
                <Text style={styles.suggestedSub}>
                  per {frequency === 'biweekly' ? '2 weeks' : frequency.replace('ly', '')} to reach your goal by{' '}
                  {targetDate ? new Date(targetDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'target date'}
                </Text>
              </View>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Where to deposit</Text>
            <Text style={styles.stepSub}>The account where you'll save towards this goal.</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bank name</Text>
              <TextInput
                value={bankName}
                onChangeText={setBankName}
                placeholder="e.g. Access Bank, GTBank..."
                placeholderTextColor={Colors.textLight}
                style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account number</Text>
              <TextInput
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                placeholder="0123456789"
                placeholderTextColor={Colors.textLight}
                style={[styles.input, styles.monoInput]}
                maxLength={10}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account name</Text>
              <TextInput
                value={accountName}
                onChangeText={setAccountName}
                placeholder="Account holder name"
                placeholderTextColor={Colors.textLight}
                style={styles.input}
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Invite members</Text>
            <Text style={styles.stepSub}>Add people to save with you towards this goal.</Text>
            <View style={styles.inviteRow}>
              <TextInput
                value={memberEmail}
                onChangeText={setMemberEmail}
                placeholder="Phone or email..."
                placeholderTextColor={Colors.textLight}
                style={[styles.input, styles.inviteInput]}
                keyboardType="email-address"
              />
              <TouchableOpacity onPress={addMember} style={styles.addBtn} activeOpacity={0.85}>
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {members.length > 0 && (
              <View style={styles.membersCard}>
                <Text style={styles.memberCardTitle}>Members & splits</Text>
                <SplitBar members={[
                  { id: 'me', name: 'You', percentage: 100 - members.reduce((s, m) => s + m.percentage, 0) },
                  ...members,
                ]} />
                {members.map(m => (
                  <View key={m.id} style={styles.memberItem}>
                    <Text style={styles.memberItemName}>{m.name}</Text>
                    <Text style={styles.memberItemEmail}>{m.email}</Text>
                    <Text style={styles.memberItemPct}>{m.percentage}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Review & create</Text>
            <Text style={styles.stepSub}>Check everything looks right before creating your goal.</Text>
            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Goal</Text>
                <Text style={styles.reviewValue}>{emoji} {name}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Type</Text>
                <Text style={styles.reviewValue}>{goalType}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Target</Text>
                <Money amount={targetAmount} currency="NGN" size={14} color={Colors.textDark} />
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Frequency</Text>
                <Text style={styles.reviewValue}>{frequency}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Deposit</Text>
                <Money amount={suggestedDeposit} currency="NGN" size={14} color={Colors.greenDeep} />
              </View>
              {bankName && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Account</Text>
                  <Text style={styles.reviewValue}>{bankName} · {accountNumber}</Text>
                </View>
              )}
              {goalType === 'group' && members.length > 0 && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Members</Text>
                  <Text style={styles.reviewValue}>{members.length + 1} people</Text>
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Text style={styles.backText}>{step === 0 ? '✕' : '‹'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{STEP_TITLES[step]}</Text>
            <Text style={styles.stepCounter}>{step + 1}/6</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((step + 1) / 6) * 100}%` }]} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step < 5 ? (
          <Button
            label={step === 4 && goalType === 'solo' ? 'Skip & Review' : 'Continue'}
            onPress={goNext}
            disabled={!canProceed}
            fullWidth
            size="lg"
          />
        ) : (
          <Button
            label={isSubmitting ? 'Creating...' : 'Create Goal'}
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            size="lg"
          />
        )}
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
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 32,
  },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 22,
    color: Colors.white,
  },
  headerTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 17,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  stepCounter: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    width: 32,
    textAlign: 'right',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.greenAction,
    borderRadius: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stepContent: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  stepHeading: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.textDark,
  },
  stepSub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.textMed,
    marginTop: -Spacing.md,
    lineHeight: 22,
  },
  typeCards: {
    gap: Spacing.md,
  },
  typeCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 6,
  },
  typeCardSelected: {
    borderColor: Colors.greenDeep,
    backgroundColor: Colors.greenPale,
  },
  typeCardEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  typeCardTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 18,
    color: Colors.textDark,
  },
  typeCardTitleSelected: {
    color: Colors.greenDeep,
  },
  typeCardDesc: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    lineHeight: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnSelected: {
    borderColor: Colors.greenDeep,
    backgroundColor: Colors.greenPale,
  },
  emojiText: {
    fontSize: 24,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textDark,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.textDark,
  },
  monoInput: {
    fontFamily: Fonts.mono,
  },
  freqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  freqPill: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  freqPillSelected: {
    backgroundColor: Colors.greenDeep,
    borderColor: Colors.greenDeep,
  },
  freqText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textMed,
  },
  freqTextSelected: {
    color: Colors.white,
    fontFamily: Fonts.bodySemiBold,
  },
  suggestedCard: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.greenSubtle,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  suggestedLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.greenDeep,
  },
  suggestedSub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    textAlign: 'center',
    lineHeight: 19,
  },
  inviteRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inviteInput: {
    flex: 1,
    marginBottom: 0,
  },
  addBtn: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.white,
  },
  membersCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  memberCardTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  memberItemName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
    flex: 1,
  },
  memberItemEmail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    flex: 1,
  },
  memberItemPct: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.greenDeep,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
  },
  reviewValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
    textTransform: 'capitalize',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.card,
  },
});
