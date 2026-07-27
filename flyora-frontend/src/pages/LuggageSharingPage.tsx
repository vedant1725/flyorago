import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';
import {
  Luggage, Search, Plus, CheckCircle2, ShieldCheck, Clock, MapPin,
  QrCode, Camera, Scale, Star, ShieldAlert, Sparkles, DollarSign,
  ArrowRight, Plane, RefreshCw, UserCheck, FileText, Lock, ChevronRight,
  Info, ExternalLink, SlidersHorizontal, Award, Sparkle, ArrowUpRight, X, Bell
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
  listing_details?: LuggageListing;
  booker_details?: { first_name?: string; last_name?: string; email?: string };
  owner_details?: { first_name?: string; last_name?: string; email?: string };
  booked_weight: number;
  price_per_kg: number;
  total_price: number;
  insurance_fee: number;
  status: string;
  escrow_status: string;
  qr_code_token: string;
  meeting_time?: string;
  meeting_point?: string;
  terminal?: string;
  gate?: string;
  notes?: string;
}

const LuggageSharingPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<'marketplace' | 'host' | 'operations' | 'security'>('marketplace');

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

  // Search State
  const [searchParams, setSearchParams] = useState({
    departure_airport: '',
    arrival_airport: '',
    airline: '',
    flight_number: '',
    departure_date: '',
    needed_kg: '5'
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
    instant_booking: true,
    insurance: true,
    description: 'Verified traveller sharing extra luggage allowance.'
  });

  // Bookings State
  const [bookings, setBookings] = useState<LuggageBooking[]>([]);

  // Modals & Selected items
  const [selectedListing, setSelectedListing] = useState<LuggageListing | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<LuggageBooking | null>(null);
  const [bookingWeight, setBookingWeight] = useState('5');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Verification & Log State
  const [qrTokenInput, setQrTokenInput] = useState('');

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      const res = await apiFetch('/api/luggage/dashboard/');
      if (res.status === 'success' && res.data) {
        setStats(res.data);
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

  useEffect(() => {
    loadDashboard();
    loadBookings();
    handleSearch();
  }, []);

  // Calculated Available Weight in Host Form
  const calculatedAvailable = Math.max(
    0,
    (parseFloat(hostForm.max_airline_allowance) || 0) - (parseFloat(hostForm.currently_used_weight) || 0)
  );

  // Handle Host Publish Submit
  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseFloat(hostForm.currently_used_weight) > parseFloat(hostForm.max_airline_allowance)) {
      showToast('Currently used weight cannot exceed maximum airline allowance!', 'error');
      return;
    }

    try {
      const res = await apiFetch('/api/luggage/listings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hostForm,
          max_airline_allowance: parseFloat(hostForm.max_airline_allowance),
          currently_used_weight: parseFloat(hostForm.currently_used_weight),
          price_per_kg: parseFloat(hostForm.price_per_kg),
          min_kg: parseFloat(hostForm.min_kg),
          max_kg: parseFloat(hostForm.max_kg)
        })
      });

      if (res.status === 'success') {
        showToast('🎉 Luggage allowance published & saved successfully!', 'success');
        await loadDashboard();
        await handleSearch();
        setActiveView('marketplace');
      } else {
        showToast(res.message || 'Failed to publish listing', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error publishing listing', 'error');
    }
  };

  // Handle Booking Creation & Popup Modal Close
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
        showToast('🔒 Booking confirmed & Escrow held successfully!', 'success');
        setShowBookModal(false); // CLOSE MODAL IMMEDIATELY!
        setSelectedListing(null);
        setBookingNotes('');
        await loadBookings();
        await loadDashboard();
        await handleSearch(); // Re-search to remove booked listing from marketplace!
        setActiveView('operations'); // Move user to tracking view!
      } else {
        showToast(res.message || 'Booking creation failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating booking', 'error');
    }
  };

  // Handle Booking Action
  const handleBookingAction = async (bookingId: number, action: string) => {
    try {
      const res = await apiFetch(`/api/luggage/bookings/${bookingId}/action/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.status === 'success') {
        showToast(`Action '${action}' completed successfully!`, 'success');
        await loadBookings();
        await loadDashboard();
        await handleSearch(); // Re-search marketplace to exclude accepted listing if full
      } else {
        showToast(res.message || 'Action failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating booking', 'error');
    }
  };

  // Verify QR Scan (Lookup by input token or selected booking)
  const handleVerifyQR = async () => {
    const token = qrTokenInput.trim() || selectedBooking?.qr_code_token;
    if (!token) {
      showToast('Please enter or scan a valid QR token (e.g. LUG-D9A69839D83D)', 'error');
      return;
    }
    try {
      const url = selectedBooking?.id
        ? `/api/luggage/bookings/${selectedBooking.id}/verify-qr/`
        : `/api/luggage/verify-qr/`;

      const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code_token: token,
          selfie_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          latitude: 40.6413,
          longitude: -73.7781,
          device_hash: 'DEV-IPHONE15-PASSPORT-VERIFIED'
        })
      });

      if (res.status === 'success') {
        showToast('✅ QR Token Verified! Airport bag handover confirmed.', 'success');
        setQrTokenInput('');
        await loadBookings();
        await loadDashboard();
        setActiveView('operations'); // Move user directly to Operations Tracker!
      } else {
        showToast(res.message || 'QR verification failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error verifying QR', 'error');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar activeItem="Luggage Sharing" />

      <main className="flex-1 min-w-0 w-full max-w-full lg:ml-[240px] pb-24 lg:pb-12 px-3 sm:px-8 pt-6 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        
        {/* ─── GOOGLE-GRADE CLEAN WHITE HERO HEADER ─── */}
        <div className="relative rounded-3xl bg-white p-4 sm:p-8 border border-slate-200 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck size={14} className="text-teal-600" /> Google-Grade Verified Baggage Platform
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
                Luggage <span className="text-flyora-teal">Sharing Marketplace</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Connect directly with verified travellers on your exact flight to rent or monetize spare baggage allowance. Escrow protected with QR verification.
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
                <Plus size={16} /> Host Baggage Allowance
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
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Trips</span>
              <div className="text-lg font-black text-purple-600 mt-0.5">{stats.current_trips.length}</div>
            </div>
          </div>
        </div>

        {/* ─── SEGMENTED SUB-NAVIGATION TABS ─── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'marketplace', label: 'Flight Marketplace & AI Match', icon: Search },
            { id: 'host', label: 'Host Baggage Allowance', icon: Plus },
            { id: 'operations', label: 'Operations & Escrow Tracker', icon: Clock },
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

        {/* ─── VIEW 1: GOOGLE FLIGHTS STYLE CLEAN MARKETPLACE & AI MATCH ─── */}
        {activeView === 'marketplace' && (
          <div className="space-y-8">
            
            {/* Google Flights Style Search Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Search Flight Luggage Space</h3>
                  <p className="text-xs text-slate-500">Match with travellers on your flight route with AI verification</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full">
                  <Sparkles size={14} /> AI Route Matcher Enabled
                </div>
              </div>

              {/* Preset Airline Quick Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 mr-2">Top Airlines:</span>
                {['Emirates', 'Qatar Airways', 'Air India', 'British Airways', 'Lufthansa', 'Delta'].map(air => (
                  <button
                    key={air}
                    type="button"
                    onClick={() => {
                      setSearchParams({ ...searchParams, airline: air });
                      handleSearch();
                    }}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                      searchParams.airline === air
                        ? 'bg-teal-50 border-teal-300 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ✈️ {air}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Departure Airport</label>
                  <input
                    type="text"
                    placeholder="e.g. JFK or New York"
                    value={searchParams.departure_airport}
                    onChange={e => setSearchParams({ ...searchParams, departure_airport: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Arrival Airport</label>
                  <input
                    type="text"
                    placeholder="e.g. DXB or Dubai"
                    value={searchParams.arrival_airport}
                    onChange={e => setSearchParams({ ...searchParams, arrival_airport: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Flight Number</label>
                  <input
                    type="text"
                    placeholder="e.g. EK202"
                    value={searchParams.flight_number}
                    onChange={e => setSearchParams({ ...searchParams, flight_number: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Airline</label>
                  <input
                    type="text"
                    placeholder="e.g. Emirates"
                    value={searchParams.airline}
                    onChange={e => setSearchParams({ ...searchParams, airline: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Needed Weight (KG)</label>
                  <input
                    type="number"
                    value={searchParams.needed_kg}
                    onChange={e => setSearchParams({ ...searchParams, needed_kg: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition flex items-center justify-center gap-2 shadow-md shadow-teal-500/20"
                  >
                    {isSearching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                    <span>AI Search</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-base">Matching Luggage Hosts ({searchResults.length})</h4>
                <span className="text-xs font-bold text-slate-400">Sorted by AI Match Percentage</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                  <Plane size={44} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-base font-bold text-slate-700">No luggage listings match your search criteria right now.</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing airport keywords or host your own baggage allowance!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {searchResults.map(listing => (
                    <div key={listing.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-flyora-teal shadow-sm hover:shadow-md transition relative overflow-hidden group">
                      
                      {/* AI Match Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-black">
                        <Sparkles size={13} />
                        <span>{listing.ai_match_badge || '98% Match'}</span>
                      </div>

                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-black text-lg border border-teal-100">
                          {listing.owner_details?.first_name ? listing.owner_details.first_name[0] : 'T'}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{listing.owner_details?.first_name || 'Verified Traveller'}</h5>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center text-amber-500 font-bold"><Star size={12} fill="currentColor" className="mr-0.5" /> 4.9</span>
                            <span>• Passport & KYC Verified</span>
                          </div>
                        </div>
                      </div>

                      {/* Flight Route Banner */}
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
                          <span>Cabin: {listing.cabin_class}</span>
                        </div>
                      </div>

                      {/* Weight Progress Bar */}
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
                        <Luggage size={16} /> Rent Luggage Space
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── VIEW 2: HOST BAGGAGE ALLOWANCE ─── */}
        {activeView === 'host' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Host Your Unused Baggage Allowance</h3>
                <p className="text-xs text-slate-500">List spare weight & get paid securely via Escrow</p>
              </div>
            </div>

            <form onSubmit={handleHostSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Airline Name</label>
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

              {/* Weight Allowance Rule Box */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Allowance (KG)</label>
                    <input
                      type="number"
                      required
                      value={hostForm.max_airline_allowance}
                      onChange={e => setHostForm({ ...hostForm, max_airline_allowance: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Currently Used (KG)</label>
                    <input
                      type="number"
                      required
                      value={hostForm.currently_used_weight}
                      onChange={e => setHostForm({ ...hostForm, currently_used_weight: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-teal-700 mb-1.5">Available (Calculated)</label>
                    <div className="w-full px-4 py-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 font-black text-sm">
                      {calculatedAvailable} KG Available
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
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Booking KG</label>
                    <input
                      type="number"
                      required
                      value={hostForm.min_kg}
                      onChange={e => setHostForm({ ...hostForm, min_kg: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Booking KG</label>
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

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hostForm.accept_partial_booking}
                    onChange={e => setHostForm({ ...hostForm, accept_partial_booking: e.target.checked })}
                    className="w-4 h-4 text-flyora-teal rounded"
                  />
                  <span>Accept Partial KG</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hostForm.instant_booking}
                    onChange={e => setHostForm({ ...hostForm, instant_booking: e.target.checked })}
                    className="w-4 h-4 text-flyora-teal rounded"
                  />
                  <span>Instant Booking ON</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hostForm.insurance}
                    onChange={e => setHostForm({ ...hostForm, insurance: e.target.checked })}
                    className="w-4 h-4 text-flyora-teal rounded"
                  />
                  <span>Insurance Protection</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-flyora-teal text-white font-bold text-sm hover:bg-teal-600 transition shadow-md shadow-teal-500/20"
              >
                Publish Baggage Allowance
              </button>
            </form>
          </div>
        )}

        {/* ─── VIEW 3: OPERATIONS & ESCROW TRACKER ─── */}
        {activeView === 'operations' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">Active Operations & Escrow Status</h3>

            {bookings.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                <Clock size={44} className="mx-auto text-slate-300 mb-3" />
                <p className="text-base font-bold text-slate-700">No active luggage sharing bookings currently found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-slate-400">Booking #{booking.id}</span>
                          <span className="px-3 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-black border border-teal-100">
                            {booking.status}
                          </span>
                          <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-black border border-purple-100">
                            Escrow: {booking.escrow_status}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900">
                          ✈️ {booking.listing_details?.airline} ({booking.listing_details?.flight_number}) • {booking.booked_weight} KG
                        </h4>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-600">${booking.total_price}</div>
                        <span className="text-xs text-slate-400 font-bold">${booking.price_per_kg} / KG</span>
                      </div>
                    </div>

                    {/* Timeline Pipeline */}
                    <div>
                      <span className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-wider">Flight Handover Progress</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {['REQUESTED', 'ACCEPTED', 'AIRPORT_MEETING', 'BAG_RECEIVED', 'IN_FLIGHT', 'ARRIVED', 'COMPLETED'].map((st, idx) => {
                          const currentIdx = ['REQUESTED', 'ACCEPTED', 'AIRPORT_MEETING', 'BAG_RECEIVED', 'IN_FLIGHT', 'ARRIVED', 'COMPLETED'].indexOf(booking.status);
                          const isDone = idx <= currentIdx;
                          return (
                            <div key={st} className={`p-2.5 rounded-xl text-center border transition ${
                              isDone ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              <div className="text-[9px] uppercase tracking-wider">{st.replace('_', ' ')}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions for All Lifecycle Stages */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowMeetingModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1.5"
                      >
                        <QrCode size={14} /> Airport Meeting & QR Code
                      </button>

                      {booking.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'accept')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                          >
                            Accept Request
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
                          >
                            Reject Request
                          </button>
                        </>
                      )}

                      {(booking.status === 'ACCEPTED' || booking.status === 'AIRPORT_MEETING') && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setQrTokenInput(booking.qr_code_token);
                            handleVerifyQR();
                          }}
                          className="px-4 py-2.5 rounded-xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                        >
                          <Camera size={14} /> Validate Handover & Scan Token
                        </button>
                      )}

                      {booking.status === 'BAG_RECEIVED' && (
                        <button
                          onClick={() => handleBookingAction(booking.id, 'in_flight')}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                        >
                          <Plane size={14} /> Confirm Flight Departure (In Flight)
                        </button>
                      )}

                      {booking.status === 'IN_FLIGHT' && (
                        <button
                          onClick={() => handleBookingAction(booking.id, 'arrived')}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                        >
                          <CheckCircle2 size={14} /> Confirm Flight Arrival
                        </button>
                      )}

                      {booking.status === 'ARRIVED' && (
                        <button
                          onClick={() => handleBookingAction(booking.id, 'confirm_delivery')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <CheckCircle2 size={15} /> Confirm Destination & Release Escrow
                        </button>
                      )}

                      {booking.status === 'COMPLETED' && (
                        <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Sharing Completed & Escrow Released
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── VIEW 4: SECURITY & VERIFICATION VAULT ─── */}
        {activeView === 'security' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Trust & Compliance Vault</h3>
                <p className="text-xs text-slate-500">Passport, KYC, GPS validation & QR verification audit</p>
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
                  <span className="block text-xs font-bold text-slate-800">Passport Verification</span>
                  <span className="text-xs font-black text-blue-600">PASSED</span>
                </div>
              </div>
            </div>

            {/* QR Token Verification Test */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <QrCode size={18} className="text-flyora-teal" /> Execute Airport QR Verification
              </h4>
              <input
                type="text"
                placeholder="Scan or enter QR token (e.g. LUG-A1B2C3D4)"
                value={qrTokenInput}
                onChange={e => setQrTokenInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-flyora-teal"
              />
              <button
                type="button"
                onClick={handleVerifyQR}
                className="w-full py-3.5 rounded-2xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition"
              >
                Validate Handover & Scan Token
              </button>
            </div>
          </div>
        )}

        {/* ─── MODAL: BOOK LUGGAGE SPACE (FIXED POPUP CLOSING & DATA SAVE) ─── */}
        {showBookModal && selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 relative">
              <button
                onClick={() => setShowBookModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-black text-slate-900">Rent Luggage Allowance</h3>
              <p className="text-xs text-slate-500">
                {selectedListing.airline} ({selectedListing.flight_number}) • {selectedListing.departure_airport} → {selectedListing.arrival_airport}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Weight to Book (KG)</label>
                <input
                  type="number"
                  value={bookingWeight}
                  onChange={e => setBookingWeight(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-flyora-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes / Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Suitcase size, fragile items, etc."
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-flyora-teal"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Price Per KG:</span>
                  <span className="font-bold text-slate-800">${selectedListing.price_per_kg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Insurance Protection:</span>
                  <span className="font-bold text-slate-800">$5.00</span>
                </div>
                <div className="flex justify-between text-sm font-black text-flyora-teal pt-2 border-t border-slate-200">
                  <span>Escrow Hold Total:</span>
                  <span>${(parseFloat(bookingWeight || '1') * selectedListing.price_per_kg + 5).toFixed(2)}</span>
                </div>
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
                  Confirm & Lock Escrow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: AIRPORT MEETING DETAILS ─── */}
        {showMeetingModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-center relative">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-100">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Airport Handover QR Token</h3>

              <div className="p-4 bg-slate-900 text-teal-300 rounded-2xl font-mono text-base tracking-widest border border-slate-800">
                {selectedBooking.qr_code_token}
              </div>

              <div className="text-xs text-left bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200 text-slate-700">
                <div><strong>Meeting Point:</strong> {selectedBooking.meeting_point || 'Terminal 1 Main Info Counter'}</div>
                <div><strong>Terminal & Gate:</strong> {selectedBooking.terminal || 'T1'} | {selectedBooking.gate || 'Gate A4'}</div>
                <div><strong>Flight:</strong> {selectedBooking.listing_details?.airline} ({selectedBooking.listing_details?.flight_number})</div>
              </div>

              <button
                type="button"
                onClick={() => setShowMeetingModal(false)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default LuggageSharingPage;
