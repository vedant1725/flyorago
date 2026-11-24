import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FlyoraColors, Shadows, BorderRadius } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface DeliverySuccessModalProps {
  visible: boolean;
  onClose: () => void;
  role: 'sender' | 'traveler';
  packageTitle?: string;
  payoutAmount?: string | number;
  deliveryDate?: string;
  trackingId?: string;
}

export const DeliverySuccessModal: React.FC<DeliverySuccessModalProps> = ({
  visible,
  onClose,
  role,
  packageTitle = 'Package Delivery',
  payoutAmount,
  deliveryDate,
  trackingId,
}) => {
  // Animation Values
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const badgeScaleAnim = useRef(new Animated.Value(0)).current;
  const checkRotation = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);
      badgeScaleAnim.setValue(0);
      checkRotation.setValue(0);
      burstAnim.setValue(0);
      cardTranslateY.setValue(40);

      // Sequence of high-end choreographed animations
      Animated.sequence([
        // 1. Modal backdrop & card fade/slide in
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 70,
            useNativeDriver: true,
          }),
          Animated.timing(cardTranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]),
        // 2. Trophy/Check Badge pop & rotation
        Animated.parallel([
          Animated.spring(badgeScaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 90,
            useNativeDriver: true,
          }),
          Animated.timing(checkRotation, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Particle/Burst ring expansion
          Animated.timing(burstAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible]);

  const spin = checkRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '0deg'],
  });

  const burstScale = burstAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.8, 1.4, 1.6],
  });

  const burstOpacity = burstAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.5, 0],
  });

  if (!visible) return null;

  const isTraveler = role === 'traveler';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />

        {/* Content Container */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }, { translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Top Decorative Gradient */}
          <LinearGradient
            colors={['#062738', '#089A8D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Animated Burst Ring */}
            <Animated.View
              style={[
                styles.burstRing,
                {
                  transform: [{ scale: burstScale }],
                  opacity: burstOpacity,
                },
              ]}
            />

            {/* Glowing Icon Container */}
            <Animated.View
              style={[
                styles.badgeContainer,
                {
                  transform: [{ scale: badgeScaleAnim }, { rotate: spin }],
                },
              ]}
            >
              <LinearGradient
                colors={['#2DD4BF', '#059669']}
                style={styles.badgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name={isTraveler ? 'gift' : 'shield-checkmark'}
                  size={46}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Animated.View>

            {/* Floating Sparkles */}
            <View style={[styles.sparkle, { top: 18, left: 32 }]}>
              <Ionicons name="sparkles" size={20} color="#FBBF24" />
            </View>
            <View style={[styles.sparkle, { top: 28, right: 36 }]}>
              <Ionicons name="sparkles" size={16} color="#6EE7B7" />
            </View>
            <View style={[styles.sparkle, { bottom: 16, right: 48 }]}>
              <Ionicons name="star" size={14} color="#FDE047" />
            </View>

            <Text style={styles.successHeading}>
              {isTraveler ? 'Delivery Verified! 🎉' : 'Package Safely Received! 📦'}
            </Text>
            <Text style={styles.successSub}>
              {isTraveler
                ? 'Handover OTP & QR verified. Escrow reward released to your wallet!'
                : 'Verified handover complete. Escrow payment released to your traveler!'}
            </Text>
          </LinearGradient>

          {/* Body Information Card */}
          <View style={styles.body}>
            <View style={styles.detailRowCard}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>PARCEL</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {packageTitle}
                </Text>
              </View>

              {payoutAmount && (
                <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
                  <Text style={styles.detailLabel}>
                    {isTraveler ? 'WALLET CREDIT' : 'ESCROW RELEASED'}
                  </Text>
                  <Text style={styles.detailAmount}>
                    ${payoutAmount}
                  </Text>
                </View>
              )}
            </View>

            {trackingId && (
              <View style={styles.trackingPill}>
                <Ionicons name="barcode-outline" size={15} color="#089A8D" />
                <Text style={styles.trackingText}>Request Reference: #{trackingId}</Text>
              </View>
            )}

            {/* Trust & Guarantee Box */}
            <View style={styles.securityBox}>
              <Ionicons name="lock-closed" size={18} color="#059669" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.securityTitle}>100% Flyora Trust & Escrow Guarantee</Text>
                <Text style={styles.securityText}>
                  Digital cryptographic receipt has been recorded on the ledger.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.primaryBtn} onPress={onClose} activeOpacity={0.88}>
              <LinearGradient
                colors={['#089A8D', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>
                  {isTraveler ? 'Go to Wallet / Trip' : 'Done & Close'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3, 20, 29, 0.82)',
  },
  modalContent: {
    width: Math.min(width * 0.92, 420),
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    ...Shadows.cardHover,
    elevation: 24,
  },
  headerGradient: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  burstRing: {
    position: 'absolute',
    top: 26,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#2DD4BF',
  },
  badgeContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.card,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  successSub: {
    fontSize: 13,
    color: '#CCFBF1',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  body: {
    padding: 20,
  },
  detailRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  detailAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  trackingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  trackingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  securityText: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  primaryBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
