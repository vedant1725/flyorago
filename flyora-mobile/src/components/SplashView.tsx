import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SplashViewProps {
  onFinish?: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Responsive dynamic dimensions for any screen size (small phone, medium, tablet, phablet)
  const isTablet = windowWidth >= 768;
  const isSmallPhone = windowWidth < 375;

  // Exact responsive proportional sizes
  const LOGO_BOX_SIZE = Math.min(Math.round(windowWidth * (isTablet ? 0.32 : isSmallPhone ? 0.52 : 0.48)), 230);
  const LOGO_IMAGE_SIZE = Math.round(LOGO_BOX_SIZE * 0.94);
  const GLOW_SIZE = Math.round(LOGO_BOX_SIZE * 0.88);

  // Responsive Airplane size & trajectory
  const PLANE_WIDTH = Math.min(Math.round(windowWidth * (isTablet ? 0.6 : 0.94)), 460);
  const PLANE_HEIGHT = Math.round(PLANE_WIDTH * (768 / 1323));

  // 1. Airplane Flight Entry & Float Animations
  const planeProgress = useRef(new Animated.Value(0)).current;
  const planeFloating = useRef(new Animated.Value(0)).current;

  // 2. Dead-Center Logo Reveal Animations
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(34)).current;
  const logoGlowPulse = useRef(new Animated.Value(1)).current;

  // 3. Ambient Flight Sonic Ring Aura
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  // 4. Tagline Pill Staggered Reveal
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(16)).current;

  // 5. Google / YouTube MNC Style Micro Progress Loader
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide native OS splash screen immediately so custom SplashView seamlessly displays
    SplashScreen.hideAsync().catch(() => {});

    // 1. Airplane Flight Animation: Swoops up across with realistic deceleration curve
    Animated.timing(planeProgress, {
      toValue: 1,
      duration: 1550,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start(() => {
      // Gentle continuous aerodynamic floating/hovering in the sky
      Animated.loop(
        Animated.sequence([
          Animated.timing(planeFloating, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(planeFloating, {
            toValue: -1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 2. Sonic energy aura behind airplane
    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 0.85,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1.45,
          duration: 1250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Center Logo: Springs cleanly into dead-center
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 46,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Gentle infinite breathing pulse for logo
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoGlowPulse, {
            toValue: 1.045,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoGlowPulse, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 4. Tagline Pill Glides in right after logo
    Animated.sequence([
      Animated.delay(650),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 5. YouTube & Google MNC style continuous loop progress slider
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Smooth handoff to main app
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  // Responsive Airplane trajectory interpolation
  const planeTranslateX = planeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-windowWidth * 0.75, 0],
  });

  const planeTranslateY = Animated.add(
    planeProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [windowHeight * 0.28, 0],
    }),
    planeFloating.interpolate({
      inputRange: [-1, 1],
      outputRange: [-8, 8],
    })
  );

  const planeScale = planeProgress.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.65, 1.04, 1],
  });

  const planeRotate = Animated.add(
    planeProgress.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: ['-18deg', '-3deg', '-6deg'],
    }),
    planeFloating.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-2deg', '2deg'],
    })
  );

  const planeOpacity = planeProgress.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 1, 1],
  });

  // Responsive Progress Slider Interpolation
  const TRACK_WIDTH = Math.min(Math.round(windowWidth * 0.38), 160);
  const SLIDER_WIDTH = Math.round(TRACK_WIDTH * 0.42);
  const translateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SLIDER_WIDTH, TRACK_WIDTH],
  });

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="dark" />

      {/* Atmospheric Cloud & Sky Aqua Fluid Gradient */}
      <LinearGradient
        colors={['#CCFBF1', '#E6FAF6', '#F0FDFA', '#F8FAFC', '#FFFFFF']}
        locations={[0, 0.2, 0.48, 0.76, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Responsive Glow Orbs */}
      <View
        style={[
          styles.glowOrbTopLeft,
          {
            width: Math.min(windowWidth * 0.7, 320),
            height: Math.min(windowWidth * 0.7, 320),
            borderRadius: Math.min(windowWidth * 0.7, 320) / 2,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.glowOrbBottomRight,
          {
            width: Math.min(windowWidth * 0.75, 340),
            height: Math.min(windowWidth * 0.75, 340),
            borderRadius: Math.min(windowWidth * 0.75, 340) / 2,
          },
        ]}
        pointerEvents="none"
      />

      {/* Glowing Sonic Ring Behind Airplane */}
      <Animated.View
        style={[
          styles.sonicRing,
          {
            top: insets.top + (isSmallPhone ? 40 : 65),
            width: Math.min(windowWidth * 0.62, 260),
            height: Math.min(windowWidth * 0.62, 260),
            borderRadius: Math.min(windowWidth * 0.62, 260) / 2,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
        pointerEvents="none"
      />

      {/* Flight Air Trails */}
      <Animated.View
        style={[
          styles.flightTrailsWrap,
          {
            top: insets.top + (isSmallPhone ? 60 : 90),
            width: windowWidth * 0.9,
            opacity: planeOpacity,
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', 'rgba(45, 212, 191, 0.28)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.flightTrailLine1}
        />
        <LinearGradient
          colors={['transparent', 'rgba(13, 148, 136, 0.2)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.flightTrailLine2}
        />
      </Animated.View>

      {/* TOP HERO SECTION: Flying 3D HD Commercial Airplane */}
      <Animated.View
        style={[
          styles.airplaneHeroContainer,
          {
            top: insets.top + (isSmallPhone ? 15 : isTablet ? 45 : 30),
            width: PLANE_WIDTH,
            height: PLANE_HEIGHT,
            opacity: planeOpacity,
            transform: [
              { translateX: planeTranslateX },
              { translateY: planeTranslateY },
              { scale: planeScale },
              { rotate: planeRotate as any },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <ExpoImage
          source={require('../../assets/images/splash-flight-airplane.png')}
          style={styles.airplaneImage}
          contentFit="contain"
          priority="high"
        />
      </Animated.View>

      {/* DEAD-CENTER BRAND SECTION: Flexbox 100% Guaranteed Absolute Center */}
      <View style={styles.absoluteCenterContainer} pointerEvents="box-none">
        {/* Responsive Logo Container with Ambient Glow */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              width: LOGO_BOX_SIZE,
              height: LOGO_BOX_SIZE,
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, logoGlowPulse) },
                { translateY: logoTranslateY },
              ],
            },
          ]}
        >
          {/* Circular Ambient Glow Backdrop under Logo */}
          <View
            style={[
              styles.logoBackdropGlow,
              {
                width: GLOW_SIZE,
                height: GLOW_SIZE,
                borderRadius: GLOW_SIZE / 2,
              },
            ]}
          />

          {/* Official splash-icon.png with crisp high resolution */}
          <ExpoImage
            source={require('../../assets/images/splash-icon.png')}
            style={{
              width: LOGO_IMAGE_SIZE,
              height: LOGO_IMAGE_SIZE,
            }}
            contentFit="contain"
            priority="high"
          />
        </Animated.View>

        {/* MNC Slogan Pill Badge directly below center logo */}
        <Animated.View
          style={[
            styles.sloganContainer,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          <View style={styles.sloganBadge}>
            <View style={styles.sloganDot} />
            <Ionicons name="sparkles" size={13} color="#0D9488" />
            <Text style={styles.sloganText}>Your Journey Carries More</Text>
          </View>
        </Animated.View>
      </View>

      {/* BOTTOM SECTION: Safe-area responsive MNC micro progress bar & footer */}
      <View
        style={[
          styles.bottomArea,
          {
            bottom: Math.max(insets.bottom, 16) + (Platform.OS === 'ios' ? 20 : 16),
          },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.loaderTrack, { width: TRACK_WIDTH }]}>
          <Animated.View
            style={[
              styles.loaderSlider,
              {
                width: SLIDER_WIDTH,
                transform: [{ translateX }],
              },
            ]}
          >
            <LinearGradient
              colors={['#2DD4BF', '#0D9488', '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBar}
            />
          </Animated.View>
        </View>

        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark" size={12} color="#0D9488" />
          <Text style={styles.loaderCaption}>SECURE LOGISTICS NETWORK</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrbTopLeft: {
    position: 'absolute',
    top: -90,
    left: -90,
    backgroundColor: 'rgba(45, 212, 191, 0.28)',
    zIndex: 0,
  },
  glowOrbBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    backgroundColor: 'rgba(13, 148, 136, 0.16)',
    zIndex: 0,
  },
  sonicRing: {
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.45)',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    zIndex: 1,
  },
  flightTrailsWrap: {
    position: 'absolute',
    alignSelf: 'center',
    height: 50,
    zIndex: 1,
    transform: [{ rotate: '-12deg' }],
  },
  flightTrailLine1: {
    width: '100%',
    height: 2.5,
    borderRadius: 2,
    marginBottom: 7,
  },
  flightTrailLine2: {
    width: '80%',
    height: 1.8,
    borderRadius: 2,
    marginLeft: 32,
  },
  airplaneHeroContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  airplaneImage: {
    width: '100%',
    height: '100%',
  },
  // True Dead-Center Layout: Fills entire screen with flexbox center alignment
  absoluteCenterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoBackdropGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(45, 212, 191, 0.26)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 8,
  },
  sloganContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  sloganBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.2,
    borderColor: '#99F6E4',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 22,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  sloganDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  sloganText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.6,
  },
  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  loaderTrack: {
    height: 4.5,
    backgroundColor: 'rgba(13, 148, 136, 0.16)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 9,
  },
  loaderSlider: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gradientBar: {
    width: '100%',
    height: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  loaderCaption: {
    fontSize: 9.8,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1.4,
    opacity: 0.9,
  },
});
