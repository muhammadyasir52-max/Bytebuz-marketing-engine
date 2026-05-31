export const Colors = {
  // Background layers
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',

  // Brand
  primary: '#7C3AED',
  primaryLight: '#9D5FF5',
  primaryDark: '#5B21B6',
  secondary: '#3B82F6',
  secondaryLight: '#60A5FA',
  secondaryDark: '#1D4ED8',
  accent: '#10B981',
  accentLight: '#34D399',
  accentDark: '#059669',

  // Status
  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorDark: '#B91C1C',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  success: '#10B981',
  successLight: '#6EE7B7',
  info: '#3B82F6',

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0C0',
    muted: '#606080',
    inverse: '#0A0A1A',
    accent: '#7C3AED',
  },

  // Platform colors
  platforms: {
    instagram: {
      primary: '#E1306C',
      secondary: '#833AB4',
      gradient: ['#833AB4', '#C13584', '#E1306C', '#F77737'],
    },
    facebook: {
      primary: '#1877F2',
      secondary: '#0A5DC2',
      gradient: ['#1877F2', '#0A5DC2'],
    },
    linkedin: {
      primary: '#0A66C2',
      secondary: '#004182',
      gradient: ['#0A66C2', '#004182'],
    },
    twitter: {
      primary: '#000000',
      secondary: '#1A1A1A',
      gradient: ['#000000', '#1A1A1A'],
    },
    tiktok: {
      primary: '#FF0050',
      secondary: '#00F2EA',
      gradient: ['#FF0050', '#010101', '#00F2EA'],
    },
    youtube: {
      primary: '#FF0000',
      secondary: '#CC0000',
      gradient: ['#FF0000', '#CC0000'],
    },
  },

  // Gradients
  gradients: {
    primary: ['#7C3AED', '#3B82F6'],
    accent: ['#10B981', '#3B82F6'],
    dark: ['#0A0A1A', '#141428'],
    card: ['#1C1C35', '#141428'],
    purple: ['#7C3AED', '#5B21B6'],
    fire: ['#EF4444', '#F59E0B'],
  },

  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.5)',
    card: 'rgba(28, 28, 53, 0.8)',
  },

  // Utility
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  accent: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
};

export default Theme;
