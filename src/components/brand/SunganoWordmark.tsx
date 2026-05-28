import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Fonts, Colors } from '../../constants/theme';

interface SunganoWordmarkProps {
  color?: string;
  size?: number;
}

export default function SunganoWordmark({
  color = Colors.white,
  size = 32,
}: SunganoWordmarkProps) {
  return (
    <Text style={[styles.wordmark, { color, fontSize: size }]}>
      Sungano
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontFamily: Fonts.displayBold,
    letterSpacing: -0.5,
  },
});
