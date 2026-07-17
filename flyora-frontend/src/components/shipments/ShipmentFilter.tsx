import React from 'react';
import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import type { ShipmentFilters } from '../../hooks/useShipmentsView';

interface Props {
  filters: ShipmentFilters;
  onChange: <K extends keyof ShipmentFilters>(key: K, value: ShipmentFilters[K]) => void;
  onReset: () => void;
  onApply: () => void;
}

const ShipmentFilter: React.FC<Props> = ({ filters, onChange, onReset, onApply }) => {
  return (
    <section className="fly-card shipment-filter-card">
      <div className="shipment-filter-grid">
        <label className="shipment-filter shipment-filter--search">
          <span>Search Shipment</span>
          <div className="shipment-filter__field">
            <Search size={15} strokeWidth={2} />
            <input type="text" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Search by ID, tracking, name..." />
          </div>
        </label>

        <label className="shipment-filter">
          <span>Tracking ID</span>
          <input className="shipment-filter__input" type="text" value={filters.trackingNumber} onChange={(event) => onChange('trackingNumber', event.target.value)} placeholder="Enter Tracking ID" />
        </label>

        <label className="shipment-filter">
          <span>Package Type</span>
          <div className="shipment-filter__select">
            <input value={filters.packageType} onChange={(event) => onChange('packageType', event.target.value)} placeholder="All Types" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>

        <label className="shipment-filter">
          <span>Origin</span>
          <div className="shipment-filter__select">
            <input value={filters.origin} onChange={(event) => onChange('origin', event.target.value)} placeholder="All Origins" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>

        <label className="shipment-filter">
          <span>Destination</span>
          <div className="shipment-filter__select">
            <input value={filters.destination} onChange={(event) => onChange('destination', event.target.value)} placeholder="All Destinations" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>

        <label className="shipment-filter">
          <span>Shipment Status</span>
          <div className="shipment-filter__select">
            <input value={filters.shipmentStatus} onChange={(event) => onChange('shipmentStatus', event.target.value)} placeholder="All Status" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>

        <label className="shipment-filter">
          <span>Date Range</span>
          <div className="shipment-filter__range">
            <CalendarDays size={14} strokeWidth={2.1} />
            <input type="date" value={filters.dateStart} onChange={(event) => onChange('dateStart', event.target.value)} />
            <span>to</span>
            <input type="date" value={filters.dateEnd} onChange={(event) => onChange('dateEnd', event.target.value)} />
          </div>
        </label>

        <label className="shipment-filter">
          <span>Weight Range</span>
          <div className="shipment-filter__select">
            <input value={filters.weightRange} onChange={(event) => onChange('weightRange', event.target.value)} placeholder="All Weights" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>

        <label className="shipment-filter">
          <span>Sort By</span>
          <div className="shipment-filter__select">
            <input value={filters.sortBy} onChange={(event) => onChange('sortBy', event.target.value)} placeholder="Newest Pickup" />
            <ChevronDown size={14} strokeWidth={2.1} />
          </div>
        </label>

        <div className="shipment-filter-actions">
          <button type="button" className="fly-btn fly-btn-secondary" onClick={onReset}>Reset Filters</button>
          <button type="button" className="fly-btn fly-btn-primary" onClick={onApply}>Apply Filters</button>
        </div>
      </div>
    </section>
  );
};

export default ShipmentFilter;
