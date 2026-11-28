import React from 'react';
import {
  ArrowRight, Plane, Globe, Users, Package, CheckCircle, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import airportBackground from '../assets/airport-background.webp';
import heroWomanCutout from '../assets/hero-woman-cutout.webp';
import heroMobileImageV2 from '../assets/hero-mobile-traveler.webp';
import AdvancedHeroBgAnimation from './AdvancedHeroBgAnimation';
import { trackEvent } from '../utils/analytics';

const Hero: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const rawUserId = window.localStorage.getItem('flyora_user_id');
    setIsLoggedIn(Boolean(rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null'));
  }, []);

  const senderCtaTarget = isLoggedIn ? '/sender' : '/send-package-internationally';
  const travelerCtaTarget = isLoggedIn ? '/traveler' : '/travelers-earn-money';

  return (
    <section
      className="relative overflow-hidden"
      id="hero"
      aria-label="Hero section"
    >
      {/* LAYER 1 — Background: Airport (desktop full bleed) */}
      <div className="absolute inset-0 z-0">
        <img
          src={airportBackground}
          alt=""
          aria-hidden="true"
          width={1440}
          height={1440}
          decoding="async"
          className="hidden lg:block w-full h-full object-cover opacity-90"
          style={{ objectPosition: 'center center' }}
        />
      </div>

      {/* LAYER 2 — White gradient from left for text legibility */}
      <div
        className="hidden lg:block absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(245,250,255,0.98) 0%, rgba(240,252,250,0.92) 30%, rgba(235,250,248,0.72) 50%, rgba(230,248,246,0.30) 68%, transparent 100%)',
        }}
      />

      {/* LAYER 3 — World Map Dot Pattern overlay */}
      <div
        className="hidden lg:block absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(13,148,136,0.18) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* LAYER 4 — SVG Airplane Decoration */}
      <svg
        className="hidden lg:block absolute inset-0 w-full h-full z-20 pointer-events-none"
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g transform="translate(610,158) rotate(-30)" className="plane-icon" opacity="0.85">
          <rect x="-28" y="-5" width="56" height="10" rx="5" fill="white" />
          <polygon points="0,-4 -22,14 22,14" fill="white" opacity="0.9" />
          <polygon points="26,-4 18,-14 34,-4" fill="white" opacity="0.9" />
          <ellipse cx="-10" cy="14" rx="8" ry="4" fill="white" opacity="0.75" />
          <ellipse cx="10" cy="14" rx="8" ry="4" fill="white" opacity="0.75" />
        </g>
      </svg>

      {/* LAYER 4.5 — Woman Cutout (Desktop Foreground Layer) */}
      <div className="hidden lg:flex absolute right-0 bottom-0 lg:inset-x-0 lg:top-10 z-[25] pointer-events-none justify-end lg:justify-center lg:translate-x-32 translate-y-2 lg:translate-y-6 items-end h-[55vh] lg:h-auto overflow-hidden sm:overflow-visible">
        <img
          src={heroWomanCutout}
          alt="Verified Flyorago international traveler carrying luggage"
          width={1100}
          height={733}
          {...({ fetchpriority: 'high' } as Record<string, string>)}
          decoding="async"
          className="h-full w-auto object-contain object-bottom max-w-none origin-bottom-right scale-[1.15] lg:scale-100"
        />
      </div>

      {/* LAYER 5 — Unified Responsive Content (Single H1 across mobile and desktop) */}
      <div className="relative z-30 w-full pt-[120px] lg:pt-36 lg:pb-16 flex flex-col justify-center lg:min-h-[100dvh] bg-gradient-to-b from-white via-flyora-gray-50/50 to-flyora-teal/10 lg:bg-none overflow-hidden lg:overflow-visible">
        {/* Mobile Background Abstract Elements */}
        <div className="lg:hidden absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-flyora-teal/10 blur-[60px] pointer-events-none" />
        <div className="lg:hidden absolute bottom-1/4 left-0 -ml-16 w-56 h-56 rounded-full bg-flyora-blue/5 blur-[50px] pointer-events-none" />

        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-14 items-center">
            <div className="max-w-xl w-full mx-auto lg:mx-0 flex flex-col items-center text-center lg:items-start lg:text-left z-30">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-xl border border-flyora-gray-200/60 lg:border-flyora-teal/25 rounded-full p-1.5 pr-4 lg:pl-3 lg:py-2 mb-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] lg:shadow-sm w-max">
                <div className="lg:hidden w-7 h-7 rounded-full bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-inner">
                  <Plane size={13} className="text-white -rotate-45" />
                </div>
                <Plane size={13} className="hidden lg:inline text-flyora-teal -rotate-45" />
                <span className="text-[11px] lg:text-xs font-black lg:font-semibold text-flyora-navy lg:text-flyora-teal-dark tracking-widest lg:tracking-wide uppercase lg:normal-case">
                  Peer-to-Peer Global Package Delivery
                </span>
              </div>

              {/* Single Semantic H1 */}
              <h1
                className="font-black text-flyora-navy leading-[1.1] lg:leading-[1.07] tracking-tight mb-4 lg:mb-5 text-[2.25rem] sm:text-[2.75rem] lg:text-[clamp(3rem,4.5vw,4.5rem)] w-full"
                id="hero-headline"
              >
                Your Journey
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Carries More
                </span>
                <br />
                Than You.
              </h1>

              {/* Description */}
              <p className="text-[14px] sm:text-[15px] lg:text-base text-flyora-gray-600 leading-relaxed mb-8 lg:mb-7 max-w-[300px] sm:max-w-sm font-medium lg:font-normal">
                Connect with verified travelers who have extra luggage space and ship your
                packages safely, affordably, and reliably worldwide.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col lg:flex-row lg:flex-wrap gap-3.5 lg:gap-3 mb-8 lg:mb-10 w-full max-w-[320px] sm:max-w-[340px] lg:max-w-none lg:w-auto relative z-30">
                <Link
                  id="hero-find-traveler-btn"
                  to={senderCtaTarget}
                  onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'find_traveler' })}
                  className="inline-flex items-center justify-center lg:justify-start gap-3 lg:gap-2.5 w-full lg:w-auto py-4 lg:py-3.5 lg:px-6 bg-flyora-navy text-white font-black lg:font-bold text-[15px] lg:text-sm rounded-2xl lg:rounded-xl shadow-[0_8px_25px_rgba(10,22,40,0.25)] lg:shadow-[0_6px_20px_rgba(10,22,40,0.30)] hover:bg-flyora-navy-light lg:hover:-translate-y-0.5 lg:hover:shadow-[0_10px_28px_rgba(10,22,40,0.38)] transition-all duration-300 active:scale-95"
                >
                  Find a Traveler
                  <ArrowRight size={16} />
                </Link>
                <Link
                  id="hero-post-trip-btn"
                  to={travelerCtaTarget}
                  onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'post_trip' })}
                  className="inline-flex items-center justify-center lg:justify-start gap-3 lg:gap-2.5 w-full lg:w-auto py-4 lg:py-3.5 lg:px-6 bg-white/80 lg:bg-white/85 backdrop-blur-xl lg:backdrop-blur-sm text-flyora-navy font-black lg:font-bold text-[15px] lg:text-sm rounded-2xl lg:rounded-xl border lg:border-2 border-flyora-gray-200/80 lg:border-flyora-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.04)] lg:shadow-sm hover:bg-white lg:hover:border-flyora-teal/50 lg:hover:text-flyora-teal lg:hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                >
                  <Send size={18} className="lg:hidden text-flyora-teal -rotate-45 -ml-1 mt-0.5" />
                  <Plane size={16} className="hidden lg:inline -rotate-45" />
                  Post Your Trip
                  <ArrowRight size={16} className="hidden lg:inline" />
                </Link>
              </div>

              {/* Desktop Stats Row */}
              <div className="hidden lg:grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-6">
                {[
                  { icon: <Users size={16} />, value: '50K+', label: 'Happy Users' },
                  { icon: <Globe size={16} />, value: '120+', label: 'Countries' },
                  { icon: <Package size={16} />, value: '250K+', label: 'Shipments' },
                  { icon: <CheckCircle size={16} />, value: '99.8%', label: 'Success Rate' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-flyora-teal">{s.icon}</span>
                    <div>
                      <p className="text-base font-black text-flyora-navy leading-none">{s.value}</p>
                      <p className="text-[10px] text-flyora-gray-500 leading-none mt-0.5 whitespace-nowrap">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block pointer-events-none" />
          </div>
        </div>

        {/* Mobile Hero Image */}
        <div className="lg:hidden relative w-full flex justify-end mt-6 z-10 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <AdvancedHeroBgAnimation />
          </div>
          <div className="absolute top-10 -right-10 w-[120%] h-[100%] bg-gradient-to-t from-flyora-teal/30 via-flyora-teal/5 to-transparent z-10 blur-2xl rounded-t-full" />
          <img
            src={heroMobileImageV2}
            alt="Flyorago verified international traveler"
            width={880}
            height={1320}
            {...({ fetchpriority: 'high' } as Record<string, string>)}
            decoding="async"
            className="w-full max-w-[440px] object-contain drop-shadow-[0_25px_45px_rgba(13,148,136,0.35)] z-20 scale-[1.3] origin-top-right -mr-6 pb-12 relative"
          />
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-30" />
    </section>
  );
};

export default Hero;
