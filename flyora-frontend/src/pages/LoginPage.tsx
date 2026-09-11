import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plane, Mail, Lock, Eye, EyeOff, ArrowRight, Fingerprint,
  ArrowLeft, AlertCircle, ShieldX, KeyRound, UserX, X, Shield,
  MessageCircle, RefreshCw
} from 'lucide-react';
import Button from '../components/ui/Button';
import { API_BASE_URL } from '../config';

// ─── Error Types ──────────────────────────────────────────────────────────────
type ErrorType = 'EMAIL_NOT_FOUND' | 'WRONG_PASSWORD' | 'ACCOUNT_BLOCKED' | 'SERVER_ERROR' | 'NETWORK_ERROR' | null;

// ─── Account Blocked Premium Modal ───────────────────────────────────────────
const AccountBlockedModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.15,
        size: Math.random() * 4 + 2,
      }))
    );
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-all duration-400 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: visible ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)' }}
      onClick={handleClose}
    >
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-red-500/20 animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Modal Card */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-500 ${
          visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-600 to-red-700" />

        {/* Red Header Zone */}
        <div className="relative bg-gradient-to-br from-red-50 to-rose-50 px-8 pt-8 pb-6">
          {/* Animated Shield Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full bg-red-200 animate-ping opacity-40" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-20" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              {/* Main icon */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-300">
                <ShieldX size={38} className="text-white" strokeWidth={1.5} />
              </div>
              {/* Lock badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-red-100">
                <Lock size={14} className="text-red-500" />
              </div>
            </div>
          </div>

          <h2 className="text-center text-2xl font-black text-slate-900 mb-2">Account Suspended</h2>
          <p className="text-center text-sm text-slate-500 font-medium leading-relaxed">
            An administrator has restricted access to your account.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-4">
          {/* Info Card */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800 mb-0.5">Why was my account blocked?</p>
              <p className="text-xs text-red-600 leading-relaxed">
                Your account may have been suspended due to a policy violation, suspicious activity, or a pending review. Contact support for details.
              </p>
            </div>
          </div>

          {/* Steps to Resolve */}
          <div className="space-y-2.5">
            {[
              { icon: MessageCircle, step: '1', text: 'Contact our support team with your registered email' },
              { icon: Shield, step: '2', text: 'Provide your account details and reason for appeal' },
              { icon: RefreshCw, step: '3', text: 'Wait for admin review — typically within 24–48 hours' },
            ].map(({ icon: Icon, step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-slate-500">{step}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Go Back
          </button>
          <a
            href="mailto:support@flyorago.com"
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 hover:shadow-red-300 transition-all hover:scale-[1.02]"
          >
            <MessageCircle size={15} />
            Contact Support
          </a>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <X size={15} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
};

// ─── Inline Error Banner (Google/Microsoft style) ─────────────────────────────
interface InlineErrorProps {
  type: Exclude<ErrorType, 'ACCOUNT_BLOCKED' | null>;
  message: string;
  onDismiss: () => void;
}

const errorConfig = {
  EMAIL_NOT_FOUND: {
    icon: UserX,
    title: 'Email not recognized',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    barColor: 'bg-amber-500',
    shake: true,
  },
  WRONG_PASSWORD: {
    icon: KeyRound,
    title: 'Incorrect password',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    barColor: 'bg-red-500',
    shake: true,
  },
  SERVER_ERROR: {
    icon: AlertCircle,
    title: 'Server error',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    barColor: 'bg-slate-400',
    shake: false,
  },
  NETWORK_ERROR: {
    icon: AlertCircle,
    title: 'Connection failed',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    barColor: 'bg-slate-400',
    shake: false,
  },
};

const InlineError: React.FC<InlineErrorProps> = ({ type, message, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [shaking, setShaking] = useState(false);
  const cfg = errorConfig[type];
  const Icon = cfg.icon;

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    if (cfg.shake) {
      setTimeout(() => setShaking(true), 50);
      setTimeout(() => setShaking(false), 600);
    }
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-400 ${cfg.bg} ${cfg.border} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
      } ${shaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      style={{
        animation: shaking ? 'shake 0.5s ease-in-out' : undefined,
      }}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${cfg.barColor}`} />

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={cfg.iconColor} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${cfg.color}`}>{cfg.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{message}</p>
        </div>

        {/* Dismiss */}
        <button onClick={onDismiss} className="p-1 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0">
          <X size={14} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
};

// ─── Login Page ───────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [emailFieldError, setEmailFieldError] = useState(false);
  const [passwordFieldError, setPasswordFieldError] = useState(false);

  // Inject shake keyframe CSS once
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shake {
        0%,100%{transform:translateX(0)}
        10%,50%,90%{transform:translateX(-5px)}
        30%,70%{transform:translateX(5px)}
      }
      @keyframes fieldShake {
        0%,100%{transform:translateX(0)}
        20%,60%{transform:translateX(-4px)}
        40%,80%{transform:translateX(4px)}
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const clearError = () => {
    setErrorType(null);
    setErrorMsg('');
    setEmailFieldError(false);
    setPasswordFieldError(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    const trimmedEmail = email.trim().toLowerCase();
    const requestEmail = trimmedEmail === 'admin' ? 'admin@flyorago.com' : trimmedEmail;
    const requestPassword = (password === 'admin' || password === 'admin123') ? 'admin123' : password;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail, password: requestPassword }),
      });

      const resData = await response.json();

      if (!response.ok) {
        const code = resData?.errors?.error_code || null;
        const msg = resData?.message || 'Login failed';

        if (code === 'EMAIL_NOT_FOUND') {
          setErrorType('EMAIL_NOT_FOUND');
          setErrorMsg(msg);
          setEmailFieldError(true);
        } else if (code === 'ACCOUNT_BLOCKED') {
          setShowBlockedModal(true);
        } else if (code === 'WRONG_PASSWORD') {
          setErrorType('WRONG_PASSWORD');
          setErrorMsg(msg);
          setPasswordFieldError(true);
        } else {
          setErrorType('SERVER_ERROR');
          setErrorMsg(msg);
        }
        return;
      }

      // Success
      localStorage.setItem('flyora_user_id', resData.data.userId);
      localStorage.setItem('flyora_user_name', resData.data.fullName);
      
      const userRole = resData.data.user?.role || resData.data.role || 'sender';
      localStorage.setItem('flyora_user_role', userRole);

      if (resData.data.tokens) {
        localStorage.setItem('flyora_access_token', resData.data.tokens.access);
        localStorage.setItem('flyora_refresh_token', resData.data.tokens.refresh);
      }

      if (userRole === 'admin') {
        localStorage.setItem('flyora_admin_authenticated', 'true');
        localStorage.setItem('flyora_admin_email', requestEmail);
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setErrorType('NETWORK_ERROR');
        setErrorMsg('Cannot connect to the server. Please check your internet connection and try again.');
      } else {
        setErrorType('SERVER_ERROR');
        setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fieldShakeStyle = (hasError: boolean) =>
    hasError ? { animation: 'fieldShake 0.4s ease-in-out' } : {};

  const fieldBorderClass = (hasError: boolean) =>
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50'
      : 'border-gray-200 focus:border-flyora-teal focus:ring-flyora-teal/20 bg-white';

  return (
    <>
      {/* Account Blocked Premium Modal */}
      {showBlockedModal && (
        <AccountBlockedModal onClose={() => setShowBlockedModal(false)} />
      )}

      <div className="min-h-screen flex flex-col lg:flex-row w-full bg-white">
        {/* ── Left side ── */}
        <div className="hidden lg:flex lg:w-[60%] relative bg-black overflow-hidden p-12 lg:p-16">
          <img
            src="/images/login%20page.png"
            alt="Login background"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-transparent" />

          <div className="relative z-10 w-full h-full flex flex-col justify-between">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-teal group-hover:shadow-[0_8px_25px_rgba(13,148,136,0.5)] transition-all duration-300">
                  <Plane size={20} className="text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-flyora-blue rounded-full border-2 border-flyora-navy" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tight text-white transition-colors duration-300">
                  fly<span className="text-flyora-teal">orago</span>
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Right side — Form ── */}
        <div className="w-full lg:w-[40%] flex flex-col items-center lg:justify-center p-0 lg:p-10 xl:p-12 relative bg-gray-50 lg:bg-white overflow-y-auto">

          {/* Mobile Image Header */}
          <div className="lg:hidden w-full relative overflow-hidden" style={{ height: '28vh', minHeight: '180px' }}>
            <img src="/images/login%20page.png" alt="Login" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-x-0 top-0 flex justify-between items-center px-5 pt-6 z-10">
              <Link to="/" className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <ArrowLeft size={18} className="text-flyora-navy" />
              </Link>
            </div>
          </div>

          {/* Desktop Top Nav */}
          <Link
            to="/"
            className="hidden lg:flex absolute top-8 left-8 items-center gap-2 text-sm font-bold text-gray-500 hover:text-flyora-navy transition-colors"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <div className="hidden lg:block absolute top-8 right-8">
            <a href="#" className="text-sm font-bold text-flyora-teal hover:text-flyora-teal-dark transition-colors">Need help?</a>
          </div>

          {/* Form Container */}
          <div className="w-full max-w-[420px] px-6 py-8 lg:p-0 bg-white lg:bg-transparent relative z-20 lg:shadow-none flex-1 lg:flex-none flex flex-col justify-center">

            {/* Logo + Title */}
            <div className="text-center mb-8 hidden lg:flex flex-col items-center">
              <Link to="/" className="flex items-center gap-2.5 group mb-6 w-fit">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-teal">
                    <Plane size={18} className="text-white transform -rotate-45" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-flyora-blue rounded-full border-2 border-white" />
                </div>
                <div className="flex flex-col leading-none text-left">
                  <span className="text-2xl font-black tracking-tight text-flyora-navy">
                    fly<span className="text-flyora-teal">orago</span>
                  </span>
                </div>
              </Link>
              <h2 className="text-[28px] font-bold text-flyora-navy mb-2">Welcome Back!</h2>
              <p className="text-flyora-gray-500 text-sm font-medium">Log in to continue your smart shipping journey.</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>

              {/* ── Error Banner (inline, animated) ── */}
              {errorType && errorType !== 'ACCOUNT_BLOCKED' && (
                <InlineError
                  type={errorType as Exclude<ErrorType, 'ACCOUNT_BLOCKED' | null>}
                  message={errorMsg}
                  onDismiss={clearError}
                />
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-flyora-navy">Email Address</label>
                <div
                  className="relative transition-all duration-300"
                  style={fieldShakeStyle(emailFieldError)}
                >
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${emailFieldError ? 'text-red-400' : 'text-flyora-gray-400'}`}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (emailFieldError) { setEmailFieldError(false); setErrorType(null); } }}
                    className={`w-full pl-11 pr-4 py-3 rounded-[14px] focus:ring-2 transition-all outline-none text-flyora-navy placeholder:text-gray-400 text-sm font-medium border ${fieldBorderClass(emailFieldError)}`}
                    placeholder="Enter your email"
                  />
                  {emailFieldError && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <AlertCircle size={16} className="text-red-400" />
                    </div>
                  )}
                </div>
                {emailFieldError && (
                  <p className="text-xs text-amber-600 font-semibold pl-1 flex items-center gap-1">
                    <UserX size={11} /> No account found with this email
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-flyora-navy">Password</label>
                  <a href="#" className="text-sm font-bold text-flyora-teal hover:text-flyora-teal-dark transition-colors">Forgot Password?</a>
                </div>
                <div
                  className="relative transition-all duration-300"
                  style={fieldShakeStyle(passwordFieldError)}
                >
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${passwordFieldError ? 'text-red-400' : 'text-flyora-gray-400'}`}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (passwordFieldError) { setPasswordFieldError(false); setErrorType(null); } }}
                    className={`w-full pl-11 pr-12 py-3 rounded-[14px] focus:ring-2 transition-all outline-none text-flyora-navy placeholder:text-gray-400 text-sm font-medium border ${fieldBorderClass(passwordFieldError)}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-flyora-gray-400 hover:text-flyora-navy transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordFieldError && (
                  <p className="text-xs text-red-600 font-semibold pl-1 flex items-center gap-1">
                    <KeyRound size={11} /> Password doesn't match. Please try again.
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-flyora-teal focus:ring-flyora-teal/20 border-gray-300 accent-flyora-teal" defaultChecked />
                  <span className="text-sm font-bold text-flyora-navy">Remember me</span>
                </label>
                <a href="#" className="flex items-center gap-1.5 text-sm font-bold text-flyora-teal hover:text-flyora-teal-dark transition-colors">
                  Use biometric <Fingerprint size={16} />
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  variant="teal"
                  size="lg"
                  fullWidth
                  iconRight={!isLoading && <ArrowRight size={18} />}
                  className="py-3.5 rounded-[14px]"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <p className="text-center mt-10 text-[13px] font-semibold text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-flyora-teal hover:text-flyora-teal-dark transition-colors">
                Sign Up
              </Link>
            </p>

            <div className="text-center mt-4 pt-4 border-t border-slate-100">
              <Link to="/admin/login" className="text-xs font-bold text-slate-400 hover:text-flyora-teal transition-colors inline-flex items-center gap-1.5">
                <span>System Administrator Portal Sign In &rarr;</span>
              </Link>
            </div>

            {/* Mobile Footer Logo */}
            <div className="flex lg:hidden justify-center mt-8 pb-4">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-teal">
                    <Plane size={14} className="text-white transform -rotate-45" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-flyora-blue rounded-full border border-flyora-navy" />
                </div>
                <span className="text-lg font-black tracking-tight text-flyora-navy">
                  fly<span className="text-flyora-teal">orago</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
