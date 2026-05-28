import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Fonts } from '../../constants/theme';

interface GoalRingProps {
  currentAmount: number;
  targetAmount: number;
  currency: string;
  size?: number;
  strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function GoalRing({
  currentAmount,
  targetAmount,
  currency,
  size = 200,
  strokeWidth = 14,
}: GoalRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const progress = Math.min(currentAmount / targetAmount, 1);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const percentage = Math.round(progress * 100);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const formatCurrency = (amount: number) => {
    if (currency === 'NGN') return `₦${(amount / 1000).toFixed(0)}k`;
    return `${amount.toLocaleString()}`;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={Colors.greenDeep} />
            <Stop offset="100%" stopColor={Colors.greenAction} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={Colors.greenSubtle}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="url(#goalGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.percentage}>{percentage}%</Text>
        <Text style={styles.amount}>{formatCurrency(currentAmount)}</Text>
        <Text style={styles.label}>of {formatCurrency(targetAmount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontFamily: Fonts.displayBold,
    fontSize: 42,
    color: Colors.greenDeep,
    lineHeight: 48,
  },
  amount: {
    fontFamily: Fonts.mono,
    fontSize: 16,
    color: Colors.textDark,
    marginTop: 4,
  },
  label: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    marginTop: 2,
  },
});
