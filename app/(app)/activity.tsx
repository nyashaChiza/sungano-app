import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../../src/constants/theme';
import { useNotificationsStore } from '../../src/store/notificationsStore';

export default function ActivityScreen() {
  const { notifications, fetchNotifications, markAllRead } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'payment_due':
        return 'alert-circle';
      case 'payment_received':
        return 'checkmark-circle';
      case 'round_started':
        return 'play-circle';
      case 'goal_completed':
        return 'trophy';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'payment_due':
        return Colors.amber;
      case 'payment_received':
        return Colors.greenConfirm;
      case 'round_started':
        return Colors.greenDeep;
      case 'goal_completed':
        return Colors.greenAction;
      default:
        return Colors.textMed;
    }
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '20' }]}>
        <Ionicons name={getIconName(item.type)} size={24} color={getIconColor(item.type)} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleDateString()} at{' '}
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </View>
  );

  const emptyState = (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={64} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyMessage}>Your activity will appear here</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllLink}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled
        ListEmptyComponent={emptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 28,
    color: Colors.textDark,
  },
  markAllLink: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.greenDeep,
  },
  listContent: {
    paddingVertical: Spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  message: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    marginBottom: Spacing.xs,
  },
  timestamp: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.greenAction,
    marginLeft: Spacing.sm,
    marginTop: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textDark,
    marginTop: Spacing.lg,
  },
  emptyMessage: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    marginTop: Spacing.sm,
  },
});
