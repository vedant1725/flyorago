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
import { promptGoogleAuth } from '../../services/googleAuth';
import { apiFetch } from '../../services/api';
import { LegalScreen, LegalDocType } from '../Legal/LegalScreen';
import {
  scale,
  verticalScale,
  moderateScale,
  fontScale,
  getSafeHeaderPaddingTop,
} from '../../constants/responsive';

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  initialEmail?: string;
  autoOpenOtp?: boolean;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onNavigateToLogin,
  initialEmail = '',
  autoOpenOtp = false,
}) => {
  const { signup, verifyOtp, loginWithGoogle } = useAuth();
  const insets = useSafeAreaInsets();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [dialCode, setDialCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // Legal Screen State (Terms of Service / Privacy Policy)
  const [legalScreenVisible, setLegalScreenVisible] = useState(false);
  const [legalInitialDoc, setLegalInitialDoc] = useState<LegalDocType>('terms');

  const openLegalScreen = (doc: LegalDocType) => {
    setLegalInitialDoc(doc);
    setLegalScreenVisible(true);
  };

  // Status states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(autoOpenOtp);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(autoOpenOtp ? 45 : 60);
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
    try {
      const authResult = await promptGoogleAuth();
      if (!authResult.success) {
        setGoogleLoading(false);
        if (authResult.message && !authResult.message.includes('cancelled')) {
          setErrorMessage(authResult.message);
        }
        return;
      }

      const res = await loginWithGoogle(authResult.credential, {
        access_token: authResult.access_token,
        email: authResult.email,
        name: authResult.name,
        picture: authResult.picture,
      });

      setGoogleLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Google registration was cancelled or failed.');
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setErrorMessage(err.message || 'Google registration failed.');
    }
  };

  // If user opens Terms or Privacy, show full dedicated screen
  if (legalScreenVisible) {
    return (
      <LegalScreen
        initialDoc={legalInitialDoc}
        onBack={() => setLegalScreenVisible(false)}
      />
    );
  }

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
            { paddingTop: getSafeHeaderPaddingTop(insets.top) + 2 },
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

            {/* Heading Greeting */}
            <View style={styles.headingBlock}>
              <View style={styles.pillBadge}>
                <Ionicons name="globe-outline" size={moderateScale(12)} color="#0D9488" />
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
                <Ionicons name="alert-circle" size={moderateScale(18)} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* OTP Step View */}
            {isOtpStep ? (
              <View style={styles.formContainer}>
                <View style={styles.otpHeaderBox}>
                  <View style={styles.otpIconCircle}>
                    <Ionicons name="mail-open" size={moderateScale(26)} color="#0D9488" />
                  </View>
                  <Text style={styles.otpTitle}>Verify Your Email</Text>
                  <Text style={styles.otpDesc}>
                    We sent a 6-digit confirmation code to{' '}
                    <Text style={{ fontWeight: '800', color: '#0D9488' }}>{email}</Text>
                  </Text>
                </View>

                {otpError ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={moderateScale(17)} color="#DC2626" />
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
                  disabled={otpLoading}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#0D9488', '#0F766E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    {otpLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.btnContent}>
                        <Text style={styles.loginBtnText}>Confirm Code</Text>
                        <Ionicons name="checkmark-circle-outline" size={moderateScale(18)} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

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
                      <Ionicons name="person-outline" size={moderateScale(17)} color="#0D9488" />
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

                {/* Password (Single unified field - Confirm Password removed) */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <View style={styles.inputAquaGlass}>
                    <View style={styles.inputIconCircle}>
                      <Ionicons name="lock-closed-outline" size={moderateScale(17)} color="#0D9488" />
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
                        size={moderateScale(18)}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and Privacy Checkbox */}
                <View style={styles.termsRow}>
                  <TouchableOpacity
                    style={[styles.checkbox, agreed && styles.checkboxActive]}
                    onPress={() => setAgreed(!agreed)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.8}
                  >
                    {agreed && <Ionicons name="checkmark" size={moderateScale(11)} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <Text style={styles.termsText}>
                    I agree to Flyorago's{' '}
                    <Text
                      style={styles.termsLink}
                      onPress={() => openLegalScreen('terms')}
                    >
                      Terms of Service
                    </Text>{' '}
                    and{' '}
                    <Text
                      style={styles.termsLink}
                      onPress={() => openLegalScreen('privacy')}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                </View>

                {/* Submit Register Button */}
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={handleSignup}
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
                        <Text style={styles.loginBtnText}>Create Free Account</Text>
                        <Ionicons name="arrow-forward" size={moderateScale(17)} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Social Divider */}
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
    maxWidth: 480, // responsive max-width on tablets and large foldables
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
    marginBottom: verticalScale(14),
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
    maxWidth: 300,
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
  dialCodeBox: {
    paddingHorizontal: moderateScale(9),
    paddingVertical: verticalScale(4),
    backgroundColor: '#F0FDFA',
    borderRadius: moderateScale(8),
    marginRight: moderateScale(10),
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  dialCodeText: {
    fontSize: fontScale(13),
    fontWeight: '700',
    color: '#0D9488',
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: verticalScale(3),
    marginBottom: verticalScale(16),
    gap: moderateScale(9),
  },
  checkbox: {
    width: moderateScale(19),
    height: moderateScale(19),
    borderRadius: moderateScale(6),
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
    fontSize: fontScale(11.8),
    color: '#475569',
    lineHeight: fontScale(17),
    fontWeight: '500',
  },
  termsLink: {
    color: '#0D9488',
    fontWeight: '700',
  },
  loginBtn: {
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
  loginBtnText: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(14),
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: fontScale(11.5),
    color: '#94A3B8',
    fontWeight: '600',
  },
  googleAquaBtn: {
    height: verticalScale(48),
    minHeight: 46,
    maxHeight: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(18),
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
    width: moderateScale(20),
    height: moderateScale(20),
  },
  googleBtnText: {
    fontSize: fontScale(13.5),
    fontWeight: '700',
    color: '#1E293B',
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
  otpHeaderBox: {
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  otpIconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
  },
  otpTitle: {
    fontSize: fontScale(20),
    fontWeight: '900',
    color: '#062738',
  },
  otpDesc: {
    fontSize: fontScale(12.5),
    color: '#64748B',
    textAlign: 'center',
    marginTop: verticalScale(5),
    lineHeight: fontScale(17),
  },
  otpErrorText: {
    color: '#DC2626',
    fontSize: fontScale(11.5),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  otpInputField: {
    height: verticalScale(52),
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
    marginTop: verticalScale(6),
    paddingVertical: verticalScale(6),
  },
  changeEmailText: {
    fontSize: fontScale(12.5),
    color: '#64748B',
    fontWeight: '600',
  },
});
