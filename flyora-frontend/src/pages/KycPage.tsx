import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plane, Shield, CheckCircle, AlertCircle, 
  Camera, Upload, Trash2, User, FileText, Check, 
  ShieldAlert, Loader2, RefreshCw, Lock, Sparkles, Clock
} from 'lucide-react';
import Button from '../components/ui/Button';
import { apiFetch } from '../utils/api';

const KycPage: React.FC = () => {
  const navigate = useNavigate();
  const rawUserId = localStorage.getItem('flyora_user_id');
  const userId = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' ? rawUserId : null;
  const rawUserName = localStorage.getItem('flyora_user_name');
  const userName = rawUserName && rawUserName !== 'undefined' && rawUserName !== 'null' ? rawUserName : 'User';

  useEffect(() => {
    if (rawUserId === 'undefined' || rawUserId === 'null') {
      localStorage.removeItem('flyora_user_id');
      localStorage.removeItem('flyora_user_name');
    }
  }, [rawUserId]);

  // State for current view: 'SUBMIT' or 'STATUS'
  const [viewMode, setViewMode] = useState<'SUBMIT' | 'STATUS'>('SUBMIT');
  const [kycStatus, setKycStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED'>('NOT_SUBMITTED');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Submit wizard steps: 1 (Overview), 2 (Mandatory Document Uploads), 3 (Selfie), 4 (Submitting)
  const [step, setStep] = useState(1);
  
  // Mandatory upload base64 strings
  const [idFrontImage, setIdFrontImage] = useState<string>('');
  const [idBackImage, setIdBackImage] = useState<string>('');
  const [passportImage, setPassportImage] = useState<string>('');
  const [selfieImage, setSelfieImage] = useState<string>('');

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // General loaders
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  // Fetch current KYC status
  const fetchStatus = async () => {
    if (!userId) {
      setIsPageLoading(false);
      return;
    }

    try {
      const data = await apiFetch(`/api/kyc/status/${userId}`);
      const status = data.data.status;
      setKycStatus(status);
      if (status === 'REJECTED') {
        setRejectionReason(data.data.rejectionReason || 'Documents did not meet our verification criteria.');
      }
      
      if (status === 'PENDING' || status === 'APPROVED') {
        setViewMode('STATUS');
      } else {
        setViewMode('SUBMIT');
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Attach stream when video element mounts
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
  }, [cameraActive]);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera Access Error:", err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Flip horizontally for natural selfie view
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelfieImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetDoc: 'idFront' | 'idBack' | 'passport' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (targetDoc === 'idFront') setIdFrontImage(base64String);
      if (targetDoc === 'idBack') setIdBackImage(base64String);
      if (targetDoc === 'passport') setPassportImage(base64String);
      if (targetDoc === 'selfie') setSelfieImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Submit KYC Details to API
  const handleKycSubmit = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    setSubmitProgress(15);

    try {
      setSubmitProgress(45);
      const resData = await apiFetch('/api/kyc/submit/', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          documentType: 'national_id_and_passport',
          frontImage: idFrontImage,
          backImage: idBackImage,
          passportImage: passportImage,
          selfieImage,
        }),
      });

      setSubmitProgress(100);
      setTimeout(() => {
        setKycStatus('PENDING');
        setViewMode('STATUS');
        setIsSubmitting(false);
      }, 500);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to submit verification. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setIdFrontImage('');
    setIdBackImage('');
    setPassportImage('');
    setSelfieImage('');
    setStep(1);
    setViewMode('SUBMIT');
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-flyora-navy mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6 text-sm">Please sign up first before accessing the KYC Verification flow.</p>
          <Link to="/signup">
            <Button variant="teal" fullWidth>Go to Sign Up</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 size={40} className="text-flyora-teal animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-bold">Securing session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      {/* Premium Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center shadow-teal">
              <Plane size={18} className="text-white transform -rotate-45" />
            </div>
            <span className="text-xl font-black text-flyora-navy">fly<span className="text-flyora-teal">orago</span></span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <Shield size={14} className="text-flyora-teal" />
              <span>Secure 256-bit Encryption</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-slate-700 hover:text-flyora-teal bg-slate-100 hover:bg-teal-50 border border-slate-200 px-4 py-2 rounded-full transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Skip for now</span> &rarr;
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {viewMode === 'SUBMIT' ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
            {/* Progress indicators */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <div>
                <span className="text-xs font-bold text-flyora-teal uppercase tracking-wider">Step {step} of 3</span>
                <h1 className="text-xl sm:text-2xl font-bold text-flyora-navy">
                  {step === 1 && 'Verification Overview'}
                  {step === 2 && 'Upload Mandatory Identity Documents'}
                  {step === 3 && 'Take a Live Selfie'}
                </h1>
              </div>
              
              {/* Dots */}
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      s === step ? 'w-8 bg-flyora-teal' : s < step ? 'w-2.5 bg-flyora-teal/40' : 'w-2.5 bg-gray-200'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Mandatory Requirements Overview */}
            {step === 1 && (
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Welcome, <span className="font-bold text-flyora-navy">{userName}</span>. To comply with global shipping standards and unlock traveler features, <span className="font-bold text-slate-800">both National ID Card and International Passport are mandatory.</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* National ID card card */}
                  <div className="border-2 border-flyora-teal bg-flyora-teal/5 rounded-2xl p-6 flex flex-col justify-between h-44 shadow-sm relative">
                    <div className="absolute top-4 right-4 bg-teal-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                      Mandatory
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-flyora-teal text-white flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-flyora-navy text-base">1. National ID Card</h3>
                      <p className="text-xs text-gray-500 mt-1">Both Front Side & Back Side photos required.</p>
                    </div>
                  </div>

                  {/* Passport card */}
                  <div className="border-2 border-flyora-teal bg-flyora-teal/5 rounded-2xl p-6 flex flex-col justify-between h-44 shadow-sm relative">
                    <div className="absolute top-4 right-4 bg-teal-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                      Mandatory
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-flyora-teal text-white flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-flyora-navy text-base">2. International Passport</h3>
                      <p className="text-xs text-gray-500 mt-1">Clear photo of Passport Bio Page required.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs text-blue-800 mt-4 leading-relaxed font-semibold">
                  <Shield size={18} className="text-blue-500 shrink-0" />
                  <p>Both documents are strictly required for security verification. All files are securely encrypted and kept private.</p>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="text-xs font-bold text-slate-500 hover:text-flyora-teal underline"
                  >
                    Skip for now
                  </button>
                  <Button variant="teal" className="px-8 py-3" onClick={() => setStep(2)}>
                    Start Uploads &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Mandatory File Uploads */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900 font-bold">
                  <Lock size={16} className="text-amber-600 shrink-0" />
                  <span>Both National ID Card (Front & Back) AND Passport Bio Page must be uploaded to proceed.</span>
                </div>

                {/* SECTION 1: National ID Card */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileText size={18} className="text-flyora-teal" />
                    <h3 className="font-bold text-flyora-navy text-base">Section 1: National ID Card (Required)</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ID Front Side */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                        <span>National ID Front Side *</span>
                        {idFrontImage && <span className="text-emerald-600 font-bold text-[10px]">✓ Uploaded</span>}
                      </label>
                      
                      {idFrontImage ? (
                        <div className="relative border border-gray-200 rounded-2xl overflow-hidden h-36 bg-gray-50 flex items-center justify-center">
                          <img src={idFrontImage} alt="ID Front Preview" className="h-full object-contain" />
                          <button 
                            type="button"
                            onClick={() => setIdFrontImage('')}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-gray-200 hover:border-flyora-teal rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 h-36 bg-gray-50/50 hover:bg-white group">
                          <Upload size={22} className="text-gray-400 group-hover:text-flyora-teal mb-2 transition-colors" />
                          <span className="text-xs font-bold text-flyora-navy group-hover:text-flyora-teal transition-colors">Upload ID Front</span>
                          <span className="text-[10px] text-gray-400 mt-1">JPG, PNG up to 10MB</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'idFront')} 
                          />
                        </label>
                      )}
                    </div>

                    {/* ID Back Side */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                        <span>National ID Back Side *</span>
                        {idBackImage && <span className="text-emerald-600 font-bold text-[10px]">✓ Uploaded</span>}
                      </label>
                      
                      {idBackImage ? (
                        <div className="relative border border-gray-200 rounded-2xl overflow-hidden h-36 bg-gray-50 flex items-center justify-center">
                          <img src={idBackImage} alt="ID Back Preview" className="h-full object-contain" />
                          <button 
                            type="button"
                            onClick={() => setIdBackImage('')}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-gray-200 hover:border-flyora-teal rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 h-36 bg-gray-50/50 hover:bg-white group">
                          <Upload size={22} className="text-gray-400 group-hover:text-flyora-teal mb-2 transition-colors" />
                          <span className="text-xs font-bold text-flyora-navy group-hover:text-flyora-teal transition-colors">Upload ID Back</span>
                          <span className="text-[10px] text-gray-400 mt-1">JPG, PNG up to 10MB</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'idBack')} 
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: International Passport */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User size={18} className="text-flyora-teal" />
                    <h3 className="font-bold text-flyora-navy text-base">Section 2: International Passport (Required)</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                      <span>Passport Bio Page (Photo & Passport No.) *</span>
                      {passportImage && <span className="text-emerald-600 font-bold text-[10px]">✓ Uploaded</span>}
                    </label>
                    
                    {passportImage ? (
                      <div className="relative border border-gray-200 rounded-2xl overflow-hidden h-40 bg-gray-50 flex items-center justify-center">
                        <img src={passportImage} alt="Passport Preview" className="h-full object-contain" />
                        <button 
                          type="button"
                          onClick={() => setPassportImage('')}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-200 hover:border-flyora-teal rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 h-40 bg-gray-50/50 hover:bg-white group">
                        <Upload size={24} className="text-gray-400 group-hover:text-flyora-teal mb-2 transition-colors" />
                        <span className="text-xs font-bold text-flyora-navy group-hover:text-flyora-teal transition-colors">Upload Passport Bio Page Photo</span>
                        <span className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG, or PDF up to 10MB</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'passport')} 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                  <Button variant="secondary" className="px-6 py-3" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button 
                    variant="teal" 
                    className="px-8 py-3" 
                    onClick={() => setStep(3)}
                    disabled={!idFrontImage || !idBackImage || !passportImage}
                  >
                    Continue to Live Selfie &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Live Selfie Capture */}
            {step === 3 && (
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Please take a live selfie using your device's camera to verify that your face matches both uploaded identity documents.
                </p>

                <div className="flex flex-col items-center justify-center py-4">
                  {selfieImage ? (
                    // Captured image preview
                    <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-flyora-teal shadow-lg bg-gray-50">
                      <img src={selfieImage} alt="Selfie Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setSelfieImage('')}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-red-500 text-white font-bold text-xs shadow-md hover:bg-red-600 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={12} />
                        Retake Photo
                      </button>
                    </div>
                  ) : cameraActive ? (
                    // Active video feed
                    <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-flyora-teal shadow-lg bg-black">
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover scale-x-[-1]"
                        autoPlay
                        playsInline
                        muted
                      />
                      <button 
                        type="button"
                        onClick={capturePhoto}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white text-flyora-teal flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                      >
                        <Camera size={22} />
                      </button>
                    </div>
                  ) : (
                    // Camera start option
                    <div className="flex flex-col items-center gap-4 w-full max-w-md">
                      <button 
                        type="button"
                        onClick={startCamera}
                        className="w-64 h-64 rounded-full border-4 border-dashed border-gray-200 hover:border-flyora-teal flex flex-col items-center justify-center bg-gray-50 hover:bg-white cursor-pointer transition-all duration-200 group shadow-sm"
                      >
                        <Camera size={40} className="text-gray-400 group-hover:text-flyora-teal mb-2 transition-colors" />
                        <span className="text-sm font-bold text-flyora-navy group-hover:text-flyora-teal transition-colors">Start Live Camera</span>
                        <span className="text-xs text-gray-400 mt-1">Live Face Capture Required</span>
                      </button>
                    </div>
                  )}

                  {cameraError && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold rounded-xl text-center">
                      Could not access camera. Please check your camera connection and allow camera permissions in your browser.
                    </div>
                  )}
                </div>

                <div className="pt-6 flex justify-between">
                  <Button variant="secondary" className="px-6 py-3" onClick={() => {
                    stopCamera();
                    setStep(2);
                  }}>
                    Back
                  </Button>
                  <Button 
                    variant="teal" 
                    className="px-8 py-3" 
                    onClick={handleKycSubmit}
                    disabled={!selfieImage || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Submitting...
                      </span>
                    ) : (
                      'Submit Mandatory KYC Documents'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STATUS VIEW */
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto">
            {kycStatus === 'PENDING' && (
              <>
                <div className="w-20 h-20 bg-amber-50 border border-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Clock size={40} className="animate-pulse" />
                </div>
                <span className="text-xs font-extrabold tracking-widest text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full uppercase border border-amber-200/60 inline-block mb-3">
                  Verification Pending
                </span>
                <h2 className="text-2xl font-bold text-flyora-navy mb-3">KYC Under Review</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Your National ID and International Passport documents have been submitted and are currently being reviewed by our verification team. This usually takes 12–24 hours.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" className="px-6 py-2.5" onClick={() => navigate('/dashboard')}>
                    Return to Dashboard
                  </Button>
                </div>
              </>
            )}

            {kycStatus === 'APPROVED' && (
              <>
                <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle size={40} />
                </div>
                <span className="text-xs font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full uppercase border border-emerald-200/60 inline-block mb-3">
                  KYC Verified
                </span>
                <h2 className="text-2xl font-bold text-flyora-navy mb-3">Identity Verified!</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Congratulations, <span className="font-bold text-flyora-navy">{userName}</span>. Both your National ID and Passport have been approved. You have full access to create trips and package requests.
                </p>
                <Button variant="teal" className="px-8 py-3" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard &rarr;
                </Button>
              </>
            )}

            {kycStatus === 'REJECTED' && (
              <>
                <div className="w-20 h-20 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <AlertCircle size={40} />
                </div>
                <span className="text-xs font-extrabold tracking-widest text-red-600 bg-red-50 px-3.5 py-1 rounded-full uppercase border border-red-200/60 inline-block mb-3">
                  Verification Failed
                </span>
                <h2 className="text-2xl font-bold text-flyora-navy mb-3">Submission Declined</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  We were unable to verify your identification documents due to:
                </p>
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-xs font-bold text-red-700 mb-8 text-left">
                  "{rejectionReason}"
                </div>
                <Button variant="teal" className="px-8 py-3" onClick={handleRetry}>
                  Re-submit Both Documents &rarr;
                </Button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 px-6 text-center text-xs text-gray-400">
        © 2026 Flyorago. All global identity verification data is strictly protected.
      </footer>
    </div>
  );
};

export default KycPage;
