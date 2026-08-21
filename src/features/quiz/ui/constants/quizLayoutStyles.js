import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export const quizLayoutStyles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(251,246,244,0.5)' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },

  card: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: COLORS.paperStrong,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    padding: 28,
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 6,
    ...Platform.select({ web: { backdropFilter: 'blur(18px)' }, default: {} }),
  },
  cardCompact: { padding: 18, borderRadius: 18 },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' },

  title: { fontFamily: FONTS.display, fontSize: 22, fontWeight: '700', color: COLORS.deep, textAlign: 'center' },
  prompt: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center', marginTop: 6, marginBottom: 18 },

  questionBody: { marginBottom: 12 },

  actionsRow: { marginTop: 16, alignItems: 'center' },
  primaryButton: { backgroundColor: COLORS.actionPink ?? COLORS.pink, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 36, minWidth: 200, alignItems: 'center', ...Platform.select({ web: { cursor: 'pointer' } }) },
  primaryButtonText: { fontFamily: FONTS.display, fontSize: 16, fontWeight: '700', color: COLORS.inkBold },
  disabledButton: { opacity: 0.5, ...Platform.select({ web: { cursor: 'not-allowed' } }) },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.bg },
  emptyText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.inkSoft, textAlign: 'center', marginBottom: 16 },
  backButton: { borderWidth: 1.5, borderColor: COLORS.pink, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 24 },
  backButtonText: { fontFamily: FONTS.display, fontSize: 14, fontWeight: '700', color: COLORS.deep },

  chooserSubtitle: {
    fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft,
    textAlign: 'center', marginTop: 6, marginBottom: 20,
  },
  chooserBackLink: { alignSelf: 'center', marginTop: 8 },
  chooserBackLinkText: { fontFamily: FONTS.body, fontSize: 14, fontWeight: '700', color: COLORS.plum },
  practiceFooter: { marginTop: 8, alignItems: 'center', gap: 12 },
  readyButton: {
    backgroundColor: COLORS.actionPink ?? COLORS.pink, borderRadius: 999,
    paddingVertical: 12, paddingHorizontal: 28,
  },
  readyButtonText: { fontFamily: FONTS.display, fontSize: 14, fontWeight: '700', color: COLORS.inkBold },

  exitBtn: {
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.3)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  exitBtnText: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '600', color: COLORS.plum },
});