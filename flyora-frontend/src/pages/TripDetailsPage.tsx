import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, ArrowLeft,
  Calendar, CheckCircle2, AlertTriangle, Luggage
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import './dashboard.css';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane, active: true },
  { label: 'Shipments', icon: Package },
  { label: 'Bookings', icon: CalendarDays },
  { label: 'Wallet', icon: Wallet },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [trip, setTrip] = useState<any>(null);
  const [associatedBookings, setAssociatedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/trips/?user_only=true');
        if (res.status === 'success' && Array.isArray(res.data)) {
          const t = res.data.find((item: any) => 
            item.id.toString() === id || 
            item.flight_number.replace(/\s+/g, '') === id
          );
          if (t) {
            setTrip({
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
            });

            // Fetch associated bookings for this trip
            const bookingsRes = await apiFetch('/api/bookings/?user_only=true');
            if (bookingsRes.status === 'success' && Array.isArray(bookingsRes.data)) {
              const matches = bookingsRes.data.filter((b: any) => 
                (b.trip_id && b.trip_id.toString() === t.id.toString()) ||
                (b.from_location === t.from_location && b.to_location === t.to_location)
              ).map((b: any) => ({
                id: b.id.toString(),
                package: {
                  name: b.package_name || b.package?.name || 'Cargo Package',
                  image: '📦',
                },
                sender: {
                  name: b.sender_name || 'Sender',
                },
                weight: `${b.weight || 2} KG`,
              }));
              setAssociatedBookings(matches);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching trip details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTripData();
  }, [id]);

  if (loading) {
    return (
      <div className="fly-dashboard-shell">
        <div className="fly-dashboard-layout p-8 text-center text-teal-400 font-bold">
          Loading Trip Details...
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="fly-dashboard-shell">
        <div className="fly-dashboard-layout p-8 text-center">
          <h2 className="text-xl font-black text-flyora-navy">Trip Not Found</h2>
          <p className="text-xs text-gray-400 mt-2">The trip reference #{id} does not exist.</p>
          <button type="button" className="fly-btn fly-btn-primary mt-4" onClick={() => navigate('/trips')}>
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fly-dashboard-shell trip-details-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Trips" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <button type="button" className="flex items-center gap-1 text-xs font-black text-flyora-navy" onClick={() => navigate('/trips')}>
              <ArrowLeft size={14} /> Back to Trips
            </button>

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
              <div className="flex items-center gap-3">
                <h1 className="trips-header__title">Flight {trip.flightNo}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-50 text-flyora-teal">Active Trip</span>
              </div>
              <p className="trips-header__subtitle">{trip.airline} • {trip.aircraft}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="fly-btn fly-btn-secondary" onClick={() => alert('Manifest details downloaded.')}>
                Download Manifest
              </button>
              <button type="button" className="fly-btn fly-btn-primary" onClick={() => alert('Edit baggage space allowance.')}>
                Edit Space
              </button>
            </div>
          </section>

          {/* Detailed Info Grid */}
          <section className="fly-grid fly-middle-grid">
            {/* Flight Path Summary */}
            <article className="fly-card fly-section-card col-span-2">
              <div className="border-b border-gray-50 pb-4 mb-4">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Flight Schedule</h3>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl mb-6">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Departure</div>
                  <strong className="text-base font-black text-flyora-navy block mt-1">{trip.from}</strong>
                  <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{trip.fromAirport}</span>
                  <span className="text-[10px] text-flyora-navy font-bold block mt-1">{trip.depDate} • {trip.depTime}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Plane size={18} className="text-flyora-teal rotate-90" />
                  <span className="text-[9px] text-gray-400 font-bold mt-1">{trip.duration}</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Arrival</div>
                  <strong className="text-base font-black text-flyora-navy block mt-1">{trip.to}</strong>
                  <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{trip.toAirport}</span>
                  <span className="text-[10px] text-flyora-navy font-bold block mt-1">{trip.arrDate} • {trip.arrTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-500">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Terminal From</div>
                  <strong className="text-flyora-navy font-extrabold mt-1 block">{trip.terminalFrom}</strong>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Terminal To</div>
                  <strong className="text-flyora-navy font-extrabold mt-1 block">{trip.terminalTo}</strong>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Aircraft Seats</div>
                  <strong className="text-flyora-navy font-extrabold mt-1 block">{trip.seats}</strong>
                </div>
              </div>
            </article>

            {/* Cargo Allocation Status */}
            <article className="fly-card fly-section-card">
              <div className="border-b border-gray-50 pb-4 mb-4">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Luggage Allocation</h3>
              </div>
              <div className="text-center py-4">
                <div className="text-3xl font-black text-flyora-navy">{trip.space}</div>
                <p className="text-xs text-gray-400 mt-1 font-bold">Total Baggage Space Configured</p>
                <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-flyora-teal h-full" style={{ width: `${trip.progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-2">
                  <span>Space Locked: {trip.bookings}</span>
                  <span>{trip.progress}% Utilization</span>
                </div>
              </div>
            </article>
          </section>

          {/* Associated Cargo Packages */}
          <section className="fly-card mt-6">
            <div className="border-b border-gray-50 pb-4 mb-5">
              <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Assigned Cargo Packages</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-semibold">List of sender packages scheduled to be carried on this flight path.</p>
            </div>
            
            <div className="space-y-3">
              {associatedBookings.map((b) => (
                <div key={b.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center hover:border-flyora-teal transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200">
                      {b.package.image}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-flyora-navy">{b.package.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1">Sender: {b.sender.name} • Weight: {b.weight}</div>
                    </div>
                  </div>
                  <button type="button" className="text-xs font-bold text-flyora-teal hover:underline" onClick={() => navigate(`/booking/${b.id}`)}>
                    View Details
                  </button>
                </div>
              ))}
              {associatedBookings.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400 font-bold">No packages assigned to this trip route.</div>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default TripDetailsPage;
