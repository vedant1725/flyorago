import React from 'react';
import { BarChart3, ChevronDown, Package, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import QuickActions from './QuickActions';

const BookingAnalytics: React.FC = () => {
  return (
    <section className="bookings-analytics fly-grid">
      <article className="fly-card bookings-chart-card">
        <div className="fly-section-head bookings-chart-card__head">
          <div>
            <div className="fly-card-title">Bookings Per Month</div>
          </div>
          <button type="button" className="fly-pill-button">This Month <ChevronDown size={13} strokeWidth={2.2} /></button>
        </div>
        <div className="bookings-chart">
          <div className="bookings-chart__axis">
            <span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
          </div>
          <svg viewBox="0 0 100 54" className="bookings-chart__svg" aria-hidden="true">
            <defs>
              <linearGradient id="bookings-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18B6A4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#18B6A4" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <polyline className="bookings-chart__line" points="0,43 10,40 20,36 30,30 40,24 50,28 60,18 70,22 80,14 90,12 100,8" />
            <polygon fill="url(#bookings-chart-fill)" points="0,54 0,43 10,40 20,36 30,30 40,24 50,28 60,18 70,22 80,14 90,12 100,8 100,54" />
          </svg>
          <div className="bookings-chart__labels">
            <span>01 May</span><span>07 May</span><span>13 May</span><span>19 May</span><span>25 May</span><span>31 May</span>
          </div>
        </div>
      </article>

      <div className="bookings-analytics__stats fly-stat-grid">
        <article className="fly-card bookings-mini-stat">
          <div className="bookings-mini-stat__title">Revenue Earned</div>
          <div className="bookings-mini-stat__value">$62.45K</div>
          <div className="bookings-mini-stat__trend">+48%</div>
        </article>
        <article className="fly-card bookings-mini-stat">
          <div className="bookings-mini-stat__title">Total Bookings</div>
          <div className="bookings-mini-stat__value">227</div>
          <div className="bookings-mini-stat__trend">+16%</div>
        </article>
        <article className="fly-card bookings-mini-stat">
          <div className="bookings-mini-stat__title">Success Rate</div>
          <div className="bookings-mini-stat__value">98%</div>
          <div className="bookings-mini-stat__trend">+3%</div>
        </article>
        <article className="fly-card bookings-mini-stat">
          <div className="bookings-mini-stat__title">Completed Deliveries</div>
          <div className="bookings-mini-stat__value">156</div>
          <div className="bookings-mini-stat__trend">+20%</div>
        </article>
      </div>

      <article className="fly-card bookings-status-card">
        <div className="fly-card-title">Booking Status Distribution</div>
        <div className="bookings-status-ring">
          <div className="bookings-status-ring__core">
            <strong>227</strong>
            <span>Total</span>
          </div>
        </div>
        <div className="bookings-status-legend">
          <span><i className="dot dot--pending" /> Pending 18%</span>
          <span><i className="dot dot--confirmed" /> Confirmed 42%</span>
          <span><i className="dot dot--transit" /> In Transit 17%</span>
          <span><i className="dot dot--delivered" /> Delivered 12%</span>
          <span><i className="dot dot--completed" /> Completed 11%</span>
        </div>
      </article>

      <article className="fly-card bookings-quick-actions-card">
        <div className="fly-card-title">Quick Actions</div>
        <QuickActions />
      </article>
    </section>
  );
};

export default BookingAnalytics;