import React, { useEffect, useRef, useState } from 'react';
import { Users, Globe, Package, Shield, Star, Sparkles, CheckCircle2 } from 'lucide-react';

// ─── Custom Hooks ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement>, boolean] {
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

// ─── Animated Number Counter Component ────────────────────────────────────────
const CountUp: React.FC<{ end: number; suffix?: string; decimals?: number; inView: boolean }> = ({
  end, suffix = '', decimals = 0, inView
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const duration = 1800; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(ease * end);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [inView, end]);

  return (
    <span>
      {decimals > 0 ? value.toFixed(decimals) : Math.round(value)}
      {suffix}
    </span>
  );
};

// ─── Stats Data ───────────────────────────────────────────────────────────────
const STATS_DATA = [
  {
    id: 'stat-users',
    numeric: 50,
    suffix: 'K+',
    decimals: 0,
    label: 'Happy Users',
    desc: 'Verified worldwide',
    icon: Users,
    color: '#0d9488', // Teal
    light: 'rgba(13,148,136,0.08)',
    border: 'rgba(13,148,136,0.2)',
  },
  {
    id: 'stat-countries',
    numeric: 120,
    suffix: '+',
    decimals: 0,
    label: 'Countries',
    desc: 'Global coverage',
    icon: Globe,
    color: '#4f46e5', // Indigo
    light: 'rgba(79,70,229,0.08)',
    border: 'rgba(79,70,229,0.2)',
  },
  {
    id: 'stat-shipments',
    numeric: 250,
    suffix: 'K+',
    decimals: 0,
    label: 'Shipments',
    desc: 'Delivered safely',
    icon: Package,
    color: '#0284c7', // Sky Blue
    light: 'rgba(2,132,199,0.08)',
    border: 'rgba(2,132,199,0.2)',
  },
  {
    id: 'stat-success',
    numeric: 99.8,
    suffix: '%',
    decimals: 1,
    label: 'Success Rate',
    desc: 'On-time delivery',
    icon: Shield,
    color: '#059669', // Emerald
    light: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.2)',
  },
  {
    id: 'stat-rating',
    numeric: 4.9,
    suffix: '/5',
    decimals: 1,
    label: 'Average Rating',
    desc: 'Community rated',
    icon: Star,
    color: '#d97706', // Gold Amber
    light: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.2)',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const Stats: React.FC = () => {
  const [sectionRef, inView] = useInView(0.12);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-24 overflow-hidden bg-white"
      id="stats"
      aria-label="Flyorago platform statistics"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-teal-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <div
          className="text-center mb-12 lg:mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              BUILT ON TRUST
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight">
            Numbers That Speak for Themselves
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium">
            Real metrics driving trusted international luggage sharing and courier delivery worldwide.
          </p>
        </div>

        {/* ── 5-Column Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 mb-12">
          {STATS_DATA.map((stat, idx) => {
            const Icon = stat.icon;
            const isHovered = hoveredStat === stat.id;

            return (
              <div
                key={stat.id}
                id={stat.id}
                className="group relative rounded-3xl p-5 sm:p-6 text-center cursor-default transition-all duration-400 overflow-hidden flex flex-col justify-between"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
                  transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${idx * 90}ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${idx * 90}ms`,
                  background: isHovered ? stat.light : '#ffffff',
                  border: `1.5px solid ${isHovered ? stat.border : 'rgba(226,232,240,0.8)'}`,
                  boxShadow: isHovered
                    ? `0 20px 45px rgba(0,0,0,0.06), 0 4px 16px ${stat.light}`
                    : '0 2px 12px rgba(15,23,42,0.03)',
                }}
                onMouseEnter={() => setHoveredStat(stat.id)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                {/* Top Accent Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-400"
                  style={{
                    background: stat.color,
                    opacity: isHovered ? 1 : 0.6,
                  }}
                />

                {/* Icon Box */}
                <div className="flex justify-center mb-4 pt-1">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs"
                    style={{
                      background: isHovered ? stat.color : stat.light,
                      transform: isHovered ? 'scale(1.1) rotate(-3deg)' : 'scale(1)',
                    }}
                  >
                    <Icon
                      size={22}
                      style={{
                        color: isHovered ? '#ffffff' : stat.color,
                        transition: 'color 0.25s',
                      }}
                    />
                  </div>
                </div>

                {/* Counter Value */}
                <div className="mb-2">
                  <div
                    className="text-3xl sm:text-4xl font-black tracking-tight leading-none"
                    style={{ color: stat.color }}
                  >
                    <CountUp
                      end={stat.numeric}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                      inView={inView}
                    />
                  </div>
                </div>

                {/* Labels */}
                <div>
                  <p className="text-[12px] sm:text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {stat.desc}
                  </p>
                </div>

                {/* Bottom Shine */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-400"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                    opacity: isHovered ? 1 : 0,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* ── Community Star Rating Banner ── */}
        <div
          className="max-w-xl mx-auto rounded-2xl p-4 sm:p-5 bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-500 hover:shadow-md"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1) 500ms',
          }}
        >
          {/* Avatar Stack + Stars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={18} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-lg font-black text-slate-900">4.9/5</span>
          </div>

          {/* Description Text */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <CheckCircle2 size={15} className="text-teal-600 shrink-0" />
            <span>Average Rating from our community</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Stats;
