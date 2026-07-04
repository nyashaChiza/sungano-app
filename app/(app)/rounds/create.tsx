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
  Modal,
  Linking,
  Share as RNShare,
} from 'react-native';
import { toast } from '../../../src/utils/toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Fonts, Spacing, Radius } from '../../../src/constants/theme';
import Button from '../../../src/components/ui/Button';
import { useRoundsStore } from '../../../src/store/roundsStore';
import { useNavStore } from '../../../src/store/navStore';
import { useAuthStore } from '../../../src/store/authStore';

// ── helpers ────────────────────────────────────────────────────────────────

function initials(name?: string) {
  return (name ?? '').trim().split(/\s+/).filter(Boolean)
    .map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

// ── types ──────────────────────────────────────────────────────────────────

interface PendingMember {
  id: string;
  name: string;
}

// ── screen ─────────────────────────────────────────────────────────────────

export default function CreateRoundScreen() {
  const router = useRouter();
  const { createRound } = useRoundsStore();
  const { user: authUser } = useAuthStore();
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
  const [totalCycles, setTotalCycles] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [payoutOrderMethod, setPayoutOrderMethod] = useState('random');
  const [gracePeriod, setGracePeriod] = useState('3');
  const [penalty, setPenalty] = useState('5');

  // Step 3 — Members
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const maxPending = Math.max(0, (parseInt(members, 10) || 10) - 1);
  const canAddMore = pendingMembers.length < maxPending;

  const adminName = authUser?.full_name ?? authUser?.email ?? 'You';

  // ── navigation ─────────────────────────────────────────────────────────

  const handleBack = () => {
    useNavStore.getState().setPendingTab('rounds');
    router.back();
  };

  // ── member management ──────────────────────────────────────────────────

  const addMember = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    setPendingMembers(prev => [...prev, { id: String(Date.now()), name: trimmed }]);
    setNewMemberName('');
    setShowAddModal(false);
  };

  const removeMember = (id: string) => setPendingMembers(prev => prev.filter(m => m.id !== id));

  // ── round creation ─────────────────────────────────────────────────────

  const buildData = () => {
    const n = parseInt(members, 10);
    return {
      name: name.trim(),
      contribution_amount: parseFloat(amount),
      currency,
      cycle_frequency: frequency,
      start_date: startDateObj.toISOString().split('T')[0],
      number_of_members: n,
      total_cycles: totalCycles.trim() ? parseInt(totalCycles, 10) : n,
      payout_method: payoutMethod,
      payout_order_method: payoutOrderMethod,
      grace_period_days: parseInt(gracePeriod, 10),
      late_payment_penalty_percentage: parseFloat(penalty),
      contract_mode: 'simple' as const,
    };
  };

  const shareInvite = async (round: any, method: 'whatsapp' | 'sms' | 'link') => {
    const token = round.invite_token;
    const msg = token
      ? `Join "${round.name}" on Sungano!\n\nInvite code: ${token}`
      : `Join my savings round "${round.name}" on Sungano!`;
    try {
      if (method === 'whatsapp') {
        const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
        const ok = await Linking.canOpenURL(url);
        if (ok) await Linking.openURL(url);
        else await RNShare.share({ message: msg });
      } else if (method === 'sms') {
        const url = Platform.OS === 'ios'
          ? `sms:&body=${encodeURIComponent(msg)}`
          : `sms:?body=${encodeURIComponent(msg)}`;
        await Linking.openURL(url);
      } else {
        await RNShare.share({ message: msg });
      }
    } catch {}
  };

  const handleCreateRound = async (shareMethod?: 'whatsapp' | 'sms' | 'link') => {
    setIsLoading(true);
    try {
      const round = await createRound(buildData());
      toast.success(`"${round.name}" is ready.`, 'Round created!');
      if (shareMethod) await shareInvite(round, shareMethod);
      useNavStore.getState().setPendingTab('rounds');
      router.back();
    } catch (error: any) {
      let msg: string;
      if (error.code === 'ECONNABORTED') {
        msg = 'Request timed out — check your connection and try again.';
      } else {
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          msg = detail.map((e: any) => `${e.loc?.slice(1).join(' → ')}: ${e.msg}`).join('\n');
        } else {
          msg = detail ?? error.response?.data?.message ?? error.message ?? 'Failed to create round.';
        }
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim() || !amount.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!startDate || !members.trim()) {
        toast.error('Please select a start date and enter the number of members');
        return;
      }
      setStep(3);
    } else {
      handleCreateRound();
    }
  };

  const STEP_TITLES = ['Details', 'Settings', 'Members'];

  // ── render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kv}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={step > 1 ? () => setStep(s => s - 1) : handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerMeta}>STEP {step} OF 3</Text>
            <Text style={styles.headerTitle}>{STEP_TITLES[step - 1]}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* ── Progress segments ────────────────────────────────────────── */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map(s => (
            <View key={s} style={[styles.progressSeg, s <= step && styles.progressSegActive]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ────────────────── Step 1: Details ────────────────────────── */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Round Details</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Round Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Friends Circle"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.field}>
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

              <View style={styles.field}>
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

              <View style={styles.field}>
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

          {/* ────────────────── Step 2: Settings ───────────────────────── */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Round Settings</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity style={styles.selectInput} onPress={() => setShowDatePicker(true)}>
                  <Text style={[styles.selectText, !startDate && { color: Colors.textLight }]}>
                    {startDate || 'Select date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color={Colors.textMed} />
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <Modal visible={showDatePicker} transparent animationType="slide">
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
                          onChange={(_e: any, date?: Date) => {
                            if (date) {
                              setStartDateObj(date);
                              setStartDate(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
                            }
                          }}
                        />
                      </View>
                    </View>
                  </Modal>
                )}

                {Platform.OS === 'android' && showDatePicker && (
                  <DateTimePicker
                    value={startDateObj}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(_e: any, date?: Date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setStartDateObj(date);
                        setStartDate(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.rowFields}>
                <View style={[styles.field, styles.flex1]}>
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
                <View style={[styles.field, styles.flex1]}>
                  <Text style={styles.label}>Total Cycles</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={members || '5'}
                    value={totalCycles}
                    onChangeText={setTotalCycles}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Payout Order</Text>
                <View style={styles.pillRow}>
                  {[
                    { value: 'random', label: 'Random' },
                    { value: 'fixed',  label: 'Fixed' },
                    { value: 'bidding', label: 'Bidding' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setPayoutOrderMethod(opt.value)}
                      style={[styles.pill, payoutOrderMethod === opt.value && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, payoutOrderMethod === opt.value && styles.pillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
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

              <View style={styles.rowFields}>
                <View style={[styles.field, styles.flex1]}>
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
                <View style={[styles.field, styles.flex1]}>
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

          {/* ────────────────── Step 3: Members ────────────────────────── */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Who's in the round?</Text>
              <Text style={styles.stepSubtitle}>
                Add everyone contributing. The pot rotates once per member.
              </Text>

              {/* Admin (current user) */}
              <View style={styles.memberCard}>
                <View style={[styles.memberAvatar, { backgroundColor: Colors.greenDeep }]}>
                  <Text style={styles.memberAvatarText}>{initials(adminName) || 'YO'}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{adminName}</Text>
                  <Text style={styles.memberSub}>Admin · you</Text>
                </View>
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>YOU</Text>
                </View>
              </View>

              {/* Pending members */}
              {pendingMembers.map(m => (
                <View key={m.id} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{initials(m.name)}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberSub}>Will be invited to sign</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeMember(m.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={20} color={Colors.textMed} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add member */}
              {canAddMore && (
                <TouchableOpacity
                  style={styles.addMemberBtn}
                  onPress={() => setShowAddModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={20} color={Colors.greenDeep} />
                  <Text style={styles.addMemberText}>Add member</Text>
                </TouchableOpacity>
              )}

              {/* Invite via */}
              <View style={styles.inviteSection}>
                <Text style={styles.inviteLabel}>INVITE VIA</Text>
                <View style={styles.inviteRow}>
                  {([
                    { icon: '💬', label: 'WhatsApp', method: 'whatsapp' },
                    { icon: '💌', label: 'SMS',      method: 'sms'      },
                    { icon: '🔗', label: 'Copy link', method: 'link'    },
                  ] as const).map(opt => (
                    <TouchableOpacity
                      key={opt.method}
                      style={styles.inviteOpt}
                      onPress={() => handleCreateRound(opt.method)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.inviteOptIcon}>
                        <Text style={styles.inviteOptEmoji}>{opt.icon}</Text>
                      </View>
                      <Text style={styles.inviteOptLabel}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Button
            label={step > 1 ? 'Back' : 'Cancel'}
            onPress={() => step > 1 ? setStep(s => s - 1) : handleBack()}
            variant="ghost"
            fullWidth
            size="lg"
          />
          <Button
            label={step === 3 ? 'Create Round' : 'Next'}
            onPress={handleNext}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.nextBtn}
          />
        </View>

        {/* ── Add Member modal ──────────────────────────────────────── */}
        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Member</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Full name"
                placeholderTextColor={Colors.textLight}
                value={newMemberName}
                onChangeText={setNewMemberName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={addMember}
              />
              <View style={styles.modalActions}>
                <Button
                  label="Cancel"
                  onPress={() => { setShowAddModal(false); setNewMemberName(''); }}
                  variant="ghost"
                  fullWidth
                />
                <Button
                  label="Add"
                  onPress={addMember}
                  fullWidth
                  style={{ flex: 1, marginLeft: Spacing.sm }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.white },
  kv:         { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCenter: { alignItems: 'center' },
  headerMeta: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.textLight,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 17,
    color: Colors.textDark,
  },

  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  progressSeg: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: Colors.greenSubtle,
  },
  progressSegActive: { backgroundColor: Colors.greenDeep },

  scroll:      { padding: Spacing.lg, paddingBottom: Spacing.xl },
  stepContent: { gap: Spacing.lg },

  stepTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    lineHeight: 21,
    marginTop: -Spacing.sm,
  },

  field:   { gap: Spacing.sm },
  label:   { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textDark },
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
  selectText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.textDark },
  rowFields:  { flexDirection: 'row', gap: Spacing.md },
  flex1:      { flex: 1 },

  pillRow:  { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillActive:     { backgroundColor: Colors.greenDeep, borderColor: Colors.greenDeep },
  pillText:       { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.textMed },
  pillTextActive: { color: Colors.white, fontFamily: Fonts.bodySemiBold },

  // ── Member cards ──────────────────────────────────────────────────────
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  memberAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.greenSubtle,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  memberAvatarText: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.greenDeep },
  memberInfo: { flex: 1 },
  memberName: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.textDark },
  memberSub:  { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed, marginTop: 1 },

  youBadge: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  youBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.greenDeep,
    letterSpacing: 0.5,
  },

  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.greenDeep,
    borderStyle: 'dashed',
    paddingVertical: Spacing.md,
  },
  addMemberText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.greenDeep },

  // ── Invite via ────────────────────────────────────────────────────────
  inviteSection: { marginTop: Spacing.sm },
  inviteLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.textMed,
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  inviteRow:  { flexDirection: 'row', gap: Spacing.md },
  inviteOpt: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  inviteOptIcon: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteOptEmoji: { fontSize: 22 },
  inviteOptLabel: { fontFamily: Fonts.bodyMedium, fontSize: 12, color: Colors.textDark },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: { flex: 1 },

  // ── Add member modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  modalTitle: { fontFamily: Fonts.displayBold, fontSize: 18, color: Colors.textDark },
  modalInput: {
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
  modalActions: { flexDirection: 'row', gap: Spacing.sm },

  // ── Date picker (iOS modal) ───────────────────────────────────────────
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
  pickerTitle:  { fontFamily: Fonts.displaySemiBold, fontSize: 16, color: Colors.textDark },
  pickerCancel: { fontFamily: Fonts.bodyRegular, fontSize: 15, color: Colors.textMed },
  pickerDone:   { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.greenDeep },
});
