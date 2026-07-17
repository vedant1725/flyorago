import React from 'react';
import { CircleCheckBig, Clock3, PackageCheck, PlaneLanding, PlaneTakeoff, ShieldCheck, Truck } from 'lucide-react';
import type { ShipmentRecord } from '../../types/shipments';

interface Props {
  shipment: ShipmentRecord;
}

const timelineStages = [
  { label: 'Pickup Completed', icon: PackageCheck, offsetHours: 0, location: 'Sender Address' },
  { label: 'Airport Check-in', icon: PlaneTakeoff, offsetHours: 4, location: 'Origin Airport' },
  { label: 'In Transit', icon: Truck, offsetHours: 18, location: 'International Airspace' },
  { label: 'Customs', icon: ShieldCheck, offsetHours: 42, location: 'Destination Customs' },
  { label: 'Out For Delivery', icon: PlaneLanding, offsetHours: 68, location: 'Local Dispatch Hub' },
  { label: 'Delivered', icon: CircleCheckBig, offsetHours: 92, location: 'Recipient Address' },
];

const formatTimelineMoment = (pickupDate: string, offsetHours: number) => {
  const reference = new Date(`${pickupDate} 08:00 AM`);
  reference.setHours(reference.getHours() + offsetHours);
  const date = reference.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const time = reference.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
};

const ShipmentTimeline: React.FC<Props> = ({ shipment }) => {
  const currentIndex = shipment.progress >= 90 ? 5 : shipment.progress >= 68 ? 4 : shipment.progress >= 42 ? 3 : shipment.progress >= 22 ? 2 : shipment.progress >= 8 ? 1 : 0;

  return (
    <div className="shipment-timeline">
      {timelineStages.map((stage, index) => {
        const Icon = stage.icon;
        const { date, time } = formatTimelineMoment(shipment.pickupDate, stage.offsetHours);
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={stage.label} className={`shipment-timeline__item ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}>
            <div className="shipment-timeline__icon">
              <Icon size={14} strokeWidth={2.2} />
            </div>
            <div className="shipment-timeline__body">
              <div className="shipment-timeline__top">
                <strong>{stage.label}</strong>
                <span>{date}</span>
              </div>
              <div className="shipment-timeline__meta">
                <span>{time}</span>
                <span>{isCurrent ? 'Current' : isDone ? 'Completed' : 'Upcoming'}</span>
                <span>{stage.location}</span>
              </div>
            </div>
            <div className="shipment-timeline__spacer" />
          </div>
        );
      })}
    </div>
  );
};

export default ShipmentTimeline;
