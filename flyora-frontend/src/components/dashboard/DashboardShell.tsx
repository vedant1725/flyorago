import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleCheckBig,
  Clock3,
  Cloud,
  CreditCard,
  Gift,
  Headphones,
  LayoutGrid,
  MapPin,
  Package,
  Plane,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Wallet,
  Zap,
} from 'lucide-react';
import { Sidebar } from '../Sidebar';
import { WeatherWidget } from '../WeatherWidget';

interface DashboardShellProps {
  userName: string;
  onRegisterTrip?: () => void;
  onPostShipment?: () => void;
  onCompleteProfile?: () => void;
  onWithdrawFunds?: () => void;
  onContactSupport?: () => void;
  walletSummary?: {
    balance_available: number;
    balance_pending: number;
    balance_escrow: number;
  };
  upcomingTripsList?: Array<{
    from: string;
    fromAirport: string;
    to: string;
    toAirport: string;
    date: string;
    tags: string[];
    cta: string;
  }>;
  activeShipmentsList?: Array<{
    id: string;
    origin: string;
    destination: string;
    eta: string;
    progress: number;
    progressLabel: string;
  }>;
  pendingRequestsList?: Array<{
    name: string;
    package: string;
    weight: string;
    reward: string;
    from: string;
    date: string;
  }>;
  kycStatus?: string;
  notificationsList?: Array<{ title: string; time: string }>;
  activityTimelineList?: Array<{ period: string; text: string; time: string }>;
  earningsSeriesData?: number[];
}

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid, active: true },
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

const formatSeriesPath = (series: number[]) => {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const width = 100;
  const height = 52;
  const points = series.map((value, index) => {
    const x = (index / (series.length - 1)) * width;
    const normalized = (value - min) / (max - min || 1);
    const y = height - normalized * height;
    return `${x},${y}`;
  });
  return points.join(' ');
};

const quickActions = [
  { label: 'Register Trip', icon: Plane, onClickKey: 'onRegisterTrip' },
  { label: 'Find Traveler', icon: UserRound },
  { label: 'Send Package', icon: Package, onClickKey: 'onPostShipment' },
  { label: 'Withdraw Funds', icon: Wallet, onClickKey: 'onWithdrawFunds' },
  { label: 'Chat Support', icon: Headphones, onClickKey: 'onContactSupport' },
  { label: 'Verify Identity', icon: ShieldCheck, onClickKey: 'onCompleteProfile' },
] as const;

const kycItems = [
  'Government ID',
  'Passport',
  'Face Verification',
  'Address Verification',
];

const DashboardShell: React.FC<DashboardShellProps> = ({
  userName,
  onRegisterTrip,
  onPostShipment,
  onCompleteProfile,
  onWithdrawFunds,
  onContactSupport,
  walletSummary,
  upcomingTripsList,
  activeShipmentsList,
  pendingRequestsList,
  kycStatus,
  notificationsList = [],
  activityTimelineList = [],
  earningsSeriesData = [],
}) => {
  const navigate = useNavigate();
  const tripsToDisplay = upcomingTripsList || [];
  const shipmentsToDisplay = activeShipmentsList || [];
  const requestsToDisplay = pendingRequestsList || [];
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const chartPath = formatSeriesPath(earningsSeriesData.length > 0 ? earningsSeriesData : [0, 0, 0, 0]);

  return (
    <div className="fly-dashboard-shell">
      <div className="fly-dashboard-layout">
        <Sidebar activeItem="Dashboard" />

        <main className="fly-main-panel">
          <div className="fly-topbar">
            <label className="fly-search">
              <Search size={16} strokeWidth={2} />
              <input type="text" defaultValue="" placeholder="Search trips, shipments, users..." />
            </label>

            <div className="fly-topbar-actions">
              <button type="button" className="fly-icon-button fly-bell-button" aria-label="Notifications">
                <Bell size={17} strokeWidth={2} />
                <span className="fly-badge-dot">3</span>
              </button>

              <button type="button" className="fly-profile-pill">
                <div className="fly-profile-avatar">{initials || 'VS'}</div>
                <div className="fly-profile-copy">
                  <span className="fly-profile-name">{userName}</span>
                  <span className="fly-profile-role">Traveler</span>
                </div>
                <ChevronDown size={14} strokeWidth={2.2} className="fly-profile-chevron" />
              </button>
            </div>
          </div>

          <section className="fly-hero-card fly-card">
            <div className="fly-hero-copy">
              <h1>Welcome back, {userName.split(' ')[0] || 'Vedant'} 👋</h1>
              <p>Manage your trips, shipments and earnings from one place.</p>
              <button type="button" className="fly-btn fly-btn-primary" onClick={onRegisterTrip}>
                <span className="fly-btn-icon"><ArrowRight size={14} strokeWidth={2.3} /></span>
                Register Trip
              </button>
            </div>

            <div className="fly-hero-illustration" aria-hidden="true">
              <div className="fly-illustration-cloud fly-cloud-left" />
              <div className="fly-illustration-cloud fly-cloud-right" />
              <svg className="fly-route-svg" viewBox="0 0 340 140" fill="none">
                <path d="M26 92C52 62 88 46 122 46C155 46 177 68 200 68C232 68 246 42 279 42C303 42 318 56 326 70" />
              </svg>
              <div className="fly-suitcase-card">
                <div className="fly-suitcase-handle" />
                <div className="fly-suitcase-body">
                  <div className="fly-suitcase-label">FlyoraGo</div>
                  <div className="fly-suitcase-chip" />
                </div>
              </div>
              <div className="fly-passport-card">
                <CreditCard size={20} strokeWidth={1.8} />
              </div>
              <div className="fly-plane-badge">
                <Plane size={20} strokeWidth={2} className="fly-plane-icon" />
              </div>
              <div className="fly-cloud fly-cloud-a">
                <Cloud size={28} strokeWidth={1.6} />
              </div>
              <div className="fly-cloud fly-cloud-b">
                <Cloud size={22} strokeWidth={1.6} />
              </div>
            </div>
          </section>

          <section className="fly-grid fly-stat-row">
            <article className="fly-card fly-stat-card fly-kyc-card">
              <div className="fly-card-title-row">
                <div className="fly-card-title">KYC Status</div>
                <span className={`fly-status-pill fly-status-${(kycStatus || 'Verified').toLowerCase() === 'verified' ? 'verified' : 'pending'}`}><BadgeCheck size={12} strokeWidth={2.4} /> {kycStatus || 'Verified'}</span>
              </div>
              <div className="fly-kyc-list">
                {kycItems.map((item) => (
                  <div key={item} className="fly-kyc-row">
                    <div className="fly-kyc-left">
                      <div className="fly-kyc-icon"><ShieldCheck size={14} strokeWidth={2.15} /></div>
                      <span>{item}</span>
                    </div>
                    <span className="fly-status-pill fly-status-mini">Verified</span>
                  </div>
                ))}
              </div>
              <button type="button" className="fly-btn fly-btn-secondary fly-btn-full">View Details</button>
            </article>

            <article className="fly-card fly-wallet-card fly-stat-card">
              <div className="fly-wallet-top">
                <div className="fly-wallet-title">Wallet Balance</div>
                <Wallet size={18} strokeWidth={2} className="fly-wallet-card-icon" />
              </div>
              <div className="fly-wallet-summary-label">Available Balance</div>
              <div className="fly-wallet-amount">${walletSummary ? walletSummary.balance_available.toFixed(2) : '1,250.00'}</div>
              <div className="fly-wallet-split">
                <div>
                  <span>Pending</span>
                  <strong>${walletSummary ? walletSummary.balance_pending.toFixed(2) : '180.00'}</strong>
                </div>
                <div>
                  <span>Escrow</span>
                  <strong>${walletSummary ? walletSummary.balance_escrow.toFixed(2) : '540.00'}</strong>
                </div>
              </div>
              <div className="fly-wallet-actions">
                <button type="button" className="fly-btn fly-btn-outline" onClick={onWithdrawFunds}>Withdraw</button>
                <button type="button" className="fly-btn fly-btn-primary fly-btn-light">Add Funds</button>
              </div>
            </article>
          </section>

          <section className="fly-grid fly-middle-grid">
            <article className="fly-card fly-section-card">
              <div className="fly-section-head">
                <div>
                  <div className="fly-card-title">Upcoming Trips</div>
                </div>
                <button type="button" className="fly-link-button" onClick={() => navigate('/trips')}>View All</button>
              </div>
              <div className="fly-list-stack">
                {tripsToDisplay.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400/80 font-bold">
                    No registered trips found. Click "Register Trip" to create one.
                  </div>
                ) : (
                  tripsToDisplay.map((trip) => (
                    <div key={`${trip.from}-${trip.to}`} className="fly-trip-row">
                      <div className="fly-trip-main">
                        <div className="fly-trip-airports">
                          <div className="fly-route-start">{trip.from}</div>
                          <ArrowRight size={13} strokeWidth={2.4} className="fly-route-arrow" />
                          <div className="fly-route-end">{trip.to}</div>
                        </div>
                        <div className="fly-trip-airport-names">
                          <span>{trip.fromAirport}</span>
                          <span>{trip.toAirport}</span>
                        </div>
                        <div className="fly-chip-row">
                          {trip.tags.map((tag) => (
                            <span key={tag} className="fly-mini-chip">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="fly-trip-side">
                        <div className="fly-trip-date">{trip.date}</div>
                        <button type="button" className="fly-btn fly-btn-secondary fly-btn-small" onClick={() => navigate('/trips')}>{trip.cta}</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="fly-card fly-section-card">
              <div className="fly-section-head">
                <div className="fly-card-title">Active Shipments</div>
                <button type="button" className="fly-link-button" onClick={() => navigate('/shipments')}>View All</button>
              </div>
              <div className="fly-list-stack">
                {shipmentsToDisplay.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400/80 font-bold">
                    No active shipments found. Click "Send Package" to create a shipment.
                  </div>
                ) : (
                  shipmentsToDisplay.map((shipment) => (
                    <div key={shipment.id} className="fly-shipment-row">
                      <div className="fly-shipment-main">
                        <div className="fly-shipment-id">
                          <Package size={14} strokeWidth={2} />
                          <span>{shipment.id}</span>
                        </div>
                        <div className="fly-shipment-route">{shipment.origin}</div>
                        <div className="fly-progress-bar">
                          <span style={{ width: shipment.progressLabel }} />
                        </div>
                        <div className="fly-shipment-meta">
                          <span>{shipment.eta}</span>
                          <span>{shipment.progressLabel}</span>
                        </div>
                      </div>
                      <button type="button" className="fly-btn fly-btn-secondary fly-btn-small" onClick={() => navigate('/shipments')}>Track Shipment</button>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="fly-card fly-section-card">
              <div className="fly-section-head">
                <div className="fly-card-title">Pending Requests</div>
                <button type="button" className="fly-link-button" onClick={() => navigate('/bookings')}>View All</button>
              </div>
              <div className="fly-request-stack">
                {requestsToDisplay.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400/80 font-bold">
                    No pending booking requests.
                  </div>
                ) : (
                  requestsToDisplay.map((request) => (
                    <div key={request.name} className="fly-request-row">
                      <div className="fly-request-avatar">{request.name.split(' ').map((part) => part[0]).join('')}</div>
                      <div className="fly-request-main">
                        <div className="fly-request-topline">
                          <strong>{request.name}</strong>
                          <span>{request.reward}</span>
                        </div>
                        <div className="fly-request-subline">
                          <span>{request.package}</span>
                          <span>{request.weight}</span>
                          <span>{request.reward} Reward</span>
                        </div>
                        <div className="fly-request-loc">
                          <MapPin size={12} strokeWidth={2.2} />
                          <span>{request.from}</span>
                          <CalendarDays size={12} strokeWidth={2.2} />
                          <span>{request.date}</span>
                        </div>
                      </div>
                      <div className="fly-request-actions">
                        <button type="button" className="fly-btn fly-btn-primary fly-btn-small">Accept</button>
                        <button type="button" className="fly-btn fly-btn-secondary fly-btn-small">Decline</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className="fly-grid fly-analytics-grid">
            <article className="fly-card fly-earnings-card">
              <div className="fly-section-head fly-earnings-head">
                <div>
                  <div className="fly-card-title">Earnings Overview</div>
                  <div className="fly-card-subtitle">$4,680.00 <span className="fly-positive">+18.6%</span> vs last month</div>
                </div>
                <button type="button" className="fly-pill-button">This Month</button>
              </div>

              <div className="fly-chart-wrap">
                <div className="fly-chart-axis">
                  <span>$4K</span>
                  <span>$3K</span>
                  <span>$2K</span>
                  <span>$1K</span>
                  <span>$0</span>
                </div>
                <svg className="fly-chart" viewBox="0 0 100 54" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="fly-chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#008E8A" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#008E8A" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <polyline points={chartPath} className="fly-chart-line" />
                  <polygon points={`0,54 ${chartPath} 100,54`} className="fly-chart-area" />
                </svg>
                <div className="fly-chart-dates">
                  <span>01 May</span>
                  <span>07 May</span>
                  <span>13 May</span>
                  <span>19 May</span>
                  <span>25 May</span>
                  <span>31 May</span>
                </div>
              </div>
            </article>

            <div className="fly-stat-grid">
              <article className="fly-card fly-mini-stat-card">
                <div className="fly-mini-stat-label">Total Earnings</div>
                <div className="fly-mini-stat-value">$4,680.00</div>
                <ArrowUpRight size={15} strokeWidth={2.4} className="fly-mini-stat-icon" />
              </article>
              <article className="fly-card fly-mini-stat-card">
                <div className="fly-mini-stat-label">Trips Completed</div>
                <div className="fly-mini-stat-value">24</div>
                <LayoutGrid size={15} strokeWidth={2.4} className="fly-mini-stat-icon" />
              </article>
              <article className="fly-card fly-mini-stat-card">
                <div className="fly-mini-stat-label">Shipments Delivered</div>
                <div className="fly-mini-stat-value">18</div>
                <Package size={15} strokeWidth={2.4} className="fly-mini-stat-icon" />
              </article>
              <article className="fly-card fly-mini-stat-card">
                <div className="fly-mini-stat-label">Average Rating</div>
                <div className="fly-mini-stat-value">4.8</div>
                <Zap size={15} strokeWidth={2.4} className="fly-mini-stat-icon" />
              </article>
            </div>

            <article className="fly-card fly-stats-overview">
              <div className="fly-overview-grid">
                <div className="fly-overview-item">
                  <Plane size={15} strokeWidth={2.2} />
                  <span>Trips</span>
                  <strong>24</strong>
                  <em>+12%</em>
                </div>
                <div className="fly-overview-item">
                  <Package size={15} strokeWidth={2.2} />
                  <span>Shipments</span>
                  <strong>18</strong>
                  <em>+8%</em>
                </div>
                <div className="fly-overview-item">
                  <CreditCard size={15} strokeWidth={2.2} />
                  <span>Reviews</span>
                  <strong>56</strong>
                  <em>+15%</em>
                </div>
                <div className="fly-overview-item">
                  <ShieldCheck size={15} strokeWidth={2.2} />
                  <span>Success Rate</span>
                  <strong>98%</strong>
                  <em>+2%</em>
                </div>
              </div>
            </article>
          </section>

          <section className="fly-grid fly-bottom-grid">
            <article className="fly-card fly-timeline-card">
              <div className="fly-card-title">Notifications</div>
              <div className="fly-notification-list">
                {notificationsList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400/80 font-bold">No new notifications.</div>
                ) : (
                  notificationsList.map((item, index) => (
                    <div key={item.title} className="fly-notification-row">
                      <div className="fly-notification-marker" />
                      <div className="fly-notification-main">
                        <span>{item.title}</span>
                        <strong>{item.time}</strong>
                      </div>
                      {index === 0 && <div className="fly-notification-live" />}
                    </div>
                  ))
                )}
              </div>
              <button type="button" className="fly-link-button fly-link-bottom" onClick={() => navigate('/notifications')}>View All Notifications</button>
            </article>

            <article className="fly-card fly-actions-card">
              <div className="fly-card-title">Quick Actions</div>
              <div className="fly-quick-actions-grid">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const callback =
                    action.onClickKey === 'onRegisterTrip'
                      ? onRegisterTrip
                      : action.onClickKey === 'onPostShipment'
                        ? onPostShipment
                        : action.onClickKey === 'onWithdrawFunds'
                          ? onWithdrawFunds
                          : action.onClickKey === 'onContactSupport'
                            ? onContactSupport
                            : action.onClickKey === 'onCompleteProfile'
                              ? onCompleteProfile
                              : undefined;
                  return (
                    <button key={action.label} type="button" className="fly-quick-action" onClick={callback}>
                      <Icon size={22} strokeWidth={1.8} />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="fly-card fly-activity-card">
              <div className="fly-card-title">Activity Timeline</div>
              <div className="fly-activity-list">
                {activityTimelineList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400/80 font-bold">No recent activity.</div>
                ) : (
                  activityTimelineList.map((item) => (
                    <div key={`${item.period}-${item.text}`} className="fly-activity-row">
                      <div className="fly-activity-marker" />
                      <div className="fly-activity-main">
                        <div className="fly-activity-period">{item.period}</div>
                        <div className="fly-activity-text">{item.text}</div>
                      </div>
                      <div className="fly-activity-time">{item.time}</div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </main>


      </div>
    </div>
  );
};

export default DashboardShell;
