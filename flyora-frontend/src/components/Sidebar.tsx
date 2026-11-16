import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, ShieldCheck, ShieldAlert,
  BadgeCheck, Clock, Bell, X, Menu, Luggage, Home, LogOut, Sparkles,
  Plus, Search, ArrowRight, ChevronRight, CheckCircle2
} from 'lucide-react';
import { HeaderProfileDropdown } from './ui/HeaderProfileDropdown';
import { useFlyoraAI } from '../context/FlyoraAIContext';

interface SidebarProps {
  activeItem: string;
  activeSubItem?: string;
  onSubItemClick?: (id: string) => void;
}

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid, route: '/dashboard' },
  { label: 'Trip', icon: Plane, route: '/traveler' },
  { label: 'Sender', icon: Package, route: '/sender' },
  { label: 'Flyora AI', icon: Sparkles, route: '/ai' },
  { label: 'Trust Score', icon: ShieldCheck, route: '/trust' },
  { label: 'Wallet', icon: Wallet, route: '/wallet' },
  { label: 'Settings', icon: Settings, route: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, activeSubItem, onSubItemClick }) => {
  const navigate = useNavigate();
  const { openAI } = useFlyoraAI();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // User details from localStorage for native mobile profile display
  const userName = localStorage.getItem('flyora_user_name') || 'Flyora Traveler';
  const userEmail = localStorage.getItem('flyora_user_email') || 'traveler@flyorago.me';
  const kycStatus = localStorage.getItem('flyora_kyc_status') || 'VERIFIED';
  const userInitials = userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'FL';

  // Prevent body scroll when drawer, action sheet, or modal is open
  useEffect(() => {
    if (drawerOpen || actionSheetOpen || showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen, actionSheetOpen, showLogoutModal]);

  const handleNav = (route: string) => {
    navigate(route);
    setDrawerOpen(false);
    setActionSheetOpen(false);
  };

  const initiateLogout = () => {
    setDrawerOpen(false);
    setActionSheetOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* ─── Desktop Sidebar (UNTOUCHED - EXACT ORIGINAL) ─── */}
      <aside className="hidden lg:flex fixed -left-[1px] top-0 h-screen w-[241px] bg-gradient-to-b from-[#0A1628] to-[#050A11] border-r border-teal-900/30 flex-col pt-6 pb-6 px-4 z-40 select-none overflow-hidden shadow-[4px_0_32px_rgba(13,148,136,0.1)]">
        
        {/* Decorative Top Blur */}
        <div className="absolute top-0 left-0 w-full h-32 bg-flyora-teal/10 blur-[50px] pointer-events-none"></div>

        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 mb-8 px-2 cursor-pointer shrink-0 group relative z-10" onClick={() => navigate('/')}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/40 group-hover:scale-105 transition-transform duration-300 border border-teal-400/20">
              <Plane size={18} className="text-white transform -rotate-45" />
            </div>
            <div className="absolute inset-0 bg-flyora-teal rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity"></div>
          </div>
          <span className="text-xl font-black text-white tracking-tight">FLYORA<span className="text-flyora-teal">GO</span></span>
        </div>

        {/* Scrollable Navigation Area (Hidden Scrollbar) */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
            <span className="w-4 h-px bg-slate-700"></span>
            Menu
          </div>

          <nav className="flex flex-col gap-1.5 pb-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem.toLowerCase() === item.label.toLowerCase() ||
                (activeItem === 'Traveler' && item.label === 'Trip');
              return (
                <div key={item.label} className="flex flex-col relative group">
                  <button
                    type="button"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => handleNav(item.route)}
                  >
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-flyora-teal to-teal-700 opacity-90 z-0"></div>
                        <div className="absolute -left-[1px] top-0 bottom-0 w-1.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10"></div>
                      </>
                    )}
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors duration-300'}`} />
                    <span className="relative z-10">{item.label}</span>
                  </button>

                  {/* Sub-menu for Settings */}
                  {isActive && item.label === 'Settings' && (
                    <div className="flex flex-col gap-1 mt-2 mb-2 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest my-2 pl-3">Account Preferences</div>
                      {[
                        { id: 'profile', label: 'My Profile', icon: UserRound },
                        { id: 'notifications', label: 'Notification Setting', icon: Bell },
                        { id: 'invite', label: 'Invite Friend', icon: UserRound },
                        { id: 'guidelines', label: 'Community Guidelines', icon: ShieldCheck },
                        { id: 'support', label: 'Help & Support', icon: Headphones }
                      ].map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeSubItem === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${isSubActive
                              ? 'bg-white/10 text-white backdrop-blur-sm border border-white/5 shadow-sm'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                              }`}
                            onClick={() => onSubItemClick && onSubItemClick(sub.id)}
                          >
                            <SubIcon size={15} className="shrink-0" strokeWidth={isSubActive ? 2.5 : 2} />
                            <span className="whitespace-nowrap truncate">{sub.label}</span>
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

        {/* Footer Area */}
        <div className="pt-6 border-t border-slate-800/60 mt-auto relative z-10">
          <button
            type="button"
            onClick={initiateLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-rose-500/25"
          >
            <LogOut size={16} strokeWidth={2.5} /> Log Out
          </button>
        </div>
      </aside>

      {/* ─── Ultra-Advanced Mobile Top Bar (Google & Meta Standard) ─── */}
      <div className="lg:hidden flex items-center justify-between h-[62px] px-3.5 bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shrink-0 sticky top-0 z-40 shadow-sm">
        {/* Brand Logo & Avatar Trigger */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => navigate('/')}>
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 border border-teal-400/20 active:scale-95 transition-transform">
              <Plane size={16} className="text-white transform -rotate-45" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800">
            FLYORA<span className="text-flyora-teal">GO</span>
          </span>
        </div>

        {/* Action icons right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick AI Trigger */}
          <button
            type="button"
            onClick={() => openAI()}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-50 to-emerald-50 border border-teal-200/50 flex items-center justify-center text-flyora-teal active:scale-90 transition-transform shadow-xs"
            aria-label="Flyora AI Assistant"
            title="Flyora AI Assistant"
          >
            <Sparkles size={16} className="animate-pulse" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-slate-50/80 flex items-center justify-center text-slate-700 active:scale-90 transition-transform relative"
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={2.2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
          </button>

          {/* Profile Dropdown */}
          <HeaderProfileDropdown compact={true} />

          {/* Drawer Toggle */}
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white active:scale-90 transition-transform shadow-sm"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu drawer"
          >
            <Menu size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ─── Ultra-Advanced Native App Mobile Bottom Navigation Bar (Google / Meta standard) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/70 pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-1.5 px-2 shadow-[0_-8px_30px_rgba(10,22,40,0.06)] select-none">
        <div className="flex items-center justify-around max-w-lg mx-auto relative">
          
          {/* 1. Dashboard Tab */}
          {(() => {
            const isActive = activeItem.toLowerCase() === 'dashboard';
            return (
              <button
                type="button"
                onClick={() => handleNav('/dashboard')}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-flyora-teal' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'bg-teal-50' : ''}`}>
                  <LayoutGrid size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-flyora-teal shadow-[0_0_8px_rgba(13,148,136,0.8)]"></span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-flyora-teal' : 'font-bold'}`}>Home</span>
              </button>
            );
          })()}

          {/* 2. Trips Tab */}
          {(() => {
            const isActive = activeItem.toLowerCase() === 'trip' || activeItem.toLowerCase() === 'traveler';
            return (
              <button
                type="button"
                onClick={() => handleNav('/traveler')}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-flyora-teal' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'bg-teal-50' : ''}`}>
                  <Plane size={20} strokeWidth={isActive ? 2.5 : 2} className="transform -rotate-45" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-flyora-teal shadow-[0_0_8px_rgba(13,148,136,0.8)]"></span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-flyora-teal' : 'font-bold'}`}>Trips</span>
              </button>
            );
          })()}

          {/* 3. Center Elevated Action Button (+) */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-5">
            <button
              type="button"
              onClick={() => setActionSheetOpen(true)}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-flyora-teal to-teal-500 text-white shadow-lg shadow-teal-500/35 flex items-center justify-center border-[3.5px] border-white active:scale-90 transition-transform duration-200 relative group"
              aria-label="Create Action"
            >
              <Plus size={24} strokeWidth={3} className="transition-transform duration-300 group-hover:rotate-90" />
              <span className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-25 pointer-events-none"></span>
            </button>
            <span className="text-[10px] font-black text-slate-600 mt-0.5 tracking-tight">Create</span>
          </div>

          {/* 4. Sender Tab */}
          {(() => {
            const isActive = activeItem.toLowerCase() === 'sender';
            return (
              <button
                type="button"
                onClick={() => handleNav('/sender')}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-flyora-teal' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'bg-teal-50' : ''}`}>
                  <Package size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-flyora-teal shadow-[0_0_8px_rgba(13,148,136,0.8)]"></span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-flyora-teal' : 'font-bold'}`}>Send</span>
              </button>
            );
          })()}

          {/* 5. Menu / Wallet Tab */}
          {(() => {
            const isActive = activeItem.toLowerCase() === 'wallet' || activeItem.toLowerCase() === 'settings';
            return (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-flyora-teal' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'bg-teal-50' : ''}`}>
                  <Menu size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-flyora-teal shadow-[0_0_8px_rgba(13,148,136,0.8)]"></span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-flyora-teal' : 'font-bold'}`}>Menu</span>
              </button>
            );
          })()}

        </div>
      </nav>

      {/* ─── Native App Quick Action Bottom Sheet (Google / Meta Standard) ─── */}
      {actionSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActionSheetOpen(false)}
          ></div>

          {/* Sheet Modal */}
          <div className="relative bg-white w-full rounded-t-[32px] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.25)] border-t border-slate-100 animate-in slide-in-from-bottom duration-300 pb-[max(env(safe-area-inset-bottom,0px),24px)] select-none">
            {/* Sheet Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5"></div>

            <div className="flex items-center justify-between mb-5 px-1">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Quick Actions</h3>
                <p className="text-xs font-bold text-slate-400">Post a trip or send a package worldwide</p>
              </div>
              <button
                type="button"
                onClick={() => setActionSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Action 1: Post Trip */}
              <button
                type="button"
                onClick={() => handleNav('/traveler/new')}
                className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100/80 active:scale-95 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center text-white shadow-sm mb-3 group-hover:scale-105 transition-transform">
                  <Plane size={18} className="transform -rotate-45" />
                </div>
                <span className="text-sm font-black text-slate-800">Post a Trip</span>
                <span className="text-[11px] font-semibold text-teal-700/80 mt-0.5 leading-snug">Monetize extra baggage</span>
              </button>

              {/* Action 2: Send Package */}
              <button
                type="button"
                onClick={() => handleNav('/sender/new')}
                className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 active:scale-95 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm mb-3 group-hover:scale-105 transition-transform">
                  <Package size={18} />
                </div>
                <span className="text-sm font-black text-slate-800">Send Package</span>
                <span className="text-[11px] font-semibold text-blue-700/80 mt-0.5 leading-snug">Ship with travelers</span>
              </button>

              {/* Action 3: Ask AI */}
              <button
                type="button"
                onClick={() => {
                  setActionSheetOpen(false);
                  openAI();
                }}
                className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/80 active:scale-95 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-sm mb-3 group-hover:scale-105 transition-transform">
                  <Sparkles size={18} />
                </div>
                <span className="text-sm font-black text-slate-800">Flyora AI</span>
                <span className="text-[11px] font-semibold text-purple-700/80 mt-0.5 leading-snug">Smart price & match</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Ultra-Advanced Mobile Slide-in Drawer (Meta & Google Grade) ─── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[#0A1628]/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setDrawerOpen(false)}></div>
          <div className="relative flex flex-col w-[300px] max-w-[85vw] bg-gradient-to-b from-[#0A1628] via-[#08121f] to-[#04080e] h-full shadow-[28px_0_56px_rgba(0,0,0,0.6)] animate-in slide-in-from-left duration-300 overflow-y-auto no-scrollbar p-5 border-r border-teal-900/30">
            <div className="absolute top-0 left-0 w-full h-36 bg-flyora-teal/15 blur-[60px] pointer-events-none"></div>

            {/* Drawer Top Header with User Profile Badge */}
            <div className="pb-5 border-b border-slate-800/80 mb-4 shrink-0 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 font-black text-lg text-white cursor-pointer" onClick={() => { navigate('/'); setDrawerOpen(false); }}>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-lg border border-teal-400/20">
                    <Plane size={16} className="text-white transform -rotate-45" />
                  </div>
                  <span>FLYORA<span className="text-flyora-teal">GO</span></span>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Profile Card */}
              <div
                onClick={() => { navigate('/profile'); setDrawerOpen(false); }}
                className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors active:scale-95"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-flyora-teal to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white truncate">{userName}</span>
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 truncate block">{userEmail}</span>
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[9px] font-black tracking-wider uppercase">
                    <ShieldCheck size={10} /> Verified Traveler
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation Items */}
            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar pb-4 relative z-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-1.5 flex items-center gap-2">
                <span className="w-3 h-px bg-slate-700"></span>
                Primary Menu
              </div>

              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.label.toLowerCase() === activeItem.toLowerCase() ||
                  (activeItem === 'Traveler' && item.label === 'Trip');
                return (
                  <div key={item.label} className="flex flex-col relative">
                    <button
                      type="button"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative overflow-hidden active:scale-95 ${
                        isActive ? 'text-white bg-gradient-to-r from-flyora-teal to-teal-700 shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => handleNav(item.route)}
                    >
                      <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight size={14} className={isActive ? 'text-white/80' : 'text-slate-600'} />
                    </button>

                    {/* Sub-menu in mobile drawer if settings */}
                    {isActive && item.label === 'Settings' && (
                      <div className="flex flex-col gap-1 mt-1.5 mb-1.5 pl-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        {[
                          { id: 'profile', label: 'My Profile', icon: UserRound },
                          { id: 'notifications', label: 'Notification Setting', icon: Bell },
                          { id: 'invite', label: 'Invite Friend', icon: UserRound },
                          { id: 'guidelines', label: 'Community Guidelines', icon: ShieldCheck },
                          { id: 'support', label: 'Help & Support', icon: Headphones }
                        ].map(sub => {
                          const SubIcon = sub.icon;
                          const isSubActive = activeSubItem === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                isSubActive ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              }`}
                              onClick={() => {
                                if (onSubItemClick) onSubItemClick(sub.id);
                                setDrawerOpen(false);
                              }}
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

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2 shrink-0 mt-auto relative z-10">
              <button
                type="button"
                onClick={initiateLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95"
              >
                <LogOut size={16} strokeWidth={2.5} /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ─── Advanced Logout Confirmation Modal ─── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-[0_32px_64px_rgba(10,22,40,0.3)] border border-slate-100 animate-in zoom-in-[0.95] fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-rose-600"></div>
            
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6 relative group">
              <div className="absolute inset-0 bg-rose-100 rounded-full scale-[1.2] opacity-50 animate-pulse"></div>
              <LogOut size={36} strokeWidth={2.5} className="text-rose-500 relative z-10 transform transition-transform duration-500 group-hover:-translate-x-1" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-2">Leaving so soon?</h3>
            <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
              Are you sure you want to log out of your FlyoraGo account? You'll need to log back in to manage your trips.
            </p>
            
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <button
                type="button"
                className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors active:scale-95"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-colors active:scale-95"
                onClick={confirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
