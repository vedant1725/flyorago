import React from 'react';

interface Props {
  icon: React.ElementType;
  title: string;
  value: string;
  trend: string;
}

const BookingStatsCard: React.FC<Props> = ({ icon: Icon, title, value, trend }) => {
  return (
    <article className="fly-card bookings-stat-card fly-stat-card">
      <div className="bookings-stat-card__icon"><Icon size={20} strokeWidth={2} /></div>
      <div className="bookings-stat-card__title">{title}</div>
      <div className="bookings-stat-card__value">{value}</div>
      <div className="bookings-stat-card__trend">{trend}</div>
    </article>
  );
};

export default BookingStatsCard;