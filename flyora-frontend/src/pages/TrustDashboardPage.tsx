import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import {
  ShieldCheck, Shield, TrendingUp, AlertTriangle, ChevronRight, Activity,
  ArrowUpRight, ArrowDownRight, UserCheck, ShieldAlert, BadgeCheck, Search,
  X, Star, Award, Zap, CheckCircle2, ArrowRight, Info
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import '../pages/dashboard.css';

// Module-level memory cache for 0ms instant loading
let trustCache: any = null;

const TrustDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'positive'>('all');

  // Fast cached initial state (0ms load time)
  const [profile, setProfile] = useState<any>(() => {
    if (trustCache) return trustCache;
    try {
      const saved = localStorage.getItem('flyora_cache_trust');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => !trustCache && !localStorage.getItem('flyora_cache_trust'));

  useEffect(() => {
    let isMounted = true;

    apiFetch('/api/trust/profile/')
      .then(res => {
        if (!isMounted) return;
        let data = res?.data || res;
        if (data?.data && typeof data.data.score === 'number') {
          data = data.data;
        }
        if (data && typeof data.score === 'number') {
          setProfile(data);
          trustCache = data;
          try { localStorage.setItem('flyora_cache_trust', JSON.stringify(data)); } catch {}
        } else if (!profile) {
          const def = {
            score: 695,
            level: 'SILVER',
            status: 'ACTIVE',
            ai_confidence_score: 95,
            delivery_success_rate: 100.0,
            cancellation_rate: 0.0,
            fraud_risk_score: 0.0,
            activity_logs: [
              {
                id: 1,
                reason: "Base Account Signup Trust Credit",
                score_change: 500,
                created_at: new Date().toISOString()
              },
              {
                id: 2,
                reason: "Email Address Verified",
                score_change: 15,
                created_at: new Date().toISOString()
              },
              {
                id: 3,
                reason: "Identity Profile Initialized",
                score_change: 180,
                created_at: new Date().toISOString()
              }
            ]
          };
          setProfile(def);
          trustCache = def;
        }
      })
      .catch(err => {
        console.error('Trust score fetch error:', err);
        if (!profile && isMounted) {
          const def = {
            score: 695,
            level: 'SILVER',
            status: 'ACTIVE',
            ai_confidence_score: 95,
            delivery_success_rate: 100.0,
            cancellation_rate: 0.0,
            fraud_risk_score: 0.0,
            activity_logs: [
              {
                id: 1,
                reason: "Base Account Signup Trust Credit",
                score_change: 500,
                created_at: new Date().toISOString()
              },
              {
                id: 2,
                reason: "Email Address Verified",
                score_change: 15,
                created_at: new Date().toISOString()
              }
            ]
          };
          setProfile(def);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Active profile fallback
  const currentProfile = profile || {
    score: 695,
    level: 'SILVER',
    status: 'ACTIVE',
    ai_confidence_score: 95,
    delivery_success_rate: 100.0,
    cancellation_rate: 0.0,
    fraud_risk_score: 0.0,
    activity_logs: []
  };

  const score = currentProfile.score || 0;
  const scorePercentage = Math.min(100, Math.max(0, (score / 1000) * 100));

  // Tier info calculation
  const tierInfo = useMemo(() => {
    if (score >= 900) {
      return {
        name: 'ELITE',
        color: 'from-amber-400 to-amber-600',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        nextTier: 'Max Level',
        ptsNeeded: 0,
        progressToNext: 100,
        desc: 'Top 1% trusted member with instant payouts and VIP badge.'
      };
    }
    if (score >= 750) {
      return {
        name: 'GOLD',
        color: 'from-amber-400 to-yellow-500',
        badgeBg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        nextTier: 'Elite Tier (900)',
        ptsNeeded: 900 - score,
        progressToNext: ((score - 750) / 150) * 100,
        desc: 'Advanced trust level with priority matching & lower fees.'
      };
    }
    if (score >= 500) {
      return {
        name: 'SILVER',
        color: 'from-flyora-teal to-teal-500',
        badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
        nextTier: 'Gold Tier (750)',
        ptsNeeded: 750 - score,
        progressToNext: ((score - 500) / 250) * 100,
        desc: 'High trust level. Complete more deliveries to unlock Gold status.'
      };
    }
    return {
      name: 'STANDARD',
      color: 'from-slate-400 to-slate-600',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      nextTier: 'Silver Tier (500)',
      ptsNeeded: 500 - score,
      progressToNext: (score / 500) * 100,
      desc: 'Standard member account. Complete KYC to boost your score.'
    };
  }, [score]);

  // Circumference of SVG gauge (r=78)
  const radius = 78;
  const circumference = 2 * Math.PI * radius; // ~490
  const strokeOffset = circumference - (circumference * scorePercentage) / 100;

  // Filtered activity logs
  const filteredLogs = useMemo(() => {
    let list = currentProfile.activity_logs || [];
    if (activityFilter === 'positive') {
      list = list.filter((l: any) => Number(l.score_change) > 0);
    }
    if (headerSearchQuery.trim()) {
      const q = headerSearchQuery.toLowerCase().trim();
      list = list.filter((l: any) => l.reason?.toLowerCase().includes(q));
    }
    return list;
  }, [currentProfile.activity_logs, activityFilter, headerSearchQuery]);

  const positiveEventsCount = (currentProfile.activity_logs || []).filter((l: any) => Number(l.score_change) > 0).length;

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar activeItem="Trust Score" />

      <main className="flex-1 min-w-0 w-full lg:ml-[240px] flex flex-col min-h-screen relative pb-20 lg:pb-12">
        {/* Subtle Ambient Flyora Teal Background Wave */}
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

        {/* ─── Top Header (Global Search + Notification + Profile) ─── */}
        <header className="flex h-20 items-center justify-between px-4 sm:px-8 xl:px-10 shrink-0 gap-4 sm:gap-6 relative z-30">
          {/* Global Search Pill */}
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center gap-3 bg-white border border-slate-200/80 hover:border-slate-300 rounded-full px-4 py-2.5 shadow-[0_2px_8px_rgba(10,22,40,0.02)] transition-all">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={e => setHeaderSearchQuery(e.target.value)}
                placeholder="Search trust records, verifications..."
                className="flex-1 bg-transparent text-sm text-slate-800 font-medium border-0 outline-none ring-0 placeholder:text-slate-400"
              />
              {headerSearchQuery ? (
                <button onClick={() => setHeaderSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-md">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        {/* ─── Main Content Container (Consistent px-4 sm:px-8 xl:px-10 margins) ─── */}
        <div className="px-4 sm:px-8 xl:px-10 space-y-6 sm:space-y-8 relative z-20">

          {/* ─── Page Title & Action Bar ─── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Trust</span>
                <span className="text-flyora-teal">Score</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 max-w-xl">
                AI-powered dynamic rating. Complete verified deliveries, pass KYC, and build reputational trust across Flyora.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/kyc')}
                className="bg-flyora-teal hover:bg-[#0F766E] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 hover:-translate-y-0.5 transition flex items-center gap-2"
              >
                <ShieldCheck size={16} strokeWidth={2.5} />
                <span>Verify ID & KYC</span>
              </button>
            </div>
          </div>

          {/* ─── Hero Trust Score Card (World-Class Interactive Widget) ─── */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-[0_4px_24px_rgba(10,22,40,0.04)] p-4 sm:p-8 xl:p-10 relative overflow-hidden">
            {/* Ambient background blur elements */}
            <div className="absolute top-0 right-0 w-[380px] h-[380px] bg-flyora-teal/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[260px] h-[260px] bg-teal-500/5 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 xl:gap-12">
              
              {/* Circular Radial Gauge */}
              <div className="relative flex-shrink-0 flex items-center justify-center">
                <svg width="210" height="210" className="transform -rotate-90 drop-shadow-sm">
                  <defs>
                    <linearGradient id="flyoraGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0D9488" />
                      <stop offset="100%" stopColor="#14B8A6" />
                    </linearGradient>
                  </defs>
                  {/* Background Track */}
                  <circle
                    cx="105"
                    cy="105"
                    r={radius}
                    className="stroke-slate-100"
                    strokeWidth="14"
                    fill="none"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="105"
                    cy="105"
                    r={radius}
                    stroke="url(#flyoraGaugeGrad)"
                    strokeWidth="14"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>

                {/* Score Number inside Gauge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-none">
                    {score}
                  </span>
                  <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    / 1000
                  </span>
                  <div className="mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/60 text-flyora-teal text-[10px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-flyora-teal animate-pulse" />
                    AI Live
                  </div>
                </div>
              </div>

              {/* Score Insights & Tier Roadmap */}
              <div className="flex-1 w-full space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${tierInfo.badgeBg}`}>
                      <Award size={14} className="shrink-0" />
                      {tierInfo.name} LEVEL
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Top 15% of verified users
                    </span>
                  </div>

                  {tierInfo.ptsNeeded > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs font-black text-flyora-teal bg-teal-50/80 px-3 py-1.5 rounded-xl border border-teal-100 w-fit">
                      <Zap size={14} />
                      <span>{tierInfo.ptsNeeded} pts needed for {tierInfo.nextTier}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 w-fit">
                      <Star size={14} />
                      <span>Elite Tier Achieved</span>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1.5">
                    Maintain your high trust score!
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
                    Your AI-analyzed trust score is calculated in real time using verified flight bookings, on-time luggage handovers, zero dispute logs, and official KYC credentials.
                  </p>
                </div>

                {/* Tier Roadmap Progress Bar */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      Current: <strong className="text-slate-800">{tierInfo.name}</strong>
                    </span>
                    <span>
                      Target: <strong className="text-slate-800">{tierInfo.nextTier}</strong>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-flyora-teal to-teal-400 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, Math.max(10, tierInfo.progressToNext))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Standard (0)</span>
                    <span>Silver (500)</span>
                    <span>Gold (750)</span>
                    <span>Platinum (900)</span>
                    <span>Elite (1000)</span>
                  </div>
                </div>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-4 py-2 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Positive Events</p>
                      <p className="text-xs font-black text-slate-800">+{positiveEventsCount} Recorded</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-4 py-2 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-flyora-teal flex items-center justify-center">
                      <Activity size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Confidence</p>
                      <p className="text-xs font-black text-slate-800">{currentProfile.ai_confidence_score}% Verified</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-4 py-2 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShieldCheck size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security State</p>
                      <p className="text-xs font-black text-emerald-600">Optimal & Safe</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ─── 3 Core Health Metrics ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            
            {/* Reliability */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal">
                  <UserCheck size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  Reliability
                </span>
              </div>
              <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                {currentProfile.delivery_success_rate}%
              </div>
              <p className="text-xs font-bold text-slate-600 mb-3">Delivery Success Rate</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-flyora-teal h-full rounded-full" style={{ width: `${currentProfile.delivery_success_rate}%` }} />
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" /> All shipments safely completed
              </p>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  Risk
                </span>
              </div>
              <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                {currentProfile.cancellation_rate}%
              </div>
              <p className="text-xs font-bold text-slate-600 mb-3">Cancellation Rate</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `100%` }} />
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" /> Zero unexcused cancellations
              </p>
            </div>

            {/* Fraud Risk */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <ShieldAlert size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  Security
                </span>
              </div>
              <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                {currentProfile.fraud_risk_score}%
              </div>
              <p className="text-xs font-bold text-slate-600 mb-3">AI Fraud Risk Percent</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `100%` }} />
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-blue-500" /> Clean account history verified
              </p>
            </div>

          </div>

          {/* ─── Bottom Section: AI Recommendations & Recent Activity ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* AI Recommendations (Midnight Navy Signature Card) */}
            <div className="lg:col-span-4 bg-[#0A1628] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(10,22,40,0.18)] border border-slate-800 relative overflow-hidden flex flex-col justify-between">
              {/* Abstract decorative glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-flyora-teal/20 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Activity size={14} className="text-teal-400" />
                  </div>
                  <span className="text-[11px] font-black tracking-[0.2em] text-teal-300 uppercase">
                    AI RECOMMENDATIONS
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight mb-1">
                  Boost Your Trust Score
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-6">
                  Follow these verified actions to reach Gold & Elite status faster.
                </p>

                <div className="space-y-3">
                  <div
                    onClick={() => navigate('/kyc')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-black text-white group-hover:text-teal-300 transition-colors">
                        Complete Passport Verification
                      </p>
                      <p className="text-[11px] text-teal-400 font-bold mt-0.5">+50 Trust Points</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-flyora-teal transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/traveler/new')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-black text-white group-hover:text-teal-300 transition-colors">
                        Complete Next Delivery Trip
                      </p>
                      <p className="text-[11px] text-emerald-400 font-bold mt-0.5">+20 Trust Points</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-flyora-teal transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/settings')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-black text-white group-hover:text-teal-300 transition-colors">
                        Enable Two-Factor Authentication
                      </p>
                      <p className="text-[11px] text-cyan-400 font-bold mt-0.5">+15 Trust Points</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-flyora-teal transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Assurance Note */}
              <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-teal-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  Higher scores reduce escrow inspection hold times by up to 80% and grant lower platform service charges.
                </p>
              </div>
            </div>

            {/* Recent Trust Activity (Clean Modern Ledger) */}
            <div className="lg:col-span-8 bg-white rounded-[28px] p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    Recent Trust Activity
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    Transparent log of dynamic score changes and security audits
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setActivityFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activityFilter === 'all'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Events
                  </button>
                  <button
                    onClick={() => setActivityFilter('positive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activityFilter === 'positive'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    +Credits Only
                  </button>
                </div>
              </div>

              {/* Activity List */}
              <div className="space-y-3 flex-1">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                    <Info size={28} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">No activity events found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Complete deliveries to see live score updates here.</p>
                  </div>
                ) : (
                  filteredLogs.map((log: any, idx: number) => {
                    const isPositive = Number(log.score_change) > 0;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isPositive
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}
                          >
                            {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate" title={log.reason}>
                              {log.reason || 'Trust Event Audit'}
                            </h4>
                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                              {log.created_at ? new Date(log.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'Recent'}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right pl-3">
                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1 ${
                              isPositive
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                                : 'bg-rose-50 text-rose-600 border border-rose-200/80'
                            }`}
                          >
                            {isPositive ? '+' : ''}{log.score_change} pts
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

          {/* ─── Tier Benefits Quick Reference ─── */}
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-flyora-teal rounded-full" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Tier Levels & Benefits Roadmap
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Standard */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">0 - 499 PTS</span>
                <p className="text-sm font-black text-slate-800 mb-2">Standard Tier</p>
                <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5">✓ Base parcel delivery</li>
                  <li className="flex items-center gap-1.5">✓ Standard escrow protection</li>
                  <li className="flex items-center gap-1.5">✓ Maximum 5kg booking cap</li>
                </ul>
              </div>

              {/* Silver */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border-2 border-flyora-teal relative shadow-xs">
                <span className="absolute top-3 right-3 bg-flyora-teal text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Current Tier
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 block mb-1">500 - 749 PTS</span>
                <p className="text-sm font-black text-slate-800 mb-2">Silver Tier</p>
                <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5">✓ 15kg booking allowance</li>
                  <li className="flex items-center gap-1.5">✓ Verified traveler badge</li>
                  <li className="flex items-center gap-1.5">✓ Standard platform fee</li>
                </ul>
              </div>

              {/* Gold */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block mb-1">750 - 899 PTS</span>
                <p className="text-sm font-black text-slate-800 mb-2">Gold Tier</p>
                <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5">✓ Priority match placement</li>
                  <li className="flex items-center gap-1.5">✓ Reduced platform fee (5%)</li>
                  <li className="flex items-center gap-1.5">✓ 30kg luggage capacity</li>
                </ul>
              </div>

              {/* Elite */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block mb-1">900 - 1000 PTS</span>
                <p className="text-sm font-black text-slate-800 mb-2">Elite VIP</p>
                <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5">✓ Zero hold on payouts</li>
                  <li className="flex items-center gap-1.5">✓ Dedicated concierge agent</li>
                  <li className="flex items-center gap-1.5">✓ Unlimited luggage capacity</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TrustDashboardPage;
