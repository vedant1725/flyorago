import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plane, Mail, MapPin, Phone, ArrowRight
} from 'lucide-react';
import { FOOTER_LINKS } from '../constants/routes';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-gradient text-white relative overflow-hidden" id="footer" role="contentinfo">
      <div className="h-px bg-gradient-to-r from-transparent via-flyora-teal/40 to-transparent" />
      <div className="absolute inset-0 world-map-bg opacity-5 pointer-events-none" />

      <div className="container-flyora relative z-10">
        <div className="pt-12 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" onClick={handleLinkClick} className="inline-flex items-center gap-3 group mb-4" id="footer-logo">
                <div className="relative flex items-center justify-center p-0.5">
                  <div className="absolute inset-0 rounded-full bg-flyora-teal/30 blur-md group-hover:bg-flyora-teal/50 transition-all duration-300" />
                  <img
                    src="/images/flyorago-header-icon.png"
                    alt="Flyorago Official Logo"
                    className="relative w-11 h-11 object-contain transform group-hover:scale-108 transition-all duration-300 drop-shadow-[0_4px_12px_rgba(13,148,136,0.35)]"
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-black tracking-tight text-white group-hover:text-flyora-teal-bright transition-colors">
                    FLYORA<span className="text-flyora-teal-bright">GO</span>
                  </span>
                  <span className="text-[8.5px] font-extrabold text-white/50 tracking-widest uppercase mt-0.5">
                    Ship Smarter
                  </span>
                </div>
              </Link>

              <p className="text-white/60 text-xs leading-relaxed mb-5 max-w-xs">
                Flyorago connects verified travelers and senders worldwide to share luggage space
                and send packages internationally with KYC verification, escrow protection, and OTP confirmation.
              </p>

              <div className="space-y-2 mb-5">
                <a href="mailto:hello@flyorago.com" className="flex items-center gap-2 text-white/55 hover:text-flyora-teal-bright text-xs transition-colors">
                  <span className="text-flyora-teal-bright flex-shrink-0"><Mail size={12} /></span>
                  hello@flyorago.com
                </a>
                <div className="flex items-center gap-2 text-white/45 text-xs">
                  <span className="text-flyora-teal-bright flex-shrink-0"><Phone size={12} /></span>
                  +1 (800) FLYORA-1
                </div>
                <div className="flex items-center gap-2 text-white/45 text-xs">
                  <span className="text-flyora-teal-bright flex-shrink-0"><MapPin size={12} /></span>
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
                <h3 className="text-sm font-bold text-white mb-4 tracking-wide">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        onClick={handleLinkClick}
                        className="text-white/55 text-xs sm:text-sm hover:text-flyora-teal-bright transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        <ArrowRight size={10} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-flyora-teal-bright" />
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
        <div className="py-4 border-t border-white/8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs">
              © {currentYear} Flyorago. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-white/45 text-xs">
              <Link to="/terms" onClick={handleLinkClick} className="hover:text-flyora-teal-bright transition-colors">Terms</Link>
              <Link to="/privacy" onClick={handleLinkClick} className="hover:text-flyora-teal-bright transition-colors">Privacy</Link>
              <Link to="/safety" onClick={handleLinkClick} className="hover:text-flyora-teal-bright transition-colors">Safety</Link>
              <Link to="/sitemap" onClick={handleLinkClick} className="hover:text-flyora-teal-bright transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
