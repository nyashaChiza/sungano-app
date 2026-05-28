import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// Simple emoji-based icon set
const ICONS: Record<string, string> = {
  home: '🏠',
  rounds: '🔄',
  goals: '🎯',
  profile: '👤',
  plus: '+',
  check: '✓',
  chevronRight: '›',
  chevronLeft: '‹',
  chevronDown: '∨',
  camera: '📷',
  upload: '⬆️',
  money: '💰',
  calendar: '📅',
  clock: '⏰',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  copy: '📋',
  share: '📤',
  edit: '✏️',
  delete: '🗑️',
  lock: '🔒',
  shield: '🛡️',
  star: '⭐',
  trophy: '🏆',
  fire: '🔥',
  celebration: '🎉',
  group: '👥',
  solo: '👤',
  bank: '🏦',
  receipt: '🧾',
  phone: '📱',
  email: '📧',
  notification: '🔔',
  settings: '⚙️',
  logout: '🚪',
  info: 'ℹ️',
  close: '✕',
  search: '🔍',
};

export default function Icon({ name, size = 20, color }: IconProps) {
  const icon = ICONS[name] || '•';
  return (
    <Text style={[styles.icon, { fontSize: size, color }]}>
      {icon}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
