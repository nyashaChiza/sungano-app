import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../../src/constants/theme';
import { useRoundsStore, type Payment } from '../../../src/store/roundsStore';
import { roundsService } from '../../../src/services/roundsService';
import { useAuthStore } from '../../../src/store/authStore';
import { useNavStore } from '../../../src/store/navStore';
import Button from '../../../src/components/ui/Button';
import ProgressBar from '../../../src/components/ui/ProgressBar';

// ── Types ──────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  user_id?: string;
  full_name?: string;
  name?: string;
  user_name?: string;
  status?: string;
  payout_position?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function ini(name?: string) {
  return (name ?? '').trim().split(/\s+/).filter(Boolean)
    .map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

// API may return full_name, name, or user_name
function memberName(m: Member) {
  return m.full_name || m.name || m.user_name || '';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysFrom(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function paymentDetail(p: Payment): string {
  if (p.status === 'paid' && p.payment_date) {
    const d = new Date(p.payment_date);
    return `Paid ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }
  if (p.status === 'overdue') {
    const days = Math.abs(Math.min(0, daysFrom(p.due_date)));
    return `Overdue · ${days || 1} day${days !== 1 ? 's' : ''}`;
  }
  if (p.status === 'grace') {
    const days = Math.max(0, daysFrom(p.due_date));
    return `Grace · ${days} day${days !== 1 ? 's' : ''} left`;
  }
  return 'Awaiting payment';
}

// ── Sub-components ─────────────────────────────────────────────────────────

function RoundStatusChip({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    active:    { bg: Colors.greenPale, text: Colors.greenDeep, label: 'ACTIVE'    },
    completed: { bg: Colors.bgLight,   text: Colors.textMed,   label: 'DONE'      },
    cancelled: { bg: Colors.redBg,     text: Colors.red,       label: 'CANCELLED' },
    pending:   { bg: Colors.amberBg,   text: Colors.amber,     label: 'PENDING'   },
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

const STATUS_CFG: Record<string, { bg: string; text: string; label: string }> = {
  paid:      { bg: Colors.greenConfirm, text: Colors.white,   label: '✓ PAID'    },
  pending:   { bg: Colors.bgLight,      text: Colors.textMed, label: '○ PENDING' },
  overdue:   { bg: Colors.amberBg,      text: Colors.amber,   label: '! OVERDUE' },
  defaulted: { bg: Colors.redBg,        text: Colors.red,     label: 'DEFAULTED' },
  grace:     { bg: '#FEF9C3',           text: '#D97706',      label: '⏳ GRACE'  },
};
function PayStatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <View style={[badge.base, { backgroundColor: c.bg }]}>
      <Text style={[badge.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  base: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.pill },
  text: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.4 },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function RoundDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentRound, fetchRound } = useRoundsStore();
  const { user } = useAuthStore();

  const [fetched, setFetched] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordNote, setRecordNote] = useState('');
  const [recording, setRecording] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  const goBack = () => {
    useNavStore.getState().setPendingTab('rounds');
    router.back();
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      useRoundsStore.setState({ currentRound: null });
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    setFetched(false);
    fetchRound(id as string).finally(() => { if (mounted.current) setFetched(true); });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setMembersLoading(true);
    roundsService.getRoundMembers(id as string)
      .then((res: any) => {
        if (!mounted.current) return;
        const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setMembers(raw);
      })
      .catch(() => { if (mounted.current) setMembers([]); })
      .finally(() => { if (mounted.current) setMembersLoading(false); });
  }, [id]);

  const shareInvite = useCallback(async (method: 'whatsapp' | 'sms' | 'link') => {
    if (!currentRound) return;
    const token = (currentRound as any).invite_token as string | undefined;
    const msg = token
      ? `Join "${currentRound.name}" on Sungano!\n\nInvite code: ${token}`
      : `Join my savings round "${currentRound.name}" on Sungano!`;
    try {
      if (method === 'whatsapp') {
        const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
        const ok = await Linking.canOpenURL(url);
        if (ok) await Linking.openURL(url); else await Share.share({ message: msg });
      } else if (method === 'sms') {
        const url = Platform.OS === 'ios'
          ? `sms:&body=${encodeURIComponent(msg)}`
          : `sms:?body=${encodeURIComponent(msg)}`;
        await Linking.openURL(url);
      } else {
        await Share.share({ message: msg });
      }
    } catch {}
  }, [currentRound]);

  const refreshMembers = useCallback(async () => {
    if (!id) return;
    const res: any = await roundsService.getRoundMembers(id as string).catch(() => []);
    if (!mounted.current) return;
    const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    setMembers(raw);
  }, [id]);

  const onRefresh = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    try { await Promise.all([fetchRound(id as string), refreshMembers()]); }
    finally { if (mounted.current) setRefreshing(false); }
  }, [id, fetchRound, refreshMembers]);

  const handleRecordPayment = async () => {
    if (!currentRound || !id) return;
    setRecording(true);
    try {
      await roundsService.recordPayment(id as string, {
        amount: currentRound.contribution_amount,
        note: recordNote.trim() || undefined,
      });
      setShowRecordModal(false);
      setRecordNote('');
      fetchRound(id as string);
    } catch {}
    finally { setRecording(false); }
  };

  // ── Loading ───────────────────────────────────────────────────────────

  if (!fetched) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.greenHeader}>
          <TouchableOpacity onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={s.headerTitleCenter}>Round</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={Colors.greenDeep} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────

  if (!currentRound) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.greenHeader}>
          <TouchableOpacity onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={s.headerTitleCenter}>Round</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.centered}>
          <Ionicons name="alert-circle-outline" size={52} color={Colors.textLight} />
          <Text style={s.errorTitle}>Round not found</Text>
          <Text style={s.errorBody}>This round may have been removed or you may not have access.</Text>
          <Button label="Back to Rounds" onPress={goBack} variant="primary" size="lg" fullWidth style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const adminName = user?.full_name ?? user?.email ?? 'You';
  const adminId   = user?.id;

  // Members from API excluding current user (shown separately as admin)
  const otherMembers = members.filter(m => m.user_id !== adminId);
  const totalJoined  = members.length || 1; // at least the creator counts
  const slotsRemaining = Math.max(0, currentRound.number_of_members - totalJoined);
  const allFilled = slotsRemaining === 0;
  const visibleEmpty = Math.min(slotsRemaining, 3);
  const hiddenEmpty  = slotsRemaining - visibleEmpty;

  // ── PENDING — "Who's in the round?" members screen ────────────────────

  if (!currentRound.current_cycle) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        {/* Header */}
        <View style={s.greenHeader}>
          <TouchableOpacity onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={s.headerTitleGroup}>
            <Text style={s.headerRoundName} numberOfLines={1}>{currentRound.name}</Text>
            <RoundStatusChip status={currentRound.status} />
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={s.pendingScroll}
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
          {/* Title */}
          <Text style={s.pendingTitle}>Who's in the round?</Text>
          <Text style={s.pendingSubtitle}>
            Add everyone contributing. The pot rotates once per member.
          </Text>

          {/* Progress */}
          <View style={s.progressRow}>
            <Text style={s.progressText}>
              <Text style={s.progressBold}>{totalJoined}</Text>
              {` of ${currentRound.number_of_members} joined`}
            </Text>
          </View>
          <ProgressBar value={totalJoined} max={currentRound.number_of_members} height={6} />

          <View style={s.memberList}>
            {/* Admin / current user */}
            <View style={s.memberCard}>
              <View style={[s.memberAvatar, { backgroundColor: Colors.greenDeep }]}>
                <Text style={[s.memberAvatarText, { color: Colors.white }]}>{ini(adminName) || 'YO'}</Text>
              </View>
              <View style={s.memberInfo}>
                <Text style={s.memberName}>{adminName}</Text>
                <Text style={s.memberSub}>Admin · you</Text>
              </View>
              <View style={s.youBadge}>
                <Text style={s.youBadgeText}>YOU</Text>
              </View>
            </View>

            {/* Other joined members */}
            {membersLoading && otherMembers.length === 0 ? (
              <ActivityIndicator color={Colors.greenDeep} style={{ marginVertical: Spacing.md }} />
            ) : (
              otherMembers.map(m => {
                const nm = memberName(m) || 'Member';
                return (
                  <View key={m.id} style={s.memberCard}>
                    <View style={s.memberAvatar}>
                      <Text style={s.memberAvatarText}>{ini(nm)}</Text>
                    </View>
                    <View style={s.memberInfo}>
                      <Text style={s.memberName}>{nm}</Text>
                      <Text style={s.memberSub}>Active member</Text>
                    </View>
                  </View>
                );
              })
            )}

            {/* Empty slot placeholders */}
            {Array.from({ length: visibleEmpty }).map((_, i) => (
              <View key={`empty-${i}`} style={[s.memberCard, s.memberCardEmpty]}>
                <View style={[s.memberAvatar, s.memberAvatarEmpty]}>
                  <Ionicons name="person-outline" size={16} color={Colors.textLight} />
                </View>
                <Text style={s.memberNameEmpty}>Open slot</Text>
                <Text style={s.slotLabel}>Slot {totalJoined + i + 1}</Text>
              </View>
            ))}

            {hiddenEmpty > 0 && (
              <Text style={s.moreSlots}>
                +{hiddenEmpty} more open slot{hiddenEmpty !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Add member */}
          {!allFilled && (
            <TouchableOpacity
              style={s.addMemberBtn}
              onPress={() => shareInvite('link')}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.greenDeep} />
              <Text style={s.addMemberText}>Add member</Text>
            </TouchableOpacity>
          )}

          {/* Invite via */}
          {!allFilled && (
            <View style={s.inviteSection}>
              <Text style={s.inviteLabel}>INVITE VIA</Text>
              <View style={s.inviteRow}>
                {([
                  { icon: '💬', label: 'WhatsApp', method: 'whatsapp' },
                  { icon: '💌', label: 'SMS',      method: 'sms'      },
                  { icon: '🔗', label: 'Copy link', method: 'link'    },
                ] as const).map(opt => (
                  <TouchableOpacity
                    key={opt.method}
                    style={s.inviteOpt}
                    onPress={() => shareInvite(opt.method)}
                    activeOpacity={0.75}
                  >
                    <View style={s.inviteOptIcon}>
                      <Text style={s.inviteOptEmoji}>{opt.icon}</Text>
                    </View>
                    <Text style={s.inviteOptLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* All filled */}
          {allFilled && (
            <View style={s.filledBanner}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.greenDeep} />
              <Text style={s.filledBannerText}>
                All spots filled — round starts {fmtDate(currentRound.start_date)}
              </Text>
            </View>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── ACTIVE — Payment board ────────────────────────────────────────────

  const cycle = currentRound.current_cycle;
  const totalPot  = currentRound.contribution_amount * currentRound.number_of_members;
  const paidCount = cycle.payments.filter(p => p.status === 'paid').length;
  const paidAmount = paidCount * currentRound.contribution_amount;
  const myPayment  = cycle.payments.find(p => p.user_id === adminId);
  const hasIPaid   = myPayment?.status === 'paid';

  const dueDate   = new Date(cycle.due_date);
  const daysLeft  = daysFrom(cycle.due_date);
  const cycleMonth = dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dueDateLabel = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dueStatus = daysLeft > 0 ? `Due in ${daysLeft}d` : daysLeft === 0 ? 'Due today' : 'Overdue';

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* Board header */}
      <View style={s.boardHeader}>
        <TouchableOpacity onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <View style={s.boardHeaderIcons}>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="menu-outline" size={24} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.boardScroll}
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
        {/* Cycle heading */}
        <View style={s.cycleHeading}>
          <View>
            <Text style={s.roundLabel}>{currentRound.name.toUpperCase()}</Text>
            <Text style={s.cycleMonth}>{cycleMonth}</Text>
          </View>
          <View style={s.dueBlock}>
            <Text style={[s.dueStatus, daysLeft <= 0 && { color: Colors.red }]}>{dueStatus}</Text>
            <Text style={s.dueDate}>{dueDateLabel}</Text>
          </View>
        </View>

        {/* Progress */}
        <ProgressBar value={paidCount} max={currentRound.number_of_members} height={8} />
        <View style={s.progressLabels}>
          <Text style={s.progressLeft}>
            <Text style={s.progressBold}>{paidCount}</Text>
            {` of ${currentRound.number_of_members} paid`}
          </Text>
          <Text style={s.progressRight}>
            {currentRound.currency} {paidAmount.toLocaleString()}
            {' / '}
            {currentRound.currency} {totalPot.toLocaleString()}
          </Text>
        </View>

        {/* Recipient card */}
        <View style={s.recipientCard}>
          <View style={s.recipientLeft}>
            <View style={s.recipientIcon}>
              <Ionicons name="trophy-outline" size={18} color={Colors.greenDeep} />
            </View>
            <View>
              <Text style={s.recipientLabel}>THIS CYCLE'S RECIPIENT</Text>
              <Text style={s.recipientName}>{cycle.recipient_name}</Text>
            </View>
          </View>
          <Text style={s.recipientAmount}>
            {currentRound.currency} {totalPot.toLocaleString()}
          </Text>
        </View>

        {/* Member payments */}
        <View style={s.membersSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Members</Text>
            <Text style={s.sectionMeta}>{currentRound.number_of_members} total</Text>
          </View>

          <View style={s.paymentsCard}>
            {cycle.payments.map((p, i) => {
              const isMe        = p.user_id === adminId;
              const isRecipient = p.user_id === cycle.recipient_id;
              const displayName = isMe ? 'You' : p.user_name;
              const avatarIni   = ini(displayName);
              const detail      = paymentDetail(p);
              const isLast      = i === cycle.payments.length - 1;

              return (
                <View key={p.id} style={[s.payRow, !isLast && s.payRowBorder]}>
                  <View style={s.payAvatar}>
                    <Text style={s.payAvatarText}>{avatarIni}</Text>
                  </View>
                  <View style={s.payInfo}>
                    <View style={s.payNameRow}>
                      <Text style={s.payName} numberOfLines={1}>{displayName}</Text>
                      {isRecipient && (
                        <View style={s.recipientChip}>
                          <Text style={s.recipientChipText}>RECIPIENT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.payDetail}>{detail}</Text>
                  </View>
                  <View style={s.payRight}>
                    <Text style={s.payAmount}>
                      {currentRound.currency} {currentRound.contribution_amount.toLocaleString()}
                    </Text>
                    <PayStatusBadge status={p.status} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: hasIPaid ? Spacing.xxl : 90 }} />
      </ScrollView>

      {/* Record payment CTA */}
      {!hasIPaid && (
        <View style={s.recordBar}>
          <TouchableOpacity style={s.recordBtn} onPress={() => setShowRecordModal(true)} activeOpacity={0.88}>
            <Ionicons name="arrow-up-circle-outline" size={22} color={Colors.white} />
            <Text style={s.recordBtnText}>Record my payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Record payment modal */}
      <Modal visible={showRecordModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Record Payment</Text>
            <View style={s.modalAmountRow}>
              <Text style={s.modalAmountLabel}>Amount</Text>
              <Text style={s.modalAmount}>
                {currentRound.currency} {currentRound.contribution_amount.toLocaleString()}
              </Text>
            </View>
            <Text style={s.modalNoteLabel}>Note (optional)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g., Paid via M-Pesa"
              placeholderTextColor={Colors.textLight}
              value={recordNote}
              onChangeText={setRecordNote}
              multiline
            />
            <Button label="Confirm Payment" onPress={handleRecordPayment} loading={recording} fullWidth size="lg" style={{ marginTop: Spacing.sm }} />
            <Button label="Cancel" onPress={() => { setShowRecordModal(false); setRecordNote(''); }} variant="ghost" fullWidth size="lg" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bgLight },

  // ── Shared headers ──────────────────────────────────────────────────────
  greenHeader: {
    backgroundColor: Colors.greenDeep,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  headerTitleCenter: {
    flex: 1,
    fontFamily: Fonts.displaySemiBold,
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
  },
  headerTitleGroup: { flex: 1, gap: 4 },
  headerRoundName: { fontFamily: Fonts.displaySemiBold, fontSize: 16, color: Colors.white },

  // ── Loading / error ─────────────────────────────────────────────────────
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  errorTitle: { fontFamily: Fonts.displayBold, fontSize: 20, color: Colors.textDark },
  errorBody:  { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.textMed, textAlign: 'center', lineHeight: 22 },

  // ── PENDING: "Who's in the round?" ──────────────────────────────────────
  pendingScroll: { padding: Spacing.lg },

  pendingTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.textDark,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  pendingSubtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },

  progressRow: { marginBottom: Spacing.sm },
  progressText: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },
  progressBold: { fontFamily: Fonts.bodySemiBold, color: Colors.textDark },

  memberList: { gap: Spacing.sm, marginTop: Spacing.lg, marginBottom: Spacing.lg },

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
  memberCardEmpty: { opacity: 0.55 },

  memberAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.greenSubtle,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  memberAvatarEmpty: {
    backgroundColor: Colors.bgLight,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
  },
  memberAvatarText: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.greenDeep },
  memberInfo: { flex: 1 },
  memberName:      { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.textDark },
  memberNameEmpty: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.textLight },
  memberSub:  { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed, marginTop: 1 },
  slotLabel:  { fontFamily: Fonts.bodyRegular, fontSize: 11, color: Colors.textLight, flexShrink: 0 },

  youBadge: {
    backgroundColor: Colors.greenPale, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  youBadgeText: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.greenDeep, letterSpacing: 0.5 },

  moreSlots: {
    fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textLight, textAlign: 'center',
    paddingVertical: Spacing.sm,
  },

  addMemberBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: Colors.greenDeep, borderStyle: 'dashed',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addMemberText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.greenDeep },

  inviteSection: { marginBottom: Spacing.lg },
  inviteLabel: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.textMed,
    letterSpacing: 1.2, marginBottom: Spacing.md,
  },
  inviteRow:  { flexDirection: 'row', gap: Spacing.md },
  inviteOpt: {
    flex: 1, alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, paddingVertical: Spacing.md,
  },
  inviteOptIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.bgLight,
    justifyContent: 'center', alignItems: 'center',
  },
  inviteOptEmoji: { fontSize: 22 },
  inviteOptLabel: { fontFamily: Fonts.bodyMedium, fontSize: 12, color: Colors.textDark },

  filledBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'center',
    backgroundColor: Colors.greenPale, borderRadius: Radius.xl,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  filledBannerText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.greenDeep },

  // ── ACTIVE: Payment board ───────────────────────────────────────────────
  boardHeader: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  boardHeaderIcons: { flexDirection: 'row', gap: Spacing.md },
  boardScroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

  cycleHeading: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  roundLabel: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.textMed, letterSpacing: 1, marginBottom: 4,
  },
  cycleMonth: { fontFamily: Fonts.displayBold, fontSize: 30, color: Colors.textDark, letterSpacing: -0.5 },
  dueBlock: { alignItems: 'flex-end' },
  dueStatus: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.amber },
  dueDate:   { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed, marginTop: 2 },

  progressLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm, marginBottom: Spacing.lg,
  },
  progressLeft:  { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },
  progressRight: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.textMed },

  recipientCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.greenPale, borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.greenSubtle,
  },
  recipientLeft:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  recipientIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
  },
  recipientLabel: {
    fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.greenDeep, letterSpacing: 0.8, marginBottom: 2,
  },
  recipientName: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.textDark },
  recipientAmount: { fontFamily: Fonts.mono, fontSize: 20, color: Colors.greenDeep, letterSpacing: -0.5 },

  membersSection: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md,
  },
  sectionTitle: { fontFamily: Fonts.displayBold, fontSize: 18, color: Colors.textDark },
  sectionMeta:  { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.textMed },

  paymentsCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.card,
  },
  payRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  payRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.bgLight },
  payAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.greenPale,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  payAvatarText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.greenDeep },
  payInfo: { flex: 1, minWidth: 0 },
  payNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  payName:    { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.textDark },
  payDetail:  { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.textMed, marginTop: 2 },
  payRight:   { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  payAmount:  { fontFamily: Fonts.mono, fontSize: 13, color: Colors.textDark },

  recipientChip: {
    backgroundColor: Colors.greenSubtle, borderRadius: Radius.pill, paddingHorizontal: 7, paddingVertical: 2,
  },
  recipientChipText: { fontFamily: Fonts.bodySemiBold, fontSize: 9, color: Colors.greenDeep, letterSpacing: 0.5 },

  recordBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, paddingTop: Spacing.md,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  recordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.greenDeep, borderRadius: Radius.xl, paddingVertical: Spacing.lg,
  },
  recordBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.white },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, paddingBottom: 40, gap: Spacing.md,
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, marginBottom: Spacing.sm,
  },
  modalTitle: { fontFamily: Fonts.displayBold, fontSize: 20, color: Colors.textDark },
  modalAmountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.greenPale, borderRadius: Radius.lg, padding: Spacing.md,
  },
  modalAmountLabel: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.textMed },
  modalAmount: { fontFamily: Fonts.mono, fontSize: 18, color: Colors.greenDeep },
  modalNoteLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textDark },
  modalInput: {
    backgroundColor: Colors.bgLight, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.textDark, minHeight: 72,
  },
});
