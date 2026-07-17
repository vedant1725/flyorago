import React from 'react';
import { CircleCheckBig, ShieldCheck, PackageCheck, PlaneTakeoff, PlaneLanding, Truck } from 'lucide-react';
import type { ShipmentStatus } from '../../types/shipments';

interface Props {
  progress: number;
  status: ShipmentStatus;
}

const stages = [
  { label: 'Pickup Completed', icon: PackageCheck },
  { label: 'Airport Check-in', icon: PlaneTakeoff },
  { label: 'In Transit', icon: Truck },
  { label: 'Customs', icon: ShieldCheck },
  { label: 'Out For Delivery', icon: PlaneLanding },
  { label: 'Delivered', icon: CircleCheckBig },
];

const statusToIndex: Record<ShipmentStatus, number> = {
  Pending: 0,
  Pickup: 0,
  'In Transit': 2,
  Customs: 3,
  Delivered: 5,
  Returned: 5,
  Cancelled: 0,
};

const ShipmentProgress: React.FC<Props> = ({ progress, status }) => {
  const activeIndex = Math.min(stages.length - 1, Math.max(statusToIndex[status], Math.floor(progress / 20)));

  return (
    <div className="shipment-progress">
      <div className="shipment-progress__bar">
        <div className="shipment-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="shipment-progress__steps">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index <= activeIndex;
          const isCurrent = index === activeIndex;
          return (
            <div key={stage.label} className={`shipment-progress__step ${isActive ? 'is-active' : ''} ${isCurrent ? 'is-current' : ''}`}>
              <div className="shipment-progress__step-icon">
                <Icon size={12} strokeWidth={2.3} />
              </div>
              <span>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipmentProgress;
