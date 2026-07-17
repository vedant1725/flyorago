import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  ChevronDown,
  CreditCard,
  Gift,
  Headphones,
  LayoutGrid,
  Package,
  Plane,
  Search,
  Settings,
  UserRound,
  Wallet,
  BadgeCheck,
  Truck,
  TimerReset,
  X,
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import '../pages/dashboard.css';
import './shipments.css';
import ShipmentAnalytics from '../components/shipments/ShipmentAnalytics';
import ShipmentCard from '../components/shipments/ShipmentCard';
import ShipmentFilter from '../components/shipments/ShipmentFilter';
import ShipmentSidebar from '../components/shipments/ShipmentSidebar';
import ShipmentStatsCard from '../components/shipments/ShipmentStatsCard';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane },
  { label: 'Shipments', icon: Package, active: true },
  { label: 'Bookings', icon: TimerReset },
  { label: 'Wallet', icon: Wallet },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

const defaultFilters = {
  search: '',
  trackingNumber: '',
  origin: '',
  destination: '',
  status: '',
  category: '',
  sortBy: 'Newest First',
};

const ShipmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [shipmentsList, setShipmentsList] = useState<any[]>([]);

  // Filtering states
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // New Shipment Modal form states
  const [acceptedBookings, setAcceptedBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [dimensions, setDimensions] = useState('30x20x15 cm');
  const [insurance, setInsurance] = useState('Basic Cover');
  const [eta, setEta] = useState('');

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetch('/api/shipments/');
      if (res.status === 'success' && Array.isArray(res.data)) {
        const mapped = res.data.map((s: any) => {
          // Determine progress percentage from status
          let progressVal = 30;
          if (s.status === 'In Transit') progressVal = 70;
          if (s.status === 'Delivered') progressVal = 100;

          // Get latest log location for currentLocation
          const latestLog = s.logs && s.logs.length > 0 ? s.logs[s.logs.length - 1] : null;
          const currentLocation = latestLog ? latestLog.location : 'Origin';

          return {
            id: s.id.toString(),
            rawId: s.id,
            packageImage: s.packageImage || '📦',
            trackingNumber: s.trackingNumber || `PKG${s.id}`,
            packageName: s.packageName || 'Luggage Cargo',
            category: s.category || 'Electronics',
            status: s.status || 'Package Received',
            tags: ['Verified', s.insurance ? 'Insured' : 'Standard'],
            origin: s.origin || 'DEL',
            destination: s.destination || 'DXB',
            pickupDate: s.pickupDate || new Date(s.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            expectedDelivery: s.eta || 'TBD',
            progress: progressVal,
            currentLocation: currentLocation,
            flightNumber: s.flightNumber || 'N/A',
            lastUpdated: s.updated_at ? new Date(s.updated_at).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            eta: s.eta || 'Expected: TBD',
            weight: s.weight ? `${s.weight} KG` : '2.0 KG',
            dimensions: s.dimensions || 'N/A',
            reward: 85, // mock or pull if exists
            insurance: s.insurance || 'None',
            escrow: s.escrow || 'Hold',
          };
        });
        setShipmentsList(mapped);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shipments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcceptedBookings = async () => {
    try {
      const res = await apiFetch('/api/bookings/?user_only=true');
      if (res.status === 'success' && Array.isArray(res.data)) {
        // filter accepted bookings that do not have shipments yet
        const accepted = res.data.filter((b: any) => b.status === 'Accepted');
        setAcceptedBookings(accepted);
        if (accepted.length > 0) {
          setSelectedBookingId(accepted[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to fetch accepted bookings:', err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    if (isCreateOpen) {
      fetchAcceptedBookings();
    }
  }, [isCreateOpen]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      alert('Please select an accepted booking reference.');
      return;
    }
    try {
      const payload = {
        booking: parseInt(selectedBookingId),
        pickup_address: pickupAddress,
        delivery_address: deliveryAddress,
        dimensions: dimensions,
        insurance: insurance,
        eta: eta || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] // default 2 days out
      };

      const res = await apiFetch('/api/shipments/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.status === 'success') {
        alert('Shipment initialized successfully!');
        setIsCreateOpen(false);
        setPickupAddress('');
        setDeliveryAddress('');
        setEta('');
        fetchShipments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initialize shipment tracking');
    }
  };

  const setFilter = (key: string, value: string) => {
    setPage(1);
    setFilters(current => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters(defaultFilters);
  };

  const filteredShipments = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const filtered = shipmentsList.filter((shipment) => {
      const matchesSearch = !search || [
        shipment.trackingNumber,
        shipment.packageName,
        shipment.origin,
        shipment.destination,
        shipment.status,
      ].some((value) => String(value).toLowerCase().includes(search));

      const matchesTracking = !filters.trackingNumber || shipment.trackingNumber.toLowerCase().includes(filters.trackingNumber.toLowerCase());
      const matchesOrigin = !filters.origin || shipment.origin.toLowerCase().includes(filters.origin.toLowerCase());
      const matchesDest = !filters.destination || shipment.destination.toLowerCase().includes(filters.destination.toLowerCase());
      const matchesStatus = !filters.status || shipment.status.toLowerCase().includes(filters.status.toLowerCase());
      const matchesCategory = !filters.category || shipment.category.toLowerCase().includes(filters.category.toLowerCase());

      return matchesSearch && matchesTracking && matchesOrigin && matchesDest && matchesStatus && matchesCategory;
    });

    filtered.sort((left, right) => {
      const leftTime = new Date(left.pickupDate).getTime();
      const rightTime = new Date(right.pickupDate).getTime();
      return filters.sortBy === 'Oldest First' ? leftTime - rightTime : rightTime - leftTime;
    });

    return filtered;
  }, [filters, shipmentsList]);

  // Derived counts
  const activeCount = shipmentsList.filter(s => s.status !== 'Delivered').length;
  const inTransitCount = shipmentsList.filter(s => s.status === 'In Transit').length;
  const deliveredCount = shipmentsList.filter(s => s.status === 'Delivered').length;

  const summaryCardsStats = [
    { icon: Package, title: 'Active Shipments', value: activeCount.toString(), trend: '+16% this month' },
    { icon: Truck, title: 'In Transit', value: inTransitCount.toString(), trend: '+8% this month' },
    { icon: BadgeCheck, title: 'Delivered', value: deliveredCount.toString(), trend: '+22% this month' },
    { icon: Wallet, title: 'Total Earnings', value: `$${deliveredCount * 85}`, trend: '+18.6% this month' },
  ];

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / pageSize));
  const visibleShipments = filteredShipments.slice((page - 1) * pageSize, page * pageSize);

  const handleViewDetails = (shipment: any) => navigate('/shipment/' + shipment.rawId);

  return (
    <div className="fly-dashboard-shell shipments-page">
      <div className="fly-dashboard-layout shipments-page-layout">
        <Sidebar activeItem="Shipments" />

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

          <section className="shipments-header fly-card">
            <div>
              <h1 className="shipments-header__title">Shipments</h1>
              <p className="shipments-header__subtitle">Track and manage all your package deliveries from pickup to final destination.</p>
            </div>
            <button type="button" className="fly-btn fly-btn-primary shipments-header__cta" onClick={() => setIsCreateOpen(true)}>
              <span className="fly-btn-icon"><ArrowRight size={14} strokeWidth={2.3} /></span>
              Create Shipment
            </button>
          </section>

          <section className="shipments-summary-grid fly-grid">
            {summaryCardsStats.map((card) => (
              <ShipmentStatsCard key={card.title} icon={card.icon} title={card.title} value={card.value} trend={card.trend} />
            ))}
          </section>

          <ShipmentFilter
            filters={filters}
            onChange={(key, val) => setFilter(key, val)}
            onReset={resetFilters}
            onApply={() => setPage(1)}
          />

          <section className="shipments-list-wrap">
            {isLoading ? (
              <div className="shipments-skeleton fly-card">
                <div className="shipments-skeleton__line shipments-skeleton__line--wide" />
                <div className="shipments-skeleton__line" />
                <div className="shipments-skeleton__line" />
                <div className="shipments-skeleton__line" />
                <div className="shipments-skeleton__line shipments-skeleton__line--wide" />
              </div>
            ) : error ? (
              <div className="shipments-state fly-card">
                <div className="shipments-state__title">Unable to load shipments</div>
                <p>{error}</p>
              </div>
            ) : visibleShipments.length === 0 ? (
              <div className="shipments-state fly-card">
                <div className="shipments-state__title">No shipments found</div>
                <p>Try adjusting your filters or reset them to see all shipment records.</p>
                <button type="button" className="fly-btn fly-btn-primary" onClick={resetFilters}>Reset Filters</button>
              </div>
            ) : (
              <div className="shipments-list">
                {visibleShipments.map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    onViewDetails={handleViewDetails}
                    onEdit={() => {}}
                    onDuplicate={() => {}}
                    onCancel={() => {}}
                    onDelete={() => {}}
                    onTrack={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="shipments-pagination fly-card">
            <button type="button" className="shipments-pagination__button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
            <div className="shipments-pagination__pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button key={pageNumber} type="button" className={`shipments-pagination__page ${page === pageNumber ? 'is-active' : ''}`} onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </button>
              ))}
            </div>
            <button type="button" className="shipments-pagination__button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
          </section>

          <ShipmentAnalytics />
        </main>

        <ShipmentSidebar shipments={shipmentsList} />
      </div>

      {isCreateOpen && (
        <div className="shipment-modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) setIsCreateOpen(false); }}>
          <div className="shipment-modal fly-card">
            <div className="shipment-modal__head">
              <div>
                <div className="fly-card-title">Create Shipment</div>
                <p>Start a new shipment request and lock the reward in escrow.</p>
              </div>
              <button type="button" className="shipment-modal__close" onClick={() => setIsCreateOpen(false)}>
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="shipment-modal__form">
              <div className="shipment-modal__grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Select Accepted Booking</span>
                  <select
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                  >
                    {acceptedBookings.length === 0 ? (
                      <option value="">No accepted bookings without tracking</option>
                    ) : (
                      acceptedBookings.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.package_name} ({b.weight} KG) • Sender: {b.sender_name} ➔ Traveler: {b.traveler_name}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Pickup Address</span>
                  <input
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    type="text"
                    required
                    placeholder="Terminal 3 Cargo Office, Delhi"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Delivery Address</span>
                  <input
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    type="text"
                    required
                    placeholder="Al Maktoum Airport Storage, Dubai"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Dimensions</span>
                  <input
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    type="text"
                    required
                    placeholder="30x20x15 cm"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Insurance Detail</span>
                  <input
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    type="text"
                    placeholder="e.g. Basic Cover, Full Coverage"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Expected Delivery Date</span>
                  <input
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    type="date"
                    required
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                  />
                </label>
              </div>

              <div className="shipment-modal__actions" style={{ marginTop: '20px' }}>
                <button type="button" className="fly-btn fly-btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button type="submit" className="fly-btn fly-btn-primary">Save Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentsPage;
