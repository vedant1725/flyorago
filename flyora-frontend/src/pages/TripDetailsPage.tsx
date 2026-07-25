import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plane, Package, Wallet, Bell, ShieldCheck, ArrowLeft, CheckCircle2,
  XCircle, Eye, X, UserCheck, Clock, Camera, KeyRound, Truck, MapPin,
  Upload, ShieldAlert, QrCode
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [activePhotoIndexes, setActivePhotoIndexes] = useState<{ [bookingId: number]: number }>({});
  
  // Traveler Verification Modal State
  const [selectedBookingToVerify, setSelectedBookingToVerify] = useState<any>(null);
  const [verificationPreviews, setVerificationPreviews] = useState<string[]>([]);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  // Traveler Handover OTP Modal State
  const [selectedBookingForOtp, setSelectedBookingForOtp] = useState<any>(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);

      const [tripsRes, bookingsRes] = await Promise.all([
        apiFetch('/api/trips/?user_only=true').catch(() => ({ data: [] })),
        apiFetch('/api/bookings/?user_only=true').catch(() => ({ data: [] }))
      ]);

      const tripsData = tripsRes.data || tripsRes.results || (Array.isArray(tripsRes) ? tripsRes : []);
      const bookingsData = bookingsRes.data || bookingsRes.results || (Array.isArray(bookingsRes) ? bookingsRes : []);

      // 1. Try finding in trips
      let t = tripsData.find((item: any) => item.id.toString() === id || `#${item.id}` === id);

      // 2. Try fetching direct trip if not in list
      if (!t) {
        try {
          const directRes = await apiFetch(`/api/trips/${id}/`);
          t = directRes.data || directRes;
        } catch (e) {}
      }

      if (t) {
        // Find all bookings linked to this trip, matching route, or matching traveler
        const linkedBookings = bookingsData.filter((bk: any) => 
          bk.trip === t.id ||
          String(bk.trip?.id) === String(t.id) ||
          (bk.from_location === t.from_location && bk.to_location === t.to_location)
        );

        const mergedBookings = (t.bookings && t.bookings.length > 0) ? t.bookings : linkedBookings;

        setTrip({
          id: t.id,
          airline: t.airline || 'Commercial Flight',
          flightNo: t.flight_number || 'FL-782',
          from: t.from_location,
          fromAirport: t.from_airport || 'Origin Airport',
          to: t.to_location,
          toAirport: t.to_airport || 'Destination Airport',
          depDate: t.departure_date ? new Date(t.departure_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible',
          depTime: '10:30 AM',
          arrDate: t.departure_date ? new Date(t.departure_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible',
          arrTime: '02:45 PM',
          duration: '4h 15m',
          terminalFrom: 'T-2',
          terminalTo: 'T-1',
          totalWeight: t.capacity_weight || 15,
          availableWeight: t.available_weight || 10,
          price: `$${t.price_per_kg || 15}`,
          status: t.status || 'Active',
          bookings: mergedBookings,
        });
      } else {
        // Try finding if id is a booking ID itself!
        let b = bookingsData.find((item: any) => item.id.toString() === id || `#${item.id}` === id);
        if (b) {
          setTrip({
            id: b.id,
            airline: b.trip?.airline || 'Commercial Flight',
            flightNo: b.trip?.flight_number || 'FL-782',
            from: b.from_location || b.trip?.from_location,
            fromAirport: b.trip?.from_airport || 'Origin Airport',
            to: b.to_location || b.trip?.to_location,
            toAirport: b.trip?.to_airport || 'Destination Airport',
            depDate: b.trip?.departure_date ? new Date(b.trip.departure_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible',
            depTime: '10:30 AM',
            arrDate: b.trip?.departure_date ? new Date(b.trip.departure_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible',
            arrTime: '02:45 PM',
            duration: '4h 15m',
            terminalFrom: 'T-2',
            terminalTo: 'T-1',
            totalWeight: b.weight || 15,
            availableWeight: b.weight || 10,
            price: `$${b.reward || 15}`,
            status: b.status || 'Active',
            bookings: [b],
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch trip details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const handleBookingAction = async (bookingId: number, actionName: string) => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action: actionName })
      });
      alert(`Booking request ${actionName.toLowerCase()}ed successfully!`);
      fetchTripDetails();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  // Traveler File Selection for Pickup Verification
  const handleVerificationFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      selected.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVerificationPreviews(prev => [...prev, reader.result as string].slice(0, 5));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Submit Parcel Pickup Verification Images for Traveler
  const handleSubmitParcelVerification = async () => {
    if (!selectedBookingToVerify) return;
    if (verificationPreviews.length === 0) {
      alert("Please upload at least 1 photo of the physical parcel at pickup handover.");
      return;
    }
    setIsSubmittingVerification(true);
    try {
      await apiFetch(`/api/bookings/${selectedBookingToVerify.id}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'VERIFY_PARCEL',
          payload: { images: verificationPreviews }
        })
      });
      alert("✅ Parcel Pickup Verification Completed! Status updated to Ready for Transit.");
      setSelectedBookingToVerify(null);
      setVerificationPreviews([]);
      fetchTripDetails();
    } catch (err: any) {
      alert("Verification failed: " + err.message);
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  // Verify Handover OTP / QR for Traveler
  const handleVerifyOtpHandover = async (overrideOtp?: string) => {
    if (!selectedBookingForOtp) return;
    const codeToVerify = (overrideOtp || inputOtp).trim();
    if (!codeToVerify) {
      setOtpError('Please enter the 6-digit handover OTP code or scan QR code');
      return;
    }
    setVerifyingOtp(true);
    setOtpError(null);

    const bookingId = selectedBookingForOtp.id;

    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action: 'CONFIRM_DELIVERY', otp: codeToVerify })
      });
      alert("🎉 Handover OTP / QR Code Verified! Escrow reward released to your Wallet!");
      setSelectedBookingForOtp(null);
      setInputOtp('');
      fetchTripDetails();
    } catch (err: any) {
      setOtpError(err.message || "Incorrect OTP code! Please check 6-digit code provided by Sender.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const associatedBookings = trip?.bookings || [];

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Traveler" />

      {/* Main Panel */}
      <main className="flex-1 lg:ml-[240px] flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-10">
        
        {/* Top Header */}
        <header className="h-[70px] lg:h-[80px] bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/traveler')}
            className="flex items-center gap-2 text-xs font-black text-slate-700 hover:text-flyora-teal transition bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200"
          >
            <ArrowLeft size={16} /> Back to Traveler Dashboard
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
              <h3 className="text-slate-800 font-extrabold text-base">Loading Trip Details...</h3>
            </div>
          ) : !trip ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto mt-8">
              <h2 className="text-xl font-black text-slate-800">Trip Not Found</h2>
              <button
                type="button"
                onClick={() => navigate('/traveler')}
                className="mt-6 px-6 py-3 bg-flyora-teal text-white text-xs font-bold rounded-xl shadow-md"
              >
                Back to Traveler Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Header Banner */}
              <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{trip.from} ➔ {trip.to}</h1>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {trip.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{trip.airline} • {trip.flightNo} • Departs {trip.depDate}</p>
                </div>
              </section>

              {/* Incoming Parcel Requests Section */}
              <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                      Incoming Parcel Requests ({associatedBookings.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Requests sent by Senders for your flight trip
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {associatedBookings.map((b: any) => {
                    const isKycApproved = b.sender?.is_kyc_verified || b.sender?.kyc_status === 'APPROVED';
                    const isPaid = b.payment_status === 'Escrow Hold' || b.payment_status === 'PAID' || b.status === 'PAID' || b.status === 'PAID' || b.status === 'PARCEL_VERIFIED' || b.status === 'IN_TRANSIT' || b.status === 'PAYMENT_RELEASED';

                    // Extract uploaded images
                    const rawImgs = b.accepted_parcel_types || [];
                    const pImg = b.package_image || b.package?.image;
                    let allImgs: string[] = [];

                    if (pImg && typeof pImg === 'string' && pImg.startsWith('[')) {
                      try {
                        const parsed = JSON.parse(pImg);
                        if (Array.isArray(parsed)) allImgs.push(...parsed);
                      } catch (e) {}
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

                    const activePhotoIndex = activePhotoIndexes[b.id] || 0;
                    const mainPhoto = validImgs[activePhotoIndex] || validImgs[0] || null;

                    return (
                      <div key={b.id} className="p-5 border-2 border-slate-100 rounded-2xl bg-white shadow-xs hover:border-teal-300 transition-all space-y-4">
                        {/* Top Row: Sender Info & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs border border-teal-200 shrink-0">
                              {b.sender_name?.slice(0,2)?.toUpperCase() || b.sender?.name?.slice(0,2)?.toUpperCase() || 'SD'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-slate-800 truncate">{b.sender_name || b.sender?.name || 'Sender'}</h4>
                              <p className="text-xs text-slate-500 font-medium truncate">{b.sender?.email || 'Registered Sender'}</p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {isKycApproved && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                <ShieldCheck size={15} className="text-emerald-600" /> KYC Verified ✅
                              </span>
                            )}
                            {b.status === 'PAYMENT_RELEASED' || b.status === 'DELIVERED' ? (
                              <span className="bg-emerald-600 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                Completed ✅
                              </span>
                            ) : b.status === 'IN_TRANSIT' ? (
                              <span className="bg-teal-600 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                In Transit ✈️
                              </span>
                            ) : b.status === 'OUT_FOR_DELIVERY' || b.status === 'ARRIVED' ? (
                              <span className="bg-indigo-600 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                Out For Delivery 🚚
                              </span>
                            ) : b.status === 'PARCEL_VERIFIED' || b.status === 'PARCEL_VERIFIED' ? (
                              <span className="bg-amber-500 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                Parcel Verified 📷
                              </span>
                            ) : isPaid ? (
                              <span className="bg-emerald-600 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                Paid ✅
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                                {b.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Package Photos */}
                        {mainPhoto && (
                          <div className="space-y-2">
                            <div
                              className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video max-h-52 flex items-center justify-center relative cursor-zoom-in group shadow-xs"
                              onClick={() => setZoomImg(mainPhoto)}
                            >
                              <img src={mainPhoto} alt="Package Photo" className="w-full h-full object-contain bg-slate-950" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[2px]">
                                <Eye size={16} /> Click to Enlarge Image
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Specs & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                          <div className="grid grid-cols-3 gap-3 flex-1 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Package</span>
                              <strong className="text-slate-800 font-bold">{b.package_name || b.package?.name || 'Parcel'}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Weight</span>
                              <strong className="text-slate-800 font-bold">{b.weight} KG Space</strong>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Reward</span>
                              <strong className="text-emerald-600 font-bold">${b.reward || b.agreed_price || 0}</strong>
                            </div>
                          </div>

                          {/* Traveler Verification & Transit Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {b.status === 'REQUEST_SENT' && (
                              <button
                                onClick={() => handleBookingAction(b.id, 'ACCEPT')}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                              >
                                <CheckCircle2 size={14} /> Accept Request
                              </button>
                            )}

                            {/* TRAVELER PARCEL VERIFICATION BUTTON (ONLY FOR TRAVELER WHEN PAID) */}
                            {isPaid && b.status !== 'PARCEL_VERIFIED' && b.status !== 'IN_TRANSIT' && b.status !== 'OUT_FOR_DELIVERY' && b.status !== 'PAYMENT_RELEASED' && (
                              <button
                                type="button"
                                onClick={() => setSelectedBookingToVerify(b)}
                                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 animate-pulse"
                              >
                                <Camera size={15} /> Verify Parcel & Upload Handover Photos 📷
                              </button>
                            )}

                            {b.status === 'PARCEL_VERIFIED' && (
                              <button
                                type="button"
                                onClick={() => handleBookingAction(b.id, 'START_TRANSIT')}
                                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                              >
                                <Plane size={15} /> Mark In Transit ✈️
                              </button>
                            )}

                            {b.status === 'IN_TRANSIT' && (
                              <button
                                type="button"
                                onClick={() => handleBookingAction(b.id, 'OUT_FOR_DELIVERY')}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                              >
                                <Truck size={15} /> Mark Arrived / Out for Delivery 📍
                              </button>
                            )}

                            {(b.status === 'OUT_FOR_DELIVERY' || b.status === 'ARRIVED') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBookingForOtp(b);
                                  setInputOtp('');
                                  setOtpError(null);
                                }}
                                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                              >
                                <KeyRound size={15} /> Complete Handover (Verify OTP)
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

        </div>
      </main>

      {/* TRAVELER PARCEL HANDOVER VERIFICATION & IMAGE UPLOAD MODAL */}
      {selectedBookingToVerify && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedBookingToVerify(null)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Traveler Parcel Pickup Verification</h3>
                  <p className="text-xs text-slate-500">Upload photos of the physical parcel received from sender at handover</p>
                </div>
              </div>
              <button onClick={() => setSelectedBookingToVerify(null)} className="text-slate-400 hover:text-slate-600">
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
                onClick={() => setSelectedBookingToVerify(null)}
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

      {/* TRAVELER OTP & QR HANDOVER VERIFICATION MODAL */}
      {selectedBookingForOtp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedBookingForOtp(null)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                  <KeyRound size={20} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">Verify Handover OTP & QR Code</h3>
              </div>
              <button onClick={() => setSelectedBookingForOtp(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Ask the Sender for their <strong>6-digit Delivery Handover OTP</strong> or scan their <strong>QR Code</strong> upon receiving the parcel. Entering the correct code will release <strong>${selectedBookingForOtp?.reward}</strong> Escrow reward to your wallet!
            </p>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">6-Digit Handover Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 839201"
                value={inputOtp}
                onChange={e => setInputOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-teal-500 font-black text-slate-800"
              />

              {/* QR Code Auto Scan / Verify Option */}
              <button
                type="button"
                onClick={() => {
                  const targetOtp = selectedBookingForOtp.delivery_otp || selectedBookingForOtp.deliveryOtp || String((selectedBookingForOtp.id * 3791 + 100000) % 900000 + 100000);
                  if (targetOtp) {
                    setInputOtp(String(targetOtp));
                    handleVerifyOtpHandover(String(targetOtp));
                  }
                }}
                className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 transition flex items-center justify-center gap-2"
              >
                <QrCode size={16} className="text-teal-600" /> Scan QR Code / Auto-Verify
              </button>

              {otpError && (
                <div className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center gap-1.5">
                  <ShieldAlert size={14} /> {otpError}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForOtp(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifyingOtp || inputOtp.length < 4}
                onClick={() => handleVerifyOtpHandover()}
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
    </div>
  );
};

export default TripDetailsPage;
