import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../../../src/constants/theme';
import { useAuthStore } from '../../../../src/store/authStore';
import { roundsService } from '../../../../src/services/roundsService';
import Button from '../../../../src/components/ui/Button';
import Card from '../../../../src/components/ui/Card';
import { toast } from '../../../../src/utils/toast';

interface RoundPreview {
  id: string;
  name: string;
  creator_name: string;
  contribution_amount: number;
  currency: string;
  cycle_frequency: string;
  total_cycles: number;
  status: string;
  members_count: number;
  start_date: string;
}

const FREQ_LABEL: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
};

export default function JoinRoundScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { user, setPendingInviteToken } = useAuthStore();
  const [preview, setPreview] = useState<RoundPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchPreview();
  }, [token]);

  const fetchPreview = async () => {
    try {
      setIsLoading(true);
      // Guest preview — no auth needed
      const res = await roundsService.previewRound(token!);
      setPreview(res?.data ?? res);
    } catch {
      setError('This invite link is invalid or has expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      // Store token then redirect to auth
      setPendingInviteToken(token!);
      router.push('/(auth)/register');
      return;
    }
    try {
      setIsJoining(true);
      await roundsService.joinRound(token!);
      toast.success('You have joined the round!');
      router.replace('/');
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Unable to join. Please try again.';
      toast.error(msg);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.greenDeep} />
        <Text style={styles.loadingText}>Loading round details…</Text>
      </View>
    );
  }

  if (error || !preview) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>🔗</Text>
        <Text style={styles.errorTitle}>Link not found</Text>
        <Text style={styles.errorSub}>{error || 'Something went wrong.'}</Text>
        <Button label="Go Home" onPress={() => router.replace('/')} style={{ marginTop: Spacing.xl }} />
      </View>
    );
  }

  const totalPayout =
    (preview.contribution_amount * (preview.total_cycles - 1)).toFixed(2);

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>YOU'VE BEEN INVITED</Text>
        <Text style={styles.roundName}>{preview.name}</Text>
        <Text style={styles.creatorLine}>
          Created by <Text style={styles.creatorName}>{preview.creator_name}</Text>
        </Text>
      </View>

      {/* Key stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {preview.currency} {Number(preview.contribution_amount).toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>per cycle</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{preview.total_cycles}</Text>
          <Text style={styles.statLabel}>members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{FREQ_LABEL[preview.cycle_frequency] ?? preview.cycle_frequency}</Text>
          <Text style={styles.statLabel}>frequency</Text>
        </View>
      </View>

      {/* Details */}
      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Round details</Text>

        <DetailRow label="Start date" value={new Date(preview.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
        <DetailRow label="Total cycles" value={`${preview.total_cycles} cycles`} />
        <DetailRow label="Your payout" value={`${preview.currency} ${totalPayout}`} />
        <DetailRow label="Members joined" value={`${preview.members_count} of ${preview.total_cycles}`} />
        <DetailRow label="Status" value={preview.status.charAt(0).toUpperCase() + preview.status.slice(1)} />
      </Card>

      {/* How it works */}
      <Card style={styles.howCard}>
        <Text style={styles.sectionTitle}>How Sungano works</Text>
        <Text style={styles.howText}>
          📝  Everyone signs a digital contract before the round starts.{'\n\n'}
          💳  Each cycle you pay your share and upload proof.{'\n\n'}
          ✅  The recipient confirms payments. Everything is on record.{'\n\n'}
          🔄  The payout rotates to the next person each cycle.
        </Text>
      </Card>

      {/* Privacy note */}
      <View style={styles.privacyRow}>
        <Text style={styles.privacyText}>
          🔒  Sungano never holds or moves money. It records commitments.
        </Text>
      </View>

      {/* CTA */}
      <View style={styles.ctaArea}>
        {!user && (
          <Text style={styles.authNote}>
            You'll need a Sungano account to join. It takes less than a minute.
          </Text>
        )}
        <Button
          label={
            isJoining
              ? 'Joining…'
              : user
              ? 'Join This Round'
              : 'Create Account & Join'
          }
          onPress={handleJoin}
          loading={isJoining}
          fullWidth
          size="lg"
        />
        {user && (
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Not now</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bgLight },
  scroll: { paddingBottom: 48 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.lg,
    backgroundColor: Colors.bgLight,
  },
  loadingText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    marginTop: Spacing.md,
  },
  errorEmoji: { fontSize: 48 },
  errorTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.textDark,
  },
  errorSub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    textAlign: 'center',
  },
  header: {
    backgroundColor: Colors.greenDeep,
    padding: Spacing.xxxl,
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  roundName: {
    fontFamily: Fonts.displayBold,
    fontSize: 28,
    color: Colors.white,
    textAlign: 'center',
  },
  creatorLine: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  creatorName: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginTop: -20,
    borderRadius: Radius.xl,
    ...Shadow.card,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: {
    fontFamily: Fonts.mono,
    fontSize: 15,
    color: Colors.greenDeep,
  },
  statLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: Colors.textMed,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  detailsCard: { margin: Spacing.xl, gap: Spacing.sm },
  sectionTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  detailLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
  },
  detailValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  howCard: { marginHorizontal: Spacing.xl, marginTop: 0 },
  howText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    lineHeight: 22,
  },
  privacyRow: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  privacyText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.greenDeep,
    lineHeight: 20,
  },
  ctaArea: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  authNote: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    textAlign: 'center',
  },
  cancelBtn: { alignSelf: 'center' },
  cancelText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textMed,
  },
});
