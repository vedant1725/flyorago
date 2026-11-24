import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FlyoraColors, Shadows, BorderRadius } from '../../constants/theme';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TripDetailsScreen } from './TripDetailsScreen';
import { CreateTripScreen } from './CreateTripScreen';
import { AllTravelerTripsScreen } from './AllTravelerTripsScreen';
import { AppAlert as Alert } from '../../components/AppAlertModal';
import { KycValidationModal } from '../../components/KycValidationModal';
import { getSafeHeaderPaddingTop, scale, fontScale } from '../../constants/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Global cache for traveler dashboard so tab switching never shows wrong or flickering values
let cachedTravelerData: {
  trips: any[];
  totalEarnings: number;
  completedCount: number;
  deliveredCount: number;
} | null = null;

interface TripsScreenProps {
  onOpenChat?: () => void;
  onOpenProfile?: () => void;
  onOpenTripDetails?: (tripId: number | string) => void;
  onNavigateToKyc?: () => void;
}

export const TripsScreen: React.FC<TripsScreenProps> = ({
  onOpenChat,
  onOpenProfile,
  onOpenTripDetails,
  onNavigateToKyc,
}) => {
  const { user, kycStatus } = useAuth();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<any[]>(cachedTravelerData?.trips || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  // KYC validation modal
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const isKycApproved = (kycStatus || user?.kycStatus || '').toUpperCase() === 'APPROVED';

  const handleStartCreateTrip = () => {
    if (!isKycApproved) {
      setIsKycModalOpen(true);
      return;
    }
    setIsCreatingTrip(true);
  };

  // Stats from backend / bookings (Uses cached data first to eliminate any flashing)
  const [totalEarnings, setTotalEarnings] = useState<number>(
    cachedTravelerData?.totalEarnings !== undefined ? cachedTravelerData.totalEarnings : 0.0
  );
  const [completedCount, setCompletedCount] = useState<number>(
    cachedTravelerData?.completedCount !== undefined ? cachedTravelerData.completedCount : 0
  );
  const [deliveredCount, setDeliveredCount] = useState<number>(
    cachedTravelerData?.deliveredCount !== undefined ? cachedTravelerData.deliveredCount : 0
  );

  // Pulse animation for header Create button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  // Subscreens state inside Trips tab
  const [selectedTripId, setSelectedTripId] = useState<number | string | null>(null);
  const [selectedTripItem, setSelectedTripItem] = useState<any | null>(null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  const fetchTripsAndStats = useCallback(async () => {
    try {
      // 1. Fetch dashboard overview matching Web Traveler page
      const overviewRes = await apiFetch('/api/traveler/dashboard-overview/');
      let tripList: any[] = [];
      let earnings = 0.0;
      let delivered = 0;
      let completed = 0;

      if (overviewRes.success && overviewRes.data) {
        const rawTrips = Array.isArray(overviewRes.data.trips) ? overviewRes.data.trips : [];
        tripList = rawTrips.filter((t: any) => t.airline !== 'SENDER_REQUEST');
        setTrips(tripList);

        if (typeof overviewRes.data.total_earnings === 'number') {
          earnings = overviewRes.data.total_earnings;
        }
        if (typeof overviewRes.data.completed_trips === 'number') {
          completed = overviewRes.data.completed_trips;
        }
        if (typeof overviewRes.data.delivered_packages === 'number') {
          delivered = overviewRes.data.delivered_packages;
        }
      } else {
        // Fallback: direct trips endpoint
        const tripsRes = await apiFetch('/api/trips/?user_only=true&page_size=100');
        if (tripsRes.success && tripsRes.data) {
          const raw = Array.isArray(tripsRes.data.results)
            ? tripsRes.data.results
            : Array.isArray(tripsRes.data)
              ? tripsRes.data
              : [];
          tripList = raw.filter((t: any) => t.airline !== 'SENDER_REQUEST');
          setTrips(tripList);
        }
      }

      setTotalEarnings(earnings);
      setCompletedCount(completed);
      setDeliveredCount(delivered);

      // Update cache
      cachedTravelerData = {
        trips: tripList,
        totalEarnings: earnings,
        completedCount: completed,
        deliveredCount: delivered,
      };
    } catch (e) {
      console.log('Error fetching traveler trips:', e);
    }
  }, []);

  useEffect(() => {
    fetchTripsAndStats();
  }, [fetchTripsAndStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTripsAndStats();
    setRefreshing(false);
  };

  const handleDeleteTrip = (tripId: number | string) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiFetch(`/api/trips/${tripId}/`, { method: 'DELETE' });
              if (res.success) {
                setTrips((prev) => prev.filter((t) => t.id !== tripId));
                Alert.alert('Deleted', 'Trip deleted successfully');
              }
            } catch {
              Alert.alert('Error', 'Failed to delete trip');
            }
          },
        },
      ]
    );
  };

  // Filtered trips list matching web
  const filteredTrips = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return trips.filter((t) => {
      const matchesSearch =
        !q ||
        (t.from_location && t.from_location.toLowerCase().includes(q)) ||
        (t.to_location && t.to_location.toLowerCase().includes(q)) ||
        (t.available_weight && String(t.available_weight).includes(q));

      const matchesStatus =
        statusFilter === 'All' ||
        (t.status || 'Active').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [trips, searchQuery, statusFilter]);

  // Top 3 Active Trips for Main Screen (as requested by user)
  const topActiveTrips = useMemo(() => {
    const activeOnly = filteredTrips.filter((t) => {
      const s = (t.status || 'Active').toUpperCase();
      return s === 'ACTIVE' || s === 'IN_TRANSIT';
    });
    // If not enough active trips, fallback to first 3 of filtered trips
    const sourceList = activeOnly.length > 0 ? activeOnly : filteredTrips;
    return sourceList.slice(0, 3);
  }, [filteredTrips]);

  // If viewing all trips in dedicated screen
  if (isViewAllOpen) {
    return (
      <AllTravelerTripsScreen
        trips={trips}
        onBack={() => setIsViewAllOpen(false)}
        onSelectTrip={(trip) => {
          setIsViewAllOpen(false);
          setSelectedTripItem(trip);
          setSelectedTripId(trip.id || trip.trip_id || null);
        }}
        onDeleteTrip={handleDeleteTrip}
        onRefresh={fetchTripsAndStats}
        refreshing={refreshing}
        onOpenChat={onOpenChat}
      />
    );
  }

  // If viewing details of a specific trip
  if (selectedTripId) {
    return (
      <TripDetailsScreen
        tripId={selectedTripId}
        initialTrip={selectedTripItem}
        onBack={() => {
          setSelectedTripId(null);
          setSelectedTripItem(null);
        }}
        onOpenChat={onOpenChat}
      />
    );
  }

  // If creating a new trip
  if (isCreatingTrip) {
    return (
      <CreateTripScreen
        onBack={() => setIsCreatingTrip(false)}
        onTripCreated={() => {
          setIsCreatingTrip(false);
          fetchTripsAndStats();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* ── ONLY TOP EMERALD HEADER STAYS FIXED (Exact same as Sender & Profile) ── */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#033D37', '#065F56', '#089A8D']}
          locations={[0, 0.45, 1]}
          style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
        >
          {/* Top Bar: Title & Action Buttons */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.headerSubtitle}>TRAVEL & LOGISTICS</Text>
              <View style={styles.nameRow}>
                <Text style={styles.headerTitle}>Trip & Earn</Text>
                <Ionicons name="airplane" size={20} color="#2DD4BF" style={{ marginLeft: 6 }} />
              </View>
            </View>

            <View style={styles.headerIconsRow}>
              {/* Prominent Animated Post Trip CTA Button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.headerPostTripBtn}
                  onPress={handleStartCreateTrip}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#2DD4BF', '#089A8D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerPostTripGradient}
                  >
                    <Ionicons name="add-circle" size={scale(17)} color="#FFFFFF" />
                    <Text style={styles.headerPostTripText}>Post Trip</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Total Earnings Highlight in Header (Signature Mobile Theme) */}
          <View style={styles.earningsBanner}>
            <View style={styles.earningsLeft}>
              <Text style={styles.earningsLabel}>TOTAL TRAVELER EARNINGS</Text>
              <View style={styles.earningsAmountRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <Text style={styles.earningsMain}>{Math.floor(totalEarnings).toLocaleString()}</Text>
                <Text style={styles.earningsDecimal}>.{(totalEarnings % 1).toFixed(2).substring(2)}</Text>
              </View>
            </View>

            <View style={styles.statusPills}>
              <View style={styles.activePill}>
                <Ionicons name="flash" size={12} color="#2DD4BF" />
                <Text style={styles.activePillText}>Live Rates</Text>
              </View>
            </View>
          </View>

          {/* 3 Glassmorphism Stat Cards */}
          <View style={styles.statsGrid}>
            {/* Stat 1: Listed Trips */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Ionicons name="airplane" size={17} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{String(trips.length).padStart(2, '0')}</Text>
              <Text style={styles.statSub}>• Active Routes</Text>
            </View>

            {/* Stat 2: Delivered Packages */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Ionicons name="cube-outline" size={17} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{String(deliveredCount).padStart(2, '0')}</Text>
              <Text style={styles.statSub}>• Delivered</Text>
            </View>

            {/* Stat 3: Completed Deliveries */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Ionicons name="checkmark-done-circle-outline" size={17} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{String(completedCount).padStart(2, '0')}</Text>
              <Text style={styles.statSub}>• Completed</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ── SCROLLABLE LIST WITH SEARCH, FILTER & ROUTES ALL SCROLLING TOGETHER ── */}
      <FlatList
        data={topActiveTrips}
        keyExtractor={(item) => `trip-${item.id}`}
        contentContainerStyle={styles.tripsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[FlyoraColors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Search & Filter Section (Now scrolls smoothly together with trips) */}
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by city, airport (AMD, Surat, Idar)..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Pills */}
              <View style={styles.filterPillsRow}>
                {(['All', 'Active', 'Completed'] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterPill, statusFilter === f && styles.filterPillActive]}
                    onPress={() => setStatusFilter(f)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        statusFilter === f && styles.filterPillTextActive,
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section Heading: My Listed Routes with View All button on the right */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithBar}>
                <View style={styles.tealAccentBar} />
                <Text style={styles.sectionTitle}>
                  My Listed Routes ({topActiveTrips.length}{trips.length > 3 ? ` of ${trips.length}` : ''})
                </Text>
              </View>

              {/* View All Button on Right Side */}
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => setIsViewAllOpen(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.viewAllBtnText}>View All</Text>
                <Ionicons name="chevron-forward" size={14} color="#089A8D" />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyTripsCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="airplane-outline" size={28} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTripsTitle}>No trips listed</Text>
            <Text style={styles.emptyTripsSubtitle}>
              Monetize your unused luggage space by listing your upcoming flight, train, or road route.
            </Text>
            <TouchableOpacity
              style={styles.emptyCreateBtn}
              onPress={handleStartCreateTrip}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={17} color="#FFFFFF" />
              <Text style={styles.emptyCreateBtnText}>Post a Trip</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: trip }) => {
          const tripId = trip.id;
          const fromLoc = trip.from_location || 'Ahmedabad (AMD)';
          const toLoc = trip.to_location || 'Surat (STV)';
          const depDate = trip.departure_date || '2026-11-18';
          const space = trip.available_weight || trip.capacity_weight || '15.00';
          const rate = trip.price_per_kg || '10.00';
          const rawStatus = (trip.status || 'Active').trim();
          const displayStatus = rawStatus.toUpperCase();

          // Dynamic status colors based on actual backend status
          const isCompleted = displayStatus === 'COMPLETED' || displayStatus === 'PAYMENT_RELEASED';
          const isPending = displayStatus === 'PENDING' || displayStatus === 'REQUEST_CREATED';
          const isCancelled = displayStatus === 'CANCELLED' || displayStatus === 'REJECTED';

          const bookingsCount = typeof trip.bookings_count === 'number'
            ? trip.bookings_count
            : Array.isArray(trip.bookings)
              ? trip.bookings.length
              : 0;

          return (
            <TouchableOpacity
              style={styles.tripCard}
              onPress={() => setSelectedTripId(tripId)}
              activeOpacity={0.88}
            >
              {/* Trip Card Top Row */}
              <View style={styles.tripCardHeader}>
                <View style={styles.tripNumberPill}>
                  <Ionicons name="navigate-circle" size={14} color="#089A8D" />
                  <Text style={styles.tripNumberText}>TRIP #{tripId}</Text>
                </View>
                <View
                  style={[
                    styles.tripStatusBadge,
                    isCompleted && styles.tripStatusBadgeCompleted,
                    isPending && styles.tripStatusBadgePending,
                    isCancelled && styles.tripStatusBadgeCancelled,
                  ]}
                >
                  <Text
                    style={[
                      styles.tripStatusText,
                      isCompleted && styles.tripStatusTextCompleted,
                      isPending && styles.tripStatusTextPending,
                      isCancelled && styles.tripStatusTextCancelled,
                    ]}
                  >
                    {rawStatus}
                  </Text>
                </View>
              </View>

              {/* Date Row */}
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={13} color="#089A8D" />
                <Text style={styles.dateText}>{depDate}</Text>
              </View>

              {/* Route: From -> To (Clean Mobile Alignment) */}
              <View style={styles.routeBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeHeader}>FROM</Text>
                  <Text style={styles.cityName} numberOfLines={1}>
                    {fromLoc}
                  </Text>
                </View>

                <View style={styles.routePlaneIconBox}>
                  <Ionicons name="airplane" size={16} color="#089A8D" />
                </View>

                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.routeHeader}>TO</Text>
                  <Text style={[styles.cityName, { textAlign: 'right' }]} numberOfLines={1}>
                    {toLoc}
                  </Text>
                </View>
              </View>

              {/* Space & Rate Metrics */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>AVAILABLE SPACE</Text>
                  <Text style={styles.metricValue}>{space} KG</Text>
                </View>
                <View style={[styles.metricItem, { alignItems: 'flex-end' }]}>
                  <Text style={styles.metricLabel}>EARNING RATE</Text>
                  <Text style={[styles.metricValue, { color: '#089A8D' }]}>₹{rate}/kg</Text>
                </View>
              </View>

              {/* Bottom Action Buttons */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.viewRequestsBtn}
                  onPress={() => {
                    setSelectedTripItem(trip);
                    setSelectedTripId(tripId);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="eye" size={15} color="#FFFFFF" />
                  <Text style={styles.viewRequestsBtnText}>View Requests</Text>
                  {bookingsCount > 0 && (
                    <View style={styles.reqCountBadge}>
                      <Text style={styles.reqCountBadgeText}>{bookingsCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteTripBtn}
                  onPress={() => handleDeleteTrip(tripId)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* KYC Validation Modal */}
      <KycValidationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        kycStatus={kycStatus}
        actionTitle="Posting a flight and sharing luggage"
        onNavigateToKyc={() => {
          setIsKycModalOpen(false);
          if (onNavigateToKyc) onNavigateToKyc();
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
  tripsListContent: {
    paddingTop: 4,
    paddingBottom: 90,
  },
  header: {
    backgroundColor: '#033D37',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    ...Shadows.card,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#99F6E4',
    letterSpacing: 1.2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerPostTripBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  headerPostTripGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  headerPostTripText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 24,
    right: 18,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#033D37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  floatingAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
  },
  floatingAddText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 16,
  },
  earningsLeft: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#99F6E4',
    letterSpacing: 0.8,
  },
  earningsAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2DD4BF',
    marginRight: 2,
  },
  earningsMain: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  earningsDecimal: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusPills: {
    alignItems: 'flex-end',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(45, 212, 191, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2DD4BF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CCFBF1',
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleWithBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tealAccentBar: {
    width: 4,
    height: 18,
    backgroundColor: '#089A8D',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E6FAF6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 3,
  },
  viewAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#089A8D',
  },
  newTripLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#089A8D',
  },
  emptyTripsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginHorizontal: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTripsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyTripsSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#089A8D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyCreateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripNumberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripNumberText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E293B',
  },
  tripStatusBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tripStatusBadgeCompleted: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  tripStatusBadgePending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  tripStatusBadgeCancelled: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  tripStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  tripStatusTextCompleted: {
    color: '#2563EB',
  },
  tripStatusTextPending: {
    color: '#D97706',
  },
  tripStatusTextCancelled: {
    color: '#E11D48',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  routeHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cityName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  routePlaneIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6FAF6',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewRequestsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#033D37',
    borderRadius: 12,
    height: 40,
  },
  viewRequestsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reqCountBadge: {
    backgroundColor: '#2DD4BF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  reqCountBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#033D37',
  },
  deleteTripBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
