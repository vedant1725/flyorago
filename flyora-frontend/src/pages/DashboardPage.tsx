import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Plane, Package, ShieldCheck, TrendingUp, ArrowRight, ChevronRight, Search, X } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { useSocket } from '../context/SocketContext';

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
  const userEmail = localStorage.getItem('flyora_user_email') || localStorage.getItem('flyora_admin_email');
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

  // Loading state is ONLY true if we have zero cached data
  const [loading, setLoading] = useState<boolean>(() => !fastCache.trips && !localStorage.getItem('flyora_cache_trips'));

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
            try { localStorage.setItem('flyora_cache_trips', JSON.stringify(data.trips)); } catch {}
          }
          if (Array.isArray(data.bookings)) {
            setBookings(data.bookings);
            fastCache.bookings = data.bookings;
            try { localStorage.setItem('flyora_cache_bookings', JSON.stringify(data.bookings)); } catch {}
          }
          if (data.trustProfile && typeof data.trustProfile.score === 'number') {
            setTrustProfile(data.trustProfile);
            fastCache.trust = data.trustProfile;
            try { localStorage.setItem('flyora_cache_trust', JSON.stringify(data.trustProfile)); } catch {}
          }
          if (data.kycStatus) {
            try { localStorage.setItem('flyora_kyc_status', data.kycStatus); } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!userId && !hasToken) { navigate('/login'); return; }

    let isMounted = true;
    loadData(true);

    return () => { isMounted = false; };
  }, [userId, hasToken, navigate, loadData]);

  useEffect(() => {
    if (lastMessage && lastMessage.type && lastMessage.type !== 'ping') {
      loadData(true);
    }
  }, [lastMessage, loadData]);

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Safe Array Wrappers to prevent any runtime rendering crashes
  const safeTrips = useMemo(() => (Array.isArray(trips) ? trips : []), [trips]);
  const safeBookings = useMemo(() => (Array.isArray(bookings) ? bookings : []), [bookings]);

  // Separate Traveler Trips vs Sender Requests
  const travelerTrips = useMemo(() => {
    return safeTrips.filter((t: any) => t && t.airline !== 'SENDER_REQUEST');
  }, [safeTrips]);

  const senderRequests = useMemo(() => {
    return safeTrips.filter((t: any) => t && t.airline === 'SENDER_REQUEST');
  }, [safeTrips]);

  const senderBookings = useMemo(() => {
    return safeBookings.filter((b: any) => {
      if (!b) return false;
      const senderId = typeof b.sender === 'object' ? b.sender?.id : b.sender;
      return String(senderId) === String(userId);
    });
  }, [safeBookings, userId]);

  // Live stats Memoized (100% Synchronized with Sender Page & Traveler Page)
  const totalTrips = travelerTrips.length;
  const totalSender = senderRequests.length > 0 ? senderRequests.length : senderBookings.length;

  const pendingBookings = useMemo(() => {
    if (senderRequests.length > 0) {
      return senderRequests.filter((r: any) => r.status === 'Active' || r.status === 'REQUEST_SENT' || r.status === 'Pending').length;
    }
    return senderBookings.filter((b: any) => ['REQUEST_SENT', 'REQUEST_CREATED', 'MATCH_FOUND', 'ACCEPTED', 'PAID', 'Waiting Traveller', 'Booking Requested', 'Payment Pending'].includes(b.status)).length;
  }, [senderRequests, senderBookings]);

  const deliveredBookings = useMemo(() => {
    if (senderRequests.length > 0) {
      return senderRequests.filter((r: any) => r.status === 'Completed' || r.status === 'DELIVERED').length;
    }
    return senderBookings.filter((b: any) => ['DELIVERED', 'PAYMENT_RELEASED', 'RATED', 'Completed', 'Delivered'].includes(b.status)).length;
  }, [senderRequests, senderBookings]);

  const activeTrip = useMemo(() => (travelerTrips.length > 0 ? travelerTrips[0] : null), [travelerTrips]);
  const upcomingTrips = useMemo(() => travelerTrips.slice(1, 4), [travelerTrips]);

  // Trust helpers Memoized
  const score = trustProfile?.score ?? 550;
  const level = trustProfile?.level ?? 'STANDARD';
  const circumference = 2 * Math.PI * 36;
  const scorePercent = Math.round((score / 1000) * 100);

  const levelConfig: Record<string, { color: string; bg: string; label: string; ringColor: string }> = {
    ELITE: { color: '#059669', bg: 'bg-emerald-50', label: 'Elite', ringColor: '#34d399' },
    PLATINUM: { color: '#2563eb', bg: 'bg-blue-50', label: 'Platinum', ringColor: '#60a5fa' },
    GOLD: { color: '#d97706', bg: 'bg-amber-50', label: 'Gold', ringColor: '#fbbf24' },
    SILVER: { color: '#475569', bg: 'bg-slate-100', label: 'Silver', ringColor: '#94a3b8' },
    STANDARD: { color: '#6b7280', bg: 'bg-gray-50', label: 'Standard', ringColor: '#d1d5db' },
    HIGH_RISK: { color: '#dc2626', bg: 'bg-red-50', label: 'High Risk', ringColor: '#f87171' },
  };
  const lc = levelConfig[level] || levelConfig['STANDARD'];

  // All searchable items Memoized
  const allItems = useMemo(() => [
    ...safeTrips.map((t: any) => ({ type: 'Trip', label: `${t?.from_location || ''} → ${t?.to_location || ''}`, sub: t?.departure_date || '', route: '/traveler', icon: '✈️' })),
    ...senderBookings.map((b: any) => ({ type: 'Booking', label: b?.package_name || `Booking #${b?.id}`, sub: b?.status?.replace(/_/g, ' ') || '', route: '/sender', icon: '📦' })),
    { type: 'Page', label: 'Trust Score', sub: 'AI Powered Rating', route: '/trust', icon: '🛡️' },
    { type: 'Page', label: 'My Wallet', sub: 'Balance & Transactions', route: '/wallet', icon: '💳' },
    { type: 'Page', label: 'KYC Verification', sub: 'Identity Documents', route: '/kyc', icon: '✅' },
    { type: 'Page', label: 'Settings', sub: 'Profile & Preferences', route: '/settings', icon: '⚙️' },
    { type: 'Page', label: 'Notifications', sub: 'Alerts & Updates', route: '/notifications', icon: '🔔' },
  ], [safeTrips, senderBookings]);

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
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Dashboard" />

      <main className="flex-1 lg:ml-[240px] flex flex-col h-[calc(100vh-60px)] lg:h-screen overflow-hidden">

        {/* ─── Top Header with Global Search ─── */}
        <header className="hidden lg:flex h-[68px] bg-white border-b border-slate-100 items-center justify-between px-8 shrink-0 gap-6">

          {/* Global Search */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div className={`flex items-center gap-3 bg-slate-50 border rounded-xl px-4 py-2.5 transition-all duration-200 ${searchFocused ? 'border-flyora-teal ring-2 ring-flyora-teal/10 shadow-sm' : 'border-slate-200'}`}>
              <Search size={16} className={`flex-shrink-0 transition-colors ${searchFocused ? 'text-flyora-teal' : 'text-slate-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search trips, bookings, pages..."
                className="flex-1 bg-transparent text-sm text-slate-700 font-semibold outline-none placeholder:text-slate-400 placeholder:font-normal"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={14} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold text-slate-400 bg-slate-200/60 rounded-md border border-slate-300/40">
                  Ctrl K
                </kbd>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchFocused && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                {searchQuery.trim().length === 0 ? (
                  <div className="p-4">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Navigation</p>
                    <div className="flex flex-col gap-1">
                      {[
                        { icon: '✈️', label: 'My Trips', route: '/traveler' },
                        { icon: '📦', label: 'My Bookings', route: '/sender' },
                        { icon: '🛡️', label: 'Trust Score', route: '/trust' },
                        { icon: '💳', label: 'Wallet', route: '/wallet' },
                      ].map(item => (
                        <button key={item.route} onClick={() => { navigate(item.route); setSearchFocused(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors w-full">
                          <span className="text-base">{item.icon}</span>
                          <span className="text-sm font-bold text-slate-700">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((item, i) => (
                      <button key={i} onClick={() => { navigate(item.route); setSearchFocused(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors w-full">
                        <span className="text-base flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">{item.label}</div>
                          <div className="text-xs font-semibold text-slate-400 truncate">{item.sub}</div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.type}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm font-semibold text-slate-400">No results for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        {/* ─── Dashboard Content ─── */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

          {/* ─── Live Stats Grid ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Trust Score Card — themed */}
            <div
              onClick={() => navigate('/trust')}
              className="col-span-2 bg-white border border-slate-100 rounded-[28px] p-6 flex items-center gap-5 shadow-sm hover:shadow-lg hover:border-slate-200 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 transform-gpu relative overflow-hidden group"
            >
              {/* Subtle glow decoration */}
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.07] transition-opacity group-hover:opacity-[0.12]" style={{ background: lc.ringColor }} />

              {/* Circular score ring */}
              <div className="relative flex-shrink-0">
                <svg width="88" height="88" className="transform -rotate-90">
                  <circle cx="44" cy="44" r="36" stroke="#f1f5f9" strokeWidth="7" fill="none" />
                  <circle cx="44" cy="44" r="36"
                    strokeWidth="7" fill="none" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * scorePercent) / 100}
                    style={{ stroke: lc.ringColor, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900 leading-none">{score}</span>
                  <span className="text-[9px] font-bold text-slate-400">/ 1000</span>
                </div>
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${lc.bg}`} style={{ color: lc.color }}>
                  <ShieldCheck size={10} />
                  {lc.label}
                </div>
                <p className="text-slate-900 font-black text-base leading-tight">Trust Score</p>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">AI Powered · Live</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp size={12} style={{ color: lc.ringColor }} />
                  <span className="text-xs font-bold" style={{ color: lc.ringColor }}>
                    {trustProfile?.activity_logs?.filter((l: any) => l.score_change > 0).length ?? 0} positive events
                  </span>
                </div>
              </div>

              <ChevronRight size={16} className="text-slate-300 flex-shrink-0 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Trips Card */}
            <div
              onClick={() => validateAction(() => navigate('/traveler'))}
              className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200 transform-gpu cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-flyora-teal flex items-center justify-center">
                  <Plane size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traveler</span>
              </div>
              <div>
                <div className="text-4xl font-black text-slate-900">
                  {totalTrips.toString().padStart(2, '0')}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">
                  {totalTrips} Active Trip{totalTrips !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Sender Card */}
            <div
              onClick={() => validateAction(() => navigate('/sender'))}
              className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200 transform-gpu cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender</span>
              </div>
              <div>
                <div className="text-4xl font-black text-slate-900">
                  {totalSender.toString().padStart(2, '0')}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">
                  {pendingBookings} Pending · {deliveredBookings} Done
                </div>
              </div>
            </div>
          </div>

          {/* ─── Active Trip ─── */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-extrabold text-slate-800">Active Trip</h2>
              <button onClick={() => navigate('/traveler')} className="text-[11px] font-black text-flyora-teal uppercase tracking-widest flex items-center gap-1 hover:text-teal-700 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>

            {loading && !activeTrip ? (
              <div className="bg-white border border-slate-100 rounded-[24px] p-8 space-y-4 animate-pulse">
                <div className="h-6 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-12 bg-slate-100 rounded w-full mt-4" />
              </div>
            ) : activeTrip ? (
              <div className="bg-flyora-teal rounded-[24px] p-7 text-white relative overflow-hidden shadow-xl shadow-teal-500/20 hover:shadow-2xl transition-shadow duration-300">
                <div className="absolute -right-20 -top-40 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl" />
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex flex-col gap-5 relative">
                    <div className="absolute left-[5px] top-6 bottom-4 w-0.5 border-l-2 border-dashed border-white/30" />
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-white ring-4 ring-white/20 mt-1.5 z-10" />
                      <div>
                        <div className="text-[10px] font-black tracking-widest text-white/70 mb-0.5">FROM</div>
                        <div className="text-2xl font-bold">{activeTrip.from_location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-white border-[3px] border-flyora-teal ring-2 ring-white mt-1.5 z-10" />
                      <div>
                        <div className="text-[10px] font-black tracking-widest text-white/70 mb-0.5">TO</div>
                        <div className="text-2xl font-bold">{activeTrip.to_location}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white text-flyora-teal text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    {activeTrip.departure_date}
                  </div>
                </div>
                <div className="border-t border-white/20 pt-5 flex justify-between items-end relative z-10">
                  <div>
                    <div className="text-[10px] font-black tracking-widest text-white/70 mb-1">CAPACITY</div>
                    <div className="text-lg font-bold">{activeTrip.available_weight}kg / {activeTrip.capacity_weight}kg</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black tracking-widest text-white/70 mb-1">EARN UP TO</div>
                    <div className="text-lg font-bold">${activeTrip.price_per_kg}/kg</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-[24px] p-10 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Plane size={28} />
                </div>
                <h3 className="text-slate-700 font-bold mb-2">No Active Trips</h3>
                <p className="text-slate-400 text-sm mb-5">Register a trip to start earning while you travel.</p>
                <button onClick={() => validateAction(() => navigate('/traveler'))} className="px-6 py-2.5 bg-flyora-teal text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors">
                  Register Trip
                </button>
              </div>
            )}
          </div>

          {/* ─── Upcoming Trips ─── */}
          {upcomingTrips.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-extrabold text-slate-800">Upcoming Trips</h2>
                <button onClick={() => navigate('/traveler')} className="text-[11px] font-black text-flyora-teal uppercase tracking-widest flex items-center gap-1 hover:text-teal-700 transition-colors">
                  View All <ArrowRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">
                {upcomingTrips.map((trip: any) => (
                  <div key={trip.id} className="bg-white border border-slate-100 rounded-[20px] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 transform-gpu">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><Plane size={12} /> {trip.departure_date}</div>
                      <div className="text-[11px] font-bold text-slate-600">{trip.available_weight}kg</div>
                    </div>
                    <div className="flex flex-col gap-2 relative">
                      <div className="absolute left-[5px] top-2 bottom-2 w-px border-l-2 border-dashed border-slate-100" />
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-flyora-teal bg-white z-10" />
                        <div>
                          <div className="text-[9px] font-black text-flyora-teal uppercase tracking-wider">From</div>
                          <div className="text-sm font-bold text-slate-800">{trip.from_location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-flyora-teal z-10" />
                        <div>
                          <div className="text-[9px] font-black text-flyora-teal uppercase tracking-wider">To</div>
                          <div className="text-sm font-bold text-slate-800">{trip.to_location}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <KycValidationModal isOpen={isModalOpen} onClose={closeModal} kycStatus={kycStatus} />
    </div>
  );
};

export default DashboardPage;
