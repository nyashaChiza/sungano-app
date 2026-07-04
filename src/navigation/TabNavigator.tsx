import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { HomeIcon, RoundsIcon, GoalsIcon, YouIcon } from '../components/icons/TabIcons';

export type TabName = 'home' | 'rounds' | 'goals' | 'profile';

interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const TABS: Array<{ name: TabName; label: string }> = [
  { name: 'home',    label: 'Home'   },
  { name: 'rounds',  label: 'Rounds' },
  { name: 'goals',   label: 'Goals'  },
  { name: 'profile', label: 'You'    },
];

function TabIcon({ name, color, focused }: { name: TabName; color: string; focused: boolean }) {
  switch (name) {
    case 'home':    return <HomeIcon   color={color} size={22} focused={focused} />;
    case 'rounds':  return <RoundsIcon color={color} size={22} focused={focused} />;
    case 'goals':   return <GoalsIcon  color={color} size={22} focused={focused} />;
    case 'profile': return <YouIcon    color={color} size={22} focused={focused} />;
  }
}

export default function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map(tab => {
        const focused = activeTab === tab.name;
        const color   = focused ? Colors.greenDeep : Colors.textLight;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.75}
            style={styles.tab}
          >
            <TabIcon name={tab.name} color={color} focused={focused} />
            <Text style={[styles.label, focused && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingBottom: 20, // safe area pad
  },
  tab:   { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontFamily: Fonts.bodyRegular, fontSize: 10, color: Colors.textLight },
  labelActive: { fontFamily: Fonts.bodySemiBold, color: Colors.greenDeep },
});
