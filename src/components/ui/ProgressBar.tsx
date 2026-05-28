import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

interface ProgressBarProps {
  value: number;
  max: number;
  height?: number;
  fill?: string;
  track?: string;
  milestones?: number[];
}

export default function ProgressBar({
  value,
  max,
  height = 8,
  fill = Colors.greenDeep,
  track = Colors.greenSubtle,
  milestones = [],
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const progress = Math.min(value / max, 1);

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: progress,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.track, { height, backgroundColor: track, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: fill,
            borderRadius: height / 2,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
      {milestones.map((pos, i) => (
        <View
          key={i}
          style={[
            styles.milestone,
            {
              left: `${pos * 100}%` as any,
              height: height + 4,
              top: -2,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'visible',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  milestone: {
    position: 'absolute',
    width: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
    zIndex: 1,
  },
});
