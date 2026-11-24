import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FlyoraColors, Shadows } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top Close Button (floating over image) */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* 1. Hero Image Section with Team & Pill Badges */}
          <View style={styles.heroImageWrap}>
            <Image
              source={require('../../assets/images/about_team_custom.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Bottom Dark Vignette Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(15, 23, 42, 0.75)']}
              style={styles.imageOverlay}
            />

            {/* Floating Pills over Hero Image */}
            <View style={styles.imagePillRow}>
              <View style={styles.aboutPill}>
                <Ionicons name="sparkles" size={11} color="#2DD4BF" />
                <Text style={styles.aboutPillText}>ABOUT FLYORAGO</Text>
              </View>
              <Text style={styles.communitySubText}>Community Powered Shipping</Text>
            </View>
          </View>

          {/* 2. Scrollable Body Content */}
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome Heading */}
            <View style={styles.headingBlock}>
              <Text style={styles.welcomeHeading}>
                Welcome to <Text style={styles.highlightTeal}>FlyoraGo</Text>!
              </Text>
              <Text style={styles.welcomeDesc}>
                Every day, millions of travelers fly with unused luggage capacity, while people pay heavy courier costs. FlyoraGo securely bridges this gap by connecting verified travelers with senders worldwide.
              </Text>
            </View>

            {/* 4 Feature Highlights Grid */}
            <View style={styles.featuresGrid}>
              {/* Feature 1: Monetize Extra Baggage */}
              <View style={[styles.featureCard, styles.featureCardTeal]}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#CCF5EF' }]}>
                  <Ionicons name="airplane" size={17} color="#089A8D" />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>Monetize Extra Baggage</Text>
                  <Text style={styles.featureDesc}>
                    Travelers earn real money by offering verified extra suitcase space.
                  </Text>
                </View>
              </View>

              {/* Feature 2: 60% Cheaper Shipping */}
              <View style={styles.featureCard}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="cube" size={17} color="#475569" />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>60% Cheaper Shipping</Text>
                  <Text style={styles.featureDesc}>
                    Send urgent parcels, gifts, or documents without inflated courier rates.
                  </Text>
                </View>
              </View>

              {/* Feature 3: 100% Escrow Protection */}
              <View style={styles.featureCard}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="shield-checkmark" size={17} color="#059669" />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>100% Escrow Protection</Text>
                  <Text style={styles.featureDesc}>
                    Funds remain safely locked in escrow until verified delivery confirmation.
                  </Text>
                </View>
              </View>

              {/* Feature 4: AI Trust & KYC Security */}
              <View style={styles.featureCard}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="ribbon" size={17} color="#2563EB" />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>AI Trust & KYC Security</Text>
                  <Text style={styles.featureDesc}>
                    Government ID verified members, live GPS route matching, and fraud protection.
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer Explore Action Button */}
            <View style={styles.footerWrap}>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Explore Dashboard</Text>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 44 : 24,
  },
  modalCard: {
    width: Math.min(SCREEN_WIDTH - 28, 480),
    maxHeight: Math.min(SCREEN_HEIGHT * 0.9, 700),
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...Shadows.cardHover,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 30,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroImageWrap: {
    width: '100%',
    height: 185,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 65,
  },
  imagePillRow: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  aboutPillText: {
    color: '#2DD4BF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  communitySubText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 11,
    fontWeight: '700',
  },
  bodyScroll: {
    flexGrow: 0,
  },
  bodyScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headingBlock: {
    marginBottom: 14,
  },
  welcomeHeading: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  highlightTeal: {
    color: '#089A8D',
  },
  welcomeDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 5,
    fontWeight: '500',
  },
  featuresGrid: {
    gap: 9,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 11,
  },
  featureCardTeal: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCF5EF',
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  featureDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15.5,
    marginTop: 2,
    fontWeight: '500',
  },
  footerWrap: {
    paddingTop: 4,
  },
  exploreBtn: {
    backgroundColor: '#089A8D',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Shadows.card,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
