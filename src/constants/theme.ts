export const Colors = {
  greenDeep: '#1A7A4A',
  greenAction: '#2ECC71',
  greenPale: '#E8F8F0',
  greenSubtle: '#C6EDD8',
  greenConfirm: '#10B981',
  textDark: '#1C1C1E',
  textMed: '#6B7280',
  textLight: '#9CA3AF',
  bgLight: '#F3F4F6',
  amber: '#F59E0B',
  amberBg: '#FEF3C7',
  red: '#EF4444',
  redBg: '#FEE2E2',
  border: '#E5E7EB',
  white: '#FFFFFF',
} as const;

export const Fonts = {
  displayBold: 'Fraunces_700Bold',
  displaySemiBold: 'Fraunces_600SemiBold',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  pill: 100,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;
