import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../../../src/constants/theme';
import { useRounds } from '../../../src/hooks/useRounds';
import { PaymentBoard } from '../../../src/components/rounds/PaymentBoard';
import Button from '../../../src/components/ui/Button';
import { Money } from '../../../src/components/ui/Money';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';

export default function RoundDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentRound, fetchRound, isLoading, recordPayment } = useRounds();

  useEffect(() => {
    if (id) {
      fetchRound(id);
    }
  }, [id]);

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid round ID</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.greenDeep} />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentRound) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.textLight} />
          <Text style={styles.errorText}>Round not found</Text>
          <Button
            label="Go Back"
            onPress={() => router.back()}
            variant="primary"
            size="lg"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleRecordPayment = async () => {
    router.push(`/rounds/${id}/payment`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.roundName}>{currentRound.name}</Text>
          <StatusBadge status={currentRound.status as any} size="sm" />
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Contribution</Text>
            <Money amount={currentRound.contribution_amount} currency={currentRound.currency} />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frequency</Text>
            <Text style={styles.summaryValue}>{currentRound.frequency}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Members</Text>
            <Text style={styles.summaryValue}>{currentRound.number_of_members}</Text>
          </View>
        </View>

        {/* Payment Board */}
        {currentRound.current_cycle && (
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Status</Text>
            <PaymentBoard cycle={currentRound.current_cycle} />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            label="Record My Payment"
            onPress={handleRecordPayment}
            fullWidth
            size="lg"
            style={styles.actionButton}
          />
          <TouchableOpacity style={styles.detailLink}>
            <Text style={styles.detailLinkText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.greenDeep} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
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
    gap: Spacing.xs,
  },
  roundName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.white,
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  summaryCard: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
  },
  summaryValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  paymentSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: Spacing.lg,
  },
  actionsSection: {
    gap: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  detailLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  detailLinkText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.greenDeep,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginVertical: Spacing.lg,
  },
  errorButton: {
    marginTop: Spacing.lg,
  },
});
