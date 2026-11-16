import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Lock, Mail, ArrowRight, ArrowLeft, KeyRound, 
  CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, RefreshCw, Sparkles 
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import Button from '../components/ui/Button';

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
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
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
      // Pasting full OTP code
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo Header */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-flyora-teal flex items-center justify-center text-white shadow-md shadow-flyora-teal/20">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-flyora-navy tracking-tight">FLYORAGO</span>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {step === 1 && 'Reset your password'}
          {step === 2 && 'Verify OTP & set password'}
          {step === 3 && 'Password successfully reset!'}
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-500 font-medium">
          {step === 1 && 'Enter your registered email address and we will send you a 6-digit verification code.'}
          {step === 2 && `Enter the 6-digit OTP code sent to ${email} and choose a strong new password.`}
          {step === 3 && 'Your account security credentials have been updated. You can now log in.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100">
          
          {/* Global Alert Messages */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && step !== 3 && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* ═══════════ STEP 1: Enter Email ═══════════ */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Account Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-flyora-teal/20 focus:border-flyora-teal transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="teal"
                fullWidth
                disabled={isLoading}
                className="py-3.5 rounded-xl font-bold text-sm shadow-md shadow-flyora-teal/25 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Security Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-flyora-teal transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* ═══════════ STEP 2: Enter OTP & New Password ═══════════ */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* 6-Digit OTP Blocks */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    6-Digit Security OTP
                  </label>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={() => handleRequestOtp()}
                    className="text-xs font-bold text-flyora-teal hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                    <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>

                <div className="flex justify-between gap-2 sm:gap-2.5">
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
                      className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-black bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-flyora-teal/30 focus:border-flyora-teal transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-flyora-teal/20 focus:border-flyora-teal transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-flyora-teal/20 focus:border-flyora-teal transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="teal"
                fullWidth
                disabled={isLoading}
                className="py-3.5 rounded-xl font-bold text-sm shadow-md shadow-flyora-teal/25 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Reset Password</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-bold text-slate-500 hover:text-flyora-teal flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>

                <Link to="/login" className="font-bold text-slate-500 hover:text-flyora-teal">
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
                <h3 className="text-lg font-black text-slate-900">Password Changed Successfully!</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Your new password is now active. Any temporary account lockouts have been reset. You can now log into your account securely.
                </p>
              </div>

              <Button
                type="button"
                variant="teal"
                fullWidth
                onClick={() => navigate('/login')}
                className="py-3.5 rounded-xl font-bold text-sm shadow-md shadow-flyora-teal/25 flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

        </div>

        {/* Enterprise Security Footer Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
          <Shield className="w-3.5 h-3.5 text-flyora-teal" />
          <span>Encrypted with End-to-End Google & Meta Enterprise Standards</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

