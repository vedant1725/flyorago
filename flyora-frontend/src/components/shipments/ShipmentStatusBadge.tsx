import React from 'react';
import type { ShipmentStatus } from '../../types/shipments';

interface Props {
  status: ShipmentStatus;
}

const statusClassMap: Record<ShipmentStatus, string> = {
  Pending: 'is-pending',
  Pickup: 'is-pickup',
  'In Transit': 'is-transit',
  Customs: 'is-customs',
  Delivered: 'is-delivered',
  Returned: 'is-returned',
  Cancelled: 'is-cancelled',
};

const ShipmentStatusBadge: React.FC<Props> = ({ status }) => {
  return <span className={`shipment-badge ${statusClassMap[status]}`}>{status}</span>;
};

export default ShipmentStatusBadge;
