import React from 'react';
import { ArrowRightLeft, Plane, List } from 'lucide-react';
import Button from '../ui/Button';

interface Props {
  overview: any;
}

const DashboardMatches: React.FC<Props> = ({ overview }) => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-xl font-black text-flyora-navy">Smart Matchmaking</h1>
      <p className="text-xs text-gray-400 mt-1 font-medium">AI-powered matching of traveler capacity with shipment requests.</p>
    </div>

    {overview.matches.totalMatchesCount === 0 ? (
      <div className="dash-empty">
        <ArrowRightLeft size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-xs font-bold mb-1">No matches available</p>
        <p className="text-[10px] max-w-sm mx-auto leading-relaxed">
          Register trips or post shipments on similar routes to find matches.
        </p>
      </div>
    ) : (
      <div className="space-y-8">
        {overview.matches.travelMatches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plane size={14} className="text-flyora-teal transform -rotate-45" />
              <h3 className="text-xs font-black text-flyora-teal uppercase tracking-wider">Senders Requesting Your Capacity</h3>
            </div>
            <div className="space-y-3">
              {overview.matches.travelMatches.map((match: any, idx: number) => (
                <div key={idx} className="dash-match-card traveler flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <span className="text-[9px] font-black uppercase text-flyora-teal bg-teal-50 px-2 py-0.5 rounded-full inline-block">
                      Flight: {match.tripDetails}
                    </span>
                    <h4 className="font-extrabold text-sm text-flyora-navy">{match.shipment?.title}</h4>
                    <p className="text-xs text-gray-500 font-semibold italic">"{match.shipment?.description}"</p>
                    <div className="flex flex-wrap gap-3 text-[10px] text-gray-400 font-bold">
                      <span>Sender: {match.shipment?.fullName}</span>
                      <span>Weight: {match.shipment?.weight}kg</span>
                      <span className="text-flyora-teal font-extrabold">Reward: ${match.shipment?.pricePaid}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <Button variant="teal" size="sm"
                      onClick={() => alert(`Connection request sent to ${match.shipment?.fullName}. Flyora Escrow will lock $${match.shipment?.pricePaid}.`)}>
                      Accept Request
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {overview.matches.shipmentMatches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <List size={14} className="text-blue-600" />
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-wider">Travelers on Your Route</h3>
            </div>
            <div className="space-y-3">
              {overview.matches.shipmentMatches.map((match: any, idx: number) => (
                <div key={idx} className="dash-match-card sender flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                      Parcel: {match.shipmentDetails}
                    </span>
                    <h4 className="font-extrabold text-sm text-flyora-navy uppercase">
                      {match.trip?.fromCity} → {match.trip?.toCity}
                    </h4>
                    <div className="flex flex-wrap gap-3 text-[10px] text-gray-400 font-bold">
                      <span>Traveler: {match.trip?.fullName}</span>
                      <span>Date: {match.trip?.travelDate ? new Date(match.trip.travelDate).toLocaleDateString() : ''}</span>
                      <span>Capacity: {match.trip?.availableWeight}kg</span>
                      <span className="text-blue-600 font-extrabold">Rate: ${match.trip?.pricePerKg}/kg</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <Button variant="secondary" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50/50"
                      onClick={() => alert(`Booking request sent to ${match.trip?.fullName}.`)}>
                      Book Capacity
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

export default DashboardMatches;
