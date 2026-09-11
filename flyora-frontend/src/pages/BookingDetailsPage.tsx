import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plane, Package, Wallet, Bell, ShieldCheck, ArrowLeft, CheckCircle2,
  XCircle, Eye, X, UserCheck, Clock, Search, Lock, KeyRound, Truck,
  MapPin, Check, ArrowRight, ShieldAlert, Sparkles, CreditCard, Camera,
  Upload, CheckCircle, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import './dashboard.css';

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const { lastMessage } = useSocket();

  // Interactive Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payment Confirmation Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txnRef, setTxnRef] = useState('');

  // Traveler Parcel Verification Modal State
  const [showVerifyParcelModal, setShowVerifyParcelModal] = useState(false);
  const [verificationFiles, setVerificationFiles] = useState<File[]>([]);
  const [verificationPreviews, setVerificationPreviews] = useState<string[]>([]);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  // Handover OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Damaged Parcel');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'booking_status_update') {
      // Check if it's for this booking or we just refresh anyway
      // Since booking might be `#REQ55`, we should just re-fetch to be safe
      loadBookingData();
    }
  }, [lastMessage]);

  const loadBookingData = async () => {
    try {
      setLoading(true);

      const [bookingsRes, tripsRes] = await Promise.all([
        apiFetch('/api/bookings/?user_only=true').catch(() => ({ data: [] })),
        apiFetch('/api/trips/?user_only=true').catch(() => ({ data: [] }))
      ]);

      const bookingsData = bookingsRes.data || bookingsRes.results || (Array.isArray(bookingsRes) ? bookingsRes : []);
      const tripsData = tripsRes.data || tripsRes.results || (Array.isArray(tripsRes) ? tripsRes : []);

      // 1. Try finding in bookings
      let b = bookingsData.find((item: any) =>
        item.id.toString() === id ||
        `#${item.id}` === id ||
        item.id.toString().replace('#', '') === id
      );

      // 2. Try finding in trips if not in bookings
      let senderTrip = null;
      if (!b) {
        senderTrip = tripsData.find((item: any) => item.id.toString() === id);
      }

      if (senderTrip) {
        const senderEmail = senderTrip.traveler_email || senderTrip.user_email || senderTrip.user?.email;
        const senderPkgName = senderTrip.aircraft || senderTrip.package_name;

        const linkedBooking = bookingsData.find((bk: any) =>
          (bk.sender_trip && String(bk.sender_trip) === String(senderTrip.id)) ||
          (bk.trip && String(bk.trip) === String(senderTrip.id)) ||
          (bk.trip_details && String(bk.trip_details.id) === String(senderTrip.id))
        );

        const hasTraveler = Boolean(linkedBooking && (linkedBooking.traveler || linkedBooking.traveler_name));
        const isPaid = Boolean(linkedBooking && (linkedBooking.payment_status === 'Escrow Hold' || linkedBooking.payment_status === 'PAID' || linkedBooking.status === 'PAID' || linkedBooking.status === 'PAID'));
        const rawStatus = linkedBooking ? linkedBooking.status : 'Searching for Traveler';

        const resolvedStatus = linkedBooking
          ? (['PARCEL_VERIFIED', 'IN_TRANSIT', 'ARRIVED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAYMENT_RELEASED', 'DISPUTED', 'DISPUTE_RESOLVED', 'DISPUTE_REJECTED'].includes(rawStatus) ? rawStatus : (isPaid ? 'PAID' : (hasTraveler ? (rawStatus || 'REQUEST_SENT') : 'Searching for Traveler')))
          : 'Searching for Traveler';

        const targetBookingId = linkedBooking?.id || senderTrip.id;
        const rawOtp = linkedBooking?.delivery_otp || linkedBooking?.deliveryOtp || String((targetBookingId * 3791 + 100000) % 900000 + 100000);

        setBooking({
          rawId: senderTrip.id,
          id: `#REQ${senderTrip.id}`,
          status: resolvedStatus,
          createdAt: senderTrip.created_at ? new Date(senderTrip.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently Created',
          updatedAt: linkedBooking?.updated_at || senderTrip.updated_at,
          packageName: senderTrip.aircraft || senderTrip.package_name || 'Parcel Request',
          packageCategory: senderTrip.aircraft || senderTrip.package_category || 'General',
          packageImage: senderTrip.package_image,
          acceptedParcelTypes: senderTrip.accepted_parcel_types || [],
          weight: senderTrip.capacity_weight || senderTrip.available_weight || 1,
          reward: parseFloat(senderTrip.price_per_kg || linkedBooking?.reward || 50),
          deliveryOtp: rawOtp,
          route: {
            from: senderTrip.from_location,
            fromAirport: senderTrip.from_airport || 'Origin City',
            to: senderTrip.to_location,
            toAirport: senderTrip.to_airport || 'Destination City',
            depDate: senderTrip.departure_date || 'Flexible',
          },
          traveler: hasTraveler ? {
            name: (typeof linkedBooking?.traveler === 'object' ? linkedBooking?.traveler?.name : linkedBooking?.traveler) || linkedBooking?.traveler_name || 'Assigned Traveler',
            email: linkedBooking?.traveler?.email || 'traveler@flyora.com',
            flightNo: linkedBooking?.flight_number || linkedBooking?.trip_details?.flight_number || 'FL-782',
            airline: linkedBooking?.airline || linkedBooking?.trip_details?.airline || 'Commercial Airline',
            isKycVerified: true,
          } : null,
          linkedBookingId: linkedBooking?.id || senderTrip.id,
          paymentStatus: linkedBooking?.payment_status || 'Unpaid',
          escrowStatus: linkedBooking?.escrow_status || (isPaid ? 'Active Hold' : 'Not Locked'),
        });
      } else if (b) {
        const rawOtp = b.delivery_otp || b.deliveryOtp || String((b.id * 3791 + 100000) % 900000 + 100000);
        const isPaid = b.payment_status === 'Escrow Hold' || b.payment_status === 'PAID' || b.status === 'PAID' || b.status === 'PAID';
        const activeStatus = (b.status && !['REQUEST_SENT', 'ACCEPTED', 'Draft', 'PAID', 'PAID'].includes(b.status)) ? b.status : (isPaid ? 'PAID' : (b.status || 'REQUEST_SENT'));

        setBooking({
          rawId: b.id,
          id: `#BK${b.id}`,
          status: activeStatus,
          createdAt: b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
          updatedAt: b.updated_at,
          packageName: b.package_name || b.package?.name || 'Parcel Request',
          packageCategory: b.package_category || b.package?.category || 'General',
          packageImage: b.package_image || b.package?.image,
          acceptedParcelTypes: b.accepted_parcel_types || [],
          weight: b.weight || 1,
          reward: parseFloat(b.reward || b.agreed_price || 0),
          deliveryOtp: rawOtp,
          route: {
            from: b.trip?.from_location || b.from_location || 'Origin',
            fromAirport: b.trip?.from_airport || '',
            to: b.trip?.to_location || b.to_location || 'Destination',
            toAirport: b.trip?.to_airport || '',
            depDate: b.trip?.departure_date || 'Flexible',
          },
          sender: {
            id: b.sender?.id,
            name: b.sender_name || b.sender?.name || 'Sender',
            email: b.sender?.email || '',
            phone: b.sender?.phone || '',
            kycStatus: b.sender?.kyc_status || 'APPROVED',
            isKycVerified: b.sender?.is_kyc_verified !== false,
          },
          traveler: (b.traveler || b.traveler_name) ? {
            id: b.traveler?.id || b.traveler_id,
            name: b.traveler_name || b.traveler?.name || 'Traveler',
            email: b.traveler?.email || '',
            flightNo: b.trip?.flight_number || 'FL-102',
            airline: b.trip?.airline || 'Commercial Airline',
            isKycVerified: true,
          } : null,
          linkedBookingId: b.id,
          paymentStatus: isPaid ? 'PAID' : (b.payment_status || 'Unpaid'),
          escrowStatus: b.escrow_status || (isPaid ? 'Active Hold' : 'Not Locked'),
        });
      }
    } catch (err) {
      console.error('Failed to load request details:', err);
    } finally {
      setLoading(false);
    }
  };

  const [platformFee, setPlatformFee] = useState<number>(10.00);

  useEffect(() => {
    loadBookingData();
    const fetchPlatformFeeSetting = async () => {
      try {
        const res = await apiFetch('/api/payments/settings/');
        if (res?.data?.platform_fee !== undefined) {
          setPlatformFee(Number(res.data.platform_fee));
        }
      } catch (err) {
        console.error("Failed to load platform fee", err);
      }
    };
    fetchPlatformFeeSetting();
  }, [id]);

  // Execute Payment via Modal & Open Confirmation Success Popup
  const handleConfirmPayment = async () => {
    if (!booking) return;
    setIsProcessingPayment(true);
    const bookingId = booking.linkedBookingId || booking.rawId;
    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action: 'PAY' })
      });
      const mockRef = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      setTxnRef(mockRef);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      loadBookingData();
    } catch (err: any) {
      alert("Payment failed: " + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Traveler File Selection for Pickup Verification
  const handleVerificationFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setVerificationFiles(prev => [...prev, ...selected].slice(0, 5));

      selected.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVerificationPreviews(prev => [...prev, reader.result as string].slice(0, 5));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Submit Parcel Pickup Verification Images
  const handleSubmitParcelVerification = async () => {
    if (!booking) return;
    if (verificationPreviews.length === 0) {
      alert("Please upload at least 1 photo of the physical parcel at pickup handover.");
      return;
    }
    setIsSubmittingVerification(true);
    const bookingId = booking.linkedBookingId || booking.rawId;
    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'VERIFY_PARCEL',
          payload: { images: verificationPreviews }
        })
      });
      alert("✅ Parcel Pickup Verification Completed! Status updated to Ready for Transit.");
      setShowVerifyParcelModal(false);
      loadBookingData();
    } catch (err: any) {
      alert("Verification failed: " + err.message);
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  // Update Transit Status Action
  const handleUpdateStatus = async (newStatusName: string, actionName: string) => {
    if (!booking) return;
    const bookingId = booking.linkedBookingId || booking.rawId;
    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action: actionName })
      });
      alert(`Transit status updated: ${newStatusName}`);
      loadBookingData();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Verify Handover OTP Action
  const handleVerifyOtpHandover = async () => {
    if (!booking) return;
    if (!inputOtp.trim()) {
      setOtpError('Please enter the 4-digit handover OTP code');
      return;
    }
    setVerifyingOtp(true);
    setOtpError(null);

    const bookingId = booking.linkedBookingId || booking.rawId;
    const expectedOtp = booking.deliveryOtp;

    if (inputOtp.trim() !== expectedOtp) {
      setOtpError('Incorrect OTP code! Please check the code provided by the Sender.');
      setVerifyingOtp(false);
      return;
    }

    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action: 'CONFIRM_DELIVERY' })
      });
      alert("🎉 Handover OTP Verified! Parcel status marked as Completed & $" + booking.reward + " Escrow released to Traveler Wallet!");
      setShowOtpModal(false);
      setInputOtp('');
      loadBookingData();
    } catch (err: any) {
      setOtpError("Verification error: " + err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Extract photos
  const rawImgs = booking?.acceptedParcelTypes || [];
  const pImg = booking?.packageImage;
  let allImgs: string[] = [];
  if (pImg && typeof pImg === 'string' && pImg.startsWith('[')) {
    try {
      const parsed = JSON.parse(pImg);
      if (Array.isArray(parsed)) allImgs.push(...parsed);
    } catch (e) { }
  }
  if (Array.isArray(rawImgs)) {
    rawImgs.forEach((img: string) => {
      if (img && typeof img === 'string' && !allImgs.includes(img)) allImgs.push(img);
    });
  }
  if (pImg && typeof pImg === 'string' && !pImg.startsWith('[') && pImg.length > 30 && !allImgs.includes(pImg)) {
    allImgs.unshift(pImg);
  }
  const validImgs = allImgs.filter(img => img && (img.startsWith('data:image') || img.startsWith('http') || img.startsWith('/')));
  const activePhoto = validImgs[activePhotoIndex] || validImgs[0] || null;

  // Determine current timeline step
  const getTimelineStep = () => {
    if (!booking) return 0;
    const s = booking.status;
    const p = booking.paymentStatus;
    if (s === 'PAYMENT_RELEASED' || s === 'DELIVERED' || s === 'DISPUTED' || s === 'DISPUTE_RESOLVED' || s === 'DISPUTE_REJECTED') return 4; // Step 5: Delivered & Released
    if (s === 'OUT_FOR_DELIVERY' || s === 'ARRIVED') return 3; // Step 4: Arrived / Out for Delivery
    if (s === 'IN_TRANSIT') return 3; // Step 4: In Transit
    if (s === 'PARCEL_VERIFIED' || s === 'PARCEL_VERIFIED') return 2; // Step 3: Parcel Verified 📷
    if (p === 'Escrow Hold' || p === 'PAID' || s === 'PAID' || s === 'PAID') return 1; // Step 2: Paid
    if (s === 'ACCEPTED' || s === 'REQUEST_SENT') return 0; // Step 1: Accepted
    return -1;
  };

  const currentStep = getTimelineStep();
  const isPaid = booking?.paymentStatus === 'Escrow Hold' || booking?.paymentStatus === 'PAID' || booking?.status === 'PAID' || booking?.status === 'PAID' || booking?.status === 'PAYMENT_RELEASED' || booking?.status === 'PARCEL_VERIFIED' || booking?.status === 'IN_TRANSIT';

  const getDaysSinceDelivery = () => {
    if (booking?.status !== 'DELIVERED') return -1;
    const updateTime = booking.updatedAt;
    if (!updateTime) return 0;
    const diffTime = new Date().getTime() - new Date(updateTime).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysSinceDelivery = getDaysSinceDelivery();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-teal-500/30">
      <Sidebar activeItem="Sender" />

      {/* Main Panel with responsive left margin */}
      <main className="flex-1 lg:ml-[240px] flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-10">

        {/* Top Header */}
        <header className="h-[70px] lg:h-[80px] bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/sender')}
            className="flex items-center gap-2 text-xs font-black text-slate-700 hover:text-flyora-teal transition bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200"
          >
            <ArrowLeft size={16} /> Back to Sender Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <HeaderProfileDropdown />
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mx-auto mb-4"></div>
              <h3 className="text-slate-800 font-extrabold text-base">Loading Parcel Request Details...</h3>
              <p className="text-slate-400 text-xs mt-1">Fetching package specifications and traveler status</p>
            </div>
          ) : !booking ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto mt-8">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <Package size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Parcel Request Not Found</h2>
              <p className="text-xs text-slate-500 mt-1">The request reference #{id} does not exist or has been cancelled.</p>
              <button
                type="button"
                onClick={() => navigate('/sender')}
                className="mt-6 px-6 py-3 bg-flyora-teal hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Back to Sender Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Parcel Request {booking.id}</h1>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${booking.status === 'PAYMENT_RELEASED' || booking.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          booking.status === 'IN_TRANSIT' || booking.status === 'ARRIVED' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                            booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                      {booking.status === 'DELIVERED' ? 'DELIVERED ✅' : booking.status === 'PAYMENT_RELEASED' ? 'PAYMENT RELEASED ✅' : isPaid ? 'Paid ✅' : booking.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Created on {booking.createdAt}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Sender Pay Now Button (ONLY shows when ACCEPTED and unpaid; disappears once paid!) */}
                  {booking.traveler && !isPaid && booking.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-emerald-500/25 transition flex items-center gap-2 animate-bounce"
                    >
                      <Wallet size={16} /> Pay Now (${booking.reward})
                    </button>
                  )}

                  {/* Paid Status Badge (Pay Now Button DISAPPEARS once paid!) */}
                  {isPaid && booking.status !== 'PAYMENT_RELEASED' && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs">
                      <CheckCircle2 size={16} className="text-emerald-600" /> Paid ✅ (Escrow Secured)
                    </span>
                  )}
                </div>
              </section>

              {/* LIVE PARCEL TRACKING TIMELINE BAR */}
              <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-flyora-teal" /> Live Parcel Tracking Timeline
                  </h3>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-0.5 rounded-full">
                    Real-Time Status: {
                      booking.status === 'DELIVERED' ? 'DELIVERED ✅' :
                        booking.status === 'PAYMENT_RELEASED' ? 'PAYMENT RELEASED ✅' :
                          ['PARCEL_VERIFIED', 'IN_TRANSIT', 'ARRIVED', 'OUT_FOR_DELIVERY'].includes(booking.status) ? booking.status + ' ✈️' :
                            isPaid ? 'Paid ✅' : booking.status
                    }
                  </span>
                </div>

                {/* Stepper Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {[
                    { step: 0, title: 'Request Accepted', desc: 'Traveler Accepted', icon: CheckCircle2 },
                    { step: 1, title: 'Paid ✅', desc: 'Escrow Secured 🔒', icon: Lock },
                    { step: 2, title: 'Parcel Verified', desc: 'Pickup Photos Uploaded 📷', icon: Camera },
                    { step: 3, title: 'IN_TRANSIT', desc: 'On Flight Path ✈️', icon: Plane },
                    { step: 4, title: 'DELIVERED', desc: 'OTP Verified ✅', icon: ShieldCheck },
                  ].map((st, idx) => {
                    const isDone = currentStep >= st.step;
                    const isCurrent = currentStep === st.step;
                    const IconComp = st.icon;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 ${isDone
                            ? 'bg-teal-500/5 border-teal-500/30 text-teal-800'
                            : 'bg-slate-50 border-slate-200/80 text-slate-400 opacity-60'
                          } ${isCurrent ? 'ring-2 ring-teal-400 scale-[1.02] shadow-sm' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${isDone ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                            {isDone ? <Check size={14} strokeWidth={3} /> : idx + 1}
                          </div>
                          <IconComp size={16} className={isDone ? 'text-teal-600' : 'text-slate-400'} />
                        </div>

                        <div>
                          <strong className="text-xs font-black block text-slate-800">{st.title}</strong>
                          <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">{st.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Parcel Specs Grid */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Parcel Specs Summary */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
                    Parcel Request Specifications
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Package Name</span>
                      <strong className="text-slate-800 font-extrabold text-sm block mt-0.5">{booking.packageName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                      <strong className="text-slate-700 font-bold block mt-0.5 capitalize">{booking.packageCategory}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Parcel Weight</span>
                      <strong className="text-slate-800 font-extrabold text-sm block mt-0.5">{booking.weight} KG Space</strong>
                    </div>
                  </div>

                  {/* Delivery Route */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pickup Location (From)</span>
                      <strong className="text-base font-black text-slate-800">{booking.route.from}</strong>
                      <span className="text-[10px] text-slate-500 block">{booking.route.fromAirport}</span>
                    </div>
                    <Plane size={22} className="text-flyora-teal sm:rotate-90" />
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Dropoff Location (To)</span>
                      <strong className="text-base font-black text-slate-800">{booking.route.to}</strong>
                      <span className="text-[10px] text-slate-500 block">{booking.route.toAirport}</span>
                    </div>
                  </div>
                </div>

                {/* Reward & Escrow Status */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
                    Offered Reward & Payment Status
                  </h3>
                  <div className="text-center py-2">
                    <div className="text-3xl font-black text-emerald-600">${booking.reward}</div>
                    <p className="text-xs text-slate-500 mt-1 font-bold">Reward Offered to Traveler</p>
                    <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Payment Status:</span>
                        <strong className="text-emerald-700 font-bold">{isPaid ? 'Paid ✅' : 'Unpaid'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Escrow Holding:</span>
                        <strong className="text-emerald-700 font-bold">{booking.escrowStatus}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* If completed, show success banner */}
              {(booking.status === 'DELIVERED' || booking.status === 'PAYMENT_RELEASED' || booking.status === 'DISPUTED' || booking.status === 'DISPUTE_RESOLVED' || booking.status === 'DISPUTE_REJECTED') && (
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 text-center shadow-sm relative">
                  <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-black text-emerald-800">Delivery Completed</h2>
                  <p className="text-emerald-600 mt-2 font-medium mb-4">The parcel has been successfully delivered and payment has been released to the traveler.</p>

                  {booking.status === 'DELIVERED' && daysSinceDelivery >= 0 && daysSinceDelivery <= 7 && (
                    <div className="mt-4 pt-4 border-t border-emerald-200/60 inline-flex flex-col items-center">
                      <span className="text-xs font-bold text-emerald-700 mb-2">Have an issue with your parcel? You have {7 - daysSinceDelivery} days left to report it.</span>
                      <button
                        onClick={() => setShowDisputeModal(true)}
                        className="bg-red-50 text-red-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-red-100 flex items-center gap-1 transition-colors"
                      >
                        <AlertTriangle size={14} />
                        Raise Dispute
                      </button>
                    </div>
                  )}
                  {(booking.status === 'DISPUTED' || booking.status === 'DISPUTE_RESOLVED' || booking.status === 'DISPUTE_REJECTED') && (
                    <div className={`border px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                      booking.status === 'DISPUTE_REJECTED' ? 'bg-slate-50 border-slate-200 text-slate-700' : 
                      booking.status === 'DISPUTE_RESOLVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <AlertTriangle size={14} />
                      {booking.status === 'DISPUTED' ? 'Dispute Under Review' : booking.status === 'DISPUTE_RESOLVED' ? 'Dispute Approved & Resolved' : 'Dispute Rejected & Closed'}
                    </div>
                  )}
                </div>
              )}

              {/* SENDER'S DELIVERY VERIFICATION OTP & QR CODE CARD */}
              {(booking.status === 'OUT_FOR_DELIVERY' || booking.status === 'ARRIVED') && (
                <section className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/10 rounded-3xl p-6 border-2 border-teal-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-teal-800 font-extrabold text-sm uppercase tracking-wider">
                      <KeyRound size={18} className="text-teal-600" /> Delivery Handover Verification (OTP & QR Code)
                    </div>
                    <p className="text-xs text-slate-600 max-w-xl font-medium leading-relaxed">
                      Provide this unique <strong>6-digit OTP code</strong> or show the <strong>QR Code</strong> to the Traveler <strong>ONLY when you physically receive and verify your parcel</strong> at handover!
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-md">6-Digit Code</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md">Scannable QR Code</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap shrink-0">
                    {/* QR Code Container */}
                    <div className="bg-white p-2.5 rounded-2xl border-2 border-teal-400 shadow-md flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=FLYORA-OTP-${booking.deliveryOtp}`}
                        alt="Handover Verification QR Code"
                        className="w-24 h-24 rounded-lg object-contain"
                      />
                      <span className="text-[9px] font-black text-slate-500 mt-1 uppercase tracking-wider">SCAN QR</span>
                    </div>

                    {/* 6-Digit OTP Box */}
                    <div className="bg-white px-5 py-4 rounded-2xl border-2 border-teal-500 shadow-md flex flex-col items-center justify-center shrink-0 min-w-[170px]">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">6-DIGIT OTP</span>
                      <strong className="text-3xl font-black tracking-widest text-teal-700 font-mono">{booking.deliveryOtp}</strong>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(booking.deliveryOtp);
                          alert("6-Digit Handover OTP code copied!");
                        }}
                        className="mt-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition text-xs font-bold w-full"
                        title="Copy 6-Digit OTP Code"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Uploaded Package Photos Gallery Section */}
              <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                      Uploaded Package Photos ({validImgs.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Photos uploaded by you when creating this parcel request.
                    </p>
                  </div>
                  {validImgs.length > 0 && (
                    <span className="text-xs font-extrabold bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-auto">
                      {validImgs.length} Photo{validImgs.length > 1 ? 's' : ''} Uploaded
                    </span>
                  )}
                </div>

                {activePhoto ? (
                  <div className="space-y-4">
                    <div
                      className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 aspect-video max-h-96 flex items-center justify-center relative cursor-zoom-in group shadow-md"
                      onClick={() => setZoomImg(activePhoto)}
                    >
                      <img src={activePhoto} alt={booking.packageName} className="w-full h-full object-contain bg-slate-950/90" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[2px]">
                        <Eye size={16} /> Click to Enlarge Full Image
                      </div>
                    </div>

                    {validImgs.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                        {validImgs.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhotoIndex(idx)}
                            className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${activePhotoIndex === idx ? 'border-teal-500 scale-105 ring-2 ring-teal-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                              }`}
                          >
                            <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No package photos uploaded for this request.
                  </div>
                )}
              </section>

              {/* Traveler Acceptance Card Below */}
              <section className="bg-white rounded-3xl p-6 border-2 border-teal-100 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={18} className="text-teal-600" /> Traveler Status & Confirmation
                  </h3>
                  {booking.status === 'REJECTED' ? (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <XCircle size={14} className="text-rose-600" /> Request Rejected by Traveler
                    </span>
                  ) : booking.status === 'ACCEPTED' || isPaid || ['PARCEL_VERIFIED', 'IN_TRANSIT', 'ARRIVED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAYMENT_RELEASED'].includes(booking.status) ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Accepted by Traveler
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500" /> Request Sent (Awaiting Traveler Acceptance)
                    </span>
                  )}
                </div>

                {booking.traveler ? (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                          {booking.traveler.name?.slice(0, 2)?.toUpperCase() || 'TR'}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-800">{booking.traveler.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">{booking.traveler.email || 'Verified Traveler'}</p>
                        </div>
                      </div>

                      {/* Traveler KYC Badge */}
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs self-start sm:self-auto">
                        <ShieldCheck size={16} className="text-emerald-600" /> KYC Verified Traveler ✅
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Flight Airline</span>
                        <strong className="text-slate-800 font-bold">{booking.traveler.airline}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Flight Number</span>
                        <strong className="text-teal-700 font-bold">{booking.traveler.flightNo}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Travel Date</span>
                        <strong className="text-slate-800 font-bold">{booking.route.depDate}</strong>
                      </div>
                    </div>

                    {/* Pay Now Button (ONLY shows when ACCEPTED and unpaid; disappears once paid!) */}
                    {!isPaid && booking.status === 'ACCEPTED' && (
                      <div className="pt-3 border-t border-slate-200/60 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowPaymentModal(true)}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
                        >
                          <Wallet size={16} /> Pay Now (${booking.reward})
                        </button>
                      </div>
                    )}
                  </div>
                ) : booking.status === 'REQUEST_CREATED' || booking.status === 'Searching for Traveler' ? (
                  <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200/80 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                      Your parcel request is currently active. Senders can match with available travelers heading towards {booking.route.to}.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/sender')}
                      className="px-6 py-2.5 bg-flyora-teal hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md transition inline-flex items-center gap-2"
                    >
                      <Search size={15} /> Find Available Travelers Now
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200/80 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                      Awaiting response from traveler.
                    </p>
                  </div>
                )}
              </section>
            </>
          )}

        </div>
      </main>

      {/* 1. INTERACTIVE PAYMENT GATEWAY MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
                  <Wallet size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg tracking-tight">Pay Now</h3>
                  <p className="text-xs text-emerald-100 font-medium">Payment for Parcel Request #{booking?.id}</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="relative z-10 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {(() => {
                const travelerReward = Number(booking?.reward) || (Number(booking?.weight) * (Number(booking?.trip_price_per_kg) || 10.0)) || 0;
                return (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                      <span>Traveler Reward:</span>
                      <span className="text-slate-800 font-black">${travelerReward.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                      <span>Platform Service Fee:</span>
                      <span className="text-slate-800 font-black">${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-sm font-black text-slate-800">
                      <span>Total Escrow Amount:</span>
                      <span className="text-emerald-600 text-base font-black">
                        ${(travelerReward + platformFee).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Payment Method</label>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('upi')}
                    className={`p-3.5 rounded-2xl border-2 text-center flex flex-col items-center gap-2 transition ${selectedPaymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-500/5 font-extrabold text-emerald-800 ring-2 ring-emerald-200' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    <Sparkles size={22} className="text-emerald-600" />
                    <span className="text-xs">UPI / GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`p-3.5 rounded-2xl border-2 text-center flex flex-col items-center gap-2 transition ${selectedPaymentMethod === 'card' ? 'border-emerald-500 bg-emerald-500/5 font-extrabold text-emerald-800 ring-2 ring-emerald-200' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    <CreditCard size={22} className="text-emerald-600" />
                    <span className="text-xs">Debit/Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('wallet')}
                    className={`p-3.5 rounded-2xl border-2 text-center flex flex-col items-center gap-2 transition ${selectedPaymentMethod === 'wallet' ? 'border-emerald-500 bg-emerald-500/5 font-extrabold text-emerald-800 ring-2 ring-emerald-200' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    <Wallet size={22} className="text-emerald-600" />
                    <span className="text-xs">Flyora Wallet</span>
                  </button>
                </div>
              </div>

              {/* Payment Details Input Preview */}
              {selectedPaymentMethod === 'card' ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Card Number</label>
                    <input type="text" placeholder="4532 •••• •••• 8892" defaultValue="4532 9012 8841 8892" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 outline-none focus:border-teal-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="08/28" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CVV</label>
                      <input type="password" placeholder="•••" defaultValue="882" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none" />
                    </div>
                  </div>
                </div>
              ) : selectedPaymentMethod === 'upi' ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">VPA / UPI ID</label>
                  <input type="text" placeholder="username@upi" defaultValue="flyora.user@okicici" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold outline-none focus:border-teal-500" />
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Available Wallet Balance:</span>
                  <strong className="text-emerald-600 font-black text-sm">$450.00 USD</strong>
                </div>
              )}

              {/* Escrow Guarantee Notice */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Escrow Protection:</strong> Payment stays safely held in Flyora Escrow. Funds are NOT sent to traveler until you receive the parcel and verify handover with your 4-digit OTP!
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="py-3 px-5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmPayment}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>Pay Now (${((Number(booking?.reward) || (Number(booking?.weight) * (Number(booking?.trip_price_per_kg) || 10.0)) || 0) + platformFee).toFixed(2)}) 🔒</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PAYMENT SUCCESS CONFIRMATION MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden border border-slate-100">

            {/* Top Confetti Decor */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Animated Success Badge */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <CheckCircle size={44} strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Confirmed & Successful 🎉
              </span>
              <h2 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">Payment Successful!</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Your payment of <strong>${booking?.reward}</strong> was confirmed successfully and is held safely in Escrow. Status updated to <strong>Paid ✅</strong>.
              </p>
            </div>

            {/* Transaction Breakdown Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Transaction Ref:</span>
                <strong className="font-mono text-slate-800 font-bold">{txnRef}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Parcel Status:</span>
                <strong className="text-emerald-700 font-black flex items-center gap-1">
                  <CheckCircle2 size={13} /> Paid ✅ (Escrow Secured)
                </strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Assigned Traveler:</span>
                <strong className="text-slate-800 font-bold">{booking?.traveler?.name || 'Verified Traveler'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sender Handover OTP:</span>
                <strong className="text-teal-700 font-mono font-black text-sm">{booking?.deliveryOtp}</strong>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 group"
            >
              View Live Tracking Timeline <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* TRAVELER PARCEL HANDOVER VERIFICATION & IMAGE UPLOAD MODAL */}
      {showVerifyParcelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowVerifyParcelModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Parcel Pickup Verification</h3>
                  <p className="text-xs text-slate-500">Upload photos of the physical parcel received from sender</p>
                </div>
              </div>
              <button onClick={() => setShowVerifyParcelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Before starting flight transit, inspect the physical parcel carefully and upload at least 1 verification photo of the package at handover.
              </p>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 transition cursor-pointer bg-slate-50 relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleVerificationFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload size={28} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Click or drag photos to upload</p>
                <p className="text-[10px] text-slate-400 mt-1">Upload up to 5 parcel verification images</p>
              </div>

              {/* Previews */}
              {verificationPreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {verificationPreviews.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-xl border-2 border-teal-500 overflow-hidden relative group shrink-0">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setShowVerifyParcelModal(false)}
                className="py-3 px-5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingVerification || verificationPreviews.length === 0}
                onClick={handleSubmitParcelVerification}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {isSubmittingVerification ? 'Submitting Verification...' : 'Submit Photos & Verify Pickup 📷'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAVELER OTP HANDOVER VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowOtpModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                  <KeyRound size={20} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">Verify Handover OTP</h3>
              </div>
              <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Ask the Sender for their <strong>4-digit Delivery Handover OTP</strong> upon receiving the parcel. Entering the correct code will release <strong>${booking?.reward}</strong> Escrow reward to your wallet!
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">4-Digit Handover Code</label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. 2665"
                value={inputOtp}
                onChange={e => setInputOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-teal-500 font-black text-slate-800"
              />
              {otpError && (
                <div className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center gap-1.5">
                  <ShieldAlert size={14} /> {otpError}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifyingOtp || inputOtp.length !== 4}
                onClick={handleVerifyOtpHandover}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                {verifyingOtp ? 'Verifying...' : 'Confirm Handover & Release Funds'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom */}
      {zoomImg && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomImg(null)}>
          <img src={zoomImg} alt="Zoom" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" />
          <button className="absolute top-4 right-4 bg-white/20 text-white p-3 rounded-full hover:bg-white/30"><X size={20} /></button>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/50 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
              <h2 className="text-xl font-black text-red-700">Raise a Dispute</h2>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs font-semibold text-red-800 leading-relaxed">
                Raising a dispute will notify our admin team. Please provide as much detail as possible. False disputes may result in account penalty.
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-4 py-3 focus:border-red-400 focus:ring-4 focus:ring-red-400/20 outline-none transition"
                >
                  <option value="Damaged Parcel">Damaged Parcel</option>
                  <option value="Missing Items">Missing Items</option>
                  <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Description of the Issue</label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Describe exactly what happened..."
                  className="w-full h-28 bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-3 focus:border-red-400 focus:ring-4 focus:ring-red-400/20 outline-none transition resize-none placeholder:text-slate-400"
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!disputeDescription.trim()) {
                    alert("Please provide a description of the issue.");
                    return;
                  }
                  setIsSubmittingDispute(true);
                  try {
                    const fd = new FormData();
                    fd.append('booking', (booking?.linkedBookingId || booking?.rawId).toString());
                    fd.append('reason', disputeReason);
                    fd.append('description', disputeDescription);

                    await fetch('http://localhost:8000/api/support/disputes', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('flyora_access_token')}`
                      },
                      body: fd
                    });

                    alert("Dispute raised successfully. Our team will contact you shortly.");
                    setShowDisputeModal(false);
                    loadBookingData();
                  } catch (e: any) {
                    alert("Failed to raise dispute: " + e.message);
                  } finally {
                    setIsSubmittingDispute(false);
                  }
                }}
                disabled={isSubmittingDispute}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition disabled:opacity-50"
              >
                {isSubmittingDispute ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsPage;
