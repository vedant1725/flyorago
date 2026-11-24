import React, { useState, useEffect } from 'react';
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
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import { getSafeHeaderPaddingTop } from '../../constants/responsive';

const { width } = Dimensions.get('window');

interface SignupScreenProps {
  onNavigateToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigateToLogin }) => {
  const { signup, verifyOtp, loginWithGoogle } = useAuth();
  const insets = useSafeAreaInsets();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // Status states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isOtpStep && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOtpStep, resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setOtpError('');
    try {
      const res = await apiFetch('/api/auth/request-otp/', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.success) {
        setOtpError(res.message || 'Failed to resend code.');
      } else {
        setResendCooldown(60);
        Alert.alert('Code Sent', `A fresh 6-digit verification code was sent to ${email}`);
      }
    } catch (e: any) {
      setOtpError(e.message || 'Error resending code.');
    } finally {
      setResending(false);
    }
  };

  const handleSignup = async () => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreed) {
      setErrorMessage('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Member';
    const lastName = nameParts.slice(1).join(' ') || '';

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    const formattedPhone = cleanDigits.length >= 10 ? `${dialCode}${cleanDigits}` : '';

    const res = await signup({
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      phone: formattedPhone,
      password,
    });

    setLoading(false);

    if (res.success) {
      setIsOtpStep(true);
      setResendCooldown(60);
    } else {
      setErrorMessage(res.message || 'Registration failed. Please check your details.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) {
      setOtpError('Please enter the OTP verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    const res = await verifyOtp(email.trim().toLowerCase(), otpCode.trim());
    setOtpLoading(false);

    if (!res.success) {
      setOtpError(res.message || 'Invalid or expired OTP code.');
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Google registration was cancelled or failed.');
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
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onNavigateToLogin}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            >
              <Ionicons name="chevron-back" size={22} color="#0D9488" />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
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

          {/* Heading Greeting */}
          <View style={styles.headingBlock}>
            <View style={styles.pillBadge}>
              <Ionicons name="globe-outline" size={13} color="#0D9488" />
              <Text style={styles.pillBadgeText}>Global Community</Text>
            </View>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSub}>
              Earn money while traveling & send parcels globally with escrow security
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* OTP Step View */}
          {isOtpStep ? (
            <View style={styles.formContainer}>
              <View style={styles.otpHeaderBox}>
                <View style={styles.otpIconCircle}>
                  <Ionicons name="mail-open" size={28} color="#0D9488" />
                </View>
                <Text style={styles.otpTitle}>Verify Your Email</Text>
                <Text style={styles.otpDesc}>
                  We sent a 6-digit confirmation code to{' '}
                  <Text style={{ fontWeight: '800', color: '#0D9488' }}>{email}</Text>
                </Text>
              </View>

              {otpError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={17} color="#DC2626" />
                  <Text style={styles.errorText}>{otpError}</Text>
                </View>
              ) : null}

              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>VERIFICATION CODE</Text>
                <TextInput
                  style={styles.otpInputField}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleVerifyOtp}
                disabled={otpLoading || otpCode.trim().length !== 6}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#0D9488', '#0F766E', '#065F56']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnGradient}
                >
                  {otpLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Text style={styles.loginBtnText}>Verify & Continue</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend Code Button matching Web */}
              <TouchableOpacity
                style={styles.resendCodeRow}
                onPress={handleResendOtp}
                disabled={resendCooldown > 0 || resending}
              >
                <Ionicons
                  name="refresh-outline"
                  size={15}
                  color={resendCooldown > 0 ? '#94A3B8' : '#0D9488'}
                />
                <Text
                  style={[
                    styles.resendCodeText,
                    resendCooldown > 0 && { color: '#94A3B8' },
                  ]}
                >
                  {resending
                    ? 'Sending code...'
                    : resendCooldown > 0
                    ? `Resend Code (${resendCooldown}s)`
                    : 'Resend Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeEmailBtn}
                onPress={() => setIsOtpStep(false)}
              >
                <Text style={styles.changeEmailText}>Back to Signup</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Registration Form Fields in Seamless Aqua-White Layout */
            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <View style={styles.inputAquaGlass}>
                  <View style={styles.inputIconCircle}>
                    <Ionicons name="person-outline" size={18} color="#0D9488" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Akash Patel"
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errorMessage) setErrorMessage('');
                    }}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputAquaGlass}>
                  <View style={styles.inputIconCircle}>
                    <Ionicons name="mail-outline" size={18} color="#0D9488" />
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

              {/* Phone Number */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>MOBILE PHONE (OPTIONAL)</Text>
                <View style={styles.inputAquaGlass}>
                  <View style={styles.dialCodeBox}>
                    <Text style={styles.dialCodeText}>{dialCode}</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="98765 43210"
                    placeholderTextColor="#94A3B8"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={styles.inputAquaGlass}>
                  <View style={styles.inputIconCircle}>
                    <Ionicons name="lock-closed-outline" size={18} color="#0D9488" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
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
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
                <View style={styles.inputAquaGlass}>
                  <View style={styles.inputIconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#0D9488" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Re-enter password"
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
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Privacy Checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                  {agreed && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to Flyorago's{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => Alert.alert('Terms & Conditions', 'FlyoraGo luggage sharing policy.')}
                  >
                    Terms of Service
                  </Text>{' '}
                  &{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => Alert.alert('Privacy Policy', 'FlyoraGo privacy policy.')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Create Account Button */}
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#0D9488', '#0F766E', '#065F56']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Text style={styles.loginBtnText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign up with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Social Button */}
              <TouchableOpacity
                style={styles.googleAquaBtn}
                onPress={handleGoogleSignup}
                disabled={googleLoading || loading}
                activeOpacity={0.85}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color="#0D9488" />
                ) : (
                  <View style={styles.googleBtnInner}>
                    <ExpoImage
                      source={require('../../../assets/images/google-g.png')}
                      style={styles.googleIcon}
                      contentFit="contain"
                    />
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Footer Prompt */}
              <View style={styles.footerRow}>
                <Text style={styles.footerPrompt}>Already have an account? </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    paddingHorizontal: 22,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  waterGlowCircle: {
    position: 'absolute',
    top: -50,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(45, 212, 191, 0.25)',
    zIndex: 0,
  },
  planeArtWrap: {
    position: 'absolute',
    top: 20,
    right: -25,
    width: 240,
    height: 240,
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
    marginBottom: 4,
    zIndex: 2,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    marginBottom: 10,
    zIndex: 2,
  },
  originalLogo: {
    width: 90,
    height: 90,
    marginBottom: 6,
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A1628',
    letterSpacing: 1.2,
  },
  brandTitleAccent: {
    color: '#0D9488',
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 2,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.4,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 8,
    zIndex: 2,
  },
  errorText: {
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  formContainer: {
    width: '100%',
    zIndex: 2,
  },
  fieldWrapper: {
    marginBottom: 13,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputAquaGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.4,
    borderColor: '#CCFBF1',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 12,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dialCodeBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  dialCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 18,
    gap: 10,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#5EEAD4',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },
  termsLink: {
    color: '#0D9488',
    fontWeight: '700',
  },
  loginBtn: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 18,
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
  loginBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  googleAquaBtn: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  googleBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerPrompt: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0D9488',
  },
  otpHeaderBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#062738',
  },
  otpDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  otpErrorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  otpInputField: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0D9488',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#062738',
  },
  resendCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
    paddingVertical: 6,
  },
  resendCodeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  changeEmailBtn: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
  },
  changeEmailText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
