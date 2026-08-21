// Central design tokens — the RN equivalent of your CSS custom properties.
export const COLORS = {
  bg: '#FBF6F4',
  inkBold: '#2A1F25',
  paper: 'rgba(255,255,255,0.72)',
  paperStrong: 'rgba(255,255,255,0.92)',
  blush: '#F6C9D0',
  pink: '#EE93A8',
  deep: '#C65D7B',
  plum: '#5B3A4C',
  gold: '#D8A25A',
  online: '#7FA98A',
  offline: '#C97B5B',
  ink: '#3A2C33',
  inkSoft: '#7A6470',
  fujiImage: require('../../../assets/fuji.jpg'),

  // Status colors — QuizLayout.jsx references COLORS.success / COLORS.error
  // for correct/incorrect states, timer urgency, and exit-confirm actions.
  // These were previously undefined, which silently dropped those styles
  // (RN just ignores an undefined color value rather than erroring).
  success: '#6A9A6A',
  error: '#BC2934',

  // Japanese-vibe palette, added for the quiz completion screen + confetti.
  sakuraPink: '#FFB7C5',
  shrineRed: '#BC2934',
  bambooGreen: '#6A9A6A',
  paperCream: '#F8F7F0',

  // QuizLayout's primaryButton style references COLORS.actionPink with a
  // `?? COLORS.pink` fallback — defining it explicitly here instead of
  // relying on the fallback everywhere it's used.
  actionPink: '#EE93A8',
};

// Register these font family names via expo-font (see App.jsx).
// Swap for @expo-google-fonts packages if you'd rather not bundle .ttf files.
export const FONTS = {
  display: 'ShipporiMincho_600SemiBold',
  body: 'ZenMaruGothic_500Medium',
  mono: 'JetBrainsMono_600SemiBold',
};

export const BREAKPOINT_TABLET = 960;