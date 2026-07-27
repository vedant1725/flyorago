import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, ShoppingBag, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, ShieldCheck, ShieldAlert,
  BadgeCheck, Clock, Bell, X, Menu, Luggage, Home, LogOut
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { HeaderProfileDropdown } from './ui/HeaderProfileDropdown';

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
  { label: 'Luggage Sharing', icon: Luggage, route: '/luggage-sharing' },
  { label: 'Trust Score', icon: ShieldCheck, route: '/trust' },
  { label: 'Wallet', icon: Wallet, route: '/wallet' },
  { label: 'Settings', icon: Settings, route: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, activeSubItem, onSubItemClick }) => {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<string>(
    localStorage.getItem('flyora_kyc_status') || 'NOT_SUBMITTED'
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const userName = localStorage.getItem('flyora_user_name') || 'User';

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
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
          <BadgeCheck size={11} /> Approved
        </span>
      );
    }
    if (status === 'PENDING' || status === 'UNDER_REVIEW') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded-full animate-pulse">
          <Clock size={11} /> Under Review
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/25 px-2.5 py-0.5 rounded-full">
          <ShieldAlert size={11} /> Rejected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-slate-500/15 text-slate-500 border border-slate-300 px-2.5 py-0.5 rounded-full">
        Not Verified
      </span>
    );
  };

  const handleNav = (route: string) => {
    navigate(route);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] bg-[#FFFDFB] border-r border-slate-200 flex-col pt-8 pb-6 px-4 z-40">
        <div>
          <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-sm">
                <Plane size={16} className="text-white transform -rotate-45" />
              </div>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">FLYORA<span className="text-flyora-teal">GO</span></span>
          </div>

          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-3">Menu</div>

          <nav className="flex flex-col gap-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem.toLowerCase() === item.label.toLowerCase() ||
                (activeItem === 'Traveler' && item.label === 'Trip');
              return (
                <div key={item.label} className="flex flex-col">
                  <button
                    type="button"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive && !activeSubItem
                        ? 'bg-flyora-teal text-white shadow-lg shadow-teal-500/30'
                        : isActive
                          ? 'bg-flyora-teal text-white shadow-lg shadow-teal-500/30'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    onClick={() => handleNav(item.route)}
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
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${isSubActive
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
          </nav>
        </div>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
          >
            <Home size={15} /> Go to Home Page
          </button>

          <div
            onClick={() => navigate('/kyc')}
            className="p-3.5 rounded-xl cursor-pointer hover:bg-slate-50 transition border border-slate-200 flex items-center justify-between bg-white shadow-sm"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC Status</span>
            {getKycBadge()}
          </div>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <div className="lg:hidden flex items-center justify-between h-[64px] px-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-40 shadow-sm">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu drawer"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2 font-black text-lg text-slate-800 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-sm">
            <Plane size={14} className="text-white transform -rotate-45" />
          </div>
          FLYORA<span className="text-flyora-teal">GO</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition relative"
            aria-label="Notifications"
            onClick={() => navigate('/notifications')}
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {/* Profile Dropdown with My Profile, Go Home, Settings & Logout */}
          <HeaderProfileDropdown compact={true} />
        </div>
      </div>

      {/* ─── Mobile Slide-in Drawer ─── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)}></div>
          <div className="relative flex flex-col w-[280px] max-w-[calc(100%-3rem)] bg-white h-full shadow-2xl transition-transform transform translate-x-0 overflow-y-auto p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 font-black text-xl text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-sm">
                  <Plane size={16} className="text-white transform -rotate-45" />
                </div>
                FLYORA<span className="text-flyora-teal">GO</span>
              </div>
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* KYC badge inside drawer */}
            <div
              onClick={() => handleNav('/kyc')}
              className="p-3 rounded-2xl cursor-pointer border border-slate-200 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition mb-4"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC Status</span>
              {getKycBadge()}
            </div>

            <nav className="flex flex-col gap-1.5 flex-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.label.toLowerCase() === activeItem.toLowerCase();
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive ? 'bg-flyora-teal text-white shadow-md shadow-teal-500/20' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => handleNav(item.route)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 space-y-2 mt-auto">
              <button
                type="button"
                onClick={() => handleNav('/')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                <Home size={16} /> Go to Home Page
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs hover:bg-rose-100 transition"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
