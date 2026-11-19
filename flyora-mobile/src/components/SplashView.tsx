import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { FlyoraColors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface SplashViewProps {
  onFinish?: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtle pulse on active indicator dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Auto advance timer
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Atmospheric Soft Mint to Crisp White Gradient */}
      <LinearGradient
        colors={['#CCF5EF', '#E8FAF6', '#FFFFFF']}
        locations={[0, 0.35, 0.85]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Left Decorative Subtle Wave Arches */}
      <View style={styles.topArchOuter} />
      <View style={styles.topArchInner} />

      {/* Center Main Content */}
      <Animated.View
        style={[
          styles.contentBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Official Flyorago Logo & Tagline */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/flyorago-logo-transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Illustrated Mint Globe with Airplane & Package */}
        <View style={styles.globeContainer}>
          <Image
            source={require('../../assets/images/login-globe-art.png')}
            style={styles.globeImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Carousel Indicator Dots */}
      <SafeAreaView style={styles.footerContainer}>
        <View style={styles.dotsRow}>
          <Animated.View
            style={[
              styles.dot,
              styles.dotActive,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>
      </SafeAreaView>

      {/* Bottom Soft Waves Art */}
      <View style={styles.bottomWaveBox} pointerEvents="none">
        <Image
          source={require('../../assets/images/login-waves.png')}
          style={styles.bottomWaveImage}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FCFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topArchOuter: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  topArchInner: {
    position: 'absolute',
    top: -height * 0.05,
    left: -width * 0.1,
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
  },
  contentBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(height * 0.03, 16),
  },
  logoImage: {
    width: Math.min(width * 0.65, 270),
    height: Math.min(height * 0.18, 140),
  },
  globeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  globeImage: {
    width: Math.min(width * 0.85, 360),
    height: Math.min(height * 0.32, 250),
  },
  footerContainer: {
    position: 'absolute',
    bottom: Math.max(height * 0.08, 48),
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: FlyoraColors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: '#C5EFE8',
  },
  bottomWaveBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 55,
    zIndex: 1,
  },
  bottomWaveImage: {
    width: '100%',
    height: '100%',
  },
});
