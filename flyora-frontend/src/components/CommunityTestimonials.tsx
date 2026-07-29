import React, { useEffect, useRef, useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, Quote, Sparkles, MapPin, Plane, Lock, Shield, Zap } from 'lucide-react';

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

// ─── Testimonials Data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Vikram S.',
    role: 'Verified Traveller',
    route: 'JFK ➔ LHR',
    quote: 'I turned my unused luggage space into extra earnings while helping someone receive an important package safely.',
    rating: 5,
    avatarBg: 'from-teal-500 to-cyan-500',
    color: '#0d9488',
  },
  {
    name: 'Elena R.',
    role: 'Verified Sender',
    route: 'CDG ➔ DXB',
    quote: 'Finding a trusted traveller was simple, transparent, and much more convenient than traditional alternatives.',
    rating: 5,
    avatarBg: 'from-indigo-500 to-purple-500',
    color: '#4f46e5',
  },
  {
    name: 'Marcus K.',
    role: 'Community Member',
    route: 'SIN ➔ SYD',
    quote: 'The verification process and delivery updates gave me confidence throughout the entire journey.',
    rating: 5,
    avatarBg: 'from-emerald-500 to-teal-500',
    color: '#059669',
  },
  {
    name: 'Sofia M.',
    role: 'Verified Traveller',
    route: 'YYZ ➔ LHR',
    quote: 'I turned my unused luggage space into extra earnings while helping someone receive an important package safely.',
    rating: 5,
    avatarBg: 'from-amber-500 to-orange-500',
    color: '#d97706',
  },
  {
    name: 'David P.',
    role: 'Verified Sender',
    route: 'FRA ➔ JFK',
    quote: 'Finding a trusted traveller was simple, transparent, and much more convenient than traditional alternatives.',
    rating: 5,
    avatarBg: 'from-sky-500 to-blue-600',
    color: '#0284c7',
  },
  {
    name: 'Aisha N.',
    role: 'Community Member',
    route: 'LHR ➔ BOM',
    quote: 'The verification process and delivery updates gave me confidence throughout the entire journey.',
    rating: 5,
    avatarBg: 'from-purple-500 to-pink-500',
    color: '#9333ea',
  },
];

const TRUST_BADGES = [
  { label: 'KYC Verified', icon: ShieldCheck, color: '#0d9488', bg: 'rgba(13,148,136,0.08)' },
  { label: 'Escrow Protected', icon: Lock, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
  { label: 'Trusted Community', icon: Shield, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
  { label: 'Secure Deliveries', icon: CheckCircle2, color: '#0284c7', bg: 'rgba(2,132,199,0.08)' },
];

const CommunityTestimonials: React.FC = () => {
  const [sectionRef, inView] = useInView(0.1);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-28 bg-slate-50/70 overflow-hidden"
      id="testimonials"
      aria-label="Community Testimonials"
    >
      {/* ── Background Glow & Keyframe CSS ── */}
      <style>{`
        @keyframes marqueeSmooth {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-smooth {
          display: flex;
          width: max-content;
          animation: marqueeSmooth 35s linear infinite;
        }
        .animate-marquee-smooth:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-teal-500/8 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Header ── */}
        <div
          className="text-center mb-14"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(28px)',
            transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
              <Sparkles size={12} className="text-teal-600" />
              REAL EXPERIENCES
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Travellers.
            </span>{' '}
            Loved by{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
              Senders.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            People use Flyorago to make international shipping simpler, safer, and more affordable through trusted community connections.
          </p>
        </div>

      </div>

      {/* ── Marquee Track Container (Full Width) ── */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Fade Shadows */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none" />

        {/* Double array track for 100% smooth infinite looping */}
        <div className="animate-marquee-smooth flex gap-6 px-3">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)] hover:border-teal-300/80 hover:-translate-y-1.5 transition-all duration-400 flex flex-col justify-between w-[340px] sm:w-[380px] shrink-0 whitespace-normal"
            >
              {/* Top Row: Stars + Route Badge */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* Gold Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Route Pill */}
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Plane size={10} className="text-teal-600" />
                    {item.route}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-slate-700 font-medium text-[13.5px] leading-relaxed mb-6 italic relative">
                  "{item.quote}"
                </p>
              </div>

              {/* Profile Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Initial Avatar */}
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight mb-0.5">{item.name}</h4>
                    <p className="text-[11px] font-bold text-slate-500">{item.role}</p>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80">
                  <ShieldCheck size={12} className="text-teal-600" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Trust Badges Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-12">
        <div
          className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1) 400ms',
          }}
        >
          {TRUST_BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.03]"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: badge.bg }}>
                  <Icon size={14} style={{ color: badge.color }} />
                </div>
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};

export default CommunityTestimonials;
