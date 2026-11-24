import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { fontScale } from '../constants/responsive';

const { width } = Dimensions.get('window');

interface KycValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycStatus?: string;
  onNavigateToKyc: () => void;
  actionTitle?: string;
}

export const KycValidationModal: React.FC<KycValidationModalProps> = ({
  isOpen,
  onClose,
  kycStatus = 'NOT_SUBMITTED',
  onNavigateToKyc,
  actionTitle = 'This action',
}) => {
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (isOpen) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.82);
      slideAnim.setValue(30);

      // Spring-loaded modal entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();

      // Continuous subtle breathing pulse for icon glow
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const statusKey = (kycStatus || 'NOT_SUBMITTED').toUpperCase();

  const getDetails = () => {
    switch (statusKey) {
      case 'PENDING':
      case 'UNDER_REVIEW':
        return {
          title: 'KYC Under Review',
          badge: 'VERIFICATION IN PROGRESS',
          badgeBg: 'rgba(254, 243, 199, 0.95)',
          badgeColor: '#B45309',
          badgeBorder: '#FDE68A',
          iconName: 'hourglass-outline' as const,
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
          desc: 'Your government identity documents are currently under secure review by our verification desk. Features unlock as soon as approved (12–24h).',
          buttonText: 'Check Verification Status',
        };
      case 'REJECTED':
        return {
          title: 'KYC Verification Failed',
          badge: 'ACTION REQUIRED',
          badgeBg: 'rgba(254, 226, 226, 0.95)',
          badgeColor: '#DC2626',
          badgeBorder: '#FECACA',
          iconName: 'alert-circle-outline' as const,
          iconBg: '#FEE2E2',
          iconColor: '#DC2626',
          desc: 'Your uploaded documents could not be approved. Please re-submit clear photos of your National ID and Passport to unlock full features.',
          buttonText: 'Re-submit Documents',
        };
      default:
        return {
          title: 'Identity Verification Required',
          badge: 'MANDATORY COMPLIANCE',
          badgeBg: 'rgba(255, 255, 255, 0.95)',
          badgeColor: '#0F766E',
          badgeBorder: '#99F6E4',
          iconName: 'shield-checkmark' as const,
          iconBg: '#E6FAF6',
          iconColor: '#0D9488',
          desc: `${actionTitle} requires mandatory government ID verification. Complete verification to unlock luggage sharing, package requests & instant escrow payouts.`,
          buttonText: 'Complete Identity Verification',
        };
    }
  };

  const details = getDetails();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Animated Dark Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdropOverlay,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Animated Modal Card in Water Aqua Glassmorphism */}
        <Animated.View
          style={[
            styles.animatedCardWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Aqua Water Fluid Gradient: Deep Aqua Water-Green into Pure White */}
          <LinearGradient
            colors={['#A7F3D0', '#CCFBF1', '#E6FAF6', '#F4FBF9', '#FFFFFF', '#FFFFFF']}
            locations={[0, 0.22, 0.45, 0.68, 0.88, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Decorative Glowing Water Circles & Plane Silhouette (Identical to Login / Signup) */}
          <View style={styles.waterGlowCircle} pointerEvents="none" />
          <View style={styles.planeArtWrap} pointerEvents="none">
            <ExpoImage
              source={require('../../assets/images/home-header-plane.png')}
              style={styles.planeArt}
              contentFit="contain"
              priority="high"
            />
          </View>

          {/* Close X Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={18} color="#0D9488" />
          </TouchableOpacity>

          {/* Official 3D Box & Flight Logo Emblem */}
          <View style={styles.logoRow}>
            <ExpoImage
              source={require('../../assets/images/flyorago-original-symbol.png')}
              style={styles.topLogoSymbol}
              contentFit="contain"
              priority="high"
            />
            <Text style={styles.brandTitleText}>
              FLYORA<Text style={styles.brandTitleAccent}>GO</Text>
            </Text>
          </View>

          {/* Pulsing Animated Shield Icon */}
          <Animated.View
            style={[
              styles.iconCircleWrapper,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={[styles.iconInnerCircle, { backgroundColor: details.iconBg }]}>
              <Ionicons name={details.iconName} size={36} color={details.iconColor} />
            </View>
          </Animated.View>

          {/* Pill Badge matching Login Screen */}
          <View
            style={[
              styles.pillBadge,
              {
                backgroundColor: details.badgeBg,
                borderColor: details.badgeBorder,
              },
            ]}
          >
            <Ionicons name="sparkles" size={11} color={details.badgeColor} />
            <Text style={[styles.pillBadgeText, { color: details.badgeColor }]}>
              {details.badge}
            </Text>
          </View>

          {/* Title & Description */}
          <Text style={[styles.modalTitle, { fontSize: fontScale(21) }]}>
            {details.title}
          </Text>

          <Text style={[styles.modalDesc, { fontSize: fontScale(12.5) }]}>
            {details.desc}
          </Text>

          {/* 256-Bit Encryption Feature Ribbon */}
          <View style={styles.encryptionRibbon}>
            <Ionicons name="lock-closed" size={14} color="#0D9488" />
            <Text style={styles.encryptionRibbonText}>
              Secured with 256-bit bank-grade encryption
            </Text>
          </View>

          {/* Primary Action Button (Signature Aqua Linear Gradient) */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              onClose();
              onNavigateToKyc();
            }}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#0D9488', '#0F766E', '#065F56']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Text style={[styles.actionBtnText, { fontSize: fontScale(14.5) }]}>
                {details.buttonText}
              </Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Maybe Later Link */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          >
            <Text style={[styles.cancelBtnText, { fontSize: fontScale(13) }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    zIndex: 999,
  },
  backdropOverlay: {
    backgroundColor: 'rgba(6, 39, 56, 0.65)',
  },
  animatedCardWrapper: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.4,
    borderColor: '#CCFBF1',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
  },
  waterGlowCircle: {
    position: 'absolute',
    top: -45,
    left: -45,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(45, 212, 191, 0.35)',
    zIndex: 0,
  },
  planeArtWrap: {
    position: 'absolute',
    top: 10,
    right: -20,
    width: 180,
    height: 180,
    opacity: 0.16,
    zIndex: 0,
  },
  planeArt: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    zIndex: 2,
  },
  topLogoSymbol: {
    width: 28,
    height: 28,
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A1628',
    letterSpacing: 1.1,
  },
  brandTitleAccent: {
    color: '#0D9488',
  },
  iconCircleWrapper: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#99F6E4',
    marginBottom: 12,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 2,
  },
  iconInnerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 10,
    zIndex: 2,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  modalTitle: {
    fontWeight: '900',
    color: '#062738',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
    zIndex: 2,
  },
  modalDesc: {
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 4,
    fontWeight: '500',
    zIndex: 2,
  },
  encryptionRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(240, 253, 250, 0.95)',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 18,
    zIndex: 2,
  },
  encryptionRibbonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  actionBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
    marginBottom: 10,
    zIndex: 2,
  },
  btnGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    zIndex: 2,
  },
  cancelBtnText: {
    fontWeight: '700',
    color: '#64748B',
  },
});

export default KycValidationModal;
