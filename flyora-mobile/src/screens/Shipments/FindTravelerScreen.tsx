import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getSafeHeaderPaddingTop,
  fontScale,
  scale,
  moderateScale,
} from '../../constants/responsive';
import { FlyoraColors, Shadows } from '../../constants/theme';
import { AppAlert as Alert } from '../../components/AppAlertModal';

interface FindTravelerScreenProps {
  request: any;
  matchingTravelers: any[];
  bookings: any[];
  onBack: () => void;
  onSendRequest: (travelerTrip: any) => Promise<void>;
  isSendingRequest: boolean;
}

export const FindTravelerScreen: React.FC<FindTravelerScreenProps> = ({
  request,
  matchingTravelers,
  bookings,
  onBack,
  onSendRequest,
  isSendingRequest,
}) => {
  const insets = useSafeAreaInsets();
  const [sendingTripId, setSendingTripId] = useState<number | string | null>(null);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const radarAnim = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    // Radar scanning pulse loop
    const radarLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(radarAnim, {
            toValue: 1.35,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(radarAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(radarOpacity, {
            toValue: 0.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(radarOpacity, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    radarLoop.start();
    return () => radarLoop.stop();
  }, []);

  const handleActionClick = async (traveler: any) => {
    setSendingTripId(traveler.id);
    try {
      await onSendRequest(traveler);
    } finally {
      setSendingTripId(null);
    }
  };

  const reqWeight = parseFloat(request?.capacity_weight || 1);
  const reqCategory = request?.aircraft || request?.package_name || 'Parcel';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. LIQUID WATERCOLOR GRADIENT (MATCHES LOGIN / SIGNUP THEME) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#A7F3D0', '#CCFBF1', '#E6FAF6', '#F4FBF9', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.18, 0.38, 0.6, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Glow Waves & Airplane Watermark */}
      <View style={styles.waterGlowCircle} pointerEvents="none" />
      <View style={styles.planeArtWrap} pointerEvents="none">
        <ExpoImage
          source={require('../../../assets/images/home-header-plane.png')}
          style={styles.planeArt}
          contentFit="contain"
          priority="high"
        />
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. TOP HEADER (LIQUID WATERCOLOR HEADER WITH BACK BUTTON)     */}
        {/* ───────────────────────────────────────────────────────────── */}
        <View style={[styles.topHeaderBar, { paddingTop: getSafeHeaderPaddingTop(insets.top) + 4 }]}>
          <TouchableOpacity style={styles.backBtnCircle} onPress={onBack} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={scale(22)} color="#0D9488" />
          </TouchableOpacity>

          <View style={styles.topHeaderTextWrap}>
            <View style={styles.radarPillBadge}>
              <Animated.View
                style={[
                  styles.radarPulseDot,
                  {
                    transform: [{ scale: radarAnim }],
                    opacity: radarOpacity,
                  },
                ]}
              />
              <Text style={[styles.radarPillText, { fontSize: fontScale(10) }]}>LIVE RADAR SCAN</Text>
            </View>
            <Text style={[styles.topHeaderMainTitle, { fontSize: fontScale(20) }]} numberOfLines={1}>
              Find Matching Travelers
            </Text>
          </View>

          <View style={styles.matchesCountBadge}>
            <Text style={[styles.matchesCountBadgeText, { fontSize: fontScale(12) }]}>
              {matchingTravelers.length} {matchingTravelers.length === 1 ? 'Match' : 'Matches'}
            </Text>
          </View>
        </View>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. SCROLL CONTENT AREA                                        */}
        {/* ───────────────────────────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Request Summary Glass Card */}
          <View style={styles.requestSummaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={styles.packageCategoryPill}>
                <Ionicons name="cube-outline" size={scale(13)} color="#0D9488" />
                <Text style={[styles.packageCategoryPillText, { fontSize: fontScale(11) }]}>
                  {reqCategory.toUpperCase()}
                </Text>
              </View>
              <View style={styles.weightBadge}>
                <Ionicons name="scale-outline" size={scale(12)} color="#047857" />
                <Text style={[styles.weightBadgeText, { fontSize: fontScale(11) }]}>
                  {reqWeight.toFixed(1)} KG Required
                </Text>
              </View>
            </View>

            {/* Route Box with Emerald Airplane */}
            <View style={styles.summaryRouteBox}>
              <View style={styles.summaryRouteCol}>
                <Text style={[styles.summaryRouteLabel, { fontSize: fontScale(9) }]}>PICKUP (FROM)</Text>
                <Text style={[styles.summaryRouteCity, { fontSize: fontScale(14) }]} numberOfLines={1}>
                  {request?.from_location || 'Origin'}
                </Text>
              </View>

              <View style={styles.airplaneFlightWrap}>
                <View style={styles.flightDottedLine} />
                <View style={styles.airplaneIconCenter}>
                  <Ionicons name="airplane" size={scale(16)} color="#FFFFFF" />
                </View>
              </View>

              <View style={[styles.summaryRouteCol, { alignItems: 'flex-end' }]}>
                <Text style={[styles.summaryRouteLabel, { fontSize: fontScale(9) }]}>DROPOFF (TO)</Text>
                <Text style={[styles.summaryRouteCity, { fontSize: fontScale(14) }]} numberOfLines={1}>
                  {request?.to_location || 'Destination'}
                </Text>
              </View>
            </View>
          </View>

          {/* Matching Criteria Banner */}
          <View style={styles.criteriaBanner}>
            <Ionicons name="checkmark-done-circle" size={scale(18)} color="#0D9488" />
            <Text style={[styles.criteriaBannerText, { fontSize: fontScale(11) }]}>
              Verified travelers flying the exact same route with available luggage space ≥ {reqWeight} KG
            </Text>
          </View>

          {/* Section Heading */}
          <Text style={[styles.travelersListHeading, { fontSize: fontScale(12) }]}>
            AVAILABLE FLIGHTS ({matchingTravelers.length})
          </Text>

          {/* ───────────────────────────────────────────────────────── */}
          {/* 4. MATCHING TRAVELERS CARDS OR ZERO-STATE                 */}
          {/* ───────────────────────────────────────────────────────── */}
          {matchingTravelers.length === 0 ? (
            <View style={styles.zeroStateCard}>
              <View style={styles.zeroStateRadarCircle}>
                <Animated.View
                  style={[
                    styles.zeroRadarWave,
                    {
                      transform: [{ scale: radarAnim }],
                      opacity: radarOpacity,
                    },
                  ]}
                />
                <View style={styles.zeroIconInner}>
                  <Ionicons name="search" size={scale(32)} color="#0D9488" />
                </View>
              </View>
              <Text style={[styles.zeroStateTitle, { fontSize: fontScale(16) }]}>
                No Matching Travelers Found
              </Text>
              <Text style={[styles.zeroStateDesc, { fontSize: fontScale(12) }]}>
                Currently, no travelers have scheduled flights from{' '}
                <Text style={{ fontWeight: '800', color: '#0F172A' }}>{request?.from_location}</Text> to{' '}
                <Text style={{ fontWeight: '800', color: '#0F172A' }}>{request?.to_location}</Text> with at least{' '}
                <Text style={{ fontWeight: '800', color: '#0D9488' }}>{reqWeight} KG</Text> available space.
              </Text>

              <View style={styles.zeroStateHintBox}>
                <Ionicons name="notifications-outline" size={scale(16)} color="#D97706" />
                <Text style={[styles.zeroStateHintText, { fontSize: fontScale(11) }]}>
                  We'll automatically alert you via push notification as soon as a verified traveler posts a matching flight!
                </Text>
              </View>

              <TouchableOpacity style={styles.returnBtn} onPress={onBack} activeOpacity={0.85}>
                <Ionicons name="arrow-back" size={scale(16)} color="#FFFFFF" />
                <Text style={[styles.returnBtnText, { fontSize: fontScale(13) }]}>Back to My Packages</Text>
              </TouchableOpacity>
            </View>
          ) : (
            matchingTravelers.map((traveler) => {
              const isAlreadyRequested =
                Array.isArray(bookings) &&
                bookings.some(
                  (b: any) =>
                    b &&
                    Number(b.trip?.id || b.trip_id || b.trip) === Number(traveler.id) &&
                    Number(b.sender_trip?.id || b.sender_trip_id || b.sender_trip) === Number(request?.id) &&
                    b.status !== 'CANCELLED' &&
                    b.status !== 'REJECTED'
                );

              const travName =
                traveler.traveler_name ||
                traveler.user?.name ||
                (traveler.user && typeof traveler.user === 'object' && traveler.user.first_name
                  ? `${traveler.user.first_name} ${traveler.user.last_name || ''}`.trim()
                  : null) ||
                'Verified Traveler';
              const initialLetter = travName.trim().charAt(0).toUpperCase() || 'T';
              const availWeight = parseFloat(traveler.available_weight) || 0;
              const airlineName =
                traveler.airline && traveler.airline !== 'TRAVELER_TRIP'
                  ? traveler.airline
                  : 'Commercial Airline';
              const pricePerKg = parseFloat(traveler.price_per_kg) || 10;
              const calculatedReward = (reqWeight * pricePerKg).toFixed(2);
              const isCurrentSending = isSendingRequest && sendingTripId === traveler.id;

              return (
                <View key={traveler.id} style={styles.travelerMatchCard}>
                  {/* Top Row: Avatar + Name + Verification + Departure Date */}
                  <View style={styles.travelerTopRow}>
                    <View style={styles.travelerAvatar}>
                      <Text style={[styles.travelerAvatarText, { fontSize: fontScale(15) }]}>
                        {initialLetter}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: scale(10) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.travelerNameText, { fontSize: fontScale(14) }]} numberOfLines={1}>
                          {travName}
                        </Text>
                        <Ionicons name="checkmark-circle" size={scale(15)} color="#0D9488" style={{ marginLeft: 4 }} />
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Ionicons name="calendar-outline" size={scale(12)} color="#64748B" />
                        <Text style={[styles.travelerDateText, { fontSize: fontScale(11) }]}>
                          Flight: {traveler.departure_date || 'Upcoming'}
                        </Text>
                      </View>
                    </View>

                    {/* Trust Verified Badge */}
                    <View style={styles.trustBadgePill}>
                      <Ionicons name="shield-checkmark" size={scale(11)} color="#059669" />
                      <Text style={[styles.trustBadgeText, { fontSize: fontScale(9) }]}>VERIFIED</Text>
                    </View>
                  </View>

                  {/* Flight Info Strip */}
                  <View style={styles.travelerFlightStrip}>
                    <View style={styles.flightDetailCol}>
                      <Text style={[styles.flightDetailLabel, { fontSize: fontScale(9) }]}>AIRLINE</Text>
                      <Text style={[styles.flightDetailVal, { fontSize: fontScale(12) }]} numberOfLines={1}>
                        {airlineName}
                      </Text>
                    </View>
                    <View style={styles.flightDetailDivider} />
                    <View style={styles.flightDetailCol}>
                      <Text style={[styles.flightDetailLabel, { fontSize: fontScale(9) }]}>SPACE AVAILABLE</Text>
                      <Text style={[styles.flightDetailVal, { fontSize: fontScale(12), color: '#0D9488' }]}>
                        {availWeight.toFixed(1)} KG
                      </Text>
                    </View>
                    <View style={styles.flightDetailDivider} />
                    <View style={styles.flightDetailCol}>
                      <Text style={[styles.flightDetailLabel, { fontSize: fontScale(9) }]}>EST. REWARD</Text>
                      <Text style={[styles.flightDetailVal, { fontSize: fontScale(12), color: '#059669' }]}>
                        ₹{calculatedReward}
                      </Text>
                    </View>
                  </View>

                  {/* Card Bottom: Route & Send Request Action */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.routeMiniPill}>
                      <Text style={[styles.routeMiniText, { fontSize: fontScale(10) }]} numberOfLines={1}>
                        {traveler.from_location} → {traveler.to_location}
                      </Text>
                    </View>

                    {isAlreadyRequested ? (
                      <View style={styles.alreadyRequestedBadge}>
                        <Ionicons name="checkmark-circle" size={scale(14)} color="#059669" />
                        <Text style={[styles.alreadyRequestedText, { fontSize: fontScale(11) }]}>Request Sent</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.sendRequestBtn, isCurrentSending && { opacity: 0.7 }]}
                        onPress={() => handleActionClick(traveler)}
                        disabled={isSendingRequest}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={['#0D9488', '#089A8D', '#065F56']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.sendRequestGradient}
                        >
                          {isCurrentSending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Ionicons name="paper-plane" size={scale(13)} color="#FFFFFF" />
                              <Text style={[styles.sendRequestBtnText, { fontSize: fontScale(12) }]}>Send Request</Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },

  // Liquid Watercolor Glow Elements (Matches Login Screen)
  waterGlowCircle: {
    position: 'absolute',
    top: -scale(120),
    right: -scale(100),
    width: scale(320),
    height: scale(320),
    borderRadius: scale(160),
    backgroundColor: 'rgba(45, 212, 191, 0.28)',
  },
  planeArtWrap: {
    position: 'absolute',
    top: scale(50),
    right: -scale(30),
    width: scale(240),
    height: scale(200),
    opacity: 0.16,
  },
  planeArt: {
    width: '100%',
    height: '100%',
  },

  // Top Header Bar
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(18),
    paddingBottom: scale(14),
  },
  backBtnCircle: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    ...Shadows.sm,
  },
  topHeaderTextWrap: {
    flex: 1,
    marginLeft: scale(12),
  },
  radarPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(12),
    marginBottom: 2,
  },
  radarPulseDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#0D9488',
    marginRight: scale(5),
  },
  radarPillText: {
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.6,
  },
  topHeaderMainTitle: {
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.3,
  },
  matchesCountBadge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(14),
  },
  matchesCountBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: scale(18),
    paddingTop: scale(8),
  },

  // Request Summary Card
  requestSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(22),
    padding: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(204, 251, 241, 0.8)',
    marginBottom: scale(12),
    ...Shadows.card,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  packageCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF6',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    gap: scale(5),
  },
  packageCategoryPillText: {
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  weightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    gap: scale(4),
  },
  weightBadgeText: {
    fontWeight: '800',
    color: '#059669',
  },
  summaryRouteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(16),
    paddingHorizontal: scale(14),
    paddingVertical: scale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRouteCol: {
    flex: 1,
  },
  summaryRouteLabel: {
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  summaryRouteCity: {
    fontWeight: '800',
    color: '#0F172A',
  },
  airplaneFlightWrap: {
    width: scale(60),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: scale(8),
  },
  flightDottedLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
    position: 'absolute',
  },
  airplaneIconCenter: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  // Criteria Banner
  criteriaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: scale(14),
    paddingHorizontal: scale(12),
    paddingVertical: scale(9),
    marginBottom: scale(16),
    gap: scale(8),
  },
  criteriaBannerText: {
    flex: 1,
    color: '#0F766E',
    fontWeight: '600',
    lineHeight: scale(16),
  },

  travelersListHeading: {
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: scale(10),
    marginLeft: scale(2),
  },

  // Matching Traveler Card
  travelerMatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(22),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: scale(14),
    ...Shadows.card,
  },
  travelerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  travelerAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerAvatarText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  travelerNameText: {
    fontWeight: '800',
    color: '#0F172A',
  },
  travelerDateText: {
    color: '#64748B',
    marginLeft: scale(4),
  },
  trustBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(10),
    gap: scale(4),
  },
  trustBadgeText: {
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },

  travelerFlightStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(14),
    paddingVertical: scale(10),
    paddingHorizontal: scale(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: scale(12),
  },
  flightDetailCol: {
    alignItems: 'center',
    flex: 1,
  },
  flightDetailLabel: {
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  flightDetailVal: {
    fontWeight: '800',
    color: '#0F172A',
  },
  flightDetailDivider: {
    width: 1,
    height: scale(22),
    backgroundColor: '#E2E8F0',
  },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: scale(4),
  },
  routeMiniPill: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(10),
    marginRight: scale(10),
  },
  routeMiniText: {
    color: '#475569',
    fontWeight: '600',
  },
  alreadyRequestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(12),
    gap: scale(5),
  },
  alreadyRequestedText: {
    color: '#059669',
    fontWeight: '800',
  },
  sendRequestBtn: {
    borderRadius: scale(12),
    overflow: 'hidden',
    ...Shadows.sm,
  },
  sendRequestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    gap: scale(5),
  },
  sendRequestBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Zero State View
  zeroStateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(24),
    padding: scale(24),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(204, 251, 241, 0.8)',
    ...Shadows.card,
  },
  zeroStateRadarCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(14),
    position: 'relative',
  },
  zeroRadarWave: {
    position: 'absolute',
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
  },
  zeroIconInner: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2DD4BF',
    zIndex: 2,
  },
  zeroStateTitle: {
    fontWeight: '900',
    color: '#062738',
    marginBottom: scale(6),
  },
  zeroStateDesc: {
    color: '#64748B',
    textAlign: 'center',
    lineHeight: scale(18),
    marginBottom: scale(16),
  },
  zeroStateHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: scale(10),
    marginBottom: scale(20),
    gap: scale(8),
  },
  zeroStateHintText: {
    flex: 1,
    color: '#92400E',
    lineHeight: scale(15),
    fontWeight: '500',
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: scale(18),
    paddingVertical: scale(12),
    borderRadius: scale(14),
    gap: scale(6),
    ...Shadows.sm,
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
