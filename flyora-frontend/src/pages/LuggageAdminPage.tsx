import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  Luggage, ShieldAlert, CheckCircle2, XCircle, Search, RefreshCw,
  QrCode, Scale, DollarSign, FileText, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LuggageAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState<{
    listings: any[];
    bookings: any[];
    disputes: any[];
    verifications: any[];
  }>({
    listings: [],
    bookings: [],
    disputes: [],
    verifications: []
  });
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/luggage/admin/');
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load luggage admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Luggage className="text-flyora-teal" size={24} /> Admin Portal: Luggage Sharing
              </h1>
              <p className="text-xs text-slate-400">Manage listings, live sharings, QR logs, disputes & escrow payouts</p>
            </div>
          </div>

          <button
            onClick={loadAdminData}
            className="px-4 py-2 rounded-xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>

        {/* Listings Section */}
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-black text-white">All Published Luggage Listings ({data.listings.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Airline & Flight</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Available Wt</th>
                  <th className="p-3">Price / KG</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.listings.map(l => (
                  <tr key={l.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold">#{l.id}</td>
                    <td className="p-3 font-bold">{l.airline} ({l.flight_number})</td>
                    <td className="p-3">{l.departure_airport} → {l.arrival_airport}</td>
                    <td className="p-3 text-teal-400 font-bold">{l.available_weight} KG</td>
                    <td className="p-3 text-emerald-400 font-bold">${l.price_per_kg}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20">{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Sharings & Escrow */}
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-black text-white">Live Bookings & Escrow Status ({data.bookings.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Booked Wt</th>
                  <th className="p-3">Total Escrow</th>
                  <th className="p-3">QR Token</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Escrow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold">#{b.id}</td>
                    <td className="p-3 font-bold">{b.booked_weight} KG</td>
                    <td className="p-3 text-emerald-400 font-bold">${b.total_price}</td>
                    <td className="p-3 font-mono text-slate-300">{b.qr_code_token}</td>
                    <td className="p-3 font-bold text-teal-400">{b.status}</td>
                    <td className="p-3 font-bold text-purple-400">{b.escrow_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disputes Portal */}
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={20} /> Open Dispute Cases ({data.disputes.length})
          </h2>
          {data.disputes.length === 0 ? (
            <p className="text-xs text-slate-400">No active dispute cases opened.</p>
          ) : (
            <div className="space-y-3">
              {data.disputes.map(d => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-rose-400">Dispute #{d.id} - Reason: {d.reason}</span>
                    <p className="text-xs text-slate-300 mt-1">{d.description}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">{d.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuggageAdminPage;
