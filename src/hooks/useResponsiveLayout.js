import { useWindowDimensions } from 'react-native';

const BREAKPOINTS = {
  mobile: 480,
  tablet: 720,
  desktop: 1024,
};

/**
 * Shared responsive breakpoint hook — single source of truth for
 * mobile/tablet/desktop detection across the whole app (dashboard, quiz, auth).
 */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;
  const isCompact = width < BREAKPOINTS.tablet; // mobile + tablet combined

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isCompact,
    breakpoints: BREAKPOINTS,
  };
}