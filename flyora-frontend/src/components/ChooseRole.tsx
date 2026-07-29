import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane, Package, CheckCircle2, ArrowRight,
  Sparkles, DollarSign, ShieldCheck, Zap,
  TrendingUp, Clock, ChevronRight, UserCheck, Lock
} from 'lucide-react';

// ─── useInView Hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const ChooseRole: React.FC = () => {
  const [sectionRef, inView] = useInView(0.1);
  const [activeTab, setActiveTab] = useState<'all' | 'traveller' | 'sender'>('all');
  const [hoveredRole, setHoveredRole] = useState<'traveller' | 'sender' | null>(null);

  return (
    <section
      className="relative py-24 lg:py-28 overflow-hidden bg-slate-50/60"
      id="choose-role"
      aria-label="Choose your role"
    >
      {/* ── Ambient Background Blur Elements ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={sectionRef}>

        {/* ── Section Header ── */}
        <div
          className="text-center mb-12 lg:mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(28px)',
            transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
              <Zap size={12} className="text-teal-600" />
              CHOOSE YOUR ROLE
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
            Built for{' '}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Travellers
            </span>{' '}
            and{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
              Senders
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Whether you're flying internationally or sending a package, Flyorago gives each user a clear, automated, and secure workflow.
          </p>

          {/* Interactive Role Switcher Pills */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-200/60 border border-slate-200 shadow-inner">
            {[
              { id: 'all', label: 'View Both Options' },
              { id: 'traveller', label: '✈️ For Travellers' },
              { id: 'sender', label: '📦 For Senders' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Dual Cards Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* ══════════════════════════════════════════════════════════
              CARD 1: FOR TRAVELLERS (Teal / Cyan Palette)
          ══════════════════════════════════════════════════════════ */}
          {(activeTab === 'all' || activeTab === 'traveller') && (
            <div
              className={`group relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 overflow-hidden ${
                activeTab === 'traveller' ? 'lg:col-span-2 max-w-3xl mx-auto w-full' : ''
              }`}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0) scale(1)' : 'translateY(36px) scale(0.97)',
                transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 150ms',
                background: hoveredRole === 'traveller'
                  ? 'linear-gradient(145deg, #ffffff 0%, #f0fdfa 100%)'
                  : '#ffffff',
                border: '1.5px solid rgba(13,148,136,0.2)',
                boxShadow: hoveredRole === 'traveller'
                  ? '0 24px 60px rgba(13,148,136,0.14), 0 4px 20px rgba(0,0,0,0.04)'
                  : '0 8px 30px rgba(15,23,42,0.05)',
              }}
              onMouseEnter={() => setHoveredRole('traveller')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              {/* Top Accent Rainbow Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-600" />

              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Plane size={22} className="-rotate-45" />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <TrendingUp size={12} />
                    Earn Up to $350/trip
                  </span>
                </div>

                {/* Role Title */}
                <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  For Travellers
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
                  Turn unused luggage allowance into extra cash on flights you are already taking.
                </p>

                {/* Interactive Workflow Steps */}
                <div className="space-y-3.5 mb-8">
                  {[
                    { title: 'List Your Trip', desc: 'Add flight details, travel dates & available luggage space (kg).' },
                    { title: 'Accept Parcel Requests', desc: 'Screen verified sender requests and agree on delivery rewards.' },
                    { title: 'Deliver & Earn', desc: 'Hand over the package upon arrival & receive instant escrow payout.' },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100/90 group-hover:border-teal-200/60 group-hover:bg-teal-50/30 transition-all duration-300"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{step.title}</h4>
                        <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Mini Preview Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white mb-8 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400">Live Trip Mockup</span>
                    <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md border border-teal-500/30">Verified Flight</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>NYC ✈ London</span>
                    <span className="text-teal-400 font-black">$280 Est. Earnings</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/signup"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-[1.01]"
              >
                <Sparkles size={16} />
                <span>Post Your Trip & Start Earning</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              CARD 2: FOR SENDERS (Indigo / Purple Palette)
          ══════════════════════════════════════════════════════════ */}
          {(activeTab === 'all' || activeTab === 'sender') && (
            <div
              className={`group relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 overflow-hidden ${
                activeTab === 'sender' ? 'lg:col-span-2 max-w-3xl mx-auto w-full' : ''
              }`}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0) scale(1)' : 'translateY(36px) scale(0.97)',
                transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 300ms',
                background: hoveredRole === 'sender'
                  ? 'linear-gradient(145deg, #ffffff 0%, #f5f3ff 100%)'
                  : '#ffffff',
                border: '1.5px solid rgba(99,102,241,0.2)',
                boxShadow: hoveredRole === 'sender'
                  ? '0 24px 60px rgba(99,102,241,0.14), 0 4px 20px rgba(0,0,0,0.04)'
                  : '0 8px 30px rgba(15,23,42,0.05)',
              }}
              onMouseEnter={() => setHoveredRole('sender')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              {/* Top Accent Rainbow Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Package size={22} />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Zap size={12} />
                    Save Up to 60% on Shipping
                  </span>
                </div>

                {/* Role Title */}
                <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  For Senders
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
                  Send packages globally through verified travellers on trusted international routes.
                </p>

                {/* Interactive Workflow Steps */}
                <div className="space-y-3.5 mb-8">
                  {[
                    { title: 'List Your Package', desc: 'Specify item details, weight (kg) & destination city.' },
                    { title: 'Get Matched', desc: 'Connect with identity-verified travellers flying your route.' },
                    { title: 'Track & Receive', desc: 'Real-time tracking & delivery confirmation with escrow release.' },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100/90 group-hover:border-indigo-200/60 group-hover:bg-indigo-50/30 transition-all duration-300"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{step.title}</h4>
                        <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Mini Preview Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 text-white mb-8 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Escrow Protected</span>
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">2-Day Delivery</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>Electronics (3.5 kg)</span>
                    <span className="text-indigo-400 font-black">Saved 55% vs Courier</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/signup"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-[1.01]"
              >
                <Sparkles size={16} />
                <span>Send a Package & Save Big</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default ChooseRole;
