import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { WeatherWidget } from '../components/WeatherWidget';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowRightLeft,
  BadgeCheck,
  Bell,
  CalendarDays,
  ChevronDown,
  Cloud,
  CreditCard,
  Gift,
  Headphones,
  LayoutGrid,
  MapPin,
  Plane,
  Package,
  Search,
  AirVent,
  FerrisWheel,
  Luggage,
  MoreVertical,
  CircleDashed,
  BarChart3,
  TimerReset,
  RefreshCcw,
  PlaneTakeoff,
  ClipboardList,
  MessageSquareText,
  ReceiptText,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import './dashboard.css';

// Removed static mock summary cards

const utilityCountdown = [
  { value: '02', label: 'Days' },
  { value: '14', label: 'Hours' },
  { value: '35', label: 'Mins' },
  { value: '20', label: 'Secs' },
];

const checklist = [
  'Passport',
  'Visa',
  'Government ID',
  'Flight Ticket',
  'Travel Insurance',
  'Hotel Booking',
];

const quickActions = [
  { label: 'Register Trip', icon: Plane },
  { label: 'Duplicate Trip', icon: RefreshCcw },
  { label: 'Find Packages', icon: Package },
  { label: 'Withdraw Earnings', icon: Wallet },
  { label: 'Chat Support', icon: MessageSquareText },
  { label: 'View Analytics', icon: BarChart3 },
];

const TripCard: React.FC<{ trip: any }> = ({ trip }) => {
  const routePoints = 'M 18 102 C 58 66, 92 40, 126 44 S 184 66, 216 86 S 264 114, 294 100';
  const navigate = useNavigate();

  return (
    <article className="trip-card fly-card">
      <div className="trip-card__header">
        <div className="trip-card__airline">
          <div className="trip-card__airline-mark">{trip.airline.slice(0, 1)}</div>
          <div>
            <div className="trip-card__airline-name">{trip.airline}</div>
            <div className="trip-card__flight-meta">{trip.flightNo} • {trip.aircraft}</div>
          </div>
        </div>
        <button type="button" className="trip-card__menu" aria-label="Trip actions">
          <MoreVertical size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="trip-card__body">
        <div className="trip-card__route">
          <div className="trip-card__route-code">{trip.from}</div>
          <ArrowRight size={18} strokeWidth={2.3} className="trip-card__route-arrow" />
          <div className="trip-card__route-code">{trip.to}</div>
        </div>
        <div className="trip-card__airport-row">
          <span>{trip.fromAirport}</span>
          <span>{trip.toAirport}</span>
        </div>

        <div className="trip-card__details-grid">
          <div>
            <span>Departure Date</span>
            <strong>{trip.depDate}</strong>
          </div>
          <div>
            <span>Departure Time</span>
            <strong>{trip.depTime}</strong>
          </div>
          <div>
            <span>Arrival Date</span>
            <strong>{trip.arrDate}</strong>
          </div>
          <div>
            <span>Arrival Time</span>
            <strong>{trip.arrTime}</strong>
          </div>
          <div>
            <span>Flight Duration</span>
            <strong>{trip.duration}</strong>
          </div>
          <div>
            <span>Terminal Information</span>
            <strong>{trip.terminalFrom} / {trip.terminalTo}</strong>
          </div>
        </div>

        <div className="trip-card__info-grid">
          <div className="trip-card__info-box">
            <span>Available Space</span>
            <strong>{trip.space}</strong>
          </div>
          <div className="trip-card__info-box">
            <span>Price per KG</span>
            <strong>{trip.price}</strong>
          </div>
          <div className="trip-card__info-box">
            <span>Seats Left</span>
            <strong>{trip.seats}</strong>
          </div>
          <div className="trip-card__info-box">
            <span>Current Bookings</span>
            <strong>{trip.bookings}</strong>
          </div>
        </div>

        <div className="trip-card__map">
          <div className="trip-card__map-labels">
            <span>{trip.from}</span>
            <span>{trip.to}</span>
          </div>
          <svg viewBox="0 0 320 130" className="trip-card__map-svg" aria-hidden="true">
            <path className="trip-card__map-path" d={routePoints} />
            <circle className="trip-card__map-point" cx="18" cy="102" r="4" />
            <circle className="trip-card__map-point trip-card__map-point--end" cx="294" cy="100" r="4" />
            <g transform="translate(156 63) rotate(-15)">
              <Plane size={14} strokeWidth={2.2} className="trip-card__map-plane" />
            </g>
          </svg>
        </div>

        <div className="trip-card__actions">
          <button type="button" className="fly-btn fly-btn-primary fly-btn-full" onClick={() => navigate('/trip/' + trip.flightNo.replace(/\s+/g, ''))}>View Details</button>
          <button type="button" className="fly-btn fly-btn-secondary fly-btn-full">Edit Trip</button>
        </div>
      </div>

      <div className="trip-card__footer">
        <div className="trip-card__progress-head">
          <span>Bookings Filled</span>
          <span>{trip.progress}%</span>
        </div>
        <div className="trip-card__progress-bar">
          <span style={{ width: `${trip.progress}%` }} />
        </div>
        <div className="trip-card__progress-note">{trip.bookings} Requests Accepted</div>
        <div className="trip-card__chips">
          {trip.labels.map((label: string) => (
            <span key={label} className="trip-card__chip">{label}</span>
          ))}
        </div>
      </div>
    </article>
  );
};

const TripsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');
  const [isRegisterTripOpen, setIsRegisterTripOpen] = useState(false);
  const [tripsList, setTripsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter states
  const [filterFrom, setFilterFrom] = useState(queryParams.get('from') || '');
  const [filterTo, setFilterTo] = useState(queryParams.get('to') || '');
  const [filterDate, setFilterDate] = useState(queryParams.get('date') || '');
  const [isSearchMode, setIsSearchMode] = useState(queryParams.has('from') || queryParams.has('to'));

  // Form states
  const [formData, setFormData] = useState({
    airline: '',
    flight_number: '',
    from_location: '',
    to_location: '',
    departure_date: '',
    departure_time: '',
    capacity_weight: '',
    price_per_kg: '',
  });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      
      let endpoint = '/api/trips/?user_only=true';
      if (isSearchMode || filterFrom || filterTo) {
        endpoint = `/api/trips/?from=${encodeURIComponent(filterFrom)}&to=${encodeURIComponent(filterTo)}&date=${encodeURIComponent(filterDate)}`;
      }

      const res = await apiFetch(endpoint);
      if (res.status === 'success' && Array.isArray(res.data)) {
        const mapped = res.data.map((t: any) => ({
          airline: t.airline || 'Emirates',
          flightNo: t.flight_number,
          aircraft: t.aircraft || 'Boeing 777',
          from: t.from_location,
          fromAirport: t.from_airport || 'Indira Gandhi Intl.',
          to: t.to_location,
          toAirport: t.to_airport || 'Dubai Intl.',
          depDate: new Date(t.departure_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          depTime: t.departure_time,
          arrDate: new Date(t.arrival_date || t.departure_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          arrTime: t.arrival_time || t.departure_time,
          duration: t.duration || '3h 10m',
          terminalFrom: t.terminal_from || 'T3',
          terminalTo: t.terminal_to || 'T1',
          space: `${t.available_weight} KG`,
          price: `$${t.price_per_kg || '8.5'}`,
          seats: t.seats || '2 Seats',
          bookings: `${t.bookings_count} / 12`,
          progress: t.progress || 0,
          labels: ['Verified Traveler', 'Fragile Allowed', 'Documents', 'Electronics'],
          route: `${t.from_location} to ${t.to_location}`,
        }));
        setTripsList(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const [wallet, setWallet] = useState<{
    available: number;
    pending: number;
    escrow: number;
  }>({ available: 0, pending: 0, escrow: 0 });

  const fetchWallet = async () => {
    try {
      const res = await apiFetch('/api/wallet/summary');
      if (res.status === 'success' && res.data) {
        setWallet({
          available: Number(res.data.balance_available || 0),
          pending: Number(res.data.balance_pending || 0),
          escrow: Number(res.data.balance_escrow || 0),
        });
      }
    } catch (err) {
      console.error('Failed to fetch wallet in TripsPage:', err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchMode]);

  const upcomingTripsCount = tripsList.length;
  const activeBookingsCount = tripsList.reduce((acc, trip) => acc + parseInt(trip.bookings.split('/')[0] || '0'), 0);
  const availableSpace = tripsList.reduce((acc, trip) => acc + parseFloat(trip.space.split(' ')[0] || '0'), 0);

  const summaryCardsStats = [
    { icon: PlaneTakeoff, title: 'Upcoming Trips', value: upcomingTripsCount.toString(), trend: 'Active' },
    { icon: Luggage, title: 'Active Bookings', value: activeBookingsCount.toString(), trend: 'Active' },
    { icon: Package, title: 'Available Luggage Space', value: `${availableSpace} KG`, trend: 'Available' },
    { icon: Wallet, title: 'Total Earnings', value: `$${wallet.available.toFixed(2)}`, trend: 'Available' },
  ];


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        airline: formData.airline || 'Emirates',
        flight_number: formData.flight_number,
        from_location: formData.from_location,
        to_location: formData.to_location,
        departure_date: formData.departure_date,
        departure_time: formData.departure_time,
        capacity_weight: parseFloat(formData.capacity_weight) || 23.00,
        price_per_kg: parseFloat(formData.price_per_kg) || 8.50,
        aircraft: formData.airline === 'Emirates' ? 'A380-800' : 'Boeing 777',
        from_airport: formData.from_location.includes('(') ? formData.from_location : `${formData.from_location} Intl.`,
        to_airport: formData.to_location.includes('(') ? formData.to_location : `${formData.to_location} Intl.`,
        arrival_date: formData.departure_date,
        arrival_time: formData.departure_time,
        duration: '4h 20m',
        terminal_from: 'T' + (Math.floor(Math.random() * 3) + 1),
        terminal_to: 'T' + (Math.floor(Math.random() * 3) + 1),
        seats: 'Economy',
      };

      const res = await apiFetch('/api/trips/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.status === 'success') {
        alert('Trip registered successfully!');
        setIsRegisterTripOpen(false);
        // Clear form
        setFormData({
          airline: '',
          flight_number: '',
          from_location: '',
          to_location: '',
          departure_date: '',
          departure_time: '',
          capacity_weight: '',
          price_per_kg: '',
        });
        fetchTrips();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to register trip');
    }
  };

  return (
    <div className="fly-dashboard-shell">
      <div className="fly-dashboard-layout trips-page-layout">
        <Sidebar activeItem="Trips" />

        <main className="fly-main-panel">
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

          <section className="trips-header fly-card">
            <div>
              <h1 className="trips-header__title">{isSearchMode ? 'Available Live Flights' : 'My Trips'}</h1>
              <p className="trips-header__subtitle">
                {isSearchMode ? 'Browse verified travelers with available luggage space matching your route.' : 'Manage all your upcoming, active and completed travel routes.'}
              </p>
            </div>
            {!isSearchMode && (
              <button
                type="button"
                className="fly-btn fly-btn-primary trips-header__cta"
                onClick={() => setIsRegisterTripOpen(true)}
              >
                <span className="fly-btn-icon"><ArrowRight size={14} strokeWidth={2.3} /></span>
                Register New Trip
              </button>
            )}
          </section>

          <section className="trips-summary fly-grid trips-summary-grid">
            {summaryCardsStats.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="fly-card trips-summary-card fly-stat-card">
                  <div className="trips-summary-card__icon"><Icon size={20} strokeWidth={2} /></div>
                  <div className="trips-summary-card__title">{card.title}</div>
                  <div className="trips-summary-card__value">{card.value}</div>
                  <div className="trips-summary-card__trend">{card.trend}</div>
                </article>
              );
            })}
          </section>

          <section className="trip-filters fly-card">
            <div className="trip-filters__grid">
              <label className="trip-filter trip-filter--search">
                <span>From City</span>
                <div className="trip-filter__field">
                  <MapPin size={15} strokeWidth={2} className="text-flyora-teal" />
                  <input type="text" placeholder="e.g. London" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
                </div>
              </label>

              <label className="trip-filter">
                <span>To City</span>
                <div className="trip-filter__field">
                  <MapPin size={15} strokeWidth={2} className="text-flyora-blue" />
                  <input type="text" placeholder="e.g. Dubai" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
                </div>
              </label>
              
              <label className="trip-filter">
                <span>Departure Date</span>
                <div className="trip-filter__field">
                  <CalendarDays size={14} strokeWidth={2.1} className="text-slate-400" />
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                </div>
              </label>
              
              <label className="trip-filter opacity-50 pointer-events-none">
                <span>Airline</span>
                <div className="trip-filter__select">All Airlines <ChevronDown size={14} strokeWidth={2.1} /></div>
              </label>

              <label className="trip-filter opacity-50 pointer-events-none">
                <span>Sort By</span>
                <div className="trip-filter__select">Departure Date (Newest) <ChevronDown size={14} strokeWidth={2.1} /></div>
              </label>
              
              <div className="trip-filters__buttons">
                <button type="button" className="fly-btn fly-btn-secondary" onClick={() => { setFilterFrom(''); setFilterTo(''); setFilterDate(''); setIsSearchMode(false); }}>Reset Filters</button>
                <button type="button" className="fly-btn fly-btn-primary" onClick={() => setIsSearchMode(true)}>Apply Filters</button>
              </div>
            </div>
          </section>


          <section className="trip-list">
            {loading ? (
              <div className="py-12 text-center text-teal-400 font-bold">Loading flights...</div>
            ) : tripsList.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-bold bg-[#0e162f] rounded-2xl border border-[#1c2a54]/50">
                {isSearchMode ? 'No active flights found for this route. Try adjusting your search filters.' : 'No trips registered yet. Click "Register New Trip" above to add your first flight route!'}
              </div>
            ) : (
              tripsList.map((trip) => (
                <TripCard key={`${trip.airline}-${trip.flightNo}`} trip={trip} />
              ))
            )}
          </section>

          <section className="trip-bottom fly-grid">
            <article className="fly-card trip-chart-card">
              <div className="fly-section-head trip-chart-card__head">
                <div>
                  <div className="fly-card-title">Trips This Month</div>
                </div>
                <button type="button" className="fly-pill-button">This Month</button>
              </div>
              <div className="trip-chart">
                <div className="trip-chart__axis">
                  <span>{tripsList.length + 5}</span><span>{Math.floor(tripsList.length * 0.75) + 3}</span><span>{Math.floor(tripsList.length * 0.5) + 2}</span><span>{Math.floor(tripsList.length * 0.25) + 1}</span><span>0</span>
                </div>
                <div className="flex-1 flex items-end gap-2 h-full w-full pl-6 pt-2 pb-6 pr-2">
                  {[12, 19, 15, tripsList.length * 2, tripsList.length, 30, tripsList.length + 5].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center group h-full">
                      <div className="w-full bg-[#18B6A4]/20 rounded-t-sm hover:bg-[#18B6A4] transition-all relative" style={{ height: `${Math.min(val * 3, 100)}%`, minHeight: '4px' }}>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0e162f] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap z-10 border border-[#1c2a54]">
                          {val} Trips
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="trip-chart__labels">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </article>

            <div className="trip-bottom__stats fly-stat-grid">
              <article className="fly-card trip-mini-stat">
                <div className="trip-mini-stat__title">Monthly Earnings</div>
                <div className="trip-mini-stat__value">${wallet.available.toFixed(2)}</div>
                <div className="trip-mini-stat__trend">Active</div>
              </article>
              <article className="fly-card trip-mini-stat">
                <div className="trip-mini-stat__title">Total Trips</div>
                <div className="trip-mini-stat__value">{tripsList.length}</div>
                <div className="trip-mini-stat__trend">Registered</div>
              </article>
              <article className="fly-card trip-mini-stat">
                <div className="trip-mini-stat__title">Average Rating</div>
                <div className="trip-mini-stat__value">N/A</div>
                <div className="trip-mini-stat__trend">Pending</div>
              </article>
              <article className="fly-card trip-mini-stat">
                <div className="trip-mini-stat__title">Success Rate</div>
                <div className="trip-mini-stat__value">100%</div>
                <div className="trip-mini-stat__trend">Great</div>
              </article>
            </div>

            <article className="fly-card trips-actions-card">
              <div className="fly-card-title trips-actions-card__title">Quick Actions</div>
              <div className="trips-actions-grid">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="trips-action-button"
                      onClick={() => {
                        if (action.label === 'Register Trip') {
                          setIsRegisterTripOpen(true);
                        }
                      }}
                    >
                      <Icon size={22} strokeWidth={1.8} />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </article>
          </section>
        </main>

        <aside className="fly-utility-panel trips-utility-panel">
          <article className="fly-card fly-utility-card trips-widget">
            <div className="fly-card-title">Upcoming Flight</div>
            {tripsList.length > 0 ? (
              <>
                <div className="trip-widget-flight-route" style={{ marginTop: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                  {tripsList[0].flightNo} to {tripsList[0].to}
                </div>
                <div className="trip-widget-flight-meta">{tripsList[0].depDate} • {tripsList[0].depTime}</div>
              </>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400/80 font-bold">No upcoming trips.</div>
            )}
            <button type="button" className="fly-btn fly-btn-outline fly-btn-full py-1.5 mt-4" onClick={() => navigate('/trips')}>View My Trips</button>
          </article>

          <WeatherWidget />

          <article className="fly-card fly-utility-card trips-widget">
            <div className="fly-card-title">Travel Checklist</div>
            <div className="trips-checklist-status">4 / 6 Completed</div>
            <div className="trips-checklist-list">
              {checklist.map((item, index) => (
                <div key={item} className={`trips-checklist-item ${index < 4 ? 'is-done' : ''}`}>
                  <span className="trips-checklist-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="fly-card fly-utility-card trips-widget trips-widget--wallet">
            <div className="fly-card-title">Wallet Summary</div>
            <div className="fly-summary-row"><span>Available Balance</span><strong>${wallet.available.toFixed(2)}</strong></div>
            <div className="fly-summary-row"><span>Pending</span><strong>${wallet.pending.toFixed(2)}</strong></div>
            <div className="fly-summary-row"><span>Escrow</span><strong>${wallet.escrow.toFixed(2)}</strong></div>
            <button type="button" className="fly-link-button fly-link-inline" onClick={() => navigate('/wallet')}>Go to Wallet <ArrowRight size={13} strokeWidth={2.3} /></button>
          </article>

          <article className="fly-card fly-utility-card trips-widget trips-widget--tips">
            <div className="fly-card-title">Travel Tips</div>
            <p>Book early to save more and get better deals.</p>
            <div className="trips-tip-art" aria-hidden="true">
              <Plane size={28} strokeWidth={1.8} className="trips-tip-plane" />
              <div className="trips-tip-calendar" />
            </div>
          </article>
        </aside>
      </div>

      {isRegisterTripOpen && (
        <div className="trip-modal-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsRegisterTripOpen(false);
          }
        }}>
          <div className="trip-modal fly-card">
            <div className="trip-modal__header">
              <div>
                <div className="fly-card-title">Register New Trip</div>
                <p>Enter your flight details to share available luggage space.</p>
              </div>
              <button type="button" className="trip-modal__close" onClick={() => setIsRegisterTripOpen(false)}>
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <form className="trip-modal__form" onSubmit={handleRegisterTrip}>
              <div className="trip-modal__grid" style={{ paddingBottom: '10px' }}>
                <label className="col-span-1 md:col-span-2">
                  <span>Airline</span>
                  <input type="text" name="airline" required placeholder="e.g. Emirates" value={formData.airline} onChange={handleInputChange} />
                </label>
                <label className="col-span-1">
                  <span>Flight Number</span>
                  <input
                    type="text"
                    name="flight_number"
                    required
                    placeholder="e.g. EK501"
                    value={formData.flight_number}
                    onChange={handleInputChange}
                    className="uppercase"
                  />
                </label>
                <label className="col-span-1">
                  <span>Departure Date</span>
                  <input
                    type="date"
                    name="departure_date"
                    required
                    value={formData.departure_date}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  <span>From City</span>
                  <input type="text" name="from_location" required placeholder="e.g. Mumbai" value={formData.from_location} onChange={handleInputChange} />
                </label>
                <label>
                  <span>To City</span>
                  <input type="text" name="to_location" required placeholder="e.g. Dubai" value={formData.to_location} onChange={handleInputChange} />
                </label>
                <label>
                  <span>Departure Time</span>
                  <input type="time" name="departure_time" required value={formData.departure_time} onChange={handleInputChange} />
                </label>
                <label>
                  <span>Capacity Space (KG)</span>
                  <input
                    type="number"
                    name="capacity_weight"
                    required
                    placeholder="18"
                    value={formData.capacity_weight}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  <span>Price per KG ($)</span>
                  <input
                    type="text"
                    name="price_per_kg"
                    required
                    placeholder="8.5"
                    value={formData.price_per_kg}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="trip-modal__actions">
                <button type="button" className="fly-btn fly-btn-secondary" onClick={() => setIsRegisterTripOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="fly-btn fly-btn-primary">
                  Save Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;