import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, BarChart3, LineChart, PieChart,
  Luggage, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import './dashboard.css';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane },
  { label: 'Shipments', icon: Package },
  { label: 'Bookings', icon: CalendarDays },
  { label: 'Wallet', icon: Wallet },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const handleSidebarClick = (label: string) => {
    const route = 
      label === 'Dashboard' ? '/dashboard' :
      label === 'Trips' ? '/trips' :
      label === 'Shipments' ? '/shipments' :
      label === 'Bookings' ? '/bookings' :
      label === 'Wallet' ? '/wallet' :
      label === 'Earnings' ? '/earnings' :
      label === 'Messages' ? '/messages' :
      label === 'Support' ? '/support' :
      label === 'Profile' ? '/profile' :
      label === 'Settings' ? '/settings' : undefined;
    if (route) navigate(route);
  };

  return (
    <div className="fly-dashboard-shell analytics-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Dashboard" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <label className="fly-search">
              <Search size={16} strokeWidth={2} />
              <input type="text" placeholder="Search analytics metrics..." />
            </label>

            <div className="fly-topbar-actions">
              <button type="button" className="fly-icon-button fly-bell-button" aria-label="Notifications" onClick={() => navigate('/notifications')}>
                <Bell size={17} strokeWidth={2} />
                <span className="fly-badge-dot">3</span>
              </button>

              <button type="button" className="fly-profile-pill" onClick={() => navigate('/profile')}>
                <div className="fly-profile-avatar">{initials}</div>
                <div className="fly-profile-copy">
                  <span className="fly-profile-name">{userName}</span>
                  <span className="fly-profile-role">Traveler</span>
                </div>
                <ChevronDown size={14} strokeWidth={2.2} className="fly-profile-chevron" />
              </button>
            </div>
          </div>

          {/* Header */}
          <section className="trips-header fly-card">
            <div>
              <h1 className="trips-header__title">Travel Analytics</h1>
              <p className="trips-header__subtitle">Analyze your flights luggage space fill rate, revenue performance, and matches.</p>
            </div>
          </section>

          {/* Core Analytics Cards */}
          <section className="fly-grid fly-stat-row">
            <article className="fly-card fly-stat-card">
              <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
                <span>Luggage Fill Ratio</span>
                <Luggage size={16} className="text-flyora-teal" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-flyora-navy">82% Average</div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-flyora-teal h-full" style={{ width: '82%' }} />
                </div>
              </div>
            </article>

            <article className="fly-card fly-stat-card">
              <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
                <span>Smart Match Success</span>
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-flyora-navy">94.5% Accepted</div>
                <p className="text-[10px] text-gray-400 mt-2 font-semibold">18 accepted requests out of 19 smart matches.</p>
              </div>
            </article>

            <article className="fly-card fly-stat-card">
              <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
                <span>Total Mileage Logged</span>
                <Plane size={16} className="text-blue-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-flyora-navy">38,450 km</div>
                <p className="text-[10px] text-gray-400 mt-2 font-semibold">Across Dubai, London, and New York air corridors.</p>
              </div>
            </article>
          </section>

          {/* Detailed Charts */}
          <section className="fly-grid fly-middle-grid mt-6">
            {/* Space Utility Analytics */}
            <article className="fly-card fly-section-card col-span-2">
              <div className="fly-section-head">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Cargo Weight Categories</h3>
              </div>
              <div className="space-y-4 mt-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-flyora-navy mb-1.5">
                    <span>Electronics (Phones, Laptops)</span>
                    <span>120 KG Carried</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-flyora-navy mb-1.5">
                    <span>Sealed Gift boxes & Chocolates</span>
                    <span>54 KG Carried</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: '27%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-flyora-navy mb-1.5">
                    <span>Official Documents & Books</span>
                    <span>26 KG Carried</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: '13%' }} />
                  </div>
                </div>
              </div>
            </article>

            {/* Traveler Tiering details */}
            <article className="fly-card fly-section-card">
              <div className="fly-section-head">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Top Routes Revenue</h3>
              </div>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-xs font-bold text-flyora-navy p-2 bg-slate-50 rounded-xl">
                  <span>Delhi (DEL) → Dubai (DXB)</span>
                  <span className="text-flyora-teal">$1,850.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-flyora-navy p-2 bg-slate-50 rounded-xl">
                  <span>Mumbai (BOM) → London (LHR)</span>
                  <span className="text-flyora-teal">$1,380.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-flyora-navy p-2 bg-slate-50 rounded-xl">
                  <span>Dubai (DXB) → New York (JFK)</span>
                  <span className="text-flyora-teal">$980.00</span>
                </div>
              </div>
            </article>
          </section>

        </main>

        {/* Right Utility Sidebar */}
        <aside className="fly-utility-panel">
          <article className="fly-card fly-utility-card">
            <div className="fly-card-title text-sm font-bold uppercase tracking-wider mb-2">Space Optimization</div>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Platform data reports that senders frequently search for travelers with a minimum space allowance of 10 KG.
            </p>
          </article>
        </aside>

      </div>
    </div>
  );
};

export default AnalyticsPage;
