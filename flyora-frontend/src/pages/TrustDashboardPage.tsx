import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ShieldCheck, TrendingUp, AlertTriangle, ChevronRight, Activity, ArrowUpRight, ArrowDownRight, UserCheck, ShieldAlert, BadgeCheck } from 'lucide-react';
import { apiFetch } from '../utils/api';

// ⚡ Module-level memory cache for 0ms instant loading
let trustCache: any = null;

const TrustDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Fast cached initial state (0ms load time)
  const [profile, setProfile] = useState<any>(() => {
    if (trustCache) return trustCache;
    try {
      const saved = localStorage.getItem('flyora_cache_trust');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => !trustCache && !localStorage.getItem('flyora_cache_trust'));

  useEffect(() => {
    let isMounted = true;

    // Non-blocking background live fetch (Stale-While-Revalidate)
    apiFetch('/api/trust/profile/')
      .then(res => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (data && typeof data.score === 'number') {
          setProfile(data);
          trustCache = data;
          try { localStorage.setItem('flyora_cache_trust', JSON.stringify(data)); } catch {}
        } else if (!profile) {
          // Default profile if new user
          const def = {
            score: 550, level: 'STANDARD', status: 'ACTIVE',
            ai_confidence_score: 50, delivery_success_rate: 100.0,
            cancellation_rate: 0.0, fraud_risk_score: 0.0, activity_logs: []
          };
          setProfile(def);
          trustCache = def;
        }
      })
      .catch(err => {
        console.error('Trust score fetch error:', err);
        if (!profile && isMounted) {
          const def = {
            score: 550, level: 'STANDARD', status: 'ACTIVE',
            ai_confidence_score: 50, delivery_success_rate: 100.0,
            cancellation_rate: 0.0, fraud_risk_score: 0.0, activity_logs: []
          };
          setProfile(def);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'ELITE': return 'from-emerald-400 to-emerald-600 text-emerald-500 shadow-emerald-500/30';
      case 'PLATINUM': return 'from-blue-400 to-blue-600 text-blue-500 shadow-blue-500/30';
      case 'GOLD': return 'from-yellow-400 to-yellow-600 text-yellow-500 shadow-yellow-500/30';
      case 'SILVER': return 'from-slate-400 to-slate-600 text-slate-500 shadow-slate-500/30';
      case 'STANDARD': return 'from-gray-400 to-gray-500 text-gray-500 shadow-gray-500/30';
      case 'HIGH_RISK': return 'from-red-400 to-red-600 text-red-500 shadow-red-500/30';
      default: return 'from-flyora-teal to-teal-500 text-flyora-teal shadow-teal-500/30';
    }
  };
  
  const getBadgeGradient = (level: string) => getBadgeColor(level).split(' ')[0] + ' ' + getBadgeColor(level).split(' ')[1];

  // Active profile data
  const currentProfile = profile || {
    score: 550, level: 'STANDARD', status: 'ACTIVE',
    ai_confidence_score: 50, delivery_success_rate: 100.0,
    cancellation_rate: 0.0, fraud_risk_score: 0.0, activity_logs: []
  };

  const scorePercentage = (currentProfile.score / 1000) * 100;
  const badgeClasses = getBadgeColor(currentProfile.level);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Trust Score" />
      <main className="flex-1 min-w-0 w-full max-w-full lg:ml-[240px] overflow-y-auto pb-20 overflow-x-hidden">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getBadgeGradient(currentProfile.level)} flex items-center justify-center shadow-lg`}>
                <ShieldCheck className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Trust Score</h1>
                <p className="text-xs font-semibold text-slate-500">AI Powered Dynamic Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
          
          {/* Main Score Widget */}
          <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${getBadgeGradient(currentProfile.level)} opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
            
            {/* Circular Ring */}
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <svg width="240" height="240" className="transform -rotate-90 drop-shadow-xl">
                <circle cx="120" cy="120" r="100" className="stroke-slate-100" strokeWidth="16" fill="none" />
                <circle cx="120" cy="120" r="100" 
                  className={`stroke-current ${badgeClasses.split(' ')[2]}`} 
                  strokeWidth="16" fill="none" strokeLinecap="round" 
                  strokeDasharray="628" strokeDashoffset={628 - (628 * scorePercentage) / 100}
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-slate-900 tracking-tighter">{currentProfile.score}</span>
                <span className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">/ 1000</span>
              </div>
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left z-10">
              <div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getBadgeGradient(currentProfile.level)} text-white font-bold text-sm shadow-lg mb-4 ${badgeClasses.split(' ')[3]}`}>
                  <BadgeCheck size={16} />
                  {currentProfile.level.replace('_', ' ')} LEVEL
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  {currentProfile.score >= 750 ? "You're in the top tier of trusted users!" : "Maintain your high trust score!"}
                </h2>
                <p className="text-slate-500 font-medium max-w-lg">
                  Your AI-analyzed trust score is updated dynamically. Complete on-time deliveries, verify documents, and collect 5-star reviews to reach Elite status.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Positive Events</p>
                    <p className="text-sm font-bold text-slate-900">
                      +{currentProfile.activity_logs?.filter((l: any) => l.score_change > 0).length || 0} Events
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">AI Confidence</p>
                    <p className="text-sm font-bold text-slate-900">{currentProfile.ai_confidence_score}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><UserCheck className="text-flyora-teal" size={20}/></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reliability</span>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 mb-1">{currentProfile.delivery_success_rate}%</div>
                <p className="text-sm font-semibold text-slate-500">Delivery Success Rate</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><AlertTriangle className="text-red-500" size={20}/></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk</span>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 mb-1">{currentProfile.cancellation_rate}%</div>
                <p className="text-sm font-semibold text-slate-500">Cancellation Rate</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><ShieldAlert className="text-indigo-500" size={20}/></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security</span>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 mb-1">{currentProfile.fraud_risk_score}%</div>
                <p className="text-sm font-semibold text-slate-500">AI Fraud Risk Percent</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Recommendations */}
            <div className="lg:col-span-1 bg-gradient-to-b from-slate-900 to-slate-800 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-flyora-teal/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <h3 className="text-lg font-black text-white mb-6 relative z-10 flex items-center gap-2">
                <Activity size={20} className="text-flyora-teal" />
                AI Recommendations
              </h3>
              
              <div className="space-y-4 relative z-10">
                {['Complete Passport Verification', 'Increase Successful Deliveries', 'Maintain High Ratings'].map((rec, i) => (
                  <div key={i} onClick={() => navigate('/kyc')} className="bg-white/10 hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/5">
                    <span className="text-sm font-semibold text-white/90">{rec}</span>
                    <ChevronRight size={16} className="text-flyora-teal" />
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-6">Recent Trust Activity</h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {currentProfile.activity_logs?.slice(0, 5).map((log: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {log.score_change > 0 ? <ArrowUpRight size={16} className="text-green-500" /> : <ArrowDownRight size={16} className="text-red-500" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{log.reason}</h4>
                        <span className={`font-black text-sm ${log.score_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {log.score_change > 0 ? '+' : ''}{log.score_change}
                        </span>
                      </div>
                      <time className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{new Date(log.created_at).toLocaleDateString()}</time>
                    </div>
                  </div>
                ))}
                {(!currentProfile.activity_logs || currentProfile.activity_logs.length === 0) && (
                  <div className="text-center text-sm font-semibold text-slate-400 py-10">No recent trust activity logs</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TrustDashboardPage;
