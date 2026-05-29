import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
  focused?: boolean;
}

const SW = 1.6; // stroke width base
const SW_ACTIVE = 2; // slightly bolder when active

export function HomeIcon({ color, size = 24, focused }: IconProps) {
  const sw = focused ? SW_ACTIVE : SW;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Roof */}
      <Path
        d="M3 10.5 L12 3 L21 10.5"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.12 : 0}
      />
      {/* Walls */}
      <Path
        d="M5 10.5 V20 H19 V10.5"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Door */}
      <Path
        d="M9.5 20 V14.5 H14.5 V20"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.18 : 0}
      />
    </Svg>
  );
}

export function RoundsIcon({ color, size = 24, focused }: IconProps) {
  const sw = focused ? SW_ACTIVE : SW;
  const op = focused ? 1 : 0.85;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Circle cx={50} cy={34} r={20} stroke={color} strokeWidth={sw * 5} opacity={op} />
      <Circle cx={33} cy={62} r={20} stroke={color} strokeWidth={sw * 5} opacity={op} />
      <Circle cx={67} cy={62} r={20} stroke={color} strokeWidth={sw * 5} opacity={op} />
    </Svg>
  );
}

export function GoalsIcon({ color, size = 24, focused }: IconProps) {
  const sw = focused ? SW_ACTIVE : SW;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Pole */}
      <Line x1={5} y1={3} x2={5} y2={21} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {/* Flag */}
      <Path
        d="M5 4 L19 8.5 L5 13 Z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.25 : 0}
      />
    </Svg>
  );
}

export function YouIcon({ color, size = 24, focused }: IconProps) {
  const sw = focused ? SW_ACTIVE : SW;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <Circle
        cx={12}
        cy={8}
        r={4}
        stroke={color}
        strokeWidth={sw}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.2 : 0}
      />
      {/* Shoulders */}
      <Path
        d="M4 21 C4 17 7.6 14 12 14 C16.4 14 20 17 20 21"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </Svg>
  );
}
