import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarDays,
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
  ClipboardList,
  Truck,
  X,
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import './dashboard.css';
import BookingAnalytics from '../components/bookings/BookingAnalytics';
import BookingFilter from '../components/bookings/BookingFilter';
import BookingSidebar from '../components/bookings/BookingSidebar';
import BookingStatsCard from '../components/bookings/BookingStatsCard';
import BookingTable from '../components/bookings/BookingTable';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane },
  { label: 'Shipments', icon: Package },
  { label: 'Bookings', icon: ClipboardList, active: true },
  { label: 'Wallet', icon: Wallet },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

const defaultFilters = {
  search: '',
  bookingId: '',
  sender: '',
  traveler: '',
  category: '',
  bookingStatus: '',
  paymentStatus: '',
  dateStart: '',
  dateEnd: '',
  sortBy: 'Newest First',
};

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [filters, setFilters] = useState(defaultFilters);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [bookingsList, setBookingsList] = useState<any[]>([]);

  // Modal related state
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [packageName, setPackageName] = useState('');
  const [packageCategory, setPackageCategory] = useState('Electronics');
  const [weight, setWeight] = useState('');
  const [reward, setReward] = useState('');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/api/bookings/?user_only=true');
      if (res.status === 'success' && Array.isArray(res.data)) {
        const mapped = res.data.map((b: any) => ({
          id: `#BKG${b.id}`,
          rawId: b.id,
          createdAt: b.createdAt || new Date(b.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          sender: {
            name: b.sender?.name || b.sender_name || 'Sender',
            city: 'Sender',
            initials: (b.sender?.name || b.sender_name || 'S').split(' ').map((n: string) => n[0]).join(''),
          },
          traveler: {
            name: b.traveler?.name || b.traveler_name || 'Traveler',
            city: 'Traveler',
            initials: (b.traveler?.name || b.traveler_name || 'T').split(' ').map((n: string) => n[0]).join(''),
          },
          route: {
            from: b.route?.from || 'Origin',
            to: b.route?.to || 'Dest',
            fromAirport: b.route?.fromAirport || 'Origin Airport',
            toAirport: b.route?.toAirport || 'Dest Airport',
          },
          package: {
            image: b.package?.image || '📦',
            name: b.package?.name || b.package_name || 'Package',
            category: b.package?.category || b.package_category || 'Electronics',
          },
          weight: `${b.weight} KG`,
          reward: parseFloat(b.reward) || 0,
          paymentStatus: b.paymentStatus || 'Pending',
          escrow: b.escrow || 'Inactive',
          status: b.status || 'Pending',
        }));
        setBookingsList(mapped);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTrips = async () => {
    try {
      const res = await apiFetch('/api/trips/');
      if (res.status === 'success' && Array.isArray(res.data)) {
        setAvailableTrips(res.data);
        if (res.data.length > 0) {
          setSelectedTripId(res.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load trips for booking:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (isNewBookingOpen) {
      fetchAvailableTrips();
    }
  }, [isNewBookingOpen]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) {
      alert('Please select a traveler trip.');
      return;
    }
    try {
      const payload = {
        trip: parseInt(selectedTripId),
        package_name: packageName,
        package_category: packageCategory,
        package_image: '📦',
        weight: parseFloat(weight) || 1.0,
        reward: parseFloat(reward) || 10.0,
      };

      const res = await apiFetch('/api/bookings/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.status === 'success') {
        alert('Booking request sent successfully!');
        setIsNewBookingOpen(false);
        setPackageName('');
        setWeight('');
        setReward('');
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit booking');
    }
  };

  const filteredBookings = useMemo(() => {
    try {
      const search = filters.search.trim().toLowerCase();

      const filtered = bookingsList.filter((booking) => {
        const matchesSearch = !search || [
          booking.id,
          booking.sender.name,
          booking.traveler.name,
          booking.route.from,
          booking.route.to,
          booking.package.name,
          booking.status,
          booking.paymentStatus,
        ].some((value) => String(value).toLowerCase().includes(search));

        const matchesBookingId = !filters.bookingId || booking.id.toLowerCase().includes(filters.bookingId.toLowerCase());
        const matchesSender = !filters.sender || booking.sender.name.toLowerCase().includes(filters.sender.toLowerCase());
        const matchesTraveler = !filters.traveler || booking.traveler.name.toLowerCase().includes(filters.traveler.toLowerCase());
        const matchesCategory = !filters.category || booking.package.category.toLowerCase().includes(filters.category.toLowerCase());
        const matchesBookingStatus = !filters.bookingStatus || booking.status.toLowerCase().includes(filters.bookingStatus.toLowerCase());
        const matchesPaymentStatus = !filters.paymentStatus || booking.paymentStatus.toLowerCase().includes(filters.paymentStatus.toLowerCase());

        return matchesSearch && matchesBookingId && matchesSender && matchesTraveler && matchesCategory && matchesBookingStatus && matchesPaymentStatus;
      });

      filtered.sort((left, right) => {
        const leftTime = new Date(left.createdAt).getTime();
        const rightTime = new Date(right.createdAt).getTime();
        return filters.sortBy === 'Oldest First' ? leftTime - rightTime : rightTime - leftTime;
      });

      return filtered;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Something went wrong while loading bookings.');
      return [];
    }
  }, [filters, bookingsList]);

  // Derived stats
  const pendingCount = bookingsList.filter(b => b.status === 'Pending').length;
  const confirmedCount = bookingsList.filter(b => b.status === 'Accepted' || b.status === 'Confirmed').length;
  const inTransitCount = bookingsList.filter(b => b.status === 'In Transit').length;
  const completedCount = bookingsList.filter(b => b.status === 'Completed').length;

  const summaryCardsStats = [
    { icon: ClipboardList, title: 'Pending Bookings', value: pendingCount.toString(), trend: '+12% this month' },
    { icon: BadgeCheck, title: 'Confirmed', value: confirmedCount.toString(), trend: '+18% this month' },
    { icon: Truck, title: 'In Transit', value: inTransitCount.toString(), trend: '+5% this month' },
    { icon: Gift, title: 'Completed', value: completedCount.toString(), trend: '+22% this month' },
  ];

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const visibleBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const setFilter = (key: keyof typeof defaultFilters, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters(defaultFilters);
  };

  const handleBookingAction = (action: string) => async (booking: any) => {
    try {
      const res = await apiFetch(`/api/bookings/${booking.rawId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (res.status === 'success') {
        alert(`Booking request ${action.toLowerCase()}ed successfully!`);
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete action');
    }
  };

  return (
    <div className="fly-dashboard-shell bookings-page">
      <div className="fly-dashboard-layout bookings-page-layout">
        <Sidebar activeItem="Bookings" />

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

          <section className="bookings-header fly-card">
            <div>
              <h1 className="bookings-header__title">Bookings</h1>
              <p className="bookings-header__subtitle">Manage all package booking requests, confirmations and completed deliveries.</p>
            </div>
            <button type="button" className="fly-btn fly-btn-primary bookings-header__cta" onClick={() => setIsNewBookingOpen(true)}>
              <span className="fly-btn-icon"><ArrowRight size={14} strokeWidth={2.3} /></span>
              New Booking
            </button>
          </section>

          <section className="bookings-summary-grid fly-grid">
            {summaryCardsStats.map((card) => (
              <BookingStatsCard key={card.title} icon={card.icon} title={card.title} value={card.value} trend={card.trend} />
            ))}
          </section>

          <BookingFilter
            search={filters.search}
            bookingId={filters.bookingId}
            sender={filters.sender}
            traveler={filters.traveler}
            category={filters.category}
            bookingStatus={filters.bookingStatus}
            paymentStatus={filters.paymentStatus}
            dateStart={filters.dateStart}
            dateEnd={filters.dateEnd}
            sortBy={filters.sortBy}
            onSearchChange={(value) => setFilter('search', value)}
            onBookingIdChange={(value) => setFilter('bookingId', value)}
            onSenderChange={(value) => setFilter('sender', value)}
            onTravelerChange={(value) => setFilter('traveler', value)}
            onCategoryChange={(value) => setFilter('category', value)}
            onBookingStatusChange={(value) => setFilter('bookingStatus', value)}
            onPaymentStatusChange={(value) => setFilter('paymentStatus', value)}
            onDateStartChange={(value) => setFilter('dateStart', value)}
            onDateEndChange={(value) => setFilter('dateEnd', value)}
            onSortByChange={(value) => setFilter('sortBy', value)}
            onReset={resetFilters}
            onApply={() => setPage(1)}
          />

          <section className="bookings-state-wrap">
            {isLoading ? (
              <div className="bookings-skeleton fly-card">
                <div className="bookings-skeleton__line bookings-skeleton__line--wide" />
                <div className="bookings-skeleton__line" />
                <div className="bookings-skeleton__line" />
                <div className="bookings-skeleton__line" />
                <div className="bookings-skeleton__line bookings-skeleton__line--wide" />
              </div>
            ) : error ? (
              <div className="bookings-state fly-card">
                <div className="bookings-state__title">Unable to load bookings</div>
                <p>{error}</p>
              </div>
            ) : visibleBookings.length === 0 ? (
              <div className="bookings-state fly-card">
                <div className="bookings-state__title">No bookings found</div>
                <p>Try adjusting your filters or reset them to see the full list.</p>
                <button type="button" className="fly-btn fly-btn-primary" onClick={resetFilters}>Reset Filters</button>
              </div>
            ) : (
              <BookingTable
                bookings={visibleBookings}
                onViewDetails={(b) => navigate('/booking/' + b.rawId)}
                onEdit={handleBookingAction('ACCEPT')} // Bind row controls to accept/reject/cancel API calls
                onDuplicate={handleBookingAction('REJECT')}
                onCancel={handleBookingAction('CANCEL')}
                onDelete={handleBookingAction('RELEASE_ESCROW')}
              />
            )}
          </section>

          <section className="bookings-pagination fly-card">
            <button type="button" className="bookings-pagination__button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </button>
            <div className="bookings-pagination__pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button key={pageNumber} type="button" className={`bookings-pagination__page ${page === pageNumber ? 'is-active' : ''}`} onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </button>
              ))}
            </div>
            <button type="button" className="bookings-pagination__button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
              Next
            </button>
          </section>

          <BookingAnalytics />
        </main>

        <BookingSidebar />
      </div>

      {isNewBookingOpen && (
        <div className="booking-modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) setIsNewBookingOpen(false); }}>
          <div className="booking-modal fly-card">
            <div className="booking-modal__header">
              <div>
                <div className="fly-card-title">New Booking</div>
                <p>Create a new booking request and lock the reward in escrow.</p>
              </div>
              <button type="button" className="booking-modal__close" onClick={() => setIsNewBookingOpen(false)}>
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="booking-modal__form">
              <div className="booking-modal__grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Select Traveler Flight / Trip</span>
                  <select
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                  >
                    {availableTrips.length === 0 ? (
                      <option value="">No traveler trips available</option>
                    ) : (
                      availableTrips.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.airline} ({t.flight_number}) • {t.from_location} ➔ {t.to_location} [Space: {t.available_weight} KG]
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Package Name</span>
                  <input
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro, Clothes, Documents"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Package Category</span>
                  <select
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    value={packageCategory}
                    onChange={(e) => setPackageCategory(e.target.value)}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Documents">Documents</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Others">Others</option>
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Package Weight (KG)</span>
                  <input
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    type="number"
                    step="0.1"
                    required
                    placeholder="2.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c9ab8' }}>Reward Reward ($)</span>
                  <input
                    style={{ background: '#0e162f', border: '1px solid #1c2a54', padding: '10px', borderRadius: '8px', color: '#fff' }}
                    type="number"
                    required
                    placeholder="85"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                  />
                </label>
              </div>

              <div className="booking-modal__actions" style={{ marginTop: '20px' }}>
                <button type="button" className="fly-btn fly-btn-secondary" onClick={() => setIsNewBookingOpen(false)}>Cancel</button>
                <button type="submit" className="fly-btn fly-btn-primary">Save Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;