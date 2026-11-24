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
  // Logo Entrance Animation
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Pulse Glow Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // YouTube / Top MNC Style Progress Animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide native OS splash immediately so our beautiful custom SplashView takes over seamlessly
    SplashScreen.hideAsync().catch(() => { });

    // 1. Logo smooth spring scale & fade in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous soft breathing pulse for airplane watermark
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. YouTube-style continuous loop progress bar
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

    // 4. Advance callback
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  // Compute YouTube-style sliding loader translate
  const TRACK_WIDTH = 140;
  const SLIDER_WIDTH = 60;
  const translateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SLIDER_WIDTH, TRACK_WIDTH],
  });

  return (
    <View style={styles.container}>
      {/* Dark Status bar matching the crisp Aqua-White theme */}
      <StatusBar style="dark" />

      {/* Aqua Water Fluid Gradient: Identical to Login Page */}
      <LinearGradient
        colors={['#99F6E4', '#CCFBF1', '#E6FAF6', '#F3FAF8', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.18, 0.38, 0.6, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Aqua Water Glow Spheres */}
      <View style={styles.glowOrbTop} pointerEvents="none" />
      <View style={styles.glowOrbBottom} pointerEvents="none" />

      {/* Atmospheric Airplane Watermark from Home Header with smooth breathing */}
      <Animated.View
        style={[
          styles.planeArtWrap,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <ExpoImage
          source={require('../../assets/images/home-header-plane.png')}
          style={styles.planeArt}
          contentFit="contain"
          priority="high"
        />
      </Animated.View>

      {/* Center Brand Identity with Original Official Logo */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <ExpoImage
            source={require('../../assets/images/flyorago-original-symbol.png')}
            style={styles.originalLogo}
            contentFit="contain"
            priority="high"
          />
          <Text style={styles.brandTitleText}>
            FLYORA<Text style={styles.brandTitleAccent}>GO</Text>
          </Text>
        </Animated.View>

        {/* Elegant Tagline Pill */}
        <Animated.View style={[styles.badgeWrap, { opacity: logoOpacity }]}>
          <View style={styles.badgePill}>
            <Ionicons name="sparkles" size={13} color="#0D9488" />
            <Text style={styles.badgeText}>Your Journey Carries More</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Area: YouTube & Top MNC Style Smooth Fluid Progress Loader */}
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

        <Text style={styles.loaderCaption}>SECURE LOGISTICS NETWORK</Text>
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
  glowOrbTop: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(45, 212, 191, 0.22)',
    zIndex: 0,
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    zIndex: 0,
  },
  planeArtWrap: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.18,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    opacity: 0.18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  planeArt: {
    width: '100%',
    height: '100%',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  originalLogo: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  brandTitleText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A1628',
    letterSpacing: 1.5,
  },
  brandTitleAccent: {
    color: '#0D9488',
  },
  badgeWrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.2,
    borderColor: '#99F6E4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  bottomArea: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 52 : 38,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  loaderTrack: {
    width: 140,
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
  loaderCaption: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1.2,
    opacity: 0.85,
  },
});
