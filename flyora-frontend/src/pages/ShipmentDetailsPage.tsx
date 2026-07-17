import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, ArrowLeft,
  Calendar, CheckCircle2, AlertTriangle, Truck
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import './dashboard.css';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane },
  { label: 'Shipments', icon: Package, active: true },
  { label: 'Bookings', icon: CalendarDays },
  { label: 'Wallet', icon: Wallet },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

const ShipmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShipmentData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/shipments/');
        if (res.status === 'success' && Array.isArray(res.data)) {
          const s = res.data.find((item: any) => 
            item.id.toString() === id || 
            `#${item.id}` === id ||
            item.id.toString().replace('#', '') === id ||
            item.trackingNumber === id
          );
          if (s) {
            setShipment({
              id: `#SH${s.id}`,
              rawId: s.id,
              status: s.status || 'Pending',
              trackingNumber: s.trackingNumber || `PKG${s.id}`,
              packageName: s.packageName || s.booking_details?.package_name || 'Luggage Cargo',
              category: s.category || 'General',
              weight: s.weight ? `${s.weight} KG` : '2.0 KG',
              dimensions: s.dimensions || '30x20x15 cm',
              insurance: s.insurance || 'None',
              senderName: s.booking_details?.sender_name || 'Sender Partner',
              travelerName: s.booking_details?.traveler_name || 'Traveler Carrying',
              packageImage: '📦',
              origin: s.origin || 'DEL',
              destination: s.destination || 'DXB',
              pickupAddress: s.pickupAddress || 'Baggage Terminal',
              deliveryAddress: s.deliveryAddress || 'Airport Handoff Point',
              flightNumber: s.flightNumber || 'N/A',
              eta: s.eta || 'Expected: TBD',
              escrow: s.escrow || 'Pending Release',
              pickupDate: s.pickupDate || new Date(s.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            });
          }
        }
      } catch (err) {
        console.error('Failed to load shipment details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadShipmentData();
  }, [id]);

  if (loading) {
    return (
      <div className="fly-dashboard-shell">
        <div className="fly-dashboard-layout p-8 text-center text-teal-400 font-bold">
          Loading Shipment Details...
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="fly-dashboard-shell">
        <div className="fly-dashboard-layout p-8 text-center">
          <h2 className="text-xl font-black text-flyora-navy">Shipment Not Found</h2>
          <p className="text-xs text-gray-400 mt-2">The shipment reference #{id} does not exist.</p>
          <button type="button" className="fly-btn fly-btn-primary mt-4" onClick={() => navigate('/shipments')}>
            Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fly-dashboard-shell shipment-details-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Shipments" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <button type="button" className="flex items-center gap-1 text-xs font-black text-flyora-navy" onClick={() => navigate('/shipments')}>
              <ArrowLeft size={14} /> Back to Shipments
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
                <h1 className="trips-header__title">Shipment {shipment.id}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  shipment.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                  shipment.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                }`}>{shipment.status}</span>
              </div>
              <p className="trips-header__subtitle">Tracking Reference: {shipment.trackingNumber}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="fly-btn fly-btn-secondary" onClick={() => navigate('/support')}>
                Message Senders
              </button>
            </div>
          </section>

          {/* Detailed Info Grid */}
          <section className="fly-grid fly-middle-grid">
            {/* Package details */}
            <article className="fly-card fly-section-card col-span-2">
              <div className="border-b border-gray-50 pb-4 mb-4">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Cargo Details</h3>
              </div>
              
              <div className="flex gap-5 items-center p-4 bg-slate-50 rounded-2xl mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl border border-slate-100">
                  {shipment.packageImage}
                </div>
                <div>
                  <h4 className="text-xs font-black text-flyora-navy">{shipment.packageName}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                    Category: {shipment.category} • Weight: {shipment.weight}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Dimensions</div>
                  <strong className="text-flyora-navy font-extrabold mt-1 block">{shipment.dimensions}</strong>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Insurance Status</div>
                  <strong className="text-emerald-600 font-black mt-1 block">{shipment.insurance}</strong>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Sender Partner</div>
                  <strong className="text-flyora-navy font-extrabold mt-1 block">{shipment.senderName}</strong>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Traveler Carrying</div>
                  <strong className="text-flyora-navy font-extrabold mt-1 block">{shipment.travelerName}</strong>
                </div>
              </div>
            </article>

            {/* Flight Path / Route details */}
            <article className="fly-card fly-section-card">
              <div className="border-b border-gray-50 pb-4 mb-4">
                <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Transit Details</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-sm font-black text-flyora-navy block">{shipment.origin.split(',')[0]}</strong>
                    <span className="text-[10px] text-gray-400 font-medium">{shipment.pickupAddress}</span>
                  </div>
                  <ArrowRight size={16} className="text-flyora-teal" />
                  <div className="text-right">
                    <strong className="text-sm font-black text-flyora-navy block">{shipment.destination.split(',')[0]}</strong>
                    <span className="text-[10px] text-gray-400 font-medium">{shipment.deliveryAddress}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-4" />

                <div className="space-y-2.5 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Flight Number:</span>
                    <strong className="text-flyora-navy font-extrabold">{shipment.flightNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected ETA:</span>
                    <strong className="text-flyora-teal font-extrabold">{shipment.eta}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow Release:</span>
                    <strong className="text-flyora-navy font-extrabold">{shipment.escrow}</strong>
                  </div>
                </div>
              </div>
            </article>
          </section>

          {/* Tracking History */}
          <section className="fly-card mt-6">
            <div className="border-b border-gray-50 pb-4 mb-5">
              <h3 className="fly-card-title text-sm font-bold uppercase tracking-wider">Real-time Progress Logs</h3>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white" />
                <div className="text-xs font-black text-flyora-navy">Cargo Package Checked-in</div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Processed at airport baggage terminal • {shipment.pickupDate}</p>
              </div>
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                  ['In Transit', 'Customs', 'Delivered'].includes(shipment.status) ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
                <div className="text-xs font-black text-flyora-navy">In Flight - En Route</div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Flight {shipment.flightNumber} airborne in corridor</p>
              </div>
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                  ['Customs', 'Delivered'].includes(shipment.status) ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
                <div className="text-xs font-black text-flyora-navy">Customs Cleared</div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Cleared at destination airport clearance check</p>
              </div>
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                  ['Delivered'].includes(shipment.status) ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
                <div className="text-xs font-black text-flyora-navy">Dispatched for Receiver Handoff</div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Traveler handoff scheduled at delivery point</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default ShipmentDetailsPage;
