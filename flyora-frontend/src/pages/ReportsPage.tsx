import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, Download, Filter,
  Calendar, CheckCircle2, ChevronRight
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

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [reportType, setReportType] = useState('financial');
  const [reportYear, setReportYear] = useState('2025');

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

  const triggerExport = (format: 'pdf' | 'csv') => {
    alert(`Exporting ${reportType} report for the year ${reportYear} in ${format.toUpperCase()} format. Your download will start shortly.`);
  };

  return (
    <div className="fly-dashboard-shell reports-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Dashboard" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <label className="fly-search">
              <Search size={16} strokeWidth={2} />
              <input type="text" placeholder="Search statements and receipts..." />
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
              <h1 className="trips-header__title">Statements & Reports</h1>
              <p className="trips-header__subtitle">Generate and download structured transaction reports and tax audit records.</p>
            </div>
          </section>

          {/* Export Configurations */}
          <section className="fly-card">
            <div className="border-b border-gray-50 pb-4 mb-5">
              <h3 className="text-sm font-black text-flyora-navy uppercase tracking-wider">Report Generator parameters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              <label className="block">
                <span className="dash-input-label">Report Category</span>
                <select className="dash-input mt-1 w-full" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="financial">Financial Ledger Statement</option>
                  <option value="trips">Travel & Route Records</option>
                  <option value="commissions">Commission Fee Audit</option>
                </select>
              </label>

              <label className="block">
                <span className="dash-input-label">Fiscal Year</span>
                <select className="dash-input mt-1 w-full" value={reportYear} onChange={(e) => setReportYear(e.target.value)}>
                  <option value="2025">2025 Calendar Year</option>
                  <option value="2024">2024 Calendar Year</option>
                  <option value="2023">2023 Calendar Year</option>
                </select>
              </label>

              <div className="flex gap-2.5 items-end">
                <button type="button" className="fly-btn fly-btn-secondary flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold" onClick={() => triggerExport('csv')}>
                  <Download size={14} /> Export CSV
                </button>
                <button type="button" className="fly-btn fly-btn-primary flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold" onClick={() => triggerExport('pdf')}>
                  <Download size={14} /> Export PDF
                </button>
              </div>
            </div>
          </section>

          {/* Statements Directory */}
          <section className="fly-card mt-6">
            <div className="fly-section-head mb-4">
              <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Historical Statements Archive</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Q1 2025 Earnings & Commissions Report', date: '31 Mar, 2025', size: '1.4 MB' },
                { label: 'Annual 2024 Traveler Performance Summary', date: '31 Dec, 2024', size: '4.8 MB' },
                { label: 'Q4 2024 Financial Statements Ledger', date: '31 Dec, 2024', size: '1.2 MB' }
              ].map((doc, idx) => (
                <div key={idx} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center hover:border-flyora-teal transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-flyora-teal flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-flyora-navy">{doc.label}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1">Generated: {doc.date} • Size: {doc.size}</div>
                    </div>
                  </div>
                  <button type="button" className="text-xs font-bold text-flyora-teal hover:underline flex items-center gap-0.5" onClick={() => alert(`Downloading ${doc.label}`)}>
                    Download <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
