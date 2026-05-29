import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { Avatar } from '../../src/components/ui/Avatar';
import { TrustRing } from '../../src/components/ui/TrustRing';
import Button from '../../src/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const trustScore = 87; // Mock value

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.profileHeader}>
            <Avatar size={80} name={user.full_name} photoUrl={user.profile_photo_url} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.full_name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <Text style={styles.profilePhone}>{user.phone}</Text>
            </View>
          </View>
        </View>

        {/* Trust Ring Section */}
        <View style={[styles.card, styles.trustCard]}>
          <Text style={styles.cardTitle}>Your Trust Score</Text>
          <View style={styles.trustContainer}>
            <TrustRing score={trustScore} size={140} />
          </View>
          <View style={styles.trustStatsContainer}>
            <View style={styles.trustStat}>
              <Text style={styles.trustStatValue}>87%</Text>
              <Text style={styles.trustStatLabel}>On-time payments</Text>
            </View>
            <View style={styles.trustStat}>
              <Text style={styles.trustStatValue}>12</Text>
              <Text style={styles.trustStatLabel}>Rounds completed</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.trustBreakdownBtn}>
            <Text style={styles.trustBreakdownText}>View detailed breakdown</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.greenDeep} />
          </TouchableOpacity>
        </View>

        {/* Payout Accounts Section */}
        <View style={[styles.card, styles.accountCard]}>
          <View style={styles.accountHeader}>
            <Text style={styles.cardTitle}>Payout Accounts</Text>
            <TouchableOpacity>
              <Ionicons name="add" size={24} color={Colors.greenDeep} />
            </TouchableOpacity>
          </View>
          <View style={styles.accountItem}>
            <Ionicons name="card" size={24} color={Colors.greenDeep} />
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>Primary Bank Account</Text>
              <Text style={styles.accountDetails}>Access Bank • 0123456789</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={Colors.greenConfirm} />
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.card, styles.settingsCard]}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive alerts for payments & updates</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.bgLight, true: Colors.greenPale }}
              thumbColor={notificationsEnabled ? Colors.greenDeep : Colors.textLight}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="document-text" size={20} color={Colors.textMed} />
            <Text style={styles.actionText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="help-circle" size={20} color={Colors.textMed} />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="information-circle" size={20} color={Colors.textMed} />
            <Text style={styles.actionText}>About</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          label="Logout"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          size="lg"
          style={styles.logoutBtn}
        />

        <View style={styles.spacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 28,
    color: Colors.textDark,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  profileCard: {
    marginBottom: Spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    marginBottom: Spacing.xs,
  },
  profilePhone: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
  },
  trustCard: {
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: Spacing.lg,
  },
  trustContainer: {
    marginBottom: Spacing.xl,
  },
  trustStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  trustStat: {
    alignItems: 'center',
  },
  trustStatValue: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.greenDeep,
  },
  trustStatLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: Spacing.xs,
  },
  trustBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  trustBreakdownText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.greenDeep,
  },
  accountCard: {
    marginBottom: Spacing.lg,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  accountDetails: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: Spacing.xs,
  },
  settingsCard: {
    marginBottom: Spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingLabel: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  settingDesc: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textMed,
    marginTop: Spacing.xs,
  },
  actionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  actionText: {
    flex: 1,
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textDark,
  },
  logoutBtn: {
    marginBottom: Spacing.lg,
  },
  spacing: {
    height: Spacing.lg,
  },
});

