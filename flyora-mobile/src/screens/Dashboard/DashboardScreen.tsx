import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, Trip, Shipment } from '../../services/api';
import { getSafeHeaderPaddingTop, scale, verticalScale, fontScale } from '../../constants/responsive';
import { KycValidationModal } from '../../components/KycValidationModal';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  onNavigateTab: (tabName: string) => void;
  onOpenChat?: () => void;
  onOpenNotifications?: () => void;
  onOpenTrust?: () => void;
  onPostTrip?: () => void;
  onPostShipment?: () => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
}

interface DashboardCache {
  trips: Trip[];
  shipments: Shipment[];
  trustScore: number;
  activeTrip: any;
  activeSenderRequest: any;
  pendingCount: number;
  activeTripCount: number;
}

let cachedDashboardData: DashboardCache | null = null;

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateTab,
  onOpenChat,
  onOpenNotifications,
  onOpenTrust,
  onPostTrip,
  onPostShipment,
  unreadNotificationsCount = 2,
  unreadMessagesCount = 0,
}) => {
  const { user, kycStatus } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Instantly initialize state from memory cache so there is ZERO delay & ZERO blank state upon login/render
  const [trips, setTrips] = useState<Trip[]>(() => cachedDashboardData?.trips || []);
  const [shipments, setShipments] = useState<Shipment[]>(() => cachedDashboardData?.shipments || []);
  const [trustScore, setTrustScore] = useState<number>(() => cachedDashboardData?.trustScore || 850);
  const [activeTrip, setActiveTrip] = useState<any>(() => cachedDashboardData?.activeTrip || null);
  const [activeSenderRequest, setActiveSenderRequest] = useState<any>(() => cachedDashboardData?.activeSenderRequest || null);
  const [pendingCount, setPendingCount] = useState<number>(() => cachedDashboardData?.pendingCount || 0);
  const [activeTripCount, setActiveTripCount] = useState<number>(() => cachedDashboardData?.activeTripCount || 0);

  // KYC Guard Modal state
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycActionTitle, setKycActionTitle] = useState('This feature');

  const isKycApproved = (kycStatus || user?.kycStatus || '').toUpperCase() === 'APPROVED';

  const handleGuardedAction = (actionType: 'trip' | 'shipment') => {
    if (!isKycApproved) {
      setKycActionTitle(actionType === 'trip' ? 'Listing a Flight & Luggage' : 'Sending a Package Request');
      setIsKycModalOpen(true);
      return;
    }
    if (actionType === 'trip') {
      if (onPostTrip) onPostTrip();
      else onNavigateTab('trips');
    } else {
      if (onPostShipment) onPostShipment();
      else onNavigateTab('shipments');
    }
  };

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Akash';

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch live overview endpoint matching Web Dashboard exactly
      const overviewRes = await apiFetch('/api/user/dashboard-overview/');
      if (overviewRes.success && overviewRes.data) {
        const data = overviewRes.data;

        let parsedTrips: Trip[] = [];
        let parsedActiveTrip: any = null;
        let parsedActiveSenderRequest: any = null;
        let parsedActiveTripCount = 0;
        let parsedShipments: Shipment[] = [];
        let parsedPendingCount = 0;
        let parsedTrustScore = trustScore;

        // Trips & Sender Requests separation
        if (Array.isArray(data.trips)) {
          parsedTrips = data.trips;
          setTrips(data.trips);

          // 1. Genuine Traveler Trip (excluding SENDER_REQUEST)
          parsedActiveTrip = data.trips.find(
            (t: any) =>
              t.airline !== 'SENDER_REQUEST' &&
              (t.status === 'Active' || t.status === 'IN_TRANSIT' || t.status === 'REQUEST_CREATED')
          ) || null;
          setActiveTrip(parsedActiveTrip);

          // 2. Sender Package Request
          parsedActiveSenderRequest = data.trips.find(
            (t: any) =>
              t.airline === 'SENDER_REQUEST' &&
              (t.status === 'Active' || t.status === 'IN_TRANSIT' || t.status === 'REQUEST_CREATED')
          ) || null;
          setActiveSenderRequest(parsedActiveSenderRequest);

          parsedActiveTripCount = data.trips.filter(
            (t: any) => t.airline !== 'SENDER_REQUEST' && (t.status === 'Active' || t.status === 'IN_TRANSIT')
          ).length;
          setActiveTripCount(parsedActiveTripCount);
        } else {
          setTrips([]);
          setActiveTrip(null);
          setActiveSenderRequest(null);
          setActiveTripCount(0);
        }

        // Trust Score from overview
        if (data.trustProfile?.score) {
          parsedTrustScore = data.trustProfile.score;
          setTrustScore(data.trustProfile.score);
        }

        // Bookings / Shipments
        if (Array.isArray(data.bookings)) {
          parsedShipments = data.bookings;
          setShipments(data.bookings);
          parsedPendingCount = data.bookings.filter(
            (b: any) => b.status === 'Pending' || b.status === 'REQUEST_CREATED'
          ).length;
          setPendingCount(parsedPendingCount);
        } else {
          setShipments([]);
          setPendingCount(0);
        }

        // Save into persistent memory cache for instantaneous instant-load on subsequent opens
        cachedDashboardData = {
          trips: parsedTrips,
          shipments: parsedShipments,
          trustScore: parsedTrustScore,
          activeTrip: parsedActiveTrip,
          activeSenderRequest: parsedActiveSenderRequest,
          pendingCount: parsedPendingCount,
          activeTripCount: parsedActiveTripCount,
        };
      } else {
        setTrips([]);
        setShipments([]);
        setActiveTrip(null);
        setActiveSenderRequest(null);
        setActiveTripCount(0);
        setPendingCount(0);
      }

      // 2. Also ensure latest live Trust Profile score is fetched directly from /api/trust/profile/
      const trustRes = await apiFetch('/api/trust/profile/');
      if (trustRes.success && trustRes.data) {
        const tData = trustRes.data?.data ? trustRes.data.data : trustRes.data;
        if (typeof tData.score === 'number') {
          setTrustScore(tData.score);
          if (cachedDashboardData) {
            cachedDashboardData.trustScore = tData.score;
          }
        }
      }
    } catch {
      // Offline fallback
    }
  }, [trustScore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Helper to extract clean airport code
  const getAirportCode = (loc: string, fallback: string) => {
    if (!loc) return fallback;
    const match = loc.match(/\(([A-Z]{3})\)/);
    if (match) return match[1];
    return loc.substring(0, 3).toUpperCase();
  };

  // Helper to extract clean city name
  const getCityName = (loc: string, fallback: string) => {
    if (!loc) return fallback;
    return loc.replace(/\s*\([A-Z]{3}\)/, '').split(',')[0].trim();
  };

  const displayFromCode = activeTrip ? getAirportCode(activeTrip.from_location, 'AMD') : '';
  const displayFromCity = activeTrip ? getCityName(activeTrip.from_location, '') : '';
  const displayToCode = activeTrip ? getAirportCode(activeTrip.to_location, 'STV') : '';
  const displayToCity = activeTrip ? getCityName(activeTrip.to_location, '') : '';

  const availableCapacity = activeTrip?.available_weight || activeTrip?.capacity_weight || '0';
  const totalCapacity = activeTrip?.capacity_weight || '0';
  const journeyDate = activeTrip?.departure_date || '';

  // Active Sender Request Display helpers
  const senderFromCode = activeSenderRequest ? getAirportCode(activeSenderRequest.from_location, 'AMD') : '';
  const senderFromCity = activeSenderRequest ? getCityName(activeSenderRequest.from_location, '') : '';
  const senderToCode = activeSenderRequest ? getAirportCode(activeSenderRequest.to_location, 'STV') : '';
  const senderToCity = activeSenderRequest ? getCityName(activeSenderRequest.to_location, '') : '';
  const senderWeight = activeSenderRequest?.capacity_weight || '1.0';
  const senderDate = activeSenderRequest?.departure_date || 'Flexible';

  return (
    <View style={styles.container}>
      {/* Top Header Card matching Reference Image Exactly (Fixed above ScrollView like Wallet) */}
      <View style={styles.header}>
          <LinearGradient
            colors={['#033D37', '#065F56', '#089A8D']}
            locations={[0, 0.45, 1]}
            style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
          >
            {/* Background Airplane & Globe Art */}
            <View style={styles.headerPlaneArtWrap} pointerEvents="none">
              <ExpoImage
                source={require('../../../assets/images/home-header-plane.png')}
                style={styles.headerPlaneArt}
                contentFit="contain"
                priority="high"
                cachePolicy="memory-disk"
              />
            </View>

            {/* Top Bar with Greeting on Left & Notification + Messenger on Right */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.welcomeGreeting}>Welcome Back,</Text>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{firstName}!</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#2DD4BF" />
                </View>
              </View>

              {/* Header Action Buttons (Notification Bell + Facebook Messenger Chat) */}
              <View style={styles.headerIconsRow}>
                {/* Notification Bell with Real-time Count Badge */}
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={onOpenNotifications || (() => onNavigateTab('notifications'))}
                  activeOpacity={0.8}
                >
                  <Ionicons name="notifications" size={20} color="#FFFFFF" />
                  {unreadNotificationsCount > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Facebook Messenger Style Floating Chat Button */}
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={onOpenChat || (() => onNavigateTab('chat'))}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
                  {unreadMessagesCount > 0 && (
                    <View style={styles.messengerBadge}>
                      <Text style={styles.messengerBadgeText}>
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Badges: KYC Verified & Rating (Tap on Trust Score opens Trust Screen) */}
            <View style={styles.statusBadgesRow}>
              <TouchableOpacity
                style={styles.kycVerifiedPill}
                onPress={() => onNavigateTab('kyc')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark" size={13} color="#2DD4BF" />
                <Text style={styles.kycVerifiedText}>KYC Verified</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ratingPill}
                onPress={onOpenTrust || (() => onNavigateTab('trust'))}
                activeOpacity={0.8}
              >
                <Ionicons name="star" size={13} color="#FBBF24" />
                <Text style={styles.ratingText}>Trust Score: {trustScore}/1000</Text>
                <Ionicons name="chevron-forward" size={11} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            </View>

            {/* 3 Glassmorphism Stat Cards (Connected with Local DB Stats) */}
            <View style={styles.statsGrid}>
              {/* Stat 1: Active Trips */}
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => onNavigateTab('trips')}
                activeOpacity={0.85}
              >
                <View style={styles.statIconBox}>
                  <Ionicons name="airplane" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>
                  {String(activeTripCount).padStart(2, '0')}
                </Text>
                <Text style={styles.statSub}>• {activeTripCount} Active</Text>
              </TouchableOpacity>

              {/* Stat 2: Pending Bookings / Shipments */}
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => onNavigateTab('shipments')}
                activeOpacity={0.85}
              >
                <View style={styles.statIconBox}>
                  <Ionicons name="cube-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>
                  {String(pendingCount).padStart(2, '0')}
                </Text>
                <Text style={styles.statSub}>• {pendingCount} Pending</Text>
              </TouchableOpacity>

              {/* Stat 3: AI Trust Live (Tap opens Trust Score Screen) */}
              <TouchableOpacity
                style={styles.statCard}
                onPress={onOpenTrust || (() => onNavigateTab('trust'))}
                activeOpacity={0.85}
              >
                <View style={styles.statIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{trustScore}</Text>
                <Text style={styles.statSub}>AI Live Score</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* ── Scrollable Body: Quick Actions, Traveler Journey & Sender Parcels (Header stays Fixed) ── */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[FlyoraColors.primary]}
            />
          }
        >
          {/* Section 1: Quick Actions (Unchanged Mobile UI) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.tealAccentBar} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionsGrid}>
            {/* Card 1: Send Package */}
            <View style={styles.actionCard}>
              <View style={styles.actionArtBox}>
                <ExpoImage
                  source={require('../../../assets/images/home-send-art.png')}
                  style={styles.actionArtImage}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>

              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Send Package</Text>
                <Text style={styles.actionCardSubtitle}>
                  Match with a verified traveler flying to your target city.
                </Text>

                <TouchableOpacity
                  style={styles.actionSolidBtn}
                  onPress={() => handleGuardedAction('shipment')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionSolidBtnText}>Create Request</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 2: Share Luggage */}
            <View style={styles.actionCard}>
              <View style={styles.actionArtBox}>
                <ExpoImage
                  source={require('../../../assets/images/home-luggage-art.png')}
                  style={styles.actionArtImage}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>

              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Share Luggage</Text>
                <Text style={styles.actionCardSubtitle}>
                  Monetize your spare baggage space and earn up to $300/trip.
                </Text>

                <TouchableOpacity
                  style={styles.actionOutlineBtn}
                  onPress={() => handleGuardedAction('trip')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionOutlineBtnText}>List Your Flight</Text>
                  <Ionicons name="arrow-forward" size={14} color="#034C45" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Active Traveler Journey Overview (Only Traveler Trips - Clean Background without duplicate overlap) */}
        <View style={styles.sectionContainer}>
          <View style={styles.routesHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.tealAccentBar} />
              <Text style={styles.sectionTitle}>Active Traveler Journey</Text>
            </View>

            <TouchableOpacity
              onPress={() => onNavigateTab('trips')}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            >
              <Text style={styles.viewAllText}>View All ({activeTripCount}) &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Traveler Route Card populated with real backend journey or clean empty state */}
          {activeTrip ? (
            <TouchableOpacity
              style={styles.routeCard}
              onPress={() => onNavigateTab('trips')}
              activeOpacity={0.9}
            >
              {/* Subtle Elegant Gradient Accent */}
              <LinearGradient
                colors={['rgba(240, 253, 250, 0.95)', 'rgba(255, 255, 255, 1)']}
                style={StyleSheet.absoluteFill}
              />

              {/* Top Journey Badge & Available Space */}
              <View style={styles.journeyTopBadgeRow}>
                <View style={styles.journeyStatusBadge}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.journeyBadgeText}>
                    TRAVELER ROUTE • {journeyDate || 'UPCOMING'}
                  </Text>
                </View>

                <View style={styles.availableSpacePill}>
                  <Text style={styles.spaceLabel}>AVAILABLE</Text>
                  <Text style={styles.spaceValue}>{availableCapacity} KG</Text>
                </View>
              </View>

              <View style={styles.routeContentRow}>
                {/* Origin City */}
                <View style={styles.routeStationCol}>
                  <Text style={styles.airportCodeText}>{displayFromCode}</Text>
                  <Text style={styles.cityNameText} numberOfLines={1}>
                    {displayFromCity}
                  </Text>
                </View>

                {/* Center Flight Graphic with Teal Circle Plane */}
                <View style={styles.flightGraphicCenter}>
                  <Text style={styles.dottedPath}>• • • • •</Text>
                  <View style={styles.planeCircleBadge}>
                    <Ionicons name="airplane" size={16} color="#089A8D" />
                  </View>
                  <Text style={styles.dottedPath}>• • • • •</Text>
                </View>

                {/* Destination City */}
                <View style={[styles.routeStationCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.airportCodeText}>{displayToCode}</Text>
                  <Text style={styles.cityNameText} numberOfLines={1}>
                    {displayToCity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyJourneyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="airplane-outline" size={26} color="#0D9488" />
              </View>
              <Text style={styles.emptyJourneyTitle}>No Active Traveler Journey</Text>
              <Text style={styles.emptyJourneySub}>
                List your upcoming flight to share baggage and earn on your travel.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => handleGuardedAction('trip')}
                activeOpacity={0.88}
              >
                <Text style={styles.emptyActionBtnText}>+ Create New Trip</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section 3: Active Sender Parcel Requests (Only Sender Packages) */}
        <View style={styles.sectionContainer}>
          <View style={styles.routesHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={[styles.tealAccentBar, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.sectionTitle}>Active Sender Parcel Request</Text>
            </View>

            <TouchableOpacity
              onPress={() => onNavigateTab('shipments')}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            >
              <Text style={styles.viewAllText}>View All &gt;</Text>
            </TouchableOpacity>
          </View>

          {activeSenderRequest ? (
            <TouchableOpacity
              style={styles.routeCard}
              onPress={() => onNavigateTab('shipments')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['rgba(255, 251, 235, 0.95)', 'rgba(255, 255, 255, 1)']}
                style={StyleSheet.absoluteFill}
              />

              {/* Top Badge & Weight */}
              <View style={styles.journeyTopBadgeRow}>
                <View style={[styles.journeyStatusBadge, { backgroundColor: '#FEF3C7' }]}>
                  <View style={[styles.greenPulseDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.journeyBadgeText, { color: '#B45309' }]}>
                    SENDER PARCEL • {senderDate}
                  </Text>
                </View>

                <View style={[styles.availableSpacePill, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                  <Text style={styles.spaceLabel}>PARCEL WT</Text>
                  <Text style={[styles.spaceValue, { color: '#D97706' }]}>{senderWeight} KG</Text>
                </View>
              </View>

              <View style={styles.routeContentRow}>
                {/* Pickup City */}
                <View style={styles.routeStationCol}>
                  <Text style={styles.airportCodeText}>{senderFromCode}</Text>
                  <Text style={styles.cityNameText} numberOfLines={1}>
                    {senderFromCity}
                  </Text>
                </View>

                {/* Center Graphic with Parcel Box */}
                <View style={styles.flightGraphicCenter}>
                  <Text style={styles.dottedPath}>• • • • •</Text>
                  <View style={[styles.planeCircleBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="cube" size={16} color="#D97706" />
                  </View>
                  <Text style={styles.dottedPath}>• • • • •</Text>
                </View>

                {/* Dropoff City */}
                <View style={[styles.routeStationCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.airportCodeText}>{senderToCode}</Text>
                  <Text style={styles.cityNameText} numberOfLines={1}>
                    {senderToCity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyJourneyCard}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="cube-outline" size={26} color="#D97706" />
              </View>
              <Text style={styles.emptyJourneyTitle}>No Active Parcel Request</Text>
              <Text style={styles.emptyJourneySub}>
                Have a package to deliver? Post a parcel request to match with verified travelers.
              </Text>
              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
                onPress={() => handleGuardedAction('shipment')}
                activeOpacity={0.88}
              >
                <Text style={[styles.emptyActionBtnText, { color: '#D97706' }]}>+ Post New Parcel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* KYC Validation Modal */}
      <KycValidationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        kycStatus={kycStatus}
        actionTitle={kycActionTitle}
        onNavigateToKyc={() => {
          setIsKycModalOpen(false);
          onNavigateTab('kyc');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },
  scrollContent: {
    paddingBottom: verticalScale(110),
  },
  header: {
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
    overflow: 'hidden',
    backgroundColor: '#033D37',
    ...Shadows.cardHover,
  },
  headerGradient: {
    paddingHorizontal: scale(18),
    paddingBottom: verticalScale(22),
    position: 'relative',
  },
  headerPlaneArtWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
    right: scale(-25),
    width: scale(240),
    height: verticalScale(180),
    opacity: 0.22,
    zIndex: 1,
  },
  headerPlaneArt: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    zIndex: 2,
  },
  welcomeGreeting: {
    fontSize: fontScale(12.5),
    color: '#A7D9D3',
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: verticalScale(2),
  },
  userName: {
    fontSize: fontScale(24),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  headerIconButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  messengerBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: scale(17),
    height: scale(17),
    borderRadius: scale(8.5),
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#033D37',
  },
  notifBadgeText: {
    fontSize: fontScale(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: scale(17),
    height: scale(17),
    borderRadius: scale(8.5),
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#033D37',
  },
  notificationBadgeText: {
    fontSize: fontScale(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  messengerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#2DD4BF',
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#033D37',
  },
  messengerBadgeText: {
    fontSize: fontScale(8.5),
    fontWeight: '900',
    color: '#033D37',
  },
  statusBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(16),
    zIndex: 2,
  },
  kycVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.45)',
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderRadius: BorderRadius.full,
    gap: scale(5),
  },
  kycVerifiedText: {
    fontSize: fontScale(10.5),
    fontWeight: '700',
    color: '#2DD4BF',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderRadius: BorderRadius.full,
    gap: scale(5),
  },
  ratingText: {
    fontSize: fontScale(10.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: scale(8),
    zIndex: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(16),
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: verticalScale(11),
    paddingHorizontal: scale(6),
    alignItems: 'center',
  },
  statIconBox: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  statValue: {
    fontSize: fontScale(18),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statSub: {
    fontSize: fontScale(9.5),
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  sectionContainer: {
    marginTop: verticalScale(18),
    paddingHorizontal: scale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(10),
  },
  tealAccentBar: {
    width: scale(3.5),
    height: verticalScale(17),
    backgroundColor: '#089A8D',
    borderRadius: scale(2),
  },
  sectionTitle: {
    fontSize: fontScale(16.5),
    fontWeight: '800',
    color: '#062738',
    letterSpacing: -0.3,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: scale(10),
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    borderWidth: 1.2,
    borderColor: '#D8F3ED',
    overflow: 'hidden',
    ...Shadows.card,
  },
  actionArtBox: {
    height: verticalScale(78),
    backgroundColor: '#F3FCFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6FAF6',
  },
  actionArtImage: {
    width: '90%',
    height: '80%',
  },
  actionCardContent: {
    padding: scale(10),
    alignItems: 'center',
  },
  actionCardTitle: {
    fontSize: fontScale(14),
    fontWeight: '800',
    color: '#062738',
    marginBottom: verticalScale(3),
    textAlign: 'center',
  },
  actionCardSubtitle: {
    fontSize: fontScale(10.5),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: fontScale(14.5),
    marginBottom: verticalScale(10),
    minHeight: verticalScale(42),
  },
  actionSolidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#089A8D',
    paddingVertical: verticalScale(9),
    paddingHorizontal: scale(10),
    borderRadius: scale(12),
    width: '100%',
    gap: scale(5),
    ...Shadows.card,
  },
  actionSolidBtnText: {
    color: '#FFFFFF',
    fontSize: fontScale(11.5),
    fontWeight: '800',
  },
  actionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CCF5EF',
    paddingVertical: verticalScale(9),
    paddingHorizontal: scale(10),
    borderRadius: scale(12),
    width: '100%',
    gap: scale(5),
  },
  actionOutlineBtnText: {
    color: '#034C45',
    fontSize: fontScale(11.5),
    fontWeight: '800',
  },
  routesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: fontScale(12),
    fontWeight: '700',
    color: '#089A8D',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    borderWidth: 1.2,
    borderColor: '#D8F3ED',
    padding: scale(16),
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.card,
  },
  emptyJourneyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    padding: scale(20),
    borderWidth: 1.2,
    borderColor: '#D8F3ED',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  emptyIconCircle: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  emptyJourneyTitle: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#062738',
    marginBottom: verticalScale(3),
  },
  emptyJourneySub: {
    fontSize: fontScale(11.5),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: fontScale(16),
    maxWidth: scale(280),
    marginBottom: verticalScale(12),
  },
  emptyActionBtn: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1.2,
    borderColor: '#99F6E4',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: scale(12),
  },
  emptyActionBtnText: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#0D9488',
  },
  routeBgArtWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(65),
    opacity: 0.12,
  },
  routeBgArt: {
    width: '100%',
    height: '100%',
  },
  journeyTopBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    paddingBottom: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  journeyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(8),
    gap: scale(5),
  },
  greenPulseDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#10B981',
  },
  journeyBadgeText: {
    fontSize: fontScale(9.5),
    fontWeight: '800',
    color: '#065F56',
    letterSpacing: 0.3,
  },
  availableSpacePill: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCF5EF',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(8),
    alignItems: 'flex-end',
  },
  spaceLabel: {
    fontSize: fontScale(8),
    fontWeight: '800',
    color: '#64748B',
  },
  spaceValue: {
    fontSize: fontScale(10.5),
    fontWeight: '900',
    color: '#089A8D',
  },
  routeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeStationCol: {
    minWidth: scale(75),
    maxWidth: scale(100),
  },
  airportCodeText: {
    fontSize: fontScale(20),
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.5,
  },
  cityNameText: {
    fontSize: fontScale(11),
    color: '#64748B',
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  flightGraphicCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    flex: 1,
    justifyContent: 'center',
  },
  dottedPath: {
    color: '#CBD5E1',
    letterSpacing: 2,
    fontSize: fontScale(9),
  },
  planeCircleBadge: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#CCF5EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
