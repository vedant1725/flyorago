import React from 'react';
import type { BookingRecord } from '../../types/bookings';
import BookingRow from './BookingRow';

interface Props {
  bookings: BookingRecord[];
  onViewDetails?: (booking: BookingRecord) => void;
  onEdit?: (booking: BookingRecord) => void;
  onDuplicate?: (booking: BookingRecord) => void;
  onCancel?: (booking: BookingRecord) => void;
  onDelete?: (booking: BookingRecord) => void;
}

const BookingTable: React.FC<Props> = ({ bookings, onViewDetails, onEdit, onDuplicate, onCancel, onDelete }) => {
  return (
    <section className="fly-card bookings-table-card">
      <div className="bookings-table-wrap">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Sender</th>
              <th>Traveler</th>
              <th>Route</th>
              <th>Package</th>
              <th>Weight</th>
              <th>Reward</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onCancel={onCancel}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bookings-table-mobile">
        {bookings.map((booking) => (
          <BookingRow
            key={booking.id}
            booking={booking}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
};

export default BookingTable;