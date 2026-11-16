import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, Mail, ArrowRight, AlertCircle, Plane, 
  Eye, EyeOff
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
        setError(resData.message || resData.error || 'Invalid Credentials. Please check your email and password.');
        return;
      }

      const role = resData.data?.user?.role || resData.data?.role;
      if (role !== 'admin') {
        setIsLoading(false);
        setError('Access denied: Unauthorized role privileges.');
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#081220] font-sans selection:bg-teal-500 selection:text-white relative overflow-x-hidden">

      {/* ─── LEFT SIDE: 3D Airplane Cinematic Showcase ─── */}
      <div className="relative w-full lg:w-[50%] xl:w-[52%] min-h-[360px] sm:min-h-[440px] lg:min-h-screen bg-[#070D18] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 select-none shrink-0">
        
        {/* Dynamic 3D Airplane Render Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/admin_3d_airplane.png"
            alt="3D Jetliner"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-110"
          />
          {/* Dual Multi-layer Gradients for Seamless Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#081220] via-transparent to-[#070D18]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/85 via-transparent to-[#081220]/90" />
          
          {/* Aerodynamic Glowing Orbs */}
          <div className="absolute top-1/3 left-1/4 w-[360px] h-[360px] rounded-full bg-teal-500/20 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-cyan-400/15 blur-[110px] pointer-events-none" />
        </div>

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-flyora-teal via-teal-400 to-emerald-300 flex items-center justify-center shadow-lg shadow-teal-500/30 border border-white/20 group-hover:scale-105 transition-transform duration-300">
              <Plane size={22} className="text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                fly<span className="text-flyora-teal">orago</span>
              </span>
              <span className="text-[10px] font-extrabold text-teal-300/80 tracking-widest uppercase mt-1">
                Global Travel & Freight
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 backdrop-blur-md text-xs font-bold transition-all shadow-sm"
          >
            <span>&larr; Main Website</span>
          </Link>
        </div>

        {/* Center Powerful Hero Headline */}
        <div className="relative z-10 my-auto py-8 sm:py-10 max-w-lg">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
            Smart Global <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyora-teal via-teal-300 to-cyan-200">
              Luggage & Travel
            </span> <br />
            Platform
          </h1>

          <p className="mt-4 text-xs sm:text-sm lg:text-base text-slate-200 font-medium leading-relaxed max-w-md drop-shadow">
            Connect verified flight travelers and senders seamlessly across international routes with smart luggage allocation.
          </p>
        </div>

        {/* Bottom Status Row */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-200 text-xs">Live Global Flight Network</span>
          </div>
          <span className="text-slate-400 font-semibold text-[11px]">Flyorago 2026</span>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Advanced Powerful Modern Login Form ─── */}
      <div className="w-full lg:w-[50%] xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#F8FAFC] relative z-10 overflow-y-auto">

        {/* Top Navigation */}
        <div className="flex items-center justify-end w-full mb-4 lg:mb-0">
          <Link
            to="/"
            className="sm:hidden text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
          >
            &larr; Back to Website
          </Link>
        </div>

        {/* Centered Login Form Container */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-6">

          {/* Title Header */}
          <div className="mb-8 text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Admin Portal
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
              Enter your credentials below to access the control center.
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-3 shadow-xs animate-shake">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            {/* Email / Username Input Group — Integrated MNC Field */}
            <div className="w-full">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                ADMIN USERNAME / EMAIL
              </label>
              <div className="w-full h-13 px-4 bg-white border border-slate-300 rounded-xl flex items-center gap-3 focus-within:border-flyora-teal focus-within:ring-4 focus-within:ring-teal-500/15 hover:border-slate-400 transition-all shadow-xs">
                <Mail size={19} className="text-slate-400 shrink-0 select-none" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flyorago.me"
                  required
                  autoFocus
                  className="w-full h-full bg-transparent border-0 outline-none ring-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal p-0 shadow-none focus:ring-0 focus:outline-none focus:border-0"
                />
              </div>
            </div>

            {/* Password Input Group — Integrated MNC Field */}
            <div className="w-full">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                PASSWORD
              </label>
              <div className="w-full h-13 px-4 bg-white border border-slate-300 rounded-xl flex items-center gap-3 focus-within:border-flyora-teal focus-within:ring-4 focus-within:ring-teal-500/15 hover:border-slate-400 transition-all shadow-xs">
                <Lock size={19} className="text-slate-400 shrink-0 select-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-full bg-transparent border-0 outline-none ring-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal p-0 shadow-none focus:ring-0 focus:outline-none focus:border-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 -mr-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Advanced MNC Grade Interactive Animated Button */}
            <div className="pt-2 w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full h-13 overflow-hidden rounded-xl bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#115E59] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-teal-700/25 hover:shadow-xl hover:shadow-teal-700/40 hover:brightness-105 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group border border-teal-500/30"
              >
                {/* Subtle Shimmer Ray */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={17} className="group-hover:translate-x-1.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Clean Footer */}
        <div className="w-full text-center text-xs text-slate-400 font-medium pt-4">
          © 2026 Flyorago. All rights reserved.
        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
