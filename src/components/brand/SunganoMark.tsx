import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface SunganoMarkProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function SunganoMark({
  size = 100,
  color = '#FFFFFF',
  strokeWidth = 3,
}: SunganoMarkProps) {
  const scale = size / 100;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle
        cx={50}
        cy={35}
        r={22}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={0.9}
      />
      <Circle
        cx={33.5}
        cy={61}
        r={22}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={0.9}
      />
      <Circle
        cx={66.5}
        cy={61}
        r={22}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={0.9}
      />
    </Svg>
  );
}
