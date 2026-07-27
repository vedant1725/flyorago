import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';
import {
  Luggage, Search, Plus, CheckCircle2, ShieldCheck, Clock, MapPin,
  QrCode, Camera, Scale, Star, ShieldAlert, Sparkles, DollarSign,
  ArrowRight, Plane, RefreshCw, UserCheck, FileText, Lock, ChevronRight,
  Info, ExternalLink, SlidersHorizontal, Award, ArrowUpRight, X, Bell,
  Check, XCircle, AlertTriangle, MessageSquare, ThumbsUp, Send, Key, User
} from 'lucide-react';

interface LuggageListing {
  id: number;
  owner?: number;
  owner_details?: { first_name?: string; last_name?: string; email?: string };
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_date: string;
  departure_time: string;
  cabin_class: string;
  max_airline_allowance: number;
  currently_used_weight: number;
  available_weight: number;
  price_per_kg: number;
  min_kg: number;
  max_kg: number;
  accept_partial_booking: boolean;
  instant_booking: boolean;
  insurance: boolean;
  description: string;
  status: string;
  ai_match_score?: number;
  ai_match_badge?: string;
}

interface LuggageBooking {
  id: number;
  listing?: number;
  listing_details?: LuggageListing;
  booker?: number;
  booker_details?: { first_name?: string; last_name?: string; email?: string };
  owner?: number;
  owner_details?: { first_name?: string; last_name?: string; email?: string };
  booked_weight: number;
  price_per_kg: number;
  total_price: number;
  insurance_fee: number;
  status: string;
  escrow_status: string;
  qr_code_token: string;
  otp_code?: string;
  meeting_time?: string;
  meeting_point?: string;
  terminal?: string;
  gate?: string;
  notes?: string;
  verifications?: any[];
  reviews?: any[];
}

const LuggageSharingPage: React.FC = () => {
  const toastCtx = useToast();
  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') toastCtx.success('Success', msg);
    else if (type === 'error') toastCtx.error('Error', msg);
    else toastCtx.info('Notification', msg);
  };

  const [activeView, setActiveView] = useState<'marketplace' | 'host' | 'operations' | 'security'>('marketplace');

  // Role Perspective Override for Testing & Demo ("auto", "owner", "booker")
  const [rolePerspective, setRolePerspective] = useState<'auto' | 'owner' | 'booker'>('auto');

  // Current User ID & Email
  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const raw = localStorage.getItem('flyora_user_id');
    return raw ? parseInt(raw, 10) : null;
  });

  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return (localStorage.getItem('flyora_user_email') || '').toLowerCase();
  });

  // Stats State
  const [stats, setStats] = useState({
    total_shared_weight: 0,
    available_weight: 0,
    earnings: 0,
    active_sharing: 0,
    pending_requests: 0,
    completed_sharing: 0,
    trust_rating: 4.9,
    current_trips: [] as LuggageListing[]
  });

  // Search & Filter State
  const [searchParams, setSearchParams] = useState({
    departure_airport: '',
    arrival_airport: '',
    airline: '',
    flight_number: '',
    departure_date: '',
    needed_kg: '5',
    max_price: '',
    sort_by: 'best_match'
  });
  const [searchResults, setSearchResults] = useState<LuggageListing[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Host Form State
  const [hostForm, setHostForm] = useState({
    airline: 'Emirates',
    flight_number: 'EK202',
    departure_airport: 'JFK - New York',
    arrival_airport: 'DXB - Dubai',
    departure_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    departure_time: '14:30',
    cabin_class: 'Economy',
    max_airline_allowance: '30',
    currently_used_weight: '10',
    price_per_kg: '15',
    min_kg: '2',
    max_kg: '20',
    accept_partial_booking: true,
    instant_booking: false,
    insurance: true,
    description: 'Verified traveller sharing extra luggage allowance.'
  });

  // Bookings State
  const [bookings, setBookings] = useState<LuggageBooking[]>([]);

  // Modals
  const [selectedListing, setSelectedListing] = useState<LuggageListing | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<LuggageBooking | null>(null);
  const [bookingWeight, setBookingWeight] = useState('5');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Form Inputs in Modals
  const [verifyForm, setVerifyForm] = useState({
    bag_images: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    weight: '5',
    notes: 'Luggage safety check passed at airport terminal.',
    latitude: 40.6413,
    longitude: -73.7781
  });

  const [otpInput, setOtpInput] = useState('');
  const [qrTokenInput, setQrTokenInput] = useState('');

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    behaviour_score: 5,
    communication_score: 5,
    timing_score: 5,
    experience_score: 5,
    comment: 'Smooth luggage sharing experience!'
  });

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      const res = await apiFetch('/api/luggage/dashboard/');
      if (res.status === 'success' && res.data) {
        setStats(res.data);
        if (res.current_user_id) setCurrentUserId(res.current_user_id);
        if (res.current_user_email) setCurrentUserEmail(res.current_user_email.toLowerCase());
      }
    } catch (err) {
      console.error('Failed to load luggage dashboard:', err);
    }
  };

  // Load Bookings Data
  const loadBookings = async () => {
    try {
      const res = await apiFetch('/api/luggage/bookings/');
      if (res.status === 'success' && res.data) {
        setBookings(res.data);
        if (res.current_user_id) setCurrentUserId(res.current_user_id);
        if (res.current_user_email) setCurrentUserEmail(res.current_user_email.toLowerCase());
      }
    } catch (err) {
      console.error('Failed to load luggage bookings:', err);
    }
  };

  // Load Search Marketplace Results
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      const res = await apiFetch('/api/luggage/listings/search/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...searchParams,
          needed_kg: parseFloat(searchParams.needed_kg) || 1
        })
      });

      if (res.status === 'success' && res.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error('Failed to search marketplace:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Live Sync Polling interval (Every 3 seconds)
  useEffect(() => {
    loadDashboard();
    loadBookings();
    handleSearch();

    const timer = setInterval(() => {
      loadBookings();
      loadDashboard();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Calculated Available Weight in Host Form
  const maxAllow = parseFloat(hostForm.max_airline_allowance) || 0;
  const usedWeight = parseFloat(hostForm.currently_used_weight) || 0;
  const calculatedAvailable = Math.max(0, maxAllow - usedWeight);

  // Handle Host Publish Submit
  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usedWeight > maxAllow) {
      notify('Currently used weight cannot exceed maximum airline allowance!', 'error');
      return;
    }

    try {
      const res = await apiFetch('/api/luggage/listings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hostForm,
          max_airline_allowance: maxAllow,
          currently_used_weight: usedWeight,
          available_weight: calculatedAvailable,
          price_per_kg: parseFloat(hostForm.price_per_kg),
          min_kg: parseFloat(hostForm.min_kg),
          max_kg: parseFloat(hostForm.max_kg)
        })
      });

      if (res.status === 'success') {
        notify('🎉 Luggage allowance published & saved successfully!', 'success');
        await loadDashboard();
        await handleSearch();
        setActiveView('marketplace');
      } else {
        notify(res.message || 'Failed to publish listing', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Error publishing listing', 'error');
    }
  };

  // Handle Booking Creation Request (Traveller B -> Traveller A)
  const handleCreateBooking = async () => {
    if (!selectedListing) return;
    try {
      const res = await apiFetch('/api/luggage/bookings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: selectedListing.id,
          booked_weight: parseFloat(bookingWeight),
          notes: bookingNotes
        })
      });

      if (res.status === 'success') {
        notify('📩 Request sent to Traveller A successfully!', 'success');
        setShowBookModal(false);
        setSelectedListing(null);
        setBookingNotes('');
        await loadBookings();
        await loadDashboard();
        await handleSearch();
        setActiveView('operations');
      } else {
        notify(res.message || 'Booking request creation failed', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Error creating booking', 'error');
    }
  };

  // Handle Booking Action (Accept, Reject, Pay, Start Transit, Arrived)
  const handleBookingAction = async (bookingId: number, action: string, extraData = {}) => {
    try {
      const res = await apiFetch(`/api/luggage/bookings/${bookingId}/action/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extraData })
      });

      if (res.status === 'success') {
        notify(`Action executed successfully! Status: ${res.data.status}`, 'success');
        await loadBookings();
        await loadDashboard();
        await handleSearch();

        if (action === 'verify_qr' || action === 'verify_otp' || res.data.status === 'COMPLETED') {
          setShowSuccessPopup(true);
        }
      } else {
        notify(res.message || 'Action failed', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Error updating booking', 'error');
    }
  };

  // Handle Luggage Verification Submit (Traveller A)
  const handleVerifyLuggageSubmit = async () => {
    if (!selectedBooking) return;
    await handleBookingAction(selectedBooking.id, 'verify_luggage', {
      bag_images: verifyForm.bag_images,
      weight: parseFloat(verifyForm.weight),
      notes: verifyForm.notes,
      latitude: verifyForm.latitude,
      longitude: verifyForm.longitude,
      is_approved: true
    });
    setShowVerifyModal(false);
  };

  // Handle Submit Rating & Review
  const handleSubmitReview = async () => {
    if (!selectedBooking) return;
    try {
      const res = await apiFetch('/api/luggage/ratings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          rating: reviewForm.rating,
          behaviour_score: reviewForm.behaviour_score,
          communication_score: reviewForm.communication_score,
          timing_score: reviewForm.timing_score,
          experience_score: reviewForm.experience_score,
          comment: reviewForm.comment
        })
      });
      if (res.status === 'success') {
        notify('⭐ Review submitted successfully!', 'success');
        setShowReviewModal(false);
        await loadDashboard();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to determine if current user is Owner (Traveller A who received request)
  const isUserOwner = (b: LuggageBooking) => {
    if (rolePerspective === 'owner') return true;
    if (rolePerspective === 'booker') return false;

    if (currentUserId && b.owner === currentUserId) return true;
    if (currentUserEmail && b.owner_details?.email && b.owner_details.email.toLowerCase() === currentUserEmail) return true;
    return false;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar activeItem="Luggage Sharing" />

      <main className="flex-1 min-w-0 w-full max-w-full lg:ml-[240px] pb-24 lg:pb-12 px-3 sm:px-8 pt-6 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        
        {/* ─── GOOGLE-GRADE HERO HEADER ─── */}
        <div className="relative rounded-3xl bg-white p-4 sm:p-8 border border-slate-200 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck size={14} className="text-teal-600" /> Traveller ↔ Traveller Baggage Marketplace
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
                🧳 Luggage <span className="text-flyora-teal">Sharing</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Connect directly with travellers on your flight route to share unused baggage allowance. Protected with Escrow, Luggage Verification, QR Code & Secure OTP.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('marketplace')}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2 ${
                  activeView === 'marketplace'
                    ? 'bg-flyora-teal text-white shadow-lg shadow-teal-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Search size={16} /> Explore Marketplace
              </button>
              <button
                type="button"
                onClick={() => setActiveView('host')}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2 ${
                  activeView === 'host'
                    ? 'bg-flyora-teal text-white shadow-lg shadow-teal-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Plus size={16} /> Publish Baggage Space
              </button>
            </div>
          </div>

          {/* KPI Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Shared</span>
              <div className="text-lg font-black text-slate-800 mt-0.5">{stats.total_shared_weight} <span className="text-xs text-slate-400 font-bold">KG</span></div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Weight</span>
              <div className="text-lg font-black text-flyora-teal mt-0.5">{stats.available_weight} <span className="text-xs text-slate-400 font-bold">KG</span></div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Earnings</span>
              <div className="text-lg font-black text-emerald-600 mt-0.5">${stats.earnings}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Sharings</span>
              <div className="text-lg font-black text-blue-600 mt-0.5">{stats.active_sharing}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Req</span>
              <div className="text-lg font-black text-amber-600 mt-0.5">{stats.pending_requests}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Trust Score</span>
              <div className="text-lg font-black text-amber-500 flex items-center gap-1 mt-0.5">
                <Star size={14} fill="currentColor" /> {stats.trust_rating}
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Completed</span>
              <div className="text-lg font-black text-purple-600 mt-0.5">{stats.completed_sharing}</div>
            </div>
          </div>
        </div>

        {/* ─── SUB-NAV TABS ─── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'marketplace', label: 'Baggage Marketplace', icon: Search },
            { id: 'host', label: 'Publish Baggage Space', icon: Plus },
            { id: 'operations', label: 'Live Operations & Escrow Tracker', icon: Clock },
            { id: 'security', label: 'Security & Verification Vault', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-flyora-teal text-white shadow-md shadow-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── VIEW 1: MARKETPLACE & MATCHING ─── */}
        {activeView === 'marketplace' && (
          <div className="space-y-8">
            
            {/* Search Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Search Matching Baggage Listings</h3>
                  <p className="text-xs text-slate-500">Only verified listings matching your flight criteria are displayed</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full">
                  <Sparkles size={14} /> Strict Route Matcher Active
                </div>
              </div>

              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Departure Airport</label>
                  <input
                    type="text"
                    placeholder="e.g. JFK"
                    value={searchParams.departure_airport}
                    onChange={e => setSearchParams({ ...searchParams, departure_airport: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Destination Airport</label>
                  <input
                    type="text"
                    placeholder="e.g. DXB"
                    value={searchParams.arrival_airport}
                    onChange={e => setSearchParams({ ...searchParams, arrival_airport: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Travel Date</label>
                  <input
                    type="date"
                    value={searchParams.departure_date}
                    onChange={e => setSearchParams({ ...searchParams, departure_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Airline / Flight</label>
                  <input
                    type="text"
                    placeholder="e.g. EK202"
                    value={searchParams.flight_number}
                    onChange={e => setSearchParams({ ...searchParams, flight_number: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Required Weight (KG)</label>
                  <input
                    type="number"
                    value={searchParams.needed_kg}
                    onChange={e => setSearchParams({ ...searchParams, needed_kg: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Max Price ($/KG)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={searchParams.max_price}
                    onChange={e => setSearchParams({ ...searchParams, max_price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Sort By</label>
                  <select
                    value={searchParams.sort_by}
                    onChange={e => setSearchParams({ ...searchParams, sort_by: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  >
                    <option value="best_match">Best Match</option>
                    <option value="lowest_price">Lowest Price</option>
                    <option value="most_weight">Most Available Weight</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-2xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition flex items-center justify-center gap-2 shadow-md shadow-teal-500/20"
                  >
                    {isSearching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                    <span>Filter & Search</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-base">Matching Luggage Listings ({searchResults.length})</h4>
                <span className="text-xs font-bold text-slate-400">Strict Verification & Matching Active</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                  <Plane size={44} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-base font-bold text-slate-700">No luggage listings match all of your strict criteria right now.</p>
                  <p className="text-xs text-slate-400 mt-1">Note: Your own published listings are automatically hidden from your search results.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {searchResults.map(listing => (
                    <div key={listing.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-flyora-teal shadow-sm hover:shadow-md transition relative overflow-hidden group">
                      
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-black">
                        <Sparkles size={13} />
                        <span>{listing.ai_match_badge || '100% Match'}</span>
                      </div>

                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-black text-lg border border-teal-100">
                          {listing.owner_details?.first_name ? listing.owner_details.first_name[0] : 'T'}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{listing.owner_details?.first_name || 'Verified Traveller'}</h5>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center text-amber-500 font-bold"><Star size={12} fill="currentColor" className="mr-0.5" /> 4.9</span>
                            <span>• KYC & Passport Verified</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>✈️ {listing.airline} ({listing.flight_number})</span>
                          <span className="text-emerald-600 font-black text-sm">${listing.price_per_kg} / KG</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                          <span>{listing.departure_airport}</span>
                          <ArrowRight size={14} className="text-flyora-teal" />
                          <span>{listing.arrival_airport}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Date: {listing.departure_date}</span>
                          <span>Time: {listing.departure_time}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500">Available Weight:</span>
                          <span className="text-teal-700">{listing.available_weight} KG Free</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="h-full bg-flyora-teal rounded-full"
                            style={{
                              width: `${(listing.available_weight / listing.max_airline_allowance) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowBookModal(true);
                        }}
                        className="w-full py-3 rounded-2xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition flex items-center justify-center gap-2 shadow-md shadow-teal-500/20"
                      >
                        <Luggage size={16} /> Send Sharing Request
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── VIEW 2: CREATE LISTING ─── */}
        {activeView === 'host' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Publish Baggage Space (Traveller A)</h3>
                <p className="text-xs text-slate-500">Monetize unused airline baggage allowance securely</p>
              </div>
            </div>

            <form onSubmit={handleHostSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Airline</label>
                  <input
                    type="text"
                    required
                    value={hostForm.airline}
                    onChange={e => setHostForm({ ...hostForm, airline: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Flight Number</label>
                  <input
                    type="text"
                    required
                    value={hostForm.flight_number}
                    onChange={e => setHostForm({ ...hostForm, flight_number: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Departure Airport</label>
                  <input
                    type="text"
                    required
                    value={hostForm.departure_airport}
                    onChange={e => setHostForm({ ...hostForm, departure_airport: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Arrival Airport</label>
                  <input
                    type="text"
                    required
                    value={hostForm.arrival_airport}
                    onChange={e => setHostForm({ ...hostForm, arrival_airport: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={hostForm.departure_date}
                    onChange={e => setHostForm({ ...hostForm, departure_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Departure Time</label>
                  <input
                    type="time"
                    required
                    value={hostForm.departure_time}
                    onChange={e => setHostForm({ ...hostForm, departure_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Cabin Class</label>
                  <select
                    value={hostForm.cabin_class}
                    onChange={e => setHostForm({ ...hostForm, cabin_class: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>
              </div>

              {/* Validation Box */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Airline Allowance (KG)</label>
                    <input
                      type="number"
                      required
                      value={hostForm.max_airline_allowance}
                      onChange={e => setHostForm({ ...hostForm, max_airline_allowance: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Used Weight (KG)</label>
                    <input
                      type="number"
                      required
                      value={hostForm.currently_used_weight}
                      onChange={e => setHostForm({ ...hostForm, currently_used_weight: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-teal-700 mb-1.5">Available Weight (Validated)</label>
                    <div className="w-full px-4 py-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 font-black text-sm">
                      {calculatedAvailable} KG Free
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Price Per KG ($)</label>
                    <input
                      type="number"
                      required
                      value={hostForm.price_per_kg}
                      onChange={e => setHostForm({ ...hostForm, price_per_kg: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Shareable KG</label>
                    <input
                      type="number"
                      required
                      value={hostForm.min_kg}
                      onChange={e => setHostForm({ ...hostForm, min_kg: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Maximum Shareable KG</label>
                    <input
                      type="number"
                      required
                      value={hostForm.max_kg}
                      onChange={e => setHostForm({ ...hostForm, max_kg: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={hostForm.description}
                  onChange={e => setHostForm({ ...hostForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-flyora-teal"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-flyora-teal text-white font-bold text-sm hover:bg-teal-600 transition shadow-md shadow-teal-500/20"
              >
                Publish Baggage Allowance Listing
              </button>
            </form>
          </div>
        )}

        {/* ─── VIEW 3: LIVE OPERATIONS & WORKFLOW TRACKER ─── */}
        {activeView === 'operations' && (
          <div className="space-y-6">
            
            {/* Role Perspective Switcher Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <User size={16} className="text-flyora-teal" />
                <span>Testing Mode (Role Perspective):</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRolePerspective('auto')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition ${
                    rolePerspective === 'auto'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Auto Detect
                </button>
                <button
                  type="button"
                  onClick={() => setRolePerspective('owner')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition ${
                    rolePerspective === 'owner'
                      ? 'bg-flyora-teal text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Traveller A (Owner / Host View)
                </button>
                <button
                  type="button"
                  onClick={() => setRolePerspective('booker')}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition ${
                    rolePerspective === 'booker'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Traveller B (Booker / Requester View)
                </button>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900">Live Sharings & Verification Workflow</h3>

            {bookings.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                <Clock size={44} className="mx-auto text-slate-300 mb-3" />
                <p className="text-base font-bold text-slate-700">No active luggage sharing bookings currently found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map(b => {
                  const isOwner = isUserOwner(b);
                  
                  return (
                    <div key={b.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                      
                      {/* Booking Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-slate-400">Sharing #{b.id}</span>
                            
                            {/* Live Status Badges - Strictly scoped by Role */}
                            {b.status === 'REQUESTED' && (
                              <span className={`px-3 py-1 rounded-full font-black text-xs border ${
                                isOwner
                                  ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                                  : 'bg-blue-500/10 text-blue-700 border-blue-500/30'
                              }`}>
                                {isOwner ? 'New Request Received' : 'Request Sent'}
                              </span>
                            )}

                            {b.status === 'REJECTED' && (
                              <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-500/30">
                                Rejected
                              </span>
                            )}

                            {b.status === 'ACCEPTED' && (
                              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200">
                                Approved
                              </span>
                            )}

                            {b.status === 'PAID' && (
                              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs">
                                {isOwner ? 'Paid by Booker' : 'Payment Successful'}
                              </span>
                            )}

                            {b.status === 'VERIFIED' && (
                              <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-black text-xs">
                                Luggage Verified
                              </span>
                            )}

                            {b.status === 'IN_TRANSIT' && (
                              <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-xs">
                                In Transit
                              </span>
                            )}

                            {b.status === 'ARRIVED' && (
                              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-xs">
                                {isOwner ? 'Arrived at Destination' : 'Traveller Arrived'}
                              </span>
                            )}

                            {b.status === 'COMPLETED' && (
                              <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-xs">
                                Sharing Completed 🎉
                              </span>
                            )}
                          </div>

                          <h4 className="text-lg font-black text-slate-900">
                            ✈️ {b.listing_details?.airline} ({b.listing_details?.flight_number}) • {b.booked_weight} KG
                          </h4>
                          <p className="text-xs text-slate-500">
                            Route: {b.listing_details?.departure_airport} → {b.listing_details?.arrival_airport}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-600">${b.total_price}</div>
                          <span className="text-xs text-slate-400 font-bold">Escrow: {b.escrow_status}</span>
                        </div>
                      </div>

                      {/* WORKFLOW ACTION BUTTONS - Strictly Scoped by Role (isOwner vs !isOwner) */}
                      <div className="flex flex-wrap items-center gap-3">
                        
                        {/* ACCEPT / REJECT BUTTONS: Appears ONLY for Traveller A (Owner / Host who received the request) */}
                        {b.status === 'REQUESTED' && isOwner && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleBookingAction(b.id, 'accept')}
                              className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                            >
                              <Check size={16} /> Accept Request
                            </button>
                            <button
                              onClick={() => handleBookingAction(b.id, 'reject')}
                              className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition flex items-center gap-1.5"
                            >
                              <XCircle size={16} /> Reject Request
                            </button>
                          </div>
                        )}

                        {/* REQUEST SENT WAITING NOTICE: Displayed ONLY for Traveller B (Booker / Requester who sent the request) */}
                        {b.status === 'REQUESTED' && !isOwner && (
                          <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                            <Clock size={16} className="animate-spin text-amber-600" />
                            <span>Request sent! Waiting for Traveller A to accept your request...</span>
                          </div>
                        )}

                        {/* PROCEED TO PAYMENT BUTTON: Appears ONLY for Traveller B AFTER Traveller A accepts */}
                        {b.status === 'ACCEPTED' && !isOwner && (
                          <button
                            onClick={() => handleBookingAction(b.id, 'pay')}
                            className="px-6 py-3 rounded-2xl bg-flyora-teal text-white font-black text-xs hover:bg-teal-600 transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
                          >
                            <DollarSign size={16} /> Proceed To Payment (${b.total_price})
                          </button>
                        )}

                        {/* PAYMENT WAITING NOTICE FOR OWNER */}
                        {b.status === 'ACCEPTED' && isOwner && (
                          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span>Request approved! Waiting for Traveller B to make payment into escrow...</span>
                          </div>
                        )}

                        {/* VERIFY LUGGAGE BUTTON: Appears ONLY for Traveller A AFTER Payment */}
                        {b.status === 'PAID' && isOwner && (
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setShowVerifyModal(true);
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition flex items-center gap-2"
                          >
                            <Camera size={16} /> Verify Luggage
                          </button>
                        )}

                        {/* START TRANSIT BUTTON: Appears ONLY for Traveller A AFTER Luggage Verified */}
                        {b.status === 'VERIFIED' && isOwner && (
                          <button
                            onClick={() => handleBookingAction(b.id, 'start_transit')}
                            className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-2"
                          >
                            <Plane size={16} /> Start Transit
                          </button>
                        )}

                        {/* ARRIVED BUTTON: Appears ONLY for Traveller A AFTER Transit */}
                        {b.status === 'IN_TRANSIT' && isOwner && (
                          <button
                            onClick={() => handleBookingAction(b.id, 'arrived')}
                            className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} /> Arrived at Destination
                          </button>
                        )}

                        {/* DISPLAY SECURE QR & OTP CODES TO TRAVELLER B AFTER ARRIVAL */}
                        {b.status === 'ARRIVED' && !isOwner && (
                          <div className="w-full bg-slate-900 text-white p-4 rounded-2xl space-y-3">
                            <h5 className="font-bold text-xs text-teal-400">Present These Verification Credentials To Traveller A:</h5>
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 font-mono text-sm tracking-wider text-teal-300">
                                🔑 QR Token: {b.qr_code_token}
                              </div>
                              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 font-mono text-sm font-black tracking-widest text-amber-400">
                                🔢 OTP Code: {b.otp_code || '482910'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* VERIFY QR / OTP: Appears ONLY for Traveller A when Arrived */}
                        {b.status === 'ARRIVED' && isOwner && (
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setShowQRModal(true);
                              }}
                              className="px-5 py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition flex items-center gap-2"
                            >
                              <QrCode size={16} /> Scan QR Code
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setShowOTPModal(true);
                              }}
                              className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition flex items-center gap-2"
                            >
                              <Key size={16} /> Enter OTP Code
                            </button>
                          </div>
                        )}

                        {/* LEAVE REVIEW BUTTON ON COMPLETION */}
                        {b.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setShowReviewModal(true);
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition flex items-center gap-2"
                          >
                            <Star size={16} /> Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── VIEW 4: SECURITY VAULT ─── */}
        {activeView === 'security' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Security & Compliance Vault</h3>
                <p className="text-xs text-slate-500">KYC verification, OTP logs and QR verification records</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                <UserCheck className="text-emerald-600" size={28} />
                <div>
                  <span className="block text-xs font-bold text-slate-800">Identity KYC</span>
                  <span className="text-xs font-black text-emerald-600">APPROVED & VERIFIED</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                <FileText className="text-blue-600" size={28} />
                <div>
                  <span className="block text-xs font-bold text-slate-800">Passport Check</span>
                  <span className="text-xs font-black text-blue-600">PASSED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 1: REQUEST LUGGAGE SPACE ─── */}
        {showBookModal && selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 relative">
              <button onClick={() => setShowBookModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <h3 className="text-xl font-black text-slate-900">Send Baggage Request</h3>
              <p className="text-xs text-slate-500">
                {selectedListing.airline} ({selectedListing.flight_number}) • {selectedListing.departure_airport} → {selectedListing.arrival_airport}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Weight to Request (KG)</label>
                <input
                  type="number"
                  value={bookingWeight}
                  onChange={e => setBookingWeight(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes for Traveller A</label>
                <input
                  type="text"
                  placeholder="e.g. Carry-on size bag, fragile contents"
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-flyora-teal"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateBooking}
                  className="flex-1 py-3 rounded-2xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition shadow-md shadow-teal-500/20"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 2: VERIFY LUGGAGE (Traveller A) ─── */}
        {showVerifyModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 relative">
              <button onClick={() => setShowVerifyModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <h3 className="text-xl font-black text-slate-900">Verify Luggage</h3>
              <p className="text-xs text-slate-500">Upload bag images, weight & location verification timestamp</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Bag Image URL</label>
                <input
                  type="text"
                  value={verifyForm.bag_images}
                  onChange={e => setVerifyForm({ ...verifyForm, bag_images: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-flyora-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Measured Weight (KG)</label>
                <input
                  type="number"
                  value={verifyForm.weight}
                  onChange={e => setVerifyForm({ ...verifyForm, weight: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Verification Notes</label>
                <input
                  type="text"
                  value={verifyForm.notes}
                  onChange={e => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-flyora-teal"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyLuggageSubmit}
                className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
              >
                Submit Luggage Verification
              </button>
            </div>
          </div>
        )}

        {/* ─── MODAL 3: SCAN QR CODE (Traveller A) ─── */}
        {showQRModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-center relative">
              <button onClick={() => setShowQRModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <QrCode size={40} className="mx-auto text-flyora-teal" />
              <h3 className="text-xl font-black text-slate-900">Scan QR Code Token</h3>

              <input
                type="text"
                placeholder="Enter QR token (e.g. LUG-94A18F)"
                value={qrTokenInput}
                onChange={e => setQrTokenInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-center text-sm font-bold focus:outline-none focus:border-flyora-teal"
              />

              <button
                type="button"
                onClick={async () => {
                  await handleBookingAction(selectedBooking.id, 'verify_qr', { qr_code_token: qrTokenInput });
                  setShowQRModal(false);
                }}
                className="w-full py-3.5 rounded-2xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition"
              >
                Verify QR & Complete Sharing
              </button>
            </div>
          </div>
        )}

        {/* ─── MODAL 4: ENTER OTP CODE (Traveller A) ─── */}
        {showOTPModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-center relative">
              <button onClick={() => setShowOTPModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <Key size={40} className="mx-auto text-purple-600" />
              <h3 className="text-xl font-black text-slate-900">Enter 6-Digit OTP Code</h3>

              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 482910"
                value={otpInput}
                onChange={e => setOtpInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-center text-2xl font-black tracking-widest focus:outline-none focus:border-purple-600"
              />

              <button
                type="button"
                onClick={async () => {
                  await handleBookingAction(selectedBooking.id, 'verify_otp', { otp: otpInput });
                  setShowOTPModal(false);
                }}
                className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
              >
                Verify OTP & Complete Sharing
              </button>
            </div>
          </div>
        )}

        {/* ─── MODAL 5: LEAVE REVIEW ─── */}
        {showReviewModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 relative">
              <button onClick={() => setShowReviewModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <h3 className="text-xl font-black text-slate-900">Leave User Review</h3>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Rating: {reviewForm.rating} / 5</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewForm.rating}
                  onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  className="w-full"
                />

                <label className="block text-xs font-bold text-slate-700">Comment</label>
                <textarea
                  rows={3}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-flyora-teal"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleSubmitReview}
                className="w-full py-3.5 rounded-2xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition"
              >
                Submit Review
              </button>
            </div>
          </div>
        )}

        {/* ─── SUCCESS POPUP ─── */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-ping opacity-75"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#0D9488', '#10B981', '#6366F1', '#F59E0B', '#EC4899'][i % 5],
                    animationDuration: `${1.5 + Math.random()}s`
                  }}
                ></div>
              ))}
            </div>

            <div className="relative bg-white/95 rounded-3xl p-8 sm:p-10 max-w-lg w-full border border-teal-200 shadow-2xl text-center space-y-6 transform animate-bounce-short">
              <button onClick={() => setShowSuccessPopup(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <div className="w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200 shadow-lg shadow-teal-500/20">
                <CheckCircle2 size={44} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">🎉 Luggage Sharing Completed Successfully</h3>
                <div className="space-y-1 text-xs sm:text-sm font-bold text-teal-800 bg-teal-50/80 p-4 rounded-2xl border border-teal-100">
                  <p>✔ Payment Released Successfully</p>
                  <p>✔ Trust Score Updated</p>
                  <p>✔ Thank You For Using FlyoraGo</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                    setShowReviewModal(true);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-flyora-teal text-white font-black text-xs hover:bg-teal-600 transition shadow-md shadow-teal-500/20"
                >
                  Leave Your Review
                </button>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="py-3.5 px-5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default LuggageSharingPage;
