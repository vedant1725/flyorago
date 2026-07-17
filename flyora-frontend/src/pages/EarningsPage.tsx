import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, ArrowUpRight, ArrowDownRight,
  TrendingUp, Download, Percent, CheckCircle2
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import './dashboard.css';

const withdrawalHistory: any[] = [];
const taxSummaries: any[] = [];
const monthlyEarningsData: {month: string, earnings: number}[] = [
  { month: 'Jan', earnings: 0 },
  { month: 'Feb', earnings: 0 },
  { month: 'Mar', earnings: 0 },
  { month: 'Apr', earnings: 0 },
  { month: 'May', earnings: 0 },
  { month: 'Jun', earnings: 0 }
];

const EarningsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');
  const [timePeriod, setTimePeriod] = useState('6_months');
  const [walletStats, setWalletStats] = useState({
    walletBalance: 0,
    escrowBalance: 0,
    pendingBalance: 0,
  });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await apiFetch('/api/wallet/summary');
        if (res.status === 'success' && res.data) {
          setWalletStats({
            walletBalance: parseFloat(res.data.balance_available) || 0,
            pendingBalance: parseFloat(res.data.balance_pending) || 0,
            escrowBalance: parseFloat(res.data.balance_escrow) || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch wallet in EarningsPage:', err);
      }
    };
    fetchWallet();
  }, []);

  const earningsBreakdown = {
    netEarnings: walletStats.walletBalance,
    tripsEarnings: walletStats.walletBalance,
    platformCommission: walletStats.walletBalance * 0.10,
    grossEarnings: walletStats.walletBalance * 1.10,
    shipmentsEarnings: walletStats.escrowBalance,
    referralsEarnings: 0,
  };

  // Helper to draw the SVG sparkline for monthly earnings
  const getChartPoints = () => {
    const values = monthlyEarningsData.map(d => d.earnings);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = 100;
    const height = 50;
    
    return values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const normalized = (val - min) / (max - min || 1);
      const y = height - (normalized * height);
      return `${x},${y}`;
    }).join(' ');
  };

  const chartPoints = getChartPoints();

  return (
    <div className="fly-dashboard-shell earnings-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Earnings" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <label className="fly-search">
              <Search size={16} strokeWidth={2} />
              <input type="text" placeholder="Search trips, shipments, users..." />
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
              <h1 className="trips-header__title">Earnings Analytics</h1>
              <p className="trips-header__subtitle">Track your platform revenues, service commission fees, and download tax statements.</p>
            </div>
            <select className="dash-input text-xs py-1.5 px-3" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
              <option value="6_months">Last 6 Months</option>
              <option value="12_months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </section>

          {/* Earnings Grid Stats */}
          <section className="fly-grid fly-stat-row">
            {/* Total Net Earnings */}
            <article className="fly-card fly-stat-card">
              <div className="flex items-center justify-between">
                <div className="fly-card-title text-sm font-bold">Net Earnings</div>
                <span className="text-emerald-500 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp size={10} /> +18.6%
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-flyora-navy">${earningsBreakdown.netEarnings.toFixed(2)}</div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">After deduction of platform commission.</p>
              </div>
            </article>

            {/* Trips vs Shipments */}
            <article className="fly-card fly-stat-card">
              <div className="flex items-center justify-between">
                <div className="fly-card-title text-sm font-bold">Trips Earnings</div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-flyora-teal">
                  <Plane size={15} strokeWidth={2.2} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-flyora-navy">${earningsBreakdown.tripsEarnings.toFixed(2)}</div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">Earned from carrying 24 package shipments.</p>
              </div>
            </article>

            {/* Platform Commission Card */}
            <article className="fly-card fly-stat-card">
              <div className="flex items-center justify-between">
                <div className="fly-card-title text-sm font-bold">Platform Fee (10%)</div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                  <Percent size={15} strokeWidth={2.2} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-gray-500">${earningsBreakdown.platformCommission.toFixed(2)}</div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">Flyora global matching & security service fee.</p>
              </div>
            </article>
          </section>

          {/* Revenue Analytics Chart */}
          <section className="fly-card fly-earnings-card mt-6">
            <div className="fly-section-head fly-earnings-head border-b border-gray-100 pb-4">
              <div>
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Revenue Over Time</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">Monthly visualization of trip performance and net cash flows.</p>
              </div>
              <span className="text-xs font-bold text-slate-400">Total Revenue: ${earningsBreakdown.grossEarnings.toFixed(2)}</span>
            </div>

            <div className="fly-chart-wrap mt-6 h-56">
              <div className="fly-chart-axis">
                <span>$1.5K</span>
                <span>$1K</span>
                <span>$500</span>
                <span>$0</span>
              </div>
              <svg className="fly-chart" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="earnings-chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9488" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <polyline points={chartPoints} className="fly-chart-line" style={{ stroke: '#0D9488', strokeWidth: 1.5 }} />
                <polygon points={`0,50 ${chartPoints} 100,50`} className="fly-chart-area" fill="url(#earnings-chart-fill)" />
              </svg>
              <div className="fly-chart-dates mt-2">
                {monthlyEarningsData.map(d => (
                  <span key={d.month} className="text-[10px] font-bold text-gray-400">{d.month}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Withdrawal History & Tax Summaries */}
          <section className="fly-grid fly-middle-grid mt-6">
            {/* Withdrawal History */}
            <article className="fly-card fly-section-card col-span-2">
              <div className="fly-section-head">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Withdrawal History</h3>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="fly-table">
                  <thead>
                    <tr>
                      <th>Withdrawal ID</th>
                      <th>Method</th>
                      <th>Requested</th>
                      <th>Completed</th>
                      <th className="text-right">Amount</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalHistory.map((wth) => (
                      <tr key={wth.id}>
                        <td className="py-3.5 pl-2 font-bold text-flyora-teal">{wth.id}</td>
                        <td className="py-3.5 text-gray-500 font-medium">{wth.method}</td>
                        <td className="py-3.5 text-gray-400 font-medium">{wth.requestDate}</td>
                        <td className="py-3.5 text-gray-400 font-medium">{wth.completeDate}</td>
                        <td className="py-3.5 text-right font-bold">${wth.amount.toFixed(2)}</td>
                        <td className="py-3.5 text-center pr-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                            wth.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>{wth.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            {/* Tax Summaries */}
            <article className="fly-card fly-section-card">
              <div className="fly-section-head">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Tax Statements</h3>
              </div>
              <div className="space-y-4 mt-4">
                {taxSummaries.map((tax) => (
                  <div key={tax.year} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center bg-slate-50/20">
                    <div>
                      <div className="text-xs font-extrabold text-flyora-navy">Tax Year {tax.year}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1">
                        Gross: ${tax.grossAmount.toFixed(0)} • Taxable: ${tax.taxableAmount.toFixed(0)}
                      </div>
                    </div>
                    <button type="button" className="w-8 h-8 rounded-lg bg-teal-50 text-flyora-teal flex items-center justify-center hover:bg-flyora-teal hover:text-white transition-all duration-300" title="Download Document" onClick={() => alert(`Downloading Statement for ${tax.year}`)}>
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>

        {/* Right Utility Panel */}
        <aside className="fly-utility-panel">
          {/* Earnings Tips */}
          <article className="fly-card fly-utility-card fly-tips-card">
            <div className="fly-card-title text-sm font-bold uppercase tracking-wider mb-2">Earnings Tips</div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium mb-4">
              To maximize your earnings, add popular flight routes (e.g. DEL-DXB, BOM-LHR) and configure traveler preferences to allow fragile/expensive items.
            </p>
            <button type="button" className="fly-link-button fly-link-inline" onClick={() => navigate('/trips')}>
              Manage Trips <ArrowRight size={13} strokeWidth={2.3} />
            </button>
          </article>

          {/* Quick Stats overview */}
          <article className="fly-card fly-utility-card">
            <div className="fly-card-title text-sm font-bold uppercase tracking-wider mb-3">Revenues breakdown</div>
            <div className="space-y-3 font-semibold text-xs text-slate-500">
              <div className="flex justify-between"><span>Trips</span><strong className="text-flyora-navy">${earningsBreakdown.tripsEarnings.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Shipments</span><strong className="text-flyora-navy">${earningsBreakdown.shipmentsEarnings.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Referral Bonus</span><strong className="text-flyora-navy">${earningsBreakdown.referralsEarnings.toFixed(2)}</strong></div>
              <div className="h-px bg-slate-100 my-2" />
              <div className="flex justify-between text-sm font-black text-flyora-teal"><span>Total Net</span><strong>${earningsBreakdown.netEarnings.toFixed(2)}</strong></div>
            </div>
          </article>
        </aside>

      </div>
    </div>
  );
};

export default EarningsPage;
