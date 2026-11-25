import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Easing,
  Modal,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { promptGoogleAuth } from '../../services/googleAuth';
import { getSafeHeaderPaddingTop } from '../../constants/responsive';

const { width } = Dimensions.get('window');

type LoginErrorType =
  | 'EMAIL_NOT_FOUND'
  | 'WRONG_PASSWORD'
  | 'ACCOUNT_LOCKED_TEMPORARY'
  | 'ACCOUNT_BLOCKED'
  | 'SERVER_ERROR'
  | null;

interface LoginScreenProps {
  onNavigateToSignup: (initialEmail?: string, autoOpenOtp?: boolean) => void;
  onNavigateToForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToSignup,
  onNavigateToForgotPassword,
}) => {
  const { login, loginWithGoogle } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Structured Error States matching Web Flow
  const [errorType, setErrorType] = useState<LoginErrorType>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailFieldError, setEmailFieldError] = useState(false);
  const [passwordFieldError, setPasswordFieldError] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  // Animated values for Shake and Banner Entrance
  const bannerAnim = useRef(new Animated.Value(1)).current;
  const bannerScale = useRef(new Animated.Value(1)).current;
  const emailShakeAnim = useRef(new Animated.Value(0)).current;
  const passwordShakeAnim = useRef(new Animated.Value(0)).current;
  const generalShakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = (anim: Animated.Value) => {
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -3, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 3, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const showBannerAnimation = () => {
    bannerAnim.setValue(1);
    bannerScale.setValue(0.96);
    Animated.spring(bannerScale, {
      toValue: 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const clearError = () => {
    setErrorType(null);
    setErrorMessage('');
    setEmailFieldError(false);
    setPasswordFieldError(false);
  };

  const handleLogin = async () => {
    // 1. Client-side Empty Checks (Precise, do not mix up)
    if (!email.trim() && !password) {
      setErrorType('SERVER_ERROR');
      setErrorMessage('Please enter both email and password.');
      setEmailFieldError(true);
      setPasswordFieldError(true);
      triggerShake(generalShakeAnim);
      showBannerAnimation();
      return;
    }

    if (!email.trim()) {
      setErrorType('EMAIL_NOT_FOUND');
      setErrorMessage('Please enter your registered email address.');
      setEmailFieldError(true);
      setPasswordFieldError(false);
      triggerShake(emailShakeAnim);
      showBannerAnimation();
      return;
    }

    if (!password) {
      setErrorType('WRONG_PASSWORD');
      setErrorMessage('Please enter your password.');
      setEmailFieldError(false);
      setPasswordFieldError(true);
      triggerShake(passwordShakeAnim);
      showBannerAnimation();
      return;
    }

    setLoading(true);
    const res = await login(email, password);

    if (!res.success) {
      setLoading(false);

      // Check if user account is not verified yet
      if (res.isVerified === false) {
        onNavigateToSignup(res.email || email.trim().toLowerCase(), true);
        return;
      }

      const code = (res.errorCode || res?.errors?.error_code || '').toUpperCase();
      const msg = res.message || 'Login failed.';

      if (code === 'EMAIL_NOT_FOUND' || msg.toLowerCase().includes('no account found') || msg.toLowerCase().includes('email address')) {
        setErrorType('EMAIL_NOT_FOUND');
        setErrorMessage(msg);
        setEmailFieldError(true);
        setPasswordFieldError(false);
        triggerShake(emailShakeAnim);
        showBannerAnimation();
      } else if (code === 'ACCOUNT_BLOCKED' || msg.toLowerCase().includes('suspended')) {
        setShowBlockedModal(true);
      } else if (
        code === 'ACCOUNT_LOCKED_TEMPORARY' ||
        msg.toLowerCase().includes('locked for 1 hour') ||
        msg.toLowerCase().includes('3 times') ||
        msg.toLowerCase().includes('temporarily blocked')
      ) {
        setErrorType('ACCOUNT_LOCKED_TEMPORARY');
        setErrorMessage(msg);
        setEmailFieldError(false);
        setPasswordFieldError(true);
        triggerShake(passwordShakeAnim);
        showBannerAnimation();
      } else if (
        code === 'WRONG_PASSWORD' ||
        msg.toLowerCase().includes('incorrect password') ||
        msg.toLowerCase().includes('attempt') ||
        msg.toLowerCase().includes('password')
      ) {
        setErrorType('WRONG_PASSWORD');
        setErrorMessage(msg);
        setEmailFieldError(false);
        setPasswordFieldError(true);
        triggerShake(passwordShakeAnim);
        showBannerAnimation();
      } else {
        setErrorType('SERVER_ERROR');
        setErrorMessage(msg);
        setEmailFieldError(false);
        setPasswordFieldError(false);
        triggerShake(generalShakeAnim);
        showBannerAnimation();
      }
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    clearError();
    try {
      const authResult = await promptGoogleAuth();
      if (!authResult.success) {
        setGoogleLoading(false);
        if (authResult.message && !authResult.message.includes('cancelled')) {
          setErrorType('SERVER_ERROR');
          setErrorMessage(authResult.message);
          showBannerAnimation();
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
        setErrorType('SERVER_ERROR');
        setErrorMessage(res.message || 'Google sign-in was cancelled or failed.');
        showBannerAnimation();
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setErrorType('SERVER_ERROR');
      setErrorMessage(err.message || 'Google sign-in failed.');
      showBannerAnimation();
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
            { paddingTop: getSafeHeaderPaddingTop(insets.top) + 6 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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

          {/* Heading with Deep Forest Green & Crystal Aqua Theme */}
          <View style={styles.headingBlock}>
            <View style={styles.pillBadge}>
              <Ionicons name="sparkles" size={13} color="#0D9488" />
              <Text style={styles.pillBadgeText}>Smart Travel Logistics</Text>
            </View>
            <Text style={styles.welcomeTitle}>
              Welcome <Text style={styles.welcomeAccent}>Back</Text>
            </Text>
            <Text style={styles.welcomeSub}>
              Sign in to manage flights, luggage space & escrow securely
            </Text>
          </View>

          {/* Quick 1-Tap Fill Test Credentials */}
          <TouchableOpacity
            style={styles.quickFillPill}
            onPress={() => {
              setEmail('akashbppatel001@gmail.com');
              setPassword('12345678');
              setErrorMessage('');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={13} color="#0D9488" />
            <Text style={styles.quickFillText}>Quick Fill (Akash)</Text>
          </TouchableOpacity>

          {/* Advanced Inline Error Banner (Google/MNC Style with Top Color Bar) */}
          {!!errorMessage && (
            <Animated.View
              style={[
                styles.advancedErrorBanner,
                errorType === 'EMAIL_NOT_FOUND' && styles.errorBannerAmber,
                errorType === 'WRONG_PASSWORD' && styles.errorBannerRed,
                errorType === 'ACCOUNT_LOCKED_TEMPORARY' && styles.errorBannerRose,
                (!errorType || errorType === 'SERVER_ERROR') && styles.errorBannerRed,
                {
                  transform: [
                    { scale: bannerScale },
                    { translateX: generalShakeAnim },
                  ],
                },
              ]}
            >
              {/* Top Accent Strip */}
              <View
                style={[
                  styles.errorAccentStrip,
                  errorType === 'EMAIL_NOT_FOUND' ? { backgroundColor: '#F59E0B' } : { backgroundColor: '#EF4444' },
                ]}
              />

              <View style={styles.errorInnerContent}>
                {/* Error Icon Circle */}
                <View
                  style={[
                    styles.errorIconWrap,
                    errorType === 'EMAIL_NOT_FOUND' ? { backgroundColor: '#FEF3C7' } : { backgroundColor: '#FEE2E2' },
                  ]}
                >
                  {errorType === 'EMAIL_NOT_FOUND' ? (
                    <Ionicons name="person-remove" size={18} color="#D97706" />
                  ) : errorType === 'ACCOUNT_LOCKED_TEMPORARY' ? (
                    <Ionicons name="shield-half" size={18} color="#E11D48" />
                  ) : (
                    <Ionicons name="key" size={18} color="#DC2626" />
                  )}
                </View>

                {/* Error Text Details */}
                <View style={styles.errorTextCol}>
                  <Text
                    style={[
                      styles.errorTitleText,
                      errorType === 'EMAIL_NOT_FOUND' ? { color: '#B45309' } : { color: '#991B1B' },
                    ]}
                  >
                    {errorType === 'EMAIL_NOT_FOUND'
                      ? 'Email not recognized'
                      : errorType === 'ACCOUNT_LOCKED_TEMPORARY'
                      ? 'Security Lockout (1 Hour)'
                      : 'Incorrect password'}
                  </Text>
                  <Text style={styles.errorBodyText}>{errorMessage}</Text>
                </View>

                {/* Dismiss Button */}
                <TouchableOpacity
                  onPress={clearError}
                  style={styles.errorDismissBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="close" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Seamless Open Aqua-White Water Glass Form (Clean, Modern, No Box Borders) */}
          <View style={styles.formContainer}>
            {/* Email Address */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <Animated.View
                style={[
                  styles.inputAquaGlass,
                  emailFieldError && styles.inputFieldError,
                  { transform: [{ translateX: emailShakeAnim }] },
                ]}
              >
                <View style={[styles.inputIconCircle, emailFieldError && styles.inputIconCircleError]}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={emailFieldError ? '#DC2626' : '#0D9488'}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="name@flyorago.me"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailFieldError) setEmailFieldError(false);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                {emailFieldError && (
                  <View style={styles.fieldAlertIconWrap}>
                    <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  </View>
                )}
              </Animated.View>
              {emailFieldError && (
                <View style={styles.fieldErrorFootnote}>
                  <Ionicons name="person-remove-outline" size={12} color="#D97706" />
                  <Text style={styles.fieldErrorFootnoteTextAmber}>
                    No account found with this email
                  </Text>
                </View>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <Animated.View
                style={[
                  styles.inputAquaGlass,
                  passwordFieldError && styles.inputFieldError,
                  { transform: [{ translateX: passwordShakeAnim }] },
                ]}
              >
                <View style={[styles.inputIconCircle, passwordFieldError && styles.inputIconCircleError]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={passwordFieldError ? '#DC2626' : '#0D9488'}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordFieldError) setPasswordFieldError(false);
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
              </Animated.View>
              {passwordFieldError && (
                <View style={styles.fieldErrorFootnote}>
                  <Ionicons name="key-outline" size={12} color="#DC2626" />
                  <Text style={styles.fieldErrorFootnoteTextRed}>
                    Password doesn't match. Please try again.
                  </Text>
                </View>
              )}
            </View>

            {/* Options Row (Remember Me & Forgot Password) */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  onNavigateToForgotPassword ||
                  (() => alert('Password reset instructions will be sent to your email.'))
                }
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Action Button - Rich Emerald with Mint Reflection */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
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
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Social Glass Button */}
            <TouchableOpacity
              style={styles.googleAquaBtn}
              onPress={handleGoogleLogin}
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

            {/* Navigation Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => onNavigateToSignup()}>
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Account Suspended / Blocked MNC Style Modal */}
      <Modal
        visible={showBlockedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBlockedModal(false)}
      >
        <View style={styles.blockedModalOverlay}>
          <View style={styles.blockedModalCard}>
            {/* Top Red Gradient Strip */}
            <View style={styles.blockedModalTopStrip} />

            <View style={styles.blockedModalHeaderZone}>
              {/* Pulsing Shield Icon Ring */}
              <View style={styles.blockedShieldPulseCircle}>
                <View style={styles.blockedShieldCore}>
                  <Ionicons name="shield-sharp" size={36} color="#DC2626" />
                </View>
              </View>

              <Text style={styles.blockedModalTitle}>Account Suspended</Text>
              <Text style={styles.blockedModalSub}>
                An administrator has restricted access to your account.
              </Text>
            </View>

            {/* Why Suspended Details */}
            <View style={styles.blockedReasonCard}>
              <Ionicons name="information-circle" size={20} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.blockedReasonHeading}>Why was my account blocked?</Text>
                <Text style={styles.blockedReasonText}>
                  Your account may have been suspended due to a security policy violation, suspicious login activity, or pending identity review.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.blockedModalActions}>
              <TouchableOpacity
                style={styles.blockedDismissBtn}
                onPress={() => setShowBlockedModal(false)}
              >
                <Text style={styles.blockedDismissText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.blockedSupportBtn}
                onPress={() => Linking.openURL('mailto:support@flyorago.com')}
              >
                <Ionicons name="mail" size={16} color="#FFFFFF" />
                <Text style={styles.blockedSupportText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  logoBlock: {
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 14,
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
    fontSize: 27,
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.5,
  },
  welcomeAccent: {
    color: '#0D9488',
  },
  welcomeSub: {
    fontSize: 13,
    color: '#475569',
    marginTop: 5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  quickFillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: '#5EEAD4',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
    gap: 6,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 2,
  },
  quickFillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  advancedErrorBanner: {
    borderRadius: 18,
    borderWidth: 1.2,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 3,
  },
  errorBannerAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  errorBannerRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorBannerRose: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  errorBannerSlate: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  errorAccentStrip: {
    height: 4,
    width: '100%',
  },
  errorInnerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 10,
  },
  errorIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  errorTextCol: {
    flex: 1,
  },
  errorTitleText: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  errorBodyText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    fontWeight: '500',
  },
  errorDismissBtn: {
    padding: 4,
    borderRadius: 8,
  },
  inputFieldError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  inputIconCircleError: {
    backgroundColor: '#FEE2E2',
  },
  fieldAlertIconWrap: {
    paddingRight: 4,
  },
  fieldErrorFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
    paddingLeft: 4,
  },
  fieldErrorFootnoteTextAmber: {
    fontSize: 11.5,
    color: '#D97706',
    fontWeight: '700',
  },
  fieldErrorFootnoteTextRed: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '700',
  },
  blockedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blockedModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  blockedModalTopStrip: {
    height: 5,
    width: '100%',
    backgroundColor: '#DC2626',
  },
  blockedModalHeaderZone: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
  },
  blockedShieldPulseCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  blockedShieldCore: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  blockedModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  blockedModalSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  blockedReasonCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    margin: 18,
    padding: 12,
  },
  blockedReasonHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#9F1239',
    marginBottom: 2,
  },
  blockedReasonText: {
    fontSize: 11,
    color: '#BE123C',
    lineHeight: 16,
    fontWeight: '500',
  },
  blockedModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingBottom: 20,
    gap: 10,
  },
  blockedDismissBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedDismissText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  blockedSupportBtn: {
    flex: 1.3,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  blockedSupportText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  formContainer: {
    width: '100%',
    zIndex: 2,
  },
  fieldWrapper: {
    marginBottom: 14,
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
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  checkboxActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  rememberText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 13,
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
});
