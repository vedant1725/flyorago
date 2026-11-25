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

export interface SenderRequest {
  id: number | string;
  aircraft?: string;
  from_location?: string;
  to_location?: string;
  departure_date?: string;
  capacity_weight?: number | string;
  package_name?: string;
  status?: string;
  [key: string]: any;
}

interface AllSenderShipmentsScreenProps {
  requests: SenderRequest[];
  bookings: any[];
  onBack: () => void;
  onSelectRequest: (req: SenderRequest) => void;
  onFindTraveler: (req: SenderRequest) => void;
  onDeleteRequest: (id: number) => void;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  onOpenChat?: () => void;
  onCreateRequest?: () => void;
}

type FilterTab = 'ALL' | 'ACTIVE' | 'IN_TRANSIT' | 'DELIVERED';

export const AllSenderShipmentsScreen: React.FC<AllSenderShipmentsScreenProps> = ({
  requests,
  bookings,
  onBack,
  onSelectRequest,
  onFindTraveler,
  onDeleteRequest,
  onRefresh,
  refreshing,
  onOpenChat,
  onCreateRequest,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts for filter chips
  const counts = useMemo(() => {
    let active = 0;
    let inTransit = 0;
    let delivered = 0;

    requests.forEach((r) => {
      const linkedBk = bookings.find(
        (b) =>
          (b.sender_trip && String(b.sender_trip) === String(r.id)) ||
          (b.trip && String(b.trip) === String(r.id)) ||
          (b.trip_details && String(b.trip_details.id) === String(r.id))
      );
      const bStatus = linkedBk?.status || 'PENDING';

      if (
        bStatus === 'PENDING' ||
        bStatus === 'REQUESTED' ||
        bStatus === 'ACCEPTED' ||
        bStatus === 'PAID'
      ) {
        active++;
      } else if (
        bStatus === 'IN_TRANSIT' ||
        bStatus === 'OUT_FOR_DELIVERY' ||
        bStatus === 'PARCEL_VERIFIED'
      ) {
        inTransit++;
      } else if (bStatus === 'DELIVERED' || bStatus === 'PAYMENT_RELEASED') {
        delivered++;
      }
    });

    return {
      ALL: requests.length,
      ACTIVE: active,
      IN_TRANSIT: inTransit,
      DELIVERED: delivered,
    };
  }, [requests, bookings]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (r.from_location && r.from_location.toLowerCase().includes(q)) ||
        (r.to_location && r.to_location.toLowerCase().includes(q)) ||
        (r.aircraft && r.aircraft.toLowerCase().includes(q)) ||
        String(r.id).includes(q);

      if (!matchSearch) return false;

      const linkedBk = bookings.find(
        (b) =>
          (b.sender_trip && String(b.sender_trip) === String(r.id)) ||
          (b.trip && String(b.trip) === String(r.id)) ||
          (b.trip_details && String(b.trip_details.id) === String(r.id))
      );
      const bStatus = linkedBk?.status || 'PENDING';

      if (selectedFilter === 'ACTIVE') {
        return (
          bStatus === 'PENDING' ||
          bStatus === 'REQUESTED' ||
          bStatus === 'ACCEPTED' ||
          bStatus === 'PAID'
        );
      }
      if (selectedFilter === 'IN_TRANSIT') {
        return (
          bStatus === 'IN_TRANSIT' ||
          bStatus === 'OUT_FOR_DELIVERY' ||
          bStatus === 'PARCEL_VERIFIED'
        );
      }
      if (selectedFilter === 'DELIVERED') {
        return bStatus === 'DELIVERED' || bStatus === 'PAYMENT_RELEASED';
      }
      return true;
    });
  }, [requests, bookings, searchQuery, selectedFilter]);

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Packages', count: counts.ALL },
    { key: 'ACTIVE', label: 'Active & Paid', count: counts.ACTIVE },
    { key: 'IN_TRANSIT', label: 'In Transit', count: counts.IN_TRANSIT },
    { key: 'DELIVERED', label: 'Delivered', count: counts.DELIVERED },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Fixed Emerald Watercolor Gradient Header (Matching Notifications / All Trips) ── */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#033D37', '#065F56', '#089A8D']}
          locations={[0, 0.45, 1]}
          style={[
            styles.headerGradient,
            { paddingTop: getSafeHeaderPaddingTop(insets.top) },
          ]}
        >
          {/* Background Plane Artwork watermark */}
          <View style={styles.planeArtWrap} pointerEvents="none">
            <ExpoImage
              source={require('../../../assets/images/home-header-plane.png')}
              style={styles.planeArt}
              contentFit="contain"
              priority="high"
              cachePolicy="memory-disk"
            />
          </View>

          {/* Top Row: Back button, Title & Badge, Optional Chat */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={scale(20)} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <View style={styles.titleWithIconRow}>
                <Text style={styles.headerTitle}>All Package Requests</Text>
                <View style={styles.totalBadge}>
                  <Text style={styles.totalBadgeText}>{requests.length}</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>
                Complete list of your outbound parcel shipments
              </Text>
            </View>

            {onOpenChat && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={onOpenChat}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={scale(19)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar Embedded in Header */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={scale(17)} color="#2DD4BF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search parcels, pickup/dropoff city..."
              placeholderTextColor="rgba(255, 255, 255, 0.65)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={scale(16)}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills in Header */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsScroll}
          >
            {filterTabs.map((tab) => {
              const active = selectedFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setSelectedFilter(tab.key)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      active && styles.filterPillTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  <View
                    style={[
                      styles.pillCountBadge,
                      active && styles.pillCountBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillCountText,
                        active && styles.pillCountTextActive,
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </LinearGradient>
      </View>

      {/* ── Scrollable List of All Requests ── */}
      <ScrollView
        style={styles.scrollArea}
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
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="cube-outline"
                size={scale(40)}
                color={FlyoraColors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>No Packages Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No packages match "${searchQuery}". Try a different keyword.`
                : 'You do not have any package requests in this category.'}
            </Text>
            {onCreateRequest && (
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={onCreateRequest}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={scale(16)} color="#FFFFFF" />
                <Text style={styles.emptyActionBtnText}>Post New Parcel</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredRequests.map((req) => {
            const linkedBk = bookings.find(
              (b) =>
                (b.sender_trip && String(b.sender_trip) === String(req.id)) ||
                (b.trip && String(b.trip) === String(req.id)) ||
                (b.trip_details && String(b.trip_details.id) === String(req.id))
            );

            const hasTraveler = Boolean(
              linkedBk && (linkedBk.traveler || linkedBk.traveler_name)
            );
            const isDelivered =
              linkedBk?.status === 'DELIVERED' ||
              linkedBk?.status === 'PAYMENT_RELEASED';
            const isInTransit = [
              'IN_TRANSIT',
              'OUT_FOR_DELIVERY',
              'ARRIVED',
              'PARCEL_VERIFIED',
            ].includes(linkedBk?.status);
            const isPaid =
              linkedBk?.payment_status === 'Escrow Hold' ||
              linkedBk?.payment_status === 'PAID';

            let statusLabel = 'ACTIVE';
            let badgeBg = '#E0F2FE';
            let badgeColor = '#0369A1';

            if (isDelivered) {
              statusLabel = 'DELIVERED';
              badgeBg = '#DCFCE7';
              badgeColor = '#15803D';
            } else if (isInTransit) {
              statusLabel =
                linkedBk?.status === 'PARCEL_VERIFIED'
                  ? 'PARCEL VERIFIED'
                  : 'IN TRANSIT';
              badgeBg = '#FEF3C7';
              badgeColor = '#B45309';
            } else if (isPaid) {
              statusLabel = 'PAID (ESCROW)';
              badgeBg = '#ECFDF5';
              badgeColor = '#047857';
            } else if (hasTraveler) {
              statusLabel = 'TRAVELER ASSIGNED';
              badgeBg = '#F3E8FF';
              badgeColor = '#7E22CE';
            }

            return (
              <View key={req.id} style={styles.requestCard}>
                {/* Top Row: Parcel Number & Status Badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.parcelIconWrap}>
                      <Ionicons
                        name="cube"
                        size={scale(17)}
                        color="#089A8D"
                      />
                    </View>
                    <View>
                      <Text style={styles.cardParcelId}>PARCEL #{req.id}</Text>
                      <Text style={styles.cardCategory}>
                        {req.aircraft || 'General Parcel'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[styles.statusBadge, { backgroundColor: badgeBg }]}
                  >
                    <Text
                      style={[styles.statusBadgeText, { color: badgeColor }]}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Route & Date Visual */}
                <View style={styles.routeContainer}>
                  <View style={styles.routeCol}>
                    <Text style={styles.routeLabel}>PICKUP</Text>
                    <Text style={styles.routeLocation} numberOfLines={1}>
                      {req.from_location || 'Origin'}
                    </Text>
                  </View>

                  <View style={styles.flightArrowCol}>
                    <Text style={styles.routeDateText}>
                      {req.departure_date || 'Flexible'}
                    </Text>
                    <View style={styles.arrowLineRow}>
                      <View style={styles.dotStart} />
                      <View style={styles.dashLine} />
                      <Ionicons
                        name="airplane"
                        size={scale(14)}
                        color="#089A8D"
                        style={{ marginHorizontal: 2 }}
                      />
                      <View style={styles.dashLine} />
                      <View style={styles.dotEnd} />
                    </View>
                  </View>

                  <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.routeLabel}>DROPOFF</Text>
                    <Text style={styles.routeLocation} numberOfLines={1}>
                      {req.to_location || 'Destination'}
                    </Text>
                  </View>
                </View>

                {/* Specifications Row */}
                <View style={styles.specsRow}>
                  <View style={styles.specItem}>
                    <Ionicons
                      name="scale-outline"
                      size={scale(14)}
                      color="#089A8D"
                    />
                    <Text style={styles.specText}>
                      {parseFloat(String(req.capacity_weight || 1)).toFixed(2)}{' '}
                      kg
                    </Text>
                  </View>
                  <View style={styles.specItem}>
                    <Ionicons
                      name="pricetag-outline"
                      size={scale(14)}
                      color="#089A8D"
                    />
                    <Text style={styles.specText}>
                      Category: {req.aircraft || 'General'}
                    </Text>
                  </View>
                </View>

                {/* Actions Row */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => onSelectRequest(req)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={scale(15)}
                      color="#089A8D"
                    />
                    <Text style={styles.detailsBtnText}>Details</Text>
                  </TouchableOpacity>

                  {/* Find Traveler Button */}
                  {!isDelivered && (
                    <TouchableOpacity
                      style={styles.findTravelerBtn}
                      onPress={() => onFindTraveler(req)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="search-outline"
                        size={scale(15)}
                        color="#FFFFFF"
                      />
                      <Text style={styles.findTravelerBtnText}>
                        Find Traveler
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Delete Request Button */}
                  {!isDelivered && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => onDeleteRequest(Number(req.id))}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={scale(17)}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
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
  header: {
    backgroundColor: '#033D37',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    ...Shadows.card,
  },
  headerGradient: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
  },
  planeArtWrap: {
    position: 'absolute',
    right: -scale(25),
    bottom: -scale(15),
    width: scale(200),
    height: scale(160),
    opacity: 0.16,
  },
  planeArt: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  titleWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  totalBadge: {
    backgroundColor: 'rgba(45, 212, 191, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2DD4BF',
  },
  totalBadgeText: {
    fontSize: fontScale(11),
    fontWeight: '800',
    color: '#2DD4BF',
  },
  headerSubtitle: {
    fontSize: fontScale(12),
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  chatBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: scale(14),
    paddingHorizontal: scale(12),
    paddingVertical: Platform.OS === 'ios' ? scale(9) : scale(6),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: scale(12),
    gap: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: fontScale(13),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterPillsScroll: {
    flexDirection: 'row',
    gap: scale(8),
    paddingVertical: scale(2),
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterPillText: {
    fontSize: fontScale(12),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  filterPillTextActive: {
    color: '#033D37',
  },
  pillCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  pillCountBadgeActive: {
    backgroundColor: '#E6FAF6',
  },
  pillCountText: {
    fontSize: fontScale(10),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pillCountTextActive: {
    color: '#089A8D',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(40),
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(22),
    padding: scale(30),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: scale(20),
    ...Shadows.card,
  },
  emptyIconCircle: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(14),
  },
  emptyTitle: {
    fontSize: fontScale(16),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(6),
  },
  emptySubtitle: {
    fontSize: fontScale(13),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: scale(18),
    marginBottom: scale(16),
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: '#089A8D',
    paddingHorizontal: scale(18),
    paddingVertical: scale(10),
    borderRadius: scale(14),
  },
  emptyActionBtnText: {
    fontSize: fontScale(13),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: scale(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  parcelIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#E6FAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardParcelId: {
    fontSize: fontScale(13),
    fontWeight: '900',
    color: '#0F172A',
  },
  cardCategory: {
    fontSize: fontScale(11),
    fontWeight: '600',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: fontScale(10),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  routeCol: {
    flex: 1,
  },
  routeLabel: {
    fontSize: fontScale(10),
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeLocation: {
    fontSize: fontScale(13),
    fontWeight: '800',
    color: '#0F172A',
  },
  flightArrowCol: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  routeDateText: {
    fontSize: fontScale(10),
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  arrowLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotStart: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#089A8D',
  },
  dashLine: {
    width: scale(14),
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dotEnd: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#089A8D',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 2,
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontSize: fontScale(12),
    fontWeight: '700',
    color: '#475569',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#E6FAF6',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  detailsBtnText: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#089A8D',
  },
  findTravelerBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#089A8D',
  },
  findTravelerBtnText: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deleteBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
