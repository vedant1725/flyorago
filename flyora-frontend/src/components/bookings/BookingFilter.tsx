import React from 'react';
import { CalendarDays, ChevronDown, Search } from 'lucide-react';

interface Props {
  search: string;
  bookingId: string;
  sender: string;
  traveler: string;
  category: string;
  bookingStatus: string;
  paymentStatus: string;
  dateStart: string;
  dateEnd: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onBookingIdChange: (value: string) => void;
  onSenderChange: (value: string) => void;
  onTravelerChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBookingStatusChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  onDateStartChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
}

const BookingFilter: React.FC<Props> = ({
  search,
  bookingId,
  sender,
  traveler,
  category,
  bookingStatus,
  paymentStatus,
  dateStart,
  dateEnd,
  sortBy,
  onSearchChange,
  onBookingIdChange,
  onSenderChange,
  onTravelerChange,
  onCategoryChange,
  onBookingStatusChange,
  onPaymentStatusChange,
  onDateStartChange,
  onDateEndChange,
  onSortByChange,
  onReset,
  onApply,
}) => {
  return (
    <section className="fly-card bookings-filter-card">
      <div className="bookings-filter-grid">
        <label className="booking-filter booking-filter--search">
          <span>Search Booking</span>
          <div className="booking-filter__field">
            <Search size={15} strokeWidth={2} />
            <input type="text" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by ID, tracking, etc." />
          </div>
        </label>
        <label className="booking-filter">
          <span>Booking ID</span>
          <input className="booking-filter__input" type="text" value={bookingId} onChange={(event) => onBookingIdChange(event.target.value)} placeholder="Enter Booking ID" />
        </label>
        <label className="booking-filter">
          <span>Sender</span>
          <div className="booking-filter__select" onClick={() => onSenderChange(sender)}>
            <input value={sender} onChange={(event) => onSenderChange(event.target.value)} placeholder="All Senders" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>
        <label className="booking-filter">
          <span>Traveler</span>
          <div className="booking-filter__select" onClick={() => onTravelerChange(traveler)}>
            <input value={traveler} onChange={(event) => onTravelerChange(event.target.value)} placeholder="All Travelers" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>
        <label className="booking-filter">
          <span>Package Category</span>
          <div className="booking-filter__select" onClick={() => onCategoryChange(category)}>
            <input value={category} onChange={(event) => onCategoryChange(event.target.value)} placeholder="All Categories" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>
        <label className="booking-filter">
          <span>Booking Status</span>
          <div className="booking-filter__select" onClick={() => onBookingStatusChange(bookingStatus)}>
            <input value={bookingStatus} onChange={(event) => onBookingStatusChange(event.target.value)} placeholder="All Status" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>
        <label className="booking-filter">
          <span>Payment Status</span>
          <div className="booking-filter__select" onClick={() => onPaymentStatusChange(paymentStatus)}>
            <input value={paymentStatus} onChange={(event) => onPaymentStatusChange(event.target.value)} placeholder="All Payment Status" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>
        <label className="booking-filter">
          <span>Date Range</span>
          <div className="booking-filter__range">
            <CalendarDays size={14} strokeWidth={2.1} />
            <input type="date" value={dateStart} onChange={(event) => onDateStartChange(event.target.value)} />
            <span>to</span>
            <input type="date" value={dateEnd} onChange={(event) => onDateEndChange(event.target.value)} />
          </div>
        </label>
        <label className="booking-filter">
          <span>Sort By</span>
          <div className="booking-filter__select" onClick={() => onSortByChange(sortBy)}>
            <input value={sortBy} onChange={(event) => onSortByChange(event.target.value)} placeholder="Newest First" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>

        <div className="bookings-filter-actions">
          <button type="button" className="fly-btn fly-btn-secondary" onClick={onReset}>Reset Filters</button>
          <button type="button" className="fly-btn fly-btn-primary" onClick={onApply}>Apply Filters</button>
        </div>
      </div>
    </section>
  );
};

export default BookingFilter;