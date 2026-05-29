import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Fonts, Spacing, Radius } from '../../../src/constants/theme';
import Button from '../../../src/components/ui/Button';
import { useRounds } from '../../../src/hooks/useRounds';

export default function CreateRoundScreen() {
  const router = useRouter();
  const { createNewRound } = useRounds();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [frequency, setFrequency] = useState('monthly');

  // Step 2
  const [startDate, setStartDate] = useState('');
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [members, setMembers] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [gracePeriod, setGracePeriod] = useState('3');
  const [penalty, setPenalty] = useState('5');

  // Step 3
  const [contractMode, setContractMode] = useState<'simple' | 'formal'>('simple');

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim() || !amount.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!startDate || !members.trim()) {
        Alert.alert('Error', 'Please select a start date and enter the number of members');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      handleCreateRound();
    }
  };

  const handleCreateRound = async () => {
    setIsLoading(true);
    try {
      const data = {
        name,
        contribution_amount: parseFloat(amount),
        currency,
        frequency,
        start_date: startDateObj.toISOString().split('T')[0],
        number_of_members: parseInt(members),
        payout_method: payoutMethod,
        grace_period_days: parseInt(gracePeriod),
        late_payment_penalty_percentage: parseFloat(penalty),
        contract_mode: contractMode,
      };

      const round = await createNewRound(data);
      Alert.alert('Success', 'Round created successfully!', [
        {
          text: 'OK',
          onPress: () => router.push(`/rounds/${round.id}`),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create round');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kvContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Round</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepDot,
                  s <= step && styles.stepDotActive,
                ]}
              >
                <Text style={styles.stepNumber}>{s}</Text>
              </View>
            </View>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Round Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Round Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Friends Circle"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contribution Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5000"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Currency</Text>
                <View style={styles.pillRow}>
                  {['USD', 'NGN', 'ZWG', 'GBP'].map(c => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCurrency(c)}
                      style={[styles.pill, currency === c && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, currency === c && styles.pillTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.pillRow}>
                  {['weekly', 'biweekly', 'monthly'].map(f => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setFrequency(f)}
                      style={[styles.pill, frequency === f && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, frequency === f && styles.pillTextActive]}>
                        {f === 'biweekly' ? 'Bi-weekly' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Round Settings</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.selectText, !startDate && { color: Colors.textLight }]}>
                    {startDate || 'Select date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color={Colors.textMed} />
                </TouchableOpacity>

                {/* iOS — modal sheet */}
                {Platform.OS === 'ios' && (
                  <Modal
                    visible={showDatePicker}
                    transparent
                    animationType="slide"
                  >
                    <View style={styles.pickerOverlay}>
                      <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.pickerCancel}>Cancel</Text>
                          </TouchableOpacity>
                          <Text style={styles.pickerTitle}>Start Date</Text>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.pickerDone}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={startDateObj}
                          mode="date"
                          display="spinner"
                          minimumDate={new Date()}
                          textColor={Colors.textDark}
                          style={{ height: 200 }}
                          onValueChange={(_e: any, date: Date) => {
                            if (date) {
                              setStartDateObj(date);
                              setStartDate(date.toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              }));
                            }
                          }}
                        />
                      </View>
                    </View>
                  </Modal>
                )}

                {/* Android — inline dialog */}
                {Platform.OS === 'android' && showDatePicker && (
                  <DateTimePicker
                    value={startDateObj}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onValueChange={(_e: any, date: Date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setStartDateObj(date);
                        setStartDate(date.toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        }));
                      }
                    }}
                    onDismiss={() => setShowDatePicker(false)}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Number of Members</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5"
                  value={members}
                  onChangeText={setMembers}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payout Method</Text>
                <View style={styles.pillRow}>
                  {[
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                    { value: 'mobile_money',  label: 'Mobile Money' },
                    { value: 'cash',          label: 'Cash' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setPayoutMethod(opt.value)}
                      style={[styles.pill, payoutMethod === opt.value && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, payoutMethod === opt.value && styles.pillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Grace Period (days)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="3"
                    value={gracePeriod}
                    onChangeText={setGracePeriod}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Late Penalty (%)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5"
                    value={penalty}
                    onChangeText={setPenalty}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Contract Mode</Text>

              <View style={styles.contractOptions}>
                <TouchableOpacity
                  style={[
                    styles.contractOption,
                    contractMode === 'simple' && styles.contractOptionActive,
                  ]}
                  onPress={() => setContractMode('simple')}
                >
                  <View style={styles.contractRadio}>
                    {contractMode === 'simple' && (
                      <View style={styles.contractRadioInner} />
                    )}
                  </View>
                  <View style={styles.contractTextContainer}>
                    <Text style={styles.contractTitle}>Simple</Text>
                    <Text style={styles.contractDesc}>
                      Quick setup with default terms
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.contractOption,
                    contractMode === 'formal' && styles.contractOptionActive,
                  ]}
                  onPress={() => setContractMode('formal')}
                >
                  <View style={styles.contractRadio}>
                    {contractMode === 'formal' && (
                      <View style={styles.contractRadioInner} />
                    )}
                  </View>
                  <View style={styles.contractTextContainer}>
                    <Text style={styles.contractTitle}>Formal</Text>
                    <Text style={styles.contractDesc}>
                      Custom terms and legal framework
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Round Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Name:</Text>
                  <Text style={styles.summaryValue}>{name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={styles.summaryValue}>
                    {currency} {amount}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Frequency:</Text>
                  <Text style={styles.summaryValue}>{frequency}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <Button
            label={step > 1 ? 'Back' : 'Cancel'}
            onPress={() => (step > 1 ? setStep(step - 1) : router.back())}
            variant="ghost"
            fullWidth
            size="lg"
          />
          <Button
            label={step === 3 ? 'Create' : 'Next'}
            onPress={handleNextStep}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.nextButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  kvContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: Colors.textDark,
  },
  headerSpacer: {
    width: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingVertical: Spacing.lg,
  },
  stepWrapper: {
    alignItems: 'center',
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.greenDeep,
  },
  stepNumber: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  stepContent: {
    gap: Spacing.lg,
  },
  stepTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textDark,
  },
  input: {
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  selectInput: {
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.greenDeep,
    borderColor: Colors.greenDeep,
  },
  pillText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textMed,
  },
  pillTextActive: {
    color: Colors.white,
    fontFamily: Fonts.bodySemiBold,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
  },
  contractOptions: {
    gap: Spacing.md,
  },
  contractOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.md,
  },
  contractOptionActive: {
    borderColor: Colors.greenDeep,
    backgroundColor: Colors.greenPale,
  },
  contractRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.greenDeep,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  contractRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.greenDeep,
  },
  contractTextContainer: {
    flex: 1,
  },
  contractTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  contractDesc: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: Spacing.xs,
  },
  summaryCard: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  summaryTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.greenDeep,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
  },
  summaryValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.textDark,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.textDark,
  },
  pickerCancel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.textMed,
  },
  pickerDone: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.greenDeep,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
    flex: 1,
  },
});
