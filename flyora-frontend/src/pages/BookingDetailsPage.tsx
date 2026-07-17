import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, ArrowLeft,
  Calendar, CheckCircle2, AlertTriangle, Landmark
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import './dashboard.css';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane },
  { label: 'Shipments', icon: Package },
  { label: 'Bookings', icon: CalendarDays, active: true },
  { label: 'Wallet', icon: Wallet },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/bookings/?user_only=true');
        if (res.status === 'success' && Array.isArray(res.data)) {
          const b = res.data.find((item: any) => 
            item.id.toString() === id || 
            `#${item.id}` === id ||
            item.id.toString().replace('#', '') === id
          );
          if (b) {
            setBooking({
              id: `#BK${b.id}`,
              rawId: b.id,
              status: b.status || 'Pending',
              createdAt: new Date(b.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
              package: {
                name: b.package_name || b.package?.name || 'Cargo Package',
                category: b.category || 'General',
                image: '📦',
              },
              weight: `${b.weight || 2} KG`,
              sender: {
                name: b.sender_name || 'Sender',
                city: b.from_location,
              },
              traveler: {
                name: b.traveler_name || 'Traveler',
                city: b.to_location,
              },
              route: {
                from: b.from_location,
                fromAirport: b.from_airport || 'Indira Gandhi Intl.',
                to: b.to_location,
                toAirport: b.to_airport || 'Dubai Intl.',
              },
              reward: parseFloat(b.reward || 50),
              paymentStatus: b.payment_status || 'Pending Deposit',
              escrow: b.escrow_status || 'Not Locked',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load booking details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [id]);

  if (loading) {
    return (
      <div className="fly-dashboard-shell">
        <div className="fly-dashboard-layout p-8 text-center text-teal-400 font-bold">
          Loading Booking Details...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="fly-dashboard-shell">
        <div className="fly-dashboard-layout p-8 text-center">
          <h2 className="text-xl font-black text-flyora-navy">Booking Not Found</h2>
          <p className="text-xs text-gray-400 mt-2">The booking reference #{id} does not exist.</p>
          <button type="button" className="fly-btn fly-btn-primary mt-4" onClick={() => navigate('/bookings')}>
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fly-dashboard-shell booking-details-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Bookings" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <button type="button" className="flex items-center gap-1 text-xs font-black text-flyora-navy" onClick={() => navigate('/bookings')}>
              <ArrowLeft size={14} /> Back to Bookings
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
                <h1 className="trips-header__title">Booking {booking.id}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  booking.status === 'Completed' || booking.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                  booking.status === 'Cancelled' || booking.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>{booking.status}</span>
              </div>
              <p className="trips-header__subtitle">Created on {booking.createdAt}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="fly-btn fly-btn-secondary" onClick={() => navigate('/support')}>
                Message Participant
              </button>
              {booking.status === 'Delivered' && (
                <button type="button" className="fly-btn fly-btn-primary" onClick={() => alert('Escrow release has been requested.')}>
                  Release Escrow
                </button>
              )}
            </div>
          </section>

          {/* Detailed Info Grid */}
          <section className="fly-grid fly-middle-grid">
            
            {/* Package & Space Info */}
            <article className="fly-card fly-section-card col-span-2">
              <div className="border-b border-gray-50 pb-4 mb-4">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Package Specifications</h3>
              </div>
              
              <div className="flex gap-5 items-center p-4 bg-slate-50 rounded-2xl">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl border border-slate-100">
                  {booking.package.image}
                </div>
                <div>
                  <h4 className="text-xs font-black text-flyora-navy">{booking.package.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                    Category: {booking.package.category} • Weight: {booking.weight}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Sender Details</div>
                  <div className="text-xs font-bold text-flyora-navy mt-1">{booking.sender.name}</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">{booking.sender.city}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Traveler Details</div>
                  <div className="text-xs font-bold text-flyora-navy mt-1">{booking.traveler.name}</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">{booking.traveler.city}</div>
                </div>
              </div>
            </article>

            {/* Flight Path & Escrow details */}
            <article className="fly-card fly-section-card">
              <div className="border-b border-gray-50 pb-4 mb-4">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Transit Details</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-sm font-black text-flyora-navy block">{booking.route.from}</strong>
                    <span className="text-[10px] text-gray-400 font-bold">{booking.route.fromAirport}</span>
                  </div>
                  <ArrowRight size={16} className="text-flyora-teal" />
                  <div className="text-right">
                    <strong className="text-sm font-black text-flyora-navy block">{booking.route.to}</strong>
                    <span className="text-[10px] text-gray-400 font-bold">{booking.route.toAirport}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-4" />

                <div className="space-y-2.5 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Reward Value:</span>
                    <strong className="text-flyora-teal font-extrabold">${booking.reward.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <strong className="text-flyora-navy font-extrabold">{booking.paymentStatus}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow Status:</span>
                    <strong className="text-emerald-600 font-black">{booking.escrow}</strong>
                  </div>
                </div>
              </div>
            </article>
          </section>

          {/* Timeline / Progress Status */}
          <section className="fly-card mt-6">
            <div className="border-b border-gray-50 pb-4 mb-5">
              <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Booking Action Timeline</h3>
            </div>
            
            <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white" />
                <div className="text-xs font-black text-flyora-navy">Booking Request Created</div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">{booking.createdAt}</p>
              </div>
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                  ['Confirmed', 'Accepted', 'In Transit', 'Delivered', 'Completed'].includes(booking.status) ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
                <div className="text-xs font-black text-flyora-navy">Payment Deposited in Escrow</div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Processed instantly upon verification</p>
              </div>
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                  ['In Transit', 'Delivered', 'Completed'].includes(booking.status) ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
                <div className="text-xs font-black text-flyora-navy">Handed Over & In Transit</div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Checked in by traveler during flight boarding</p>
              </div>
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                  ['Completed'].includes(booking.status) ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
                <div className="text-xs font-black text-flyora-navy">Delivery Confirmed & Funds Released</div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Escrow dispatched to traveler available wallet</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
