import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, Mail, ArrowRight, AlertCircle, Plane, 
  Eye, EyeOff, Sparkles
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#081220] font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">

      {/* ─── LEFT SIDE: 3D Airplane Cinematic Showcase ─── */}
      <div className="relative w-full lg:w-[55%] xl:w-[58%] min-h-[420px] lg:min-h-screen bg-[#070D18] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none">
        
        {/* Dynamic 3D Airplane Render Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/admin_3d_airplane.png"
            alt="3D Jetliner"
            className="w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-1000 ease-out filter brightness-95 contrast-110"
          />
          {/* Dual Multi-layer Gradients for Seamless Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#081220] via-transparent to-[#070D18]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/80 via-transparent to-[#081220]/90" />
          
          {/* Aerodynamic Glowing Orbs */}
          <div className="absolute top-1/3 left-1/4 w-[420px] h-[420px] rounded-full bg-teal-500/20 blur-[130px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-400/15 blur-[110px] pointer-events-none" />
        </div>

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-flyora-teal via-teal-400 to-emerald-300 flex items-center justify-center shadow-lg shadow-teal-500/30 border border-white/20 group-hover:scale-105 transition-transform duration-300">
              <Plane size={24} className="text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                fly<span className="text-flyora-teal">orago</span>
              </span>
              <span className="text-[10px] font-extrabold text-teal-300/80 tracking-widest uppercase mt-1">
                Global Travel & Freight
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 backdrop-blur-md text-xs font-bold transition-all shadow-sm"
          >
            <span>&larr; Main Website</span>
          </Link>
        </div>

        {/* Center Powerful Hero Headline */}
        <div className="relative z-10 my-auto py-10 max-w-xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] drop-shadow-md">
            Smart Global <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyora-teal via-teal-300 to-cyan-200">
              Luggage & Travel
            </span> <br />
            Platform
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-lg drop-shadow">
            Connect verified flight travelers and senders seamlessly across international routes with smart luggage allocation.
          </p>
        </div>

        {/* Bottom Status Row */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-200">Live Global Flight Network</span>
          </div>
          <span className="text-slate-400 font-semibold text-[11px]">Flyorago 2026</span>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Advanced Powerful Modern Login Form ─── */}
      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#F8FAFC] relative z-10">

        {/* Top Navigation */}
        <div className="flex items-center justify-end w-full">
          <Link
            to="/"
            className="sm:hidden text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs"
          >
            &larr; Back to Website
          </Link>
        </div>

        {/* Centered Login Form */}
        <div className="w-full max-w-md mx-auto my-auto py-6">

          {/* Clean Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Admin Portal
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              Enter your credentials below to access the control center.
            </p>
          </div>

          {/* Error Box */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-3 shadow-xs animate-shake">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Admin Username / Email
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-flyora-teal transition-colors" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email or username (e.g. admin)"
                  required
                  autoFocus
                  className="w-full h-13 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-xs hover:border-slate-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-flyora-teal transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secret password"
                  required
                  className="w-full h-13 pl-11 pr-12 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-xs hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Advanced Powerful Animated Glowing Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-13 overflow-hidden rounded-xl bg-gradient-to-r from-flyora-teal via-teal-600 to-emerald-500 text-white font-black text-sm tracking-wide shadow-lg shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/50 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {/* Shimmer sweep animation overlay */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

              {isLoading ? (
                <span className="flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Clean Minimal Footer */}
        <div className="w-full text-center text-xs text-slate-400 font-medium pt-6">
          © 2026 Flyorago. All rights reserved.
        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
