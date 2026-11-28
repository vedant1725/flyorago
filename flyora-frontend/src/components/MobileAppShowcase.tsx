import React, { useState, useEffect } from 'react';
import {
  Smartphone, QrCode, ShieldCheck, Zap,
  CheckCircle2, ArrowRight, ChevronLeft, ChevronRight,
  Sparkles, BellRing, Plane, Wallet
} from 'lucide-react';

interface ScreenTab {
  id: string;
  name: string;
  category: string;
  badge: string;
  headline: string;
  description: string;
  image: string;
}

const APP_SCREENS: ScreenTab[] = [
  {
    id: 'dashboard',
    name: 'Home & Trust',
    category: 'Flyer Portal',
    badge: 'Trust Score 735',
    headline: 'Real-Time Flight & Parcel Dashboard',
    description: 'Track ongoing passenger flights, monitor trust metrics, and review one-touch actions for luggage space and dispatch.',
    image: '/images/app-screen-dashboard-home.jpg',
  },
  {
    id: 'sender',
    name: 'Send Packages',
    category: 'Sender Portal',
    badge: '100% Escrow Secured',
    headline: 'Frictionless Parcel Management',
    description: 'Manage active shipments, schedule pick-up routes, and verify passenger assignment in real time with zero paperwork.',
    image: '/images/app-screen-sender-packages.jpg',
  },
  {
    id: 'tracking',
    name: 'Live Milestones',
    category: 'Aviation Tracking',
    badge: 'Dynamic OTP Protected',
    headline: 'End-to-End Visual Transit Tracker',
    description: 'Follow every handover phase from unsealed inspection and in-flight transit to recipient OTP code confirmation.',
    image: '/images/app-screen-tracking-timeline.jpg',
  },
  {
    id: 'trips',
    name: 'Trip & Earn',
    category: 'Carrier Monetization',
    badge: 'Live Flight Rates',
    headline: 'Monetize Commercial Travel Bags',
    description: 'Publish your ticketed route, allocate spare baggage allowance, and collect delivery rewards straight on arrival.',
    image: '/images/app-screen-trip-earn.jpg',
  },
  {
    id: 'wallet',
    name: 'Escrow Wallet',
    category: 'Institutional Vault',
    badge: 'Zero-Risk Protection',
    headline: 'Automated Direct Bank Payouts',
    description: 'Institutional-grade escrow holding guarantees instant, dispute-free withdrawals to linked bank accounts upon delivery.',
    image: '/images/app-screen-wallet-escrow.jpg',
  },
];

const MobileAppShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [emailNotify, setEmailNotify] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Auto rotate screens smoothly every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % APP_SCREENS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailNotify.trim()) return;
    setIsSubscribed(true);
  };

  const current = APP_SCREENS[activeTab];

  return (
    <section
      className="relative py-20 lg:py-28 bg-[#FBFDFE] border-b border-slate-200/60 overflow-hidden select-none"
      id="mobile-app"
      aria-label="Flyorago Mobile App"
    >
      {/* ─── Seamless Ambient Architectural Grid ─── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute top-1/4 right-5 w-[650px] h-[650px] bg-flyora-teal/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-5 w-[600px] h-[600px] bg-sky-300/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ─── Section Header (Apple / Google Top MNC Editorial Style) ─── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200/80 shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-flyora-teal animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-flyora-teal-dark tracking-wide uppercase">
              Native Mobile Experience
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-flyora-navy tracking-tight leading-[1.16] mb-4">
            Flyorago Mobile App — <span className="bg-gradient-to-r from-flyora-teal via-cyan-600 to-indigo-600 bg-clip-text text-transparent">Coming Soon</span>
          </h2>

          <p className="text-slate-500 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
            Experience real-time flight tracking, instant passenger baggage matching, and automated escrow payouts directly on your phone.
          </p>
        </div>

        {/* ─── Interactive Screen Switcher Navigation ─── */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10 sm:mb-14">
          {APP_SCREENS.map((screen, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-bold transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'bg-flyora-navy text-white shadow-md shadow-slate-900/15 scale-102'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <span>{screen.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-flyora-teal animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Main Showcase Stage (Seamless Phone Mockup + Direct Context) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* ══════════════════════════════════════════════════════════
              LEFT: Real High-Definition Smartphone Display
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1 relative">
            
            {/* Ambient Device Backdrop Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-gradient-to-tr from-flyora-teal/10 via-sky-400/5 to-transparent rounded-[44px] blur-2xl pointer-events-none" />

            {/* Modern Slim Black Smartphone Frame (Ultra-thin 1px Minimal Black Border) */}
            <div className="relative w-full max-w-[280px] sm:max-w-[295px] rounded-[40px] p-[2px] bg-black shadow-[0_16px_40px_rgba(0,0,0,0.14)] ring-1 ring-black/80">
              
              {/* Dynamic Island Pill Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-30 flex items-center justify-between px-2">
                <div className="w-1 h-1 rounded-full bg-slate-800" />
                <div className="w-1 h-1 rounded-full bg-emerald-500/80" />
              </div>

              {/* Active Mobile Screenshot Display (Edge-to-Edge with Slim Rounded Radius) */}
              <div className="relative rounded-[38px] overflow-hidden bg-black aspect-[9/19.5]">
                <img
                  key={current.image}
                  src={current.image}
                  alt={current.headline}
                  className="w-full h-full object-cover object-top transition-opacity duration-500"
                />

                {/* Subtle Glass Reflection Glare */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-white/40 rounded-full z-30" />
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT: Clean Executive Details, Store Badges & Notification
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col justify-center order-1 lg:order-2">
            
            <div className="max-w-xl">
              
              {/* Category & Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[11px] font-extrabold text-flyora-teal uppercase tracking-widest">
                  {current.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-teal-50 text-flyora-teal-dark border border-teal-100 uppercase tracking-wider">
                  {current.badge}
                </span>
              </div>

              {/* Step Headline */}
              <h3 className="text-2xl sm:text-3xl font-black text-flyora-navy tracking-tight leading-tight mb-3">
                {current.headline}
              </h3>

              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                {current.description}
              </p>

              {/* 3 Clean Bullets */}
              <div className="space-y-2.5 mb-8">
                {[
                  'Instant radar alerts for matching shipments',
                  'Encrypted 6-digit dynamic OTP handover',
                  'Direct bank escrow settlement upon delivery',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-semibold">
                    <div className="w-4 h-4 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-flyora-teal shrink-0">
                      <CheckCircle2 size={11} strokeWidth={2.5} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* ─── Apple App Store & Google Play Badges (Clean, Large, Bold MNC Standard) ─── */}
              <div className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Apple App Store */}
                  <div className="group flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white border border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5">
                    <svg className="w-8 h-8 fill-white shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.04-.49 2.66-1.24z"/>
                    </svg>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Download on the</span>
                      <span className="text-base sm:text-lg font-bold tracking-tight text-white">Apple App Store</span>
                    </div>
                  </div>

                  {/* Google Play Store */}
                  <div className="group flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white border border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5">
                    <svg className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M3.61 1.81L13.88 12 3.61 22.19c-.36-.36-.61-.92-.61-1.61V3.42c0-.69.25-1.25.61-1.61z"/>
                      <path fill="#34A853" d="M17.44 8.44l-3.56 3.56 3.56 3.56 4.02-2.32c.73-.42.73-1.1 0-1.52l-4.02-3.28z"/>
                      <path fill="#FBBC05" d="M13.88 12L3.61 1.81c.54-.54 1.46-.46 2.15-.06l11.68 6.69-3.56 3.56z"/>
                      <path fill="#EA4335" d="M13.88 12l3.56 3.56-11.68 6.69c-.69.4-1.61.48-2.15-.06L13.88 12z"/>
                    </svg>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Get it on</span>
                      <span className="text-base sm:text-lg font-bold tracking-tight text-white">Google Play</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Early Access / Launch Email Notification */}
              <div className="pt-5 border-t border-slate-200/60">
                <p className="text-xs font-semibold text-slate-500 mb-2.5">
                  Get notified when the app launches:
                </p>

                {isSubscribed ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Thank you! We've reserved your priority download invite.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNotifyMe} className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={emailNotify}
                      onChange={(e) => setEmailNotify(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-flyora-navy font-medium outline-none focus:border-flyora-teal shadow-xs transition-all"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-flyora-teal hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <span>Notify Me</span>
                      <ArrowRight size={13} />
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default MobileAppShowcase;
