import React from 'react';

interface Props {
  icon: React.ElementType;
  title: string;
  value: string;
  trend: string;
}

const ShipmentStatsCard: React.FC<Props> = ({ icon: Icon, title, value, trend }) => {
  return (
    <article className="fly-card shipment-stat-card">
      <div className="shipment-stat-card__icon"><Icon size={20} strokeWidth={2} /></div>
      <div className="shipment-stat-card__title">{title}</div>
      <div className="shipment-stat-card__value">{value}</div>
      <div className="shipment-stat-card__trend">{trend}</div>
    </article>
  );
};

export default ShipmentStatsCard;
