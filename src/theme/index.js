export const COLORS = {
  bg: '#FBF6F4',
  inkBold: '#2A1F25',
  ink: '#3A2C33',
  inkSoft: '#7A6470',
  paper: 'rgba(255,255,255,0.7)',
  paperStrong: 'rgba(255,255,255,0.92)',
  glassBorder: 'rgba(255,255,255,0.6)',
  blush: '#F6C9D0',
  pink: '#EE93A8',
  actionPink: '#F5B7B1', // on-brand button color, per spec
  deep: '#C65D7B',
  plum: '#5B3A4C',
  gold: '#D8A25A',
  success: '#7FA98A',
  error: '#C0392B',
  errorBg: 'rgba(192,57,43,0.08)',
};

export const FONTS = {
  display: 'ShipporiMincho_600SemiBold',
  body: 'ZenMaruGothic_500Medium',
  mono: 'JetBrainsMono_600SemiBold',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

// Shared glassmorphism style object — reuse across auth + dashboard
export const GLASS = {
  backgroundColor: COLORS.paper,
  borderWidth: 1,
  borderColor: COLORS.glassBorder,
  borderRadius: RADIUS.lg,
  shadowColor: '#3A2C33',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius: 20,
  elevation: 6,
};