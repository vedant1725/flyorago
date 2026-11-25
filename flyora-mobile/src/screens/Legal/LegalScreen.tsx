import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import {
  scale,
  verticalScale,
  moderateScale,
  fontScale,
  getSafeHeaderPaddingTop,
} from '../../constants/responsive';

export type LegalDocType = 'terms' | 'privacy';

interface LegalScreenProps {
  initialDoc?: LegalDocType;
  onBack: () => void;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({
  initialDoc = 'terms',
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialDoc);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Aqua Fluid Water Background */}
      <LinearGradient
        colors={['#A7F3D0', '#CCFBF1', '#E6FAF6', '#F4FBF9', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.16, 0.38, 0.62, 0.88, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Water Glow Background Art */}
      <View style={styles.waterGlowOrb} pointerEvents="none" />
      <View style={styles.planeArtWrap} pointerEvents="none">
        <ExpoImage
          source={require('../../../assets/images/home-header-plane.png')}
          style={styles.planeArt}
          contentFit="contain"
          priority="high"
        />
      </View>

      {/* Fullscreen Header Bar with Back Button */}
      <View style={[styles.headerBar, { paddingTop: getSafeHeaderPaddingTop(insets.top) + 2 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={moderateScale(22)} color="#0D9488" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.logoBadge}>
            <ExpoImage
              source={require('../../../assets/images/flyorago-original-symbol.png')}
              style={styles.miniLogo}
              contentFit="contain"
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>Legal & Compliance</Text>
            <Text style={styles.headerSubtitle}>FlyoraGo Trust Standards</Text>
          </View>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Water Aqua Capsule Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'terms' && styles.tabButtonActive]}
          onPress={() => setActiveTab('terms')}
          activeOpacity={0.85}
        >
          {activeTab === 'terms' ? (
            <LinearGradient
              colors={['#0D9488', '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tabGradient}
            >
              <Ionicons name="document-text-outline" size={moderateScale(16)} color="#FFFFFF" />
              <Text style={styles.tabTextActive}>Terms of Service</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tabInactiveContent}>
              <Ionicons name="document-text-outline" size={moderateScale(16)} color="#64748B" />
              <Text style={styles.tabTextInactive}>Terms of Service</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'privacy' && styles.tabButtonActive]}
          onPress={() => setActiveTab('privacy')}
          activeOpacity={0.85}
        >
          {activeTab === 'privacy' ? (
            <LinearGradient
              colors={['#0D9488', '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tabGradient}
            >
              <Ionicons name="shield-checkmark-outline" size={moderateScale(16)} color="#FFFFFF" />
              <Text style={styles.tabTextActive}>Privacy Policy</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tabInactiveContent}>
              <Ionicons name="shield-checkmark-outline" size={moderateScale(16)} color="#64748B" />
              <Text style={styles.tabTextInactive}>Privacy Policy</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Scrollable Legal Document Body */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'terms' ? (
          /* ─── TERMS OF SERVICE ─── */
          <View style={styles.contentWrap}>
            {/* Badge & Date */}
            <View style={styles.docHeader}>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={moderateScale(13)} color="#0D9488" />
                <Text style={styles.verifiedBadgeText}>OFFICIAL USER AGREEMENT</Text>
              </View>
              <Text style={styles.docTitle}>Terms of Service</Text>
              <Text style={styles.docMeta}>Last updated: July 28, 2026 • Global Version 2.4</Text>
            </View>

            {/* Section 1 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>1</Text>
                </View>
                <Text style={styles.sectionTitle}>Agreement to Terms</Text>
              </View>
              <Text style={styles.sectionBody}>
                By accessing, browsing, downloading, or using the Flyorago peer-to-peer logistics
                mobile application or web platform, you enter into a legally binding agreement to
                comply with these Terms of Service. If you do not agree to all terms and conditions,
                you may not register or access any of our services.
              </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>2</Text>
                </View>
                <Text style={styles.sectionTitle}>Identity Verification & KYC</Text>
              </View>
              <Text style={styles.sectionBody}>
                To ensure maximum passenger, sender, and airline security, all users must complete
                identity verification including government-issued photo ID (Passport / Aadhaar /
                Driving License) and phone number verification. Flyorago reserves the right to
                suspend, restrict, or terminate any account failing our security review standards.
              </Text>
            </View>

            {/* Section 3 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>3</Text>
                </View>
                <Text style={styles.sectionTitle}>Prohibited Items & Aviation Safety</Text>
              </View>
              <Text style={styles.sectionBody}>
                All shipments must strictly comply with international civil aviation laws (ICAO,
                IATA, DGCA, TSA) and local customs regulations. The following items are strictly
                prohibited:
              </Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Ionicons name="close-circle" size={moderateScale(15)} color="#DC2626" />
                  <Text style={styles.bulletText}>Firearms, ammunition, knives, or weapons</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="close-circle" size={moderateScale(15)} color="#DC2626" />
                  <Text style={styles.bulletText}>Narcotics, illegal drugs, or controlled substances</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="close-circle" size={moderateScale(15)} color="#DC2626" />
                  <Text style={styles.bulletText}>Flammable liquids, explosives, or hazardous chemicals</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="close-circle" size={moderateScale(15)} color="#DC2626" />
                  <Text style={styles.bulletText}>Uninspected or sealed packages without item disclosure</Text>
                </View>
              </View>
              <Text style={styles.sectionBodyNotice}>
                Travelers have the legal right and responsibility to visually inspect items before
                accepting them into their luggage.
              </Text>
            </View>

            {/* Section 4 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>4</Text>
                </View>
                <Text style={styles.sectionTitle}>Escrow Payment & OTP Delivery</Text>
              </View>
              <Text style={styles.sectionBody}>
                Sender payments are securely held in Flyorago Escrow. Release of payout funds to the
                traveler occurs only upon physical receipt and verification of the unique 6-digit
                Delivery OTP or QR code by the recipient. Once delivery is validated, funds transfer
                is irreversible.
              </Text>
            </View>

            {/* Section 5 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>5</Text>
                </View>
                <Text style={styles.sectionTitle}>Disputes & Support</Text>
              </View>
              <Text style={styles.sectionBody}>
                Any dispute regarding damaged packages, flight cancellations, or delivery delays
                must be reported within 24 hours of scheduled arrival. The Flyorago Trust & Safety
                mediation team provides 24/7 dispute resolution and escrow protection.
              </Text>
            </View>
          </View>
        ) : (
          /* ─── PRIVACY POLICY ─── */
          <View style={styles.contentWrap}>
            {/* Badge & Date */}
            <View style={styles.docHeader}>
              <View style={styles.verifiedBadge}>
                <Ionicons name="lock-closed" size={moderateScale(13)} color="#0D9488" />
                <Text style={styles.verifiedBadgeText}>DATA PRIVACY & ENCRYPTION</Text>
              </View>
              <Text style={styles.docTitle}>Privacy Policy</Text>
              <Text style={styles.docMeta}>Last updated: July 28, 2026 • GDPR & DPDP Compliant</Text>
            </View>

            {/* Section 1 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>1</Text>
                </View>
                <Text style={styles.sectionTitle}>Information We Collect</Text>
              </View>
              <Text style={styles.sectionBody}>
                To enable peer-to-peer delivery coordination and fraud prevention, we collect:
              </Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={moderateScale(15)} color="#0D9488" />
                  <Text style={styles.bulletText}>Account information: Name, verified email, and phone number</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={moderateScale(15)} color="#0D9488" />
                  <Text style={styles.bulletText}>KYC identity documents: Government ID and selfie verification</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={moderateScale(15)} color="#0D9488" />
                  <Text style={styles.bulletText}>Trip and parcel details: Flight route, weight, dimensions, and photos</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={moderateScale(15)} color="#0D9488" />
                  <Text style={styles.bulletText}>Payment data: Processed via PCI-DSS compliant secure gateways</Text>
                </View>
              </View>
            </View>

            {/* Section 2 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>2</Text>
                </View>
                <Text style={styles.sectionTitle}>256-Bit AES Data Security</Text>
              </View>
              <Text style={styles.sectionBody}>
                All sensitive data, identity documents, and in-app communications are protected with
                end-to-end encryption in transit (TLS 1.3) and at rest (AES-256). We maintain
                enterprise-grade server infrastructure aligned with Google & Meta security
                standards.
              </Text>
            </View>

            {/* Section 3 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>3</Text>
                </View>
                <Text style={styles.sectionTitle}>Zero Selling of Personal Data</Text>
              </View>
              <Text style={styles.sectionBody}>
                Flyorago strictly never sells, rents, or monetizes your personal data or phone
                number to advertisers or third parties. Information is only utilized to complete
                shipments, verify KYC compliance, and ensure passenger safety.
              </Text>
            </View>

            {/* Section 4 */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumber}>4</Text>
                </View>
                <Text style={styles.sectionTitle}>Your Rights & Data Control</Text>
              </View>
              <Text style={styles.sectionBody}>
                You have full rights to request access, correction, or deletion of your account and
                personal records at any time through our Privacy Center or by contacting
                support@flyorago.me.
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Confirmation Button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={onBack}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#0D9488', '#0F766E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.doneBtnGradient}
          >
            <Text style={styles.doneBtnText}>I Understand & Agree</Text>
            <Ionicons name="checkmark-done" size={moderateScale(18)} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  waterGlowOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: 'rgba(45, 212, 191, 0.22)',
    zIndex: 0,
  },
  planeArtWrap: {
    position: 'absolute',
    top: verticalScale(20),
    right: -10,
    width: scale(200),
    height: scale(200),
    opacity: 0.12,
    zIndex: 0,
  },
  planeArt: {
    width: '100%',
    height: '100%',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#CCFBF1',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    zIndex: 3,
  },
  backBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  logoBadge: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(10),
    backgroundColor: '#E6FAF6',
    borderWidth: 1,
    borderColor: '#99F6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogo: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  headerTitle: {
    fontSize: fontScale(15.5),
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: fontScale(11.2),
    color: '#0D9488',
    fontWeight: '600',
  },
  headerRightPlaceholder: {
    width: moderateScale(38),
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: moderateScale(18),
    marginTop: verticalScale(12),
    marginBottom: verticalScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: moderateScale(16),
    padding: 4,
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  tabButtonActive: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: verticalScale(10),
  },
  tabInactiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: verticalScale(10),
  },
  tabTextActive: {
    fontSize: fontScale(13),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tabTextInactive: {
    fontSize: fontScale(13),
    fontWeight: '600',
    color: '#64748B',
  },
  scrollArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(18),
    paddingTop: verticalScale(8),
    alignItems: 'center',
  },
  contentWrap: {
    width: '100%',
    maxWidth: 540,
  },
  docHeader: {
    alignItems: 'center',
    marginVertical: verticalScale(12),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E6FAF6',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(6),
  },
  verifiedBadgeText: {
    fontSize: fontScale(10.5),
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  docTitle: {
    fontSize: fontScale(22),
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.4,
  },
  docMeta: {
    fontSize: fontScale(11.5),
    color: '#64748B',
    marginTop: verticalScale(3),
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: moderateScale(16),
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    marginBottom: verticalScale(8),
  },
  sectionNumberCircle: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumber: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: fontScale(14.5),
    fontWeight: '800',
    color: '#062738',
    flex: 1,
  },
  sectionBody: {
    fontSize: fontScale(13),
    color: '#334155',
    lineHeight: fontScale(19),
    fontWeight: '500',
  },
  sectionBodyNotice: {
    fontSize: fontScale(12.2),
    color: '#0F766E',
    lineHeight: fontScale(17),
    fontWeight: '600',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(8),
  },
  bulletList: {
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
    gap: verticalScale(6),
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(8),
  },
  bulletText: {
    fontSize: fontScale(12.5),
    color: '#475569',
    lineHeight: fontScale(18),
    flex: 1,
    fontWeight: '500',
  },
  doneBtn: {
    width: '100%',
    maxWidth: 540,
    height: verticalScale(50),
    minHeight: 48,
    borderRadius: moderateScale(15),
    overflow: 'hidden',
    marginTop: verticalScale(10),
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  doneBtnGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  doneBtnText: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
