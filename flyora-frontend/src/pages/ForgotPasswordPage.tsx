import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Lock, Mail, ArrowRight, ArrowLeft, KeyRound,
  CheckCircle2, AlertCircle, Eye, EyeOff, RefreshCw, Plane
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import Button from '../components/ui/Button';
import { SeoHead } from '../components/seo/SeoHead';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Steps:
  // Step 1: Enter Email -> sends OTP
  // Step 2: Enter 6-digit OTP & New Password -> resets password
  // Step 3: Success Confirmation -> redirect to /login
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  // Handle Step 1: Send Password Reset OTP to Email
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your registered account email.');
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/api/auth/request-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          purpose: 'password_reset'
        })
      });

      setSuccessMsg(`A 6-digit security reset code has been dispatched to ${cleanEmail}`);
      setResendCooldown(60);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'No active account found with this email, or network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP inputs handling
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = pasted[i] || '';
        }
        setOtp(newOtp);
        const nextIdx = Math.min(pasted.length, 5);
        document.getElementById(`otp-input-${nextIdx}`)?.focus();
        return;
      }
    }

    const cleanVal = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  // Handle Step 2: Submit OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/api/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullOtp,
          new_password: newPassword
        })
      });

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code. Please verify or request a new code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SeoHead
        title="Reset Password | Flyorago"
        description="Reset your Flyorago account password securely."
        path="/forgot-password"
        noindex
      />

      <div className="min-h-screen flex flex-col lg:flex-row w-full bg-white">
        {/* ── Left Visual Panel (Matches Login & Signup Split Layout) ── */}
        <div className="hidden lg:flex lg:w-[60%] relative bg-black overflow-hidden p-12 lg:p-16">
          <img
            src="/images/login-page.webp"
            alt="Flyorago secure account recovery"
            width={1280}
            height={853}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/50" />

          <div className="relative z-10 w-full h-full flex flex-col justify-between">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-teal group-hover:shadow-[0_8px_25px_rgba(13,148,136,0.5)] transition-all duration-300">
                  <Plane size={20} className="text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-flyora-blue rounded-full border-2 border-flyora-navy" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                fly<span className="text-flyora-teal">orago</span>
              </span>
            </Link>

            <div className="max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-flyora-teal/25 border border-flyora-teal/40 text-flyora-teal-bright text-[11px] font-bold uppercase tracking-wider mb-3">
                <Shield size={12} /> Account Protection
              </div>
              <h2 className="text-2xl font-black leading-snug mb-2">
                Secure OTP Password Recovery
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Verify ownership via a one-time 6-digit code sent to your registered email before updating your Flyorago credentials.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Side Form Panel ── */}
        <div className="w-full lg:w-[40%] flex flex-col items-center lg:justify-center p-0 lg:p-10 xl:p-12 relative bg-gray-50 lg:bg-white overflow-y-auto">
          {/* Mobile Image Header */}
          <div className="lg:hidden w-full relative overflow-hidden" style={{ height: '24vh', minHeight: '160px' }}>
            <img
              src="/images/login-page.webp"
              alt="Flyorago password recovery"
              width={1280}
              height={853}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 flex justify-between items-center px-5 pt-6 z-10">
              <Link
                to="/login"
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
                aria-label="Back to login"
              >
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
            <Link to="/contact" className="text-sm font-bold text-flyora-teal hover:text-flyora-teal-dark transition-colors">
              Need help?
            </Link>
          </div>

          {/* Form Container */}
          <div className="w-full max-w-[420px] px-6 py-8 lg:p-0 bg-white lg:bg-transparent relative z-20 flex-1 lg:flex-none flex flex-col justify-center">
            {/* Brand + Title */}
            <div className="text-center mb-7 flex flex-col items-center">
              <Link to="/" className="hidden lg:flex items-center gap-2.5 group mb-5 w-fit">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-teal">
                    <Plane size={18} className="text-white transform -rotate-45" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-flyora-blue rounded-full border-2 border-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-flyora-navy">
                  fly<span className="text-flyora-teal">orago</span>
                </span>
              </Link>

              {/* Step Progress Bar */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === s
                        ? 'w-8 bg-flyora-teal'
                        : step > s
                        ? 'w-5 bg-emerald-500'
                        : 'w-5 bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <h1 className="text-2xl sm:text-[28px] font-bold text-flyora-navy mb-2 tracking-tight">
                {step === 1 && 'Reset your password'}
                {step === 2 && 'Verify OTP & set password'}
                {step === 3 && 'Password reset complete'}
              </h1>
              <p className="text-flyora-gray-500 text-sm font-medium leading-relaxed">
                {step === 1 && 'Enter your registered email address and we will send a 6-digit verification code.'}
                {step === 2 && `Enter the 6-digit code sent to ${email} and choose a strong new password.`}
                {step === 3 && 'Your Flyorago account password has been updated securely.'}
              </p>
            </div>

            {/* Global Alert Messages */}
            {errorMsg && (
              <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs font-bold">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {successMsg && step !== 3 && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{successMsg}</div>
              </div>
            )}

            {/* ═══════════ STEP 1: Enter Email ═══════════ */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-flyora-navy block">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-flyora-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-[14px] text-flyora-navy text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-flyora-teal/20 focus:border-flyora-teal transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="teal"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  iconRight={<ArrowRight size={17} />}
                >
                  {isLoading ? 'Sending Security Code...' : 'Send Verification Code'}
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs font-bold">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-gray-500 hover:text-flyora-navy transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="text-flyora-teal hover:text-flyora-teal-dark transition-colors"
                  >
                    Create account
                  </Link>
                </div>
              </form>
            )}

            {/* ═══════════ STEP 2: Enter OTP & New Password ═══════════ */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-flyora-navy uppercase tracking-wider">
                      6-Digit Security OTP
                    </label>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={() => handleRequestOtp()}
                      className="text-xs font-bold text-flyora-teal hover:underline disabled:text-slate-400 disabled:no-underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-full h-12 sm:h-13 text-center text-lg font-black bg-white border border-gray-200 rounded-xl text-flyora-navy focus:outline-none focus:ring-2 focus:ring-flyora-teal/25 focus:border-flyora-teal transition-all"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-flyora-navy block">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-flyora-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-[14px] text-flyora-navy text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-flyora-teal/20 focus:border-flyora-teal transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-flyora-navy block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-flyora-gray-400">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-[14px] text-flyora-navy text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-flyora-teal/20 focus:border-flyora-teal transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="teal"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  iconRight={<CheckCircle2 size={17} />}
                >
                  {isLoading ? 'Updating Password...' : 'Confirm & Reset Password'}
                </Button>

                <div className="flex justify-between items-center pt-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-flyora-teal inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} />
                    <span>Change Email</span>
                  </button>

                  <Link to="/login" className="text-gray-500 hover:text-flyora-navy">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}

            {/* ═══════════ STEP 3: Success Confirmation ═══════════ */}
            {step === 3 && (
              <div className="text-center py-4 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-flyora-navy">Password Changed Successfully!</h2>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Your new password is active and any temporary lockouts have been cleared. You can sign in now.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="teal"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/login')}
                  iconRight={<ArrowRight size={17} />}
                >
                  Proceed to Sign In
                </Button>
              </div>
            )}

            <div className="mt-7 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] font-semibold text-gray-400">
              <Shield className="w-3.5 h-3.5 text-flyora-teal" />
              <span>Protected with encrypted OTP verification</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
