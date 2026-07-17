import React from 'react';
import type { BookingStatus, PaymentStatus } from '../../types/bookings';

type BadgeKind = 'booking' | 'payment';

interface Props {
  label: BookingStatus | PaymentStatus;
  kind?: BadgeKind;
}

const bookingClassMap: Record<BookingStatus, string> = {
  Pending: 'is-pending',
  Confirmed: 'is-confirmed',
  Accepted: 'is-accepted',
  'In Transit': 'is-transit',
  Delivered: 'is-delivered',
  Completed: 'is-completed',
  Cancelled: 'is-cancelled',
  Rejected: 'is-rejected',
};

const paymentClassMap: Record<PaymentStatus, string> = {
  Paid: 'is-paid',
  Pending: 'is-pending',
  'Escrow Hold': 'is-escrow',
  'Escrow Pending': 'is-escrow-pending',
  Released: 'is-released',
};

const BookingStatusBadge: React.FC<Props> = ({ label, kind = 'booking' }) => {
  const className = kind === 'booking'
    ? bookingClassMap[label as BookingStatus]
    : paymentClassMap[label as PaymentStatus];

  return <span className={`booking-badge ${className}`}>{label}</span>;
};

export default BookingStatusBadge;