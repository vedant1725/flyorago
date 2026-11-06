import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  Luggage, ShieldAlert, CheckCircle2, XCircle, Search, RefreshCw,
  QrCode, Scale, DollarSign, FileText, ArrowLeft, Ban, Trash2, Key, Check, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LuggageAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const toastCtx = useToast();
  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') toastCtx.success('Success', msg);
    else if (type === 'error') toastCtx.error('Error', msg);
    else toastCtx.info('Notification', msg);
  };

  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'active' | 'completed' | 'disputes' | 'payments' | 'verifications' | 'qr_logs' | 'otp_logs'>('listings');

  const [data, setData] = useState<{
    listings: any[];
    requests: any[];
    active_sharing: any[];
    completed_sharing: any[];
    disputes: any[];
    payments: any[];
    verifications: any[];
    qr_logs: any[];
    otp_logs: any[];
  }>({
    listings: [],
    requests: [],
    active_sharing: [],
    completed_sharing: [],
    disputes: [],
    payments: [],
    verifications: [],
    qr_logs: [],
    otp_logs: []
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
    if (localStorage.getItem('flyora_admin_authenticated') !== 'true') {
      navigate('/admin/login');
      return;
    }
    loadAdminData();
  }, []);

  const handleAdminAction = async (action: string, listingId: number) => {
    try {
      const res = await apiFetch('/api/luggage/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, listing_id: listingId })
      });
      if (res.status === 'success') {
        notify(res.message, 'success');
        loadAdminData();
      } else {
        notify(res.message || 'Action failed', 'error');
      }
    } catch (e: any) {
      notify(e.message || 'Error executing admin action', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Luggage className="text-flyora-teal" size={24} /> Admin Portal: Luggage Sharing Management
              </h1>
              <p className="text-xs text-slate-400">Independent Luggage Sharing marketplace moderation and compliance logs</p>
            </div>
          </div>

          <button
            onClick={loadAdminData}
            className="px-4 py-2.5 rounded-2xl bg-flyora-teal text-white font-bold text-xs hover:bg-teal-600 transition flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Logs
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'listings', label: `Listings (${data.listings?.length || 0})` },
            { id: 'requests', label: `Requests (${data.requests?.length || 0})` },
            { id: 'active', label: `Active Sharing (${data.active_sharing?.length || 0})` },
            { id: 'completed', label: `Completed (${data.completed_sharing?.length || 0})` },
            { id: 'disputes', label: `Disputes (${data.disputes?.length || 0})` },
            { id: 'payments', label: `Payments & Escrow (${data.payments?.length || 0})` },
            { id: 'verifications', label: `Verifications (${data.verifications?.length || 0})` },
            { id: 'qr_logs', label: `QR Logs (${data.qr_logs?.length || 0})` },
            { id: 'otp_logs', label: `OTP Logs (${data.otp_logs?.length || 0})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-flyora-teal text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: LISTINGS */}
        {activeTab === 'listings' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">All Luggage Listings</h2>
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
                    <th className="p-3">Actions</th>
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
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20">{l.status}</span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <button
                          onClick={() => handleAdminAction('suspend', l.id)}
                          className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/40"
                          title="Suspend Listing"
                        >
                          <Ban size={14} />
                        </button>
                        <button
                          onClick={() => handleAdminAction('delete', l.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40"
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REQUESTS */}
        {activeTab === 'requests' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">Pending Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Total Price</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.requests.map(r => (
                    <tr key={r.id}>
                      <td className="p-3 font-bold">#{r.id}</td>
                      <td className="p-3 font-bold">{r.booked_weight} KG</td>
                      <td className="p-3 text-emerald-400 font-bold">${r.total_price}</td>
                      <td className="p-3 text-amber-400 font-bold">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE SHARING */}
        {activeTab === 'active' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">Active Sharing Sessions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Escrow Price</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.active_sharing.map(a => (
                    <tr key={a.id}>
                      <td className="p-3 font-bold">#{a.id}</td>
                      <td className="p-3 font-bold">{a.booked_weight} KG</td>
                      <td className="p-3 text-emerald-400 font-bold">${a.total_price}</td>
                      <td className="p-3 text-teal-400 font-bold">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: COMPLETED SHARING */}
        {activeTab === 'completed' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">Completed Sharing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Price Paid</th>
                    <th className="p-3">QR Token</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.completed_sharing.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold">#{c.id}</td>
                      <td className="p-3 font-bold">{c.booked_weight} KG</td>
                      <td className="p-3 text-emerald-400 font-bold">${c.total_price}</td>
                      <td className="p-3 font-mono text-slate-300">{c.qr_code_token}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DISPUTES */}
        {activeTab === 'disputes' && (
          <div className="bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldAlert className="text-rose-500" size={22} /> Luggage Disputes ({data.disputes.length})
                </h2>
                <p className="text-xs text-slate-400">Order conflict claims, item damage & escrow hold investigations</p>
              </div>
              <button
                onClick={() => navigate('/admin/dashboard?tab=disputes')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold text-xs flex items-center gap-2 transition-colors border border-slate-700 self-start sm:self-auto"
              >
                Open Full Admin Dispute Portal →
              </button>
            </div>

            {data.disputes.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-1">
                <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
                <p className="text-xs font-bold text-slate-300">No active dispute cases opened</p>
                <p className="text-[11px] text-slate-500">All luggage sharing transactions are running smoothly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.disputes.map(d => (
                  <div key={d.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-rose-400">Dispute Case #{d.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-extrabold uppercase border border-rose-500/30">
                          {d.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        Reason: {d.reason}
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{d.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>Booking #{d.booking}</span>
                      <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 font-bold text-xs transition-colors"
                      >
                        Manage Dispute →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">Payments & Escrow Holds</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Total Escrow</th>
                    <th className="p-3">Insurance Fee</th>
                    <th className="p-3">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.payments.map(p => (
                    <tr key={p.id}>
                      <td className="p-3 font-bold">#{p.id}</td>
                      <td className="p-3 text-emerald-400 font-bold">${p.total_price}</td>
                      <td className="p-3 text-slate-300">${p.insurance_fee}</td>
                      <td className="p-3 text-purple-400 font-bold">{p.escrow_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">Luggage Verifications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Verified Weight</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.verifications.map(v => (
                    <tr key={v.id}>
                      <td className="p-3 font-bold">#{v.id}</td>
                      <td className="p-3 font-bold">{v.weight} KG</td>
                      <td className="p-3 text-emerald-400 font-bold">{v.is_approved ? 'APPROVED' : 'REJECTED'}</td>
                      <td className="p-3 text-slate-300">{v.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: QR LOGS */}
        {activeTab === 'qr_logs' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">QR Code Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">QR Token</th>
                    <th className="p-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.qr_logs.map(q => (
                    <tr key={q.id}>
                      <td className="p-3 font-bold">#{q.id}</td>
                      <td className="p-3 font-mono text-teal-300">{q.qr_token}</td>
                      <td className="p-3 font-bold text-emerald-400">{q.is_success ? 'SUCCESS' : 'FAILED'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: OTP LOGS */}
        {activeTab === 'otp_logs' && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">OTP Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Entered OTP</th>
                    <th className="p-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.otp_logs.map(o => (
                    <tr key={o.id}>
                      <td className="p-3 font-bold">#{o.id}</td>
                      <td className="p-3 font-mono text-amber-300">{o.otp_entered}</td>
                      <td className="p-3 font-bold text-emerald-400">{o.is_success ? 'SUCCESS' : 'FAILED'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LuggageAdminPage;
