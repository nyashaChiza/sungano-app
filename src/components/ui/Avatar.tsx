import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  trustScore?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    '#1A7A4A', '#2ECC71', '#10B981', '#F59E0B',
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ name, avatarUrl, size = 40, trustScore }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  const fontSize = size * 0.35;
  const ringColor = trustScore !== undefined
    ? trustScore >= 85 ? Colors.greenConfirm
    : trustScore >= 70 ? Colors.greenDeep
    : trustScore >= 50 ? Colors.amber
    : Colors.red
    : 'transparent';

  return (
    <View style={[
      styles.container,
      { width: size, height: size, borderRadius: size / 2 },
      trustScore !== undefined && { borderWidth: 2, borderColor: ringColor },
    ]}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }}
        />
      ) : (
        <View style={[styles.initials, { backgroundColor: bgColor, width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}>
          <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  initials: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: Colors.white,
    fontFamily: Fonts.bodySemiBold,
  },
});
