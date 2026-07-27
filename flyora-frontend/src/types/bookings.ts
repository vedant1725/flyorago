export type BookingStatus = 'REQUEST_SENT' | 'Confirmed' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'PAYMENT_RELEASED' | 'REJECTED' | 'CANCELLED';
export type PaymentStatus = 'Pending Deposit' | 'Escrow Locked' | 'PAYMENT_RELEASED' | 'Refunded';

export interface BookingRecord {
  id: string;
  status: BookingStatus;
  createdAt: string;
  package: {
    name: string;
    category: string;
    image: string;
  };
  weight: string;
  sender: {
    name: string;
    city: string;
  };
  traveler: {
    name: string;
    city: string;
  };
  route: {
    from: string;
    fromAirport: string;
    to: string;
    toAirport: string;
  };
  reward: number;
  paymentStatus: PaymentStatus;
  escrow: string;
}
