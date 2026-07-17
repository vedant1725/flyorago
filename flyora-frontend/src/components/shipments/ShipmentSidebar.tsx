import React, { useEffect, useState } from 'react';
import { ArrowRight, Cloud, Headphones, MapPin, Package, Plane, SunMedium, Wallet } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

interface ShipmentSidebarProps {
  shipments: any[];
}

const ShipmentSidebar: React.FC<ShipmentSidebarProps> = ({ shipments }) => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<{
    available: number;
    pending: number;
    escrow: number;
  }>({ available: 0, pending: 0, escrow: 0 });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await apiFetch('/api/wallet/summary');
        if (res.status === 'success' && res.data) {
          setWallet({
            available: Number(res.data.balance_available || 0),
            pending: Number(res.data.balance_pending || 0),
            escrow: Number(res.data.balance_escrow || 0),
          });
        }
      } catch (err) {
        console.error('Failed to fetch wallet in ShipmentSidebar:', err);
      }
    };
    fetchWallet();
  }, []);

  // Filter real deliveries and pickups from shipments
  const activeDeliveries = shipments.filter(s => s.status === 'In Transit').slice(0, 3);
  const activePickups = shipments.filter(s => s.status === 'Package Received' || s.status === 'Pending').slice(0, 3);

  const total = shipments.length;
  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

  return (
    <aside className="fly-utility-panel shipment-sidebar-panel">
      <article className="fly-card fly-utility-card shipment-widget">
        <div className="fly-card-title">Today's Deliveries</div>
        <div className="shipment-widget__list">
          {activeDeliveries.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400/80 font-bold">No active deliveries today.</div>
          ) : (
            activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="shipment-widget__row">
                <div className="shipment-widget__icon"><Plane size={14} strokeWidth={2} /></div>
                <div className="shipment-widget__main">
                  <strong>#{delivery.trackingNumber || delivery.id}</strong>
                  <span>{delivery.origin} → {delivery.destination} • {delivery.expectedDelivery || 'TBD'}</span>
                </div>
                <span className="shipment-widget__pill">{delivery.status}</span>
              </div>
            ))
          )}
        </div>
        <button type="button" className="fly-link-button fly-link-inline" onClick={() => navigate('/shipments')}>View All Deliveries <ArrowRight size={13} strokeWidth={2.3} /></button>
      </article>

      <article className="fly-card fly-utility-card shipment-widget">
        <div className="fly-card-title">Upcoming Pickup</div>
        <div className="shipment-widget__list">
          {activePickups.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400/80 font-bold">No upcoming pickups.</div>
          ) : (
            activePickups.map((pickup) => (
              <div key={pickup.id} className="shipment-widget__row">
                <div className="shipment-widget__icon"><Package size={14} strokeWidth={2} /></div>
                <div className="shipment-widget__main">
                  <strong>#{pickup.trackingNumber || pickup.id}</strong>
                  <span>{pickup.origin} → {pickup.destination} • {pickup.pickupDate || 'TBD'}</span>
                </div>
                <span className="shipment-widget__pill shipment-widget__pill--mint">Pending</span>
              </div>
            ))
          )}
        </div>
        <button type="button" className="fly-link-button fly-link-inline" onClick={() => navigate('/shipments')}>View All Pickups <ArrowRight size={13} strokeWidth={2.3} /></button>
      </article>

      <article className="fly-card fly-utility-card shipment-widget shipment-widget--stats">
        <div className="fly-card-title">Shipment Statistics</div>
        <div className="shipment-side-stats">
          <div><Wallet size={15} strokeWidth={2} /><span>Total Shipments</span><strong>{total}</strong></div>
          <div><Cloud size={15} strokeWidth={2} /><span>In Transit</span><strong>{inTransit}</strong></div>
          <div><SunMedium size={15} strokeWidth={2} /><span>Delivered</span><strong>{delivered}</strong></div>
          <div><MapPin size={15} strokeWidth={2} /><span>Success Rate</span><strong>{successRate}%</strong></div>
        </div>
      </article>

      <article className="fly-card fly-utility-card shipment-widget">
        <div className="fly-card-title">Wallet Summary</div>
        <div className="fly-summary-row"><span>Available Balance</span><strong>${wallet.available.toFixed(2)}</strong></div>
        <div className="fly-summary-row"><span>Pending</span><strong>${wallet.pending.toFixed(2)}</strong></div>
        <div className="fly-summary-row"><span>Escrow</span><strong>${wallet.escrow.toFixed(2)}</strong></div>
        <button type="button" className="fly-link-button fly-link-inline" onClick={() => navigate('/wallet')}>Go to Wallet <ArrowRight size={13} strokeWidth={2.3} /></button>
      </article>

      <article className="fly-card fly-utility-card shipment-widget">
        <div className="fly-card-title">Support</div>
        <p>Need help? Our support team is here for you 24/7.</p>
        <button type="button" className="fly-btn fly-btn-secondary fly-btn-full" onClick={() => navigate('/support')}>
          <Headphones size={15} strokeWidth={2.2} />
          Contact Support
        </button>
      </article>

      <article className="fly-card fly-utility-card shipment-widget shipment-widget--tips">
        <div className="fly-card-title">Travel Tips</div>
        <p>Keep labels visible and pack liquids separately to avoid customs delays.</p>
        <button type="button" className="fly-link-button fly-link-inline" onClick={() => navigate('/support')}>View More Tips <ArrowRight size={13} strokeWidth={2.3} /></button>
      </article>
    </aside>
  );
};

export default ShipmentSidebar;
