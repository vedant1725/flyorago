import React from 'react';
import { CalendarDays, MapPinned, MessageSquare, ShieldCheck, X } from 'lucide-react';
import type { ShipmentRecord } from '../../types/shipments';
import ShipmentStatusBadge from './ShipmentStatusBadge';
import ShipmentTimeline from './ShipmentTimeline';

interface Props {
  shipment: ShipmentRecord | null;
  onClose: () => void;
}

const ShipmentDetailsDrawer: React.FC<Props> = ({ shipment, onClose }) => {
  if (!shipment) return null;

  return (
    <div className="shipment-drawer-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="shipment-drawer fly-card" role="dialog" aria-modal="true" aria-labelledby="shipment-details-title">
        <div className="shipment-drawer__head">
          <div>
            <div className="fly-card-title" id="shipment-details-title">Shipment Details</div>
            <p>{shipment.trackingNumber}</p>
          </div>
          <button type="button" className="shipment-drawer__close" onClick={onClose} aria-label="Close drawer"><X size={18} strokeWidth={2.3} /></button>
        </div>

        <div className="shipment-drawer__hero">
          <div className="shipment-drawer__thumbs">
            {shipment.packageImages.map((image, index) => (
              <div key={`${image}-${index}`} className="shipment-drawer__thumb">{image}</div>
            ))}
          </div>
          <div className="shipment-drawer__hero-copy">
            <div className="shipment-drawer__title-row">
              <div>
                <h3>{shipment.packageName}</h3>
                <p>{shipment.origin} → {shipment.destination}</p>
              </div>
              <ShipmentStatusBadge status={shipment.status} />
            </div>
            <div className="shipment-drawer__hero-metrics">
              <div><span>Reward</span><strong>${shipment.reward}</strong></div>
              <div><span>Escrow</span><strong>{shipment.escrow}</strong></div>
              <div><span>Insurance</span><strong>{shipment.insurance}</strong></div>
            </div>
          </div>
        </div>

        <div className="shipment-drawer__section">
          <div className="shipment-drawer__section-head"><CalendarDays size={14} /> Tracking Timeline</div>
          <ShipmentTimeline shipment={shipment} />
        </div>

        <div className="shipment-drawer__grid">
          <div>
            <span>Traveler Details</span>
            <strong>{shipment.travelerName}</strong>
          </div>
          <div>
            <span>Sender Details</span>
            <strong>{shipment.senderName}</strong>
          </div>
          <div>
            <span>Pickup Address</span>
            <strong>{shipment.pickupAddress}</strong>
          </div>
          <div>
            <span>Delivery Address</span>
            <strong>{shipment.deliveryAddress}</strong>
          </div>
          <div>
            <span>Flight Information</span>
            <strong>{shipment.flightNumber}</strong>
          </div>
          <div>
            <span>Current Location</span>
            <strong>{shipment.currentLocation}</strong>
          </div>
        </div>

        <div className="shipment-drawer__section shipment-drawer__notes">
          <div className="shipment-drawer__section-head"><ShieldCheck size={14} /> Package Details</div>
          <div className="shipment-drawer__notes-text">{shipment.notes}</div>
        </div>

        <div className="shipment-drawer__actions">
          <button type="button" className="fly-btn fly-btn-primary fly-btn-full">
            <MessageSquare size={15} strokeWidth={2.2} /> Chat Traveler
          </button>
          <button type="button" className="fly-btn fly-btn-secondary fly-btn-full">
            <MapPinned size={15} strokeWidth={2.2} /> Live Map
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ShipmentDetailsDrawer;
