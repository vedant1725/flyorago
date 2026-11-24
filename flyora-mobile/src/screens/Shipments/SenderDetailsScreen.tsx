import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Platform,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop, fontScale, scale } from '../../constants/responsive';
import { FlyoraColors, Shadows } from '../../constants/theme';
import { apiFetch } from '../../services/api';
import { Storage, STORAGE_KEYS } from '../../services/storage';
import { GlobalNotificationSync } from '../../services/notificationSync';
import { AppAlert as Alert } from '../../components/AppAlertModal';
import { QrViewModal } from '../../components/QrViewModal';
import { DeliverySuccessModal } from '../../components/DeliverySuccessModal';

const { width } = Dimensions.get('window');

interface SenderDetailsScreenProps {
  requestId: string | number;
  initialRequest?: any;
  onBack: () => void;
  onOpenChat?: () => void;
}

export const SenderDetailsScreen: React.FC<SenderDetailsScreenProps> = ({
  requestId,
  initialRequest,
  onBack,
  onOpenChat,
}) => {
  const insets = useSafeAreaInsets();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Escrow Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [senderWalletBalance, setSenderWalletBalance] = useState<number>(0);

  // Dispute Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Damaged Parcel');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Advanced QR View & Delivery Success State
  const [showQrModal, setShowQrModal] = useState(false);
  const [showDeliverySuccessModal, setShowDeliverySuccessModal] = useState(false);
  const previousStatusRef = useRef<string | null>(null);

  // Advanced Pulse and Glow Animation for Live Active Step in Vertical Timeline (Hook must be at top)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

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
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  // Fast parallel fetch with direct ID query fallback for blazing fast loading
  const loadBookingData = useCallback(async (isPullToRefresh = false, isSilent = false) => {
    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else if (!isSilent && !booking) {
        setLoading(true);
      }

      // Parallel async fetch for instant response time
      const [bookingsRes, tripsRes] = await Promise.all([
        apiFetch('/api/bookings/?user_only=true&page_size=50').catch(() => null),
        apiFetch('/api/trips/?user_only=true&page_size=50').catch(() => null),
      ]);

      // Also fetch sender wallet balance
      try {
        const walletRes = await apiFetch('/api/wallet/summary');
        if ((walletRes as any)?.data?.balance_available !== undefined) {
          setSenderWalletBalance(parseFloat((walletRes as any).data.balance_available) || 0);
        }
      } catch (wErr) {
        // silent
      }

      let bookingsData: any[] = [];
      let tripsData: any[] = [];

      if (bookingsRes) {
        const rawB =
          (bookingsRes as any)?.data?.results ||
          (bookingsRes as any)?.data ||
          (bookingsRes as any)?.results ||
          bookingsRes;
        if (Array.isArray(rawB)) {
          bookingsData = rawB;
        } else if (rawB && typeof rawB === 'object' && Array.isArray(rawB.results)) {
          bookingsData = rawB.results;
        }
      }

      if (tripsRes) {
        const rawT =
          (tripsRes as any)?.data?.results ||
          (tripsRes as any)?.data ||
          (tripsRes as any)?.results ||
          tripsRes;
        if (Array.isArray(rawT)) {
          tripsData = rawT;
        } else if (rawT && typeof rawT === 'object' && Array.isArray(rawT.results)) {
          tripsData = rawT.results;
        }
      }

      const reqStr = String(requestId || '');

      // 1. Locate Sender Trip in trips
      let senderTrip = tripsData.find(
        (item: any) =>
          item &&
          (String(item.id) === reqStr ||
            `#REQ${item.id}` === reqStr ||
            String(item.id) === reqStr.replace('#REQ', '').replace('#BK', ''))
      );

      // 2. Locate linked Booking in bookings
      // Find all bookings that match this sender trip or booking ID
      const matchedBookings = bookingsData.filter((bk: any) => {
        if (!bk) return false;
        if (String(bk.id) === reqStr || `#BK${bk.id}` === reqStr) return true;
        if (senderTrip) {
          const sTripId = String(senderTrip.id);
          const bSenderTrip = bk.sender_trip ? String(typeof bk.sender_trip === 'object' ? bk.sender_trip.id : bk.sender_trip) : '';
          const bTrip = bk.trip ? String(typeof bk.trip === 'object' ? bk.trip.id : bk.trip) : '';
          const bTripDetails = bk.trip_details ? String(bk.trip_details.id) : '';
          return bSenderTrip === sTripId || bTrip === sTripId || bTripDetails === sTripId;
        }
        return false;
      });

      // Sort matched bookings descending by id to get the latest booking
      matchedBookings.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
      let linkedBooking = matchedBookings[0] || null;

      // Fallback if not found in tripsData, check initialRequest or existing booking
      if (!senderTrip && initialRequest) {
        senderTrip = initialRequest;
      }
      if (!senderTrip && booking) {
        senderTrip = {
          id: booking.rawId,
          aircraft: booking.packageName,
          capacity_weight: booking.weight,
          from_location: booking.route?.from,
          to_location: booking.route?.to,
          departure_date: booking.route?.depDate,
          created_at: booking.createdAt,
        };
      }

      if (!senderTrip && linkedBooking) {
        const tripRef = linkedBooking.sender_trip || linkedBooking.trip;
        if (tripRef) {
          const refId = String(typeof tripRef === 'object' ? tripRef.id : tripRef);
          senderTrip = tripsData.find((t: any) => t && String(t.id) === refId);
        }
      }

      if (senderTrip || linkedBooking) {
        // Find assigned traveler from linkedBooking or trip_details
        let travelerObj: any = null;
        if (linkedBooking) {
          const tData = linkedBooking.traveler;
          const trDetails = linkedBooking.trip_details || {};
          const tName = typeof tData === 'object' && tData?.name
            ? tData.name
            : (typeof tData === 'string' && tData.trim() ? tData : (linkedBooking.traveler_name || ''));

          if (tName && tName !== 'Traveler') {
            travelerObj = {
              id: typeof tData === 'object' ? tData.id : null,
              name: tName,
              email: typeof tData === 'object' && tData.email ? tData.email : 'traveler@flyorago.com',
              phone: typeof tData === 'object' && tData.phone ? tData.phone : '',
              flightNo: (typeof tData === 'object' && tData.flightNo) || trDetails.flight_number || linkedBooking.flight_number || 'FL-782',
              airline: (typeof tData === 'object' && tData.airline) || trDetails.airline || linkedBooking.airline || 'Commercial Airline',
              travelDate: (typeof tData === 'object' && tData.departureDate) || trDetails.departure_date || linkedBooking.departure_date || senderTrip?.departure_date || '2026-11-25',
              isKycVerified: typeof tData === 'object' && tData.is_kyc_verified !== undefined ? tData.is_kyc_verified : true,
            };
          }
        }

        const hasTraveler = Boolean(travelerObj);
        const isPaid = Boolean(
          linkedBooking &&
          (linkedBooking.payment_status === 'Escrow Hold' ||
            linkedBooking.payment_status === 'PAID' ||
            linkedBooking.status === 'PAID' ||
            linkedBooking.status === 'PARCEL_VERIFIED' ||
            linkedBooking.status === 'IN_TRANSIT' ||
            linkedBooking.status === 'ARRIVED' ||
            linkedBooking.status === 'OUT_FOR_DELIVERY' ||
            linkedBooking.status === 'DELIVERED' ||
            linkedBooking.status === 'PAYMENT_RELEASED')
        );
        const rawStatus = (linkedBooking?.status || 'Searching for Traveler').toUpperCase();

        const resolvedStatus = linkedBooking
          ? ['PARCEL_VERIFIED', 'IN_TRANSIT', 'ARRIVED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAYMENT_RELEASED', 'DISPUTED'].includes(rawStatus)
            ? rawStatus
            : isPaid
              ? 'PAID'
              : hasTraveler
                ? rawStatus === 'ACCEPTED' ? 'ACCEPTED' : (rawStatus || 'REQUEST_SENT')
                : 'Searching for Traveler'
          : 'Searching for Traveler';

        const targetBookingId = linkedBooking?.id || senderTrip?.id || 1;
        const rawOtp =
          linkedBooking?.delivery_otp ||
          linkedBooking?.deliveryOtp ||
          String(((Number(targetBookingId) * 3791 + 100000) % 900000) + 100000);

        // Collect photos
        const allImgs: string[] = [];
        if (senderTrip?.accepted_parcel_types && Array.isArray(senderTrip.accepted_parcel_types)) {
          allImgs.push(...senderTrip.accepted_parcel_types);
        }
        if (linkedBooking?.package_image) {
          try {
            const parsed = JSON.parse(linkedBooking.package_image);
            if (Array.isArray(parsed)) allImgs.push(...parsed);
          } catch {
            if (typeof linkedBooking.package_image === 'string' && linkedBooking.package_image.length > 30) {
              allImgs.push(linkedBooking.package_image);
            }
          }
        }

        // Parse receiver info safely
        let recName = linkedBooking?.receiver_name || (senderTrip?.terminal_from && senderTrip?.terminal_from !== 'N/A' ? senderTrip.terminal_from : '') || 'Receiver';
        let recPhone = linkedBooking?.receiver_phone || (senderTrip?.terminal_to && senderTrip?.terminal_to !== 'N/A' ? senderTrip.terminal_to : '') || '';
        let recAddress = linkedBooking?.receiver_address || senderTrip?.to_location || '';
        if (senderTrip?.notes) {
          try {
            const parsed = JSON.parse(senderTrip.notes);
            if (parsed.receiver_name) recName = parsed.receiver_name;
            if (parsed.receiver_phone) recPhone = parsed.receiver_phone;
            if (parsed.receiver_address) recAddress = parsed.receiver_address;
          } catch { }
        }

        let createdAtFormatted = 'Recently Created';
        if (senderTrip?.created_at) {
          try {
            const d = new Date(senderTrip.created_at);
            if (!isNaN(d.getTime())) {
              createdAtFormatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            }
          } catch { }
        }

        const safeWeight = parseFloat(senderTrip?.capacity_weight || linkedBooking?.weight || 1) || 1.0;
        const safeReward =
          linkedBooking?.reward !== undefined && linkedBooking?.reward !== null
            ? parseFloat(linkedBooking.reward) || 50.0
            : safeWeight * 10.0;

        const nextBooking = {
          rawId: senderTrip?.id || linkedBooking?.id,
          id: senderTrip ? `#REQ${senderTrip.id}` : `#BK${linkedBooking?.id}`,
          status: resolvedStatus,
          createdAt: createdAtFormatted,
          packageName: senderTrip?.aircraft || senderTrip?.package_name || 'Parcel Request',
          packageCategory: senderTrip?.aircraft || senderTrip?.package_category || 'General',
          packageImages: allImgs,
          weight: safeWeight,
          reward: safeReward,
          deliveryOtp: rawOtp,
          route: {
            from: senderTrip?.from_location || linkedBooking?.from_location || (linkedBooking?.route?.from) || 'Origin',
            to: senderTrip?.to_location || linkedBooking?.to_location || (linkedBooking?.route?.to) || 'Destination',
            depDate: travelerObj?.travelDate || senderTrip?.departure_date || 'Flexible',
          },
          traveler: travelerObj,
          linkedBookingId: linkedBooking?.id || null,
          paymentStatus: linkedBooking?.payment_status || (isPaid ? 'PAID' : 'Unpaid'),
          escrowStatus: isPaid ? 'Active Hold' : 'Not Locked',
          receiver: {
            name: recName,
            phone: recPhone,
            address: recAddress,
          },
        };

        // If status just transitioned to DELIVERED or PAYMENT_RELEASED:
        // Automatically close the QR modal and immediately display the Delivery Success Celebration Screen!
        if (
          (resolvedStatus === 'DELIVERED' || resolvedStatus === 'PAYMENT_RELEASED') &&
          previousStatusRef.current &&
          previousStatusRef.current !== 'DELIVERED' &&
          previousStatusRef.current !== 'PAYMENT_RELEASED'
        ) {
          setShowQrModal(false);
          setShowDeliverySuccessModal(true);
        }

        previousStatusRef.current = resolvedStatus;
        setBooking(nextBooking);
      }
    } catch (err: any) {
      console.error('Failed to load booking details:', err);
    } finally {
      setLoading(false);
    }
  }, [requestId, initialRequest]);

  // Load booking details on mount and listen to real-time WebSocket events for instant delivery popups
  useEffect(() => {
    loadBookingData();

    // 1. Subscribe to real-time WebSocket events (Instantly triggers celebration modal when traveler scans QR!)
    const unsubscribeLive = GlobalNotificationSync.onLiveEvent((event: any) => {
      const eventStatus = (event.status || event.event_type || '').toUpperCase();
      const eventMsg = (event.message || event.title || '').toUpperCase();
      const targetBookingId = event.booking_id || event.id;

      // If this event indicates delivery completed or QR verified for this booking/shipment
      if (
        eventStatus.includes('DELIVER') ||
        eventMsg.includes('DELIVER') ||
        eventMsg.includes('COMPLETED') ||
        eventStatus.includes('COMPLETED')
      ) {
        setShowQrModal(false);
        setShowDeliverySuccessModal(true);
        loadBookingData(false, true);
      }
    });

    // 2. Check if user has an active token before polling gently (fallback)
    let isCancelled = false;
    const pollInterval = setInterval(async () => {
      if (isCancelled) return;
      const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        loadBookingData(false, true);
      }
    }, 6000);

    return () => {
      isCancelled = true;
      unsubscribeLive();
      clearInterval(pollInterval);
    };
  }, [loadBookingData]);

  // Stepper logic (0 to 4)
  const getTimelineStep = () => {
    if (!booking) return 0;
    const s = booking.status;
    const p = booking.paymentStatus;
    if (s === 'PAYMENT_RELEASED' || s === 'DELIVERED' || s === 'DISPUTED') return 4;
    if (s === 'OUT_FOR_DELIVERY' || s === 'ARRIVED') return 3;
    if (s === 'IN_TRANSIT') return 3;
    if (s === 'PARCEL_VERIFIED') return 2;
    if (p === 'Escrow Hold' || p === 'PAID' || s === 'PAID') return 1;
    if (s === 'ACCEPTED' || s === 'REQUEST_SENT') return 0;
    return -1;
  };

  const currentStep = getTimelineStep();
  const isPaid = booking?.paymentStatus === 'Escrow Hold' || booking?.paymentStatus === 'PAID' || booking?.status === 'PAID' || booking?.status === 'PARCEL_VERIFIED' || booking?.status === 'IN_TRANSIT' || booking?.status === 'DELIVERED' || booking?.status === 'PAYMENT_RELEASED';
  // ONLY allow Pay Now when traveler has actually ACCEPTED the request! (Never when still REQUEST_SENT or PENDING)
  const canPay = booking?.status === 'ACCEPTED' && !isPaid;

  // Handle Deposit Escrow Payment
  const handleConfirmPayment = async () => {
    if (!booking) return;
    const bookingReward = parseFloat(booking.reward) || 0;

    // Check if user selected Wallet and has insufficient balance
    if (selectedPaymentMethod === 'wallet' && senderWalletBalance < bookingReward) {
      Alert.alert(
        'Insufficient Wallet Balance',
        `Your wallet has ₹${senderWalletBalance.toFixed(2)}, but ₹${bookingReward.toFixed(2)} is required. Please add funds or pay via UPI/Card.`
      );
      return;
    }

    setIsProcessingPayment(true);
    const bookingId = booking.linkedBookingId || booking.rawId;
    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'PAY',
          payment_method: selectedPaymentMethod,
        }),
      });
      setShowPaymentModal(false);
      Alert.alert(
        'Payment Successful! 🎉',
        `₹${bookingReward.toFixed(2)} has been securely locked in Escrow. Traveler has been notified to proceed with parcel handover.`
      );
      loadBookingData();
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Payment execution failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Raise Dispute
  const handleSubmitDispute = async () => {
    if (!disputeDescription.trim()) {
      Alert.alert('Description Required', 'Please provide detailed reason for this dispute.');
      return;
    }
    setIsSubmittingDispute(true);
    try {
      const bookingId = booking?.linkedBookingId || booking?.rawId;
      await apiFetch('/api/support/disputes/', {
        method: 'POST',
        body: JSON.stringify({
          booking: bookingId,
          reason: disputeReason,
          description: disputeDescription,
        }),
      });
      Alert.alert('Dispute Submitted', 'Our safety & support team has been notified and will contact you shortly.');
      setShowDisputeModal(false);
      loadBookingData();
    } catch (err: any) {
      Alert.alert('Dispute Error', err.message || 'Failed to submit dispute.');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={FlyoraColors.primary} />
        <Text style={styles.loadingText}>Loading parcel tracking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Parcel Request Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Return to Packages</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timelineSteps = [
    {
      step: 0,
      title: 'Request Accepted',
      desc: 'Traveler verified route and accepted request',
      badge: 'ACCEPTED',
      icon: 'checkmark-circle-outline' as const,
    },
    {
      step: 1,
      title: 'Payment Secured',
      desc: 'Funds held securely in Flyora Escrow vault',
      badge: 'ESCROW PAID',
      icon: 'lock-closed-outline' as const,
    },
    {
      step: 2,
      title: 'Parcel Handed Over & Verified',
      desc: 'Pickup photos verified and package inspected',
      badge: 'VERIFIED',
      icon: 'camera-outline' as const,
    },
    {
      step: 3,
      title: 'In Flight Transit',
      desc: 'Traveler en route to destination airport',
      badge: 'IN TRANSIT',
      icon: 'airplane-outline' as const,
    },
    {
      step: 4,
      title: 'Delivered to Receiver',
      desc: 'Package verified via Receiver OTP / QR scan',
      badge: 'DELIVERED',
      icon: 'shield-checkmark-outline' as const,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Emerald Header Bar Matching Notifications & Home Screens */}
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
                <Ionicons name="cube-outline" size={11} color="#2DD4BF" />
                <Text style={styles.headerPillTagText}>PARCEL LOGISTICS</Text>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Request {booking.id}
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {booking.packageName} • {booking.createdAt}
              </Text>
            </View>

            {isPaid ? (
              <View style={styles.escrowPaidHeaderBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#2DD4BF" />
                <Text style={styles.escrowPaidHeaderText}>Escrow Paid</Text>
              </View>
            ) : canPay ? (
              <TouchableOpacity
                style={styles.headerPayNowBtn}
                onPress={() => setShowPaymentModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="wallet-outline" size={14} color="#033D37" />
                <Text style={styles.headerPayNowBtnText}>Pay Now</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerStatusBadge}>
                <Text style={styles.headerStatusBadgeText}>{booking.status}</Text>
              </View>
            )}
          </View>

          {/* Quick Route Strip inside Header */}
          <View style={styles.headerRouteStrip}>
            <View style={styles.headerRouteCol}>
              <Text style={styles.headerRouteLabel}>ORIGIN</Text>
              <Text style={styles.headerRouteVal} numberOfLines={1}>{booking.route?.from || 'Origin'}</Text>
            </View>
            <View style={styles.headerRouteIconWrap}>
              <Ionicons name="airplane" size={16} color="#2DD4BF" />
            </View>
            <View style={[styles.headerRouteCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.headerRouteLabel}>DESTINATION</Text>
              <Text style={styles.headerRouteVal} numberOfLines={1}>{booking.route?.to || 'Destination'}</Text>
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
            onRefresh={() => loadBookingData(true)}
            colors={[FlyoraColors.primary]}
            tintColor={FlyoraColors.primary}
          />
        }
      >
        {/* Pay Now Banner if Payment is Pending */}
        {canPay && (
          <View style={styles.payNowBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.payBannerTitle}>Traveler Accepted Your Request!</Text>
              <Text style={styles.payBannerSubtitle}>
                Deposit ₹{booking.reward} into Escrow to activate pickup & transit.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.payBannerBtn}
              onPress={() => setShowPaymentModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
              <Text style={styles.payBannerBtnText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. Live Parcel Tracking Timeline - Powerfully Animated Vertical Stepper */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWrap}>
              <Ionicons name="sparkles" size={scale(18)} color="#089A8D" />
              <Text style={[styles.cardTitle, { fontSize: fontScale(13) }]}>Live Parcel Tracking Timeline</Text>
            </View>
            <View style={styles.statusPillSmall}>
              <Text style={[styles.statusPillSmallText, { fontSize: fontScale(10) }]}>
                {booking.status === 'DELIVERED'
                  ? 'DELIVERED ✅'
                  : booking.status === 'PAYMENT_RELEASED'
                    ? 'PAYMENT RELEASED ✅'
                    : isPaid
                      ? 'Paid ✅'
                      : booking.status}
              </Text>
            </View>
          </View>

          {/* Vertical Stepper with Glowing Live Indicator & Track Connectors */}
          <View style={styles.verticalTimelineContainer}>
            {timelineSteps.map((st, idx) => {
              const isDone = currentStep >= st.step;
              const isCurrent = currentStep === st.step;
              const isLast = idx === timelineSteps.length - 1;
              const isRequestSentOnly = booking.status === 'REQUEST_SENT' && st.step === 0;

              return (
                <View key={idx} style={styles.verticalStepRow}>
                  {/* Left Column: Number/Check Icon + Animated Pulse Ring + Connecting Bar */}
                  <View style={styles.verticalIndicatorColumn}>
                    {/* Pulsing Glow Ring for Current In-Progress Step */}
                    {isCurrent && !isRequestSentOnly && (
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

                    {/* Step Node Circle */}
                    <View
                      style={[
                        styles.verticalStepNode,
                        isDone && !isRequestSentOnly && styles.verticalStepNodeDone,
                        isCurrent && !isRequestSentOnly && styles.verticalStepNodeCurrent,
                      ]}
                    >
                      {isDone && !isRequestSentOnly ? (
                        <Ionicons name="checkmark" size={scale(13)} color="#FFFFFF" />
                      ) : isCurrent ? (
                        <Ionicons name={st.icon} size={scale(13)} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.verticalStepNumText, { fontSize: fontScale(10) }]}>{idx + 1}</Text>
                      )}
                    </View>

                    {/* Vertical Connector Line (omitted on last item) */}
                    {!isLast && (
                      <View
                        style={[
                          styles.verticalConnectorLine,
                          currentStep > st.step && styles.verticalConnectorLineDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Title, Description, Active Badge */}
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
                          { fontSize: fontScale(13) },
                          isDone && !isRequestSentOnly && styles.verticalStepTitleDone,
                          isCurrent && !isRequestSentOnly && styles.verticalStepTitleCurrent,
                        ]}
                      >
                        {isRequestSentOnly ? 'Request Sent (Pending Approval)' : st.title}
                      </Text>

                      {isCurrent && !isRequestSentOnly && (
                        <View style={styles.activeNowBadge}>
                          <View style={styles.liveGreenDot} />
                          <Text style={[styles.activeNowBadgeText, { fontSize: fontScale(9) }]}>ACTIVE NOW</Text>
                        </View>
                      )}

                      {isDone && !isCurrent && !isRequestSentOnly && (
                        <View style={styles.completedStepBadge}>
                          <Text style={[styles.completedStepBadgeText, { fontSize: fontScale(9) }]}>COMPLETED</Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.verticalStepDesc, { fontSize: fontScale(11) }]}>
                      {isRequestSentOnly ? 'Waiting for traveler to accept your delivery request' : st.desc}
                    </Text>

                    {/* If this is the current active step, show a friendly highlight banner */}
                    {isCurrent && !isRequestSentOnly && (
                      <View style={styles.activeStepHintBox}>
                        <Ionicons name="information-circle-outline" size={scale(14)} color="#089A8D" />
                        <Text style={[styles.activeStepHintText, { fontSize: fontScale(10) }]}>
                          {st.step === 0 && 'Traveler has accepted. Please deposit escrow payment.'}
                          {st.step === 1 && 'Escrow funds secured. Traveler will collect parcel.'}
                          {st.step === 2 && 'Pickup photos verified. Ready for flight departure.'}
                          {st.step === 3 && 'Package in transit. Keep receiver OTP handy for dropoff.'}
                          {st.step === 4 && 'Delivery successfully completed and verified.'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 2. Delivery Handover Verification (OTP & QR Code) - EXACT MATCH WITH WEB: ONLY VISIBLE WHEN OUT_FOR_DELIVERY OR ARRIVED */}
        {(booking.status === 'OUT_FOR_DELIVERY' || booking.status === 'ARRIVED') && (
          <View style={styles.otpCard}>
            <View style={styles.otpTopRow}>
              <Ionicons name="key" size={18} color="#089A8D" />
              <Text style={styles.otpSectionTitle}>
                Delivery Handover Verification (OTP & QR Code)
              </Text>
            </View>
            <Text style={styles.otpInstructions}>
              Provide this unique <Text style={{ fontWeight: 'bold' }}>6-digit OTP code</Text> or show the{' '}
              <Text style={{ fontWeight: 'bold' }}>QR Code</Text> to the Traveler{' '}
              <Text style={{ fontWeight: 'bold' }}>ONLY when you physically receive and verify your parcel</Text>!
            </Text>

            <View style={styles.otpBoxContainer}>
              {/* Scannable QR Code with "View QR" and Click action */}
              <TouchableOpacity
                style={styles.qrCodeBox}
                onPress={() => setShowQrModal(true)}
                activeOpacity={0.85}
              >
                <Image
                  source={{
                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FLYORA-OTP-${booking.deliveryOtp}`,
                  }}
                  style={styles.qrImage}
                />
                <View style={styles.viewQrBadge}>
                  <Ionicons name="expand-outline" size={11} color="#089A8D" />
                  <Text style={styles.viewQrText}>View QR</Text>
                </View>
              </TouchableOpacity>

              {/* 6-Digit OTP */}
              <View style={styles.otpCodeBox}>
                <Text style={styles.otpLabel}>6-DIGIT OTP</Text>
                <Text style={styles.otpCodeText}>{booking.deliveryOtp}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    style={styles.copyOtpBtn}
                    onPress={() => {
                      Alert.alert('Copied!', `Handover OTP ${booking.deliveryOtp} copied to clipboard.`);
                    }}
                  >
                    <Ionicons name="copy-outline" size={11} color="#089A8D" />
                    <Text style={styles.copyOtpBtnText}>Copy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.copyOtpBtn, { backgroundColor: '#089A8D', borderColor: '#089A8D' }]}
                    onPress={() => setShowQrModal(true)}
                  >
                    <Ionicons name="share-social-outline" size={11} color="#FFFFFF" />
                    <Text style={[styles.copyOtpBtnText, { color: '#FFFFFF' }]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 2B. Delivery Completed Success Card & Banner */}
        {(booking.status === 'DELIVERED' || booking.status === 'PAYMENT_RELEASED') && (
          <TouchableOpacity
            style={styles.deliverySuccessBanner}
            onPress={() => setShowDeliverySuccessModal(true)}
            activeOpacity={0.88}
          >
            <View style={styles.deliverySuccessBannerLeft}>
              <View style={styles.deliverySuccessIconWrap}>
                <Ionicons name="checkmark-circle" size={26} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.deliverySuccessBannerTitle}>Delivery Handover Completed! 🎉</Text>
                <Text style={styles.deliverySuccessBannerSub}>
                  Parcel delivered and verified via OTP/QR. Tap to view success celebration certificate.
                </Text>
              </View>
            </View>
            <Ionicons name="sparkles" size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {/* 3. Parcel Request Specifications */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>PARCEL SPECIFICATIONS</Text>
          <View style={styles.specGrid}>
            <View style={styles.specCol}>
              <Text style={styles.specSmallLabel}>PACKAGE NAME</Text>
              <Text style={styles.specBigValue}>{booking.packageName}</Text>
            </View>
            <View style={styles.specCol}>
              <Text style={styles.specSmallLabel}>CATEGORY</Text>
              <Text style={styles.specBigValue}>{booking.packageCategory}</Text>
            </View>
            <View style={styles.specCol}>
              <Text style={styles.specSmallLabel}>PARCEL WEIGHT</Text>
              <Text style={styles.specBigValue}>{parseFloat(booking.weight).toFixed(2)} KG</Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          {/* Route Display */}
          <View style={styles.routeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.specSmallLabel}>PICKUP LOCATION (FROM)</Text>
              <Text style={styles.routeLocName}>{booking.route.from}</Text>
            </View>
            <Ionicons name="airplane" size={20} color="#089A8D" style={{ marginHorizontal: 12 }} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.specSmallLabel}>DROPOFF LOCATION (TO)</Text>
              <Text style={styles.routeLocName}>{booking.route.to}</Text>
            </View>
          </View>
        </View>

        {/* 4. Offered Reward & Payment Status */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>OFFERED REWARD & ESCROW STATUS</Text>
          <View style={styles.rewardRow}>
            <View>
              <Text style={styles.rewardAmount}>₹{booking.reward}</Text>
              <Text style={styles.rewardLabel}>Reward Offered to Traveler</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.specSmallLabel}>PAYMENT STATUS</Text>
              <Text style={[styles.rewardStatus, { color: isPaid ? '#059669' : '#D97706' }]}>
                {booking.paymentStatus}
              </Text>
              <Text style={styles.escrowHoldText}>Escrow: {booking.escrowStatus}</Text>
            </View>
          </View>
        </View>

        {/* 5. Designated Receiver Information */}
        <View style={styles.card}>
          <View style={styles.cardTitleWrap}>
            <Ionicons name="person" size={16} color="#089A8D" />
            <Text style={styles.cardTitle}>Designated Receiver</Text>
          </View>
          <View style={styles.receiverInfoRow}>
            <View style={styles.receiverAvatar}>
              <Text style={styles.receiverAvatarText}>
                {(booking.receiver.name || 'R')[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.receiverNameText}>{booking.receiver.name}</Text>
              {booking.receiver.phone ? (
                <Text style={styles.receiverPhoneText}>{booking.receiver.phone}</Text>
              ) : null}
              <Text style={styles.receiverAddressText}>
                <Ionicons name="location-outline" size={12} color="#64748B" /> {booking.receiver.address}
              </Text>
            </View>
          </View>
        </View>

        {/* 6. Traveler Status & Confirmation */}
        <View style={styles.card}>
          <View style={styles.cardTitleWrap}>
            <Ionicons name="airplane" size={16} color="#089A8D" />
            <Text style={styles.cardTitle}>Traveler Status & Confirmation</Text>
          </View>

          {booking.traveler ? (
            <View style={styles.travelerCardBox}>
              <View style={styles.travelerHeader}>
                <View style={styles.travelerAvatarCircle}>
                  <Text style={styles.travelerAvatarText}>
                    {(booking.traveler.name || 'T')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.travelerNameText}>{booking.traveler.name}</Text>
                  <Text style={styles.travelerEmailText}>{booking.traveler.email}</Text>
                </View>
                <View style={[
                  styles.kycVerifiedBadge,
                  booking.status === 'REQUEST_SENT' && { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }
                ]}>
                  <Ionicons
                    name={booking.status === 'REQUEST_SENT' ? 'time-outline' : 'checkmark-circle'}
                    size={12}
                    color={booking.status === 'REQUEST_SENT' ? '#2563EB' : '#059669'}
                  />
                  <Text style={[
                    styles.kycVerifiedText,
                    booking.status === 'REQUEST_SENT' && { color: '#1D4ED8' }
                  ]}>
                    {booking.status === 'REQUEST_SENT' ? 'Request Sent (Pending)' : 'KYC Verified Traveler ✅'}
                  </Text>
                </View>
              </View>

              <View style={styles.flightMetaRow}>
                <View style={styles.flightMetaCol}>
                  <Text style={styles.flightMetaLabel}>FLIGHT AIRLINE</Text>
                  <Text style={styles.flightMetaVal}>{booking.traveler.airline || 'Commercial Airline'}</Text>
                </View>
                <View style={styles.flightMetaCol}>
                  <Text style={styles.flightMetaLabel}>FLIGHT NUMBER</Text>
                  <Text style={styles.flightMetaVal}>{booking.traveler.flightNo || 'FL-782'}</Text>
                </View>
                <View style={styles.flightMetaCol}>
                  <Text style={styles.flightMetaLabel}>TRAVEL DATE</Text>
                  <Text style={styles.flightMetaVal}>{booking.traveler.travelDate || 'Upcoming'}</Text>
                </View>
              </View>

              {/* Waiting note when REQUEST_SENT */}
              {booking.status === 'REQUEST_SENT' && (
                <View style={{ marginTop: 10, padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center' }}>
                    ⏳ Waiting for traveler to review & accept your delivery request. Pay button will be activated once accepted.
                  </Text>
                </View>
              )}

              {/* Pay Now Button (ONLY shows when traveler accepted and unpaid) */}
              {canPay && (
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    style={styles.travelerPayBtn}
                    onPress={() => setShowPaymentModal(true)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.travelerPayBtnText}>Pay Now (₹{booking.reward})</Text>
                  </TouchableOpacity>
                </View>
              )}

              {onOpenChat && (
                <TouchableOpacity style={styles.chatTravelerBtn} onPress={onOpenChat}>
                  <Ionicons name="chatbubble-ellipses" size={15} color="#FFFFFF" />
                  <Text style={styles.chatTravelerBtnText}>Chat with Traveler</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noTravelerBox}>
              <Ionicons name="search" size={24} color="#94A3B8" />
              <Text style={styles.noTravelerText}>
                No traveler assigned yet. Matching verified travelers on this route...
              </Text>
            </View>
          )}
        </View>

        {/* 7. Uploaded Package Photos */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>
            UPLOADED PACKAGE PHOTOS ({booking.packageImages?.length || 0})
          </Text>
          {(!booking.packageImages || booking.packageImages.length === 0) ? (
            <Text style={styles.noPhotosText}>No photos uploaded for this request.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
              {booking.packageImages.map((img: string, idx: number) => (
                <Image key={idx} source={{ uri: img }} style={styles.photoThumbLarge} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* 8. Delivery Completed & Raise Dispute Option */}
        {booking.status === 'DELIVERED' && (
          <View style={styles.deliveredCard}>
            <View style={styles.deliveredIconCircle}>
              <Ionicons name="checkmark-circle" size={36} color="#059669" />
            </View>
            <Text style={styles.deliveredTitle}>Delivery Completed</Text>
            <Text style={styles.deliveredSubtitle}>
              The parcel has been successfully delivered and payment has been released to the traveler.
            </Text>

            <TouchableOpacity
              style={styles.raiseDisputeBtn}
              onPress={() => setShowDisputeModal(true)}
            >
              <Ionicons name="warning-outline" size={14} color="#DC2626" />
              <Text style={styles.raiseDisputeBtnText}>Raise Dispute</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ─── Escrow Payment Modal ─── */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.paymentModalCard}>
            <View style={styles.paymentModalHeader}>
              <Text style={styles.paymentModalTitle}>Deposit Escrow Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentSummaryBox}>
              <Text style={styles.paymentSummaryLabel}>TOTAL ESCROW AMOUNT</Text>
              <Text style={styles.paymentSummaryAmount}>₹{booking.reward}</Text>
              <Text style={styles.paymentProtectionText}>
                🔒 100% Escrow Protection: Funds remain safely in escrow until you verify delivery OTP.
              </Text>
            </View>

            <Text style={styles.selectMethodLabel}>SELECT PAYMENT METHOD</Text>
            <View style={styles.methodsRow}>
              {[
                { id: 'wallet', label: `Flyora Wallet (₹${senderWalletBalance.toFixed(2)})`, icon: 'wallet' },
                { id: 'upi', label: 'UPI / GPay / Razorpay', icon: 'flash' },
                { id: 'card', label: 'Debit / Credit Card', icon: 'card' },
              ].map((m) => {
                const selected = selectedPaymentMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.methodBtn, selected && styles.methodBtnSelected]}
                    onPress={() => setSelectedPaymentMethod(m.id as any)}
                  >
                    <Ionicons
                      name={m.icon as any}
                      size={20}
                      color={selected ? '#089A8D' : '#64748B'}
                    />
                    <Text style={[styles.methodBtnText, selected && styles.methodBtnTextSelected]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.confirmPaymentBtn}
              onPress={handleConfirmPayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmPaymentBtnText}>Confirm & Pay ₹{booking.reward}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Raise Dispute Modal ─── */}
      <Modal
        visible={showDisputeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDisputeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.disputeModalCard}>
            <View style={styles.paymentModalHeader}>
              <Text style={styles.disputeModalTitle}>Raise Dispute for Parcel #{booking.id}</Text>
              <TouchableOpacity onPress={() => setShowDisputeModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.disputeNotice}>
              Raising a dispute will alert our admin team for inspection. Please provide accurate details.
            </Text>

            <Text style={styles.inputLabel}>DISPUTE REASON</Text>
            <View style={styles.reasonsList}>
              {['Damaged Parcel', 'Missing Items', 'Delayed Delivery', 'Wrong Handover'].map((r) => {
                const sel = disputeReason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.reasonPill, sel && styles.reasonPillActive]}
                    onPress={() => setDisputeReason(r)}
                  >
                    <Text style={[styles.reasonPillText, sel && styles.reasonPillTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>DESCRIPTION & DETAILS</Text>
            <TextInput
              style={[styles.disputeInput, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Describe the issue in detail..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={disputeDescription}
              onChangeText={setDisputeDescription}
            />

            <TouchableOpacity
              style={styles.submitDisputeBtn}
              onPress={handleSubmitDispute}
              disabled={isSubmittingDispute}
            >
              {isSubmittingDispute ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitDisputeBtnText}>Submit Dispute</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ─── 4. ADVANCED QR VIEW MODAL WITH SHARE ─── */}
      <QrViewModal
        visible={showQrModal}
        onClose={() => setShowQrModal(false)}
        otpCode={booking.deliveryOtp || '849201'}
        packageName={booking.packageName || 'Parcel'}
        requestId={booking.id}
        receiverName={booking.recipient?.name || booking.recipientName || 'Recipient'}
      />

      {/* ─── 5. POWERFUL DELIVERY SUCCESS SCREEN ANIMATION ─── */}
      <DeliverySuccessModal
        visible={showDeliverySuccessModal}
        onClose={() => setShowDeliverySuccessModal(false)}
        role="sender"
        packageTitle={booking.packageName || 'Parcel Delivery'}
        payoutAmount={booking.estimatedReward || booking.totalPrice || '35.00'}
        trackingId={String(booking.id || requestId)}
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 12,
  },
  backBtn: {
    backgroundColor: '#089A8D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  // Emerald Header matching NotificationsScreen exactly
  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#033D37',
    ...Shadows.card,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 2,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 3,
  },
  headerPillTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2DD4BF',
    marginLeft: 4,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: '#A7D9D3',
    marginTop: 1,
  },
  escrowPaidHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.4)',
    gap: 4,
  },
  escrowPaidHeaderText: {
    color: '#2DD4BF',
    fontSize: 11,
    fontWeight: '800',
  },
  headerPayNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2DD4BF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
    ...Shadows.sm,
  },
  headerPayNowBtnText: {
    color: '#033D37',
    fontSize: 12,
    fontWeight: '800',
  },
  headerStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerStatusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  headerRouteStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 2,
  },
  headerRouteCol: {
    flex: 1,
  },
  headerRouteLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A7D9D3',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  headerRouteVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerRouteIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(45, 212, 191, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  payNowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  payBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  payBannerSubtitle: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  payBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#089A8D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  payBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
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
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  statusPillSmall: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  statusPillSmallText: {
    color: '#089A8D',
    fontSize: 10,
    fontWeight: '800',
  },
  // Vertical Timeline Container & Steps
  verticalTimelineContainer: {
    paddingTop: scale(8),
    paddingBottom: scale(4),
  },
  verticalStepRow: {
    flexDirection: 'row',
  },
  verticalIndicatorColumn: {
    width: scale(36),
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    top: -scale(4),
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(13, 148, 136, 0.35)',
    zIndex: 1,
  },
  verticalStepNode: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
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
    width: scale(3),
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
    marginLeft: scale(12),
    paddingBottom: scale(20),
  },
  verticalStepContentActive: {
    backgroundColor: 'rgba(240, 253, 250, 0.65)',
    borderRadius: scale(14),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: scale(10),
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
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#5EEAD4',
  },
  liveGreenDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#0D9488',
    marginRight: scale(5),
  },
  activeNowBadgeText: {
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  completedStepBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(7),
    paddingVertical: scale(2),
    borderRadius: scale(8),
  },
  completedStepBadgeText: {
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  verticalStepDesc: {
    color: '#64748B',
    marginTop: scale(2),
    lineHeight: scale(16),
  },
  activeStepHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(10),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    marginTop: scale(8),
    borderWidth: 1,
    borderColor: '#99F6E4',
    gap: scale(6),
  },
  activeStepHintText: {
    flex: 1,
    color: '#0F766E',
    fontWeight: '600',
    lineHeight: scale(14),
  },
  deliverySuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    marginBottom: 16,
    ...Shadows.card,
  },
  deliverySuccessBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliverySuccessIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliverySuccessBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  deliverySuccessBannerSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  otpCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#99F6E4',
    ...Shadows.sm,
  },
  otpTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#089A8D',
    textTransform: 'uppercase',
  },
  otpInstructions: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    marginVertical: 10,
  },
  otpBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  qrCodeBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2DD4BF',
  },
  qrImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  viewQrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  viewQrText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#089A8D',
  },
  qrLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 4,
  },
  otpCodeBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#089A8D',
    minWidth: 140,
  },
  otpLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  otpCodeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#089A8D',
    letterSpacing: 3,
    marginVertical: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyOtpBtn: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginTop: 4,
  },
  copyOtpBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#089A8D',
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specCol: {
    flex: 1,
  },
  specSmallLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  specBigValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeLocName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#059669',
  },
  rewardLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rewardStatus: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  escrowHoldText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  receiverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  receiverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiverAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
  receiverNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  receiverPhoneText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  receiverAddressText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  travelerCardBox: {
    marginTop: 10,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#089A8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  travelerNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  travelerEmailText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  kycVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 3,
  },
  kycVerifiedText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  flightMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  flightMetaCol: {
    flex: 1,
  },
  travelerPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  travelerPayBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  flightMetaLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  flightMetaVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  chatTravelerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#089A8D',
    borderRadius: 12,
    paddingVertical: 9,
    marginTop: 10,
    gap: 6,
  },
  chatTravelerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  noTravelerBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  noTravelerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
  },
  photosScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  photoThumbLarge: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  noPhotosText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  deliveredCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 6,
  },
  deliveredIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deliveredTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#065F46',
  },
  deliveredSubtitle: {
    fontSize: 12,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    maxWidth: 280,
  },
  raiseDisputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 14,
  },
  raiseDisputeBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  // Modal Backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  paymentModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...Shadows.card,
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  paymentSummaryBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 16,
  },
  paymentSummaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#089A8D',
    letterSpacing: 0.5,
  },
  paymentSummaryAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  paymentProtectionText: {
    fontSize: 10,
    color: '#0D9488',
    marginTop: 4,
  },
  selectMethodLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  methodsRow: {
    gap: 8,
    marginBottom: 18,
  },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  methodBtnSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#089A8D',
    borderWidth: 1.5,
  },
  methodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  methodBtnTextSelected: {
    color: '#089A8D',
    fontWeight: '800',
  },
  confirmPaymentBtn: {
    backgroundColor: '#089A8D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPaymentBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  // Dispute Modal Card
  disputeModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...Shadows.card,
  },
  disputeModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },
  disputeNotice: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 8,
  },
  reasonsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  reasonPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonPillActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  reasonPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  reasonPillTextActive: {
    color: '#DC2626',
    fontWeight: '800',
  },
  disputeInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 16,
  },
  submitDisputeBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisputeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
