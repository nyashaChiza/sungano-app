import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { HomeIcon, RoundsIcon, GoalsIcon, YouIcon } from '../components/icons/TabIcons';

export type TabName = 'home' | 'rounds' | 'goals' | 'profile';

interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const TABS: Array<{ name: TabName; label: string }> = [
  { name: 'home',    label: 'Home' },
  { name: 'rounds',  label: 'Rounds' },
  { name: 'goals',   label: 'Goals' },
  { name: 'profile', label: 'You' },
];

function TabIcon({ name, color, focused }: { name: TabName; color: string; focused: boolean }) {
  switch (name) {
    case 'home':    return <HomeIcon   color={color} size={24} focused={focused} />;
    case 'rounds':  return <RoundsIcon color={color} size={24} focused={focused} />;
    case 'goals':   return <GoalsIcon  color={color} size={24} focused={focused} />;
    case 'profile': return <YouIcon    color={color} size={24} focused={focused} />;
  }
}

export default function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.name;
        const color = isActive ? Colors.greenDeep : Colors.textLight;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={[styles.tabInner, isActive && styles.tabInnerActive]}>
              <TabIcon name={tab.name} color={color} focused={isActive} />
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
