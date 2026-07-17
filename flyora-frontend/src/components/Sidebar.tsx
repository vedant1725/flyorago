import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, ShoppingBag, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, ShieldCheck, ShieldAlert,
  BadgeCheck, Clock, Bell, X, Menu, Ellipsis
} from 'lucide-react';
import { apiFetch } from '../utils/api';

interface SidebarProps {
  activeItem: string;
  activeSubItem?: string;
  onSubItemClick?: (id: string) => void;
}

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid, route: '/dashboard' },
  { label: 'Trip', icon: Plane, route: '/traveler' },
  { label: 'Sender', icon: Package, route: '/sender' },
  { label: 'Shopper', icon: ShoppingBag, route: '/shopper' },
  { label: 'Wallet', icon: Wallet, route: '/wallet' },
  { label: 'Settings', icon: Settings, route: '/settings' },
];

const BOTTOM_NAV_ITEMS = ['Dashboard', 'Trip', 'Sender', 'Wallet', 'More'];

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, activeSubItem, onSubItemClick }) => {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<string>(
    localStorage.getItem('flyora_kyc_status') || 'NOT_SUBMITTED'
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const userName = localStorage.getItem('flyora_user_name') || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2);

  useEffect(() => {
    const userId = localStorage.getItem('flyora_user_id');
    if (userId && userId !== 'undefined' && userId !== 'null') {
      apiFetch(`/api/kyc/status/${userId}`)
        .then((res) => {
          if (res.status === 'success' && res.data) {
            setKycStatus(res.data.status);
            localStorage.setItem('flyora_kyc_status', res.data.status);
          }
        })
        .catch((err) => console.error('Error fetching KYC status in sidebar:', err));
    }
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const getKycBadge = () => {
    const status = kycStatus.toUpperCase();
    if (status === 'APPROVED' || status === 'VERIFIED') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
          <BadgeCheck size={11} /> Approved
        </span>
      );
    }
    if (status === 'PENDING' || status === 'UNDER_REVIEW') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded-full animate-pulse">
          <Clock size={11} /> Under Review
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2.5 py-0.5 rounded-full">
          <ShieldAlert size={11} /> Rejected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-slate-500/15 text-slate-400 border border-slate-700/50 px-2.5 py-0.5 rounded-full">
        Not Verified
      </span>
    );
  };

  const isMoreActive = !BOTTOM_NAV_ITEMS.slice(0, 4).includes(activeItem);

  const handleNav = (route: string) => {
    navigate(route);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] bg-[#FFFDFB] border-r border-slate-100 flex-col pt-8 pb-6 px-4 z-40">
        <div>
          <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-sm">
                <Plane size={16} className="text-white transform -rotate-45" />
              </div>
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">Flyora<span className="text-flyora-teal">Go</span></span>
          </div>

          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-3">Menu</div>

          <nav className="flex flex-col gap-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              // Map old activeItems to new labels if needed, or assume activeItem matches exactly
              const isActive = activeItem.toLowerCase() === item.label.toLowerCase() || 
                               (activeItem === 'Traveler' && item.label === 'Trip');
              return (
                <div key={item.label} className="flex flex-col">
                  <button
                    type="button"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive && !activeSubItem
                        ? 'bg-flyora-teal text-white shadow-lg shadow-teal-500/30' 
                        : isActive 
                        ? 'bg-flyora-teal text-white shadow-lg shadow-teal-500/30'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                    onClick={() => navigate(item.route)}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </button>

                  {/* Sub-menu for Settings */}
                  {isActive && item.label === 'Settings' && (
                    <div className="flex flex-col gap-1 mt-3 mb-2 px-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-3">Account Preferences</div>
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
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${
                              isSubActive 
                                ? 'bg-teal-50 text-flyora-teal' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                            onClick={() => onSubItemClick && onSubItemClick(sub.id)}
                          >
                            <SubIcon size={16} strokeWidth={isSubActive ? 2.5 : 2} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {localStorage.getItem('flyora_user_role') === 'admin' && (
              <button
                type="button"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-flyora-teal hover:bg-teal-50 mt-4 transition-all"
                onClick={() => navigate('/admin')}
              >
                <ShieldCheck size={18} strokeWidth={2.5} />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>
        </div>

        <div className="mt-auto">
          {/* Optional bottom section like refer & earn if needed, or KYC */}
          <div
            onClick={() => navigate('/kyc')}
            className="p-4 rounded-xl cursor-pointer hover:bg-slate-50 transition-all duration-200 border border-slate-100 flex flex-col gap-2 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KYC Status</span>
              {getKycBadge()}
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <div className="lg:hidden flex items-center justify-between h-[60px] px-4 bg-white border-b border-slate-100 shrink-0 relative z-30">
        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-700" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2 font-black text-lg text-slate-800">
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-sm">
            <Plane size={14} className="text-white transform -rotate-45" />
          </div>
          Flyora<span className="text-flyora-teal">Go</span>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="relative text-slate-500" aria-label="Notifications" onClick={() => navigate('/notifications')}>
            <Bell size={20} strokeWidth={2} />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold border border-teal-100 cursor-pointer" onClick={() => navigate('/profile')}>
            {initials}
          </div>
        </div>
      </div>

      {/* ─── Mobile Slide-in Drawer ─── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)}></div>
          <div className="relative flex flex-col w-[280px] max-w-[calc(100%-3rem)] bg-white h-full shadow-2xl transition-transform transform translate-x-0">
            <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-xl text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-sm">
                  <Plane size={16} className="text-white transform -rotate-45" />
                </div>
                FlyoraGo
              </div>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>

            {/* KYC badge in drawer */}
            <div
              onClick={() => handleNav('/kyc')}
              className="mx-1 mt-4 mb-3 p-3 rounded-2xl cursor-pointer border border-slate-200 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC Status</span>
              {getKycBadge()}
            </div>

            <nav className="fly-sidebar-nav flex-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.label.toLowerCase() === activeItem.toLowerCase();
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`fly-sidebar-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleNav(item.route)}
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              {localStorage.getItem('flyora_user_role') === 'admin' && (
                <button
                  type="button"
                  className="fly-sidebar-item"
                  onClick={() => handleNav('/admin')}
                >
                  <ShieldCheck size={16} strokeWidth={2} className="text-flyora-teal" />
                  <span className="text-flyora-teal font-black">Admin Panel</span>
                </button>
              )}
            </nav>

            {/* Referral card inside drawer */}
            <div className="fly-referral-card mt-4">
              <div className="fly-referral-title">Refer & Earn</div>
              <p className="fly-referral-copy">Invite friends and earn amazing rewards.</p>
              <div className="fly-referral-gift" style={{ height: 60 }}>
                <Gift size={22} strokeWidth={1.8} />
              </div>
              <button type="button" className="fly-btn fly-btn-primary fly-btn-full" onClick={() => setDrawerOpen(false)}>
                Refer Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Bottom Navigation Bar ─── */}
      <nav className="fly-mobile-nav" aria-label="Mobile navigation">
        {[
          { label: 'Sender', icon: Package, route: '/sender', match: 'Sender' },
          { label: 'Traveler', icon: Plane, route: '/traveler', match: 'Traveler' },
          { label: 'Wallet', icon: Wallet, route: '/wallet', match: 'Wallet' },
          { label: 'Earnings', icon: CreditCard, route: '/earnings', match: 'Earnings' },
          { label: 'Support', icon: Gift, route: '/support', match: 'Support' },
          { label: 'Profile', icon: UserRound, route: '/profile', match: 'Profile' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.match;
          return (
            <button
              key={item.label}
              type="button"
              className={`fly-mobile-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => navigate(item.route)}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Meta iOS Style Menu/Avatar Tab */}
        <button
          type="button"
          className={`fly-mobile-nav-item ${isMoreActive || drawerOpen ? 'is-active' : ''}`}
          onClick={() => setDrawerOpen(true)}
          aria-label="Menu"
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter transition-all duration-200 ${isMoreActive || drawerOpen
                ? 'bg-gradient-to-br from-flyora-teal to-teal-600 text-white ring-2 ring-flyora-teal ring-offset-2'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
          >
            {initials || 'U'}
          </div>
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
};
