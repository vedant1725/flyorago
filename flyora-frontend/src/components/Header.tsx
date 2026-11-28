import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Globe, ChevronDown, LayoutGrid,
  Send, Briefcase, FileText, Users, Phone,
  Sparkles, ShieldCheck, ArrowRight
} from 'lucide-react';
import Button from './ui/Button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');

  const location = useLocation();
  const currentPath = location.pathname;
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const rawUserId = window.localStorage.getItem('flyora_user_id');
    setIsLoggedIn(Boolean(rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null'));
  }, [currentPath]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setIsLangOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <header
      className={`
        fixed left-0 right-0 z-50 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
        ${isScrolled
          ? 'top-2 sm:top-2.5 px-3 sm:px-8'
          : 'top-3.5 sm:top-6 px-3.5 sm:px-8'
        }
      `}
    >
      <div
        className={`
          mx-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
          ${isScrolled ? 'max-w-6xl' : 'max-w-7xl'}
        `}
      >
        {/* Floating Pill Container: On-scroll shrink-expand physics (MNC Apple/Stripe dynamic island feel) */}
        <div
          className={`
            w-full transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
            rounded-full
            ${isScrolled
              ? 'bg-white/95 backdrop-blur-2xl shadow-[0_16px_50px_rgba(10,22,40,0.14)] border border-gray-200/90 py-1.5 px-3 sm:px-5 scale-[0.985]'
              : 'bg-white/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(10,22,40,0.08)] border border-white/70 py-2.5 px-3.5 sm:px-6 scale-100'
            }
          `}
        >
          <div
            className={`
              flex items-center justify-between transition-all duration-500 ease-out
              ${isScrolled ? 'h-11 sm:h-13' : 'h-13 sm:h-16'}
            `}
          >
            {/* ─── Left: Official Standalone Logo + FLYORAGO Brand Wordmark ─── */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0" id="flyora-logo">
              <div className="relative flex items-center justify-center p-0.5">
                {/* Luminous Ambient Glow Backdrop */}
                <div className="absolute inset-0 rounded-full bg-flyora-teal/25 blur-md group-hover:bg-flyora-teal/40 transition-all duration-300" />
                <img
                  src="/images/flyorago-header-icon.png"
                  alt="Flyorago Official Logo"
                  className={`
                    relative object-contain transform group-hover:scale-108 transition-all duration-500 drop-shadow-[0_4px_10px_rgba(13,148,136,0.3)]
                    ${isScrolled ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12'}
                  `}
                />
              </div>

              {/* Brand Wordmark (Visible everywhere on Mobile and Desktop so it never looks empty) */}
              <div className="flex flex-col leading-none select-none">
                <span
                  className={`
                    font-black tracking-tight text-flyora-navy transition-all duration-300
                    ${isScrolled ? 'text-[16px] sm:text-[18px]' : 'text-[18px] sm:text-[20px]'}
                  `}
                >
                  FLYORA<span className="text-flyora-teal">GO</span>
                </span>
                <span
                  className={`
                    font-extrabold text-flyora-teal-dark tracking-widest uppercase transition-all duration-300
                    ${isScrolled ? 'text-[7.5px] sm:text-[8px] opacity-80' : 'text-[8px] sm:text-[8.5px] opacity-90'}
                  `}
                >
                  Ship Smarter
                </span>
              </div>
            </Link>

            {/* ─── Center / Right Desktop Navigation ─── */}
            <nav className="hidden xl:flex items-center gap-1" id="desktop-nav">
              {/* Link 1: How It Works */}
              <Link
                to="/how-it-works"
                className={`px-3 py-1.5 text-[13.5px] font-semibold rounded-full transition-all duration-200 ${
                  currentPath === '/how-it-works'
                    ? 'text-flyora-teal bg-flyora-teal/10 font-bold'
                    : 'text-flyora-navy/85 hover:text-flyora-teal hover:bg-black/5'
                }`}
              >
                How It Works
              </Link>

              {/* Dropdown: Services */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('services')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-[13.5px] font-semibold rounded-full transition-all duration-200 ${
                    activeDropdown === 'services' || ['/services', '/send-package-internationally', '/travelers-earn-money'].includes(currentPath)
                      ? 'text-flyora-teal bg-flyora-teal/10 font-bold'
                      : 'text-flyora-navy/85 hover:text-flyora-teal hover:bg-black/5'
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${activeDropdown === 'services' ? 'rotate-180 text-flyora-teal' : 'opacity-70'}`}
                  />
                </button>

                {/* Dropdown Menu Card with Solid White Background & High Contrast */}
                {activeDropdown === 'services' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(10,22,40,0.18)] border border-gray-100 p-3 flex flex-col gap-1.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/send-package-internationally"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-teal-50/70 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-100/70 text-flyora-teal flex items-center justify-center flex-shrink-0 group-hover:bg-flyora-teal group-hover:text-white transition-all shadow-sm">
                        <Send size={16} />
                      </div>
                      <div>
                        <div className="text-[13.5px] font-extrabold text-flyora-navy group-hover:text-flyora-teal transition-colors">
                          For Senders
                        </div>
                        <div className="text-[12px] text-gray-500 leading-snug mt-0.5">
                          Send packages worldwide with verified travelers
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/travelers-earn-money"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-blue-50/70 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <div className="text-[13.5px] font-extrabold text-flyora-navy group-hover:text-blue-600 transition-colors">
                          For Travelers
                        </div>
                        <div className="text-[12px] text-gray-500 leading-snug mt-0.5">
                          Earn up to $300 per trip by sharing baggage
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/services"
                      className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-emerald-50/70 transition-all group border-t border-gray-100 mt-0.5 pt-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="text-[13.5px] font-extrabold text-flyora-navy group-hover:text-emerald-600 transition-colors">
                          All Protection Services
                        </div>
                        <div className="text-[12px] text-gray-500 leading-snug mt-0.5">
                          Escrow vault, insurance & verified live tracking
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Link 3: About */}
              <Link
                to="/about"
                className={`px-3 py-1.5 text-[13.5px] font-semibold rounded-full transition-all duration-200 ${
                  currentPath === '/about'
                    ? 'text-flyora-teal bg-flyora-teal/10 font-bold'
                    : 'text-flyora-navy/85 hover:text-flyora-teal hover:bg-black/5'
                }`}
              >
                About
              </Link>

              {/* Link 4: Blog / Stories */}
              <Link
                to="/blog"
                className={`px-3 py-1.5 text-[13.5px] font-semibold rounded-full transition-all duration-200 ${
                  currentPath === '/blog'
                    ? 'text-flyora-teal bg-flyora-teal/10 font-bold'
                    : 'text-flyora-navy/85 hover:text-flyora-teal hover:bg-black/5'
                }`}
              >
                Blog
              </Link>
            </nav>

            {/* ─── Right CTA Section (Matches Reference Button Structure) ─── */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative mr-1">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 text-[12px] font-bold text-flyora-navy/80 hover:text-flyora-navy px-2.5 py-1.5 rounded-full hover:bg-black/5 transition-colors"
                >
                  <Globe size={13} className="text-flyora-teal" />
                  <span>{selectedLang}</span>
                  <ChevronDown size={11} className="opacity-60" />
                </button>

                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-2 w-28 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    {['EN', 'GU', 'HI'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLang(lang);
                          setIsLangOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-flyora-teal/10 hover:text-flyora-teal text-gray-700"
                      >
                        {lang === 'EN' ? 'English' : lang === 'GU' ? 'ગુજરાતી' : 'हिंदी'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button
                    variant="teal"
                    size="sm"
                    iconRight={<LayoutGrid size={14} />}
                    className="rounded-full shadow-md hover:shadow-teal text-[13px] py-2 px-4.5 font-bold"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Reference Image Style: "Log in" Text Link */}
                  <Link
                    to="/login"
                    className="text-[13.5px] font-bold text-flyora-navy/90 hover:text-flyora-teal transition-colors px-3.5 py-1.5 rounded-full hover:bg-black/5"
                  >
                    Log in
                  </Link>

                  {/* Reference Image Style: Vibrant Rounded Blue/Teal "Sign up" Pill Button */}
                  <Link to="/signup">
                    <button
                      className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-flyora-teal to-flyora-blue text-white text-[13px] font-extrabold px-5 py-2 rounded-full shadow-[0_4px_16px_rgba(13,148,136,0.35)] hover:shadow-[0_6px_22px_rgba(27,79,216,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      id="header-cta-btn"
                    >
                      <span>Sign up</span>
                      <ArrowRight size={13} className="stroke-[2.5]" />
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* ─── Compact Mobile Hamburger ─── */}
            <button
              className="xl:hidden relative w-9 h-9 flex items-center justify-center rounded-full text-flyora-navy bg-gray-100/80 hover:bg-gray-200/80 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
              id="mobile-menu-toggle"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Accordion / Floating Menu ─── */}
        <div
          className={`
            xl:hidden overflow-hidden transition-all duration-300 ease-in-out mt-2
            ${isMenuOpen ? 'max-h-[85vh] opacity-100 shadow-2xl border border-gray-200/90' : 'max-h-0 opacity-0'}
            bg-white/98 backdrop-blur-2xl rounded-3xl
          `}
          id="mobile-menu"
        >
          <div className="px-5 py-4 flex flex-col gap-1.5 max-h-[75vh] overflow-y-auto">
            <Link
              to="/how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-semibold text-flyora-navy hover:text-flyora-teal hover:bg-teal-50/50 rounded-xl transition-colors"
            >
              <Sparkles size={16} className="text-flyora-teal" />
              <span>How It Works</span>
            </Link>

            <Link
              to="/send-package-internationally"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-semibold text-flyora-navy hover:text-flyora-teal hover:bg-teal-50/50 rounded-xl transition-colors"
            >
              <Send size={16} className="text-flyora-teal" />
              <span>For Senders</span>
            </Link>

            <Link
              to="/travelers-earn-money"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-semibold text-flyora-navy hover:text-flyora-teal hover:bg-teal-50/50 rounded-xl transition-colors"
            >
              <Briefcase size={16} className="text-flyora-teal" />
              <span>For Travelers</span>
            </Link>

            <Link
              to="/services"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-semibold text-flyora-navy hover:text-flyora-teal hover:bg-teal-50/50 rounded-xl transition-colors"
            >
              <ShieldCheck size={16} className="text-flyora-teal" />
              <span>All Protection Services</span>
            </Link>

            <div className="border-t border-gray-100 my-1" />

            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 text-[14px] font-medium text-flyora-gray-600 hover:text-flyora-teal rounded-xl"
            >
              <Users size={16} className="text-gray-400" />
              <span>About Flyorago</span>
            </Link>

            <Link
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 text-[14px] font-medium text-flyora-gray-600 hover:text-flyora-teal rounded-xl"
            >
              <FileText size={16} className="text-gray-400" />
              <span>Blog & Travel Stories</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 text-[14px] font-medium text-flyora-gray-600 hover:text-flyora-teal rounded-xl"
            >
              <Phone size={16} className="text-gray-400" />
              <span>Contact & Help Center</span>
            </Link>

            {/* Mobile Auth CTAs */}
            <div className="pt-3 pb-2 border-t border-gray-100 mt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="teal" size="lg" fullWidth iconRight={<LayoutGrid size={16} />}>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="md" fullWidth className="rounded-full font-bold">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-flyora-teal to-flyora-blue text-white text-[13.5px] font-extrabold py-2.5 rounded-full shadow-md">
                      <span>Sign up</span>
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
