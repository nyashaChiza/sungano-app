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
import { Round, ProofType } from '../types';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import Money from '../components/ui/Money';
import Button from '../components/ui/Button';

interface ProofUploadScreenProps {
  round: Round;
  cycleId: string;
  onBack: () => void;
  onSubmit: (proofType: ProofType, proofUri: string, note: string) => Promise<void>;
}

const PROOF_TYPES: { type: ProofType; emoji: string; label: string; desc: string }[] = [
  { type: 'screenshot', emoji: '📱', label: 'Screenshot', desc: 'Mobile banking screenshot' },
  { type: 'receipt', emoji: '🧾', label: 'Receipt', desc: 'Payment receipt' },
  { type: 'photo', emoji: '📷', label: 'Photo', desc: 'Photo of payment slip' },
  { type: 'transfer', emoji: '💸', label: 'Transfer', desc: 'Transfer confirmation' },
];

export default function ProofUploadScreen({ round, cycleId, onBack, onSubmit }: ProofUploadScreenProps) {
  const [selectedType, setSelectedType] = useState<ProofType | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const currentCycle = round.cycles.find(c => c.id === cycleId);
  const canSubmit = selectedType !== null && hasFile && agreed && !isSubmitting;

  const handleUpload = () => {
    setHasFile(true);
  };

  const handleSubmit = async () => {
    if (!selectedType || !canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selectedType, 'mock-proof-uri', note);
      Alert.alert('Payment Recorded', 'Your payment has been submitted for confirmation.', [
        { text: 'OK', onPress: onBack },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit payment. Please try again.');
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
            <Text style={styles.title}>Record Payment</Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Payment amount</Text>
            <Money amount={round.amount} currency={round.currency} size={32} color={Colors.textDark} />
            <Text style={styles.roundName}>→ {round.name}</Text>
            {currentCycle && (
              <Text style={styles.cycleInfo}>
                Cycle {currentCycle.cycleNumber} · Due {new Date(currentCycle.dueDate).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            )}
          </View>

          {/* Proof Type Grid */}
          <View>
            <Text style={styles.sectionTitle}>Type of proof</Text>
            <View style={styles.typeGrid}>
              {PROOF_TYPES.map(item => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => setSelectedType(item.type)}
                  style={[
                    styles.typeCard,
                    selectedType === item.type && styles.typeCardSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeEmoji}>{item.emoji}</Text>
                  <Text style={[styles.typeLabel, selectedType === item.type && styles.typeLabelSelected]}>
                    {item.label}
                  </Text>
                  <Text style={styles.typeDesc}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upload Area */}
          <TouchableOpacity
            onPress={handleUpload}
            activeOpacity={0.8}
            style={[styles.uploadArea, hasFile && styles.uploadAreaDone]}
          >
            {hasFile ? (
              <View style={styles.uploadDone}>
                <Text style={styles.uploadDoneIcon}>✓</Text>
                <Text style={styles.uploadDoneText}>File uploaded</Text>
                <TouchableOpacity onPress={() => setHasFile(false)}>
                  <Text style={styles.uploadChange}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPrompt}>
                <Text style={styles.uploadIcon}>⬆️</Text>
                <Text style={styles.uploadText}>Tap to upload proof</Text>
                <Text style={styles.uploadHint}>JPG, PNG or PDF · Max 10MB</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Note */}
          <View>
            <Text style={styles.sectionTitle}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a note for the recipient..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
              style={styles.noteInput}
            />
          </View>

          {/* Privacy */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Your proof is only visible to members of this round. It is never shared publicly.
            </Text>
          </View>

          {/* Declaration */}
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            style={styles.declaration}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.declarationText}>
              I confirm this payment is genuine. I understand that submitting false proof is fraud and may result in legal action and permanent account suspension.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={styles.stickyBar}>
        <Button
          label={isSubmitting ? 'Submitting...' : 'Submit Payment'}
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
    paddingBottom: 28,
  },
  backBtn: {
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.sm,
  },
  body: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  amountCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  amountLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginBottom: Spacing.sm,
  },
  roundName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.greenDeep,
    marginTop: 4,
  },
  cycleInfo: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
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
    fontSize: 24,
    marginBottom: 2,
  },
  typeLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  typeLabelSelected: {
    color: Colors.greenDeep,
  },
  typeDesc: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: Colors.textMed,
    textAlign: 'center',
  },
  uploadArea: {
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    minHeight: 120,
  },
  uploadAreaDone: {
    borderColor: Colors.greenConfirm,
    borderStyle: 'solid',
    backgroundColor: Colors.greenPale,
  },
  uploadPrompt: {
    alignItems: 'center',
    gap: 6,
  },
  uploadIcon: {
    fontSize: 28,
  },
  uploadText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textDark,
  },
  uploadHint: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textLight,
  },
  uploadDone: {
    alignItems: 'center',
    gap: 6,
  },
  uploadDoneIcon: {
    fontSize: 28,
    color: Colors.greenConfirm,
  },
  uploadDoneText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.greenDeep,
  },
  uploadChange: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.textMed,
    textDecorationLine: 'underline',
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
    minHeight: 90,
    textAlignVertical: 'top',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  privacyIcon: {
    fontSize: 16,
  },
  privacyText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.greenDeep,
    lineHeight: 18,
  },
  declaration: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.greenDeep,
    borderColor: Colors.greenDeep,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
  },
  declarationText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    lineHeight: 18,
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
