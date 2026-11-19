import React, { useState } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToSignup,
  onNavigateToForgotPassword,
}) => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Invalid credentials. Please verify and try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Google sign-in was cancelled or failed.');
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
          {/* Official Flyorago Logo and Tagline */}
          <View style={styles.brandingBlock}>
            <Image
              source={require('../../../assets/images/flyorago-logo-transparent.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>

          {/* Heading Block */}
          <View style={styles.headingBlock}>
            <Text style={styles.headingTitle}>
              Welcome <Text style={styles.headingAccent}>Back!</Text>
            </Text>
            <Text style={styles.headingSubtitle}>Sign in to continue your journey</Text>
          </View>

          {/* Illustrated Globe Artwork */}
          <View style={styles.globeArtContainer}>
            <Image
              source={require('../../../assets/images/login-globe-art.png')}
              style={styles.globeArtImage}
              resizeMode="contain"
            />
          </View>

          {/* Error Message Banner */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={17} color={FlyoraColors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Address */}
            <View style={styles.inputPill}>
              <Ionicons
                name="mail-outline"
                size={20}
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
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputPill}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
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
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={FlyoraColors.textSubtle}
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxActive,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={12} color={FlyoraColors.white} />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  onNavigateToForgotPassword ||
                  (() => alert('Password reset link will be sent to your email.'))
                }
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Log In Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color={FlyoraColors.white} size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.loginBtnText}>Log In</Text>
                  <Ionicons name="arrow-forward" size={17} color={FlyoraColors.white} />
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button (Apple Removed as requested) */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
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

            {/* Sign Up Navigation Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={onNavigateToSignup}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Wave Artwork */}
      <View style={styles.bottomWaveContainer} pointerEvents="none">
        <Image
          source={require('../../../assets/images/login-waves.png')}
          style={styles.bottomWaveImage}
          resizeMode="stretch"
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
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 65,
  },
  brandingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  brandLogo: {
    width: 170,
    height: 70,
  },
  headingBlock: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: FlyoraColors.textNavy,
    letterSpacing: -0.4,
  },
  headingAccent: {
    color: FlyoraColors.primary,
  },
  headingSubtitle: {
    fontSize: 13,
    color: FlyoraColors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  globeArtContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  globeArtImage: {
    width: Math.min(width * 0.72, 300),
    height: 120,
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
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 12,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  checkboxActive: {
    backgroundColor: FlyoraColors.primary,
    borderColor: FlyoraColors.primary,
  },
  rememberMeText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 13,
    color: FlyoraColors.primary,
    fontWeight: '700',
  },
  loginBtn: {
    height: 52,
    backgroundColor: FlyoraColors.primary,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    ...Shadows.tealGlow,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FlyoraColors.white,
    letterSpacing: 0.2,
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
    marginBottom: 20,
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
  bottomWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 45,
    overflow: 'hidden',
  },
  bottomWaveImage: {
    width: '100%',
    height: '100%',
  },
});
