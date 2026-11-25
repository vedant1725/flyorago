import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Storage, STORAGE_KEYS } from '../services/storage';
import { apiFetch, UserProfile } from '../services/api';

interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  currentRole: 'sender' | 'traveler';
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; errorCode?: string | null; errors?: any; isVerified?: boolean; email?: string }>;
  loginWithGoogle: (credential?: string, directPayload?: { access_token?: string; email?: string; name?: string; picture?: string }) => Promise<{ success: boolean; message?: string }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: 'sender' | 'traveler') => Promise<void>;
  updateKycStatus: (status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED') => Promise<void>;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<'sender' | 'traveler'>('sender');
  const [kycStatus, setKycStatus] = useState<'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NOT_SUBMITTED');

  // Load stored credentials on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const storedUserId = await Storage.getItem(STORAGE_KEYS.USER_ID);
        const storedName = await Storage.getItem(STORAGE_KEYS.USER_NAME);
        const storedEmail = await Storage.getItem(STORAGE_KEYS.USER_EMAIL);
        const storedRole = (await Storage.getItem(STORAGE_KEYS.USER_ROLE)) as 'sender' | 'traveler' | null;
        const storedKyc = (await Storage.getItem(STORAGE_KEYS.KYC_STATUS)) as any;

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUser({
            id: storedUserId,
            fullName: storedName || 'Flyora Member',
            email: storedEmail || '',
            role: storedRole || 'sender',
            kycStatus: storedKyc || 'APPROVED',
            trustScore: 4.9,
            completedDeliveries: 12,
            completedTrips: 8,
          });
          if (storedRole === 'traveler' || storedRole === 'sender') {
            setCurrentRole(storedRole);
          }
          if (storedKyc) {
            setKycStatus(storedKyc);
          }
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (!res.success) {
        setIsLoading(false);
        const errorCode = res?.errors?.error_code || null;
        return {
          success: false,
          message: res.message || 'Login failed.',
          errorCode: errorCode,
          errors: res.errors,
        };
      }

      const resData = res.data;
      const isVerified = resData?.is_verified ?? resData?.user?.is_verified ?? true;

      // If user has not completed OTP email verification yet, DO NOT persist session
      // Return isVerified: false so the UI can redirect directly to the OTP verification screen
      if (isVerified === false) {
        setIsLoading(false);
        return {
          success: false,
          isVerified: false,
          email: cleanEmail,
          message: 'Please verify your email address to activate your account.',
        };
      }

      const accessToken = resData?.tokens?.access || resData?.accessToken || 'demo_token';
      const refreshToken = resData?.tokens?.refresh || '';
      const userId = String(resData?.userId || resData?.user?.id || 'usr-1');
      const fullName = resData?.fullName || resData?.user?.fullName || `${resData?.user?.first_name || ''} ${resData?.user?.last_name || ''}`.trim() || 'Flyora User';
      const userRole = (resData?.role || resData?.user?.role || 'sender') as 'sender' | 'traveler';
      const userKyc = (resData?.kycStatus || resData?.profile?.kyc_status || 'APPROVED').toUpperCase() as any;

      await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await Storage.setItem(STORAGE_KEYS.USER_ID, userId);
      await Storage.setItem(STORAGE_KEYS.USER_NAME, fullName);
      await Storage.setItem(STORAGE_KEYS.USER_EMAIL, cleanEmail);
      await Storage.setItem(STORAGE_KEYS.USER_ROLE, userRole);
      await Storage.setItem(STORAGE_KEYS.KYC_STATUS, userKyc);

      setToken(accessToken);
      setUser({
        id: userId,
        fullName,
        email: cleanEmail,
        role: userRole,
        kycStatus: userKyc,
        trustScore: 4.95,
        completedDeliveries: 14,
        completedTrips: 9,
      });
      setCurrentRole(userRole === 'traveler' ? 'traveler' : 'sender');
      setKycStatus(userKyc);

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'An unexpected error occurred.' };
    }
  };

  const loginWithGoogle = async (credential?: string, directPayload?: { access_token?: string; email?: string; name?: string; picture?: string }) => {
    setIsLoading(true);
    try {
      let resData: any = null;
      let requestBody: any = null;

      if (credential) {
        requestBody = { credential };
      } else if (directPayload) {
        requestBody = directPayload;
      }

      if (requestBody) {
        const res = await apiFetch('/api/auth/google/', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });
        if (res.success && res.data) {
          resData = res.data;
        } else if (!res.success) {
          setIsLoading(false);
          return { success: false, message: res.message || 'Google authentication failed on server.' };
        }
      }

      if (!resData) {
        setIsLoading(false);
        return { success: false, message: 'Could not obtain user profile from Google.' };
      }

      const accessToken = resData?.tokens?.access || resData?.accessToken || `google_token_${Date.now()}`;
      const refreshToken = resData?.tokens?.refresh || resData?.refreshToken;
      const userId = String(resData?.userId || resData?.user?.id || 'usr-google');
      const fullName = resData?.fullName || resData?.user?.name || resData?.user?.fullName || 'Google Member';
      const email = resData?.email || resData?.user?.email || 'member@gmail.com';
      const role: 'sender' | 'traveler' = (resData?.role || resData?.user?.role || 'sender') as any;
      const kycStatus = (resData?.kycStatus || 'APPROVED').toUpperCase() as any;

      await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      await Storage.setItem(STORAGE_KEYS.USER_ID, userId);
      await Storage.setItem(STORAGE_KEYS.USER_NAME, fullName);
      await Storage.setItem(STORAGE_KEYS.USER_EMAIL, email);
      await Storage.setItem(STORAGE_KEYS.USER_ROLE, role);
      await Storage.setItem(STORAGE_KEYS.KYC_STATUS, kycStatus);

      setToken(accessToken);
      setUser({
        id: userId,
        fullName,
        email,
        role,
        kycStatus,
        trustScore: 4.96,
        completedDeliveries: 16,
        completedTrips: 9,
      });
      setCurrentRole(role);
      setKycStatus(kycStatus);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Google authentication failed.' };
    }
  };

  const signup = async (payload: SignupPayload) => {
    try {
      const cleanPhone = payload.phone?.trim();
      const bodyPayload: any = {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      };

      if (cleanPhone && cleanPhone.length > 4) {
        bodyPayload.phone_number = cleanPhone;
      }

      const res = await apiFetch('/api/auth/signup/', {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
      });

      if (!res.success) {
        let msg = res.message || 'Registration failed.';
        if (res.errors) {
          const firstErrKey = Object.keys(res.errors)[0];
          const firstErrVal = res.errors[firstErrKey];
          if (Array.isArray(firstErrVal) && firstErrVal.length > 0) {
            msg = firstErrVal[0];
          } else if (typeof firstErrVal === 'string') {
            msg = firstErrVal;
          }
        }
        return { success: false, message: msg };
      }

      return { success: true, message: 'Account registered. Verification code sent.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during sign up.' };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await apiFetch('/api/auth/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      if (!res.success) {
        return { success: false, message: res.message || 'Invalid or expired OTP.' };
      }

      const resData = res.data;
      if (resData?.tokens?.access) {
        const accessToken = resData.tokens.access;
        const userId = String(resData.userId || 'usr-reg');
        const fullName = resData.fullName || 'Verified Member';

        await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await Storage.setItem(STORAGE_KEYS.USER_ID, userId);
        await Storage.setItem(STORAGE_KEYS.USER_NAME, fullName);
        await Storage.setItem(STORAGE_KEYS.USER_EMAIL, email);
        await Storage.setItem(STORAGE_KEYS.KYC_STATUS, 'NOT_SUBMITTED');

        setToken(accessToken);
        setUser({
          id: userId,
          fullName,
          email,
          role: 'sender',
          kycStatus: 'NOT_SUBMITTED',
        });
        setKycStatus('NOT_SUBMITTED');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'OTP verification failed.' };
    }
  };

  const quickDemoLogin = async (role: 'sender' | 'traveler') => {
    setIsLoading(true);
    const isSender = role === 'sender';
    const demoUser: UserProfile = {
      id: isSender ? 'usr-sender-demo' : 'usr-traveler-demo',
      fullName: isSender ? 'Vedant Panchal' : 'Akash Sharma',
      email: isSender ? 'sender@flyorago.me' : 'traveler@flyorago.me',
      role,
      kycStatus: 'APPROVED',
      trustScore: 4.96,
      completedDeliveries: isSender ? 18 : 6,
      completedTrips: isSender ? 2 : 24,
    };

    const dummyToken = 'flyora_demo_authenticated_session';
    await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, dummyToken);
    await Storage.setItem(STORAGE_KEYS.USER_ID, demoUser.id);
    await Storage.setItem(STORAGE_KEYS.USER_NAME, demoUser.fullName);
    await Storage.setItem(STORAGE_KEYS.USER_EMAIL, demoUser.email);
    await Storage.setItem(STORAGE_KEYS.USER_ROLE, role);
    await Storage.setItem(STORAGE_KEYS.KYC_STATUS, 'APPROVED');

    setToken(dummyToken);
    setUser(demoUser);
    setCurrentRole(role);
    setKycStatus('APPROVED');
    setIsLoading(false);
  };

  const updateKycStatus = async (status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED') => {
    setKycStatus(status);
    await Storage.setItem(STORAGE_KEYS.KYC_STATUS, status);
    if (user) {
      setUser({ ...user, kycStatus: status });
    }
  };

  const switchRole = () => {
    const nextRole = currentRole === 'sender' ? 'traveler' : 'sender';
    setCurrentRole(nextRole);
    Storage.setItem(STORAGE_KEYS.USER_ROLE, nextRole);
  };

  const logout = async () => {
    await Storage.clearAuthSession();
    setToken(null);
    setUser(null);
    setKycStatus('NOT_SUBMITTED');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        kycStatus,
        currentRole,
        login,
        loginWithGoogle,
        signup,
        verifyOtp,
        logout,
        quickDemoLogin,
        updateKycStatus,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
