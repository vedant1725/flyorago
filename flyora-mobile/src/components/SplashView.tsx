import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashViewProps {
  onFinish?: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  // 1. Airplane Flight Animation: smoothly swoops in from bottom-left up across to upper area
  const planeProgress = useRef(new Animated.Value(0)).current;
  const planeFloating = useRef(new Animated.Value(0)).current;

  // 2. Official Logo Animation (splash-icon.png): Spring scale & glowing reveal
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current;
  const logoGlowPulse = useRef(new Animated.Value(1)).current;

  // 3. Sonic Jet Airflow Ring Glow Effect
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  // 4. Tagline Pill Reveal Animation
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(14)).current;

  // 5. YouTube / Top MNC Style Fluid Progress Loader
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide native OS splash screen immediately so our custom animated SplashView takes over seamlessly
    SplashScreen.hideAsync().catch(() => {});

    // Flight sequence: Starts banking in with acceleration and settles into smooth glide
    Animated.timing(planeProgress, {
      toValue: 1,
      duration: 1600,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start(() => {
      // Gentle continuous aerodynamic hovering/floating after arrival
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

    // Sonic energy aura expansion accompanying airplane
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 0.85,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1.5,
          duration: 1300,
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

    // Official Logo (splash-icon) springs up as the airplane reaches cruising altitude
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
          tension: 48,
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
      // Gentle breathing glow pulse for the logo
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoGlowPulse, {
            toValue: 1.05,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoGlowPulse, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Tagline badge glides in right after logo
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

    // YouTube-style continuous loop progress bar
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

    // Seamless handoff to app after full animation showcases
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  // Compute Airplane trajectory
  const planeTranslateX = planeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 0.7, 0],
  });

  const planeTranslateY = Animated.add(
    planeProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [SCREEN_HEIGHT * 0.26, 0],
    }),
    planeFloating.interpolate({
      inputRange: [-1, 1],
      outputRange: [-8, 8],
    })
  );

  const planeScale = planeProgress.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.65, 1.05, 1],
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
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1, 1],
  });

  // Compute YouTube-style sliding loader translate
  const TRACK_WIDTH = 150;
  const SLIDER_WIDTH = 64;
  const translateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SLIDER_WIDTH, TRACK_WIDTH],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Atmospheric Aqua Gradient Background: Premium Cloud & Sky feel */}
      <LinearGradient
        colors={['#CCFBF1', '#E6FAF6', '#F0FDFA', '#F8FAFC', '#FFFFFF']}
        locations={[0, 0.22, 0.5, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Luminous Sky Glow Orbs */}
      <View style={styles.glowOrbTopLeft} pointerEvents="none" />
      <View style={styles.glowOrbCenter} pointerEvents="none" />
      <View style={styles.glowOrbBottomRight} pointerEvents="none" />

      {/* Glowing Sonic Ring Effect Behind Airplane */}
      <Animated.View
        style={[
          styles.sonicRing,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
        pointerEvents="none"
      />

      {/* Flight Air Trails / Aerodynamic Motion Streamlines */}
      <Animated.View
        style={[
          styles.flightTrailsWrap,
          {
            opacity: planeOpacity,
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', 'rgba(45, 212, 191, 0.25)', 'transparent']}
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

      {/* HERO SECTION: Flying 3D HD Commercial Airplane */}
      <Animated.View
        style={[
          styles.airplaneHeroContainer,
          {
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

      {/* CENTER BRAND SECTION: Only the official splash-icon.png with backlight glow */}
      <View style={styles.centerBrandArea}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, logoGlowPulse) },
                { translateY: logoTranslateY },
              ],
            },
          ]}
        >
          {/* Circular Ambient Glow Backdrop under Logo */}
          <View style={styles.logoBackdropGlow} />

          {/* Official splash-icon.png */}
          <ExpoImage
            source={require('../../assets/images/splash-icon.png')}
            style={styles.officialSplashIcon}
            contentFit="contain"
            priority="high"
          />
        </Animated.View>

        {/* MNC Style Slogan Badge */}
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

      {/* BOTTOM SECTION: YouTube & Google MNC Style Animated Micro Loader */}
      <View style={styles.bottomArea} pointerEvents="none">
        <View style={styles.loaderTrack}>
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
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOrbTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(45, 212, 191, 0.28)',
    zIndex: 0,
  },
  glowOrbCenter: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.35,
    left: SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: (SCREEN_WIDTH * 0.8) / 2,
    backgroundColor: 'rgba(204, 251, 241, 0.35)',
    zIndex: 0,
  },
  glowOrbBottomRight: {
    position: 'absolute',
    bottom: -90,
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    zIndex: 0,
  },
  sonicRing: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.16,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.45)',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    zIndex: 1,
  },
  flightTrailsWrap: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.22,
    width: SCREEN_WIDTH * 0.95,
    height: 60,
    zIndex: 1,
    transform: [{ rotate: '-12deg' }],
  },
  flightTrailLine1: {
    width: '100%',
    height: 2.5,
    borderRadius: 2,
    marginBottom: 8,
  },
  flightTrailLine2: {
    width: '80%',
    height: 1.8,
    borderRadius: 2,
    marginLeft: 30,
  },
  airplaneHeroContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.11 : SCREEN_HEIGHT * 0.09,
    width: SCREEN_WIDTH * 0.94,
    height: SCREEN_WIDTH * 0.58,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  airplaneImage: {
    width: '100%',
    height: '100%',
  },
  centerBrandArea: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.44,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 200,
    height: 200,
  },
  logoBackdropGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(45, 212, 191, 0.25)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  officialSplashIcon: {
    width: 190,
    height: 190,
  },
  sloganContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    bottom: Platform.OS === 'ios' ? 52 : 36,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  loaderTrack: {
    width: 150,
    height: 4.5,
    backgroundColor: 'rgba(13, 148, 136, 0.16)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
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
    fontSize: 10,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1.4,
    opacity: 0.9,
  },
});
