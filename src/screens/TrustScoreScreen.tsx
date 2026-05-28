import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrustScore } from '../types';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import TrustRing from '../components/ui/TrustRing';

interface TrustScoreScreenProps {
  trustScore: TrustScore;
  userName: string;
  onBack: () => void;
}

const TIER_CONFIG = {
  platinum: { color: '#E5E4E2', label: 'Platinum', minScore: 90 },
  gold: { color: '#F59E0B', label: 'Gold', minScore: 80 },
  silver: { color: '#9CA3AF', label: 'Silver', minScore: 65 },
  bronze: { color: '#CD7F32', label: 'Bronze', minScore: 50 },
  new: { color: Colors.bgLight, label: 'New', minScore: 0 },
};

function getScoreChange(entries: TrustScore['history']) {
  if (entries.length < 2) return 0;
  return entries[0].score - entries[1].score;
}

export default function TrustScoreScreen({ trustScore, userName, onBack }: TrustScoreScreenProps) {
  const tier = TIER_CONFIG[trustScore.tier];
  const scoreChange = getScoreChange(trustScore.history);
  const onTimeRate = Math.round((trustScore.onTimePayments / trustScore.totalPayments) * 100);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Trust Score</Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Score Ring */}
          <View style={styles.scoreCard}>
            <TrustRing score={trustScore.score} size={160} strokeWidth={12} showLabel />
            <View style={styles.tierBadge}>
              <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
              <Text style={styles.tierLabel}>{tier.label} Member</Text>
            </View>
            {scoreChange !== 0 && (
              <Text style={[styles.change, { color: scoreChange > 0 ? Colors.greenConfirm : Colors.red }]}>
                {scoreChange > 0 ? '+' : ''}{scoreChange} this month
              </Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: Colors.greenPale }]}>
              <Text style={styles.statValue}>{trustScore.onTimePayments}</Text>
              <Text style={styles.statLabel}>On-time payments</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: Colors.bgLight }]}>
              <Text style={styles.statValue}>{trustScore.totalPayments}</Text>
              <Text style={styles.statLabel}>Total payments</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: onTimeRate >= 90 ? Colors.greenPale : Colors.amberBg }]}>
              <Text style={[styles.statValue, { color: onTimeRate >= 90 ? Colors.greenDeep : Colors.amber }]}>
                {onTimeRate}%
              </Text>
              <Text style={styles.statLabel}>On-time rate</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: trustScore.defaultCount > 0 ? Colors.redBg : Colors.greenPale }]}>
              <Text style={[styles.statValue, { color: trustScore.defaultCount > 0 ? Colors.red : Colors.greenConfirm }]}>
                {trustScore.defaultCount}
              </Text>
              <Text style={styles.statLabel}>Defaults</Text>
            </View>
          </View>

          {/* What affects your score */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How your score is calculated</Text>
            {[
              { label: 'On-time payments', impact: '+1 point each', color: Colors.greenConfirm },
              { label: 'Late payment (1-7 days)', impact: '-2 points', color: Colors.amber },
              { label: 'Grace period payment', impact: '-3 points', color: Colors.amber },
              { label: 'Default', impact: '-15 points', color: Colors.red },
              { label: 'Confirmed by recipient', impact: '+1 bonus', color: Colors.greenDeep },
            ].map((item, i) => (
              <View key={i} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={[styles.infoImpact, { color: item.color }]}>{item.impact}</Text>
              </View>
            ))}
          </View>

          {/* History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            {trustScore.history.map((entry, i) => (
              <View key={i} style={styles.historyRow}>
                <View style={[
                  styles.historyDot,
                  { backgroundColor: entry.delta > 0 ? Colors.greenConfirm : Colors.red },
                ]} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyEvent}>{entry.event}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(entry.date).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={[styles.historyDelta, { color: entry.delta > 0 ? Colors.greenConfirm : Colors.red }]}>
                  {entry.delta > 0 ? '+' : ''}{entry.delta}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    fontSize: 28,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  body: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  scoreCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.card,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  change: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.textDark,
  },
  statLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: Colors.textMed,
    marginTop: 3,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    flex: 1,
  },
  infoImpact: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
  },
  historySection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyEvent: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textDark,
  },
  historyDate: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: 1,
  },
  historyDelta: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
  },
});
