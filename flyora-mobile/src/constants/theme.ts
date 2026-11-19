import { Platform } from 'react-native';

export const FlyoraColors = {
  // Official Flyorago Reference Brand Palette
  primary: '#089A8D',
  primaryDark: '#066B65',
  primaryDeep: '#044C47',
  primaryLight: '#0CAEA0',
  primaryGradientStart: '#089A8D',
  primaryGradientEnd: '#067E74',

  // Mint & Soft Accents
  mint: '#CCF5EF',
  mintSoft: '#E6FAF6',
  mintLight: '#F3FCFA',
  mintBorder: '#D4F2EC',

  // Neutrals & Surfaces
  white: '#FFFFFF',
  offWhite: '#F7FCFB',
  background: '#F6FBF9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderMint: '#D4F2EC',
  borderSubtle: '#F1F5F9',
  borderStrong: '#CBD5E1',

  // Typography Colors
  textNavy: '#062738',
  textDark: '#0B2521',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  textPlaceholder: '#94A3B8',

  // Status & Accents
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',
  info: '#089A8D',

  // Legacy mappings for backwards-compatibility
  navy: '#062738',
  navyLight: '#0B3B36',
  navyMedium: '#0A2540',
  navyDark: '#041B18',
  teal: '#089A8D',
  tealLight: '#0CAEA0',
  tealBright: '#2DD4BF',
  tealDark: '#066B65',
  tealSubtle: '#F0FDFA',
  blue: '#089A8D',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#062738',
} as const;

export const Colors = {
  light: {
    text: FlyoraColors.textNavy,
    textSecondary: FlyoraColors.textMuted,
    background: FlyoraColors.background,
    surface: FlyoraColors.surface,
    backgroundElement: FlyoraColors.mintSoft,
    backgroundSelected: FlyoraColors.mint,
    primary: FlyoraColors.primary,
    primaryNavy: FlyoraColors.textNavy,
    accent: FlyoraColors.primary,
    border: FlyoraColors.border,
  },
  dark: {
    text: FlyoraColors.white,
    textSecondary: FlyoraColors.gray400,
    background: '#041B18',
    surface: '#0A2540',
    backgroundElement: '#066B65',
    backgroundSelected: '#089A8D',
    primary: FlyoraColors.tealBright,
    primaryNavy: FlyoraColors.textNavy,
    accent: FlyoraColors.primaryLight,
    border: '#0B3B36',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = {
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
  pill: 26,
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#089A8D',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#062738',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
  cardHover: Platform.select({
    ios: {
      shadowColor: '#089A8D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    default: {},
  }),
  tealGlow: Platform.select({
    ios: {
      shadowColor: '#089A8D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },
    android: { elevation: 3 },
    default: {},
  }),
};

export const BottomTabInset = Platform.select({ ios: 28, android: 16 }) ?? 16;
export const MaxContentWidth = 768;
