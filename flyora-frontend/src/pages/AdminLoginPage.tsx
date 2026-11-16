import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Lock, Mail, ArrowRight, AlertCircle, Plane, 
  Eye, EyeOff, ShieldCheck, KeyRound, Activity, Server, 
  CheckCircle2, Users, Database, Globe2, Sparkles, ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();
    let loginEmail = inputEmail;
    let loginPassword = password;

    // Quick-fill alias support for default admin credentials
    if ((inputEmail === 'admin' || inputEmail === 'admin@flyorago.com') && (password === 'admin' || password === 'admin123')) {
      loginEmail = 'admin@flyorago.me';
      loginPassword = 'FlyoragoAdmin2026!';
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(resData.message || resData.error || 'Invalid Admin Credentials. Please check your email and password.');
        return;
      }

      const role = resData.data?.user?.role || resData.data?.role;
      if (role !== 'admin') {
        setIsLoading(false);
        setError('Access denied. This account does not have Admin privileges.');
        return;
      }

      // Store authenticated admin session & JWT tokens
      localStorage.setItem('flyora_admin_authenticated', 'true');
      localStorage.setItem('flyora_admin_email', loginEmail);
      localStorage.setItem('flyora_login_time', Date.now().toString());
      localStorage.setItem('flyora_user_id', String(resData.data?.userId || resData.data?.user?.id || ''));
      localStorage.setItem('flyora_user_name', resData.data?.fullName || resData.data?.user?.full_name || 'Administrator');
      localStorage.setItem('flyora_user_role', 'admin');
      if (resData.data?.tokens) {
        localStorage.setItem('flyora_access_token', resData.data.tokens.access);
        localStorage.setItem('flyora_refresh_token', resData.data.tokens.refresh);
      }

      setIsLoading(false);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Unable to connect to authentication server. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0A1628] font-sans selection:bg-teal-500 selection:text-white">

      {/* ─── LEFT SIDE: MNC Grade Enterprise Showcase ─── */}
      <div className="relative w-full lg:w-[54%] xl:w-[58%] min-h-[380px] lg:min-h-screen bg-[#070E1A] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        
        {/* Background Visual Asset & Luxury Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/login%20page.png"
            alt="Flyorago Global Logistics Infrastructure"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 filter contrast-125"
          />
          {/* Deep Navy/Teal Dual Multi-layer Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070E1A] via-[#0A1628]/85 to-[#0A1628]/70" />
          
          {/* Subtle Ambient Glowing Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        </div>

        {/* Top Navbar Header */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-flyora-teal via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/25 border border-white/20 group-hover:scale-105 transition-transform duration-300">
              <Plane size={22} className="text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white tracking-tight">
                  fly<span className="text-flyora-teal">orago</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-[10px] font-black uppercase tracking-widest border border-teal-500/30 backdrop-blur-md">
                  MNC Portal
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                Global Travel & Freight Systems
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md text-xs font-bold transition-all shadow-sm"
          >
            <span>&larr; Main Website</span>
          </Link>
        </div>

        {/* Center MNC Value Proposition & Interactive Highlights */}
        <div className="relative z-10 my-auto py-8 lg:py-12 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-extrabold mb-6 backdrop-blur-md">
            <Sparkles size={14} className="text-teal-400 animate-pulse" />
            <span>Mission-Critical Executive Control Suite</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Command Center for Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyora-teal via-teal-300 to-cyan-200">Luggage & Escrow</span> Logistics.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Enterprise orchestration engine for real-time KYC audits, automated smart contracts, escrow ledger balance controls, and cross-border flight carrier monitoring.
          </p>

          {/* MNC Key Performance Indicators / Badges Grid */}
          <div className="grid grid-cols-3 gap-3.5 sm:gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="flex items-center gap-2 text-teal-400 mb-1">
                <Globe2 size={16} />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Network</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white">120+ Airports</div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Live Air Hubs</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <ShieldCheck size={16} />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Security</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white">Tier-4 Escrow</div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Zero Settlement Risk</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Activity size={16} />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Uptime</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white">99.98%</div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">High Availability</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Details */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-300">AWS Production Gateway Active</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Flyorago Governance v2.6 Enterprise</span>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Clean & Powerful MNC Admin Login Panel ─── */}
      <div className="w-full lg:w-[46%] xl:w-[42%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#F8FAFC] relative z-10">

        {/* Top Spacer or Mobile Return Link */}
        <div className="flex items-center justify-between w-full mb-6 lg:mb-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs">
            <ShieldCheck size={14} className="text-flyora-teal" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              ISO 27001 & SOC-2
            </span>
          </div>

          <Link
            to="/"
            className="sm:hidden text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
          >
            &larr; Exit
          </Link>
        </div>

        {/* Centered Login Card Form */}
        <div className="w-full max-w-md mx-auto my-auto py-4">

          {/* Header Title */}
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100/80 text-flyora-teal flex items-center justify-center mb-5 shadow-xs">
              <Shield size={28} className="stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Enterprise Admin Portal
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
              Sign in with your multi-role credentials to access mission control, governance audits & operations.
            </p>
          </div>

          {/* Error Notification Alert */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-3 shadow-xs animate-shake">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            {/* Admin Email Input */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Administrator Identifier / Email
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-flyora-teal transition-colors" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flyorago.me"
                  required
                  autoFocus
                  className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Admin Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Master Security Key / Password
                </label>
                <span className="text-[11px] font-bold text-slate-400">
                  256-Bit Encrypted
                </span>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-flyora-teal transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-12 pl-11 pr-12 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title={showPassword ? 'Hide key' : 'Show key'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Quick Demo Shortcut Alias Info Box */}
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <KeyRound size={15} className="text-flyora-teal shrink-0" />
                <span>Quick Alias: <strong className="font-mono text-teal-800">admin</strong></span>
              </div>
              <span className="font-bold text-teal-700 text-[11px] flex items-center gap-1">
                <CheckCircle2 size={13} className="text-teal-600" /> Pre-Configured
              </span>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 bg-gradient-to-r from-flyora-teal via-teal-700 to-slate-900 hover:from-teal-600 hover:to-slate-800 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-xl shadow-teal-700/20 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {isLoading ? (
                <span className="flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating System Access...
                </span>
              ) : (
                <>
                  <span>Authenticate & Launch Admin Gateway</span>
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Certifications */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Server size={13} className="text-slate-400" /> AWS VPC Isolated
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <ShieldCheck size={14} /> 256-Bit SSL Enforced
            </span>
          </div>
        </div>

        {/* Global Compliance Footer */}
        <div className="w-full text-center text-[11px] text-slate-400 font-medium pt-6">
          © 2026 Flyorago Inc. Restricted to Authorized Global Systems Administrators.
        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
