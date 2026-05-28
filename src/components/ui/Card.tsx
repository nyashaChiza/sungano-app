import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  bg?: string;
  elevated?: boolean;
}

export default function Card({
  children,
  onPress,
  style,
  padding = 16,
  bg = Colors.white,
  elevated = true,
}: CardProps) {
  const content = (
    <View style={[
      styles.card,
      { padding, backgroundColor: bg },
      elevated && Shadow.card,
      style,
    ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
