import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';

export type TabName = 'home' | 'rounds' | 'goals' | 'profile';

interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const TABS: Array<{ name: TabName; label: string; emoji: string }> = [
  { name: 'home', label: 'Home', emoji: '🏠' },
  { name: 'rounds', label: 'Rounds', emoji: '🔄' },
  { name: 'goals', label: 'Goals', emoji: '🎯' },
  { name: 'profile', label: 'You', emoji: '👤' },
];

export default function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={[styles.tabInner, isActive && styles.tabInnerActive]}>
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    gap: 2,
  },
  tabInnerActive: {
    backgroundColor: Colors.greenPale,
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 10,
    color: Colors.textLight,
  },
  tabLabelActive: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.greenDeep,
  },
});
