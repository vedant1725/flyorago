import React from 'react';
import { BarChart3, ChevronDown, PackageCheck, TrendingUp } from 'lucide-react';
import QuickActions from './QuickActions';

const ShipmentAnalytics: React.FC = () => {
  return (
    <section className="shipment-analytics fly-grid">
      <article className="fly-card shipment-chart-card">
        <div className="fly-section-head shipment-chart-card__head">
          <div>
            <div className="fly-card-title">Monthly Shipments</div>
          </div>
          <button type="button" className="fly-pill-button">This Month <ChevronDown size={13} strokeWidth={2.2} /></button>
        </div>
        <div className="shipment-chart">
          <svg viewBox="0 0 100 54" className="shipment-chart__svg" aria-hidden="true">
            <defs>
              <linearGradient id="shipment-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18B6A4" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#18B6A4" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polyline className="shipment-chart__line" points="0,45 10,41 20,36 30,32 40,28 50,24 60,20 70,18 80,14 90,12 100,8" />
            <polygon fill="url(#shipment-chart-fill)" points="0,54 0,45 10,41 20,36 30,32 40,28 50,24 60,20 70,18 80,14 90,12 100,8 100,54" />
          </svg>
          <div className="shipment-chart__labels">
            <span>01</span><span>05</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
          </div>
        </div>
      </article>

      <article className="fly-card shipment-chart-card shipment-chart-card--bars">
        <div className="fly-section-head shipment-chart-card__head">
          <div>
            <div className="fly-card-title">Delivered Packages</div>
          </div>
          <button type="button" className="fly-pill-button">This Month <ChevronDown size={13} strokeWidth={2.2} /></button>
        </div>
        <div className="shipment-bars" aria-hidden="true">
          {['12', '18', '22', '15', '25', '28', '17', '24', '30', '21', '14', '27'].map((value, index) => (
            <div key={`${value}-${index}`} className="shipment-bars__bar-wrap">
              <div className="shipment-bars__bar" style={{ height: `${Number(value) * 2}%` }} />
            </div>
          ))}
        </div>
      </article>

      <article className="fly-card shipment-status-card">
        <div className="fly-card-title">Shipment Status Distribution</div>
        <div className="shipment-donut">
          <div className="shipment-donut__core">
            <strong>217</strong>
            <span>Total</span>
          </div>
        </div>
        <div className="shipment-donut__legend">
          <span><i className="dot dot--transit" /> In Transit 18%</span>
          <span><i className="dot dot--pickup" /> Pickup 14%</span>
          <span><i className="dot dot--customs" /> Customs 12%</span>
          <span><i className="dot dot--delivered" /> Delivered 42%</span>
          <span><i className="dot dot--returned" /> Returned 4%</span>
          <span><i className="dot dot--cancelled" /> Cancelled 10%</span>
        </div>
      </article>

      <div className="shipment-analytics__stats fly-stat-grid">
        <article className="fly-card shipment-mini-stat">
          <div className="shipment-mini-stat__title">Key Statistics</div>
          <div className="shipment-mini-stat__value">98%</div>
          <div className="shipment-mini-stat__trend">Success Rate</div>
        </article>
        <article className="fly-card shipment-mini-stat">
          <div className="shipment-mini-stat__title">Average Reward</div>
          <div className="shipment-mini-stat__value">$62.45</div>
          <div className="shipment-mini-stat__trend">+18.6%</div>
        </article>
        <article className="fly-card shipment-mini-stat">
          <div className="shipment-mini-stat__title">Total Shipments</div>
          <div className="shipment-mini-stat__value">217</div>
          <div className="shipment-mini-stat__trend">+22%</div>
        </article>
        <article className="fly-card shipment-mini-stat">
          <div className="shipment-mini-stat__title">Delivered Packages</div>
          <div className="shipment-mini-stat__value">182</div>
          <div className="shipment-mini-stat__trend">+16%</div>
        </article>
      </div>

      <article className="fly-card shipment-quick-actions-card">
        <div className="fly-card-title">Quick Actions</div>
        <QuickActions />
      </article>

      <article className="fly-card shipment-quick-actions-card shipment-quick-actions-card--tips">
        <div className="fly-card-title">Travel Tips</div>
        <p>Pack smart, keep liquids restricted, and attach the label before airport check-in.</p>
      </article>
    </section>
  );
};

export default ShipmentAnalytics;
