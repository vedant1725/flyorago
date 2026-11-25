import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop, fontScale, scale } from '../../constants/responsive';
import { FlyoraColors, Shadows } from '../../constants/theme';
import { apiFetch } from '../../services/api';
import { AppAlert as Alert } from '../../components/AppAlertModal';
import { DeliverySuccessModal } from '../../components/DeliverySuccessModal';

const { width } = Dimensions.get('window');

let CameraComponent: any = null;
let useCameraHook: any = () => [null, async () => ({ granted: false })];
try {
  const ExpoCamera = require('expo-camera');
  if (ExpoCamera) {
    CameraComponent = ExpoCamera.CameraView || ExpoCamera.Camera;
    if (typeof ExpoCamera.useCameraPermissions === 'function') {
      useCameraHook = ExpoCamera.useCameraPermissions;
    }
  }
} catch (e) {}

// Memory Cache for Trip Details to eliminate loading spinners
const TRIP_DETAILS_MEMORY_CACHE = new Map<string, any>();

interface TripDetailsScreenProps {
  tripId: string | number;
  initialTrip?: any;
  onBack: () => void;
  onOpenChat?: (target?: { userId?: number; userName?: string }) => void;
}

export const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({
  tripId,
  initialTrip,
  onBack,
  onOpenChat,
}) => {
  const insets = useSafeAreaInsets();
  const cacheKey = String(tripId || '');

  // Pre-seed from cache or initialTrip: 0 Millisecond instant render without loader
  const [trip, setTrip] = useState<any>(() => {
    if (cacheKey && TRIP_DETAILS_MEMORY_CACHE.has(cacheKey)) {
      return TRIP_DETAILS_MEMORY_CACHE.get(cacheKey).trip;
    }
    return initialTrip || null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    return !(cacheKey && TRIP_DETAILS_MEMORY_CACHE.has(cacheKey)) && !initialTrip;
  });

  const [refreshing, setRefreshing] = useState(false);

  const [bookings, setBookings] = useState<any[]>(() => {
    if (cacheKey && TRIP_DETAILS_MEMORY_CACHE.has(cacheKey)) {
      return TRIP_DETAILS_MEMORY_CACHE.get(cacheKey).bookings || [];
    }
    return [];
  });
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // OTP Verification Modal State
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [selectedBookingForOtp, setSelectedBookingForOtp] = useState<any>(null);
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // QR Scanner Modal State
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [permission, requestPermission] = useCameraHook();
  const [scanned, setScanned] = useState(false);

  // Delivery Success Celebration Modal State
  const [deliverySuccessModalVisible, setDeliverySuccessModalVisible] = useState(false);
  const [lastDeliveredBooking, setLastDeliveredBooking] = useState<any>(null);

  // Verification Photos Modal State
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [selectedBookingToVerify, setSelectedBookingToVerify] = useState<any>(null);
  const [verificationImages, setVerificationImages] = useState<string[]>([]);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Advanced Pulse and Glow Animation for Live Active Status & Timeline Steps
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 1100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.15,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    floatLoop.start();

    return () => {
      pulseLoop.stop();
      floatLoop.stop();
    };
  }, []);

  const fetchTripDetails = useCallback(
    async (isPullToRefresh = false, isSilent = false) => {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else if (!isSilent && !trip) {
        setLoading(true);
      }
      try {
        // Parallel fetch trip details and associated bookings for maximum speed
        const [tripRes, bookingsRes] = await Promise.all([
          apiFetch(`/api/trips/${tripId}/`).catch(() => null),
          apiFetch(`/api/bookings/?user_only=true&page_size=100`).catch(() => null),
        ]);

        let latestTrip = trip;
        if (tripRes?.success && tripRes?.data) {
          latestTrip = tripRes.data;
          setTrip(tripRes.data);
        }

        let latestBookings = bookings;
        if (bookingsRes?.success && bookingsRes?.data) {
          const allBookings = Array.isArray(bookingsRes.data.results)
            ? bookingsRes.data.results
            : Array.isArray(bookingsRes.data)
            ? bookingsRes.data
            : [];

          // Match bookings for this specific trip
          const matched = allBookings.filter(
            (b: any) =>
              String(b.trip) === String(tripId) ||
              String(b.trip?.id) === String(tripId) ||
              (latestTrip &&
                b.from_location === latestTrip.from_location &&
                b.to_location === latestTrip.to_location)
          );
          latestBookings = matched;
          setBookings(matched);
        }

        // Update Memory Cache
        if (cacheKey) {
          TRIP_DETAILS_MEMORY_CACHE.set(cacheKey, {
            trip: latestTrip,
            bookings: latestBookings,
          });
        }
      } catch (e) {
        console.log('Error fetching trip details:', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tripId, cacheKey, trip, bookings]
  );

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  // Handle workflow action (ACCEPT, REJECT, START_TRANSIT, OUT_FOR_DELIVERY)
  const handleBookingAction = async (bookingId: number, action: string, extraData: any = {}) => {
    setActionLoadingId(bookingId);
    try {
      const res = await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, ...extraData }),
      });

      if (res.success) {
        let successMsg = `Action '${action}' completed successfully!`;
        if (action === 'ACCEPT')
          successMsg = 'Request accepted! Sender has been notified to deposit payment into Escrow.';
        if (action === 'REJECT') successMsg = 'Request rejected successfully.';
        if (action === 'VERIFY_PARCEL')
          successMsg = 'Parcel pickup photos & verification saved! Status: Ready for transit.';
        if (action === 'START_TRANSIT') successMsg = 'Trip is now Marked In Transit! ✈️';
        if (action === 'OUT_FOR_DELIVERY')
          successMsg = 'Marked Out for Delivery! Handover OTP has been generated.';
        if (action === 'CONFIRM_DELIVERY') {
          const targetBooking = bookings.find((b) => b.id === bookingId);
          setLastDeliveredBooking(targetBooking || { id: bookingId });
          setDeliverySuccessModalVisible(true);
          await fetchTripDetails(false, true);
          return;
        }

        Alert.alert('Status Updated', successMsg);
        await fetchTripDetails(false, true);
      } else {
        Alert.alert('Action Failed', res.message || 'Server error occurred.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to process request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Image Pickers for Verification Modal
  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please grant permission to access your photo gallery to upload parcel pictures.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setVerificationImages((prev) => [...prev, imageUri].slice(0, 5));
      }
    } catch (e: any) {
      Alert.alert('Error picking image', e.message || 'Could not select photo');
    }
  };

  const captureImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'Please grant camera access to take parcel handover photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setVerificationImages((prev) => [...prev, imageUri].slice(0, 5));
      }
    } catch (e: any) {
      Alert.alert('Camera Error', e.message || 'Could not capture photo');
    }
  };

  const removeVerificationImage = (index: number) => {
    setVerificationImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Verification Confirmation
  const submitParcelVerification = async () => {
    if (!selectedBookingToVerify) return;
    if (verificationImages.length === 0) {
      Alert.alert(
        'Photos Required',
        'Please take or upload at least 1 photo of the physical parcel at pickup handover.'
      );
      return;
    }
    setSubmittingVerification(true);
    try {
      await handleBookingAction(selectedBookingToVerify.id, 'VERIFY_PARCEL', {
        package_images: verificationImages,
      });
      setVerifyModalVisible(false);
      setVerificationImages([]);
      setSelectedBookingToVerify(null);
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Could not save parcel verification');
    } finally {
      setSubmittingVerification(false);
    }
  };

  // Submit OTP Verification Handover
  const submitOtpHandover = async () => {
    if (!selectedBookingForOtp) return;
    if (!otpInput || otpInput.trim().length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit delivery OTP from recipient.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const bookingId = selectedBookingForOtp.id;
      const res = await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'CONFIRM_DELIVERY',
          otp: otpInput.trim(),
        }),
      });

      if (res.success) {
        setOtpModalVisible(false);
        setOtpInput('');
        const delivered = bookings.find((b) => b.id === bookingId) || selectedBookingForOtp;
        setSelectedBookingForOtp(null);
        setLastDeliveredBooking(delivered);
        setDeliverySuccessModalVisible(true);
        await fetchTripDetails(false, true);
      } else {
        Alert.alert('OTP Verification Failed', res.message || 'Incorrect delivery OTP code.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to verify delivery OTP.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle QR Scan Result
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      let bookingId = selectedBookingForOtp?.id;
      let scannedOtp = '';

      if (data.startsWith('{')) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.booking_id) bookingId = parsed.booking_id;
          if (parsed.otp) scannedOtp = parsed.otp;
        } catch (e) {}
      } else if (data.includes('FLYORA-DELIVERY:')) {
        const parts = data.replace('FLYORA-DELIVERY:', '').split(':');
        if (parts[0]) bookingId = parseInt(parts[0], 10);
        if (parts[1]) scannedOtp = parts[1];
      } else if (data.length === 6 && /^\d+$/.test(data)) {
        scannedOtp = data;
      }

      if (!bookingId) {
        Alert.alert('Invalid QR Code', 'This is not a valid Flyora delivery verification QR code.', [
          { text: 'Scan Again', onPress: () => setScanned(false) },
        ]);
        return;
      }

      const res = await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'CONFIRM_DELIVERY',
          qr_code: data,
          otp: scannedOtp,
        }),
      });

      if (res.success) {
        setQrModalVisible(false);
        const delivered = bookings.find((b) => b.id === bookingId) || { id: bookingId };
        setLastDeliveredBooking(delivered);
        setDeliverySuccessModalVisible(true);
        await fetchTripDetails(false, true);
      } else {
        Alert.alert('Delivery Verification Failed', res.message || 'Could not verify delivery QR code.', [
          { text: 'Retry', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: () => setQrModalVisible(false) },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'QR code verification encountered an error.', [
        { text: 'Scan Again', onPress: () => setScanned(false) },
      ]);
    }
  };

  const startQrScanner = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan delivery QR codes.');
        return;
      }
    }
    setScanned(false);
    setQrModalVisible(true);
  };

  // Helper to map booking stage to 0..4 steps
  const getBookingStepIndex = (bStatus: string, isPaid: boolean) => {
    if (bStatus === 'COMPLETED' || bStatus === 'DELIVERED' || bStatus === 'PAYMENT_RELEASED') return 4;
    if (bStatus === 'OUT_FOR_DELIVERY' || bStatus === 'ARRIVED') return 3;
    if (bStatus === 'IN_TRANSIT') return 3;
    if (bStatus === 'PARCEL_VERIFIED') return 2;
    if (isPaid) return 1;
    if (bStatus === 'ACCEPTED' || bStatus === 'REQUEST_SENT' || bStatus === 'PENDING') return 0;
    return -1;
  };

  const timelineSteps = [
    {
      step: 0,
      title: 'Request Accepted',
      desc: 'Verify parcel route and accept sender request',
      badge: 'ACCEPTED',
      icon: 'checkmark-circle-outline' as const,
    },
    {
      step: 1,
      title: 'Payment Secured',
      desc: 'Sender deposited reward into Escrow Vault',
      badge: 'ESCROW PAID',
      icon: 'lock-closed-outline' as const,
    },
    {
      step: 2,
      title: 'Parcel Handover & Verification',
      desc: 'Capture pickup inspection photos & verify weight',
      badge: 'VERIFIED',
      icon: 'camera-outline' as const,
    },
    {
      step: 3,
      title: 'Flight Transit & Arrival',
      desc: 'Fly to destination and initiate parcel delivery',
      badge: 'IN TRANSIT',
      icon: 'airplane-outline' as const,
    },
    {
      step: 4,
      title: 'Handover Completed',
      desc: 'Recipient verified via OTP / QR scan & reward released',
      badge: 'DELIVERED',
      icon: 'shield-checkmark-outline' as const,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={FlyoraColors.primary} />
        <Text style={styles.loadingText}>Loading Trip Logistics Details...</Text>
      </View>
    );
  }

  const fromLocation = trip?.from_location || trip?.fromAirport || 'Origin';
  const toLocation = trip?.to_location || trip?.toAirport || 'Destination';
  const travelDate = trip?.departure_date || 'Upcoming';
  const availableKg = trip?.available_weight ?? '10';
  const ratePerKg = trip?.price_per_kg ?? '15';
  const tripStatus = (trip?.status || 'Active').toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Top Emerald Header Bar Matching Sender & Home Screens ── */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#033D37', '#065F56', '#089A8D']}
          locations={[0, 0.45, 1]}
          style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
        >
          {/* Airplane Watermark Background Art */}
          <View style={styles.headerPlaneArtWrap} pointerEvents="none">
            <ExpoImage
              source={require('../../../assets/images/home-header-plane.png')}
              style={styles.headerPlaneArt}
              contentFit="contain"
              priority="high"
            />
          </View>

          {/* Header Row */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={onBack} style={styles.backBtnCircle} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <View style={styles.headerPillTag}>
                <Ionicons name="airplane-outline" size={11} color="#2DD4BF" />
                <Text style={styles.headerPillTagText}>TRAVEL LOGISTICS</Text>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Trip #{tripId}
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {travelDate} • {availableKg} KG Capacity
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {onOpenChat && bookings.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    const firstBooking = bookings[0];
                    const targetId = firstBooking?.sender?.id || firstBooking?.sender_id;
                    const targetName = firstBooking?.sender?.name || firstBooking?.sender_name || 'Sender';
                    onOpenChat({ userId: targetId, userName: targetName });
                  }}
                  style={styles.backBtnCircle}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <View style={[styles.headerStatusBadge, tripStatus === 'COMPLETED' ? styles.headerStatusBadgeGreen : null]}>
                <Text style={styles.headerStatusBadgeText}>{tripStatus}</Text>
              </View>
            </View>
          </View>

          {/* Quick Route Strip inside Header */}
          <View style={styles.headerRouteStrip}>
            <View style={styles.headerRouteCol}>
              <Text style={styles.headerRouteLabel}>ORIGIN</Text>
              <Text style={styles.headerRouteVal} numberOfLines={1}>
                {fromLocation}
              </Text>
            </View>
            <View style={styles.headerRouteIconWrap}>
              <Ionicons name="airplane" size={16} color="#2DD4BF" />
            </View>
            <View style={[styles.headerRouteCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.headerRouteLabel}>DESTINATION</Text>
              <Text style={styles.headerRouteVal} numberOfLines={1}>
                {toLocation}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTripDetails(true)}
            colors={[FlyoraColors.primary]}
            tintColor={FlyoraColors.primary}
          />
        }
      >
        {/* 1. Trip Flight Overview & Capacity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWrap}>
              <Ionicons name="paper-plane" size={scale(18)} color="#089A8D" />
              <Text style={[styles.cardTitle, { fontSize: fontScale(13) }]}>Flight Route & Capacity</Text>
            </View>
            <View style={styles.activeNowBadge}>
              <Animated.View style={[styles.liveGreenDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={[styles.activeNowBadgeText, { fontSize: fontScale(10) }]}>LIVE ROUTE</Text>
            </View>
          </View>

          <View style={styles.specGrid}>
            <View style={styles.specCol}>
              <Text style={styles.specSmallLabel}>DEPARTURE DATE</Text>
              <Text style={styles.specBigValue}>{travelDate}</Text>
            </View>
            <View style={styles.specCol}>
              <Text style={styles.specSmallLabel}>AVAILABLE SPACE</Text>
              <Text style={[styles.specBigValue, { color: '#089A8D' }]}>{availableKg} KG</Text>
            </View>
            <View style={styles.specCol}>
              <Text style={styles.specSmallLabel}>RATE / KG</Text>
              <Text style={styles.specBigValue}>₹{ratePerKg}</Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.specSmallLabel}>DEPARTURE AIRPORT / CITY</Text>
              <Text style={styles.routeLocName} numberOfLines={1}>
                {fromLocation}
              </Text>
            </View>
            <Animated.View style={{ marginHorizontal: 12, transform: [{ translateY: floatAnim }] }}>
              <View style={styles.animatedPlaneBadge}>
                <Ionicons name="airplane" size={18} color="#089A8D" />
              </View>
            </Animated.View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.specSmallLabel}>ARRIVAL AIRPORT / CITY</Text>
              <Text style={styles.routeLocName} numberOfLines={1}>
                {toLocation}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Section Heading for Incoming Parcel Requests */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="cube" size={scale(18)} color="#089A8D" />
            <Text style={[styles.sectionHeadingTitle, { fontSize: fontScale(14) }]}>
              Incoming Parcel Requests
            </Text>
          </View>
          <View style={styles.requestCountBadge}>
            <Text style={styles.requestCountText}>{bookings.length} {bookings.length === 1 ? 'Request' : 'Requests'}</Text>
          </View>
        </View>

        {/* 3. Bookings List with Advanced Live Timeline & MNC Workflow Actions */}
        {bookings.length === 0 ? (
          <View style={styles.emptyRequestsBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cube-outline" size={32} color="#089A8D" />
            </View>
            <Text style={styles.emptyRequestsTitle}>No Parcel Requests Yet</Text>
            <Text style={styles.emptyRequestsText}>
              When verified senders book luggage space on this trip, their package details, escrow status, and action workflow will appear here instantly.
            </Text>
          </View>
        ) : (
          bookings.map((booking, bIndex) => {
            const senderName = booking.sender?.name || booking.sender_name || 'Sender';
            const senderEmail = booking.sender?.email || 'sender@flyorago.com';

            let recipientName = booking.receiver_name || booking.recipient_name || '';
            let recipientPhone = booking.receiver_phone || booking.recipient_phone || '';
            let recipientAddress = booking.receiver_address || booking.recipient_address || '';

            if (booking.sender_trip && typeof booking.sender_trip === 'object') {
              if (!recipientName && booking.sender_trip.terminal_from && booking.sender_trip.terminal_from !== 'N/A') {
                recipientName = booking.sender_trip.terminal_from;
              }
              if (!recipientPhone && booking.sender_trip.terminal_to && booking.sender_trip.terminal_to !== 'N/A') {
                recipientPhone = booking.sender_trip.terminal_to;
              }
              if (!recipientAddress && booking.sender_trip.to_location) {
                recipientAddress = booking.sender_trip.to_location;
              }
            }

            if (!recipientName) recipientName = 'Recipient';
            if (!recipientPhone) recipientPhone = booking.sender?.phone || '+91 9427700297';
            if (!recipientAddress) recipientAddress = toLocation || 'Delivery Address';
            const packageName = booking.package_name || booking.package?.name || 'Parcel';
            const weight = booking.weight || '10.00';
            const reward = booking.reward || booking.agreed_price || '130.00';
            const bStatus = (booking.status || 'PENDING').toUpperCase();

            // Extract verified images if already uploaded
            let existingImages: string[] = [];
            if (booking.package_image && typeof booking.package_image === 'string') {
              if (booking.package_image.startsWith('[')) {
                try {
                  existingImages = JSON.parse(booking.package_image);
                } catch (e) {}
              } else if (booking.package_image.startsWith('http') || booking.package_image.startsWith('data:')) {
                existingImages = [booking.package_image];
              }
            }

            const isPendingRequest =
              bStatus === 'REQUEST_SENT' || bStatus === 'PENDING' || bStatus === 'REQUEST_CREATED';
            const isAccepted = bStatus === 'ACCEPTED';
            const isPaid =
              bStatus === 'PAID' ||
              booking.payment_status === 'PAID' ||
              booking.payment_status === 'Escrow Hold' ||
              bStatus === 'PARCEL_VERIFIED' ||
              bStatus === 'IN_TRANSIT' ||
              bStatus === 'OUT_FOR_DELIVERY' ||
              bStatus === 'ARRIVED' ||
              bStatus === 'COMPLETED' ||
              bStatus === 'DELIVERED' ||
              bStatus === 'PAYMENT_RELEASED';

            const isReadyForPickup =
              isPaid &&
              bStatus !== 'PARCEL_VERIFIED' &&
              bStatus !== 'IN_TRANSIT' &&
              bStatus !== 'OUT_FOR_DELIVERY' &&
              bStatus !== 'ARRIVED' &&
              bStatus !== 'COMPLETED' &&
              bStatus !== 'DELIVERED' &&
              bStatus !== 'PAYMENT_RELEASED';

            const isParcelVerified = bStatus === 'PARCEL_VERIFIED';
            const isInTransit = bStatus === 'IN_TRANSIT';
            const isOutForDelivery = bStatus === 'OUT_FOR_DELIVERY' || bStatus === 'ARRIVED';
            const isCompleted =
              bStatus === 'COMPLETED' || bStatus === 'DELIVERED' || bStatus === 'PAYMENT_RELEASED';
            const isRejected = bStatus === 'REJECTED';

            const isActionLoading = actionLoadingId === booking.id;
            const currentStepIdx = getBookingStepIndex(bStatus, isPaid);

            return (
              <View key={`b-${booking.id || bIndex}`} style={styles.card}>
                {/* 1. Sender Top Line & KYC Badge */}
                <View style={styles.bookingSenderRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{senderName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.senderName}>{senderName}</Text>
                    <Text style={styles.senderEmail}>{senderEmail}</Text>
                  </View>
                  <View style={styles.badgesRow}>
                    <View style={styles.kycPill}>
                      <Ionicons name="shield-checkmark" size={11} color="#089A8D" />
                      <Text style={styles.kycPillText}>KYC VERIFIED</Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        isCompleted
                          ? styles.statusPillGreen
                          : isInTransit
                          ? styles.statusPillTeal
                          : isOutForDelivery
                          ? styles.statusPillIndigo
                          : isParcelVerified
                          ? styles.statusPillAmber
                          : isRejected
                          ? styles.statusPillRose
                          : styles.statusPillBlue,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillLabel,
                          isCompleted
                            ? styles.statusPillTextGreen
                            : isInTransit
                            ? styles.statusPillTextTeal
                            : isOutForDelivery
                            ? styles.statusPillTextIndigo
                            : isParcelVerified
                            ? styles.statusPillTextAmber
                            : isRejected
                            ? styles.statusPillTextRose
                            : styles.statusPillTextBlue,
                        ]}
                      >
                        {isCompleted
                          ? 'DELIVERED ✅'
                          : isInTransit
                          ? 'IN TRANSIT ✈️'
                          : isOutForDelivery
                          ? 'OUT FOR DELIVERY 🚚'
                          : isParcelVerified
                          ? 'PARCEL VERIFIED 📷'
                          : isRejected
                          ? 'REJECTED ❌'
                          : isAccepted
                          ? 'ACCEPTED (Awaiting Pay)'
                          : isPaid
                          ? 'PAID (In Escrow)'
                          : bStatus}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 2. Package Specifications & Offered Reward */}
                <View style={styles.packageBottomRow}>
                  <View style={styles.packageCol}>
                    <Text style={styles.colLabel}>PACKAGE NAME</Text>
                    <Text style={styles.colValue}>{packageName}</Text>
                  </View>
                  <View style={styles.packageCol}>
                    <Text style={styles.colLabel}>SPACE REQUIRED</Text>
                    <Text style={styles.colValue}>{weight} KG</Text>
                  </View>
                  <View style={[styles.packageCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.colLabel}>ESCROW REWARD</Text>
                    <Text style={[styles.colValue, { color: '#089A8D', fontWeight: '900' }]}>
                      ₹{reward}
                    </Text>
                  </View>
                </View>

                {/* 3. Live Animated Vertical Tracking Stepper for this Request */}
                <View style={styles.timelineWrapper}>
                  <View style={styles.timelineHeaderRow}>
                    <View style={styles.cardTitleWrap}>
                      <Ionicons name="sparkles" size={scale(15)} color="#089A8D" />
                      <Text style={[styles.timelineHeaderTitle, { fontSize: fontScale(12) }]}>
                        Live Handover & Delivery Stepper
                      </Text>
                    </View>
                    <View style={styles.escrowSafePill}>
                      <Ionicons name="lock-closed" size={10} color="#059669" />
                      <Text style={styles.escrowSafePillText}>Escrow Protected</Text>
                    </View>
                  </View>

                  <View style={styles.verticalTimelineContainer}>
                    {timelineSteps.map((st, sIdx) => {
                      const isDone = currentStepIdx >= st.step;
                      const isCurrent = currentStepIdx === st.step;
                      const isLast = sIdx === timelineSteps.length - 1;
                      const isPendingInit = isPendingRequest && st.step === 0;

                      return (
                        <View key={sIdx} style={styles.verticalStepRow}>
                          {/* Left Column: Number/Check Icon + Animated Pulse Ring + Connecting Bar */}
                          <View style={styles.verticalIndicatorColumn}>
                            {isCurrent && !isPendingInit && (
                              <Animated.View
                                style={[
                                  styles.pulseRing,
                                  {
                                    transform: [{ scale: pulseAnim }],
                                    opacity: pulseOpacity,
                                  },
                                ]}
                              />
                            )}

                            <View
                              style={[
                                styles.verticalStepNode,
                                isDone && !isPendingInit && styles.verticalStepNodeDone,
                                isCurrent && !isPendingInit && styles.verticalStepNodeCurrent,
                              ]}
                            >
                              {isDone && !isPendingInit ? (
                                <Ionicons name="checkmark" size={scale(12)} color="#FFFFFF" />
                              ) : isCurrent ? (
                                <Ionicons name={st.icon} size={scale(12)} color="#FFFFFF" />
                              ) : (
                                <Text style={[styles.verticalStepNumText, { fontSize: fontScale(10) }]}>
                                  {sIdx + 1}
                                </Text>
                              )}
                            </View>

                            {!isLast && (
                              <View
                                style={[
                                  styles.verticalConnectorLine,
                                  currentStepIdx > st.step && styles.verticalConnectorLineDone,
                                ]}
                              />
                            )}
                          </View>

                          {/* Right Column: Step Title & Live Description */}
                          <View
                            style={[
                              styles.verticalStepContent,
                              isCurrent && styles.verticalStepContentActive,
                              isLast && { paddingBottom: 4 },
                            ]}
                          >
                            <View style={styles.verticalStepHeaderRow}>
                              <Text
                                style={[
                                  styles.verticalStepTitle,
                                  { fontSize: fontScale(12) },
                                  isDone && !isPendingInit && styles.verticalStepTitleDone,
                                  isCurrent && !isPendingInit && styles.verticalStepTitleCurrent,
                                ]}
                              >
                                {isPendingInit ? 'New Request Received' : st.title}
                              </Text>

                              {isCurrent && !isPendingInit ? (
                                <View style={styles.activeNowBadge}>
                                  <View style={styles.liveGreenDot} />
                                  <Text style={[styles.activeNowBadgeText, { fontSize: fontScale(9) }]}>
                                    IN PROGRESS
                                  </Text>
                                </View>
                              ) : isDone && !isPendingInit ? (
                                <View style={styles.completedStepBadge}>
                                  <Text style={[styles.completedStepBadgeText, { fontSize: fontScale(9) }]}>
                                    COMPLETED
                                  </Text>
                                </View>
                              ) : null}
                            </View>

                            <Text style={[styles.verticalStepDesc, { fontSize: fontScale(10.5) }]}>
                              {st.desc}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* 4. Recipient Details Card */}
                <View style={styles.recipientBox}>
                  <View style={styles.recipientHeader}>
                    <View style={styles.recipientBadge}>
                      <Ionicons name="person-outline" size={11} color="#089A8D" />
                      <Text style={styles.recipientBadgeText}>PARCEL RECIPIENT</Text>
                    </View>
                    <Text style={styles.recipientContactLabel}>Handover Contact</Text>
                  </View>
                  <Text style={styles.recipientName}>{recipientName}</Text>

                  <View style={styles.recipientMetaRow}>
                    <TouchableOpacity
                      style={styles.phonePill}
                      onPress={() => Linking.openURL(`tel:${recipientPhone}`)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call-outline" size={13} color="#089A8D" />
                      <Text style={styles.phoneText}>{recipientPhone}</Text>
                    </TouchableOpacity>

                    <View style={styles.addressPill}>
                      <Ionicons name="location-outline" size={13} color="#64748B" />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {recipientAddress}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 5. Verified Pickup Photos if Available */}
                {existingImages.length > 0 && (
                  <View style={styles.verifiedPhotosBox}>
                    <View style={styles.verifiedPhotosHeader}>
                      <Ionicons name="camera" size={13} color="#089A8D" />
                      <Text style={styles.verifiedPhotosTitle}>
                        Verified Pickup Inspection Photos ({existingImages.length})
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                      {existingImages.map((uri, idx) => (
                        <Image key={idx} source={{ uri }} style={styles.verifiedThumb} />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 6. Dynamic MNC Top-Tier Workflow Action Buttons with Glowing Highlights */}
                <View style={styles.actionButtonsContainer}>
                  {isActionLoading ? (
                    <View style={styles.actionLoadingBox}>
                      <ActivityIndicator size="small" color="#089A8D" />
                      <Text style={styles.actionLoadingText}>Updating status...</Text>
                    </View>
                  ) : (
                    <>
                      {/* Step 1: Accept / Reject */}
                      {isPendingRequest && (
                        <View style={styles.buttonsRow}>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.acceptBtn]}
                            onPress={() => handleBookingAction(booking.id, 'ACCEPT')}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Accept Request</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleBookingAction(booking.id, 'REJECT')}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Step 2: Waiting for Sender Escrow Deposit */}
                      {isAccepted && !isPaid && (
                        <View style={styles.infoBanner}>
                          <Ionicons name="time-outline" size={16} color="#D97706" />
                          <Text style={styles.infoBannerText}>
                            Accepted! Waiting for Sender to deposit ₹{reward} into Escrow.
                          </Text>
                        </View>
                      )}

                      {/* Step 3: Verify Parcel Pickup & Photos */}
                      {isReadyForPickup && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.verifyPickupBtn]}
                          onPress={() => {
                            setSelectedBookingToVerify(booking);
                            setVerificationImages([]);
                            setVerifyModalVisible(true);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="camera" size={16} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Verify Parcel & Upload Photos 📷</Text>
                        </TouchableOpacity>
                      )}

                      {/* Step 4: Mark In Transit */}
                      {isParcelVerified && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.transitBtn]}
                          onPress={() => handleBookingAction(booking.id, 'START_TRANSIT')}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="airplane" size={16} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Mark In Flight Transit ✈️</Text>
                        </TouchableOpacity>
                      )}

                      {/* Step 5: Mark Out for Delivery */}
                      {isInTransit && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.deliveryBtn]}
                          onPress={() => handleBookingAction(booking.id, 'OUT_FOR_DELIVERY')}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="navigate" size={16} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Mark Out for Delivery / Arrived 📍</Text>
                        </TouchableOpacity>
                      )}

                      {/* Step 6: Complete Handover via OTP or QR Code */}
                      {isOutForDelivery && (
                        <View style={styles.buttonsRow}>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.completeBtn, { flex: 1.2 }]}
                            onPress={() => {
                              setSelectedBookingForOtp(booking);
                              setOtpInput('');
                              setOtpModalVisible(true);
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="key" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Enter OTP 🔑</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionBtn, styles.qrBtn, { flex: 1 }]}
                            onPress={() => {
                              setSelectedBookingForOtp(booking);
                              startQrScanner();
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="qr-code-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Scan QR</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Step 7: Completed Success Banner */}
                      {isCompleted && (
                        <TouchableOpacity
                          style={styles.successBanner}
                          onPress={() => {
                            setLastDeliveredBooking(booking);
                            setDeliverySuccessModalVisible(true);
                          }}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="checkmark-done-circle" size={18} color="#059669" />
                          <Text style={styles.successBannerText}>
                            Delivery Completed & Reward Released 🎉 (View Certificate)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ─── 1. VERIFY PARCEL PICKUP & PHOTO UPLOAD MODAL ─── */}
      <Modal visible={verifyModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrapAmber}>
                <Ionicons name="camera" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Pickup Handover Verification</Text>
                <Text style={styles.modalSub}>
                  Booking #{selectedBookingToVerify?.id} • {selectedBookingToVerify?.package_name || 'Parcel'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setVerifyModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalNotice}>
                Please take or upload clear photos of the physical parcel at handover. Photos are securely stored on the platform for Escrow guarantee.
              </Text>

              {/* Photo Upload Area */}
              <View style={styles.uploadButtonsRow}>
                <TouchableOpacity
                  style={styles.photoChoiceBtn}
                  onPress={captureImageFromCamera}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={20} color="#089A8D" />
                  <Text style={styles.photoChoiceText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoChoiceBtn}
                  onPress={pickImageFromGallery}
                  activeOpacity={0.8}
                >
                  <Ionicons name="images-outline" size={20} color="#089A8D" />
                  <Text style={styles.photoChoiceText}>Upload Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Uploaded Photos Grid */}
              {verificationImages.length > 0 && (
                <View style={styles.uploadedImagesGrid}>
                  {verificationImages.map((img, i) => (
                    <View key={i} style={styles.uploadedThumbWrap}>
                      <Image source={{ uri: img }} style={styles.uploadedThumb} />
                      <TouchableOpacity
                        style={styles.removePhotoBtn}
                        onPress={() => removeVerificationImage(i)}
                      >
                        <Ionicons name="close-circle" size={18} color="#F43F5E" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Guidelines Checklist */}
              <View style={styles.checklistCard}>
                <View style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={17} color="#089A8D" />
                  <Text style={styles.checkText}>No prohibited or hazardous items inside</Text>
                </View>
                <View style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={17} color="#089A8D" />
                  <Text style={styles.checkText}>
                    Weight is within agreed {selectedBookingToVerify?.weight || 10} KG
                  </Text>
                </View>
                <View style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={17} color="#089A8D" />
                  <Text style={styles.checkText}>Packaging is intact and ready for transit</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setVerifyModalVisible(false)}
                disabled={submittingVerification}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmModalBtn, verificationImages.length === 0 && { opacity: 0.6 }]}
                onPress={submitParcelVerification}
                disabled={submittingVerification || verificationImages.length === 0}
              >
                {submittingVerification ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.confirmModalBtnText}>
                      Confirm ({verificationImages.length}/5)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── 2. COMPLETE HANDOVER VIA OTP MODAL ─── */}
      <Modal visible={otpModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrapGreen}>
                <Ionicons name="key" size={20} color="#089A8D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Complete Delivery Handover</Text>
                <Text style={styles.modalSub}>Enter 6-digit delivery OTP from recipient</Text>
              </View>
              <TouchableOpacity
                onPress={() => setOtpModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalNotice}>
                Ask recipient ({selectedBookingForOtp?.recipient_name || selectedBookingForOtp?.receiver_name || 'Recipient'}) for the 6-digit handover OTP code, or scan their QR code to verify delivery.
              </Text>

              <TextInput
                style={styles.otpInputField}
                placeholder="0 0 0 0 0 0"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={otpInput}
                onChangeText={setOtpInput}
                autoFocus
              />

              <TouchableOpacity
                style={styles.scanQrAltBtn}
                onPress={() => {
                  setOtpModalVisible(false);
                  startQrScanner();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="qr-code-outline" size={18} color="#089A8D" />
                <Text style={styles.scanQrAltText}>Scan Recipient's Delivery QR Code Instead</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setOtpModalVisible(false)}
                disabled={verifyingOtp}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmModalBtn}
                onPress={() => submitOtpHandover()}
                disabled={verifyingOtp}
              >
                {verifyingOtp ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                    <Text style={styles.confirmModalBtnText}>Verify & Complete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── 3. QR SCANNER CAMERA MODAL ─── */}
      <Modal visible={qrModalVisible} animationType="slide">
        <View style={styles.qrCameraContainer}>
          {CameraComponent ? (
            <CameraComponent
              style={StyleSheet.absoluteFill}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff' }}>Camera module not available</Text>
            </View>
          )}

          <View style={styles.qrOverlay}>
            <View style={styles.qrHeader}>
              <TouchableOpacity
                style={styles.qrCloseBtn}
                onPress={() => setQrModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.qrHeaderTitle}>Scan Recipient's Delivery QR</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.qrTargetBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {scanned && (
                <View style={styles.verifyingOverlay}>
                  <ActivityIndicator size="large" color="#089A8D" />
                  <Text style={styles.verifyingText}>Verifying Delivery...</Text>
                </View>
              )}
            </View>

            <Text style={styles.qrGuideText}>
              Align the receiver's delivery QR code inside the frame to instantly verify handover.
            </Text>
          </View>
        </View>
      </Modal>

      {/* ─── 4. DELIVERY SUCCESS CELEBRATION MODAL ─── */}
      <DeliverySuccessModal
        visible={deliverySuccessModalVisible}
        onClose={() => setDeliverySuccessModalVisible(false)}
        role="traveler"
        packageTitle={lastDeliveredBooking?.package_name || 'Parcel Handover'}
        payoutAmount={lastDeliveredBooking?.reward || lastDeliveredBooking?.agreed_price || '130.00'}
        deliveryDate="Today"
        trackingId={`FL-${lastDeliveredBooking?.id || tripId}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#033D37',
  },
  loadingText: {
    marginTop: 14,
    fontSize: fontScale(13),
    fontWeight: '700',
    color: '#2DD4BF',
  },
  // Top Emerald Header
  header: {
    overflow: 'hidden',
    backgroundColor: '#033D37',
    ...Shadows.card,
  },
  headerGradient: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
    position: 'relative',
  },
  headerPlaneArtWrap: {
    position: 'absolute',
    right: -scale(16),
    bottom: -scale(10),
    width: scale(170),
    height: scale(130),
    opacity: 0.16,
  },
  headerPlaneArt: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(12),
    zIndex: 2,
  },
  backBtnCircle: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: scale(10),
  },
  headerPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: scale(2),
  },
  headerPillTagText: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#2DD4BF',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: fontScale(16),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: fontScale(11),
    color: '#CCFBF1',
    fontWeight: '600',
    marginTop: scale(1),
  },
  headerStatusBadge: {
    backgroundColor: 'rgba(45, 212, 191, 0.22)',
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerStatusBadgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: '#34D399',
  },
  headerStatusBadgeText: {
    color: '#FFFFFF',
    fontSize: fontScale(10),
    fontWeight: '800',
  },
  headerRouteStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: scale(14),
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    zIndex: 2,
  },
  headerRouteCol: {
    flex: 1,
  },
  headerRouteLabel: {
    fontSize: fontScale(9),
    fontWeight: '700',
    color: '#A7D9D3',
    letterSpacing: 0.6,
    marginBottom: scale(2),
  },
  headerRouteVal: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerRouteIconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(8),
  },
  scrollContent: {
    padding: scale(16),
    paddingBottom: scale(40),
  },
  // Main Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: scale(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: scale(10),
    marginBottom: scale(12),
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  cardTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(12),
  },
  specCol: {
    flex: 1,
  },
  specSmallLabel: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: scale(3),
  },
  specBigValue: {
    fontSize: fontScale(13),
    fontWeight: '900',
    color: '#0F172A',
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: scale(10),
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeLocName: {
    fontSize: fontScale(13),
    fontWeight: '800',
    color: '#0F172A',
  },
  animatedPlaneBadge: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#EDFCF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(6),
    marginBottom: scale(12),
    paddingHorizontal: scale(4),
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  sectionHeadingTitle: {
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  requestCountBadge: {
    backgroundColor: '#EDFCF9',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  requestCountText: {
    fontSize: fontScale(10),
    fontWeight: '800',
    color: '#0F766E',
  },
  emptyRequestsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    padding: scale(28),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: scale(14),
    ...Shadows.card,
  },
  emptyIconCircle: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: '#EDFCF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  emptyRequestsTitle: {
    fontSize: fontScale(14),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(6),
  },
  emptyRequestsText: {
    fontSize: fontScale(11.5),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: scale(18),
  },
  bookingSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: scale(12),
  },
  avatarBox: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#089A8D',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatarText: {
    fontSize: fontScale(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  senderName: {
    fontSize: fontScale(13),
    fontWeight: '800',
    color: '#0F172A',
  },
  senderEmail: {
    fontSize: fontScale(10.5),
    fontWeight: '500',
    color: '#64748B',
  },
  badgesRow: {
    alignItems: 'flex-end',
    gap: scale(4),
  },
  kycPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    backgroundColor: '#EDFCF9',
    paddingHorizontal: scale(7),
    paddingVertical: scale(2.5),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  kycPillText: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#089A8D',
  },
  statusPill: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(8),
  },
  statusPillLabel: {
    fontSize: fontScale(9),
    fontWeight: '800',
  },
  statusPillBlue: { backgroundColor: '#EFF6FF' },
  statusPillTextBlue: { color: '#2563EB' },
  statusPillTeal: { backgroundColor: '#CCFBF1' },
  statusPillTextTeal: { color: '#0F766E' },
  statusPillAmber: { backgroundColor: '#FEF3C7' },
  statusPillTextAmber: { color: '#B45309' },
  statusPillIndigo: { backgroundColor: '#E0E7FF' },
  statusPillTextIndigo: { color: '#4338CA' },
  statusPillGreen: { backgroundColor: '#DCFCE7' },
  statusPillTextGreen: { color: '#15803D' },
  statusPillRose: { backgroundColor: '#FFE4E6' },
  statusPillTextRose: { color: '#E11D48' },
  packageBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(14),
    padding: scale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: scale(12),
  },
  packageCol: { flex: 1 },
  colLabel: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#64748B',
    marginBottom: scale(2),
  },
  colValue: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#0F172A',
  },
  // Timeline Wrapper & Vertical Stepper
  timelineWrapper: {
    backgroundColor: '#FAFDFA',
    borderRadius: scale(16),
    padding: scale(12),
    borderWidth: 1,
    borderColor: '#E6FAF6',
    marginBottom: scale(12),
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
    paddingBottom: scale(6),
    borderBottomWidth: 1,
    borderBottomColor: '#F0FDF4',
  },
  timelineHeaderTitle: {
    fontWeight: '800',
    color: '#089A8D',
  },
  escrowSafePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(7),
    paddingVertical: scale(2),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  escrowSafePillText: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#059669',
  },
  verticalTimelineContainer: {
    paddingTop: scale(4),
  },
  verticalStepRow: {
    flexDirection: 'row',
  },
  verticalIndicatorColumn: {
    width: scale(32),
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    top: -scale(4),
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: 'rgba(13, 148, 136, 0.35)',
    zIndex: 1,
  },
  verticalStepNode: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  verticalStepNodeDone: {
    backgroundColor: '#089A8D',
    borderColor: '#A7F3D0',
  },
  verticalStepNodeCurrent: {
    backgroundColor: '#0D9488',
    borderColor: '#2DD4BF',
  },
  verticalStepNumText: {
    color: '#64748B',
    fontWeight: '800',
  },
  verticalConnectorLine: {
    width: scale(2.5),
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: scale(4),
    borderRadius: scale(2),
  },
  verticalConnectorLineDone: {
    backgroundColor: '#089A8D',
  },
  verticalStepContent: {
    flex: 1,
    marginLeft: scale(10),
    paddingBottom: scale(14),
  },
  verticalStepContentActive: {
    backgroundColor: 'rgba(240, 253, 250, 0.75)',
    borderRadius: scale(12),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: scale(8),
  },
  verticalStepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: scale(6),
  },
  verticalStepTitle: {
    fontWeight: '800',
    color: '#64748B',
  },
  verticalStepTitleDone: {
    color: '#089A8D',
  },
  verticalStepTitleCurrent: {
    color: '#0D9488',
  },
  activeNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: scale(7),
    paddingVertical: scale(2.5),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#5EEAD4',
  },
  liveGreenDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#0D9488',
    marginRight: scale(4),
  },
  activeNowBadgeText: {
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.4,
  },
  completedStepBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(6),
  },
  completedStepBadgeText: {
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  verticalStepDesc: {
    color: '#64748B',
    marginTop: scale(2),
    lineHeight: scale(15),
  },
  // Recipient Box
  recipientBox: {
    backgroundColor: '#F8FCFB',
    borderRadius: scale(14),
    padding: scale(12),
    borderWidth: 1,
    borderColor: '#E6FAF6',
    marginBottom: scale(12),
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(6),
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#E6FAF6',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(6),
  },
  recipientBadgeText: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#089A8D',
    letterSpacing: 0.5,
  },
  recipientContactLabel: {
    fontSize: fontScale(10),
    fontWeight: '600',
    color: '#94A3B8',
  },
  recipientName: {
    fontSize: fontScale(12.5),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(6),
  },
  recipientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  phoneText: {
    fontSize: fontScale(11),
    fontWeight: '700',
    color: '#089A8D',
  },
  addressPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  addressText: {
    fontSize: fontScale(11),
    fontWeight: '600',
    color: '#475569',
  },
  // Photos Box
  verifiedPhotosBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: scale(12),
    padding: scale(10),
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: scale(12),
  },
  verifiedPhotosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    marginBottom: scale(8),
  },
  verifiedPhotosTitle: {
    fontSize: fontScale(11),
    fontWeight: '800',
    color: '#0F766E',
  },
  photosScroll: {
    flexDirection: 'row',
  },
  verifiedThumb: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(8),
    marginRight: scale(8),
    backgroundColor: '#E2E8F0',
  },
  // Workflow Action Buttons
  actionButtonsContainer: {
    marginTop: scale(2),
  },
  actionLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: scale(12),
    backgroundColor: '#F8FAFC',
    borderRadius: scale(12),
  },
  actionLoadingText: {
    fontSize: fontScale(12),
    fontWeight: '700',
    color: '#089A8D',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: scale(10),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: scale(12),
    borderRadius: scale(12),
    ...Shadows.sm,
  },
  actionBtnText: {
    fontSize: fontScale(12.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  acceptBtn: {
    flex: 1.5,
    backgroundColor: '#089A8D',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
  },
  verifyPickupBtn: {
    backgroundColor: '#D97706',
  },
  transitBtn: {
    backgroundColor: '#0284C7',
  },
  deliveryBtn: {
    backgroundColor: '#6366F1',
  },
  completeBtn: {
    backgroundColor: '#059669',
  },
  qrBtn: {
    backgroundColor: '#089A8D',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#FEF3C7',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoBannerText: {
    flex: 1,
    fontSize: fontScale(11.5),
    fontWeight: '700',
    color: '#92400E',
    lineHeight: scale(16),
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#ECFDF5',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successBannerText: {
    flex: 1,
    fontSize: fontScale(11.5),
    fontWeight: '800',
    color: '#065F46',
    lineHeight: scale(16),
  },
  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: scale(18),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(22),
    overflow: 'hidden',
    maxHeight: '85%',
    ...Shadows.cardHover,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalIconWrapAmber: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconWrapGreen: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#EDFCF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fontScale(14),
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: fontScale(11),
    fontWeight: '600',
    color: '#64748B',
  },
  modalBody: {
    padding: scale(18),
  },
  modalNotice: {
    fontSize: fontScale(11.5),
    fontWeight: '500',
    color: '#475569',
    lineHeight: scale(17),
    marginBottom: scale(14),
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: scale(10),
    marginBottom: scale(14),
  },
  photoChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    backgroundColor: '#EDFCF9',
    borderWidth: 1,
    borderColor: '#089A8D',
    borderStyle: 'dashed',
    borderRadius: scale(12),
    paddingVertical: scale(12),
  },
  photoChoiceText: {
    fontSize: fontScale(11.5),
    fontWeight: '700',
    color: '#089A8D',
  },
  uploadedImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    marginBottom: scale(14),
  },
  uploadedThumbWrap: {
    width: scale(68),
    height: scale(68),
    borderRadius: scale(10),
    position: 'relative',
  },
  uploadedThumb: {
    width: '100%',
    height: '100%',
    borderRadius: scale(10),
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -scale(6),
    right: -scale(6),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(10),
  },
  checklistCard: {
    backgroundColor: '#F8FCFB',
    borderRadius: scale(14),
    padding: scale(12),
    borderWidth: 1,
    borderColor: '#E6FAF6',
    gap: scale(10),
    marginBottom: scale(10),
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  checkText: {
    fontSize: fontScale(11),
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  otpInputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#089A8D',
    borderRadius: scale(14),
    paddingVertical: scale(14),
    fontSize: fontScale(22),
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: scale(12),
  },
  scanQrAltBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: scale(10),
    borderRadius: scale(10),
    backgroundColor: '#EDFCF9',
  },
  scanQrAltText: {
    fontSize: fontScale(11),
    fontWeight: '700',
    color: '#089A8D',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: scale(10),
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(12),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: fontScale(12),
    fontWeight: '700',
    color: '#64748B',
  },
  confirmModalBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: scale(12),
    borderRadius: scale(12),
    backgroundColor: '#089A8D',
  },
  confirmModalBtnText: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // QR Modal
  qrCameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  qrOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 50,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: scale(16),
  },
  qrCloseBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrHeaderTitle: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qrTargetBox: {
    width: scale(250),
    height: scale(250),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: scale(28),
    height: scale(28),
    borderColor: '#089A8D',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  verifyingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: scale(20),
    borderRadius: scale(16),
    alignItems: 'center',
    gap: scale(8),
  },
  verifyingText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: fontScale(13),
  },
  qrGuideText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: scale(30),
    lineHeight: scale(18),
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: scale(10),
    borderRadius: scale(20),
  },
});
