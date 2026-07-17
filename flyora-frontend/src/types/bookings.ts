export type BookingStatus = 'Pending' | 'Confirmed' | 'Accepted' | 'In Transit' | 'Delivered' | 'Completed' | 'Rejected' | 'Cancelled';
export type PaymentStatus = 'Pending Deposit' | 'Escrow Locked' | 'Released' | 'Refunded';

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
