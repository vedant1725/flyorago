import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
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
} from '../../constants/responsive';
import { FlyoraColors, Shadows } from '../../constants/theme';

export interface Trip {
  id?: number | string;
  trip_id?: number | string;
  origin?: string;
  destination?: string;
  travel_date?: string;
  flight_number?: string;
  airline?: string;
  available_capacity_kg?: number | string;
  price_per_kg?: number | string;
  status?: string;
  bookings_count?: number;
  bookings?: any[];
  [key: string]: any;
}

interface AllTravelerTripsScreenProps {
  trips: Trip[];
  onBack: () => void;
  onSelectTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: number | string) => void;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  onOpenChat?: () => void;
}

export const AllTravelerTripsScreen: React.FC<AllTravelerTripsScreenProps> = ({
  trips,
  onBack,
  onSelectTrip,
  onDeleteTrip,
  onRefresh,
  refreshing,
  onOpenChat,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Filtered list based on search and status tabs
  const filteredTrips = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return trips.filter((t) => {
      const matchSearch =
        !q ||
        (t.from_location && t.from_location.toLowerCase().includes(q)) ||
        (t.to_location && t.to_location.toLowerCase().includes(q)) ||
        (t.aircraft && t.aircraft.toLowerCase().includes(q)) ||
        String(t.id).includes(q);

      if (!matchSearch) return false;

      const rawStatus = (t.status || 'Active').toUpperCase();
      if (filter === 'active') {
        return rawStatus === 'ACTIVE' || rawStatus === 'IN_TRANSIT';
      }
      if (filter === 'completed') {
        return rawStatus === 'COMPLETED' || rawStatus === 'PAYMENT_RELEASED' || rawStatus === 'DELIVERED';
      }
      if (filter === 'cancelled') {
        return rawStatus === 'CANCELLED' || rawStatus === 'REJECTED';
      }
      return true;
    });
  }, [trips, searchQuery, filter]);

  const activeCount = useMemo(() => {
    return trips.filter((t) => {
      const s = (t.status || 'Active').toUpperCase();
      return s === 'ACTIVE' || s === 'IN_TRANSIT';
    }).length;
  }, [trips]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. EMERALD HEADER MATCHING NOTIFICATIONS SCREEN               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#033D37', '#065F56', '#089A8D']}
          locations={[0, 0.45, 1]}
          style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
        >
          {/* Background Airplane Watermark */}
          <View style={styles.headerPlaneArtWrap} pointerEvents="none">
            <ExpoImage
              source={require('../../../assets/images/home-header-plane.png')}
              style={styles.headerPlaneArt}
              contentFit="contain"
              priority="high"
            />
          </View>

          {/* Top Header Row with Back Button, Title & Count */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={onBack} style={styles.backBtnCircle} activeOpacity={0.75}>
              <Ionicons name="arrow-back" size={scale(22)} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <View style={styles.headerPillTag}>
                <Ionicons name="airplane-outline" size={scale(11)} color="#2DD4BF" />
                <Text style={[styles.headerPillTagText, { fontSize: fontScale(9) }]}>
                  TRAVELER ARCHIVE
                </Text>
              </View>
              <Text style={[styles.headerTitle, { fontSize: fontScale(20) }]} numberOfLines={1}>
                All Listed Routes
              </Text>
              <Text style={[styles.headerSub, { fontSize: fontScale(11) }]}>
                {trips.length} Total Route{trips.length === 1 ? '' : 's'} • {activeCount} Active Now
              </Text>
            </View>

            {onOpenChat && (
              <TouchableOpacity style={styles.chatIconBtn} onPress={onOpenChat} activeOpacity={0.8}>
                <Ionicons name="chatbubble-ellipses" size={scale(18)} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar inside Header */}
          <View style={styles.searchBarBox}>
            <Ionicons name="search" size={scale(17)} color="#A7D9D3" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { fontSize: fontScale(13) }]}
              placeholder="Search by city, airport (AMD, Surat, London)..."
              placeholderTextColor="#A7D9D3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={scale(17)} color="#A7D9D3" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. FILTER TABS ROW MATCHING NOTIFICATIONS SCREEN              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <View style={styles.filterTabsRow}>
        {(
          [
            { id: 'all', label: `All (${trips.length})` },
            { id: 'active', label: `Active (${activeCount})` },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ] as const
        ).map((tab) => {
          const isActive = filter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTabPill, isActive && styles.filterTabPillActive]}
              onPress={() => setFilter(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, { fontSize: fontScale(11) }, isActive && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. SCROLLABLE TRIP CARDS LIST                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 50 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[FlyoraColors.primary]}
          />
        }
      >
        {filteredTrips.length === 0 ? (
          <View style={styles.zeroStateCard}>
            <View style={styles.zeroIconBox}>
              <Ionicons name="airplane-outline" size={scale(32)} color="#089A8D" />
            </View>
            <Text style={[styles.zeroTitle, { fontSize: fontScale(16) }]}>No Routes Found</Text>
            <Text style={[styles.zeroSub, { fontSize: fontScale(12) }]}>
              {searchQuery
                ? `No travel route matched "${searchQuery}". Try searching for another city.`
                : 'No routes in this filter category.'}
            </Text>
          </View>
        ) : (
          filteredTrips.map((trip) => {
            const tripId = trip.id;
            const fromLoc = trip.from_location || 'Ahmedabad (AMD)';
            const toLoc = trip.to_location || 'Surat (STV)';
            const depDate = trip.departure_date || 'Upcoming';
            const space = trip.available_weight || trip.capacity_weight || '15.00';
            const rate = trip.price_per_kg || '10.00';
            const rawStatus = (trip.status || 'Active').trim();
            const displayStatus = rawStatus.toUpperCase();

            const isCompleted = displayStatus === 'COMPLETED' || displayStatus === 'PAYMENT_RELEASED';
            const isPending = displayStatus === 'PENDING' || displayStatus === 'REQUEST_CREATED';
            const isCancelled = displayStatus === 'CANCELLED' || displayStatus === 'REJECTED';

            const bookingsCount =
              typeof trip.bookings_count === 'number'
                ? trip.bookings_count
                : Array.isArray(trip.bookings)
                  ? trip.bookings.length
                  : 0;

            return (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => onSelectTrip(trip)}
                activeOpacity={0.88}
              >
                {/* Trip Card Top Row */}
                <View style={styles.tripCardHeader}>
                  <View style={styles.tripNumberPill}>
                    <Ionicons name="navigate-circle" size={scale(14)} color="#089A8D" />
                    <Text style={[styles.tripNumberText, { fontSize: fontScale(11) }]}>
                      TRIP #{tripId}
                    </Text>
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
                        { fontSize: fontScale(10) },
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
                  <Ionicons name="calendar-outline" size={scale(13)} color="#089A8D" />
                  <Text style={[styles.dateText, { fontSize: fontScale(12) }]}>{depDate}</Text>
                </View>

                {/* Route: From -> To */}
                <View style={styles.routeBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.routeHeader, { fontSize: fontScale(9) }]}>FROM</Text>
                    <Text style={[styles.cityName, { fontSize: fontScale(13) }]} numberOfLines={1}>
                      {fromLoc}
                    </Text>
                  </View>

                  <View style={styles.routePlaneIconBox}>
                    <Ionicons name="airplane" size={scale(15)} color="#089A8D" />
                  </View>

                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={[styles.routeHeader, { fontSize: fontScale(9) }]}>TO</Text>
                    <Text
                      style={[styles.cityName, { fontSize: fontScale(13), textAlign: 'right' }]}
                      numberOfLines={1}
                    >
                      {toLoc}
                    </Text>
                  </View>
                </View>

                {/* Space & Rate Metrics */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { fontSize: fontScale(9) }]}>AVAILABLE SPACE</Text>
                    <Text style={[styles.metricValue, { fontSize: fontScale(13) }]}>{space} KG</Text>
                  </View>
                  <View style={[styles.metricItem, { alignItems: 'flex-end' }]}>
                    <Text style={[styles.metricLabel, { fontSize: fontScale(9) }]}>EARNING RATE</Text>
                    <Text style={[styles.metricValue, { fontSize: fontScale(13), color: '#089A8D' }]}>
                      ₹{rate}/kg
                    </Text>
                  </View>
                </View>

                {/* Bottom Action Buttons */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.viewRequestsBtn}
                    onPress={() => onSelectTrip(trip)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye" size={scale(14)} color="#FFFFFF" />
                    <Text style={[styles.viewRequestsBtnText, { fontSize: fontScale(12) }]}>
                      View Requests
                    </Text>
                    {bookingsCount > 0 && (
                      <View style={styles.reqCountBadge}>
                        <Text style={[styles.reqCountBadgeText, { fontSize: fontScale(10) }]}>
                          {bookingsCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteTripBtn}
                    onPress={() => onDeleteTrip(tripId || '')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={scale(16)} color="#F43F5E" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },

  // Emerald Gradient Header
  header: {
    borderBottomLeftRadius: scale(28),
    borderBottomRightRadius: scale(28),
    overflow: 'hidden',
    backgroundColor: '#033D37',
    ...Shadows.card,
  },
  headerGradient: {
    paddingHorizontal: scale(18),
    paddingBottom: scale(20),
    position: 'relative',
  },
  headerPlaneArtWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 12,
    right: -25,
    width: scale(250),
    height: scale(190),
    opacity: 0.22,
    zIndex: 1,
  },
  headerPlaneArt: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(14),
    zIndex: 2,
  },
  backBtnCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: scale(12),
  },
  headerPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(12),
    marginBottom: 2,
  },
  headerPillTagText: {
    fontWeight: '800',
    color: '#2DD4BF',
    marginLeft: scale(4),
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: '#A7D9D3',
    marginTop: 1,
  },
  chatIconBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: scale(14),
    paddingHorizontal: scale(12),
    height: scale(44),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Filter Tabs
  filterTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(18),
    paddingVertical: scale(12),
    gap: scale(8),
  },
  filterTabPill: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabPillActive: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
  },
  filterTabText: {
    fontWeight: '700',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: scale(18),
    paddingTop: scale(4),
  },

  // Trip Card
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: scale(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  tripNumberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  tripNumberText: {
    fontWeight: '800',
    color: '#089A8D',
    marginLeft: scale(4),
  },
  tripStatusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tripStatusBadgeCompleted: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  tripStatusBadgePending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  tripStatusBadgeCancelled: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  tripStatusText: {
    fontWeight: '800',
    color: '#059669',
  },
  tripStatusTextCompleted: {
    color: '#64748B',
  },
  tripStatusTextPending: {
    color: '#D97706',
  },
  tripStatusTextCancelled: {
    color: '#EF4444',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
    gap: scale(4),
  },
  dateText: {
    color: '#64748B',
    fontWeight: '500',
  },

  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(14),
    padding: scale(12),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeHeader: {
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cityName: {
    fontWeight: '800',
    color: '#0F172A',
  },
  routePlaneIconBox: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(8),
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(14),
    paddingHorizontal: scale(4),
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontWeight: '800',
    color: '#0F172A',
  },

  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(10),
  },
  viewRequestsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#089A8D',
    borderRadius: scale(12),
    paddingVertical: scale(10),
    gap: scale(6),
  },
  viewRequestsBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  reqCountBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(10),
  },
  reqCountBadgeText: {
    color: '#089A8D',
    fontWeight: '900',
  },
  deleteTripBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Zero State
  zeroStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    padding: scale(24),
    alignItems: 'center',
    marginTop: scale(20),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  zeroIconBox: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(12),
  },
  zeroTitle: {
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: scale(4),
  },
  zeroSub: {
    color: '#64748B',
    textAlign: 'center',
    lineHeight: scale(18),
  },
});
