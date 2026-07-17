import React from 'react';
import { ArrowRight, Cloud, Headphones, MapPin, Plane, SunMedium, Wallet } from 'lucide-react';

const deliveries = [
  { id: '#BKGA9281', route: 'DEL → DXB', eta: 'Today • 10:30 AM', status: 'Tomorrow' },
  { id: '#BKGA9280', route: 'BOM → LHR', eta: '25 May, 10:45 PM', status: '2 Days' },
  { id: '#BKGA9279', route: 'DXB → DEL', eta: '26 May, 08:20 AM', status: '3 Days' },
];

const BookingSidebar: React.FC = () => {
  return (
    <aside className="fly-utility-panel bookings-utility-panel">
      <article className="fly-card fly-utility-card bookings-widget">
        <div className="fly-card-title">Today's Booking Summary</div>
        <div className="bookings-summary-list">
          <div><span>New Requests</span><strong>08</strong></div>
          <div><span>Confirmed</span><strong>12</strong></div>
          <div><span>In Transit</span><strong>06</strong></div>
          <div><span>Delivered</span><strong>05</strong></div>
        </div>
        <button type="button" className="fly-link-button fly-link-inline">View All Bookings <ArrowRight size={13} strokeWidth={2.3} /></button>
      </article>

      <article className="fly-card fly-utility-card bookings-widget">
        <div className="fly-card-title">Upcoming Deliveries</div>
        <div className="bookings-deliveries">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bookings-delivery-row">
              <div className="bookings-delivery-row__icon"><Plane size={14} strokeWidth={2} /></div>
              <div className="bookings-delivery-row__main">
                <strong>{delivery.id}</strong>
                <span>{delivery.route} • {delivery.eta}</span>
              </div>
              <span className="bookings-delivery-pill">{delivery.status}</span>
            </div>
          ))}
        </div>
        <button type="button" className="fly-link-button fly-link-inline">View All <ArrowRight size={13} strokeWidth={2.3} /></button>
      </article>

      <article className="fly-card fly-utility-card bookings-widget bookings-widget--wallet">
        <div className="fly-card-title">Wallet Summary</div>
        <div className="fly-summary-row"><span>Available Balance</span><strong>$1,250.00</strong></div>
        <div className="fly-summary-row"><span>Pending</span><strong>$180.00</strong></div>
        <div className="fly-summary-row"><span>Escrow</span><strong>$540.00</strong></div>
        <button type="button" className="fly-link-button fly-link-inline">Go to Wallet <ArrowRight size={13} strokeWidth={2.3} /></button>
      </article>

      <article className="fly-card fly-utility-card bookings-widget bookings-widget--stats">
        <div className="fly-card-title">Quick Statistics</div>
        <div className="bookings-quick-stats">
          <div><Wallet size={15} strokeWidth={2} /><span>Total Bookings</span><strong>227</strong></div>
          <div><Cloud size={15} strokeWidth={2} /><span>Success Rate</span><strong>98%</strong></div>
          <div><SunMedium size={15} strokeWidth={2} /><span>Avg. Reward</span><strong>$62.45</strong></div>
          <div><MapPin size={15} strokeWidth={2} /><span>Routes Active</span><strong>156</strong></div>
        </div>
      </article>

      <article className="fly-card fly-utility-card bookings-widget bookings-widget--tips">
        <div className="fly-card-title">Travel Tips</div>
        <p>Pack smart and label your packages clearly for smooth delivery.</p>
        <div className="bookings-tip-art" aria-hidden="true">
          <Headphones size={28} strokeWidth={1.8} className="bookings-tip-icon" />
        </div>
        <button type="button" className="fly-link-button fly-link-inline">View More Tips <ArrowRight size={13} strokeWidth={2.3} /></button>
      </article>

      <article className="fly-card fly-utility-card bookings-widget bookings-widget--support">
        <div className="fly-card-title">Support</div>
        <p>Need help? Our support team is here for you 24/7.</p>
        <button type="button" className="fly-btn fly-btn-secondary fly-btn-full">
          <Headphones size={15} strokeWidth={2.2} />
          Contact Support
        </button>
      </article>
    </aside>
  );
};

export default BookingSidebar;