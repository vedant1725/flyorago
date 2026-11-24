import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard design canvas base (iPhone 13 / 14 / modern Android typical width)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale horizontal size proportionally based on screen width
 */
export const scale = (size: number): number => {
  const ratio = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * ratio;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scale vertical size proportionally based on screen height
 */
export const verticalScale = (size: number): number => {
  const ratio = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * ratio;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scale with factor to prevent over-stretching on tablets or large screens
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return Math.round(size + (scale(size) - size) * factor);
};

/**
 * Responsive font scaler that respects accessibility font scale limits
 */
export const fontScale = (size: number): number => {
  const fontRatio = PixelRatio.getFontScale();
  // Bound max font scaling so UI never breaks on devices with huge text settings
  const safeFontRatio = Math.min(Math.max(fontRatio, 0.85), 1.25);
  return Math.round(moderateScale(size, 0.35) * safeFontRatio);
};

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768,
  isTablet: SCREEN_WIDTH >= 768,
};

/**
 * Universal safe top header padding helper
 * Guarantees that headers never clip under camera punch holes, dynamic islands, or notches
 */
export const getSafeHeaderPaddingTop = (insetsTop = 0): number => {
  if (insetsTop > 0) {
    return insetsTop + 10;
  }
  if (Platform.OS === 'android') {
    return (StatusBar.currentHeight || 28) + 12;
  }
  return SCREEN.isSmallDevice ? 44 : 54;
};

/**
 * Universal safe bottom navigation padding helper
 */
export const getSafeBottomPadding = (insetsBottom = 0, defaultPad = 12): number => {
  if (insetsBottom > 0) {
    return Math.max(insetsBottom, defaultPad);
  }
  return Platform.OS === 'ios' ? 22 : defaultPad;
};
