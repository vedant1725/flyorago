import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { apiFetch } from '../../services/api';
import { SenderDetailsScreen } from './SenderDetailsScreen';
import { CreateSenderRequestScreen } from './CreateSenderRequestScreen';
import { FindTravelerScreen } from './FindTravelerScreen';
import { AllSenderShipmentsScreen } from './AllSenderShipmentsScreen';
import { LocationAutocompleteInput } from '../../components/LocationAutocompleteInput';
import { DatePickerModal } from '../../components/DatePickerModal';
import { KycValidationModal } from '../../components/KycValidationModal';
import { useAuth } from '../../context/AuthContext';
import { AppAlert as Alert } from '../../components/AppAlertModal';
import { getSafeHeaderPaddingTop, scale, fontScale } from '../../constants/responsive';

const { width } = Dimensions.get('window');

interface ShipmentsScreenProps {
  onOpenChat?: () => void;
  onOpenNotifications?: () => void;
  onNavigateToKyc?: () => void;
}

export const ShipmentsScreen: React.FC<ShipmentsScreenProps> = ({
  onOpenChat,
  onOpenNotifications,
  onNavigateToKyc,
}) => {
  const { user, kycStatus } = useAuth();
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [allAvailableTrips, setAllAvailableTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ACTIVE' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');

  // KYC guard modal
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const isKycApproved = (kycStatus || user?.kycStatus || '').toUpperCase() === 'APPROVED';

  const handleStartCreateRequest = () => {
    if (!isKycApproved) {
      setIsKycModalOpen(true);
      return;
    }
    setIsCreateModalOpen(true);
  };

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

  // Subscreen navigation to Parcel Request Details Screen
  const [selectedRequestId, setSelectedRequestId] = useState<number | string | null>(null);
  const [selectedRequestItem, setSelectedRequestItem] = useState<any | null>(null);

  // Full-screen View All Shipments State
  const [isViewAllOpen, setIsViewAllOpen] = useState<boolean>(false);

  // Create Request Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formPickup, setFormPickup] = useState('');
  const [formDropoff, setFormDropoff] = useState('');
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formDescription, setFormDescription] = useState('');
  const [formReceiverName, setFormReceiverName] = useState('');
  const [formReceiverPhone, setFormReceiverPhone] = useState('');
  const [formReceiverAddress, setFormReceiverAddress] = useState('');
  const [packageImages, setPackageImages] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Find Matching Traveler Modal State
  const [matchingModalOpen, setMatchingModalOpen] = useState<boolean>(false);
  const [activeRequestToMatch, setActiveRequestToMatch] = useState<any | null>(null);
  const [isSendingMatchRequest, setIsSendingMatchRequest] = useState<boolean>(false);

  // Load Real Data from Backend
  const fetchData = useCallback(async () => {
    try {
      const overviewRes = await apiFetch('/api/sender/dashboard-overview/');
      const data = (overviewRes as any)?.data || {};

      const tripsData = data.trips || [];
      const senderReqs = tripsData.filter((t: any) => t.airline === 'SENDER_REQUEST');
      setRequests(senderReqs);

      const bookingsData = data.bookings || [];
      setBookings(bookingsData);

      if (data.availableTravelers && Array.isArray(data.availableTravelers)) {
        setAllAvailableTrips(data.availableTravelers);
      } else {
        try {
          const tripsRes = await apiFetch('/api/trips/');
          const rawTrips = (tripsRes as any)?.data || tripsRes || [];
          setAllAvailableTrips(Array.isArray(rawTrips) ? rawTrips.filter((t: any) => t.airline !== 'SENDER_REQUEST') : []);
        } catch { }
      }
    } catch (err: any) {
      console.error('Failed to fetch sender data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Image Picker for Create Request
  const pickImage = async () => {
    if (packageImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload maximum 5 photos.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to upload parcel photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const base64Uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      setPackageImages(prev => [...prev, base64Uri].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setPackageImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit New Sender Request
  const handleCreateRequest = async () => {
    if (!formPickup.trim() || !formDropoff.trim() || !formDeliveryDate.trim() || !formWeight.trim()) {
      Alert.alert('Missing Fields', 'Please fill in Pickup Location, Drop-off Location, Delivery Date, and Weight.');
      return;
    }
    if (packageImages.length === 0) {
      Alert.alert('Photo Required', 'Please upload at least 1 photo of the package.');
      return;
    }

    setIsSubmitting(true);
    try {
      const weightNum = parseFloat(formWeight) || 1.0;
      const payload = {
        flight_number: 'REQ',
        airline: 'SENDER_REQUEST',
        aircraft: formCategory,
        from_location: formPickup.trim(),
        to_location: formDropoff.trim(),
        from_airport: (formDescription || 'Parcel').slice(0, 150),
        to_airport: 'N/A',
        departure_date: formDeliveryDate.trim(),
        departure_time: '12:00:00',
        arrival_date: formDeliveryDate.trim(),
        arrival_time: '12:00:00',
        duration: 'N/A',
        terminal_from: (formReceiverName || 'Receiver').slice(0, 50),
        terminal_to: (formReceiverPhone || '').slice(0, 30),
        notes: JSON.stringify({
          receiver_name: formReceiverName,
          receiver_phone: formReceiverPhone,
          receiver_address: formReceiverAddress || formDropoff.trim(),
        }),
        seats: '1',
        capacity_weight: weightNum,
        accepted_parcel_types: packageImages,
      };

      const res = await apiFetch('/api/trips/', { method: 'POST', body: JSON.stringify(payload) });

      try {
        await apiFetch('/api/bookings/', {
          method: 'POST',
          body: JSON.stringify({
            sender_trip: res.data?.id,
            package_name: `${formCategory || 'General'} Parcel`,
            package_category: formCategory || 'General',
            weight: weightNum,
            reward: 50.0,
            receiver_name: formReceiverName || 'Receiver',
            receiver_phone: formReceiverPhone || '',
            receiver_address: formReceiverAddress || formDropoff.trim(),
          }),
        });
      } catch (e) { }

      Alert.alert('Success', 'Parcel request posted successfully!');
      setIsCreateModalOpen(false);
      setFormPickup('');
      setFormDropoff('');
      setFormDeliveryDate('');
      setFormWeight('');
      setFormCategory('General');
      setFormDescription('');
      setFormReceiverName('');
      setFormReceiverPhone('');
      setFormReceiverAddress('');
      setPackageImages([]);
      fetchData();
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to create parcel request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Request
  const handleDeleteRequest = (id: number) => {
    Alert.alert(
      'Cancel Parcel Request',
      'Are you sure you want to cancel this parcel request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/api/trips/${id}/`, { method: 'DELETE' });
              Alert.alert('Cancelled', 'Package request cancelled successfully.');
              setRequests(prev => prev.filter(r => r.id !== id));
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel request.');
            }
          },
        },
      ]
    );
  };

  // Open Matching Traveler Modal
  const handleOpenFindTraveler = async (req: any) => {
    setActiveRequestToMatch(req);
    setMatchingModalOpen(true);
    // Refresh available travelers list from backend when opening modal (just like Web SenderPage fetchTravelers())
    try {
      const tripsRes = await apiFetch('/api/trips/');
      const rawTrips = (tripsRes as any)?.data?.results || (tripsRes as any)?.data || (tripsRes as any)?.results || tripsRes || [];
      if (Array.isArray(rawTrips)) {
        setAllAvailableTrips(rawTrips.filter((t: any) => t.airline !== 'SENDER_REQUEST'));
      }
    } catch (e) {
      console.warn('Could not refresh available travelers:', e);
    }
  };

  // Fuzzy Match Algorithm (same as Web SenderPage)
  const fuzzyMatch = (locA: any, locB: any): boolean => {
    if (!locA || !locB) return false;
    const a = String(locA).toLowerCase().replace(/[().,]/g, ' ').trim();
    const b = String(locB).toLowerCase().replace(/[().,]/g, ' ').trim();
    if (!a || !b) return false;
    if (a === b || a.includes(b) || b.includes(a)) return true;
    const tokensA = a.split(/\s+/).filter((w: string) => w.length >= 3);
    const tokensB = b.split(/\s+/).filter((w: string) => w.length >= 3);
    return tokensA.some((ta: string) => tokensB.some((tb: string) => ta === tb || ta.includes(tb) || tb.includes(ta)));
  };

  // Compute Matching Travelers (EXACT MATCH WITH WEB SENDERPAGE)
  const matchingTravelers = useMemo(() => {
    if (!activeRequestToMatch) return [];
    const reqFrom = String(activeRequestToMatch?.from_location || '').toLowerCase().trim();
    const reqTo = String(activeRequestToMatch?.to_location || '').toLowerCase().trim();
    const reqWeight = parseFloat(activeRequestToMatch?.capacity_weight) || 1.0;

    const currentUserId = user?.id ? String(user.id) : '';
    const currentUserEmail = user?.email ? user.email.toLowerCase().trim() : '';

    const trips = Array.isArray(allAvailableTrips) ? allAvailableTrips : [];
    return trips.filter((t: any) => {
      if (!t || t.airline === 'SENDER_REQUEST') return false;

      // 1. Exclude trips belonging to current user (own requests/trips)
      const tripUserId = t.user ? (typeof t.user === 'object' ? String(t.user.id || '') : String(t.user)) : '';
      if (currentUserId && tripUserId && currentUserId === tripUserId) return false;

      const travelerEmail = (t.traveler_email || (typeof t.user === 'object' ? t.user.email : '') || '').toLowerCase().trim();
      if (currentUserEmail && travelerEmail && currentUserEmail === travelerEmail) return false;

      // 2. Strict matching location check (must match both FROM and TO)
      const fromMatch = fuzzyMatch(t?.from_location || '', reqFrom) || fuzzyMatch(t?.from_airport || '', reqFrom);
      const toMatch = fuzzyMatch(t?.to_location || '', reqTo) || fuzzyMatch(t?.to_airport || '', reqTo);
      if (!fromMatch || !toMatch) return false;

      // 3. Sufficient available baggage space check
      const hasSpace = (parseFloat(t?.available_weight) || 0) >= reqWeight;
      return hasSpace;
    });
  }, [activeRequestToMatch, allAvailableTrips, user]);

  // Send Match Request to Traveler
  const handleSendRequestToTraveler = async (travelerTrip: any) => {
    if (!activeRequestToMatch || isSendingMatchRequest) return;
    setIsSendingMatchRequest(true);
    try {
      const reqWeight = parseFloat(activeRequestToMatch.capacity_weight) || 1;
      const availWeight = parseFloat(travelerTrip.available_weight) || 0;
      const safeWeight = reqWeight > availWeight ? availWeight : reqWeight;

      let recName = activeRequestToMatch.receiver_name || '';
      let recPhone = activeRequestToMatch.receiver_phone || '';
      let recAddr = activeRequestToMatch.receiver_address || activeRequestToMatch.to_location || '';
      if (!recName && activeRequestToMatch.terminal_from && activeRequestToMatch.terminal_from !== 'N/A') {
        recName = activeRequestToMatch.terminal_from;
      }
      if (!recPhone && activeRequestToMatch.terminal_to && activeRequestToMatch.terminal_to !== 'N/A') {
        recPhone = activeRequestToMatch.terminal_to;
      }
      try {
        if (activeRequestToMatch.notes) {
          const parsed = JSON.parse(activeRequestToMatch.notes);
          if (parsed.receiver_name) recName = parsed.receiver_name;
          if (parsed.receiver_phone) recPhone = parsed.receiver_phone;
          if (parsed.receiver_address) recAddr = parsed.receiver_address;
        }
      } catch (e) { }

      const payload = {
        trip: travelerTrip.id,
        sender_trip: activeRequestToMatch.id,
        package_name: activeRequestToMatch.aircraft || activeRequestToMatch.package_name || 'Parcel',
        package_category: activeRequestToMatch.aircraft || 'General',
        package_image: JSON.stringify(activeRequestToMatch.accepted_parcel_types || []),
        weight: safeWeight > 0 ? safeWeight : 0.1,
        reward: Number((safeWeight * (parseFloat(travelerTrip.price_per_kg) || 10.0)).toFixed(2)),
        receiver_name: recName || 'Receiver',
        receiver_phone: recPhone || '',
        receiver_address: recAddr || '',
      };

      await apiFetch('/api/bookings/', { method: 'POST', body: JSON.stringify(payload) });

      Alert.alert('Request Sent', 'Delivery request sent to traveler successfully!');
      setMatchingModalOpen(false);
      setActiveRequestToMatch(null);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', 'Failed to send request: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSendingMatchRequest(false);
    }
  };

  // Metrics computation (100% matched with Web SenderPage)
  const inTransitCount = useMemo(() => {
    return bookings.filter((b: any) =>
      b.status === 'IN_TRANSIT' || b.status === 'OUT_FOR_DELIVERY' || b.status === 'ARRIVED'
    ).length;
  }, [bookings]);

  const deliveredCount = useMemo(() => {
    return bookings.filter((b: any) =>
      b.status === 'DELIVERED' || b.status === 'PAYMENT_RELEASED'
    ).length;
  }, [bookings]);

  const pendingCount = useMemo(() => {
    return requests.filter((r: any) => {
      const linkedBk = bookings.find(b =>
        (b.sender_trip && String(b.sender_trip) === String(r.id)) ||
        (b.trip && String(b.trip) === String(r.id)) ||
        (b.trip_details && String(b.trip_details.id) === String(r.id))
      );
      if (!linkedBk) return r.status === 'Active' || !r.status;
      return linkedBk.status === 'PENDING' || linkedBk.status === 'REQUESTED' || r.status === 'Active';
    }).length;
  }, [requests, bookings]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r: any) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (r.from_location && r.from_location.toLowerCase().includes(q)) ||
        (r.to_location && r.to_location.toLowerCase().includes(q)) ||
        (r.aircraft && r.aircraft.toLowerCase().includes(q)) ||
        String(r.id).includes(q);

      if (!matchSearch) return false;

      const linkedBk = bookings.find(b =>
        (b.sender_trip && String(b.sender_trip) === String(r.id)) ||
        (b.trip && String(b.trip) === String(r.id)) ||
        (b.trip_details && String(b.trip_details.id) === String(r.id))
      );
      const bStatus = linkedBk?.status || 'PENDING';

      if (selectedFilter === 'ACTIVE') {
        return bStatus === 'PENDING' || bStatus === 'REQUESTED' || bStatus === 'ACCEPTED' || bStatus === 'PAID';
      }
      if (selectedFilter === 'IN_TRANSIT') {
        return bStatus === 'IN_TRANSIT' || bStatus === 'OUT_FOR_DELIVERY' || bStatus === 'PARCEL_VERIFIED';
      }
      if (selectedFilter === 'DELIVERED') {
        return bStatus === 'DELIVERED' || bStatus === 'PAYMENT_RELEASED';
      }
      return true;
    });
  }, [requests, bookings, searchQuery, selectedFilter]);

  // Top 3 active requests for the main screen
  const topActiveRequests = useMemo(() => {
    return filteredRequests.slice(0, 3);
  }, [filteredRequests]);

  // If Create Request view is active, render full-screen CreateSenderRequestScreen matching Traveler UI
  if (isCreateModalOpen) {
    return (
      <CreateSenderRequestScreen
        onBack={() => setIsCreateModalOpen(false)}
        onRequestCreated={() => {
          setIsCreateModalOpen(false);
          fetchData();
        }}
      />
    );
  }

  // If View All Shipments screen is active, render full-screen AllSenderShipmentsScreen
  if (isViewAllOpen) {
    return (
      <AllSenderShipmentsScreen
        requests={requests}
        bookings={bookings}
        onBack={() => setIsViewAllOpen(false)}
        onSelectRequest={(req) => {
          setIsViewAllOpen(false);
          setSelectedRequestItem(req);
          setSelectedRequestId(req.id);
        }}
        onFindTraveler={(req) => {
          setIsViewAllOpen(false);
          handleOpenFindTraveler(req);
        }}
        onDeleteRequest={handleDeleteRequest}
        onRefresh={fetchData}
        refreshing={refreshing}
        onOpenChat={onOpenChat}
        onCreateRequest={handleStartCreateRequest}
      />
    );
  }

  // If a Parcel Details view is active, render SenderDetailsScreen
  if (selectedRequestId !== null) {
    return (
      <SenderDetailsScreen
        requestId={selectedRequestId}
        initialRequest={selectedRequestItem}
        onBack={() => {
          setSelectedRequestId(null);
          setSelectedRequestItem(null);
          fetchData();
        }}
        onOpenChat={onOpenChat}
      />
    );
  }

  // If Find Matching Traveler view is active, render advanced full-screen FindTravelerScreen with liquid watercolor theme
  if (matchingModalOpen && activeRequestToMatch) {
    return (
      <FindTravelerScreen
        request={activeRequestToMatch}
        matchingTravelers={matchingTravelers}
        bookings={bookings}
        onBack={() => {
          setMatchingModalOpen(false);
          setActiveRequestToMatch(null);
        }}
        onSendRequest={handleSendRequestToTraveler}
        isSendingRequest={isSendingMatchRequest}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Native Light Content Status Bar to match Home Page Header */}
      <StatusBar style="light" />

      {/* ── Fixed Top Header Card (Matches WalletScreen: Header Stays Fixed) ── */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#033D37', '#065F56', '#089A8D']}
          locations={[0, 0.45, 1]}
          style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
        >
          {/* Background Airplane & Globe Art matching Home Screen */}
          <View style={styles.headerPlaneArtWrap} pointerEvents="none">
            <ExpoImage
              source={require('../../../assets/images/home-header-plane.png')}
              style={styles.headerPlaneArt}
              contentFit="contain"
              priority="high"
              cachePolicy="memory-disk"
            />
          </View>

          {/* Top Bar with Title on Left & Messenger Chat on Right */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.welcomeGreeting}>Sender Portal</Text>
              <View style={styles.nameRow}>
                <Text style={styles.portalTitle}>My Packages</Text>
                <Ionicons name="cube" size={22} color="#2DD4BF" />
              </View>
            </View>

            {/* Action Buttons: Prominent Animated Post Parcel */}
            <View style={styles.headerIconsRow}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.createHeaderBtn}
                  onPress={handleStartCreateRequest}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#2DD4BF', '#089A8D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.createHeaderGradient}
                  >
                    <Ionicons name="add-circle" size={scale(17)} color="#FFFFFF" />
                    <Text style={styles.createHeaderBtnText}>Post Parcel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Trust and Escrow Protection Badges */}
          <View style={styles.statusBadgesRow}>
            <View style={styles.kycVerifiedPill}>
              <Ionicons name="shield-checkmark" size={13} color="#2DD4BF" />
              <Text style={styles.kycVerifiedText}>100% Escrow Secured</Text>
            </View>

            <View style={styles.ratingPill}>
              <Ionicons name="airplane" size={13} color="#FBBF24" />
              <Text style={styles.ratingText}>Verified Travelers</Text>
            </View>
          </View>

          {/* 4 Responsive Glassmorphism Stat Cards matching Home Page Design */}
          <View style={styles.statsGrid}>
            {/* Stat 1: Total */}
            <TouchableOpacity
              style={[styles.statCard, selectedFilter === 'ALL' && styles.statCardActive]}
              onPress={() => setSelectedFilter('ALL')}
              activeOpacity={0.85}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="albums-outline" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>
                {String(requests.length).padStart(2, '0')}
              </Text>
              <Text style={styles.statSub}>Total</Text>
            </TouchableOpacity>

            {/* Stat 2: In Transit */}
            <TouchableOpacity
              style={[styles.statCard, selectedFilter === 'IN_TRANSIT' && styles.statCardActive]}
              onPress={() => setSelectedFilter('IN_TRANSIT')}
              activeOpacity={0.85}
            >
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(251, 191, 36, 0.25)' }]}>
                <Ionicons name="airplane" size={16} color="#FBBF24" />
              </View>
              <Text style={[styles.statValue, { color: '#FCD34D' }]}>
                {String(inTransitCount).padStart(2, '0')}
              </Text>
              <Text style={styles.statSub}>In Transit</Text>
            </TouchableOpacity>

            {/* Stat 3: Delivered */}
            <TouchableOpacity
              style={[styles.statCard, selectedFilter === 'DELIVERED' && styles.statCardActive]}
              onPress={() => setSelectedFilter('DELIVERED')}
              activeOpacity={0.85}
            >
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(52, 211, 153, 0.25)' }]}>
                <Ionicons name="checkmark-done" size={16} color="#34D399" />
              </View>
              <Text style={[styles.statValue, { color: '#34D399' }]}>
                {String(deliveredCount).padStart(2, '0')}
              </Text>
              <Text style={styles.statSub}>Delivered</Text>
            </TouchableOpacity>

            {/* Stat 4: Pending */}
            <TouchableOpacity
              style={[styles.statCard, selectedFilter === 'ACTIVE' && styles.statCardActive]}
              onPress={() => setSelectedFilter('ACTIVE')}
              activeOpacity={0.85}
            >
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(45, 212, 191, 0.25)' }]}>
                <Ionicons name="time-outline" size={16} color="#2DD4BF" />
              </View>
              <Text style={[styles.statValue, { color: '#6EE7B7' }]}>
                {String(pendingCount).padStart(2, '0')}
              </Text>
              <Text style={styles.statSub}>Pending</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* ── Scrollable Body Content (Header stays Fixed outside ScrollView) ── */}
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
        {/* Section 2: Search & Filter Toolbar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search parcels, city (e.g. Himatnagar, Idar)..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPillsScroll}>
            {[
              { id: 'ALL', label: 'All Packages' },
              { id: 'ACTIVE', label: 'Active & Paid' },
              { id: 'IN_TRANSIT', label: 'In Transit' },
              { id: 'DELIVERED', label: 'Delivered' },
            ].map((f) => {
              const active = selectedFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setSelectedFilter(f.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section 3: Parcel Requests List */}
        <View style={styles.requestsContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.tealAccentBar} />
              <Text style={styles.sectionTitle}>My Package Requests ({requests.length})</Text>
            </View>

            {requests.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => setIsViewAllOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllBtnText}>View All</Text>
                <Ionicons name="chevron-forward" size={13} color="#089A8D" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={FlyoraColors.primary} />
              <Text style={styles.loadingText}>Connecting to FlyoraGo backend...</Text>
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cube-outline" size={38} color={FlyoraColors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Package Requests Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No packages match your search filter.'
                  : 'You have not created any package requests yet. Tap "Post Parcel" to start sending packages across India!'}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={handleStartCreateRequest}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.emptyActionBtnText}>Post First Parcel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            topActiveRequests.map((req) => {
              const linkedBk = bookings.find(b =>
                (b.sender_trip && String(b.sender_trip) === String(req.id)) ||
                (b.trip && String(b.trip) === String(req.id)) ||
                (b.trip_details && String(b.trip_details.id) === String(req.id))
              );

              const hasTraveler = Boolean(linkedBk && (linkedBk.traveler || linkedBk.traveler_name));
              const isDelivered = linkedBk?.status === 'DELIVERED' || linkedBk?.status === 'PAYMENT_RELEASED';
              const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'ARRIVED', 'PARCEL_VERIFIED'].includes(linkedBk?.status);
              const isPaid = linkedBk?.payment_status === 'Escrow Hold' || linkedBk?.payment_status === 'PAID';

              let statusLabel = 'ACTIVE';
              let badgeBg = '#E0F2FE';
              let badgeColor = '#0369A1';

              if (isDelivered) {
                statusLabel = 'DELIVERED';
                badgeBg = '#DCFCE7';
                badgeColor = '#15803D';
              } else if (isInTransit) {
                statusLabel = linkedBk?.status === 'PARCEL_VERIFIED' ? 'PARCEL VERIFIED' : 'IN TRANSIT';
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
                        <Ionicons name="cube" size={17} color="#089A8D" />
                      </View>
                      <View>
                        <Text style={styles.cardParcelId}>PARCEL #{req.id}</Text>
                        <Text style={styles.cardCategory}>{req.aircraft || 'General Parcel'}</Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
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
                        <Ionicons name="airplane" size={14} color="#089A8D" style={{ marginHorizontal: 2 }} />
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
                      <Ionicons name="scale-outline" size={14} color="#089A8D" />
                      <Text style={styles.specText}>{parseFloat(req.capacity_weight || 1).toFixed(2)} kg</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Ionicons name="pricetag-outline" size={14} color="#089A8D" />
                      <Text style={styles.specText}>Category: {req.aircraft || 'General'}</Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => {
                        setSelectedRequestItem(req);
                        setSelectedRequestId(req.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="eye-outline" size={15} color="#089A8D" />
                      <Text style={styles.detailsBtnText}>Details</Text>
                    </TouchableOpacity>

                    {/* Find Traveler Button */}
                    {!isDelivered && (
                      <TouchableOpacity
                        style={styles.findTravelerBtn}
                        onPress={() => handleOpenFindTraveler(req)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="search-outline" size={15} color="#FFFFFF" />
                        <Text style={styles.findTravelerBtnText}>Find Traveler</Text>
                      </TouchableOpacity>
                    )}

                    {/* Delete Request Button */}
                    {!isDelivered && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteRequest(req.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ─── Create Request Modal ─── */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar style="dark" />
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalHeaderTitle}>Create Sender Request</Text>
              <Text style={styles.modalHeaderSubtitle}>
                Post a parcel delivery request to match with verified travelers
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsCreateModalOpen(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Section 1: Route Details */}
            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <Ionicons name="location" size={18} color="#089A8D" />
                <Text style={styles.formSectionTitle}>Route Details (All India Search)</Text>
              </View>

              <LocationAutocompleteInput
                label="PICKUP LOCATION *"
                value={formPickup}
                onChange={setFormPickup}
                placeholder="e.g. Ahmedabad, Surat, Mumbai, Himatnagar..."
                iconName="airplane-outline"
              />

              <View style={{ marginTop: 10 }}>
                <LocationAutocompleteInput
                  label="DROP-OFF LOCATION *"
                  value={formDropoff}
                  onChange={setFormDropoff}
                  placeholder="e.g. Delhi, Bangalore, Pune, Vadodara, Idar..."
                  iconName="location-outline"
                />
              </View>

              <Text style={styles.inputLabel}>DELIVERY BY DATE (YYYY-MM-DD) *</Text>
              <TouchableOpacity
                style={[styles.formInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="calendar-outline" size={17} color="#089A8D" />
                  <Text style={{ fontSize: 13, color: formDeliveryDate ? '#0F172A' : '#94A3B8', fontWeight: formDeliveryDate ? '700' : '400' }}>
                    {formDeliveryDate || 'Select Delivery Date (YYYY-MM-DD)'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Section 2: Package Details */}
            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <Ionicons name="cube" size={18} color="#089A8D" />
                <Text style={styles.formSectionTitle}>Package Details</Text>
              </View>

              <Text style={styles.inputLabel}>WEIGHT (KG) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 5"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formWeight}
                onChangeText={setFormWeight}
              />

              <Text style={styles.inputLabel}>CATEGORY *</Text>
              <View style={styles.categoryPillsRow}>
                {['General', 'Electronics', 'Documents', 'Apparel', 'Medicine'].map((cat) => {
                  const selected = formCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryPill, selected && styles.categoryPillSelected]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text style={[styles.categoryPillText, selected && styles.categoryPillTextSelected]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>DESCRIPTION</Text>
              <TextInput
                style={[styles.formInput, { height: 75, textAlignVertical: 'top' }]}
                placeholder="Brief description of package contents..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={formDescription}
                onChangeText={setFormDescription}
              />

              {/* Package Photos Upload */}
              <Text style={styles.inputLabel}>UPLOAD PACKAGE PHOTOS * (At least 1 required)</Text>
              <View style={styles.photoUploadRow}>
                {packageImages.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumbWrap}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <TouchableOpacity
                      style={styles.photoRemoveBtn}
                      onPress={() => removeImage(idx)}
                    >
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}

                {packageImages.length < 5 && (
                  <TouchableOpacity style={styles.photoAddBtn} onPress={pickImage}>
                    <Ionicons name="camera" size={24} color="#089A8D" />
                    <Text style={styles.photoAddText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Section 3: Receiver Information */}
            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <Ionicons name="person" size={18} color="#089A8D" />
                <Text style={styles.formSectionTitle}>Receiver Information</Text>
              </View>

              <Text style={styles.inputLabel}>RECEIVER NAME</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#94A3B8"
                value={formReceiverName}
                onChangeText={setFormReceiverName}
              />

              <Text style={styles.inputLabel}>RECEIVER PHONE</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={formReceiverPhone}
                onChangeText={setFormReceiverPhone}
              />

              <Text style={styles.inputLabel}>DELIVERY ADDRESS</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Apartment, Street, Landmark"
                placeholderTextColor="#94A3B8"
                value={formReceiverAddress}
                onChangeText={setFormReceiverAddress}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitFormBtn}
              onPress={handleCreateRequest}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.submitFormBtnText}>Post Request</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Interactive Calendar Date Picker Modal for Sender */}
        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          selectedDate={formDeliveryDate}
          onSelectDate={(d) => setFormDeliveryDate(d)}
          title="Select Delivery Date"
        />
      </Modal>

      {/* KYC Validation Modal */}
      <KycValidationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        kycStatus={kycStatus}
        actionTitle="Posting a package delivery request"
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
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 110,
  },
  header: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#033D37',
    ...Shadows.cardHover,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 56 : 46,
    paddingHorizontal: 20,
    paddingBottom: 24,
    position: 'relative',
  },
  headerPlaneArtWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 12,
    right: -25,
    width: 250,
    height: 190,
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
  portalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createHeaderBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  createHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  createHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  headerIconButton: {
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
    marginBottom: 18,
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
    gap: 8,
    zIndex: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statCardActive: {
    backgroundColor: 'rgba(45, 212, 191, 0.25)',
    borderColor: '#2DD4BF',
  },
  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statSub: {
    fontSize: 9.5,
    color: '#A7D9D3',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tealAccentBar: {
    width: 4,
    height: 18,
    backgroundColor: FlyoraColors.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#032D28',
    letterSpacing: -0.2,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(8, 154, 141, 0.12)',
    ...Shadows.card,
  },
  actionArtBox: {
    width: 78,
    height: 78,
    borderRadius: 18,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionArtImage: {
    width: 58,
    height: 58,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#062738',
    marginBottom: 3,
  },
  actionCardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  actionSolidBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#089A8D',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 5,
  },
  actionSolidBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionOutlineBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#089A8D',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 5,
  },
  actionOutlineBtnText: {
    color: '#034C45',
    fontSize: 11,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  filterPillsScroll: {
    flexDirection: 'row',
    marginTop: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  requestsContainer: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
    ...Shadows.sm,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#089A8D',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 6,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  parcelIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  cardParcelId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#089A8D',
    letterSpacing: 0.5,
  },
  cardCategory: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  routeCol: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  routeLocation: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  flightArrowCol: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  routeDateText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  arrowLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotStart: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#089A8D',
  },
  dashLine: {
    width: 14,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dotEnd: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#089A8D',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 4,
  },
  detailsBtnText: {
    color: '#089A8D',
    fontSize: 12,
    fontWeight: '700',
  },
  findTravelerBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    gap: 4,
  },
  findTravelerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    maxWidth: width * 0.75,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScroll: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 13,
    color: '#0F172A',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillSelected: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  photoUploadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  photoThumbWrap: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddBtn: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#089A8D',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#089A8D',
    marginTop: 2,
  },
  submitFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#089A8D',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 40,
    gap: 8,
    ...Shadows.card,
  },
  submitFormBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadows.cardHover,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dialogTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dialogSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  dialogCloseBtn: {
    padding: 6,
  },
  dialogContent: {
    padding: 16,
  },
  noTravelersBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noTravelersIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noTravelersTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  noTravelersDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  noteBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },
  noteText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  travelerMatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    ...Shadows.sm,
  },
  matchingBannerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  matchingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  matchingBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  matchingCountBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  matchingCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  travelerCardHeader: {
    flexDirection: 'column',
    gap: 12,
  },
  travelerInfoLeft: {
    flex: 1,
  },
  travelerHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  travelerAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  travelerAvatarSmallText: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
  },
  travelerNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginHorizontal: 8,
  },
  travelerDateText: {
    fontSize: 12,
    color: '#64748B',
  },
  travelerRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  travelerRouteLoc: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  travelerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  travelerMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  travelerMetaHighlight: {
    fontWeight: '700',
    color: '#047857',
  },
  travelerMetaDark: {
    fontWeight: '700',
    color: '#334155',
  },
  travelerActionWrap: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  sendRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#089A8D',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 16,
    gap: 6,
  },
  sendRequestBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  requestSentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  requestSentBadgeText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
});
