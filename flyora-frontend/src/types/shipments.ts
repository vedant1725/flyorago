export type ShipmentStatus = 'Pending' | 'In Transit' | 'Customs' | 'Delivered' | 'Cancelled';

export interface ShipmentRecord {
  id: string;
  trackingNumber: string;
  packageName: string;
  category: string;
  weight: string;
  dimensions: string;
  insurance: string;
  senderName: string;
  travelerName: string;
  packageImage: string;
  origin: string;
  destination: string;
  pickupAddress: string;
  deliveryAddress: string;
  flightNumber: string;
  pickupDate: string;
  eta: string;
  status: ShipmentStatus;
  progress: number;
  reward: number;
  escrow: string;
}
