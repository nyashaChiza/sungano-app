import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface RingsPatternProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

export default function RingsPattern({
  width = 300,
  height = 200,
  color = '#FFFFFF',
  opacity = 0.08,
}: RingsPatternProps) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {/* Large background rings */}
      <Circle cx={width * 0.8} cy={height * 0.3} r={80} fill="none" stroke={color} strokeWidth={2} opacity={opacity} />
      <Circle cx={width * 0.8 - 40} cy={height * 0.6} r={80} fill="none" stroke={color} strokeWidth={2} opacity={opacity} />
      <Circle cx={width * 0.8 + 40} cy={height * 0.6} r={80} fill="none" stroke={color} strokeWidth={2} opacity={opacity} />
      {/* Medium rings left side */}
      <Circle cx={width * 0.1} cy={height * 0.2} r={45} fill="none" stroke={color} strokeWidth={1.5} opacity={opacity * 0.7} />
      <Circle cx={width * 0.05} cy={height * 0.5} r={45} fill="none" stroke={color} strokeWidth={1.5} opacity={opacity * 0.7} />
      <Circle cx={width * 0.2} cy={height * 0.5} r={45} fill="none" stroke={color} strokeWidth={1.5} opacity={opacity * 0.7} />
      {/* Small rings center */}
      <Circle cx={width * 0.5} cy={height * 0.1} r={25} fill="none" stroke={color} strokeWidth={1} opacity={opacity * 0.5} />
      <Circle cx={width * 0.42} cy={height * 0.25} r={25} fill="none" stroke={color} strokeWidth={1} opacity={opacity * 0.5} />
      <Circle cx={width * 0.58} cy={height * 0.25} r={25} fill="none" stroke={color} strokeWidth={1} opacity={opacity * 0.5} />
    </Svg>
  );
}
