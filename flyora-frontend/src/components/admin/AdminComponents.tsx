import React from 'react';
import { ChevronUp, ChevronDown, Check, X, AlertCircle } from 'lucide-react';

export const StatusBadge: React.FC<{ status: string; type?: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = ({ status, type }) => {
  let colors = 'bg-slate-800 text-slate-400 border-slate-700';
  
  if (!type) {
    const s = status.toLowerCase();
    if (s.includes('approve') || s.includes('active') || s.includes('complete') || s.includes('deliver') || s.includes('accept')) type = 'success';
    else if (s.includes('reject') || s.includes('cancel') || s.includes('fail')) type = 'danger';
    else if (s.includes('pending') || s.includes('transit') || s.includes('hold')) type = 'warning';
    else type = 'info';
  }

  switch (type) {
    case 'success': colors = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; break;
    case 'warning': colors = 'bg-amber-500/10 text-amber-400 border-amber-500/20'; break;
    case 'danger': colors = 'bg-rose-500/10 text-rose-400 border-rose-500/20'; break;
    case 'info': colors = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const MetricCard: React.FC<{ title: string; value: string | number; trend: number; icon: React.ReactNode; subtitle: string }> = ({ title, value, trend, icon, subtitle }) => {
  const isPositive = trend >= 0;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[16px] p-5 relative overflow-hidden transition-all hover:border-slate-700 hover:shadow-lg hover:-translate-y-1 group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{title}</div>
        <div className="text-2xl font-black text-white mt-1 tracking-tight">{value}</div>
        <div className="text-[11px] text-slate-400 font-medium mt-1.5">{subtitle}</div>
      </div>
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h2 className="text-lg font-black text-white tracking-tight">{title}</h2>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const ChartCard: React.FC<{ title: string; type: 'bar' | 'line'; data: number[] }> = ({ title, type, data }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[16px] p-6 h-full flex flex-col">
      <div className="text-sm font-black text-white mb-6 tracking-tight">{title}</div>
      <div className="flex-1 flex items-end gap-2 h-[150px]">
        {data.map((val, i) => {
          const height = (val / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end items-center group">
              <div className="w-full bg-flyora-teal/20 rounded-t-sm hover:bg-flyora-teal transition-all relative" style={{ height: `${height}%`, minHeight: '4px' }}>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap z-10">
                  {val}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 border-t border-slate-800/50 pt-3">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{d}</div>
        ))}
      </div>
    </div>
  );
};

export const ApprovalCard: React.FC<{ title: string; subtitle: string; label: string; onApprove: () => void; onReject: () => void; isPending: boolean }> = ({ title, subtitle, label, onApprove, onReject, isPending }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-[14px] p-4 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="text-[10px] font-black uppercase text-flyora-teal tracking-widest mb-1">{label}</div>
        <div className="text-sm font-bold text-white leading-tight">{title}</div>
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
      </div>
    </div>
    {isPending ? (
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800/50">
        <button onClick={onApprove} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg text-xs font-black transition-colors flex items-center justify-center gap-1.5">
          <Check size={14} /> Approve
        </button>
        <button onClick={onReject} className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 rounded-lg text-xs font-black transition-colors flex items-center justify-center gap-1.5">
          <X size={14} /> Reject
        </button>
      </div>
    ) : (
      <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-end">
        <StatusBadge status="Resolved" type="default" />
      </div>
    )}
  </div>
);

export const HealthStatus: React.FC<{ name: string; status: 'operational' | 'degraded' | 'down' }> = ({ name, status }) => (
  <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-[12px]">
    <span className="text-xs font-bold text-slate-300">{name}</span>
    <div className="flex items-center gap-2">
      <span className={`text-[10px] font-black uppercase tracking-wider ${status === 'operational' ? 'text-emerald-400' : status === 'degraded' ? 'text-amber-400' : 'text-rose-400'}`}>
        {status}
      </span>
      <div className="relative flex h-2 w-2">
        {status === 'operational' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'operational' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
      </div>
    </div>
  </div>
);
