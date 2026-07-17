import React from 'react';
import { ArrowRight, MapPin, Navigation2, Route, Waypoints } from 'lucide-react';
import type { ShipmentRecord } from '../../types/shipments';
import ShipmentActionMenu from './ShipmentActionMenu';
import ShipmentProgress from './ShipmentProgress';
import ShipmentStatusBadge from './ShipmentStatusBadge';

interface Props {
  shipment: ShipmentRecord;
  onViewDetails: (shipment: ShipmentRecord) => void;
  onEdit: (shipment: ShipmentRecord) => void;
  onDuplicate: (shipment: ShipmentRecord) => void;
  onCancel: (shipment: ShipmentRecord) => void;
  onDelete: (shipment: ShipmentRecord) => void;
  onTrack: (shipment: ShipmentRecord) => void;
}

const ShipmentCard: React.FC<Props> = ({ shipment, onViewDetails, onEdit, onDuplicate, onCancel, onDelete, onTrack }) => {
  return (
    <article className="fly-card shipment-card">
      <div className="shipment-card__left">
        <div className="shipment-card__thumb">
          <span>{shipment.packageImage}</span>
        </div>
        <div className="shipment-card__left-meta">
          <div className="shipment-card__tracking">{shipment.trackingNumber}</div>
          <div className="shipment-card__name">{shipment.packageName}</div>
          <div className="shipment-card__category">{shipment.category}</div>
          <div className="shipment-card__badges">
            <ShipmentStatusBadge status={shipment.status} />
            {shipment.tags.includes('Fragile') && <span className="shipment-chip shipment-chip--warning">Fragile</span>}
            {shipment.tags.includes('Priority') && <span className="shipment-chip shipment-chip--mint">Priority</span>}
          </div>
        </div>
      </div>

      <div className="shipment-card__center">
        <div className="shipment-card__route-head">
          <div>
            <div className="shipment-card__airport-code">{shipment.origin.slice(0, 3).toUpperCase()}</div>
            <div className="shipment-card__airport-copy">{shipment.origin}</div>
          </div>
          <div className="shipment-card__route-arrow">
            <ArrowRight size={16} strokeWidth={2.3} />
          </div>
          <div>
            <div className="shipment-card__airport-code">{shipment.destination.slice(0, 3).toUpperCase()}</div>
            <div className="shipment-card__airport-copy">{shipment.destination}</div>
          </div>
        </div>

        <div className="shipment-card__meta-grid">
          <div><span>Pickup Date</span><strong>{shipment.pickupDate}</strong></div>
          <div><span>Expected Delivery</span><strong>{shipment.expectedDelivery}</strong></div>
        </div>

        <div className="shipment-card__route-art" aria-hidden="true">
          <svg viewBox="0 0 360 120">
            <path d="M16 74 C80 34, 118 24, 166 46 S238 90, 302 54" />
            <circle cx="16" cy="74" r="4" />
            <circle cx="302" cy="54" r="4" />
            <g transform="translate(174 49) rotate(-14)">
              <Navigation2 size={16} strokeWidth={2.2} />
            </g>
          </svg>
        </div>

        <ShipmentProgress progress={shipment.progress} status={shipment.status} />

        <div className="shipment-card__details-grid">
          <div>
            <span>Current Location</span>
            <strong>{shipment.currentLocation}</strong>
          </div>
          <div>
            <span>Flight Number</span>
            <strong>{shipment.flightNumber}</strong>
          </div>
          <div>
            <span>Last Updated</span>
            <strong>{shipment.lastUpdated}</strong>
          </div>
          <div>
            <span>ETA</span>
            <strong>{shipment.eta}</strong>
          </div>
        </div>

        <div className="shipment-card__package-grid">
          <div><span>Weight</span><strong>{shipment.weight}</strong></div>
          <div><span>Dimensions</span><strong>{shipment.dimensions}</strong></div>
          <div><span>Reward</span><strong>${shipment.reward}</strong></div>
          <div><span>Insurance</span><strong>{shipment.insurance}</strong></div>
          <div><span>Escrow</span><strong>{shipment.escrow}</strong></div>
          <div><span>Status</span><strong>{shipment.status}</strong></div>
        </div>

        <div className="shipment-card__tags">
          {shipment.tags.map((tag) => (
            <span key={tag} className="shipment-tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="shipment-card__actions">
        <button type="button" className="fly-btn fly-btn-primary fly-btn-full" onClick={() => onTrack(shipment)}>Track Shipment</button>
        <button type="button" className="fly-btn fly-btn-secondary fly-btn-full" onClick={() => onViewDetails(shipment)}>View Details</button>
        <ShipmentActionMenu
          onViewDetails={() => onViewDetails(shipment)}
          onEdit={() => onEdit(shipment)}
          onDuplicate={() => onDuplicate(shipment)}
          onCancel={() => onCancel(shipment)}
          onDelete={() => onDelete(shipment)}
          onDownloadLabel={() => window.alert(`Download label for ${shipment.trackingNumber}`)}
        />
      </div>
    </article>
  );
};

export default ShipmentCard;
