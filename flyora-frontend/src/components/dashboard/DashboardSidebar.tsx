import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plane, Shield, Wallet, List, User, ArrowRightLeft,
  Sparkles, LogOut, Globe, Zap
} from 'lucide-react';
import './../../pages/dashboard.css';

type TabType = 'overview' | 'trips' | 'shipments' | 'matches' | 'wallet' | 'profile';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userName: string;
  matchCount: number;
  onLogout: () => void;
}

const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Sparkles size={17} /> },
  { id: 'trips', label: 'My Trips', icon: <Plane size={17} className="transform -rotate-45" /> },
  { id: 'shipments', label: 'Shipments', icon: <List size={17} /> },
  { id: 'matches', label: 'Smart Matches', icon: <ArrowRightLeft size={17} /> },
  { id: 'wallet', label: 'Wallet & Escrow', icon: <Wallet size={17} /> },
  { id: 'profile', label: 'Profile', icon: <User size={17} /> },
];

const DashboardSidebar: React.FC<Props> = ({ activeTab, setActiveTab, userName, matchCount, onLogout }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="dash-sidebar hidden md:flex flex-col w-[260px] shrink-0 rounded-2xl p-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 px-2 mb-6 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-teal">
            <Plane size={16} className="text-white transform -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-white leading-none">fly<span className="text-flyora-teal-light">ora</span></span>
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Portal</span>
          </div>
        </Link>

        {/* User Card */}
        <div className="mx-1 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Label */}
        <div className="px-3 mb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20">Navigation</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-0.5 px-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`dash-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'matches' && matchCount > 0 && (
                <span className="dash-nav-badge">{matchCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Trust Badge */}
        <div className="mx-1 mt-4 p-4 rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.1) 0%, rgba(13,148,136,0.03) 100%)', border: '1px solid rgba(13,148,136,0.15)' }}>
          <div className="absolute -right-4 -bottom-4 opacity-[0.06]">
            <Shield size={80} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-flyora-teal-light" />
            <span className="text-[9px] font-black uppercase tracking-wider text-flyora-teal-light">Escrow Protected</span>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed font-medium">
            All transactions secured by Flyora Escrow Guarantee system.
          </p>
        </div>

        {/* Logout */}
        <button onClick={onLogout} className="dash-nav-item mt-3 mx-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/5">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Mobile Nav */}
      <div className="dash-mobile-nav md:hidden" style={{ display: 'none' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`dash-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default DashboardSidebar;
