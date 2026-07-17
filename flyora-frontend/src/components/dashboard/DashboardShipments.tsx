import React from 'react';
import { List, Calendar, PlusCircle } from 'lucide-react';
import Button from '../ui/Button';

interface Shipment {
  id: string; userId: string; fullName: string; title: string; fromCity: string; toCity: string;
  deliveryDeadline: string; weight: number; pricePaid: number;
  category: 'documents' | 'electronics' | 'clothing' | 'food' | 'other';
  description: string; status: 'PENDING' | 'MATCHED' | 'DELIVERED' | 'CANCELLED'; createdAt: string;
}

interface Props {
  shipments: Shipment[];
  onNewShipment: () => void;
  onReleasePayout: (amount: number, detail: string) => void;
}

const statusClass = (s: string) => {
  if (s === 'MATCHED' || s === 'DELIVERED') return 'matched';
  if (s === 'PENDING') return 'pending';
  return 'active';
};

const categoryColors: Record<string, string> = {
  documents: '#6366f1', electronics: '#f59e0b', clothing: '#ec4899', food: '#22c55e', other: '#8b5cf6'
};

const DashboardShipments: React.FC<Props> = ({ shipments, onNewShipment, onReleasePayout }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-black text-flyora-navy">Shipment Requests</h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">Post parcels for delivery. Rewards are secured in Flyora Escrow.</p>
      </div>
      <Button variant="teal" size="sm" onClick={onNewShipment} icon={<PlusCircle size={14} />}>
        Post Request
      </Button>
    </div>

    {shipments.length === 0 ? (
      <div className="dash-empty">
        <List size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-xs font-bold mb-1">No shipments posted</p>
        <p className="text-[10px] mb-4 max-w-xs mx-auto">Post your first parcel request and let travelers carry it.</p>
        <Button variant="teal" size="sm" onClick={onNewShipment}>Post First Request</Button>
      </div>
    ) : (
      <div className="dash-content-card">
        {shipments.map(ship => (
          <div key={ship.id} className="dash-list-row flex-col sm:flex-row items-start sm:items-center">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${categoryColors[ship.category]}12`, border: `1px solid ${categoryColors[ship.category]}25` }}>
                <List size={18} style={{ color: categoryColors[ship.category] }} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-flyora-navy">{ship.title}</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                  <span className="uppercase">{ship.fromCity}</span>
                  <span className="text-gray-300 text-[10px]">→</span>
                  <span className="uppercase">{ship.toCity}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-bold">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(ship.deliveryDeadline).toLocaleDateString()}</span>
                  <span>{ship.weight} kg</span>
                  <span className="capitalize" style={{ color: categoryColors[ship.category] }}>{ship.category}</span>
                  <span className="text-flyora-teal font-extrabold">Reward: ${ship.pricePaid}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className={`dash-badge ${statusClass(ship.status)}`}>{ship.status}</span>
              {ship.status === 'PENDING' && (
                <button onClick={() => onReleasePayout(ship.pricePaid, ship.title)}
                  className="text-[10px] font-bold text-flyora-teal border border-flyora-teal/20 hover:bg-flyora-teal/5 px-2.5 py-1 rounded-lg transition-all">
                  Release Escrow
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DashboardShipments;
