import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Plane, Package, ShieldCheck, TrendingUp, ArrowRight, ChevronRight, Search, X, Calendar, Luggage, Wallet, Sparkles } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
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
  const userEmail = localStorage.getItem('flyora_user_email') || localStorage.getItem('flyora_admin_email');
  const rawUserName = localStorage.getItem('flyora_user_name') || 'Traveler';
  const firstName = rawUserName.split(' ')[0] || 'Traveler';
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

    // Note: Allow user to view dashboard freely even if KYC is pending/not submitted
    // The action validation and security banner will guide them to KYC when creating requests

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

  // Active trip calculation (from traveler trips only)
  const activeTrip = useMemo(() => {
    return travelerTrips.find((t: any) => t?.status === 'ACTIVE' || t?.status === 'IN_TRANSIT') || travelerTrips[0] || null;
  }, [travelerTrips]);

  // Upcoming trips list
  const upcomingTrips = useMemo(() => {
    return travelerTrips.filter((t: any) => t?.id !== activeTrip?.id).slice(0, 3);
  }, [travelerTrips, activeTrip]);

  // Total counts - accurately matching Sender Page
  const totalTrips = travelerTrips.length;
  const totalSender = senderRequests.length;

  const pendingBookings = useMemo(() => {
    return senderRequests.filter((r: any) => {
      const st = (r.status || 'Active').toLowerCase();
      return st === 'active' || st === 'pending';
    }).length;
  }, [senderRequests]);

  const deliveredBookings = useMemo(() => {
    return senderRequests.filter((r: any) => {
      const st = (r.status || '').toLowerCase();
      return st === 'completed' || st === 'delivered';
    }).length;
  }, [senderRequests]);

  // Trust score calculations
  const score = trustProfile?.score ?? 850;
  const level = trustProfile?.level ?? 'STANDARD';
  const circumference = 2 * Math.PI * 42;
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
    ...travelerTrips.map((t: any) => ({ type: 'Trip', label: `${t?.from_location || ''} → ${t?.to_location || ''}`, sub: t?.departure_date || '', route: '/traveler', icon: '✈️' })),
    ...senderRequests.map((r: any) => ({ type: 'Sender Request', label: `${r?.from_location || ''} → ${r?.to_location || ''}`, sub: `${r?.capacity_weight || 1} KG · ${r?.departure_date || ''}`, route: '/sender', icon: '📦' })),
    ...senderBookings.map((b: any) => ({ type: 'Booking', label: b?.package_name || `Booking #${b?.id}`, sub: b?.status?.replace(/_/g, ' ') || '', route: '/sender', icon: '📦' })),
    { type: 'Page', label: 'Trust Score', sub: 'AI Powered Rating', route: '/trust', icon: '🛡️' },
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
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Dashboard" />

      <main className="flex-1 min-w-0 w-full lg:ml-[240px] flex flex-col min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden pb-24 lg:pb-0">

        {/* ─── Desktop Header with Global Search (UNTOUCHED) ─── */}
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

        {/* ─── Dashboard Content (Responsive Mobile + Identical Desktop) ─── */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 lg:space-y-10 bg-slate-50/30">

          {/* ─── KYC Status Enterprise Banner (When Not Approved) ─── */}
          {(kycStatus !== 'APPROVED') && (
            <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-all ${kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW'
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : kycStatus === 'REJECTED'
                  ? 'bg-red-50/90 border-red-200 text-red-900'
                  : 'bg-emerald-50/90 border-teal-200 text-slate-800'
              }`}>
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW'
                    ? 'bg-amber-100 text-amber-600'
                    : kycStatus === 'REJECTED'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-teal-100 text-teal-700'
                  }`}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW'
                        ? 'KYC Verification In Progress'
                        : kycStatus === 'REJECTED'
                          ? 'KYC Documents Require Attention'
                          : 'Identity Verification Required'}
                    </h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : kycStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-teal-100 text-teal-800 border-teal-300'
                      }`}>
                      {kycStatus === 'PENDING' ? 'Under Review' : kycStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl font-medium">
                    {kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW'
                      ? 'Your submitted National ID and Passport documents are being verified by our compliance team. Creating trips, sender requests, and booking parcels will automatically unlock once approved.'
                      : kycStatus === 'REJECTED'
                        ? 'Your documents were declined. Please re-submit valid identification to create trips and book parcel deliveries.'
                        : 'To ensure community safety and comply with aviation standards, please complete your identity verification (National ID & Passport).'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/kyc')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-2 shrink-0 ${kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                    : kycStatus === 'REJECTED'
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                      : 'bg-flyora-teal hover:bg-teal-700 text-white shadow-teal-600/20'
                  }`}
              >
                <span>{kycStatus === 'PENDING' ? 'Check KYC Status' : 'Verify Identity Now'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* ─── Mobile Greeting & Search Pill (Google & Meta Standard) ─── */}
          <div className="lg:hidden flex flex-col gap-3">
            {/* User Greeting & Status Bar */}
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <span>Welcome back</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {firstName} 👋
                </h1>
              </div>
              <div
                onClick={() => navigate('/trust')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-flyora-teal text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-transform"
              >
                <ShieldCheck size={14} />
                <span>{score} Score</span>
              </div>
            </div>

            {/* Mobile Global Search Pill */}
            <div className="relative w-full" ref={searchRef}>
              <div className={`flex items-center gap-2.5 bg-white border rounded-2xl px-3.5 py-2.5 shadow-xs transition-all ${searchFocused ? 'border-flyora-teal ring-2 ring-flyora-teal/15 shadow-sm' : 'border-slate-200/90'}`}>
                <Search size={16} className={`shrink-0 ${searchFocused ? 'text-flyora-teal' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search trips, packages, wallet..."
                  className="flex-1 bg-transparent text-sm text-slate-800 font-bold outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 p-0.5">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mobile Search Dropdown */}
              {searchFocused && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden z-50">
                  {searchQuery.trim().length === 0 ? (
                    <div className="p-3.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quick Shortcuts</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: '✈️', label: 'My Trips', route: '/traveler' },
                          { icon: '📦', label: 'My Packages', route: '/sender' },
                          { icon: '🛡️', label: 'Trust Rating', route: '/trust' },
                          { icon: '💳', label: 'My Wallet', route: '/wallet' },
                        ].map(item => (
                          <button
                            key={item.route}
                            onClick={() => { navigate(item.route); setSearchFocused(false); setSearchQuery(''); }}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-left active:scale-95 transition-all"
                          >
                            <span className="text-base">{item.icon}</span>
                            <span className="text-xs font-bold text-slate-700">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2 max-h-60 overflow-y-auto no-scrollbar">
                      {searchResults.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { navigate(item.route); setSearchFocused(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 text-left transition-colors w-full active:bg-slate-100"
                        >
                          <span className="text-base shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">{item.label}</div>
                            <div className="text-[10px] font-semibold text-slate-400 truncate">{item.sub}</div>
                          </div>
                          <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.type}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs font-semibold text-slate-400">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Horizontal Quick Actions / Story Chips Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
              {[
                { icon: Plane, label: 'Post Trip', action: () => validateAction(() => navigate('/traveler/new')), color: 'text-flyora-teal bg-teal-50 border-teal-200/60' },
                { icon: Package, label: 'Send Package', action: () => validateAction(() => navigate('/sender/new')), color: 'text-blue-600 bg-blue-50 border-blue-200/60' },
                { icon: Sparkles, label: 'Ask Flyora AI', action: () => openAI(), color: 'text-purple-700 bg-purple-50 border-purple-200/80' },
                { icon: ShieldCheck, label: 'Trust Score', action: () => navigate('/trust'), color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' },
                { icon: Wallet, label: 'Wallet', action: () => navigate('/wallet'), color: 'text-slate-700 bg-slate-100 border-slate-200' },
              ].map((chip) => {
                const ChipIcon = chip.icon;
                return (
                  <button
                    key={chip.label}
                    onClick={chip.action}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border shrink-0 touch-press shadow-xs ${chip.color}`}
                  >
                    <ChipIcon size={14} strokeWidth={2.5} />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Live Stats Grid ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">

            {/* Trust Score Card — Full width on mobile/tablet, 2 cols on desktop */}
            <div
              onClick={() => navigate('/trust')}
              className="col-span-2 bg-white border border-slate-100 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 lg:p-8 flex items-center gap-4 sm:gap-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group touch-press"
            >
              {/* Subtle glow decoration */}
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-2xl" style={{ background: lc.ringColor }} />
              <div className="absolute right-0 bottom-0 w-32 h-32 rounded-tl-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-tl from-slate-200 to-transparent pointer-events-none" />

              {/* Circular score ring */}
              <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-300">
                <svg width="86" height="86" viewBox="0 0 100 100" className="transform -rotate-90 sm:w-[100px] sm:h-[100px]">
                  <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="42"
                    strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={(2 * Math.PI * 42) - ((2 * Math.PI * 42) * scorePercent) / 100}
                    style={{ stroke: lc.ringColor, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{score}</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5">/ 1000</span>
                </div>
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2 ${lc.bg}`} style={{ color: lc.color }}>
                  <ShieldCheck size={11} />
                  {lc.label}
                </div>
                <p className="text-slate-900 font-black text-base sm:text-xl leading-tight">Trust Score</p>
                <p className="text-slate-500 text-[11px] sm:text-xs font-semibold mt-0.5">AI Powered · Live</p>
                <div className="flex items-center gap-1 mt-2 bg-slate-50 w-fit px-2 py-0.5 rounded-lg">
                  <TrendingUp size={11} style={{ color: lc.ringColor }} />
                  <span className="text-[11px] font-bold" style={{ color: lc.ringColor }}>
                    {trustProfile?.activity_logs?.filter((l: any) => l.score_change > 0).length ?? 0} positive events
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex w-10 h-10 rounded-full bg-slate-50 items-center justify-center text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-500 transition-colors shrink-0">
                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Trips Card */}
            <div
              onClick={() => validateAction(() => navigate('/traveler'))}
              className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-100 p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden touch-press"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-50 text-flyora-teal flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Plane size={20} className="sm:w-6 sm:h-6 transform -rotate-45" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">Trips</span>
              </div>
              <div className="relative z-10">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  {totalTrips.toString().padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-flyora-teal animate-pulse"></span>
                  <span className="truncate">{totalTrips} Active</span>
                </div>
              </div>
            </div>

            {/* Sender Card */}
            <div
              onClick={() => validateAction(() => navigate('/sender'))}
              className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-100 p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden touch-press"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Package size={20} className="sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">Sender</span>
              </div>
              <div className="relative z-10">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  {totalSender.toString().padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">{pendingBookings} Pend</span>
                  <span className="text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">{deliveredBookings} Done</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Active Trip Boarding Pass ─── */}
          <div>
            <div className="flex justify-between items-end mb-4 sm:mb-6 px-1">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Active Trip Overview</h2>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Real-time status of your current journey</p>
              </div>
              <button onClick={() => navigate('/traveler')} className="text-xs font-black text-flyora-teal uppercase tracking-widest flex items-center gap-1.5 hover:text-teal-700 hover:bg-teal-50 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors touch-press">
                View All <ArrowRight size={14} />
              </button>
            </div>

            {loading && !activeTrip ? (
              <div className="bg-white border border-slate-100 rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 space-y-4 sm:space-y-6 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-6 sm:h-8 bg-slate-100 rounded-lg w-1/4" />
                  <div className="h-6 sm:h-8 bg-slate-100 rounded-full w-24" />
                </div>
                <div className="h-12 sm:h-16 bg-slate-50 rounded-2xl w-full" />
                <div className="h-8 sm:h-10 bg-slate-100 rounded-lg w-1/3" />
              </div>
            ) : activeTrip ? (
              <div className="bg-gradient-to-br from-flyora-teal to-[#115e59] rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-teal-900/20 hover:shadow-teal-900/30 transition-all duration-300 group">
                {/* Abstract Background Shapes */}
                <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute -left-20 -bottom-20 w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-8 min-w-0">

                  {/* Left Side: Route Info */}
                  <div className="flex-1 w-full min-w-0 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                      <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Active Flight
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                        {activeTrip.departure_date}
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-start lg:gap-8 xl:gap-12 w-full min-w-0">
                      {/* From */}
                      <div className="flex-1 min-w-0 max-w-[42%] sm:max-w-none">
                        <p className="text-teal-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-1.5">Departure</p>
                        <p
                          className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-black drop-shadow-sm leading-tight overflow-hidden"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }}
                          title={activeTrip.from_location}
                        >
                          {activeTrip.from_location}
                        </p>
                      </div>

                      {/* Flight Path Animation */}
                      <div className="flex flex-col items-center justify-center px-2 sm:px-4 shrink-0 w-[40px] sm:w-[60px] lg:w-[80px]">
                        <Plane size={20} className="text-white/90 mb-2 rotate-90 drop-shadow-md group-hover:translate-x-1 transition-transform duration-500 sm:w-6 sm:h-6" />
                        <div className="w-full h-0.5 sm:h-1 bg-white/10 relative rounded-full overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-transparent via-white/80 to-white/90 w-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-[slideRight_3s_ease-in-out_infinite]" />
                        </div>
                      </div>

                      {/* To */}
                      <div className="flex-1 min-w-0 max-w-[42%] sm:max-w-none text-right lg:text-left">
                        <p className="text-teal-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-1.5">Arrival</p>
                        <p
                          className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-black drop-shadow-sm leading-tight overflow-hidden"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }}
                          title={activeTrip.to_location}
                        >
                          {activeTrip.to_location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel / Stats */}
                  <div className="w-full lg:w-auto bg-black/15 backdrop-blur-xl rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 border border-white/10 grid grid-cols-2 lg:flex lg:flex-col justify-between items-center lg:items-end gap-4 sm:gap-6 shadow-inner shrink-0">
                    <div className="text-left lg:text-right">
                      <p className="text-teal-100 text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-1.5 flex items-center gap-1.5 lg:justify-end">
                        <Package size={12} /> Available Space
                      </p>
                      <p className="text-xl sm:text-3xl font-black">{activeTrip.available_weight}<span className="text-xs sm:text-sm font-bold text-white/60 ml-1">/ {activeTrip.capacity_weight} kg</span></p>
                    </div>

                    <div className="text-right lg:text-right">
                      <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-1.5 flex items-center gap-1.5 justify-end">
                        Rate per KG
                      </p>
                      <p className="text-xl sm:text-3xl font-black text-emerald-300">₹{activeTrip.price_per_kg}<span className="text-xs sm:text-sm font-bold text-emerald-300/60 ml-1">/ kg</span></p>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-[28px] sm:rounded-[32px] p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-[20px] sm:rounded-[24px] flex items-center justify-center text-slate-300 mb-5 sm:mb-6 rotate-12">
                  <Plane size={32} className="sm:w-9 sm:h-9" />
                </div>
                <h3 className="text-slate-800 text-lg sm:text-xl font-black mb-1.5">No Active Trips</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 max-w-sm">Register your upcoming travel schedule to start monetizing your extra baggage space.</p>
                <button onClick={() => validateAction(() => navigate('/traveler/new'))} className="px-6 sm:px-8 py-3 sm:py-3.5 bg-flyora-teal text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-600 transition-all touch-press">
                  Post a New Trip
                </button>
              </div>
            )}
          </div>

          <style>{`
            @keyframes slideRight {
              0% { left: -50%; opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { left: 100%; opacity: 0; }
            }
          `}</style>

          {/* ─── Upcoming Trips ─── */}
          {upcomingTrips.length > 0 && (
            <div className="pb-16 lg:pb-12">
              <div className="flex justify-between items-end mb-4 sm:mb-6 px-1">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Upcoming Trips</h2>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Your scheduled journeys</p>
                </div>
                <button onClick={() => navigate('/traveler')} className="text-xs font-black text-flyora-teal uppercase tracking-widest flex items-center gap-1.5 hover:text-teal-700 hover:bg-teal-50 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors touch-press">
                  View All <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {upcomingTrips.map((trip: any) => (
                  <div key={trip.id} className="group bg-white border border-slate-100/80 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[150px] touch-press">
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative z-10 flex justify-between items-start mb-5 sm:mb-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-flyora-teal shadow-sm border border-slate-100/50 transition-colors">
                          <Calendar size={15} />
                        </div>
                        <div className="text-xs sm:text-sm font-black text-slate-700">{trip.departure_date}</div>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg uppercase tracking-wider">
                        {trip.available_weight} KG
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">From</p>
                        <p className="text-sm sm:text-base font-bold text-slate-800 truncate leading-tight" title={trip.from_location}>{trip.from_location}</p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center text-slate-300 group-hover:text-flyora-teal group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                        <Plane size={18} className="rotate-90 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">To</p>
                        <p className="text-sm sm:text-base font-bold text-slate-800 truncate leading-tight" title={trip.to_location}>{trip.to_location}</p>
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
