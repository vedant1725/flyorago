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
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface SignupScreenProps {
  onNavigateToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigateToLogin }) => {
  const { signup, verifyOtp, loginWithGoogle } = useAuth();

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

  useEffect(() => {
    let timer: any;
    if (isOtpStep && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOtpStep, resendCooldown]);

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

    const res = await signup({
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      phone: `${dialCode}${mobileNumber.trim()}`,
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Atmospheric Soft Mint Gradient */}
      <LinearGradient
        colors={['#CCF5EF', '#F0FCFA', '#FFFFFF']}
        locations={[0, 0.25, 0.7]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Bar with Back Arrow */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onNavigateToLogin}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            >
              <Ionicons name="chevron-back" size={24} color={FlyoraColors.textNavy} />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>

          {/* Official Flyorago Branding */}
          <View style={styles.brandingBlock}>
            <Image
              source={require('../../../assets/images/flyorago-logo-transparent.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>

          {/* Heading Block */}
          <View style={styles.headingBlock}>
            <Text style={styles.headingTitle}>Create Account</Text>
            <Text style={styles.headingSubtitle}>
              Join Flyorago and start shipping smarter
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={17} color={FlyoraColors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* OTP Step View */}
          {isOtpStep ? (
            <View style={styles.otpCard}>
              <Ionicons name="mail-open-outline" size={40} color={FlyoraColors.primary} />
              <Text style={styles.otpTitle}>Verify Your Email</Text>
              <Text style={styles.otpDesc}>
                We sent a 6-digit confirmation code to{' '}
                <Text style={{ fontWeight: '700', color: FlyoraColors.textNavy }}>{email}</Text>
              </Text>

              {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}

              <TextInput
                style={styles.otpInput}
                placeholder="• • • • • •"
                placeholderTextColor={FlyoraColors.textPlaceholder}
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
              />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleVerifyOtp}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator color={FlyoraColors.white} />
                ) : (
                  <Text style={styles.actionBtnText}>Confirm Code & Continue</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 14 }}
                onPress={() => setIsOtpStep(false)}
              >
                <Text style={{ fontSize: 13, color: FlyoraColors.primary, fontWeight: '700' }}>
                  ← Change Email Address
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Registration Form Fields */
            <View style={styles.formContainer}>
              {/* Full Name Field */}
              <View style={styles.inputPill}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={FlyoraColors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Full Name"
                  placeholderTextColor={FlyoraColors.textPlaceholder}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="words"
                />
              </View>

              {/* Email Address Field */}
              <View style={styles.inputPill}>
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={FlyoraColors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Email Address"
                  placeholderTextColor={FlyoraColors.textPlaceholder}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Mobile Number Row with Dial Code */}
              <View style={styles.phoneRow}>
                <View style={styles.dialCodePill}>
                  <Ionicons name="call-outline" size={17} color={FlyoraColors.primary} />
                  <Text style={styles.dialCodeText}>{dialCode}</Text>
                  <Ionicons name="chevron-down" size={13} color={FlyoraColors.textMuted} />
                </View>
                <View style={[styles.inputPill, { flex: 1, marginBottom: 0 }]}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Mobile Number"
                    placeholderTextColor={FlyoraColors.textPlaceholder}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={[styles.inputPill, { marginTop: 12 }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={FlyoraColors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Password"
                  placeholderTextColor={FlyoraColors.textPlaceholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={FlyoraColors.textSubtle}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Field */}
              <View style={styles.inputPill}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={FlyoraColors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Confirm Password"
                  placeholderTextColor={FlyoraColors.textPlaceholder}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={FlyoraColors.textSubtle}
                  />
                </TouchableOpacity>
              </View>

              {/* Terms and Conditions Checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                  {agreed && (
                    <Ionicons name="checkmark" size={12} color={FlyoraColors.white} />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => Alert.alert('Terms & Conditions', 'FlyoraGo luggage sharing policy.')}
                  >
                    Terms & Conditions
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => Alert.alert('Privacy Policy', 'FlyoraGo privacy policy.')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Primary Teal Create Account Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color={FlyoraColors.white} size="small" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.actionBtnText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={17} color={FlyoraColors.white} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign up with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign Up Button (Apple Removed as requested) */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleSignup}
                disabled={googleLoading || loading}
                activeOpacity={0.85}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={FlyoraColors.primary} />
                ) : (
                  <View style={styles.googleBtnInner}>
                    <Image
                      source={require('../../../assets/images/google-g.png')}
                      style={styles.googleIconImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Log In Redirect Footer */}
              <View style={styles.footerRow}>
                <Text style={styles.footerPrompt}>Already have an account? </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                  <Text style={styles.footerLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Skyline Artwork from Reference */}
      <View style={styles.bottomSkylineContainer} pointerEvents="none">
        <Image
          source={require('../../../assets/images/signup-skyline-art.png')}
          style={styles.bottomSkylineImage}
          resizeMode="cover"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FBF9',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 75,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  brandLogo: {
    width: 155,
    height: 60,
  },
  headingBlock: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: FlyoraColors.textNavy,
    letterSpacing: -0.4,
  },
  headingSubtitle: {
    fontSize: 13,
    color: FlyoraColors.textMuted,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FlyoraColors.dangerBg,
    borderWidth: 1,
    borderColor: FlyoraColors.dangerBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: FlyoraColors.danger,
    fontWeight: '600',
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FlyoraColors.white,
    borderWidth: 1.2,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.pill,
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 11,
    ...Shadows.sm,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: FlyoraColors.textNavy,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dialCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FlyoraColors.white,
    borderWidth: 1.2,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.pill,
    height: 50,
    paddingHorizontal: 12,
    gap: 6,
    ...Shadows.sm,
  },
  dialCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: FlyoraColors.textNavy,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: FlyoraColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: FlyoraColors.primary,
    borderColor: FlyoraColors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  termsLink: {
    color: FlyoraColors.primary,
    fontWeight: '700',
  },
  actionBtn: {
    height: 52,
    backgroundColor: FlyoraColors.primary,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Shadows.tealGlow,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FlyoraColors.white,
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: FlyoraColors.textSubtle,
    fontWeight: '500',
  },
  googleBtn: {
    height: 50,
    backgroundColor: FlyoraColors.white,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    ...Shadows.sm,
  },
  googleBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleIconImage: {
    width: 20,
    height: 20,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerPrompt: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: FlyoraColors.primary,
  },
  bottomSkylineContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 55,
    overflow: 'hidden',
  },
  bottomSkylineImage: {
    width: '100%',
    height: '100%',
  },
  otpCard: {
    backgroundColor: FlyoraColors.white,
    borderRadius: BorderRadius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    ...Shadows.card,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FlyoraColors.textNavy,
    marginTop: 10,
    marginBottom: 4,
  },
  otpDesc: {
    fontSize: 13,
    color: FlyoraColors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  otpErrorText: {
    color: FlyoraColors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  otpInput: {
    backgroundColor: FlyoraColors.background,
    borderWidth: 1.5,
    borderColor: FlyoraColors.primary,
    borderRadius: BorderRadius.md,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '80%',
    color: FlyoraColors.textNavy,
    marginBottom: 18,
  },
});
