import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../../../src/constants/theme';
import { useGoalsStore } from '../../../src/store/goalsStore';
import { goalsService } from '../../../src/services/goalsService';
import { useNavStore } from '../../../src/store/navStore';
import { useAuthStore } from '../../../src/store/authStore';
import Button from '../../../src/components/ui/Button';
import Money from '../../../src/components/ui/Money';
import ProgressBar from '../../../src/components/ui/ProgressBar';

// ── helpers ────────────────────────────────────────────────────────────────

function initials(name?: string) {
  return (name ?? '').trim().split(/\s+/).filter(Boolean)
    .map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Status chip ────────────────────────────────────────────────────────────

function GoalStatusChip({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    active:    { bg: Colors.greenPale, text: Colors.greenDeep, label: 'ACTIVE'    },
    completed: { bg: Colors.bgLight,   text: Colors.textMed,   label: 'DONE'      },
    cancelled: { bg: Colors.redBg,     text: Colors.red,       label: 'CANCELLED' },
    paused:    { bg: Colors.amberBg,   text: Colors.amber,     label: 'PAUSED'    },
  };
  const c = cfg[status] ?? { bg: Colors.bgLight, text: Colors.textMed, label: status.toUpperCase() };
  return (
    <View style={[chip.base, { backgroundColor: c.bg }]}>
      <Text style={[chip.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  base: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  text: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5 },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function GoalDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentGoal, fetchGoal } = useGoalsStore();
  const { user } = useAuthStore();

  const [fetched, setFetched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [depositing, setDepositing] = useState(false);
  const mounted = useRef(true);

  const goBack = () => {
    useNavStore.getState().setPendingTab('goals');
    router.back();
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      useGoalsStore.setState({ currentGoal: null });
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    setFetched(false);
    fetchGoal(id as string).finally(() => {
      if (mounted.current) setFetched(true);
    });
  }, [id]);

  const onRefresh = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    try { await fetchGoal(id as string); }
    finally { if (mounted.current) setRefreshing(false); }
  }, [id, fetchGoal]);

  const handleDeposit = useCallback(async () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;
    setDepositing(true);
    try {
      await goalsService.recordDeposit(id as string, {
        amount: amt,
        note: depositNote.trim() || undefined,
      });
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositNote('');
      // Refresh goal
      fetchGoal(id as string);
    } catch {}
    finally { setDepositing(false); }
  }, [id, depositAmount, depositNote]);

  // ── Loading ───────────────────────────────────────────────────────────

  if (!fetched) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goal</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.greenDeep} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────

  if (!currentGoal) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goal</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={52} color={Colors.textLight} />
          <Text style={styles.errorTitle}>Goal not found</Text>
          <Text style={styles.errorBody}>This goal may have been removed or you may not have access.</Text>
          <Button label="Back to Goals" onPress={goBack} variant="primary" size="lg" fullWidth style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Detail ────────────────────────────────────────────────────────────

  const goal = currentGoal;
  const progress = goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0;
  const pct = Math.min(100, Math.round(progress * 100));
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const dl = daysLeft(goal.target_date);
  const isComplete = goal.status === 'completed' || pct >= 100;

  const dueLabel = dl < 0
    ? `${Math.abs(dl)} days overdue`
    : dl === 0 ? 'Due today'
    : dl < 30 ? `${dl} days left`
    : fmtDate(goal.target_date);
  const dueColor = dl < 0 ? Colors.red : dl < 14 ? Colors.amber : Colors.textMed;

  const members = goal.members ?? [];
  const isGroup = goal.type === 'group';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
          <GoalStatusChip status={goal.status} />
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.greenDeep}
            colors={[Colors.greenDeep]}
          />
        }
      >

        {/* ── Progress card ──────────────────────────────────────────── */}
        <View style={styles.progressCard}>
          {/* Amount row */}
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>Saved so far</Text>
              <Text style={styles.amountCurrent}>
                {goal.currency} {goal.current_amount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.pctBadge}>
              <Text style={styles.pctText}>{pct}%</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amountLabel}>Target</Text>
              <Text style={styles.amountTarget}>
                {goal.currency} {goal.target_amount.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <ProgressBar
            value={goal.current_amount}
            max={goal.target_amount}
            height={10}
            milestones={[0.25, 0.5, 0.75]}
          />

          {/* Remaining */}
          {!isComplete && (
            <Text style={styles.remaining}>
              {goal.currency} {remaining.toLocaleString()} remaining
            </Text>
          )}
          {isComplete && (
            <View style={styles.completeBanner}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.greenDeep} />
              <Text style={styles.completeBannerText}>Goal reached!</Text>
            </View>
          )}
        </View>

        {/* ── Details card ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <DetailRow label="Target date">
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rowValue}>{fmtDate(goal.target_date)}</Text>
              <Text style={[styles.rowSub, { color: dueColor }]}>{dueLabel}</Text>
            </View>
          </DetailRow>
          <DetailRow label="Type">
            <View style={styles.typeBadge}>
              <Ionicons
                name={isGroup ? 'people-outline' : 'person-outline'}
                size={13}
                color={Colors.greenDeep}
              />
              <Text style={styles.typeText}>{isGroup ? 'Group' : 'Solo'}</Text>
            </View>
          </DetailRow>
          {goal.frequency && (
            <DetailRow label="Deposit frequency">
              <Text style={styles.rowValue}>{goal.frequency}</Text>
            </DetailRow>
          )}
          <DetailRow label="Currency">
            <Text style={styles.rowValue}>{goal.currency}</Text>
          </DetailRow>
        </View>

        {/* ── Members (group goals) ──────────────────────────────────── */}
        {isGroup && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Members</Text>
              <Text style={styles.sectionMeta}>{members.length} contributing</Text>
            </View>

            <View style={styles.card}>
              {members.length === 0 ? (
                <Text style={styles.emptyMeta}>No members have joined yet.</Text>
              ) : (
                members.map((m, i) => {
                  const isMe = m.user_id === user?.id;
                  const contribution = m.amount_contributed ?? 0;
                  const memberProgress = goal.target_amount > 0
                    ? contribution / goal.target_amount
                    : 0;

                  return (
                    <View key={m.id} style={[styles.memberRow, i > 0 && styles.memberRowBorder]}>
                      <View style={[styles.memberAvatar, isMe && styles.memberAvatarMe]}>
                        <Text style={styles.memberAvatarText}>
                          {initials(isMe ? (user?.full_name ?? 'You') : m.user_name)}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>
                          {isMe ? 'You' : m.user_name}
                        </Text>
                        <Text style={styles.memberContrib}>
                          {goal.currency} {contribution.toLocaleString()} contributed
                        </Text>
                      </View>
                      <Text style={styles.memberPct}>
                        {Math.round(memberProgress * 100)}%
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        <View style={{ height: 96 }} />
      </ScrollView>

      {/* ── Record deposit CTA ─────────────────────────────────────── */}
      {!isComplete && (
        <View style={styles.depositBar}>
          <TouchableOpacity
            style={styles.depositBtn}
            onPress={() => setShowDepositModal(true)}
            activeOpacity={0.88}
          >
            <Ionicons name="arrow-down-circle-outline" size={22} color={Colors.white} />
            <Text style={styles.depositBtnText}>Record Deposit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Deposit modal ──────────────────────────────────────────── */}
      <Modal visible={showDepositModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Record Deposit</Text>
            <Text style={styles.modalGoalName}>{goal.name}</Text>

            <Text style={styles.modalFieldLabel}>Amount ({goal.currency})</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={`e.g. ${Math.round(goal.target_amount / 10).toLocaleString()}`}
              placeholderTextColor={Colors.textLight}
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="decimal-pad"
              autoFocus
            />

            <Text style={styles.modalFieldLabel}>Note (optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputMulti]}
              placeholder="e.g. Bank transfer"
              placeholderTextColor={Colors.textLight}
              value={depositNote}
              onChangeText={setDepositNote}
              multiline
              textAlignVertical="top"
            />

            <Button
              label="Confirm Deposit"
              onPress={handleDeposit}
              loading={depositing}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.sm }}
            />
            <Button
              label="Cancel"
              onPress={() => { setShowDepositModal(false); setDepositAmount(''); setDepositNote(''); }}
              variant="ghost"
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Helper component ───────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bgLight },

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
    fontFamily: Fonts.displaySemiBold,
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
  },
  headerTitleGroup: { flex: 1, gap: 4 },
  goalName: { fontFamily: Fonts.displaySemiBold, fontSize: 16, color: Colors.white },

  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  errorTitle: { fontFamily: Fonts.displayBold, fontSize: 20, color: Colors.textDark },
  errorBody:  { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.textMed, textAlign: 'center', lineHeight: 22 },

  scroll: { padding: Spacing.lg },

  // Progress card
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, color: Colors.textMed, marginBottom: 2 },
  amountCurrent: { fontFamily: Fonts.mono, fontSize: 18, color: Colors.greenDeep, letterSpacing: -0.5 },
  amountTarget:  { fontFamily: Fonts.mono, fontSize: 14, color: Colors.textMed },
  pctBadge: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pctText: { fontFamily: Fonts.displayBold, fontSize: 18, color: Colors.greenDeep },
  remaining: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed, textAlign: 'center' },
  completeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
  },
  completeBannerText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.greenDeep },

  // Details card
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },
  rowValue: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textDark },
  rowSub:   { fontFamily: Fonts.bodyRegular, fontSize: 11, marginTop: 1 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.greenPale, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  typeText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.greenDeep },

  // Members
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontFamily: Fonts.displayBold, fontSize: 16, color: Colors.textDark },
  sectionMeta:  { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },
  emptyMeta:    { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed, textAlign: 'center', paddingVertical: Spacing.md },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  memberRowBorder: { borderTopWidth: 1, borderTopColor: Colors.bgLight },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.greenPale,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  memberAvatarMe: { backgroundColor: Colors.greenDeep },
  memberAvatarText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.greenDeep },
  memberInfo: { flex: 1 },
  memberName:   { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.textDark },
  memberContrib: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed, marginTop: 1 },
  memberPct:    { fontFamily: Fonts.mono, fontSize: 13, color: Colors.greenDeep, flexShrink: 0 },

  // Deposit bar
  depositBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  depositBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.greenDeep,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
  },
  depositBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.white },

  // Deposit modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    borderRadius: 2, backgroundColor: Colors.border, marginBottom: Spacing.sm,
  },
  modalTitle:    { fontFamily: Fonts.displayBold, fontSize: 20, color: Colors.textDark },
  modalGoalName: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed, marginTop: -Spacing.sm },
  modalFieldLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textDark },
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
  modalInputMulti: { minHeight: 64, textAlignVertical: 'top' },
});
