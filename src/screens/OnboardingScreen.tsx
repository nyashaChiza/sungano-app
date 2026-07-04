import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect, Path, Ellipse } from 'react-native-svg';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');
const ILLUS_H = 220;

// ── Slide 1: group of abstract people in a circle ──────────────────────────
function GroupIllustration() {
  // 5 people around a circle — matches PDF onboarding-01
  const people = [
    { cx: 112, cy: 48 },  // top-centre (admin)
    { cx: 168, cy: 88 },  // right
    { cx: 152, cy: 158 }, // bottom-right
    { cx: 72,  cy: 158 }, // bottom-left
    { cx: 56,  cy: 88 },  // left
  ];
  return (
    <Svg width={224} height={200} viewBox="0 0 224 200">
      {/* subtle platform */}
      <Ellipse cx={112} cy={185} rx={70} ry={10} fill={Colors.greenSubtle} opacity={0.4} />
      {people.map((p, i) => (
        <React.Fragment key={i}>
          {/* body */}
          <Circle cx={p.cx} cy={p.cy + 22} r={12} fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} />
          {/* head */}
          <Circle cx={p.cx} cy={p.cy} r={8} fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} />
        </React.Fragment>
      ))}
    </Svg>
  );
}

// ── Slide 2: open ledger with a pen (proof on record) ──────────────────────
function LedgerIllustration() {
  return (
    <Svg width={200} height={180} viewBox="0 0 200 180">
      {/* Book left page */}
      <Rect x={20} y={30} width={70} height={120} rx={6} fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} />
      {/* Book right page */}
      <Rect x={90} y={30} width={90} height={120} rx={6} fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} />
      {/* Spine line */}
      <Line x1={90} y1={30} x2={90} y2={150} stroke={Colors.greenDeep} strokeWidth={1.8} />
      {/* Lines on left page */}
      {[55, 75, 95, 115].map(y => (
        <Line key={y} x1={32} y1={y} x2={78} y2={y} stroke={Colors.greenDeep} strokeWidth={1.5} opacity={0.5} />
      ))}
      {/* Lines on right page */}
      {[55, 75, 95, 115].map(y => (
        <Line key={y} x1={102} y1={y} x2={168} y2={y} stroke={Colors.greenDeep} strokeWidth={1.5} opacity={0.5} />
      ))}
      {/* Pen */}
      <Path
        d="M155 148 L175 120 L180 125 L160 153 Z"
        fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} strokeLinejoin="round"
      />
      <Path d="M155 148 L160 153" stroke={Colors.greenDeep} strokeWidth={1.8} />
    </Svg>
  );
}

// ── Slide 3: trust score — dots flying up from people ──────────────────────
function TrustIllustration() {
  return (
    <Svg width={200} height={180} viewBox="0 0 200 180">
      {/* Two abstract figures */}
      <Circle cx={68} cy={110} r={10} fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} />
      <Circle cx={68} cy={132} r={14} fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} />
      <Circle cx={132} cy={110} r={10} fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} />
      <Circle cx={132} cy={132} r={14} fill="none" stroke={Colors.greenDeep} strokeWidth={1.8} />
      {/* Floating dots — trust particles */}
      {[
        { cx: 60, cy: 80, r: 5 },
        { cx: 80, cy: 58, r: 4 },
        { cx: 100, cy: 48, r: 6 },
        { cx: 120, cy: 58, r: 4 },
        { cx: 140, cy: 72, r: 5 },
      ].map((d, i) => (
        <Circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="none" stroke={Colors.greenDeep} strokeWidth={1.5} />
      ))}
    </Svg>
  );
}

const SLIDES = [
  {
    id: 1,
    Illustration: GroupIllustration,
    title: 'Your round, your rules',
    body: 'Create a mukando with your group. Set the terms, generate a contract, and track every payment — in one place.',
  },
  {
    id: 2,
    Illustration: LedgerIllustration,
    title: 'Every payment on record',
    body: 'Upload proof of every deposit. The recipient confirms. The ledger never lies.',
  },
  {
    id: 3,
    Illustration: TrustIllustration,
    title: 'Build your reputation',
    body: 'Every round you complete builds your Trust Score. Show the group you keep your word.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentIndex(next);
    } else {
      onComplete();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Skip */}
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={onComplete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map(({ id, Illustration, title, body }) => (
          <View key={id} style={[styles.slide, { width }]}>
            {/* Illustration card — pale green rounded rect */}
            <View style={styles.illustrationCard}>
              <Illustration />
            </View>

            <View style={styles.textBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.body}>{body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer: dots + button */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
        <Button
          label={isLast ? 'Get started' : 'Next'}
          onPress={goToNext}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  skip: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.textMed,
  },
  slide: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  illustrationCard: {
    width: '100%',
    height: ILLUS_H,
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  textBlock: {
    width: '100%',
    gap: Spacing.md,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.textDark,
    lineHeight: 34,
  },
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.textMed,
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
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.greenDeep,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.border,
  },
});
