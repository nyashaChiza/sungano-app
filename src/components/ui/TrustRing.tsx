import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Fonts } from '../../constants/theme';

interface TrustRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;  // shows "TRUST" label below score (component page variant)
  dark?: boolean;       // white track + white score — for green header
}

function scoreColor(score: number) {
  if (score >= 85) return Colors.greenConfirm;
  if (score >= 70) return Colors.greenDeep;
  if (score >= 50) return Colors.amber;
  return Colors.red;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function TrustRing({ score, size = 88, strokeWidth = 6, showLabel = false, dark = false }: TrustRingProps) {
  const animVal  = useRef(new Animated.Value(0)).current;
  const radius   = (size - strokeWidth * 2) / 2;
  const circ     = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const fillColor  = dark ? Colors.white        : scoreColor(score);
  const trackColor = dark ? 'rgba(255,255,255,0.18)' : Colors.greenPale;
  const textColor  = dark ? Colors.white        : scoreColor(score);

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: score / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = animVal.interpolate({
    inputRange:  [0, 1],
    outputRange: [circ, 0],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        {/* Fill */}
        <AnimatedCircle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      {/* Centre text */}
      <View style={styles.center}>
        <Text style={[styles.score, { color: textColor, fontSize: size * 0.30 }]}>{score}</Text>
        {showLabel && <Text style={styles.trustLabel}>TRUST</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:       { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  center:     { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  score:      { fontFamily: Fonts.displayBold, lineHeight: undefined },
  trustLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.textMed, letterSpacing: 0.5, marginTop: 1 },
});
