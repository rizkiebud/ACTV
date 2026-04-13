export const colors = {
  // Background
  primary: '#0A1628',
  secondary: '#0D1F35',
  card: '#112240',
  cardLight: '#1A2F4E',
  cardBorder: '#1E3A5F',

  // Interactive
  accent: '#00D4FF',
  accentDark: '#0099BB',
  accentLight: 'rgba(0,212,255,0.15)',

  // Status
  success: '#00C853',
  successLight: 'rgba(0,200,83,0.15)',
  warning: '#FFB300',
  warningLight: 'rgba(255,179,0,0.15)',
  danger: '#F44336',
  dangerLight: 'rgba(244,67,54,0.15)',
  info: '#29B6F6',
  infoLight: 'rgba(41,182,246,0.15)',

  // Camera Status
  live: '#F44336',
  liveLight: 'rgba(244,67,54,0.15)',
  recording: '#00C853',
  recordingLight: 'rgba(0,200,83,0.15)',
  offline: '#546E7A',
  offlineLight: 'rgba(84,110,122,0.15)',
  motion: '#FFB300',
  motionLight: 'rgba(255,179,0,0.15)',
  battery: '#FF5722',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8FA8C8',
  textMuted: '#4A6080',
  textInverse: '#0A1628',

  // Input
  input: '#0D1F35',
  inputBorder: '#1E3A5F',
  inputFocus: '#00D4FF',

  // Overlay
  overlay: 'rgba(10,22,40,0.85)',
  overlayLight: 'rgba(10,22,40,0.6)',

  // Tab
  tabActive: '#00D4FF',
  tabInactive: '#4A6080',
  tabBg: '#0D1F35',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const fontSizes = {
  xxs: 9,
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 36,
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#00D4FF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

export default {colors, spacing, fontSizes, fontWeights, borderRadius, shadows};
