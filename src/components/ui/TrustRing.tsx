import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Fonts } from '../../constants/theme';

interface TrustRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  dark?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 85) return Colors.greenConfirm;
  if (score >= 70) return Colors.greenDeep;
  if (score >= 50) return Colors.amber;
  return Colors.red;
}

function getTierLabel(score: number): string {
  if (score >= 90) return 'Platinum';
  if (score >= 80) return 'Gold';
  if (score >= 65) return 'Silver';
  if (score >= 50) return 'Bronze';
  return 'New';
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function TrustRing({
  score,
  size = 80,
  strokeWidth = 6,
  showLabel = false,
  dark = false,
}: TrustRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const scoreColor = getScoreColor(score);
  const tierLabel = getTierLabel(score);
  const trackColor = dark ? 'rgba(255,255,255,0.15)' : Colors.greenPale;
  const textColor = dark ? Colors.white : scoreColor;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.score, { color: textColor, fontSize: size * 0.28 }]}>{score}</Text>
        {showLabel && (
          <Text style={[styles.tier, { fontSize: size * 0.13 }]}>{tierLabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: Fonts.displayBold,
    lineHeight: undefined,
  },
  tier: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.textMed,
    marginTop: 1,
  },
});
