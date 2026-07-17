import React from 'react';
import { ArrowRight, Package } from 'lucide-react';
import type { BookingRecord } from '../../types/bookings';
import BookingStatusBadge from './BookingStatusBadge';
import BookingActionsMenu from './BookingActionsMenu';

interface Props {
  booking: BookingRecord;
  onViewDetails?: (booking: BookingRecord) => void;
  onEdit?: (booking: BookingRecord) => void;
  onDuplicate?: (booking: BookingRecord) => void;
  onCancel?: (booking: BookingRecord) => void;
  onDelete?: (booking: BookingRecord) => void;
}

const BookingRow: React.FC<Props> = ({ booking, onViewDetails, onEdit, onDuplicate, onCancel, onDelete }) => {
  const desktopActions = (
    <BookingActionsMenu
      onViewDetails={() => onViewDetails?.(booking)}
      onEdit={() => onEdit?.(booking)}
      onDuplicate={() => onDuplicate?.(booking)}
      onCancel={() => onCancel?.(booking)}
      onDelete={() => onDelete?.(booking)}
    />
  );

  return (
    <>
      <tr className="booking-row booking-row--desktop">
        <td>
          <div className="booking-id-block">
            <div className="booking-id-block__id">{booking.id}</div>
            <div className="booking-id-block__sub">{booking.createdAt}</div>
          </div>
        </td>
        <td>
          <div className="booking-person">
            <div className="booking-avatar">{booking.sender.initials}</div>
            <div>
              <div className="booking-person__name">{booking.sender.name}</div>
              <div className="booking-person__sub">{booking.sender.city}</div>
            </div>
          </div>
        </td>
        <td>
          <div className="booking-person">
            <div className="booking-avatar booking-avatar--traveler">{booking.traveler.initials}</div>
            <div>
              <div className="booking-person__name">{booking.traveler.name}</div>
              <div className="booking-person__sub">{booking.traveler.city}</div>
            </div>
          </div>
        </td>
        <td>
          <div className="booking-route">
            <strong>{booking.route.from}</strong>
            <ArrowRight size={13} strokeWidth={2.3} />
            <strong>{booking.route.to}</strong>
          </div>
          <div className="booking-route__sub">{booking.route.fromAirport} • {booking.route.toAirport}</div>
        </td>
        <td>
          <div className="booking-package">
            <div className="booking-package__image">{booking.package.image}</div>
            <div>
              <div className="booking-package__name">{booking.package.name}</div>
              <div className="booking-package__sub">{booking.package.category}</div>
            </div>
          </div>
        </td>
        <td><span className="booking-metric">{booking.weight}</span></td>
        <td><span className="booking-metric booking-metric--reward">${booking.reward}</span></td>
        <td>
          <div className="booking-payment">
            <BookingStatusBadge label={booking.paymentStatus} kind="payment" />
            <div className="booking-payment__sub">{booking.escrow}</div>
          </div>
        </td>
        <td><BookingStatusBadge label={booking.status} /></td>
        <td><span className="booking-date">{booking.createdAt}</span></td>
        <td>
          <div className="booking-actions-cell">
            <button type="button" className="fly-btn fly-btn-secondary fly-btn-small" onClick={() => onViewDetails?.(booking)}>View Details</button>
            {desktopActions}
          </div>
        </td>
      </tr>

      <article className="booking-row booking-row--mobile fly-card">
        <div className="booking-row__mobile-head">
          <div>
            <div className="booking-id-block__id">{booking.id}</div>
            <div className="booking-id-block__sub">{booking.createdAt}</div>
          </div>
          <BookingStatusBadge label={booking.status} />
        </div>

        <div className="booking-row__mobile-grid">
          <div className="booking-person">
            <div className="booking-avatar">{booking.sender.initials}</div>
            <div>
              <div className="booking-person__name">{booking.sender.name}</div>
              <div className="booking-person__sub">Sender</div>
            </div>
          </div>
          <div className="booking-person">
            <div className="booking-avatar booking-avatar--traveler">{booking.traveler.initials}</div>
            <div>
              <div className="booking-person__name">{booking.traveler.name}</div>
              <div className="booking-person__sub">Traveler</div>
            </div>
          </div>
        </div>

        <div className="booking-row__mobile-route">
          <strong>{booking.route.from}</strong>
          <ArrowRight size={13} strokeWidth={2.3} />
          <strong>{booking.route.to}</strong>
        </div>

        <div className="booking-row__mobile-package">
          <div className="booking-package__image">{booking.package.image}</div>
          <div>
            <div className="booking-package__name">{booking.package.name}</div>
            <div className="booking-package__sub">{booking.package.category} • {booking.weight}</div>
          </div>
        </div>

        <div className="booking-row__mobile-stats">
          <div><span>Reward</span><strong>${booking.reward}</strong></div>
          <div><span>Payment</span><BookingStatusBadge label={booking.paymentStatus} kind="payment" /></div>
        </div>

        <div className="booking-row__mobile-actions">
          <button type="button" className="fly-btn fly-btn-primary fly-btn-full" onClick={() => onViewDetails?.(booking)}>View Details</button>
          {desktopActions}
        </div>
      </article>
    </>
  );
};

export default BookingRow;