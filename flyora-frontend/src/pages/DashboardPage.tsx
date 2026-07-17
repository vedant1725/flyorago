import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Plane, Package, ShoppingBag, Bell, ChevronDown } from 'lucide-react';
import { apiFetch } from '../utils/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const rawUserId = localStorage.getItem('flyora_user_id');
  const userId = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' ? rawUserId : null;
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      try {
        const tripsRes = await apiFetch('/api/trips/?user_only=true');
        if (tripsRes.data || tripsRes.results || Array.isArray(tripsRes)) {
          const tData = tripsRes.data || tripsRes.results || (Array.isArray(tripsRes) ? tripsRes : []);
          setTrips(tData.filter((t: any) => t.airline !== 'SENDER_REQUEST'));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId, navigate]);

  if (!userId) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row">
        <Sidebar activeItem="Dashboard" />
        <div className="flex-1 lg:ml-[240px] flex items-center justify-center h-[calc(100vh-60px)] lg:h-screen">
          <div className="w-8 h-8 border-4 border-flyora-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const activeTrip = trips.length > 0 ? trips[0] : null;
  const upcomingTrips = trips.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Dashboard" />
      
      <main className="flex-1 lg:ml-[240px] flex flex-col h-[calc(100vh-60px)] lg:h-screen overflow-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-[80px] bg-white border-b border-slate-100 items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-50 transition">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">{userName}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">Account Settings <ChevronDown size={10} /></span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          <h1 className="text-xl font-extrabold text-slate-800 mb-6">Overview</h1>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-flyora-teal flex items-center justify-center mb-3">
                  <Plane size={24} />
                </div>
                <div className="text-sm font-bold text-slate-700">Trips</div>
                <div className="text-[11px] font-semibold text-slate-500">{trips.length} Active | 0 Done</div>
              </div>
              <div className="text-5xl font-black text-slate-800">
                {trips.length.toString().padStart(2, '0')}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Package size={24} />
                </div>
                <div className="text-sm font-bold text-slate-700">Sender</div>
                <div className="text-[11px] font-semibold text-slate-500">1 Pending | 0 In transit</div>
              </div>
              <div className="text-5xl font-black text-slate-800">01</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <ShoppingBag size={24} />
                </div>
                <div className="text-sm font-bold text-slate-700">Shopper</div>
                <div className="text-[11px] font-semibold text-slate-500">0 Pending | 0 Delivered</div>
              </div>
              <div className="text-5xl font-black text-slate-800">00</div>
            </div>
          </div>

          {/* Active Trip */}
          <h2 className="text-lg font-bold text-slate-800 mb-4">Active Trip</h2>
          
          {activeTrip ? (
            <div className="bg-flyora-teal rounded-[24px] p-8 text-white mb-10 relative overflow-hidden shadow-xl shadow-teal-500/20">
              {/* Subtle background decoration */}
              <div className="absolute -right-20 -top-40 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="flex flex-col gap-6 relative">
                  <div className="absolute left-[5px] top-6 bottom-4 w-0.5 border-l-2 border-dashed border-white/30"></div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-white ring-4 ring-white/20 mt-1.5 z-10"></div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest text-white/70 mb-0.5">FROM</div>
                      <div className="text-2xl font-bold">{activeTrip.from_location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-white border-[3px] border-flyora-teal ring-2 ring-white mt-1.5 z-10"></div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest text-white/70 mb-0.5">TO</div>
                      <div className="text-2xl font-bold">{activeTrip.to_location}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white text-flyora-teal text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                  In 13 Days
                </div>
              </div>

              <div className="border-t border-white/20 pt-6 flex justify-between items-end relative z-10">
                <div>
                  <div className="text-[10px] font-black tracking-widest text-white/70 mb-1">CAPACITY</div>
                  <div className="text-lg font-bold">{activeTrip.available_weight}kg / {activeTrip.capacity_weight}kg</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black tracking-widest text-white/70 mb-1">EARN UP TO</div>
                  <div className="text-lg font-bold">${activeTrip.price_per_kg}/kg</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-[24px] p-10 flex flex-col items-center justify-center text-center shadow-sm mb-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Plane size={32} />
              </div>
              <h3 className="text-slate-700 font-bold mb-2">No Active Trips</h3>
              <p className="text-slate-500 text-sm mb-6">You don't have any active trips right now. Register a new trip to start earning.</p>
              <button onClick={() => navigate('/traveler')} className="px-6 py-2.5 bg-flyora-teal text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/20">
                Register Trip
              </button>
            </div>
          )}

          {/* Upcoming Trip */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Upcoming Trip</h2>
            <button className="text-xs font-black text-flyora-teal uppercase tracking-widest hover:text-teal-700">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip: any) => (
                <div key={trip.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Plane size={12} /> {trip.departure_date}
                    </div>
                    <div className="text-[11px] font-bold text-slate-700">{trip.available_weight}kg / {trip.capacity_weight}kg</div>
                  </div>
                  
                  <div className="flex flex-col gap-3 relative">
                    <div className="absolute left-[5px] top-2 bottom-2 w-px border-l-2 border-dashed border-slate-200"></div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-flyora-teal bg-white mt-1 z-10"></div>
                      <div>
                        <div className="text-[9px] font-black text-flyora-teal uppercase tracking-wider mb-0.5">From</div>
                        <div className="text-sm font-bold text-slate-800 leading-tight">{trip.from_location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-flyora-teal mt-1 z-10 flex items-center justify-center">
                         <div className="w-1 h-1 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-flyora-teal uppercase tracking-wider mb-0.5">To</div>
                        <div className="text-sm font-bold text-slate-800 leading-tight">{trip.to_location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-sm text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                No upcoming trips scheduled.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
