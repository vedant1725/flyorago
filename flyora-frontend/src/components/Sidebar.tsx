import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Car, Send, Sparkles, ShieldCheck, Wallet, Settings,
  LogOut, UserRound, Bell, Headphones, Menu, X
} from 'lucide-react';
import { HeaderProfileDropdown } from './ui/HeaderProfileDropdown';
import { useFlyoraAI } from '../context/FlyoraAIContext';

interface SidebarProps {
  activeItem: string;
  activeSubItem?: string;
  onSubItemClick?: (id: string) => void;
}

const sidebarItems = [
  { label: 'Dashboard', icon: Home, route: '/dashboard' },
  { label: 'Trip', icon: Car, route: '/traveler' },
  { label: 'Sender', icon: Send, route: '/sender' },
  { label: 'Flyora AI', icon: Sparkles, route: '/ai' },
  { label: 'Trust Score', icon: ShieldCheck, route: '/trust' },
  { label: 'Wallet', icon: Wallet, route: '/wallet' },
  { label: 'Settings', icon: Settings, route: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, activeSubItem, onSubItemClick }) => {
  const navigate = useNavigate();
  const { openAI } = useFlyoraAI();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (drawerOpen || showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen, showLogoutModal]);

  const handleNav = (route: string) => {
    navigate(route);
    setDrawerOpen(false);
  };

  const initiateLogout = () => {
    setDrawerOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* ─── Desktop Sidebar (Flyora Brand Navy #0A1628 & Teal #0D9488 Palette) ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] bg-gradient-to-b from-[#0A1628] via-[#091524] to-[#050A11] border-r border-teal-900/30 flex-col pt-6 pb-6 px-4 z-40 select-none overflow-hidden shadow-[4px_0_32px_rgba(13,148,136,0.12)]">
        
        {/* Decorative Top Brand Blur */}
        <div className="absolute top-0 left-0 w-full h-32 bg-flyora-teal/10 blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-flyora-teal/10 blur-3xl pointer-events-none" />

        {/* Brand Logo Header */}
        <div
          className="flex items-center gap-3 mb-8 px-2 cursor-pointer shrink-0 group relative z-10"
          onClick={() => navigate('/')}
        >
          <div className="relative flex items-center justify-center p-0.5">
            <div className="absolute inset-0 rounded-full bg-flyora-teal/30 blur-md group-hover:bg-flyora-teal/60 transition-all duration-300" />
            <img
              src="/images/flyorago-header-icon.png"
              alt="Flyorago Logo"
              className="relative w-9 h-9 object-contain transform group-hover:scale-108 transition-all duration-300 drop-shadow-[0_4px_10px_rgba(13,148,136,0.4)]"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black text-white tracking-wider">
              FLYORA<span className="text-flyora-teal">GO</span>
            </span>
            <span className="text-[7.5px] font-extrabold text-teal-300/60 tracking-widest uppercase mt-0.5">
              Ship Smarter
            </span>
          </div>
        </div>

        {/* Navigation Items Area */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
          <nav className="flex flex-col gap-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem.toLowerCase() === item.label.toLowerCase() ||
                (activeItem === 'Traveler' && item.label === 'Trip');
              return (
                <div key={item.label} className="flex flex-col relative group">
                  <button
                    type="button"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-flyora-teal to-teal-700 text-white shadow-md shadow-teal-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => {
                      handleNav(item.route);
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors duration-200'}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>

                  {/* Sub-menu for Settings */}
                  {isActive && item.label === 'Settings' && (
                    <div className="flex flex-col gap-1 mt-2 mb-2 pl-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      {[
                        { id: 'profile', label: 'My Profile', icon: UserRound },
                        { id: 'notifications', label: 'Notification Setting', icon: Bell },
                        { id: 'guidelines', label: 'Community Guidelines', icon: ShieldCheck },
                        { id: 'support', label: 'Help & Support', icon: Headphones }
                      ].map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeSubItem === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isSubActive
                                ? 'bg-white/10 text-white'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                            onClick={() => onSubItemClick && onSubItemClick(sub.id)}
                          >
                            <SubIcon size={14} className="shrink-0" />
                            <span className="truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ─── Bottom Actions (Logout) ─── */}
        <div className="mt-auto pt-4 border-t border-teal-900/30 relative z-10 px-1">
          <button
            type="button"
            onClick={initiateLogout}
            className="w-full flex items-center gap-2.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 font-bold text-sm transition-all px-3 py-2.5 rounded-xl active:scale-95"
          >
            <LogOut size={16} strokeWidth={2.2} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Header Top Bar (Brand Navy Theme) ─── */}
      <div className="lg:hidden flex items-center justify-between h-[60px] px-4 bg-[#0A1628] text-white sticky top-0 z-40 border-b border-teal-900/30 shadow-md">
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center text-white shadow-sm border border-teal-400/20">
            <Send size={13} className="transform -rotate-45 translate-x-0.5" />
          </div>
          <span className="text-base font-black text-white tracking-wider">
            FLYORA<span className="text-flyora-teal">GO</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openAI()}
            className="w-8 h-8 rounded-lg bg-flyora-teal/20 text-flyora-teal-bright flex items-center justify-center"
            aria-label="Flyora AI"
          >
            <Sparkles size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* ─── Mobile Drawer (Brand Navy #0A1628 Theme) ─── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-[#0A1628]/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative flex flex-col w-[280px] max-w-[85vw] bg-gradient-to-b from-[#0A1628] via-[#091524] to-[#050A11] h-full shadow-2xl p-5 border-r border-teal-900/30 overflow-y-auto no-scrollbar">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center text-white">
                  <Send size={13} className="transform -rotate-45 translate-x-0.5" />
                </div>
                <span className="text-base font-black text-white tracking-wider">FLYORA<span className="text-flyora-teal">GO</span></span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1.5 flex-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem.toLowerCase() === item.label.toLowerCase() ||
                  (activeItem === 'Traveler' && item.label === 'Trip');
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isActive ? 'bg-gradient-to-r from-flyora-teal to-teal-700 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => {
                      setDrawerOpen(false);
                      handleNav(item.route);
                    }}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Logout */}
            <div className="mt-auto pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={initiateLogout}
                className="w-full flex items-center gap-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 font-bold text-sm px-3 py-2.5 rounded-xl transition-all"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Simple, Clean Brand Logout Confirmation Modal ─── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[24px] p-6 sm:p-7 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            {/* Brand Icon */}
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-3.5 text-flyora-teal">
              <LogOut size={22} strokeWidth={2.2} />
            </div>

            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">
              Confirm Log Out
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
              Are you sure you want to sign out of FlyoraGo? You can sign back in at any time.
            </p>

            <div className="flex w-full gap-2.5">
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-flyora-teal hover:bg-[#0F766E] text-white shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-1.5"
                onClick={confirmLogout}
              >
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
