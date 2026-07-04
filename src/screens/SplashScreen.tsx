import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import SunganoMark from '../components/brand/SunganoMark';
import RingsPattern from '../components/brand/RingsPattern';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start(() => {
      // Tagline fades in after logo
      Animated.timing(taglineFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });

    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <RingsPattern width={width} height={height} color={Colors.white} opacity={0.07} />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Mark only — matches the PDF splash exactly */}
        <SunganoMark size={96} color={Colors.white} strokeWidth={2.5} />
        {/* Wordmark as plain text to match Fraunces exactly */}
        <Text style={styles.wordmark}>Sungano</Text>
        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
          KEEP YOUR WORD.
        </Animated.Text>
      </Animated.View>

      {/* Three dot page indicator at bottom matching PDF */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  wordmark: {
    fontFamily: Fonts.displayBold,
    fontSize: 36,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  tagline: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 3,
    marginTop: 4,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 52,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.white,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
