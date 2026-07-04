import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../../../src/constants/theme';
import { useGoals } from '../../../src/hooks/useGoals';
import GoalCard from '../../../src/components/goals/GoalCard';

export default function GoalsTab() {
  const { goals, isLoading, fetchGoals } = useGoals();
  const router = useRouter();

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>My Goals</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(app)/goals/create')}
            >
              <Ionicons name="add-circle" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {isLoading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.greenDeep} />
        </View>
      ) : goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No goals yet</Text>
          <Text style={styles.emptyMessage}>
            Start saving toward something — solo or with a group.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(app)/goals/create')}
          >
            <Text style={styles.emptyButtonText}>Create a Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => router.push({ pathname: '/(app)/goals/[id]', params: { id: goal.id } })}
            />
          ))}
          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 28, color: Colors.white },
  createButton: { padding: Spacing.sm },
  list: { padding: Spacing.lg },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.textDark,
    marginTop: Spacing.lg,
  },
  emptyMessage: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  emptyButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
