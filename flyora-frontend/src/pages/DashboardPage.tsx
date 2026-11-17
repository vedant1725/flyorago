import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import {
  Plane, Package, RotateCcw, Star, ArrowRight, Search, X, Calendar, Luggage
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { FoldedMapIllustration } from '../components/ui/FoldedMapIllustration';
import { WelcomeToFlyoraModal } from '../components/common/WelcomeToFlyoraModal';
import { useSocket } from '../context/SocketContext';
import { useFlyoraAI } from '../context/FlyoraAIContext';

// ⚡ Ultra-fast Module-level In-Memory Cache (0ms Instant Load)
let fastCache = {
  trips: null as any[] | null,
  bookings: null as any[] | null,
  trust: null as any | null,
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { validateAction, isModalOpen, closeModal, kycStatus } = useKycValidation();
  const rawUserId = localStorage.getItem('flyora_user_id');
  const userId = (rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null') ? rawUserId : (localStorage.getItem('flyora_access_token') ? 'authenticated_user' : null);
  const rawUserName = localStorage.getItem('flyora_user_name') || 'Vedant';
  const firstName = rawUserName.split(' ')[0] || 'Vedant';
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('flyora_access_token'));

  // Initialize from In-Memory Cache (0ms load) or localStorage fallback
  const [trips, setTrips] = useState<any[]>(() => {
    if (fastCache.trips) return fastCache.trips;
    try { return JSON.parse(localStorage.getItem('flyora_cache_trips') || '[]'); } catch { return []; }
  });
  const [bookings, setBookings] = useState<any[]>(() => {
    if (fastCache.bookings) return fastCache.bookings;
    try { return JSON.parse(localStorage.getItem('flyora_cache_bookings') || '[]'); } catch { return []; }
  });
  const [trustProfile, setTrustProfile] = useState<any>(() => {
    if (fastCache.trust) return fastCache.trust;
    try { return JSON.parse(localStorage.getItem('flyora_cache_trust') || 'null'); } catch { return null; }
  });

  const [loading, setLoading] = useState<boolean>(() => !fastCache.trips && !localStorage.getItem('flyora_cache_trips'));

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Welcome modal on login (showing team photo & FlyoraGo details)
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    return sessionStorage.getItem('flyora_show_welcome') === 'true';
  });

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    sessionStorage.removeItem('flyora_show_welcome');
    sessionStorage.setItem('flyora_welcome_seen', 'true');
  };

  // Helper to extract array from any API response format
  const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.results)) return res.results;
    if (res.data && Array.isArray(res.data.results)) return res.data.results;
    return [];
  };

  const { lastMessage } = useSocket();

  const loadData = useCallback((isMounted = true) => {
    apiFetch('/api/user/dashboard-overview/')
      .then(res => {
        if (!isMounted) return;
        let data = res?.data || res;
        if (data?.data && (Array.isArray(data.data.trips) || data.data.trustProfile)) {
          data = data.data;
        }
        if (data) {
          if (Array.isArray(data.trips)) {
            setTrips(data.trips);
            fastCache.trips = data.trips;
            try { localStorage.setItem('flyora_cache_trips', JSON.stringify(data.trips)); } catch { }
          }
          if (Array.isArray(data.bookings)) {
            setBookings(data.bookings);
            fastCache.bookings = data.bookings;
            try { localStorage.setItem('flyora_cache_bookings', JSON.stringify(data.bookings)); } catch { }
          }
          if (data.trustProfile && typeof data.trustProfile.score === 'number') {
            setTrustProfile(data.trustProfile);
            fastCache.trust = data.trustProfile;
            try { localStorage.setItem('flyora_cache_trust', JSON.stringify(data.trustProfile)); } catch { }
          }
          if (data.kycStatus) {
            try { localStorage.setItem('flyora_kyc_status', data.kycStatus); } catch { }
          }
        }
      })
      .catch(() => { })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
  }, []);

  const { openAI } = useFlyoraAI();

  useEffect(() => {
    if (!userId && !hasToken) { navigate('/login'); return; }

    let isMounted = true;
    loadData(isMounted);

    // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Close search dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId, hasToken, navigate, loadData]);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;
    try {
      if (['booking_request', 'booking_accepted', 'booking_confirmed', 'trip_created', 'trust_score_updated'].includes(lastMessage.type)) {
        loadData(true);
      }
    } catch { }
  }, [lastMessage, loadData]);

  const safeTrips = useMemo(() => extractArray(trips), [trips]);
  const safeBookings = useMemo(() => extractArray(bookings), [bookings]);

  // Separate Traveler Trips vs Sender Requests
  const travelerTrips = useMemo(() => {
    return safeTrips.filter((t: any) => t?.airline !== 'SENDER_REQUEST');
  }, [safeTrips]);

  const senderRequests = useMemo(() => {
    return safeTrips.filter((t: any) => t?.airline === 'SENDER_REQUEST');
  }, [safeTrips]);

  // Sender bookings
  const senderBookings = useMemo(() => {
    return safeBookings.filter((b: any) => {
      const sId = b?.sender?.id || b?.sender_id || (typeof b?.sender === 'string' ? b.sender : null);
      return sId === userId || b?.sender_trip || b?.role === 'sender';
    });
  }, [safeBookings, userId]);

  // Active trip calculation (from traveler trips first, or active sender trip)
  const activeTrip = useMemo(() => {
    const foundTraveler = travelerTrips.find((t: any) => {
      const s = String(t?.status || '').toUpperCase().trim();
      return s === 'ACTIVE' || s === 'IN_TRANSIT' || s === 'CONFIRMED';
    });
    if (foundTraveler) return foundTraveler;

    // Fallback to active sender request if user only has sender trip
    const foundSender = senderRequests.find((t: any) => {
      const s = String(t?.status || '').toUpperCase().trim();
      return s === 'ACTIVE' || s === 'IN_TRANSIT' || s === 'CONFIRMED';
    });
    if (foundSender) return foundSender;

    return travelerTrips[0] || null;
  }, [travelerTrips, senderRequests]);

  // Upcoming trips list
  const upcomingTrips = useMemo(() => {
    return travelerTrips.filter((t: any) => t?.id !== activeTrip?.id).slice(0, 3);
  }, [travelerTrips, activeTrip]);

  // Counts
  const totalTrips = travelerTrips.length;
  const totalSender = senderRequests.length;

  const pendingBookings = useMemo(() => {
    return senderRequests.filter((r: any) => {
      const st = (r.status || 'Active').toLowerCase();
      return st === 'active' || st === 'pending';
    }).length;
  }, [senderRequests]);

  // Trust score calculations
  const score = trustProfile?.score ?? 695;
  const circumference = 2 * Math.PI * 42;
  const scorePercent = Math.min(Math.max(score / 1000, 0), 1);
  const strokeDashoffset = circumference * (1 - scorePercent);

  // Search items Memoized
  const allItems = useMemo(() => [
    ...travelerTrips.map((t: any) => ({ type: 'Trip', label: `${t?.from_location || ''} → ${t?.to_location || ''}`, sub: t?.departure_date || '', route: '/traveler', icon: '✈️' })),
    ...senderRequests.map((r: any) => ({ type: 'Sender Request', label: `${r?.from_location || ''} → ${r?.to_location || ''}`, sub: `${r?.capacity_weight || 1} KG · ${r?.departure_date || ''}`, route: '/sender', icon: '📦' })),
    ...senderBookings.map((b: any) => ({ type: 'Booking', label: b?.package_name || `Booking #${b?.id}`, sub: b?.status?.replace(/_/g, ' ') || '', route: '/sender', icon: '📦' })),
    { type: 'Page', label: 'Trust Score', sub: 'AI Powered Rating', route: '/trust', icon: '⭐' },
    { type: 'Page', label: 'My Wallet', sub: 'Balance & Transactions', route: '/wallet', icon: '💳' },
    { type: 'Page', label: 'KYC Verification', sub: 'Identity Documents', route: '/kyc', icon: '✅' },
    { type: 'Page', label: 'Settings', sub: 'Profile & Preferences', route: '/settings', icon: '⚙️' },
    { type: 'Page', label: 'Notifications', sub: 'Alerts & Updates', route: '/notifications', icon: '🔔' },
  ], [travelerTrips, senderRequests, senderBookings]);

  const searchResults = useMemo(() => {
    return searchQuery.trim().length >= 1
      ? allItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sub?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
      : [];
  }, [searchQuery, allItems]);

  if (!userId && !hasToken) return null;

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar activeItem="Dashboard" />

      <main className="flex-1 min-w-0 w-full lg:ml-[240px] flex flex-col min-h-screen relative pb-20 lg:pb-12">

        {/* ─── Elegant Subtle Flyora Teal Wave Gradient in Background ─── */}
        <div className="absolute top-0 right-0 w-full h-[460px] overflow-hidden pointer-events-none -z-0">
          <svg className="w-full h-full" viewBox="0 0 1440 460" fill="none" preserveAspectRatio="none">
            <path
              d="M620 0 C860 130, 1120 40, 1440 140 L1440 0 Z"
              fill="#F0FDFA"
              fillOpacity="0.75"
            />
            <path
              d="M450 0 C680 180, 1020 200, 1440 70 L1440 0 Z"
              fill="#CCFBF1"
              fillOpacity="0.4"
            />
          </svg>
        </div>

        {/* ─── Top Header with Global Search ─── */}
        <header className="flex h-20 items-center justify-between px-4 sm:px-8 xl:px-10 shrink-0 gap-4 sm:gap-6 relative z-30">

          {/* Global Search Pill */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div
              className={`flex items-center gap-3 bg-white border rounded-full px-4 py-2.5 shadow-[0_2px_8px_rgba(10,22,40,0.02)] transition-all duration-200 ${
                searchFocused ? 'border-flyora-teal ring-2 ring-flyora-teal/15 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Search size={16} className={`shrink-0 transition-colors ${searchFocused ? 'text-flyora-teal' : 'text-slate-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search trips, bookings, pages..."
                className="flex-1 bg-transparent text-sm text-slate-800 font-medium border-0 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 placeholder:text-slate-400"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={14} />
                </button>
              ) : (
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full select-none">
                  Ctrl K
                </span>
              )}
            </div>

            {/* Search Results Dropdown - Only shown when typing! */}
            {searchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { navigate(item.route); setSearchFocused(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors w-full"
                      >
                        <span className="text-base flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{item.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">{item.type}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs font-medium text-slate-400">
                    No results for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header: Notification + Profile */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        {/* ─── Dashboard Body Content ─── */}
        <div className="px-4 sm:px-8 xl:px-10 space-y-6 sm:space-y-8 relative z-20">

          {/* ─── Top Section: Welcome Back & 4 Metric Cards (Balanced 12-col Grid) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch pt-2">

            {/* Left: Welcome Greeting (3 cols) */}
            <div className="sm:col-span-2 lg:col-span-3 flex flex-col justify-center">
              <h2 className="text-slate-800 text-xl sm:text-2xl font-bold leading-tight">
                Welcome Back,
              </h2>
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-flyora-teal-dark tracking-tight leading-none mt-1">
                {firstName}!
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2 leading-relaxed">
                Manage your trips and track your activity easily.
              </p>
            </div>

            {/* Card 1: Trust Score Card (3 cols) */}
            <div
              onClick={() => navigate('/trust')}
              className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-slate-100/90 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer flex items-center gap-3.5 xl:gap-4 group"
            >
              {/* Score Circular Gauge */}
              <div className="relative w-18 h-18 lg:w-20 lg:h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#0D9488"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900 leading-none">{score}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">/1000</span>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1.5 text-flyora-teal">
                  <Star size={15} strokeWidth={2.2} className="shrink-0" />
                  <span className="text-slate-900 font-extrabold text-sm lg:text-base truncate">Trust Score</span>
                </div>
                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">AI Powered • Live</p>
                <span className="text-flyora-teal hover:text-teal-700 font-bold text-xs mt-2 flex items-center gap-1">
                  → View Details
                </span>
              </div>
            </div>

            {/* Card 2: Active Trips Card (2 cols) */}
            <div
              onClick={() => validateAction(() => navigate('/traveler'))}
              className="sm:col-span-1 lg:col-span-2 bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-slate-100/90 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-teal-50 text-flyora-teal flex items-center justify-center mb-3">
                <Plane size={18} className="transform -rotate-45" />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {totalTrips.toString().padStart(2, '0')}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1.5 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-flyora-teal shrink-0"></span>
                  <span className="truncate">{totalTrips} Active</span>
                </div>
              </div>
            </div>

            {/* Card 3: Pending Card (2 cols) */}
            <div
              onClick={() => validateAction(() => navigate('/sender'))}
              className="sm:col-span-1 lg:col-span-2 bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-slate-100/90 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-teal-50 text-flyora-teal flex items-center justify-center mb-3">
                <Package size={18} />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {pendingBookings.toString().padStart(2, '0')}
                </div>
                <div className="text-xs font-semibold text-amber-600 mt-1.5 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="truncate">{pendingBookings} Pending</span>
                </div>
              </div>
            </div>

            {/* Card 4: Rejected Card (2 cols) */}
            <div
              onClick={() => validateAction(() => navigate('/sender'))}
              className="sm:col-span-1 lg:col-span-2 bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-slate-100/90 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-teal-50 text-flyora-teal flex items-center justify-center mb-3">
                <RotateCcw size={18} />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  00
                </div>
                <div className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="truncate">0 Rejected</span>
                </div>
              </div>
            </div>

          </div>

          {/* ─── Main Section: Active Trip Overview Card ─── */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-100/90 shadow-[0_4px_25px_rgba(10,22,40,0.02)] relative">
            
            {/* Header of Active Trip Overview */}
            <div className="flex items-center justify-between pb-6 sm:pb-8">
              <div className="flex items-center gap-3">
                <span className="w-1 h-5 bg-flyora-teal rounded-full inline-block shrink-0"></span>
                <div>
                  <h3 className="text-slate-900 text-base sm:text-lg font-black tracking-tight">Active Trip Overview</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">Real-time status of your current journey</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/traveler')}
                className="text-flyora-teal hover:text-teal-700 font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors group"
              >
                <span>View All</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Content: Active Trip or Exact No Active Trips State */}
            {activeTrip ? (
              <div
                onClick={() => navigate(activeTrip.airline === 'SENDER_REQUEST' ? `/booking/${activeTrip.id}` : `/trip/${activeTrip.id}`)}
                className="bg-gradient-to-br from-flyora-teal to-teal-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl hover:scale-[1.006] transition-all group"
                title="Click to view trip details & requests"
              >
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                      <span>Active Journey</span>
                      <span>•</span>
                      <span>{activeTrip.departure_date}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-teal-200 text-xs font-bold uppercase">From</p>
                        <p className="text-xl sm:text-2xl font-black mt-0.5">{activeTrip.from_location}</p>
                      </div>
                      <div className="w-12 h-0.5 bg-white/30 relative">
                        <Plane size={16} className="absolute left-1/2 -top-2 -translate-x-1/2 rotate-90" />
                      </div>
                      <div>
                        <p className="text-teal-200 text-xs font-bold uppercase">To</p>
                        <p className="text-xl sm:text-2xl font-black mt-0.5">{activeTrip.to_location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/15 p-4 sm:p-6 rounded-2xl border border-white/10 text-right">
                    <p className="text-teal-200 text-xs font-bold uppercase">Available Space</p>
                    <p className="text-2xl font-black mt-0.5">{activeTrip.available_weight} <span className="text-sm font-normal text-white/70">/ {activeTrip.capacity_weight} KG</span></p>
                  </div>
                </div>
              </div>
            ) : (
              /* Exact Map Illustration & Empty State from Screenshot in Flyora Brand Colors */
              <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center">
                <FoldedMapIllustration />

                <h4 className="text-slate-900 text-lg sm:text-xl font-black mt-6 mb-2">
                  No Active Trips
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                  Register your upcoming travel schedule to start monitoring your active baggage space.
                </p>
                <button
                  onClick={() => validateAction(() => navigate('/traveler/new'))}
                  className="px-7 py-3 rounded-xl sm:rounded-2xl bg-flyora-teal hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all transform active:scale-95 flex items-center gap-2"
                >
                  <span>+ Post a New Trip</span>
                </button>
              </div>
            )}
          </div>

          {/* ─── Upcoming Trips Grid ─── */}
          {upcomingTrips.length > 0 && (
            <div className="pt-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-slate-900 text-base sm:text-lg font-black">Upcoming Trips</h3>
                  <p className="text-slate-400 text-xs">Your scheduled journeys</p>
                </div>
                <button
                  onClick={() => navigate('/traveler')}
                  className="text-xs font-bold text-flyora-teal hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingTrips.map((trip: any) => (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Calendar size={14} className="text-flyora-teal" />
                        <span>{trip.departure_date}</span>
                      </div>
                      <span className="text-[10px] font-black text-flyora-teal bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                        {trip.available_weight} KG
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                      <span className="truncate max-w-[40%]">{trip.from_location}</span>
                      <Plane size={14} className="text-slate-400 rotate-90 shrink-0" />
                      <span className="truncate max-w-[40%] text-right">{trip.to_location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <KycValidationModal isOpen={isModalOpen} onClose={closeModal} kycStatus={kycStatus} />
      <WelcomeToFlyoraModal isOpen={showWelcomeModal} onClose={handleCloseWelcomeModal} />
    </div>
  );
};

export default DashboardPage;
