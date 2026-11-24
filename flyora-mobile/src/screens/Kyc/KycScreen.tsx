import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getSafeHeaderPaddingTop, fontScale, moderateScale, scale } from '../../constants/responsive';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import { AppAlert as Alert } from '../../components/AppAlertModal';

interface KycScreenProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const KycScreen: React.FC<KycScreenProps> = ({ onBack, onSuccess }) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { user, kycStatus, updateKycStatus } = useAuth();

  const isSmallDevice = windowWidth < 360;
  const isTablet = windowWidth >= 768;
  const contentMaxWidth = isTablet ? 600 : 500;
  const horizontalPadding = isSmallDevice ? 14 : isTablet ? 32 : 20;

  // Mode: 'SUBMIT' or 'STATUS'
  const [viewMode, setViewMode] = useState<'SUBMIT' | 'STATUS'>('SUBMIT');
  const [currentKycStatus, setCurrentKycStatus] = useState<string>(kycStatus || 'NOT_SUBMITTED');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Submit wizard steps: 1 (Overview), 2 (Mandatory Document Uploads), 3 (Selfie)
  const [step, setStep] = useState<number>(1);

  // Uploaded base64 images matching web flow
  const [idFrontImage, setIdFrontImage] = useState<string>('');
  const [idBackImage, setIdBackImage] = useState<string>('');
  const [passportImage, setPassportImage] = useState<string>('');
  const [selfieImage, setSelfieImage] = useState<string>('');

  // Live Camera states for Step 3
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  // Loaders
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dynamic responsive selfie circle diameter
  const selfieCircleSize = Math.min(Math.round(windowWidth * 0.58), 240);

  // Full-Screen Animated Status Transitions
  const statusFadeAnim = useRef(new Animated.Value(0)).current;
  const statusScaleAnim = useRef(new Animated.Value(0.88)).current;
  const statusPulseAnim = useRef(new Animated.Value(1)).current;
  const statusGlowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (viewMode === 'STATUS') {
      statusFadeAnim.setValue(0);
      statusScaleAnim.setValue(0.88);

      Animated.parallel([
        Animated.timing(statusFadeAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.spring(statusScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous breathing pulse for badge & glow ring
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(statusPulseAnim, {
              toValue: 1.08,
              duration: 1600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(statusGlowAnim, {
              toValue: 0.9,
              duration: 1600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(statusPulseAnim, {
              toValue: 1,
              duration: 1600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(statusGlowAnim, {
              toValue: 0.4,
              duration: 1600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();

      return () => {
        pulseLoop.stop();
      };
    }
  }, [viewMode, currentKycStatus]);

  // Fetch status on mount
  useEffect(() => {
    fetchKycStatus();
  }, [user?.id]);

  const fetchKycStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/kyc/status/${user.id}`);
      if (res.success && res.data) {
        const status = (res.data.status || 'NOT_SUBMITTED').toUpperCase();
        setCurrentKycStatus(status);
        await updateKycStatus(status as any);
        if (status === 'REJECTED') {
          setRejectionReason(res.data.rejectionReason || 'Documents did not meet our verification criteria.');
        }
        if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') {
          setViewMode('STATUS');
        } else {
          setViewMode('SUBMIT');
        }
      }
    } catch (e) {
      console.warn('KYC status fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Picker for ID Front, ID Back, and Passport
  const handlePickDocument = async (docType: 'idFront' | 'idBack' | 'passport') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access is required to upload KYC documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        if (docType === 'idFront') setIdFrontImage(base64Data);
        if (docType === 'idBack') setIdBackImage(base64Data);
        if (docType === 'passport') setPassportImage(base64Data);
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to select document.');
    }
  };

  // Camera Handler for Live Selfie (Step 3)
  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Camera Permission', 'Camera access is required to take a live selfie.');
        return;
      }
    }
    setCameraActive(true);
  };

  const handleCaptureSelfie = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        if (photo) {
          const base64Data = photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : photo.uri;
          setSelfieImage(base64Data);
          setCameraActive(false);
        }
      } catch (err: any) {
        Alert.alert('Camera Error', 'Could not capture photo. Please try again.');
      }
    }
  };

  // Submit KYC Documents to Backend
  const handleKycSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in first.');
      return;
    }
    if (!idFrontImage || !idBackImage || !passportImage) {
      Alert.alert('Missing Documents', 'Please upload both National ID (front & back) and your Passport bio page.');
      setStep(2);
      return;
    }
    if (!selfieImage) {
      Alert.alert('Missing Selfie', 'Please take a live selfie to complete verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/kyc/submit/', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          documentType: 'national_id_and_passport',
          frontImage: idFrontImage,
          backImage: idBackImage,
          passportImage: passportImage,
          selfieImage: selfieImage,
        }),
      });

      if (res.success) {
        setCurrentKycStatus('PENDING');
        await updateKycStatus('PENDING');
        setViewMode('STATUS');
        if (onSuccess) onSuccess();
      } else {
        Alert.alert('Submission Failed', res.message || 'Could not submit KYC documents. Please retry.');
      }
    } catch (e: any) {
      Alert.alert('Network Error', e.message || 'Failed to connect to backend server.');
    } finally {
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Securing verification session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Fluid Aqua Gradient (Deep Aqua Water-Green into Pure White) */}
      <LinearGradient
        colors={['#A7F3D0', '#CCFBF1', '#E6FAF6', '#F4FBF9', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.18, 0.38, 0.6, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Responsive Decorative Glow Wave and Watermark */}
      <View style={[styles.waterGlowCircle, { width: scale(220), height: scale(220) }]} pointerEvents="none" />
      <View style={[styles.planeArtWrap, { width: scale(240), height: scale(240) }]} pointerEvents="none">
        <ExpoImage
          source={require('../../../assets/images/home-header-plane.png')}
          style={styles.planeArt}
          contentFit="contain"
          priority="high"
        />
      </View>

      {/* Top Bar with Dynamic Insets */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: getSafeHeaderPaddingTop(insets.top) + 2,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
        >
          <Ionicons name="chevron-back" size={20} color="#0D9488" />
        </TouchableOpacity>

        {/* Center Official 3D Box & Flight Logo */}
        <View style={styles.centerLogoBlock}>
          <ExpoImage
            source={require('../../../assets/images/flyorago-original-symbol.png')}
            style={styles.topSymbolLogo}
            contentFit="contain"
            priority="high"
          />
          <Text style={[styles.brandTitleText, { fontSize: fontScale(17) }]}>
            FLYORA<Text style={styles.brandTitleAccent}>GO</Text>
          </Text>
        </View>

        {/* Mandatory Badge */}
        <View style={styles.topBadgeAqua}>
          <Ionicons name="shield-checkmark" size={12} color="#0D9488" />
          <Text style={styles.topBadgeText}>KYC</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.centeredConstraintWrapper, { maxWidth: contentMaxWidth }]}>
          {viewMode === 'SUBMIT' ? (
            <View style={styles.formContainer}>
              {/* Heading Greeting */}
              <View style={styles.headingBlock}>
                <View style={styles.pillBadge}>
                  <Ionicons name="shield-checkmark-outline" size={12} color="#0D9488" />
                  <Text style={[styles.pillBadgeText, { fontSize: fontScale(10.5) }]}>
                    Mandatory Identity Verification
                  </Text>
                </View>

                <Text style={[styles.welcomeTitle, { fontSize: fontScale(22) }]}>
                  {step === 1 && 'Verification Overview'}
                  {step === 2 && 'Upload Identity Docs'}
                  {step === 3 && 'Take Live Selfie'}
                </Text>

                <Text style={[styles.welcomeSub, { fontSize: fontScale(12) }]}>
                  {step === 1 && 'To comply with global shipping & unlock luggage earnings, both documents are mandatory.'}
                  {step === 2 && 'Upload clean photos of your National ID (Front & Back) and International Passport.'}
                  {step === 3 && 'Take a quick face selfie to match against your uploaded government documents.'}
                </Text>
              </View>

              {/* Stepper Dots Bar */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepTrack}>
                  {[1, 2, 3].map((s) => (
                    <View key={s} style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          s === step ? styles.stepDotActive : s < step ? styles.stepDotCompleted : styles.stepDotInactive,
                        ]}
                      >
                        {s < step ? (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        ) : (
                          <Text
                            style={[
                              styles.stepDotText,
                              s === step ? { color: '#FFFFFF' } : { color: '#64748B' },
                            ]}
                          >
                            {s}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          s === step ? styles.stepLabelActive : styles.stepLabelInactive,
                          { fontSize: fontScale(10) },
                        ]}
                      >
                        {s === 1 ? 'Overview' : s === 2 ? 'Documents' : 'Selfie'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* STEP 1: Overview & Mandatory Requirement Cards */}
              {step === 1 && (
                <View style={styles.stepCardContent}>
                  {/* 1. National ID Card Card */}
                  <View style={styles.aquaDocCard}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.docIconCircle}>
                        <Ionicons name="card" size={18} color="#0D9488" />
                      </View>
                      <View style={styles.mandatoryPill}>
                        <Text style={styles.mandatoryPillText}>MANDATORY</Text>
                      </View>
                    </View>
                    <Text style={[styles.docCardTitle, { fontSize: fontScale(15) }]}>1. National ID Card</Text>
                    <Text style={[styles.docCardDesc, { fontSize: fontScale(11.5) }]}>
                      Both Front Side & Back Side photos required for security verification.
                    </Text>
                  </View>

                  {/* 2. International Passport Card */}
                  <View style={styles.aquaDocCard}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.docIconCircle}>
                        <Ionicons name="airplane" size={18} color="#0D9488" />
                      </View>
                      <View style={styles.mandatoryPill}>
                        <Text style={styles.mandatoryPillText}>MANDATORY</Text>
                      </View>
                    </View>
                    <Text style={[styles.docCardTitle, { fontSize: fontScale(15) }]}>2. International Passport</Text>
                    <Text style={[styles.docCardDesc, { fontSize: fontScale(11.5) }]}>
                      Clear photo of Passport Bio Page (Photo & Passport Number visible).
                    </Text>
                  </View>

                  {/* Aqua Encryption Callout */}
                  <View style={styles.aquaNoticeBox}>
                    <Ionicons name="lock-closed" size={16} color="#0D9488" />
                    <Text style={[styles.aquaNoticeText, { fontSize: fontScale(11) }]}>
                      All identity files are secured with 256-bit bank-grade encryption and kept strictly private.
                    </Text>
                  </View>

                  {/* Start Button */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setStep(2)}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#0D9488', '#0F766E', '#065F56']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.btnGradient}
                    >
                      <Text style={[styles.actionBtnText, { fontSize: fontScale(14.5) }]}>Start Uploads</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: Document Uploads */}
              {step === 2 && (
                <View style={styles.stepCardContent}>
                  {/* Section 1: National ID Card */}
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIconBadge}>
                      <Ionicons name="card-outline" size={14} color="#0D9488" />
                    </View>
                    <Text style={[styles.sectionTitleText, { fontSize: fontScale(12.5) }]}>
                      Section 1: National ID Card
                    </Text>
                  </View>

                  {/* Responsive Row for front and back */}
                  <View style={[styles.uploadRow, isSmallDevice && { flexDirection: 'column', gap: 10 }]}>
                    {/* Front Side */}
                    <View style={styles.uploadCol}>
                      <Text style={styles.uploadFieldLabel}>FRONT SIDE *</Text>
                      {idFrontImage ? (
                        <View style={styles.previewBoxAqua}>
                          <Image source={{ uri: idFrontImage }} style={styles.previewImg} resizeMode="cover" />
                          <TouchableOpacity
                            style={styles.trashCircleBtn}
                            onPress={() => setIdFrontImage('')}
                          >
                            <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.aquaDropzone}
                          onPress={() => handlePickDocument('idFront')}
                          activeOpacity={0.8}
                        >
                          <View style={styles.dropzoneIconCircle}>
                            <Ionicons name="cloud-upload-outline" size={20} color="#0D9488" />
                          </View>
                          <Text style={[styles.dropzoneTitle, { fontSize: fontScale(11.5) }]}>Upload Front</Text>
                          <Text style={styles.dropzoneSub}>JPG, PNG</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Back Side */}
                    <View style={styles.uploadCol}>
                      <Text style={styles.uploadFieldLabel}>BACK SIDE *</Text>
                      {idBackImage ? (
                        <View style={styles.previewBoxAqua}>
                          <Image source={{ uri: idBackImage }} style={styles.previewImg} resizeMode="cover" />
                          <TouchableOpacity
                            style={styles.trashCircleBtn}
                            onPress={() => setIdBackImage('')}
                          >
                            <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.aquaDropzone}
                          onPress={() => handlePickDocument('idBack')}
                          activeOpacity={0.8}
                        >
                          <View style={styles.dropzoneIconCircle}>
                            <Ionicons name="cloud-upload-outline" size={20} color="#0D9488" />
                          </View>
                          <Text style={[styles.dropzoneTitle, { fontSize: fontScale(11.5) }]}>Upload Back</Text>
                          <Text style={styles.dropzoneSub}>JPG, PNG</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Section 2: International Passport */}
                  <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
                    <View style={styles.sectionIconBadge}>
                      <Ionicons name="airplane-outline" size={14} color="#0D9488" />
                    </View>
                    <Text style={[styles.sectionTitleText, { fontSize: fontScale(12.5) }]}>
                      Section 2: International Passport
                    </Text>
                  </View>

                  <View style={{ width: '100%' }}>
                    <Text style={styles.uploadFieldLabel}>PASSPORT BIO PAGE *</Text>
                    {passportImage ? (
                      <View style={[styles.previewBoxAqua, { height: moderateScale(140) }]}>
                        <Image source={{ uri: passportImage }} style={styles.previewImg} resizeMode="cover" />
                        <TouchableOpacity
                          style={styles.trashCircleBtn}
                          onPress={() => setPassportImage('')}
                        >
                          <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.aquaDropzone, { height: moderateScale(120) }]}
                        onPress={() => handlePickDocument('passport')}
                        activeOpacity={0.8}
                      >
                        <View style={styles.dropzoneIconCircle}>
                          <Ionicons name="cloud-upload-outline" size={22} color="#0D9488" />
                        </View>
                        <Text style={[styles.dropzoneTitle, { fontSize: fontScale(12) }]}>
                          Upload Passport Bio Page Photo
                        </Text>
                        <Text style={styles.dropzoneSub}>Clear photo showing photo & passport number</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Actions Row */}
                  <View style={styles.bottomNavRow}>
                    <TouchableOpacity
                      style={styles.backNavBtn}
                      onPress={() => setStep(1)}
                    >
                      <Ionicons name="arrow-back" size={15} color="#0D9488" />
                      <Text style={[styles.backNavText, { fontSize: fontScale(13) }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { flex: 1, marginTop: 0, marginBottom: 0 },
                        (!idFrontImage || !idBackImage || !passportImage) && styles.disabledActionBtn,
                      ]}
                      onPress={() => setStep(3)}
                      disabled={!idFrontImage || !idBackImage || !passportImage}
                      activeOpacity={0.88}
                    >
                      <LinearGradient
                        colors={
                          !idFrontImage || !idBackImage || !passportImage
                            ? ['#94A3B8', '#64748B']
                            : ['#0D9488', '#0F766E', '#065F56']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.btnGradient}
                      >
                        <Text style={[styles.actionBtnText, { fontSize: fontScale(14) }]}>Continue to Selfie</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3: Live Selfie */}
              {step === 3 && (
                <View style={styles.stepCardContent}>
                  <View style={styles.selfieCenterContainer}>
                    {selfieImage ? (
                      <View
                        style={[
                          styles.selfieRingContainer,
                          {
                            width: selfieCircleSize,
                            height: selfieCircleSize,
                            borderRadius: selfieCircleSize / 2,
                          },
                        ]}
                      >
                        <Image source={{ uri: selfieImage }} style={styles.selfiePreviewImg} />
                        <TouchableOpacity
                          style={styles.retakeFloatingBtn}
                          onPress={() => {
                            setSelfieImage('');
                            setCameraActive(true);
                          }}
                        >
                          <Ionicons name="refresh" size={13} color="#FFFFFF" />
                          <Text style={[styles.retakeFloatingText, { fontSize: fontScale(11) }]}>Retake Photo</Text>
                        </TouchableOpacity>
                      </View>
                    ) : cameraActive ? (
                      <View
                        style={[
                          styles.selfieRingContainer,
                          {
                            width: selfieCircleSize,
                            height: selfieCircleSize,
                            borderRadius: selfieCircleSize / 2,
                          },
                        ]}
                      >
                        <CameraView
                          ref={cameraRef}
                          facing="front"
                          style={styles.cameraLiveFeed}
                        >
                          <TouchableOpacity
                            style={styles.captureSnapBtn}
                            onPress={handleCaptureSelfie}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="camera" size={26} color="#0D9488" />
                          </TouchableOpacity>
                        </CameraView>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.startCameraRing,
                          {
                            width: selfieCircleSize,
                            height: selfieCircleSize,
                            borderRadius: selfieCircleSize / 2,
                          },
                        ]}
                        onPress={handleStartCamera}
                        activeOpacity={0.8}
                      >
                        <View style={styles.cameraRingIcon}>
                          <Ionicons name="camera-outline" size={36} color="#0D9488" />
                        </View>
                        <Text style={[styles.startCameraTitle, { fontSize: fontScale(14) }]}>Start Live Camera</Text>
                        <Text style={[styles.startCameraSub, { fontSize: fontScale(10.5) }]}>
                          Tap to align face in frame
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Actions Row */}
                  <View style={styles.bottomNavRow}>
                    <TouchableOpacity
                      style={styles.backNavBtn}
                      onPress={() => {
                        setCameraActive(false);
                        setStep(2);
                      }}
                    >
                      <Ionicons name="arrow-back" size={15} color="#0D9488" />
                      <Text style={[styles.backNavText, { fontSize: fontScale(13) }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { flex: 1, marginTop: 0, marginBottom: 0 },
                        (!selfieImage || isSubmitting) && styles.disabledActionBtn,
                      ]}
                      onPress={handleKycSubmit}
                      disabled={!selfieImage || isSubmitting}
                      activeOpacity={0.88}
                    >
                      <LinearGradient
                        colors={
                          !selfieImage || isSubmitting
                            ? ['#94A3B8', '#64748B']
                            : ['#0D9488', '#0F766E', '#065F56']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.btnGradient}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <>
                            <Text style={[styles.actionBtnText, { fontSize: fontScale(13.5) }]}>
                              Submit KYC Documents
                            </Text>
                            <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            /* FULL-SCREEN IMMERSIVE ANIMATED STATUS VIEW */
            <Animated.View
              style={[
                styles.fullStatusContainer,
                {
                  opacity: statusFadeAnim,
                  transform: [{ scale: statusScaleAnim }],
                  minHeight: Math.max(windowHeight - insets.top - insets.bottom - 110, 560),
                },
              ]}
            >
              {currentKycStatus === 'PENDING' && (
                <View style={styles.fullStatusWrapper}>
                  {/* Glowing Animated Beacon Aura Ring */}
                  <View style={styles.beaconAuraCenter}>
                    <Animated.View
                      style={[
                        styles.beaconPulseRing,
                        {
                          borderColor: 'rgba(217, 119, 6, 0.28)',
                          backgroundColor: 'rgba(254, 243, 199, 0.35)',
                          transform: [{ scale: statusPulseAnim }],
                          opacity: statusGlowAnim,
                        },
                      ]}
                    />
                    <View style={[styles.beaconOuterRing, { borderColor: '#FDE68A' }]}>
                      <View style={[styles.beaconCoreIcon, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="hourglass" size={48} color="#D97706" />
                      </View>
                    </View>
                  </View>

                  {/* High-visibility Status Badge */}
                  <View style={[styles.fullStatusPillBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                    <Ionicons name="time" size={13} color="#D97706" />
                    <Text style={[styles.fullStatusPillBadgeText, { color: '#B45309' }]}>
                      VERIFICATION IN PROGRESS
                    </Text>
                  </View>

                  <Text style={[styles.fullStatusHeadline, { fontSize: fontScale(23) }]}>
                    KYC Under Review
                  </Text>
                  <Text style={[styles.fullStatusBody, { fontSize: fontScale(13.5) }]}>
                    We have securely received your <Text style={{ fontWeight: '800', color: '#062738' }}>National ID Card</Text>, <Text style={{ fontWeight: '800', color: '#062738' }}>Passport</Text>, and <Text style={{ fontWeight: '800', color: '#062738' }}>Live Facial Biometrics</Text>.
                  </Text>

                  {/* Verification Pipeline Steps Preview */}
                  <View style={styles.auditProcessCard}>
                    <View style={styles.auditStepRow}>
                      <View style={[styles.auditStepBullet, { backgroundColor: '#10B981' }]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.auditStepTitle, { fontSize: fontScale(13) }]}>Document Transmission</Text>
                        <Text style={[styles.auditStepSub, { fontSize: fontScale(11) }]}>End-to-end 256-bit AES encrypted</Text>
                      </View>
                      <Ionicons name="lock-closed" size={14} color="#10B981" />
                    </View>

                    <View style={styles.auditDividerLine} />

                    <View style={styles.auditStepRow}>
                      <View style={[styles.auditStepBullet, { backgroundColor: '#F59E0B' }]}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.auditStepTitle, { fontSize: fontScale(13) }]}>Compliance Verification</Text>
                        <Text style={[styles.auditStepSub, { fontSize: fontScale(11) }]}>Automated checks & officer review (12–24h)</Text>
                      </View>
                      <Text style={styles.auditStepBadgePending}>ACTIVE</Text>
                    </View>

                    <View style={styles.auditDividerLine} />

                    <View style={styles.auditStepRow}>
                      <View style={[styles.auditStepBullet, { backgroundColor: '#E2E8F0' }]}>
                        <Ionicons name="radio-button-off" size={12} color="#94A3B8" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.auditStepTitle, { fontSize: fontScale(13), color: '#64748B' }]}>Sender & Traveler Privileges</Text>
                        <Text style={[styles.auditStepSub, { fontSize: fontScale(11) }]}>Unlocked instantly once approved</Text>
                      </View>
                    </View>
                  </View>

                  {/* Quick Return Action Button */}
                  <TouchableOpacity
                    style={styles.fullStatusActionBtn}
                    onPress={onSuccess || onBack}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#0D9488', '#0F766E', '#065F56']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.fullStatusBtnGradient}
                    >
                      <Text style={[styles.actionBtnText, { fontSize: fontScale(15) }]}>Return to Dashboard</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.refreshStatusBtn}
                    onPress={fetchKycStatus}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh" size={14} color="#0D9488" />
                    <Text style={styles.refreshStatusBtnText}>Check Live Status</Text>
                  </TouchableOpacity>
                </View>
              )}

              {currentKycStatus === 'APPROVED' && (
                <View style={styles.fullStatusWrapper}>
                  {/* Glowing Green Verified Aura Ring */}
                  <View style={styles.beaconAuraCenter}>
                    <Animated.View
                      style={[
                        styles.beaconPulseRing,
                        {
                          borderColor: 'rgba(22, 163, 74, 0.28)',
                          backgroundColor: 'rgba(220, 252, 231, 0.45)',
                          transform: [{ scale: statusPulseAnim }],
                          opacity: statusGlowAnim,
                        },
                      ]}
                    />
                    <View style={[styles.beaconOuterRing, { borderColor: '#86EFAC' }]}>
                      <View style={[styles.beaconCoreIcon, { backgroundColor: '#DCFCE7' }]}>
                        <Ionicons name="shield-checkmark" size={50} color="#16A34A" />
                      </View>
                    </View>
                  </View>

                  <View style={[styles.fullStatusPillBadge, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
                    <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                    <Text style={[styles.fullStatusPillBadgeText, { color: '#16A34A' }]}>
                      KYC FULLY VERIFIED & ACTIVE
                    </Text>
                  </View>

                  <Text style={[styles.fullStatusHeadline, { fontSize: fontScale(24) }]}>
                    Identity Verified!
                  </Text>
                  <Text style={[styles.fullStatusBody, { fontSize: fontScale(13.5) }]}>
                    Congratulations, <Text style={{ fontWeight: '800', color: '#062738' }}>{user?.fullName || 'Traveler'}</Text>! Your profile now carries the verified global checkmark.
                  </Text>

                  {/* Feature Unlocked Cards */}
                  <View style={styles.verifiedPrivilegeCard}>
                    <View style={styles.privilegeItem}>
                      <View style={styles.privilegeIconWrap}>
                        <Ionicons name="airplane" size={16} color="#0D9488" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.privilegeTitle}>Unlimited Trips & Luggage Monetization</Text>
                        <Text style={styles.privilegeSub}>Post flight itineraries and earn secure fees</Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    </View>

                    <View style={styles.auditDividerLine} />

                    <View style={styles.privilegeItem}>
                      <View style={styles.privilegeIconWrap}>
                        <Ionicons name="cube" size={16} color="#0D9488" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.privilegeTitle}>Verified Parcel Sender Privileges</Text>
                        <Text style={styles.privilegeSub}>Ship with escrow protection across global routes</Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    </View>

                    <View style={styles.auditDividerLine} />

                    <View style={styles.privilegeItem}>
                      <View style={styles.privilegeIconWrap}>
                        <Ionicons name="wallet" size={16} color="#0D9488" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.privilegeTitle}>Instant Wallet Deposits & Withdrawals</Text>
                        <Text style={styles.privilegeSub}>Direct banking and payout channels unlocked</Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    </View>
                  </View>

                  {/* Continue to Dashboard Button */}
                  <TouchableOpacity
                    style={styles.fullStatusActionBtn}
                    onPress={onSuccess || onBack}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#0D9488', '#0F766E', '#065F56']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.fullStatusBtnGradient}
                    >
                      <Text style={[styles.actionBtnText, { fontSize: fontScale(15) }]}>Go to Dashboard</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {currentKycStatus === 'REJECTED' && (
                <View style={styles.fullStatusWrapper}>
                  {/* Glowing Red Warning Aura Ring */}
                  <View style={styles.beaconAuraCenter}>
                    <Animated.View
                      style={[
                        styles.beaconPulseRing,
                        {
                          borderColor: 'rgba(220, 38, 38, 0.32)',
                          backgroundColor: 'rgba(254, 226, 226, 0.45)',
                          transform: [{ scale: statusPulseAnim }],
                          opacity: statusGlowAnim,
                        },
                      ]}
                    />
                    <View style={[styles.beaconOuterRing, { borderColor: '#FECACA' }]}>
                      <View style={[styles.beaconCoreIcon, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="close-circle" size={50} color="#DC2626" />
                      </View>
                    </View>
                  </View>

                  <View style={[styles.fullStatusPillBadge, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <Ionicons name="alert-circle" size={13} color="#DC2626" />
                    <Text style={[styles.fullStatusPillBadgeText, { color: '#DC2626' }]}>
                      VERIFICATION DECLINED
                    </Text>
                  </View>

                  <Text style={[styles.fullStatusHeadline, { fontSize: fontScale(23) }]}>
                    Submission Declined
                  </Text>
                  <Text style={[styles.fullStatusBody, { fontSize: fontScale(13) }]}>
                    Our compliance team was unable to verify your identification documents. Please review the reason below and submit fresh photos.
                  </Text>

                  {/* Prominent Reason Alert Box */}
                  <View style={styles.fullRejectionNoticeBox}>
                    <View style={styles.rejectionReasonHeader}>
                      <Ionicons name="information-circle" size={18} color="#DC2626" />
                      <Text style={styles.rejectionReasonLabel}>OFFICIAL COMPLIANCE FEEDBACK</Text>
                    </View>
                    <Text style={[styles.rejectionNoticeText, { fontSize: fontScale(13) }]}>
                      "{rejectionReason || 'Uploaded document photos were blurry, cropped, or did not match the live selfie.'}"
                    </Text>
                    <View style={styles.rejectionTipsRow}>
                      <Ionicons name="bulb-outline" size={14} color="#B91C1C" />
                      <Text style={styles.rejectionTipsText}>
                        Tip: Ensure all 4 corners are visible with no glare or flash reflection.
                      </Text>
                    </View>
                  </View>

                  {/* Re-submit Action Button */}
                  <TouchableOpacity
                    style={styles.fullStatusActionBtn}
                    onPress={handleRetry}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#0D9488', '#0F766E', '#065F56']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.fullStatusBtnGradient}
                    >
                      <Ionicons name="refresh-circle" size={20} color="#FFFFFF" />
                      <Text style={[styles.actionBtnText, { fontSize: fontScale(15) }]}>
                        Re-submit Documents
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.refreshStatusBtn}
                    onPress={onBack}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={14} color="#64748B" />
                    <Text style={[styles.refreshStatusBtnText, { color: '#64748B' }]}>Back to Home</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#0D9488',
    fontWeight: '700',
  },
  waterGlowCircle: {
    position: 'absolute',
    top: -50,
    left: -60,
    borderRadius: 999,
    backgroundColor: 'rgba(45, 212, 191, 0.25)',
    zIndex: 0,
  },
  planeArtWrap: {
    position: 'absolute',
    top: 20,
    right: -25,
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
    width: 36,
    height: 36,
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
  centerLogoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topSymbolLogo: {
    width: 30,
    height: 30,
  },
  brandTitleText: {
    fontWeight: '900',
    color: '#0A1628',
    letterSpacing: 1.1,
  },
  brandTitleAccent: {
    color: '#0D9488',
  },
  topBadgeAqua: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.2,
    borderColor: '#99F6E4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  topBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0D9488',
  },
  scrollContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  centeredConstraintWrapper: {
    width: '100%',
  },
  formContainer: {
    width: '100%',
    zIndex: 2,
    marginTop: 6,
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
    marginBottom: 6,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  pillBadgeText: {
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.4,
  },
  welcomeTitle: {
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  welcomeSub: {
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  stepperContainer: {
    marginBottom: 16,
  },
  stepTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#0D9488',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  stepDotCompleted: {
    backgroundColor: '#14B8A6',
  },
  stepDotInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '900',
  },
  stepLabel: {
    fontWeight: '700',
  },
  stepLabelActive: {
    color: '#0D9488',
    fontWeight: '800',
  },
  stepLabelInactive: {
    color: '#94A3B8',
  },
  stepCardContent: {
    gap: 12,
  },
  aquaDocCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.4,
    borderColor: '#CCFBF1',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  docIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandatoryPill: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mandatoryPillText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  docCardTitle: {
    fontWeight: '900',
    color: '#062738',
  },
  docCardDesc: {
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  aquaNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(240, 253, 250, 0.9)',
    borderWidth: 1.2,
    borderColor: '#99F6E4',
    borderRadius: 14,
    padding: 10,
    marginTop: 2,
  },
  aquaNoticeText: {
    flex: 1,
    color: '#0F766E',
    fontWeight: '600',
    lineHeight: 16,
  },
  actionBtn: {
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  disabledActionBtn: {
    opacity: 0.65,
  },
  btnGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  actionBtnText: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  sectionIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleText: {
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadCol: {
    flex: 1,
  },
  uploadFieldLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  aquaDropzone: {
    height: 115,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dropzoneIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dropzoneTitle: {
    fontWeight: '800',
    color: '#062738',
    textAlign: 'center',
  },
  dropzoneSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  previewBoxAqua: {
    height: 115,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  trashCircleBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  backNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    justifyContent: 'center',
  },
  backNavText: {
    fontWeight: '800',
    color: '#0D9488',
  },
  selfieCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  selfieRingContainer: {
    borderWidth: 4,
    borderColor: '#0D9488',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  selfiePreviewImg: {
    width: '100%',
    height: '100%',
  },
  retakeFloatingBtn: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retakeFloatingText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cameraLiveFeed: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 14,
  },
  captureSnapBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  startCameraRing: {
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#0D9488',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cameraRingIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCameraTitle: {
    fontWeight: '900',
    color: '#062738',
  },
  startCameraSub: {
    color: '#64748B',
    fontWeight: '500',
  },
  fullStatusContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  fullStatusWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  beaconAuraCenter: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  beaconPulseRing: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 2,
  },
  beaconOuterRing: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  beaconCoreIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullStatusPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 14,
  },
  fullStatusPillBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  fullStatusHeadline: {
    fontWeight: '900',
    color: '#062738',
    textAlign: 'center',
    marginBottom: 8,
  },
  fullStatusBody: {
    color: '#475569',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 380,
    paddingHorizontal: 8,
  },
  auditProcessCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.3,
    borderColor: '#CCFBF1',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  auditStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  auditStepBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditStepTitle: {
    fontWeight: '800',
    color: '#062738',
  },
  auditStepSub: {
    color: '#64748B',
    marginTop: 2,
  },
  auditDividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
    marginLeft: 36,
  },
  auditStepBadgePending: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  verifiedPrivilegeCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.3,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  privilegeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  privilegeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privilegeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#062738',
  },
  privilegeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  fullRejectionNoticeBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.3,
    borderColor: '#FECACA',
    borderLeftWidth: 4.5,
    borderLeftColor: '#DC2626',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },
  rejectionReasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rejectionReasonLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.6,
  },
  rejectionNoticeText: {
    fontWeight: '700',
    color: '#7F1D1D',
    lineHeight: 20,
    marginBottom: 10,
  },
  rejectionTipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rejectionTipsText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
  },
  fullStatusActionBtn: {
    width: '100%',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  fullStatusBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  refreshStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  refreshStatusBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D9488',
  },
});

export default KycScreen;
