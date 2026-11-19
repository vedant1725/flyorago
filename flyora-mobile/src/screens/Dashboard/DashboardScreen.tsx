import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, Trip, Shipment, MOCK_TRIPS, MOCK_SHIPMENTS } from '../../services/api';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  onNavigateTab: (tabName: string) => void;
  onOpenChat?: () => void;
  onPostTrip?: () => void;
  onPostShipment?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateTab,
  onOpenChat,
  onPostTrip,
  onPostShipment,
}) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Vedant';

  const loadData = async () => {
    try {
      const tripsRes = await apiFetch('/api/trips/');
      if (tripsRes.success && Array.isArray(tripsRes.data)) {
        setTrips(tripsRes.data);
      }
      const shipmentsRes = await apiFetch('/api/shipments/');
      if (shipmentsRes.success && Array.isArray(shipmentsRes.data)) {
        setShipments(shipmentsRes.data);
      }
    } catch {
      // Fallback to mock data gracefully
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
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
        {/* Top Header Card matching Reference Image */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#033D37', '#065F56', '#089A8D']}
            locations={[0, 0.45, 1]}
            style={styles.headerGradient}
          >
            {/* Background Airplane & Globe Art */}
            <View style={styles.headerPlaneArtWrap} pointerEvents="none">
              <Image
                source={require('../../../assets/images/home-header-plane.png')}
                style={styles.headerPlaneArt}
                resizeMode="contain"
              />
            </View>

            {/* Top Bar with Greeting on Left & Facebook Messenger Style Chat on Right */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.welcomeGreeting}>Welcome back,</Text>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{firstName}</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#2DD4BF" />
                </View>
              </View>

              {/* Facebook Messenger Style Floating Chat Button */}
              <TouchableOpacity
                style={styles.messengerBtn}
                onPress={onOpenChat || (() => onNavigateTab('chat'))}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
                <View style={styles.messengerBadge}>
                  <Text style={styles.messengerBadgeText}>1</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Status Badges: KYC Verified & Rating */}
            <View style={styles.statusBadgesRow}>
              <View style={styles.kycVerifiedPill}>
                <Ionicons name="shield-checkmark" size={13} color="#2DD4BF" />
                <Text style={styles.kycVerifiedText}>KYC Verified</Text>
              </View>

              <View style={styles.ratingPill}>
                <Ionicons name="star" size={13} color="#FBBF24" />
                <Text style={styles.ratingText}>4.95 Rating</Text>
              </View>
            </View>

            {/* 3 Glassmorphism Stat Cards */}
            <View style={styles.statsGrid}>
              {/* Stat 1: Active Parcels */}
              <View style={styles.statCard}>
                <View style={styles.statIconBox}>
                  <Ionicons name="cube-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statSub}>2 In Transit</Text>
              </View>

              {/* Stat 2: Direct Routes */}
              <View style={styles.statCard}>
                <View style={styles.statIconBox}>
                  <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{trips.length || 4}</Text>
                <Text style={styles.statSub}>Direct Routes</Text>
              </View>

              {/* Stat 3: Escrow Protected */}
              <View style={styles.statCard}>
                <View style={styles.statIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>$195</Text>
                <Text style={styles.statSub}>100% Protected</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Section 1: Quick Actions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.tealAccentBar} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionsGrid}>
            {/* Card 1: Send Package */}
            <View style={styles.actionCard}>
              <View style={styles.actionArtBox}>
                <Image
                  source={require('../../../assets/images/home-send-art.png')}
                  style={styles.actionArtImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Send Package</Text>
                <Text style={styles.actionCardSubtitle}>
                  Match with a verified traveler flying to your target city.
                </Text>

                <TouchableOpacity
                  style={styles.actionSolidBtn}
                  onPress={onPostShipment || (() => onNavigateTab('shipments'))}
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
                <Image
                  source={require('../../../assets/images/home-luggage-art.png')}
                  style={styles.actionArtImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Share Luggage</Text>
                <Text style={styles.actionCardSubtitle}>
                  Monetize your spare baggage space and earn up to $300/trip.
                </Text>

                <TouchableOpacity
                  style={styles.actionOutlineBtn}
                  onPress={onPostTrip || (() => onNavigateTab('trips'))}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionOutlineBtnText}>List Your Flight</Text>
                  <Ionicons name="arrow-forward" size={14} color="#034C45" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Active Traveler Routes */}
        <View style={styles.sectionContainer}>
          <View style={styles.routesHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.tealAccentBar} />
              <Text style={styles.sectionTitle}>Active Traveler Routes</Text>
            </View>

            <TouchableOpacity
              onPress={() => onNavigateTab('trips')}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            >
              <Text style={styles.viewAllText}>View All ({trips.length}) &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Reference Route Card */}
          <TouchableOpacity
            style={styles.routeCard}
            onPress={() => onNavigateTab('trips')}
            activeOpacity={0.9}
          >
            {/* Background city skyline art */}
            <View style={styles.routeBgArtWrap} pointerEvents="none">
              <Image
                source={require('../../../assets/images/home-route-bg.png')}
                style={styles.routeBgArt}
                resizeMode="cover"
              />
            </View>

            <View style={styles.routeContentRow}>
              {/* Origin City */}
              <View style={styles.routeStationCol}>
                <Text style={styles.airportCodeText}>BOM</Text>
                <Text style={styles.cityNameText}>Mumbai</Text>
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
                <Text style={styles.airportCodeText}>DXB</Text>
                <Text style={styles.cityNameText}>Dubai</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    ...Shadows.card,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 20,
    paddingBottom: 26,
    position: 'relative',
  },
  headerPlaneArtWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 28,
    right: -10,
    width: 220,
    height: 160,
    opacity: 0.65,
  },
  headerPlaneArt: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 2,
  },
  welcomeGreeting: {
    fontSize: 13,
    color: '#A7D9D3',
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  userName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  messengerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  messengerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#2DD4BF',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#033D37',
  },
  messengerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#033D37',
  },
  statusBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    zIndex: 2,
  },
  kycVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.45)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  kycVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    zIndex: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 22,
    paddingHorizontal: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tealAccentBar: {
    width: 3.5,
    height: 18,
    backgroundColor: '#089A8D',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#062738',
    letterSpacing: -0.3,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: '#D8F3ED',
    overflow: 'hidden',
    ...Shadows.card,
  },
  actionArtBox: {
    height: 85,
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
    padding: 12,
    alignItems: 'center',
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#062738',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    textAlign: 'center',
    marginBottom: 14,
    height: 45,
  },
  actionSolidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#034C45',
    borderRadius: BorderRadius.pill,
    paddingVertical: 9,
    paddingHorizontal: 12,
    width: '100%',
    gap: 4,
  },
  actionSolidBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#034C45',
    borderRadius: BorderRadius.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    gap: 4,
  },
  actionOutlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#034C45',
  },
  routesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#089A8D',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: '#D8F3ED',
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.card,
  },
  routeBgArtWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    opacity: 0.18,
  },
  routeBgArt: {
    width: '100%',
    height: '100%',
  },
  routeContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  routeStationCol: {
    flex: 1,
  },
  airportCodeText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.5,
  },
  cityNameText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  flightGraphicCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1.4,
  },
  dottedPath: {
    fontSize: 12,
    color: '#93C5BD',
    letterSpacing: 2,
  },
  planeCircleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FAF6',
    borderWidth: 1.2,
    borderColor: '#089A8D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
