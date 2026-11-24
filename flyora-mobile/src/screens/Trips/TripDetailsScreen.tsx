import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop } from '../../constants/responsive';
import { Shadows } from '../../constants/theme';
import { apiFetch } from '../../services/api';
import { AppAlert as Alert } from '../../components/AppAlertModal';
import { DeliverySuccessModal } from '../../components/DeliverySuccessModal';

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
} catch (e) { }

// Memory Cache for Trip Details to eliminate loading spinners on low devices
const TRIP_DETAILS_MEMORY_CACHE = new Map<string, any>();

interface TripDetailsScreenProps {
  tripId: string | number;
  initialTrip?: any;
  onBack: () => void;
  onOpenChat?: () => void;
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

  const fetchTripDetails = async (isSilent = false) => {
    if (!isSilent && !trip) {
      setLoading(true);
    }
    try {
      // 1. Fetch trip details directly
      let latestTrip = trip;
      const tripRes = await apiFetch(`/api/trips/${tripId}/`);
      if (tripRes.success && tripRes.data) {
        latestTrip = tripRes.data;
        setTrip(tripRes.data);
      }

      // 2. Fetch associated bookings
      let latestBookings = bookings;
      const bookingsRes = await apiFetch(`/api/bookings/?user_only=true&page_size=100`);
      if (bookingsRes.success && bookingsRes.data) {
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
            (tripRes.data &&
              b.from_location === tripRes.data.from_location &&
              b.to_location === tripRes.data.to_location)
        );
        if (matched.length > 0) {
          latestBookings = matched;
          setBookings(matched);
        }
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
    }
  };

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
        if (action === 'ACCEPT') successMsg = 'Request accepted! Sender has been notified to deposit payment into Escrow.';
        if (action === 'REJECT') successMsg = 'Request rejected successfully.';
        if (action === 'VERIFY_PARCEL') successMsg = 'Parcel pickup photos & verification saved! Status: Ready for transit.';
        if (action === 'START_TRANSIT') successMsg = 'Trip is now Marked In Transit! ✈️';
        if (action === 'OUT_FOR_DELIVERY') successMsg = 'Marked Out for Delivery! Handover OTP has been generated.';
        if (action === 'CONFIRM_DELIVERY') {
          // Instantly trigger Advanced Delivery Success Celebration Modal without any intermediate alert interruption
          const targetBooking = bookings.find((b) => b.id === bookingId);
          setLastDeliveredBooking(targetBooking || { id: bookingId });
          setDeliverySuccessModalVisible(true);
          await fetchTripDetails();
          return;
        }

        Alert.alert('Status Updated', successMsg);
        await fetchTripDetails();
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
        Alert.alert('Permission Denied', 'Please grant permission to access your photo gallery to upload parcel pictures.');
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
        Alert.alert('Camera Permission', 'Please grant camera access to take parcel handover photos.');
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
      Alert.alert('Photos Required', 'Please take or upload at least 1 photo of the physical parcel at pickup handover (as on Web).');
      return;
    }
    setSubmittingVerification(true);
    try {
      await handleBookingAction(selectedBookingToVerify.id, 'VERIFY_PARCEL', {
        payload: { images: verificationImages },
        images: verificationImages,
      });
      setVerifyModalVisible(false);
      setSelectedBookingToVerify(null);
      setVerificationImages([]);
    } finally {
      setSubmittingVerification(false);
    }
  };

  // Confirm Delivery Handover with OTP
  const submitOtpHandover = async (codeToVerify?: string) => {
    if (!selectedBookingForOtp) return;
    const finalCode = (codeToVerify || otpInput).trim();
    if (!finalCode) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit handover OTP code or scan the recipient QR code.');
      return;
    }
    setVerifyingOtp(true);
    try {
      await handleBookingAction(selectedBookingForOtp.id, 'CONFIRM_DELIVERY', {
        otp: finalCode,
      });
      setOtpModalVisible(false);
      setQrModalVisible(false);
      setSelectedBookingForOtp(null);
      setOtpInput('');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle QR Barcode Scanned
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    let extractedOtp = data.trim();
    if (extractedOtp.toUpperCase().includes('FLYORA-OTP-')) {
      extractedOtp = extractedOtp.toUpperCase().replace('FLYORA-OTP-', '').trim();
    }

    if (extractedOtp.length >= 6) {
      submitOtpHandover(extractedOtp);
    } else {
      Alert.alert('Invalid QR Code', `The scanned code (${data}) does not contain a valid Flyora delivery OTP.`, [
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#089A8D" />
        <Text style={styles.loadingText}>Loading Trip Details...</Text>
      </View>
    );
  }

  const fromLocation = trip?.from_location || trip?.fromAirport || 'Origin';
  const toLocation = trip?.to_location || trip?.toAirport || 'Destination';
  const travelDate = trip?.departure_date || 'Upcoming';
  const availableKg = trip?.available_weight ?? '10';
  const ratePerKg = trip?.price_per_kg ?? '15';
  const status = (trip?.status || 'Active').toUpperCase();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip #{tripId} Details</Text>
        <TouchableOpacity style={styles.chatButton} onPress={onOpenChat} activeOpacity={0.7}>
          <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Route Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.routeCol}>
              <Text style={styles.routeCityLabel}>FROM</Text>
              <Text style={styles.routeCity} numberOfLines={1}>
                {fromLocation}
              </Text>
            </View>

            <View style={styles.planeIconWrap}>
              <Ionicons name="airplane" size={20} color="#089A8D" />
            </View>

            <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.routeCityLabel}>TO</Text>
              <Text style={styles.routeCity} numberOfLines={1}>
                {toLocation}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Key Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Ionicons name="calendar-outline" size={15} color="#089A8D" />
              <Text style={styles.metricText}>{travelDate}</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="briefcase-outline" size={15} color="#089A8D" />
              <Text style={styles.metricText}>{availableKg} KG Free</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="cash-outline" size={15} color="#089A8D" />
              <Text style={styles.metricText}>₹{ratePerKg}/KG</Text>
            </View>
            <View style={[styles.statusBadge, status === 'COMPLETED' ? styles.statusCompleted : styles.statusActive]}>
              <Text style={[styles.statusText, status === 'COMPLETED' ? styles.statusCompletedText : styles.statusActiveText]}>
                {status}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Incoming Parcel Requests</Text>
          <View style={styles.requestCountBadge}>
            <Text style={styles.requestCountText}>{bookings.length}</Text>
          </View>
        </View>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <View style={styles.emptyRequestsBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cube-outline" size={28} color="#94A3B8" />
            </View>
            <Text style={styles.emptyRequestsTitle}>No Parcel Requests Yet</Text>
            <Text style={styles.emptyRequestsText}>
              When senders book space on this trip, their package details and live workflow actions will appear here.
            </Text>
          </View>
        ) : (
          bookings.map((booking) => {
            const senderName = booking.sender?.name || booking.sender_name || 'Sender';
            const senderEmail = booking.sender?.email || 'sender@flyorago.com';

            // Resolve receiver details from booking or fallback to sender_trip
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
                } catch (e) { }
              } else if (booking.package_image.startsWith('http') || booking.package_image.startsWith('data:')) {
                existingImages = [booking.package_image];
              }
            }

            const isPendingRequest = bStatus === 'REQUEST_SENT' || bStatus === 'PENDING' || bStatus === 'REQUEST_CREATED';
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
            const isCompleted = bStatus === 'COMPLETED' || bStatus === 'DELIVERED' || bStatus === 'PAYMENT_RELEASED';
            const isRejected = bStatus === 'REJECTED';

            const isActionLoading = actionLoadingId === booking.id;

            return (
              <View key={`b-${booking.id}`} style={styles.bookingCard}>
                {/* Sender Top Line */}
                <View style={styles.bookingSenderRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {senderName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.senderName}>{senderName}</Text>
                    <Text style={styles.senderEmail}>{senderEmail}</Text>
                  </View>
                  <View style={styles.badgesRow}>
                    <View style={styles.kycPill}>
                      <Ionicons name="shield-checkmark" size={11} color="#089A8D" />
                      <Text style={styles.kycPillText}>KYC</Text>
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

                {/* Recipient Details Row */}
                <View style={styles.recipientBox}>
                  <View style={styles.recipientHeader}>
                    <View style={styles.recipientBadge}>
                      <Ionicons name="person-outline" size={11} color="#089A8D" />
                      <Text style={styles.recipientBadgeText}>PARCEL RECIPIENT</Text>
                    </View>
                    <Text style={styles.recipientContactLabel}>Delivery Contact</Text>
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

                {/* Verified Photos Preview if already uploaded */}
                {existingImages.length > 0 && (
                  <View style={styles.verifiedPhotosBox}>
                    <View style={styles.verifiedPhotosHeader}>
                      <Ionicons name="camera" size={13} color="#089A8D" />
                      <Text style={styles.verifiedPhotosTitle}>Verified Pickup Photos ({existingImages.length})</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                      {existingImages.map((uri, idx) => (
                        <Image key={idx} source={{ uri }} style={styles.verifiedThumb} />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Package Space & Reward Bottom */}
                <View style={styles.packageBottomRow}>
                  <View style={styles.packageCol}>
                    <Text style={styles.colLabel}>PACKAGE</Text>
                    <Text style={styles.colValue}>{packageName}</Text>
                  </View>
                  <View style={styles.packageCol}>
                    <Text style={styles.colLabel}>WEIGHT</Text>
                    <Text style={styles.colValue}>{weight} KG Space</Text>
                  </View>
                  <View style={[styles.packageCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.colLabel}>REWARD</Text>
                    <Text style={[styles.colValue, { color: '#089A8D' }]}>₹{reward}</Text>
                  </View>
                </View>

                {/* ── WORKFLOW ACTION BUTTONS (MNC TOP TIER FLOW) ── */}
                <View style={styles.actionButtonsContainer}>
                  {isActionLoading ? (
                    <View style={styles.actionLoadingBox}>
                      <ActivityIndicator size="small" color="#089A8D" />
                      <Text style={styles.actionLoadingText}>Updating status...</Text>
                    </View>
                  ) : (
                    <>
                      {/* 1. ACCEPT / REJECT BUTTONS */}
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

                      {/* 2. ACCEPTED - WAITING FOR PAYMENT */}
                      {isAccepted && !isPaid && (
                        <View style={styles.infoBanner}>
                          <Ionicons name="time-outline" size={15} color="#D97706" />
                          <Text style={styles.infoBannerText}>
                            Accepted! Waiting for Sender to deposit payment into Escrow.
                          </Text>
                        </View>
                      )}

                      {/* 3. VERIFY PICKUP & UPLOAD PHOTOS (EXACT MATCH WITH WEB) */}
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

                      {/* 4. MARK IN TRANSIT */}
                      {isParcelVerified && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.transitBtn]}
                          onPress={() => handleBookingAction(booking.id, 'START_TRANSIT')}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="airplane" size={16} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Mark In Transit ✈️</Text>
                        </TouchableOpacity>
                      )}

                      {/* 5. MARK OUT FOR DELIVERY */}
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

                      {/* 6. COMPLETE HANDOVER VIA OTP OR QR CODE */}
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

                      {/* 7. COMPLETED SUCCESS BANNER */}
                      {isCompleted && (
                        <View style={styles.successBanner}>
                          <Ionicons name="checkmark-done-circle" size={16} color="#059669" />
                          <Text style={styles.successBannerText}>
                            Delivery Completed & Reward Released to Wallet
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ─── 1. VERIFY PARCEL PICKUP & PHOTO UPLOAD MODAL (WEB MATCH) ─── */}
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
              <TouchableOpacity onPress={() => setVerifyModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalNotice}>
                Please take or upload clear photos of the physical parcel at handover. Photos are securely stored on the platform for Escrow guarantee.
              </Text>

              {/* Photo Upload Area */}
              <View style={styles.uploadButtonsRow}>
                <TouchableOpacity style={styles.photoChoiceBtn} onPress={captureImageFromCamera} activeOpacity={0.8}>
                  <Ionicons name="camera-outline" size={20} color="#089A8D" />
                  <Text style={styles.photoChoiceText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoChoiceBtn} onPress={pickImageFromGallery} activeOpacity={0.8}>
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
                      <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removeVerificationImage(i)}>
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
                  <Text style={styles.checkText}>Weight is within agreed {selectedBookingToVerify?.weight || 10} KG</Text>
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
                    <Text style={styles.confirmModalBtnText}>Confirm ({verificationImages.length}/5)</Text>
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
              <TouchableOpacity onPress={() => setOtpModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
                    <Text style={styles.confirmModalBtnText}>Verify & Release</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── 3. LIVE QR SCANNER CAMERA MODAL ─── */}
      <Modal visible={qrModalVisible} animationType="slide">
        <View style={styles.qrCameraContainer}>
          {CameraComponent ? (
            <CameraComponent
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="camera-outline" size={48} color="#94A3B8" />
              <Text style={{ color: '#FFFFFF', marginTop: 12, fontSize: 14 }}>Camera scanner not available in this environment</Text>
            </View>
          )}

          {/* Scanner Overlay */}
          <View style={styles.qrOverlay}>
            <View style={styles.qrHeader}>
              <TouchableOpacity
                style={styles.qrCloseBtn}
                onPress={() => setQrModalVisible(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.qrHeaderTitle}>Scan Recipient Delivery QR</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.qrTargetBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {verifyingOtp && (
                <View style={styles.verifyingOverlay}>
                  <ActivityIndicator size="large" color="#089A8D" />
                  <Text style={styles.verifyingText}>Verifying Handover...</Text>
                </View>
              )}
            </View>

            <Text style={styles.qrGuideText}>
              Align recipient's QR code within the frame to verify handover automatically.
            </Text>
          </View>
        </View>
      </Modal>

      {/* ─── 4. ADVANCED DELIVERY SUCCESS CELEBRATION MODAL ─── */}
      <DeliverySuccessModal
        visible={deliverySuccessModalVisible}
        onClose={() => setDeliverySuccessModalVisible(false)}
        role="traveler"
        packageTitle={
          lastDeliveredBooking?.package_name ||
          lastDeliveredBooking?.aircraft ||
          'Parcel Delivery'
        }
        payoutAmount={
          lastDeliveredBooking?.reward ||
          lastDeliveredBooking?.price ||
          (parseFloat(lastDeliveredBooking?.weight || '2') * 10).toFixed(2)
        }
        trackingId={String(lastDeliveredBooking?.id || '')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FCFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#089A8D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#033D37',
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  chatButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6FAF6',
    ...Shadows.card,
    marginBottom: 24,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeCol: {
    flex: 1,
  },
  routeCityLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  routeCity: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  planeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EDFCF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusActive: {
    backgroundColor: '#EDFCF9',
  },
  statusActiveText: {
    color: '#089A8D',
  },
  statusCompleted: {
    backgroundColor: '#E2FBE8',
  },
  statusCompletedText: {
    color: '#166534',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  requestCountBadge: {
    backgroundColor: '#089A8D',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  requestCountText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptyRequestsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.card,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyRequestsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyRequestsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6FAF6',
    ...Shadows.card,
  },
  bookingSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#089A8D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  senderEmail: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  badgesRow: {
    alignItems: 'flex-end',
    gap: 4,
  },
  kycPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EDFCF9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  kycPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#089A8D',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusPillBlue: {
    backgroundColor: '#EFF6FF',
  },
  statusPillTextBlue: {
    color: '#2563EB',
  },
  statusPillTeal: {
    backgroundColor: '#CCFBF1',
  },
  statusPillTextTeal: {
    color: '#0F766E',
  },
  statusPillAmber: {
    backgroundColor: '#FEF3C7',
  },
  statusPillTextAmber: {
    color: '#B45309',
  },
  statusPillIndigo: {
    backgroundColor: '#E0E7FF',
  },
  statusPillTextIndigo: {
    color: '#4338CA',
  },
  statusPillGreen: {
    backgroundColor: '#DCFCE7',
  },
  statusPillTextGreen: {
    color: '#15803D',
  },
  statusPillRose: {
    backgroundColor: '#FFE4E6',
  },
  statusPillTextRose: {
    color: '#E11D48',
  },
  recipientBox: {
    backgroundColor: '#F8FCFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6FAF6',
    marginBottom: 12,
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6FAF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recipientBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#089A8D',
    letterSpacing: 0.5,
  },
  recipientContactLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  recipientName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  recipientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#089A8D',
  },
  addressPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  verifiedPhotosBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 12,
  },
  verifiedPhotosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  verifiedPhotosTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  photosScroll: {
    flexDirection: 'row',
  },
  verifiedThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#E2E8F0',
  },
  packageBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginBottom: 12,
  },
  packageCol: {
    flex: 1,
  },
  colLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  colValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionButtonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  actionLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  actionLoadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#089A8D',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#F43F5E',
    paddingHorizontal: 16,
  },
  verifyPickupBtn: {
    backgroundColor: '#D97706',
    width: '100%',
  },
  transitBtn: {
    backgroundColor: '#0F766E',
    width: '100%',
  },
  deliveryBtn: {
    backgroundColor: '#4338CA',
    width: '100%',
  },
  completeBtn: {
    backgroundColor: '#059669',
  },
  qrBtn: {
    backgroundColor: '#0F172A',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  infoBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    borderRadius: 10,
  },
  successBannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  modalIconWrapAmber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconWrapGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDFCF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  modalBody: {
    padding: 18,
  },
  modalNotice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  photoChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EDFCF9',
    borderWidth: 1,
    borderColor: '#089A8D',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
  },
  photoChoiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#089A8D',
  },
  uploadedImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  uploadedThumbWrap: {
    width: 68,
    height: 68,
    borderRadius: 10,
    position: 'relative',
  },
  uploadedThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  checklistCard: {
    backgroundColor: '#F8FCFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6FAF6',
    gap: 10,
    marginBottom: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  otpInputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#089A8D',
    borderRadius: 14,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 12,
  },
  scanQrAltBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EDFCF9',
  },
  scanQrAltText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#089A8D',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmModalBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#089A8D',
  },
  confirmModalBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
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
    paddingHorizontal: 16,
  },
  qrCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qrTargetBox: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
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
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  verifyingText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  qrGuideText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    borderRadius: 20,
  },
});
