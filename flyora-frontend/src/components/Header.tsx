import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Plane, Globe, ChevronDown, LayoutGrid,
  Send, Briefcase, HelpCircle, FileText, Users, Phone,
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
      setIsScrolled(window.scrollY > 15);
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
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
        ${isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_24px_rgba(10,22,40,0.06)] border-b border-gray-100/90 py-2.5'
          : 'bg-white/70 backdrop-blur-sm lg:bg-transparent py-3 lg:py-4'
        }
      `}
    >
      <div className="container-flyora max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* ─── Logo ──────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" id="flyora-logo">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-teal group-hover:shadow-[0_8px_25px_rgba(13,148,136,0.45)] transition-all duration-300 group-hover:scale-105">
                <Plane size={19} className="text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-flyora-blue rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl sm:text-22 font-black tracking-tight text-flyora-navy">
                FLYORA<span className="text-flyora-teal">GO</span>
              </span>
              <span className="text-[9px] font-semibold text-flyora-gray-500 tracking-widest uppercase">
                Ship Smarter
              </span>
            </div>
          </Link>

          {/* ─── Desktop Top MNC Navigation (Clean Grouped Menu) ────────────────────── */}
          <nav className="hidden xl:flex items-center gap-1.5" id="desktop-nav">
            {/* Simple Direct Link: How It Works */}
            <Link
              to="/how-it-works"
              className={`px-3.5 py-2 text-[14px] font-semibold rounded-lg transition-all duration-200 ${
                currentPath === '/how-it-works'
                  ? 'text-flyora-teal bg-flyora-teal/10'
                  : 'text-flyora-navy/80 hover:text-flyora-teal hover:bg-black/5'
              }`}
            >
              How It Works
            </Link>

            {/* Dropdown 1: Solutions (Services, Senders, Travelers) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('solutions')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-3.5 py-2 text-[14px] font-semibold rounded-lg transition-all duration-200 ${
                  activeDropdown === 'solutions' || ['/services', '/send-package-internationally', '/travelers-earn-money'].includes(currentPath)
                    ? 'text-flyora-teal bg-flyora-teal/10'
                    : 'text-flyora-navy/80 hover:text-flyora-teal hover:bg-black/5'
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180 text-flyora-teal' : 'opacity-70'}`}
                />
              </button>

              {/* Flyout Menu */}
              {activeDropdown === 'solutions' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white/98 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(10,22,40,0.12)] border border-gray-100 p-2.5 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/send-package-internationally"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-flyora-teal/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-flyora-teal flex items-center justify-center flex-shrink-0 group-hover:bg-flyora-teal group-hover:text-white transition-colors">
                      <Send size={16} />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-bold text-flyora-navy group-hover:text-flyora-teal transition-colors">
                        For Senders
                      </div>
                      <div className="text-[11.5px] text-flyora-gray-500 leading-snug">
                        Match with verified travelers flying worldwide
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/travelers-earn-money"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-flyora-teal/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-bold text-flyora-navy group-hover:text-flyora-teal transition-colors">
                        For Travelers
                      </div>
                      <div className="text-[11.5px] text-flyora-gray-500 leading-snug">
                        Monetize extra luggage space & earn up to $300
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/services"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-flyora-teal/5 transition-colors group border-t border-gray-100/80 mt-1 pt-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-bold text-flyora-navy group-hover:text-flyora-teal transition-colors">
                        All Logistics Services
                      </div>
                      <div className="text-[11.5px] text-flyora-gray-500 leading-snug">
                        Escrow insurance, verified QR & tracking
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Direct Link: Popular Corridors */}
            <Link
              to="/#popular-routes"
              className="px-3.5 py-2 text-[14px] font-semibold text-flyora-navy/80 hover:text-flyora-teal hover:bg-black/5 rounded-lg transition-all duration-200"
            >
              Popular Routes
            </Link>

            {/* Dropdown 2: Company & Insights (About, Blog, Contact) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-3.5 py-2 text-[14px] font-semibold rounded-lg transition-all duration-200 ${
                  activeDropdown === 'company' || ['/about', '/blog', '/contact'].includes(currentPath)
                    ? 'text-flyora-teal bg-flyora-teal/10'
                    : 'text-flyora-navy/80 hover:text-flyora-teal hover:bg-black/5'
                }`}
              >
                <span>Company</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${activeDropdown === 'company' ? 'rotate-180 text-flyora-teal' : 'opacity-70'}`}
                />
              </button>

              {/* Flyout Menu */}
              {activeDropdown === 'company' && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white/98 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(10,22,40,0.12)] border border-gray-100 p-2.5 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/about"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-flyora-teal/5 transition-colors group"
                  >
                    <Users size={16} className="text-flyora-teal" />
                    <span className="text-[13.5px] font-semibold text-flyora-navy group-hover:text-flyora-teal">
                      About Us
                    </span>
                  </Link>

                  <Link
                    to="/blog"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-flyora-teal/5 transition-colors group"
                  >
                    <FileText size={16} className="text-flyora-teal" />
                    <span className="text-[13.5px] font-semibold text-flyora-navy group-hover:text-flyora-teal">
                      Blog & Insights
                    </span>
                  </Link>

                  <Link
                    to="/contact"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-flyora-teal/5 transition-colors group border-t border-gray-100/80 mt-1 pt-2"
                  >
                    <Phone size={16} className="text-flyora-teal" />
                    <span className="text-[13.5px] font-semibold text-flyora-navy group-hover:text-flyora-teal">
                      Contact Support
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* ─── Desktop Right Actions (MNC Minimal Pill Styling) ──────────────────── */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-flyora-navy/80 hover:text-flyora-navy px-2.5 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                <Globe size={14} className="text-flyora-teal" />
                <span>{selectedLang}</span>
                <ChevronDown size={12} className="opacity-60" />
              </button>

              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-28 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
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
                  size="md"
                  iconRight={<LayoutGrid size={15} />}
                  className="rounded-xl shadow-sm hover:shadow-teal text-[13.5px] py-2 px-4"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-[13.5px] font-bold text-flyora-navy/85 hover:text-flyora-teal transition-colors px-3.5 py-2 rounded-xl hover:bg-black/5"
                >
                  Log In
                </Link>

                <Link to="/signup">
                  <Button
                    variant="teal"
                    size="md"
                    id="header-cta-btn"
                    iconRight={<ArrowRight size={14} />}
                    className="rounded-xl shadow-sm hover:shadow-teal text-[13.5px] py-2 px-4.5 font-bold"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* ─── Compact Hamburger Button for Mobile & Tablets ─────────────────── */}
          <button
            className="xl:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-flyora-navy bg-white/80 border border-gray-200/80 shadow-sm hover:bg-flyora-gray-50 transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            id="mobile-menu-toggle"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ─── Full-Featured Mobile & Tablet Sheet Menu ─────────────────────────── */}
      <div
        className={`
          xl:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'max-h-[85vh] opacity-100 shadow-2xl border-b border-gray-200' : 'max-h-0 opacity-0'}
          bg-white/98 backdrop-blur-2xl
        `}
        id="mobile-menu"
      >
        <div className="container-flyora max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
          {/* Section: Quick Links */}
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-1">
            Navigation
          </div>

          <Link
            to="/how-it-works"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-flyora-navy hover:text-flyora-teal hover:bg-teal-50/50 rounded-xl transition-colors"
          >
            <Sparkles size={16} className="text-flyora-teal" />
            <span>How It Works</span>
          </Link>

          <Link
            to="/send-package-internationally"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-flyora-navy hover:text-flyora-teal hover:bg-teal-50/50 rounded-xl transition-colors"
          >
            <Send size={16} className="text-flyora-teal" />
            <span>For Senders</span>
          </Link>

          <Link
            to="/travelers-earn-money"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-flyora-navy hover:text-flyora-teal hover:bg-teal-50/50 rounded-xl transition-colors"
          >
            <Briefcase size={16} className="text-flyora-teal" />
            <span>For Travelers</span>
          </Link>

          <Link
            to="/services"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-flyora-navy hover:text-flyora-teal hover:bg-teal-50/50 rounded-xl transition-colors"
          >
            <ShieldCheck size={16} className="text-flyora-teal" />
            <span>All Services</span>
          </Link>

          <div className="border-t border-gray-100 my-1" />

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-1">
            Company
          </div>

          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-flyora-gray-600 hover:text-flyora-teal rounded-xl"
          >
            <Users size={16} className="text-gray-400" />
            <span>About Flyorago</span>
          </Link>

          <Link
            to="/blog"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-flyora-gray-600 hover:text-flyora-teal rounded-xl"
          >
            <FileText size={16} className="text-gray-400" />
            <span>Blog & Travel Stories</span>
          </Link>

          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-flyora-gray-600 hover:text-flyora-teal rounded-xl"
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
                  <Button variant="outline" size="md" fullWidth>
                    Log In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="teal" size="md" fullWidth>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
