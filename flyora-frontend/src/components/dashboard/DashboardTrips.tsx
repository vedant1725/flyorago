import React from 'react';
import {
  Plane, Calendar, PlusCircle, MapPin, Weight
} from 'lucide-react';
import Button from '../ui/Button';

interface Trip {
  id: string; userId: string; fullName: string; fromCity: string; toCity: string;
  travelDate: string; availableWeight: number; pricePerKg: number;
  description?: string; status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'; createdAt: string;
}

interface Props {
  trips: Trip[];
  onNewTrip: () => void;
}

const statusClass = (s: string) => {
  if (s === 'ACTIVE') return 'active';
  if (s === 'COMPLETED') return 'matched';
  return 'pending';
};

const DashboardTrips: React.FC<Props> = ({ trips, onNewTrip }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-black text-flyora-navy">Registered Flights</h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">Your upcoming flights with luggage capacity available for shipping.</p>
      </div>
      <Button variant="teal" size="sm" onClick={onNewTrip} icon={<PlusCircle size={14} />}>
        Register Trip
      </Button>
    </div>

    {trips.length === 0 ? (
      <div className="dash-empty">
        <Plane size={32} className="mx-auto mb-3 text-gray-300 transform -rotate-45" />
        <p className="text-xs font-bold mb-1">No flights registered</p>
        <p className="text-[10px] mb-4 max-w-xs mx-auto">Add your upcoming flights to start earning by carrying shipments.</p>
        <Button variant="teal" size="sm" onClick={onNewTrip}>Add First Trip</Button>
      </div>
    ) : (
      <div className="dash-content-card">
        {trips.map(trip => (
          <div key={trip.id} className="dash-list-row flex-col sm:flex-row items-start sm:items-center">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)' }}>
                <Plane size={18} className="text-flyora-teal transform -rotate-45" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-flyora-navy uppercase">{trip.fromCity}</span>
                  <span className="text-xs text-gray-300">→</span>
                  <span className="font-extrabold text-sm text-flyora-navy uppercase">{trip.toCity}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-bold">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(trip.travelDate).toLocaleDateString()}</span>
                  <span>{trip.availableWeight} kg capacity</span>
                  <span className="text-flyora-teal font-extrabold">${trip.pricePerKg}/kg</span>
                </div>
                {trip.description && <p className="text-[10px] text-gray-400 italic truncate">"{trip.description}"</p>}
              </div>
            </div>
            <span className={`dash-badge ${statusClass(trip.status)}`}>{trip.status}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DashboardTrips;
