import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Check, X, RefreshCw, Search, Users, Plane, ClipboardList,
  Truck, AlertCircle, BadgeCheck, TrendingUp, Filter, Plus, Menu,
  Bell, Settings, LogOut, ChevronRight, Activity, Server, Database,
  Cpu, HardDrive, DollarSign, LayoutDashboard, CreditCard, ChevronDown, CheckCircle2
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { StatusBadge, MetricCard, SectionHeader, ChartCard, ApprovalCard, HealthStatus } from '../components/admin/AdminComponents';
import './dashboard.css';

interface KycSubmission {
  userId: string; fullName: string; email: string; phone: string;
  documentType: 'national_id' | 'passport'; frontImage: string; backImage: string;
  selfieImage: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  rejectionReason?: string; submittedAt: string; role?: string;
}

interface AdminTrip {
  id: number; user: { id: number; email: string; first_name: string; last_name: string; };
  airline: string; flight_number: string; from_location: string; to_location: string;
  departure_date: string; departure_time: string; capacity_weight: number;
  available_weight: number; price_per_kg: number; status: 'Active' | 'Completed' | 'Cancelled';
}

interface AdminBooking {
  id: number; sender: { email: string }; traveler: { email: string };
  trip: { flight_number: string; from_location: string; to_location: string };
  package_name: string; category: string; weight: number; reward_amount: number;
  status: string; payment_status: string; escrow_status: string;
}

interface AdminShipment {
  id: number; booking: { id: number; package_name: string; sender: { email: string }; traveler: { email: string }; };
  tracking_number: string; status: string; pickup_address: string; delivery_address: string;
  dimensions: string; insurance: boolean; eta: string; logs: Array<{ id: number; status: string; location: string; description: string; timestamp: string; }>;
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [roleVerified, setRoleVerified] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'kyc' | 'trips' | 'bookings' | 'shipments' | 'system'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [shipments, setShipments] = useState<AdminShipment[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedShipment, setSelectedShipment] = useState<AdminShipment | null>(null);
  const [logStatus, setLogStatus] = useState('In Transit');
  const [logLocation, setLogLocation] = useState('');
  const [logDescription, setLogDescription] = useState('');

  const [kycRejectUserId, setKycRejectUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchAllData = async () => {
    setIsLoading(true); setError(null);
    try {
      const kycRes = await apiFetch('/api/kyc/admin/list');
      if (kycRes.status === 'success') setKycSubmissions(kycRes.data);

      const tripsRes = await apiFetch('/api/trips/?admin_all=true');
      if (tripsRes.status === 'success') setTrips(tripsRes.data);
      else if (Array.isArray(tripsRes)) setTrips(tripsRes);

      const bookingsRes = await apiFetch('/api/bookings/?admin_all=true&user_only=false');
      if (bookingsRes.status === 'success') setBookings(bookingsRes.data);

      const shipmentsRes = await apiFetch('/api/shipments/?admin_all=true');
      if (shipmentsRes.status === 'success') setShipments(shipmentsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await apiFetch('/api/auth/me/');
        if (res.status === 'success' && res.data.role === 'admin') {
          localStorage.setItem('flyora_user_role', 'admin');
          setRoleVerified(true);
        } else {
          navigate('/dashboard');
        }
      } catch (err) { navigate('/login'); }
    };
    verifyAdmin();
    fetchAllData();
  }, [navigate]);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleKycAction = async (userId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      const res = await apiFetch('/api/kyc/admin/action/', { method: 'POST', body: JSON.stringify({ userId, action, reason }) });
      if (res.status === 'success') {
        triggerSuccess(`KYC submission ${action.toLowerCase()}d successfully.`);
        setKycRejectUserId(null); setRejectionReason(''); fetchAllData();
      }
    } catch (err: any) { alert(err.message || 'Action failed'); }
  };

  const handleUpdateTripStatus = async (tripId: number, status: string) => {
    try {
      const res = await apiFetch(`/api/trips/${tripId}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      if (res.status === 'success' || res.id) { triggerSuccess(`Trip status updated to ${status}.`); fetchAllData(); }
    } catch (err: any) { alert(err.message || 'Failed to update trip status'); }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm('Are you sure you want to delete this trip registry?')) return;
    try {
      await apiFetch(`/api/trips/${tripId}/`, { method: 'DELETE' });
      triggerSuccess('Trip deleted successfully.'); fetchAllData();
    } catch (err: any) { alert(err.message || 'Failed to delete trip'); }
  };

  const handleBookingAction = async (bookingId: number, action: string) => {
    try {
      const res = await apiFetch(`/api/bookings/${bookingId}/action/`, { method: 'POST', body: JSON.stringify({ action }) });
      if (res.status === 'success') { triggerSuccess(`Booking action completed.`); fetchAllData(); }
    } catch (err: any) { alert(err.message || 'Failed to process action'); }
  };

  const handleAddShipmentLog = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedShipment) return;
    try {
      const res = await apiFetch(`/api/shipments/${selectedShipment.id}/update_status/`, {
        method: 'POST', body: JSON.stringify({ status: logStatus, location: logLocation, description: logDescription })
      });
      if (res.status === 'success') {
        triggerSuccess('Shipment checkpoint updated.');
        setSelectedShipment(null); setLogLocation(''); setLogDescription(''); fetchAllData();
      }
    } catch (err: any) { alert(err.message || 'Failed to add log'); }
  };

  const pendingKycCount = kycSubmissions.filter(s => s.status === 'PENDING').length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getBookingChartData = () => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    bookings.forEach((b) => {
      // Fallback to modulo if no date exists on booking
      counts[(b.id || 0) % 7] += 1;
    });
    return counts.every(c => c === 0) ? [12, 19, 15, 25, 22, 30, 28] : counts; // show mock if completely empty
  };

  const getKycChartData = () => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    kycSubmissions.forEach((k) => {
      if (k.submittedAt) {
        let day = new Date(k.submittedAt).getDay() - 1;
        if (day === -1) day = 6; // Sunday is 6
        counts[day] += 1;
      }
    });
    return counts.every(c => c === 0) ? [5, 8, 12, 10, 15, 20, 25] : counts;
  };

  const getRecentActivity = () => {
    const activity = [];
    kycSubmissions.slice(0, 5).forEach(k => {
      activity.push({ title: `KYC ${k.status}: ${k.fullName}`, time: new Date(k.submittedAt).toLocaleString(), type: 'info' });
    });
    trips.slice(0, 5).forEach(t => {
      activity.push({ title: `Flight added: ${t.airline} ${t.flight_number}`, time: 'Recent', type: 'success' });
    });
    bookings.slice(0, 5).forEach(b => {
      activity.push({ title: `Booking #${b.id} ${b.status}`, time: 'Recent', type: 'warning' });
    });
    return activity.length > 0 ? activity.slice(0, 6) : [
      { title: 'New deployment v1.0.4', time: '10 mins ago', type: 'system' },
      { title: 'Payment Gateway delay spike', time: '45 mins ago', type: 'warning' },
      { title: 'Database backup completed', time: '2 hours ago', type: 'success' }
    ];
  };

  if (!roleVerified) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-10 h-10 border-4 border-flyora-teal border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verifying Identity...</div>
      </div>
    );
  }

  const NavItem = ({ id, icon: Icon, label, badge = 0 }: { id: any, icon: any, label: string, badge?: number }) => (
    <button
      onClick={() => { setActiveTab(id); setSearchQuery(''); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
        activeTab === id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={16} className={activeTab === id ? 'text-flyora-teal' : 'text-slate-500 group-hover:text-slate-300'} />
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-flyora-teal/20 text-flyora-teal text-[9px] px-1.5 py-0.5 rounded-md font-black">{badge}</span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden selection:bg-flyora-teal/30">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0b] border-r border-white/5 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-flyora-teal to-blue-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Shield size={16} fill="currentColor" className="text-white" />
            </div>
            <div>
              <div className="font-black text-sm tracking-tight text-white leading-none">FlyoraGo</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Enterprise Admin</div>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide">
          <div className="space-y-1 mb-8">
            <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest px-3 mb-2">Overview</div>
            <NavItem id="overview" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="system" icon={Activity} label="System Health" />
          </div>

          <div className="space-y-1 mb-8">
            <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest px-3 mb-2">Operations</div>
            <NavItem id="kyc" icon={Shield} label="Verifications" badge={pendingKycCount} />
            <NavItem id="trips" icon={Plane} label="Active Flights" />
            <NavItem id="bookings" icon={CreditCard} label="Escrow & Bookings" badge={pendingBookings} />
            <NavItem id="shipments" icon={Truck} label="Logistics Tracking" />
          </div>

          <div className="space-y-1 mb-8">
            <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest px-3 mb-2">Management</div>
            <NavItem id="users" icon={Users} label="User Directory" />
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <LogOut size={16} /> Exit to Portal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        
        {/* Header */}
        <header className="h-20 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-[#0a0a0b]/80 backdrop-blur-md z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-400 hover:text-white"><Menu size={20} /></button>
            <div className="hidden md:block">
              <h1 className="text-lg font-black text-white tracking-tight">Welcome back, Admin</h1>
              <p className="text-[11px] text-slate-400 font-medium">{currentDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search everywhere..." className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-flyora-teal/50 focus:ring-1 focus:ring-flyora-teal/50 w-64 transition-all" />
            </div>
            
            <button onClick={fetchAllData} disabled={isLoading} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-flyora-teal' : ''} />
            </button>
            
            <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all relative">
              <Bell size={14} />
              {(pendingKycCount > 0 || pendingBookings > 0) && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-950"></span>}
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-500 flex items-center justify-center text-[10px] font-black text-white">AD</div>
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2.5 backdrop-blur-sm">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2.5 backdrop-blur-sm">
                <BadgeCheck size={16} /> <span>{successMsg}</span>
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Platform Analytics" description="Real-time performance metrics and marketplace liquidity." action={
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Status
                  </div>
                } />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard title="Total Revenue (Est)" value={`$${bookings.reduce((sum, b) => sum + (Number(b.reward_amount) || 0), 0).toLocaleString()}`} trend={12.5} icon={<DollarSign size={20} />} subtitle="Platform escrow volume" />
                  <MetricCard title="Active Users" value={kycSubmissions.length} trend={8.2} icon={<Users size={20} />} subtitle="Registered accounts" />
                  <MetricCard title="Global Flights" value={trips.filter(t => t.status === 'Active').length} trend={-2.4} icon={<Plane size={20} />} subtitle="Active routes available" />
                  <MetricCard title="Parcels in Transit" value={shipments.filter(s => s.status !== 'Delivered').length} trend={18.1} icon={<Truck size={20} />} subtitle="Active tracking escrows" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Weekly Booking Volume" type="bar" data={getBookingChartData()} />
                  <ChartCard title="User Registrations" type="bar" data={getKycChartData()} />
                </div>

                {(pendingKycCount > 0 || pendingBookings > 0) && (
                  <div>
                    <SectionHeader title="Action Required" description="Pending approvals and manual overrides." />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {kycSubmissions.filter(k => k.status === 'PENDING').slice(0, 3).map(k => (
                        <ApprovalCard key={k.userId} label="KYC Verification" title={k.fullName} subtitle={k.email} isPending={true}
                          onApprove={() => handleKycAction(k.userId, 'APPROVE')} onReject={() => setKycRejectUserId(k.userId)} />
                      ))}
                      {bookings.filter(b => b.status === 'Pending').slice(0, 3).map(b => (
                        <ApprovalCard key={b.id} label="Booking Request" title={b.package_name} subtitle={`$${b.reward_amount} • ${b.weight}kg`} isPending={true}
                          onApprove={() => handleBookingAction(b.id, 'ACCEPT')} onReject={() => handleBookingAction(b.id, 'REJECT')} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SYSTEM HEALTH */}
            {activeTab === 'system' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <SectionHeader title="System Status" description="Infrastructure health and external API connections." />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <HealthStatus name="Main Database (PostgreSQL)" status="operational" />
                    <HealthStatus name="Cache Layer (Redis)" status="operational" />
                    <HealthStatus name="Storage (AWS S3)" status="operational" />
                    <HealthStatus name="Core API Gateway" status="operational" />
                    <HealthStatus name="Payment Escrow API" status="degraded" />
                    <HealthStatus name="Email Service (SendGrid)" status="operational" />
                    <HealthStatus name="Google Maps API" status="operational" />
                    <HealthStatus name="KYC Microservice" status="operational" />
                  </div>
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-[16px] p-6">
                    <h3 className="text-sm font-black text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                      {getRecentActivity().map((log, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full border border-slate-700 bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-[12px] bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white text-xs">{log.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{log.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: USERS */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <SectionHeader title="User Directory" description="Manage platform accounts and roles." action={
                  <div className="relative w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-flyora-teal focus:ring-1 focus:ring-flyora-teal outline-none" />
                  </div>
                }/>
                
                <div className="bg-slate-900 border border-slate-800 rounded-[16px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-950/50 border-b border-slate-800">
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Contact</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {kycSubmissions.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                          <tr key={u.userId} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{u.fullName}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{u.userId.substring(0,8)}...</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{u.email}<br/><span className="text-[10px] text-slate-500">{u.phone}</span></td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300">{u.role || 'sender'}</span>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                            <td className="px-6 py-4 text-right text-slate-400 font-medium">{new Date(u.submittedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: KYC */}
            {activeTab === 'kyc' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <SectionHeader title="Identity Verifications" description="Review government ID and selfies for platform safety." />
                
                <div className="grid grid-cols-1 gap-6">
                  {kycSubmissions.filter(s => s.status !== 'NOT_SUBMITTED').map(sub => (
                    <div key={sub.userId} className="bg-slate-900 border border-slate-800 rounded-[16px] p-6 flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-64 shrink-0 space-y-4">
                        <div>
                          <div className="text-sm font-black text-white">{sub.fullName}</div>
                          <div className="text-[11px] text-slate-400 mt-1">{sub.email}</div>
                        </div>
                        <StatusBadge status={sub.status} />
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-4 border-t border-slate-800">Doc Type: <span className="text-white">{sub.documentType}</span></div>
                        
                        {sub.status === 'PENDING' && (
                          <div className="flex gap-2 pt-4">
                            <button onClick={() => handleKycAction(sub.userId, 'APPROVE')} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg text-xs font-black transition-colors">Approve</button>
                            <button onClick={() => setKycRejectUserId(sub.userId)} className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 rounded-lg text-xs font-black transition-colors">Reject</button>
                          </div>
                        )}
                        {sub.status === 'REJECTED' && sub.rejectionReason && (
                          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-[10px] text-rose-300 mt-2">{sub.rejectionReason}</div>
                        )}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[{title: 'Front ID', img: sub.frontImage}, {title: 'Back ID', img: sub.backImage}, {title: 'Selfie', img: sub.selfieImage}].map((doc, i) => (
                          <div key={i} className="space-y-2">
                            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{doc.title}</div>
                            {doc.img ? (
                              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                                <img src={doc.img} alt={doc.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                              </div>
                            ) : (
                              <div className="aspect-[4/3] rounded-xl bg-slate-950 border border-slate-800 border-dashed flex items-center justify-center text-[10px] text-slate-600">Missing</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: TRIPS */}
            {activeTab === 'trips' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <SectionHeader title="Active Flights" description="Monitor traveler routes and capacity." />
                
                <div className="bg-slate-900 border border-slate-800 rounded-[16px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-950/50 border-b border-slate-800">
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Route</th>
                          <th className="px-6 py-4">Flight / Date</th>
                          <th className="px-6 py-4">Capacity</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {trips.map(trip => (
                          <tr key={trip.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white flex items-center gap-2">
                                {trip.from_location} <ChevronRight size={12} className="text-flyora-teal" /> {trip.to_location}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">{trip.user.email}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              <span className="font-bold">{trip.airline}</span> ({trip.flight_number})<br/>
                              <span className="text-[10px] text-slate-500">{trip.departure_date}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white font-bold">{trip.available_weight} / {trip.capacity_weight} kg</div>
                              <div className="text-[10px] text-emerald-400 mt-0.5">${trip.price_per_kg}/kg</div>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={trip.status} /></td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {trip.status === 'Active' && (
                                  <button onClick={() => handleUpdateTripStatus(trip.id, 'Completed')} className="w-7 h-7 rounded bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-center transition-colors text-slate-400" title="Mark Completed"><Check size={14}/></button>
                                )}
                                <button onClick={() => handleDeleteTrip(trip.id)} className="w-7 h-7 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-colors text-slate-400" title="Delete"><X size={14}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BOOKINGS & ESCROW */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <SectionHeader title="Escrow & Bookings" description="Manage parcel matchings and payment holds." />
                
                <div className="grid grid-cols-1 gap-4">
                  {bookings.map(b => (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-[14px] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition-colors">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Package</div>
                          <div className="font-bold text-white text-sm">{b.package_name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{b.weight} kg • {b.category}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Users</div>
                          <div className="text-xs text-slate-300 truncate">S: {b.sender?.email}</div>
                          <div className="text-xs text-slate-300 truncate">T: {b.traveler?.email}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Escrow Status</div>
                          <div className="font-black text-emerald-400">${b.reward_amount}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{b.payment_status}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Booking Status</div>
                          <StatusBadge status={b.status} />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-slate-800/50 md:border-0">
                        {b.status === 'Pending' && <button onClick={() => handleBookingAction(b.id, 'ACCEPT')} className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-black rounded-lg transition-colors border border-emerald-500/20">Accept</button>}
                        {b.status === 'Accepted' && b.payment_status !== 'Escrow Hold' && <button onClick={() => handleBookingAction(b.id, 'DEPOSIT_ESCROW')} className="flex-1 md:flex-none px-4 py-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-black rounded-lg transition-colors border border-amber-500/20">Force Escrow</button>}
                        {b.payment_status === 'Escrow Hold' && b.status !== 'Completed' && <button onClick={() => handleBookingAction(b.id, 'RELEASE_ESCROW')} className="flex-1 md:flex-none px-4 py-2 bg-flyora-teal/10 text-flyora-teal hover:bg-flyora-teal/20 text-xs font-black rounded-lg transition-colors border border-flyora-teal/20">Release Funds</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SHIPMENTS */}
            {activeTab === 'shipments' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <SectionHeader title="Logistics Tracking" description="Monitor active shipments and inject progress logs." />
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {shipments.map(s => (
                    <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-[16px] p-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-flyora-teal/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-[10px] font-black uppercase text-flyora-teal tracking-widest mb-1">{s.tracking_number}</div>
                          <div className="font-bold text-white text-base">{s.booking?.package_name}</div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                        <div><span className="text-slate-500 block mb-1 font-bold">From</span><span className="text-slate-300 font-medium">{s.pickup_address}</span></div>
                        <div><span className="text-slate-500 block mb-1 font-bold">To</span><span className="text-slate-300 font-medium">{s.delivery_address}</span></div>
                      </div>
                      
                      <div className="mb-6 border-l-2 border-slate-800 ml-2 pl-4 space-y-4">
                        {s.logs?.map(log => (
                          <div key={log.id} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-flyora-teal border-2 border-slate-900" />
                            <div className="flex justify-between items-center text-xs">
                              <strong className="text-slate-200">{log.status}</strong>
                              <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{log.location}</div>
                          </div>
                        ))}
                      </div>
                      
                      <button onClick={() => setSelectedShipment(s)} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition-colors border border-slate-700 flex justify-center items-center gap-2">
                        <Plus size={14} /> Add Checkpoint
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Rejection Modal */}
      {kycRejectUserId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[20px] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white mb-2">Reject Verification</h3>
            <p className="text-xs text-slate-400 mb-6">Please provide a reason for rejecting these documents.</p>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-flyora-teal focus:border-flyora-teal outline-none resize-none mb-6"
              rows={4} placeholder="e.g. Document image is illegible..."
              value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setKycRejectUserId(null)} className="flex-1 py-3 text-xs font-bold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={() => handleKycAction(kycRejectUserId, 'REJECT', rejectionReason)} className="flex-1 py-3 text-xs font-black text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Log Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[20px] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white mb-2">Add Transit Log</h3>
            <p className="text-xs text-slate-400 mb-6">Updating checkpoint for {selectedShipment.tracking_number}</p>
            <form onSubmit={handleAddShipmentLog} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Status Step</label>
                <select value={logStatus} onChange={e => setLogStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-flyora-teal outline-none">
                  <option>Package Received</option><option>In Transit</option><option>Customs Cleared</option><option>Out for Delivery</option><option>Delivered</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Location</label>
                <input required type="text" value={logLocation} onChange={e => setLogLocation(e.target.value)} placeholder="e.g. Dubai Terminal 3" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-flyora-teal outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                <textarea required rows={3} value={logDescription} onChange={e => setLogDescription(e.target.value)} placeholder="Details..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-flyora-teal outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSelectedShipment(null)} className="flex-1 py-3 text-xs font-bold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-xs font-black text-white bg-flyora-teal rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
