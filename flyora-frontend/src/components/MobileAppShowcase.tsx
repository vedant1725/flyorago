import React, { useState } from 'react';
import {
  Smartphone, Bell, ShieldCheck, Zap,
  Sparkles, CheckCircle2, QrCode, ArrowRight,
  Plane, Package, Star, Download
} from 'lucide-react';

const MobileAppShowcase: React.FC = () => {
  const [emailNotify, setEmailNotify] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailNotify.trim()) return;
    setIsSubscribed(true);
  };

  return (
    <section
      className="relative py-20 lg:py-28 bg-[#F8FAFC] border-b border-slate-200/70 overflow-hidden select-none"
      id="mobile-app"
      aria-label="Flyorago Mobile App Coming Soon"
    >
      {/* ─── Architectural Grid Background (MNC Google/Meta Grade) ─── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-flyora-teal/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ─── Heroic Unified App Presentation Card ─── */}
        <div className="relative bg-white rounded-3xl sm:rounded-[36px] border border-slate-200/90 shadow-[0_24px_70px_rgba(10,22,40,0.07)] overflow-hidden">
          
          {/* Top Brand Ambient Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-flyora-teal via-cyan-400 to-indigo-600" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">

            {/* ══════════════════════════════════════════════════════════
                LEFT: Professional Business Woman Visual + App Phone Mockup
            ══════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 relative p-6 sm:p-10 flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/20 to-sky-50/40 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden min-h-[440px] lg:min-h-[580px]">
              
              {/* Soft Ambient Radial Lighting */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,148,136,0.12)_0%,transparent_70%)] pointer-events-none" />

              {/* Business Woman Image */}
              <div className="relative z-10 w-full max-w-[380px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(10,22,40,0.15)] border border-white">
                <img
                  src="/images/flyorago-mobile-app-showcase.webp"
                  onError={(e) => {
                    // Fallback to crisp mobile traveler asset if webp rendering
                    (e.target as HTMLImageElement).src = '/images/hero-mobile-traveler.webp';
                  }}
                  alt="Flyorago Mobile App Experience"
                  className="w-full h-auto object-cover transform hover:scale-103 transition-transform duration-700"
                />

                {/* Floating Live Badge Overlay on Image */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-md flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <img
                      src="/images/flyorago-header-icon.png"
                      alt="Logo"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-black text-flyora-navy tracking-tight">
                    Flyorago OS
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Bottom App Verification Milestone Tag */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-flyora-teal">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-flyora-navy leading-none">Instant Push Alerts & OTP</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">Real-Time Baggage Milestones</p>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 text-flyora-teal-dark border border-teal-100 uppercase">
                    v2.0 Beta
                  </span>
                </div>
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════
                RIGHT: Coming Soon Launch Details, App Store & Play Store
            ══════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
              
              <div>
                {/* Official Brand Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50/80 border border-teal-200/80 text-flyora-teal-dark font-extrabold text-[11px] uppercase tracking-widest mb-5 shadow-xs">
                  <Sparkles size={13} className="text-flyora-teal" />
                  <span>NATIVE MOBILE EXPERIENCE</span>
                </div>

                {/* Main Headline */}
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-flyora-navy tracking-tight leading-[1.14] mb-4">
                  Flyorago Mobile App <br />
                  <span className="bg-gradient-to-r from-flyora-teal via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                    Coming Soon on iOS & Android
                  </span>
                </h2>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-xl font-normal">
                  Carry the world's most trusted peer-to-peer package delivery platform in your pocket. Real-time GPS flight tracking, 6-digit dynamic handover OTP, and instant bank escrow payouts.
                </p>

                {/* 3 Core App Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { title: 'Live Trip Matches', desc: 'Instant radar alerts for matching shipments', icon: Zap },
                    { title: 'Dynamic OTP Shield', desc: 'Touchless barcode & encrypted handover', icon: QrCode },
                    { title: 'Direct Escrow Vault', desc: 'Instant payouts straight to your bank account', icon: ShieldCheck },
                  ].map((feat, i) => {
                    const FeatIcon = feat.icon;
                    return (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-flyora-teal mb-3 shadow-xs">
                          <FeatIcon size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-[13px] font-bold text-flyora-navy leading-snug">{feat.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ─── App Store & Play Store Coming Soon Badges ─── */}
                <div className="space-y-4 mb-8">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    Available Soon On Global Stores
                  </span>

                  <div className="flex flex-wrap items-center gap-3.5">
                    
                    {/* Apple App Store Button */}
                    <div className="group relative flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md transition-all hover:bg-slate-800 cursor-pointer">
                      <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.04-.49 2.66-1.24z"/>
                      </svg>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Coming Soon to</span>
                        <span className="text-sm font-bold tracking-tight text-white">Apple App Store</span>
                      </div>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[9px] font-black uppercase tracking-wider border border-teal-500/30">
                        iOS
                      </span>
                    </div>

                    {/* Google Play Store Button */}
                    <div className="group relative flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md transition-all hover:bg-slate-800 cursor-pointer">
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M3.61 1.81L13.88 12 3.61 22.19c-.36-.36-.61-.92-.61-1.61V3.42c0-.69.25-1.25.61-1.61z"/>
                        <path fill="#34A853" d="M17.44 8.44l-3.56 3.56 3.56 3.56 4.02-2.32c.73-.42.73-1.1 0-1.52l-4.02-3.28z"/>
                        <path fill="#FBBC05" d="M13.88 12L3.61 1.81c.54-.54 1.46-.46 2.15-.06l11.68 6.69-3.56 3.56z"/>
                        <path fill="#EA4335" d="M13.88 12l3.56 3.56-11.68 6.69c-.69.4-1.61.48-2.15-.06L13.88 12z"/>
                      </svg>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Coming Soon to</span>
                        <span className="text-sm font-bold tracking-tight text-white">Google Play Store</span>
                      </div>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase tracking-wider border border-cyan-500/30">
                        Android
                      </span>
                    </div>

                  </div>
                </div>

                {/* ─── Early Access / Launch Notification Form ─── */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="max-w-md">
                    <span className="text-xs font-bold text-flyora-navy mb-2 block">
                      Be the first to download when we launch:
                    </span>

                    {isSubscribed ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>You're on the VIP waitlist! We will notify you on launch day.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleNotifyMe} className="flex gap-2">
                        <input
                          type="email"
                          required
                          value={emailNotify}
                          onChange={(e) => setEmailNotify(e.target.value)}
                          placeholder="Enter your email for early access"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-flyora-navy font-medium outline-none focus:border-flyora-teal focus:bg-white transition-all"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-flyora-teal hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <span>Get Notified</span>
                          <ArrowRight size={13} />
                        </button>
                      </form>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default MobileAppShowcase;
