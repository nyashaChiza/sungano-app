import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect, Path } from 'react-native-svg';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Your round, your rules',
    body: 'Set up a rotating savings circle with people you trust. Everyone contributes, everyone benefits — in order.',
    illustration: 'circle',
  },
  {
    id: 2,
    title: 'Every payment on record',
    body: 'Submit proof for every contribution. Your group stays informed, disputes stay resolved, trust stays intact.',
    illustration: 'ledger',
  },
  {
    id: 3,
    title: 'Build your reputation',
    body: 'Every on-time payment grows your Trust Score. Open doors to bigger rounds and better groups.',
    illustration: 'celebrate',
  },
];

function CircleIllustration() {
  return (
    <Svg width={180} height={160} viewBox="0 0 180 160">
      <Circle cx={90} cy={80} r={55} fill="none" stroke={Colors.greenDeep} strokeWidth={2} opacity={0.3} />
      <Circle cx={90} cy={80} r={40} fill="none" stroke={Colors.greenDeep} strokeWidth={2} opacity={0.5} />
      {[0, 1, 2, 3, 4].map(i => {
        const angle = (i * 72 - 90) * (Math.PI / 180);
        const x = 90 + 55 * Math.cos(angle);
        const y = 80 + 55 * Math.sin(angle);
        return (
          <Circle key={i} cx={x} cy={y} r={12} fill={Colors.greenDeep} opacity={0.8} />
        );
      })}
      <Circle cx={90} cy={80} r={16} fill={Colors.greenAction} />
    </Svg>
  );
}

function LedgerIllustration() {
  return (
    <Svg width={180} height={160} viewBox="0 0 180 160">
      <Rect x={30} y={20} width={120} height={130} rx={10} fill={Colors.white} stroke={Colors.greenSubtle} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map(i => (
        <React.Fragment key={i}>
          <Rect x={45} y={45 + i * 20} width={8} height={8} rx={2} fill={i < 3 ? Colors.greenConfirm : Colors.border} />
          <Rect x={62} y={46 + i * 20} width={60} height={6} rx={3} fill={Colors.bgLight} />
          <Rect x={130} y={46 + i * 20} width={15} height={6} rx={3} fill={i < 3 ? Colors.greenPale : Colors.bgLight} />
        </React.Fragment>
      ))}
    </Svg>
  );
}

function CelebrateIllustration() {
  return (
    <Svg width={180} height={160} viewBox="0 0 180 160">
      <Circle cx={90} cy={80} r={45} fill={Colors.greenPale} />
      <Circle cx={90} cy={80} r={32} fill={Colors.greenDeep} />
      <Circle cx={75} cy={72} r={4} fill={Colors.white} />
      <Path d="M78 90 Q90 100 102 90" stroke={Colors.white} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {['#F59E0B', '#2ECC71', '#EF4444', '#3B82F6'].map((color, i) => {
        const angle = (i * 90 - 45) * (Math.PI / 180);
        const x = 90 + 52 * Math.cos(angle);
        const y = 80 + 52 * Math.sin(angle);
        return <Circle key={i} cx={x} cy={y} r={5} fill={color} />;
      })}
    </Svg>
  );
}

const ILLUSTRATIONS = {
  circle: CircleIllustration,
  ledger: LedgerIllustration,
  celebrate: CelebrateIllustration,
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      onComplete();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={onComplete}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {SLIDES.map(slide => {
          const Illustration = ILLUSTRATIONS[slide.illustration as keyof typeof ILLUSTRATIONS];
          return (
            <View key={slide.id} style={[styles.slide, { width }]}>
              <View style={styles.illustrationCard}>
                <Illustration />
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.body}>{slide.body}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <Button
          label={isLast ? 'Get Started' : 'Next'}
          onPress={goToNext}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  skip: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.textMed,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  illustrationCard: {
    width: 240,
    height: 220,
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: Colors.greenSubtle,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 34,
  },
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 16,
    color: Colors.textMed,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.greenDeep,
  },
});
