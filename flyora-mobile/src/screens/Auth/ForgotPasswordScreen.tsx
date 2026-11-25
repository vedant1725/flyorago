import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../services/api';
import {
  scale,
  verticalScale,
  moderateScale,
  fontScale,
  getSafeHeaderPaddingTop,
} from '../../constants/responsive';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
}) => {
  const insets = useSafeAreaInsets();

  // Wizard Steps:
  // 1: Enter email -> calls /api/auth/request-otp/ with purpose: 'password_reset'
  // 2: Enter 6-digit OTP & new password -> calls /api/auth/reset-password/
  // 3: Success Screen with confirmation -> return to login
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & loaders
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered account email.');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/request-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: cleanEmail,
          purpose: 'password_reset',
        }),
      });

      setLoading(false);
      if (res.success) {
        setSuccessMessage(`A 6-digit security code has been sent to ${cleanEmail}`);
        setResendCooldown(60);
        setStep(2);
      } else {
        setErrorMessage(res.message || 'No account found with this email address.');
        triggerShake();
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Network error. Please try again.');
      triggerShake();
    }
  };

  // Step 2: Resend Reset OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setErrorMessage('');
    try {
      const res = await apiFetch('/api/auth/request-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: 'password_reset',
        }),
      });
      setResending(false);
      if (res.success) {
        setResendCooldown(60);
        setSuccessMessage('A fresh verification code was dispatched to your email.');
      } else {
        setErrorMessage(res.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setResending(false);
      setErrorMessage(err.message || 'Error resending verification code.');
    }
  };

  // Step 2: Submit Reset Password with OTP
  const handleResetPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      triggerShake();
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      triggerShake();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/reset-password/', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otpCode.trim(),
          new_password: newPassword,
        }),
      });

      setLoading(false);
      if (res.success) {
        setStep(3);
      } else {
        setErrorMessage(res.message || 'Invalid or expired OTP code. Please request a new code.');
        triggerShake();
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Failed to reset password. Please try again.');
      triggerShake();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Aqua Water Fluid Gradient: Deep Aqua Water-Green blending into crisp Pure White */}
      <LinearGradient
        colors={['#A7F3D0', '#CCFBF1', '#E6FAF6', '#F4FBF9', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.18, 0.38, 0.6, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Water Glow Waves & Plane Watermark */}
      <View style={styles.waterGlowCircle} pointerEvents="none" />
      <View style={styles.planeArtWrap} pointerEvents="none">
        <ExpoImage
          source={require('../../../assets/images/home-header-plane.png')}
          style={styles.planeArt}
          contentFit="contain"
          priority="high"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: getSafeHeaderPaddingTop(insets.top) + 4 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.innerContentWrap}>
            {/* Top Bar with Back Button */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={onNavigateToLogin}
                hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={moderateScale(20)} color="#0D9488" />
              </TouchableOpacity>
              <View style={{ width: moderateScale(38) }} />
            </View>

            {/* Original Official Flyorago 3D Box & Flight Logo */}
            <View style={styles.logoBlock}>
              <ExpoImage
                source={require('../../../assets/images/flyorago-original-symbol.png')}
                style={styles.originalLogo}
                contentFit="contain"
                priority="high"
              />
              <Text style={styles.brandTitleText}>
                FLYORA<Text style={styles.brandTitleAccent}>GO</Text>
              </Text>
            </View>

            {/* ─── STEP 1: ENTER EMAIL ─── */}
            {step === 1 && (
              <View style={styles.formContainer}>
                {/* Heading Block */}
                <View style={styles.headingBlock}>
                  <View style={styles.pillBadge}>
                    <Ionicons name="key-outline" size={moderateScale(12)} color="#0D9488" />
                    <Text style={styles.pillBadgeText}>Account Recovery</Text>
                  </View>
                  <Text style={styles.welcomeTitle}>Forgot Password?</Text>
                  <Text style={styles.welcomeSub}>
                    Enter your registered email address to receive an official 6-digit security code
                  </Text>
                </View>

                {/* Error Banner */}
                {errorMessage ? (
                  <Animated.View
                    style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}
                  >
                    <Ionicons name="alert-circle" size={moderateScale(18)} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </Animated.View>
                ) : null}

                {/* Email Field */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>REGISTERED EMAIL ADDRESS</Text>
                  <View style={styles.inputAquaGlass}>
                    <View style={styles.inputIconCircle}>
                      <Ionicons name="mail-outline" size={moderateScale(17)} color="#0D9488" />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="name@example.com"
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errorMessage) setErrorMessage('');
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Send Reset Code Button */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleRequestOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#0D9488', '#0F766E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.btnContent}>
                        <Text style={styles.actionBtnText}>Send Reset Code</Text>
                        <Ionicons name="arrow-forward" size={moderateScale(17)} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Footer Back to Login */}
                <View style={styles.footerRow}>
                  <Text style={styles.footerPrompt}>Remembered your password? </Text>
                  <TouchableOpacity onPress={onNavigateToLogin}>
                    <Text style={styles.footerLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ─── STEP 2: ENTER OTP & NEW PASSWORD ─── */}
            {step === 2 && (
              <View style={styles.formContainer}>
                {/* Heading Block */}
                <View style={styles.headingBlock}>
                  <View style={styles.pillBadge}>
                    <Ionicons name="shield-checkmark-outline" size={moderateScale(12)} color="#0D9488" />
                    <Text style={styles.pillBadgeText}>Security Verification</Text>
                  </View>
                  <Text style={styles.welcomeTitle}>Set New Password</Text>
                  <Text style={styles.welcomeSub}>
                    Enter the 6-digit code sent to{' '}
                    <Text style={{ fontWeight: '800', color: '#0D9488' }}>{email}</Text> and choose a new password
                  </Text>
                </View>

                {/* Success Message Banner */}
                {successMessage ? (
                  <View style={styles.successBox}>
                    <Ionicons name="checkmark-circle" size={moderateScale(17)} color="#0D9488" />
                    <Text style={styles.successText}>{successMessage}</Text>
                  </View>
                ) : null}

                {/* Error Banner */}
                {errorMessage ? (
                  <Animated.View
                    style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}
                  >
                    <Ionicons name="alert-circle" size={moderateScale(18)} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </Animated.View>
                ) : null}

                {/* 6-Digit OTP Field */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>6-DIGIT SECURITY CODE</Text>
                  <TextInput
                    style={styles.otpInputField}
                    placeholder="• • • • • •"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={(text) => {
                      setOtpCode(text);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                </View>

                {/* New Password */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>NEW PASSWORD (MIN. 8 CHARS)</Text>
                  <View style={styles.inputAquaGlass}>
                    <View style={styles.inputIconCircle}>
                      <Ionicons name="lock-closed-outline" size={moderateScale(17)} color="#0D9488" />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="At least 8 characters"
                      placeholderTextColor="#94A3B8"
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (errorMessage) setErrorMessage('');
                      }}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={moderateScale(18)}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm New Password */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>CONFIRM NEW PASSWORD</Text>
                  <View style={styles.inputAquaGlass}>
                    <View style={styles.inputIconCircle}>
                      <Ionicons name="shield-checkmark-outline" size={moderateScale(17)} color="#0D9488" />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-enter new password"
                      placeholderTextColor="#94A3B8"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errorMessage) setErrorMessage('');
                      }}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={moderateScale(18)}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#0D9488', '#0F766E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.btnContent}>
                        <Text style={styles.actionBtnText}>Update Password</Text>
                        <Ionicons name="checkmark-circle-outline" size={moderateScale(18)} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend Code Option */}
                <TouchableOpacity
                  style={styles.resendCodeRow}
                  onPress={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                >
                  {resending ? (
                    <ActivityIndicator size="small" color="#0D9488" />
                  ) : (
                    <>
                      <Ionicons
                        name="refresh-outline"
                        size={moderateScale(16)}
                        color={resendCooldown > 0 ? '#94A3B8' : '#0D9488'}
                      />
                      <Text
                        style={[
                          styles.resendCodeText,
                          resendCooldown > 0 && { color: '#94A3B8' },
                        ]}
                      >
                        {resendCooldown > 0
                          ? `Resend code in ${resendCooldown}s`
                          : 'Resend Verification Code'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Change Email Button */}
                <TouchableOpacity
                  style={styles.changeEmailBtn}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.changeEmailText}>Change Email Address</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ─── STEP 3: SUCCESS CONFIRMATION ─── */}
            {step === 3 && (
              <View style={styles.successContainer}>
                {/* Floating Success Glow Badge */}
                <View style={styles.successGlowWrap}>
                  <View style={styles.successGlowHalo} />
                  <View style={styles.successIconCircle}>
                    <Ionicons name="checkmark-done" size={moderateScale(42)} color="#0D9488" />
                  </View>
                </View>

                <View style={styles.successPill}>
                  <Ionicons name="shield-checkmark" size={moderateScale(13)} color="#0D9488" />
                  <Text style={styles.successPillText}>Password Updated</Text>
                </View>

                <Text style={styles.successTitle}>Reset Successful!</Text>
                <Text style={styles.successDesc}>
                  Your FlyoraGo account security credentials have been updated. You can now sign in with your new password.
                </Text>

                {/* Primary Sign In Button - Fully Responsive */}
                <TouchableOpacity
                  style={styles.successActionBtn}
                  onPress={onNavigateToLogin}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#0D9488', '#0F766E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    <View style={styles.btnContent}>
                      <Text
                        style={styles.successBtnText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        Sign In Now
                      </Text>
                      <Ionicons name="arrow-forward" size={moderateScale(17)} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(40),
    alignItems: 'center',
  },
  innerContentWrap: {
    width: '100%',
    maxWidth: 480,
  },
  waterGlowCircle: {
    position: 'absolute',
    top: -50,
    left: -60,
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: 'rgba(45, 212, 191, 0.25)',
    zIndex: 0,
  },
  planeArtWrap: {
    position: 'absolute',
    top: verticalScale(15),
    right: -25,
    width: scale(240),
    height: scale(240),
    opacity: 0.14,
    zIndex: 0,
  },
  planeArt: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
    zIndex: 2,
  },
  backBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: verticalScale(8),
    zIndex: 2,
  },
  originalLogo: {
    width: moderateScale(80),
    height: moderateScale(80),
    marginBottom: verticalScale(4),
  },
  brandTitleText: {
    fontSize: fontScale(21),
    fontWeight: '900',
    color: '#0A1628',
    letterSpacing: 1.2,
  },
  brandTitleAccent: {
    color: '#0D9488',
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: verticalScale(16),
    zIndex: 2,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: moderateScale(11),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(6),
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  pillBadgeText: {
    fontSize: fontScale(11),
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.4,
  },
  welcomeTitle: {
    fontSize: fontScale(24),
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: fontScale(12.5),
    color: '#475569',
    marginTop: verticalScale(3),
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: fontScale(17),
    maxWidth: 310,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(9),
    paddingHorizontal: moderateScale(12),
    marginBottom: verticalScale(14),
    gap: 8,
    zIndex: 2,
  },
  errorText: {
    fontSize: fontScale(12),
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(9),
    paddingHorizontal: moderateScale(12),
    marginBottom: verticalScale(14),
    gap: 8,
    zIndex: 2,
  },
  successText: {
    fontSize: fontScale(12),
    color: '#0D9488',
    fontWeight: '700',
    flex: 1,
  },
  formContainer: {
    width: '100%',
    zIndex: 2,
  },
  fieldWrapper: {
    marginBottom: verticalScale(12),
  },
  fieldLabel: {
    fontSize: fontScale(10.5),
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.8,
    marginBottom: verticalScale(5),
  },
  inputAquaGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.4,
    borderColor: '#CCFBF1',
    borderRadius: moderateScale(15),
    height: verticalScale(50),
    minHeight: 48,
    maxHeight: 56,
    paddingHorizontal: moderateScale(12),
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  inputIconCircle: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  textInput: {
    flex: 1,
    fontSize: fontScale(14),
    color: '#0F172A',
    fontWeight: '600',
  },
  eyeBtn: {
    padding: moderateScale(6),
  },
  otpInputField: {
    height: verticalScale(54),
    minHeight: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: moderateScale(15),
    borderWidth: 1.5,
    borderColor: '#0D9488',
    textAlign: 'center',
    fontSize: fontScale(22),
    fontWeight: '900',
    letterSpacing: 8,
    color: '#062738',
  },
  actionBtn: {
    height: verticalScale(50),
    minHeight: 48,
    maxHeight: 56,
    borderRadius: moderateScale(15),
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
    marginTop: verticalScale(6),
    marginBottom: verticalScale(16),
  },
  btnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  resendCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: verticalScale(10),
    paddingVertical: verticalScale(6),
  },
  resendCodeText: {
    fontSize: fontScale(13),
    fontWeight: '700',
    color: '#0D9488',
  },
  changeEmailBtn: {
    alignItems: 'center',
    marginTop: verticalScale(4),
    paddingVertical: verticalScale(6),
  },
  changeEmailText: {
    fontSize: fontScale(12.5),
    color: '#64748B',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerPrompt: {
    fontSize: fontScale(12.8),
    color: '#64748B',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: fontScale(13.2),
    fontWeight: '900',
    color: '#0D9488',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(10),
    width: '100%',
    zIndex: 2,
  },
  successGlowWrap: {
    width: moderateScale(90),
    height: moderateScale(90),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(14),
  },
  successGlowHalo: {
    position: 'absolute',
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: 'rgba(45, 212, 191, 0.25)',
  },
  successIconCircle: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: '#E6FAF6',
    borderWidth: 2,
    borderColor: '#99F6E4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(10),
  },
  successPillText: {
    fontSize: fontScale(11.5),
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.4,
  },
  successTitle: {
    fontSize: fontScale(22),
    fontWeight: '900',
    color: '#062738',
    textAlign: 'center',
    marginBottom: verticalScale(6),
    letterSpacing: -0.4,
  },
  successDesc: {
    fontSize: fontScale(13),
    color: '#475569',
    textAlign: 'center',
    lineHeight: fontScale(18),
    marginBottom: verticalScale(22),
    maxWidth: 320,
    fontWeight: '500',
  },
  successActionBtn: {
    width: '100%',
    maxWidth: 340,
    height: verticalScale(50),
    minHeight: 48,
    maxHeight: 54,
    borderRadius: moderateScale(15),
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
    marginTop: verticalScale(4),
  },
  successBtnText: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
