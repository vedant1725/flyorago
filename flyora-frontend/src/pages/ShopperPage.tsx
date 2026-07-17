import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Plus, MapPin, Package, Clock, ShieldCheck, ChevronDown, Bell, Star } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../utils/api';
import './dashboard.css';

const ShopperPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const [activeTab, setActiveTab] = useState<'requests' | 'history'>('requests');
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would fetch shopper requests
    // For now, setting mock data to match the theme
    setRequests([
      {
        id: 'REQ-9102',
        item: 'MacBook Pro M3 Max',
        from: 'USA',
        to: 'Dubai, UAE',
        reward: 120,
        status: 'PENDING',
        date: '2026-07-20'
      },
      {
        id: 'REQ-9103',
        item: 'Dior Sauvage 100ml',
        from: 'Paris, France',
        to: 'Mumbai, India',
        reward: 25,
        status: 'MATCHED',
        date: '2026-07-25'
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Shopper" />

      <main className="flex-1 lg:ml-[240px] flex flex-col h-[calc(100vh-60px)] lg:h-screen overflow-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-[80px] bg-white border-b border-slate-100 items-center justify-between px-8 shrink-0">
          <div className="flex-1 flex items-center gap-4">
            <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-2.5 max-w-[400px] w-full focus-within:bg-white focus-within:border-flyora-teal focus-within:shadow-sm transition-all">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search requested items or locations..." className="bg-transparent border-0 outline-none w-full text-sm text-slate-800 placeholder:text-slate-400" />
            </label>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-50 transition">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold border border-teal-100">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">{userName}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">Shopper <ChevronDown size={10} /></span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FFFDFB]">
          <div className="max-w-6xl mx-auto">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopper <span className="text-flyora-teal">Hub</span></h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Request items from abroad or fulfill requests to earn rewards.</p>
              </div>
              <button className="bg-flyora-teal hover:bg-teal-600 text-white px-6 py-3 rounded-[12px] font-bold text-sm shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2">
                <Plus size={18} strokeWidth={2.5} />
                New Request
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-[16px] flex items-center justify-center shrink-0">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Requests</div>
                  <div className="text-2xl font-black text-slate-800">12</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-[16px] flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Completed</div>
                  <div className="text-2xl font-black text-slate-800">48</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-[16px] flex items-center justify-center shrink-0">
                  <Star size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shopper Rating</div>
                  <div className="text-2xl font-black text-slate-800 flex items-center gap-2">4.9 <span className="text-sm text-slate-400 font-semibold">/ 5.0</span></div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-slate-100 flex p-2">
                <button 
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-[12px] text-sm font-bold transition-all ${
                    activeTab === 'requests' ? 'bg-teal-50 text-flyora-teal' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  My Requests
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-[12px] text-sm font-bold transition-all ${
                    activeTab === 'history' ? 'bg-teal-50 text-flyora-teal' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  History
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'requests' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => (
                      <div key={req.id} className="border border-slate-200 rounded-[16px] p-5 hover:border-flyora-teal/50 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-slate-100 px-2.5 py-1 rounded-[8px] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {req.id}
                          </div>
                          <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-4 truncate" title={req.item}>{req.item}</h3>
                        
                        <div className="space-y-3 mb-6 relative">
                          <div className="absolute left-2.5 top-3 bottom-3 w-[2px] bg-slate-100"></div>
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shrink-0"></div>
                            <span className="text-xs font-semibold text-slate-600 truncate">{req.from}</span>
                          </div>
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-5 h-5 rounded-full bg-white border-2 border-flyora-teal flex items-center justify-center shrink-0">
                              <MapPin size={10} className="text-flyora-teal" />
                            </div>
                            <span className="text-xs font-semibold text-slate-900 truncate">{req.to}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                            <Clock size={14} /> {req.date}
                          </div>
                          <div className="font-black text-flyora-teal">
                            +${req.reward}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Empty State Card */}
                    <div className="border-2 border-dashed border-slate-200 rounded-[16px] p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-flyora-teal hover:bg-teal-50/30 transition-all min-h-[240px]">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <Plus size={24} />
                      </div>
                      <h4 className="font-bold text-slate-700">Add New Request</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Want an item from abroad? Create a request now.</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'history' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                      <ShoppingBag size={32} />
                    </div>
                    <h3 className="font-bold text-slate-700 mb-1">No History Yet</h3>
                    <p className="text-sm text-slate-500">Your completed shopper requests will appear here.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopperPage;
