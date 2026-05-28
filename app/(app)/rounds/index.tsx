import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '../../../src/constants/theme';
import RoundCard from '../../../src/components/rounds/RoundCard';
import { useRounds } from '../../../src/hooks/useRounds';

export default function RoundsTab() {
  const { rounds } = useRounds();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Text style={styles.title}>My Rounds</Text>
        </SafeAreaView>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {rounds.map(round => (
          <RoundCard key={round.id} round={round} onPress={() => {}} />
        ))}
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
    paddingBottom: 24,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 28,
    color: Colors.white,
    paddingTop: Spacing.lg,
  },
  list: {
    padding: Spacing.xl,
  },
});
