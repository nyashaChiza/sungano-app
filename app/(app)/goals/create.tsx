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
  SafeAreaView,
} from 'react-native';
import { toast } from '../../../src/utils/toast';
import { useNavStore } from '../../../src/store/navStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../../../src/constants/theme';
import Button from '../../../src/components/ui/Button';
import { useGoals } from '../../../src/hooks/useGoals';

export default function CreateGoalPage() {
  const router = useRouter();
  const { createNewGoal } = useGoals();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [targetDate, setTargetDate] = useState('');
  const [type, setType] = useState<'solo' | 'group'>('solo');
  const [frequency, setFrequency] = useState('monthly');

  const handleBack = () => {
    useNavStore.getState().setPendingTab('goals');
    router.back();
  };

  const handleCreateGoal = async () => {
    if (!name.trim() || !targetAmount.trim() || !targetDate.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        name,
        target_amount: parseFloat(targetAmount),
        currency,
        target_date: targetDate,
        type,
        frequency,
      };

      const goal = await createNewGoal(data);
      toast.success('Your goal is ready.', 'Goal created!');
      useNavStore.getState().setPendingTab('goals');
      router.back();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create goal');
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
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Goal</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Goal Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Goal Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., New Laptop"
              value={name}
              onChangeText={setName}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="5000"
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Currency</Text>
              <TouchableOpacity style={styles.selectInput}>
                <Text style={styles.selectText}>{currency}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textMed} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Target Date</Text>
              <TouchableOpacity style={styles.selectInput}>
                <Text style={styles.selectText}>
                  {targetDate || 'Select date'}
                </Text>
                <Ionicons name="calendar" size={16} color={Colors.textMed} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Goal Type</Text>

          <View style={styles.typeOptions}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                type === 'solo' && styles.typeOptionActive,
              ]}
              onPress={() => setType('solo')}
            >
              <View style={styles.typeRadio}>
                {type === 'solo' && <View style={styles.typeRadioInner} />}
              </View>
              <View style={styles.typeContent}>
                <Text style={styles.typeTitle}>Solo Goal</Text>
                <Text style={styles.typeDesc}>Save on your own</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                type === 'group' && styles.typeOptionActive,
              ]}
              onPress={() => setType('group')}
            >
              <View style={styles.typeRadio}>
                {type === 'group' && <View style={styles.typeRadioInner} />}
              </View>
              <View style={styles.typeContent}>
                <Text style={styles.typeTitle}>Group Goal</Text>
                <Text style={styles.typeDesc}>Save with others</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deposit Frequency</Text>
            <TouchableOpacity style={styles.selectInput}>
              <Text style={styles.selectText}>{frequency}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMed} />
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Goal</Text>
            <Text style={styles.summaryGoal}>{name || 'Unnamed goal'}</Text>
            <View style={styles.summaryDetails}>
              <Text style={styles.summaryDetail}>
                Target: {currency} {targetAmount || '0'}
              </Text>
              <Text style={styles.summaryDetail}>
                Type: {type === 'solo' ? 'Solo' : 'Group'}
              </Text>
              <Text style={styles.summaryDetail}>
                Frequency: {frequency}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <Button
            label="Cancel"
            onPress={handleBack}
            variant="ghost"
            fullWidth
            size="lg"
          />
          <Button
            label="Create Goal"
            onPress={handleCreateGoal}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.createButton}
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
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
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  flex1: {
    flex: 1,
    marginBottom: 0,
  },
  typeOptions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.md,
  },
  typeOptionActive: {
    borderColor: Colors.greenDeep,
    backgroundColor: Colors.greenPale,
  },
  typeRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.greenDeep,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  typeRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.greenDeep,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  typeDesc: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: Spacing.xs,
  },
  summaryCard: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginBottom: Spacing.sm,
  },
  summaryGoal: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 18,
    color: Colors.greenDeep,
    marginBottom: Spacing.md,
  },
  summaryDetails: {
    gap: Spacing.sm,
  },
  summaryDetail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textDark,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    flex: 1,
  },
});
