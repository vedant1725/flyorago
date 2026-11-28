import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { FOOTER_LINKS } from '../constants/routes';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="relative overflow-hidden bg-gradient-to-b from-[#F0F7FA] via-[#E8F3F7] to-[#DFEFF5] text-flyora-navy border-t border-teal-100/80"
      id="footer"
      role="contentinfo"
    >
      {/* Decorative Top Accent Glow Line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-flyora-teal to-transparent opacity-80" />

      {/* Subtle Ambient Background Wash & Brand Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-flyora-teal/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container-flyora relative z-10">
        <div className="pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" onClick={handleLinkClick} className="inline-flex items-center gap-3 group mb-4" id="footer-logo">
                <div className="relative flex items-center justify-center p-0.5">
                  <div className="absolute inset-0 rounded-full bg-flyora-teal/25 blur-md group-hover:bg-flyora-teal/45 transition-all duration-300" />
                  <img
                    src="/images/flyorago-header-icon.png"
                    alt="Flyorago Official Logo"
                    className="relative w-11 h-11 object-contain transform group-hover:scale-108 transition-all duration-300 drop-shadow-[0_4px_12px_rgba(13,148,136,0.30)]"
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-black tracking-tight text-flyora-navy group-hover:text-flyora-teal transition-colors">
                    FLYORA<span className="text-flyora-teal">GO</span>
                  </span>
                  <span className="text-[8.5px] font-extrabold text-flyora-teal-dark tracking-widest uppercase mt-0.5">
                    Ship Smarter
                  </span>
                </div>
              </Link>

              <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-6 max-w-xs font-medium">
                Flyorago connects verified travelers and senders worldwide to share luggage space
                and send packages internationally with KYC verification, escrow protection, and OTP confirmation.
              </p>

              <div className="space-y-2.5 mb-6">
                <a href="mailto:hello@flyorago.com" className="flex items-center gap-2.5 text-slate-600 hover:text-flyora-teal text-xs sm:text-[13px] font-semibold transition-colors">
                  <span className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal flex-shrink-0 shadow-xs">
                    <Mail size={12} />
                  </span>
                  hello@flyorago.com
                </a>
                <div className="flex items-center gap-2.5 text-slate-600 text-xs sm:text-[13px] font-medium">
                  <span className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal flex-shrink-0 shadow-xs">
                    <Phone size={12} />
                  </span>
                  +1 (800) FLYORA-1
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 text-xs sm:text-[13px] font-medium">
                  <span className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal flex-shrink-0 shadow-xs">
                    <MapPin size={12} />
                  </span>
                  India &amp; International Corridors
                </div>
              </div>
            </div>

            {/* Link Columns */}
            {(
              [
                { title: 'For Senders', links: FOOTER_LINKS.senders },
                { title: 'For Travelers', links: FOOTER_LINKS.travelers },
                { title: 'Company', links: FOOTER_LINKS.company },
                { title: 'Trust & Support', links: FOOTER_LINKS.support },
              ] as { title: string; links: { label: string; href: string }[] }[]
            ).map((col) => (
              <div key={col.title} className="lg:col-span-1">
                <h3 className="text-[13.5px] font-extrabold text-flyora-navy mb-4 tracking-wide uppercase">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        onClick={handleLinkClick}
                        className="text-slate-600 text-xs sm:text-[13px] font-medium hover:text-flyora-teal hover:translate-x-0.5 transition-all duration-200 inline-flex items-center gap-1 group"
                      >
                        <ArrowRight size={10} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-flyora-teal" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-5 border-t border-teal-200/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs font-medium">
              © {currentYear} Flyorago. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-slate-500 text-xs font-semibold">
              <Link to="/terms" onClick={handleLinkClick} className="hover:text-flyora-teal transition-colors">Terms</Link>
              <Link to="/privacy" onClick={handleLinkClick} className="hover:text-flyora-teal transition-colors">Privacy</Link>
              <Link to="/safety" onClick={handleLinkClick} className="hover:text-flyora-teal transition-colors">Safety</Link>
              <Link to="/sitemap" onClick={handleLinkClick} className="hover:text-flyora-teal transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
