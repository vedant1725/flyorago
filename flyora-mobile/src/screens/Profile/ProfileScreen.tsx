import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Switch,
  Animated,
  Easing,
  Linking,
  Share,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getSafeHeaderPaddingTop,
  getSafeBottomPadding,
  fontScale,
  scale,
  verticalScale,
  moderateScale,
  SCREEN,
} from '../../constants/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl, apiFetch } from '../../services/api';
import { AppAlert as Alert } from '../../components/AppAlertModal';

interface ProfileScreenProps {
  onNavigateTab: (tabName: string) => void;
}

// Sub-screen navigation states: null = Main Menu list (Home page style), or specific sub-screen (Login watercolor style)
type SubScreenType = 'edit_profile' | 'notifications' | 'invite' | 'guidelines' | 'support' | null;

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateTab }) => {
  const insets = useSafeAreaInsets();
  const { user, currentRole, switchRole, kycStatus, logout } = useAuth();

  // Active Sub-Screen: null means Main Profile Screen (Home-page look with Menu list)
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreenType>(null);

  // Profile Form States
  const defaultNames = (user?.fullName || 'Akash Patel').trim().split(/\s+/);
  const [firstName, setFirstName] = useState(defaultNames[0] || 'Akash');
  const [lastName, setLastName] = useState(defaultNames.slice(1).join(' ') || 'Patel');
  const [email, setEmail] = useState(user?.email || 'akashbppatel001@gmail.com');
  const [phone, setPhone] = useState('+91 94277 00297');
  const [avatarUri, setAvatarUri] = useState<string>('');
  const [bio, setBio] = useState('Passionate international traveler and tech enthusiast. Happy to carry safe documents and verified items.');
  const [languages, setLanguages] = useState('English, Hindi, Gujarati');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Notification Preferences (Web Settings Image 2)
  const [pushNotify, setPushNotify] = useState(true);
  const [emailTripNotify, setEmailTripNotify] = useState(true);
  const [escrowNotify, setEscrowNotify] = useState(true);

  // Invite & Referral (Web Settings Image 3)
  const [copiedLink, setCopiedLink] = useState(false);
  const referralLink = `https://flyorago.me/signup?ref=${firstName.toLowerCase() || 'akash'}`;

  // Delete Account Request States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);

  // Server API Configuration Modal
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://192.168.0.117:8000');

  // Animated Transitions for Screen Navigation (Slide & Fade)
  const screenFadeAnim = useRef(new Animated.Value(1)).current;
  const screenSlideAnim = useRef(new Animated.Value(0)).current;

  // Navigate to Sub-Screen with smooth spring animation
  const openSubScreen = (screen: SubScreenType) => {
    Animated.timing(screenFadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setActiveSubScreen(screen);
      screenSlideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(screenFadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(screenSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Back to Main Profile Menu
  const goBackToMenu = () => {
    Animated.timing(screenFadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setActiveSubScreen(null);
      screenSlideAnim.setValue(-20);
      Animated.parallel([
        Animated.timing(screenFadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(screenSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const fetchProfileData = async () => {
    try {
      const res = await apiFetch('/api/profiles/me');
      if (res.success && res.data) {
        const d = res.data;
        if (d.first_name) setFirstName(d.first_name);
        if (d.last_name) setLastName(d.last_name);
        if (d.email) setEmail(d.email);
        if (d.phone_number) setPhone(d.phone_number);
        if (d.avatar || d.avatar_url) setAvatarUri(d.avatar || d.avatar_url);
        if (d.bio) setBio(d.bio);
        if (d.languages) setLanguages(d.languages);
        if (typeof d.pref_fragile === 'boolean') setPushNotify(d.pref_fragile);
        if (typeof d.pref_electronics === 'boolean') setEmailTripNotify(d.pref_electronics);
        if (typeof d.pref_documents === 'boolean') setEscrowNotify(d.pref_documents);
        if (typeof d.deletion_requested === 'boolean') setDeletionRequested(d.deletion_requested);
      }
    } catch {
      // Fallback
    }
  };

  // Pick Image from Camera Roll
  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll access is needed to update your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
        Alert.alert('Photo Selected', 'Photo attached. Tap "Save Profile Changes" below to sync.');
      }
    } catch {
      Alert.alert('Error', 'Could not open image library.');
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setSaveSuccessMsg('');
    try {
      const res = await apiFetch('/api/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phone.trim(),
          bio: bio.trim(),
          languages: languages.trim(),
          pref_fragile: pushNotify,
          pref_electronics: emailTripNotify,
          pref_documents: escrowNotify,
        }),
      });

      if (res.success) {
        setSaveSuccessMsg('Profile updated successfully!');
        Alert.alert('Success', 'Profile changes saved successfully.');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        Alert.alert('Save Failed', res.message || 'Could not update profile info.');
      }
    } catch (e: any) {
      Alert.alert('Connection Error', e.message || 'Could not connect to server.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Copy Referral Link
  const handleCopyInvite = () => {
    setCopiedLink(true);
    Share.share({
      message: `Join FlyoraGo and earn ₹250 wallet credits! Use my referral link: ${referralLink}`,
      title: 'Join FlyoraGo',
      url: referralLink,
    }).catch(() => {});
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Sign up on FlyoraGo using my invite link and get ₹250 bonus wallet credit: ${referralLink}`
    );
    Linking.openURL(`whatsapp://send?text=${text}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'Could not open WhatsApp on this device.');
    });
  };

  // Share via Telegram
  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `Hey! Sign up on FlyoraGo using my invite link and get ₹250 bonus wallet credit: ${referralLink}`
    );
    Linking.openURL(`tg://msg?text=${text}`).catch(() => {
      Alert.alert('Telegram Not Installed', 'Could not open Telegram on this device.');
    });
  };

  // Share via Email
  const handleShareEmail = () => {
    const subject = encodeURIComponent('Join me on FlyoraGo - Smart Travel Logistics');
    const body = encodeURIComponent(
      `Hi,\n\nI invite you to try FlyoraGo to monetize spare luggage space or send verified packages worldwide.\n\nSign up with my link and get ₹250 wallet credits:\n${referralLink}\n\nBest regards,\n${firstName}`
    );
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Email Client Error', 'Could not open email application.');
    });
  };

  // Delete Account Request
  const handleSubmitDelete = async () => {
    if (!deleteReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a brief reason for account deletion.');
      return;
    }
    setIsSubmittingDelete(true);
    try {
      const res = await apiFetch('/api/profiles/delete-request/', {
        method: 'POST',
        body: JSON.stringify({ reason: deleteReason.trim() }),
      });
      if (res.success || (res as any).status === 'success') {
        setDeletionRequested(true);
        setShowDeleteModal(false);
        Alert.alert(
          'Request Submitted',
          'Your account deletion request has been submitted to FlyoraGo administration team for review.'
        );
      } else {
        Alert.alert('Notice', res.message || 'Deletion request submitted.');
        setDeletionRequested(true);
        setShowDeleteModal(false);
      }
    } catch (e: any) {
      Alert.alert('Network Error', e.message || 'Could not submit request.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleCancelDelete = async () => {
    Alert.alert(
      'Cancel Deletion',
      'Do you want to cancel your account deletion request and keep your FlyoraGo account?',
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Cancel Deletion',
          onPress: async () => {
            try {
              await apiFetch('/api/profiles/delete-request/', { method: 'DELETE' });
              setDeletionRequested(false);
              setDeleteReason('');
              Alert.alert('Success', 'Account deletion request has been cancelled.');
            } catch {
              setDeletionRequested(false);
            }
          },
        },
      ]
    );
  };

  const openServerConfig = async () => {
    const current = await getApiBaseUrl();
    setServerUrl(current);
    setIsServerModalOpen(true);
  };

  const saveServerConfig = async () => {
    if (!serverUrl.trim()) return;
    await setApiBaseUrl(serverUrl.trim());
    setIsServerModalOpen(false);
    Alert.alert('Server Endpoint Updated', `App connected to: ${serverUrl.trim()}`);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of FlyoraGo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const initials = `${firstName[0] || 'A'}${lastName[0] || 'P'}`.toUpperCase();

  // Responsive Sub-Screen Header with Liquid Theme
  const renderSubScreenHeader = (title: string, subtitle: string) => (
    <View style={styles.subScreenHeader}>
      <TouchableOpacity
        style={styles.backButtonCircle}
        onPress={goBackToMenu}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={scale(22)} color="#0D9488" />
      </TouchableOpacity>
      <View style={{ flex: 1, marginLeft: scale(14) }}>
        <Text style={[styles.subScreenHeaderTitle, { fontSize: fontScale(20) }]}>{title}</Text>
        <Text style={[styles.subScreenHeaderSub, { fontSize: fontScale(12) }]} numberOfLines={1}>{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          flex: 1,
          opacity: screenFadeAnim,
          transform: [{ translateY: screenSlideAnim }],
        }}
      >
        {activeSubScreen === null ? (
          /* ═════════════════════════════════════════════════════════════ */
          /* 1. MAIN PROFILE PAGE (HEADER FIXED OUTSIDE SCROLLVIEW)      */
          /* ═════════════════════════════════════════════════════════════ */
          <View style={{ flex: 1 }}>
            {/* Top Header Card matching WalletScreen: Fixed Outside ScrollView */}
            <View style={styles.homeHeaderWrap}>
              <LinearGradient
                colors={['#033D37', '#065F56', '#089A8D']}
                locations={[0, 0.45, 1]}
                style={[
                  styles.homeHeaderGradient,
                  { paddingTop: getSafeHeaderPaddingTop(insets.top) },
                ]}
              >
                {/* Airplane Watermark Background Art */}
                <View style={styles.homeHeaderPlaneArtWrap} pointerEvents="none">
                  <ExpoImage
                    source={require('../../../assets/images/home-header-plane.png')}
                    style={styles.homeHeaderPlaneArt}
                    contentFit="contain"
                    priority="high"
                  />
                </View>

                {/* Top Bar with Title on Left & Server Settings on Right */}
                <View style={styles.homeTopBar}>
                  <View>
                    <Text style={[styles.homeGreetingText, { fontSize: fontScale(13) }]}>Account Settings</Text>
                    <View style={styles.homeNameRow}>
                      <Text style={[styles.homeUserNameText, { fontSize: fontScale(22) }]}>Profile & Preferences</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.homeHeaderIconBtn}
                    onPress={openServerConfig}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="settings-outline" size={scale(20)} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Profile Identity Card embedded inside Emerald Header */}
                <View style={styles.embeddedProfileCard}>
                  <View style={styles.embeddedAvatarZone}>
                    <TouchableOpacity
                      style={styles.homeAvatarCircle}
                      onPress={handlePickAvatar}
                      activeOpacity={0.85}
                    >
                      {avatarUri ? (
                        <ExpoImage
                          source={{ uri: avatarUri }}
                          style={styles.homeAvatarImage}
                          contentFit="cover"
                        />
                      ) : (
                        <Text style={[styles.homeAvatarInitials, { fontSize: fontScale(22) }]}>{initials}</Text>
                      )}
                      <View style={styles.homeAvatarCameraBadge}>
                        <Ionicons name="camera" size={scale(11)} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.embeddedInfoCol}>
                      <View style={styles.embeddedNameRow}>
                        <Text style={[styles.embeddedNameText, { fontSize: fontScale(18) }]} numberOfLines={1}>
                          {firstName} {lastName}
                        </Text>
                        <Ionicons name="checkmark-circle" size={scale(17)} color="#2DD4BF" />
                      </View>
                      <Text style={[styles.embeddedEmailText, { fontSize: fontScale(12) }]} numberOfLines={1}>
                        {email}
                      </Text>
                      <Text style={[styles.embeddedPhoneText, { fontSize: fontScale(12) }]} numberOfLines={1}>
                        {phone}
                      </Text>
                    </View>
                  </View>

                  {/* Trust Score & Completed Trips Mini Row */}
                  <View style={styles.embeddedStatsRow}>
                    <View style={styles.embeddedStatItem}>
                      <Text style={[styles.embeddedStatLabel, { fontSize: fontScale(10) }]}>COMPLETED</Text>
                      <Text style={[styles.embeddedStatVal, { fontSize: fontScale(13) }]}>6 Trips</Text>
                    </View>
                    <View style={styles.embeddedStatDivider} />
                    <View style={styles.embeddedStatItem}>
                      <Text style={[styles.embeddedStatLabel, { fontSize: fontScale(10) }]}>RATING</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star" size={scale(13)} color="#F59E0B" style={{ marginRight: 3 }} />
                        <Text style={[styles.embeddedStatVal, { fontSize: fontScale(13) }]}>5.0</Text>
                      </View>
                    </View>
                    <View style={styles.embeddedStatDivider} />
                    <View style={styles.embeddedStatItem}>
                      <Text style={[styles.embeddedStatLabel, { fontSize: fontScale(10) }]}>ACTIVE AS</Text>
                      <Text style={[styles.embeddedStatVal, { fontSize: fontScale(13), color: '#2DD4BF' }]}>
                        {currentRole === 'sender' ? 'Sender' : 'Traveler'}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Scrollable Body Content Below Fixed Header */}
            <ScrollView
              contentContainerStyle={styles.mainScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Main Content Area under Header */}
              <View style={[styles.homeBodyContent, { paddingBottom: insets.bottom + 100 }]}>
              {/* Persona Switcher Quick Card (Home Page Style) */}
              <TouchableOpacity
                style={styles.personaBannerCard}
                onPress={switchRole}
                activeOpacity={0.85}
              >
                <View style={styles.personaLeftRow}>
                  <View style={styles.personaIconBox}>
                    <Ionicons name="swap-horizontal" size={scale(20)} color="#089A8D" />
                  </View>
                  <View>
                    <Text style={[styles.personaTitle, { fontSize: fontScale(14) }]}>Switch User Persona</Text>
                    <Text style={[styles.personaSub, { fontSize: fontScale(12) }]}>
                      Active browsing as <Text style={{ fontWeight: '800', color: '#089A8D' }}>{currentRole.toUpperCase()}</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.personaPill}>
                  <Text style={[styles.personaPillText, { fontSize: fontScale(11) }]}>
                    Toggle to {currentRole === 'sender' ? 'Traveler' : 'Sender'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* KYC Status Strip */}
              <TouchableOpacity
                style={[
                  styles.kycBannerCard,
                  kycStatus === 'APPROVED' ? styles.kycBannerApproved : styles.kycBannerPending,
                ]}
                onPress={() => onNavigateTab('kyc')}
                activeOpacity={0.85}
              >
                <View style={styles.kycLeftRow}>
                  <View
                    style={[
                      styles.kycIconBox,
                      { backgroundColor: kycStatus === 'APPROVED' ? '#E6FAF6' : '#FEF3C7' },
                    ]}
                  >
                    <Ionicons
                      name={kycStatus === 'APPROVED' ? 'shield-checkmark' : 'alert-circle'}
                      size={scale(20)}
                      color={kycStatus === 'APPROVED' ? '#089A8D' : '#D97706'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.kycTitle, { fontSize: fontScale(13) }]}>
                      {kycStatus === 'APPROVED' ? 'Identity KYC Verified' : 'Identity Verification Required'}
                    </Text>
                    <Text style={[styles.kycSub, { fontSize: fontScale(11) }]}>
                      {kycStatus === 'APPROVED'
                        ? 'Passport and National ID verified. Full permissions active.'
                        : 'Submit identity proof to list luggage and carry orders.'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={scale(18)} color="#94A3B8" />
              </TouchableOpacity>

              {/* Menu Section Title */}
              <Text style={[styles.menuSectionHeader, { fontSize: fontScale(11) }]}>ACCOUNT & SETTINGS</Text>

              {/* Clean Menu List in Single Stack */}
              <View style={styles.menuStackCard}>
                {/* Menu Item 1: My Profile */}
                <TouchableOpacity
                  style={styles.menuActionItem}
                  onPress={() => openSubScreen('edit_profile')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: '#E6FAF6' }]}>
                    <Ionicons name="person-outline" size={scale(19)} color="#089A8D" />
                  </View>
                  <View style={styles.menuContentCol}>
                    <Text style={[styles.menuTitleText, { fontSize: fontScale(14) }]}>My Profile</Text>
                    <Text style={[styles.menuSubText, { fontSize: fontScale(11) }]}>
                      Personal information, contact details, bio & avatar
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={scale(18)} color="#94A3B8" />
                </TouchableOpacity>

                <View style={styles.menuDividerLine} />

                {/* Menu Item 2: Notifications */}
                <TouchableOpacity
                  style={styles.menuActionItem}
                  onPress={() => openSubScreen('notifications')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="notifications-outline" size={scale(19)} color="#2563EB" />
                  </View>
                  <View style={styles.menuContentCol}>
                    <Text style={[styles.menuTitleText, { fontSize: fontScale(14) }]}>Notifications</Text>
                    <Text style={[styles.menuSubText, { fontSize: fontScale(11) }]}>
                      Push alerts, email flight summaries & escrow updates
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={scale(18)} color="#94A3B8" />
                </TouchableOpacity>

                <View style={styles.menuDividerLine} />

                {/* Menu Item 3: Invite Friends */}
                <TouchableOpacity
                  style={styles.menuActionItem}
                  onPress={() => openSubScreen('invite')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: '#FDF4FF' }]}>
                    <Ionicons name="gift-outline" size={scale(19)} color="#A855F7" />
                  </View>
                  <View style={styles.menuContentCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.menuTitleText, { fontSize: fontScale(14) }]}>Invite Friends</Text>
                      <View style={styles.earnBadge}>
                        <Text style={[styles.earnBadgeText, { fontSize: fontScale(9) }]}>EARN ₹250</Text>
                      </View>
                    </View>
                    <Text style={[styles.menuSubText, { fontSize: fontScale(11) }]}>
                      Earn ₹250 wallet bonus on friend's first delivery
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={scale(18)} color="#94A3B8" />
                </TouchableOpacity>

                <View style={styles.menuDividerLine} />

                {/* Menu Item 4: Community Guidelines */}
                <TouchableOpacity
                  style={styles.menuActionItem}
                  onPress={() => openSubScreen('guidelines')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="shield-checkmark-outline" size={scale(19)} color="#16A34A" />
                  </View>
                  <View style={styles.menuContentCol}>
                    <Text style={[styles.menuTitleText, { fontSize: fontScale(14) }]}>Community Guidelines</Text>
                    <Text style={[styles.menuSubText, { fontSize: fontScale(11) }]}>
                      Inspection rules, prohibited goods & safe escrow
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={scale(18)} color="#94A3B8" />
                </TouchableOpacity>

                <View style={styles.menuDividerLine} />

                {/* Menu Item 5: Help & Support */}
                <TouchableOpacity
                  style={styles.menuActionItem}
                  onPress={() => openSubScreen('support')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="headset-outline" size={scale(19)} color="#D97706" />
                  </View>
                  <View style={styles.menuContentCol}>
                    <Text style={[styles.menuTitleText, { fontSize: fontScale(14) }]}>Help & Support</Text>
                    <Text style={[styles.menuSubText, { fontSize: fontScale(11) }]}>
                      24/7 Support Desk, email, toll-free & WhatsApp chat
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={scale(18)} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.homeLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={scale(18)} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={[styles.homeLogoutText, { fontSize: fontScale(14) }]}>Log Out of FlyoraGo</Text>
              </TouchableOpacity>

              <Text style={[styles.homeVersionFooter, { fontSize: fontScale(11) }]}>FlyoraGo Mobile v2.4.0 • Build 8081</Text>
            </View>
          </ScrollView>
        </View>
        ) : (
          /* ═════════════════════════════════════════════════════════════ */
          /* 2. INNER SUB-PAGES (EXACTLY MATCHING LOGIN WATERCOLOR THEME) */
          /* ═════════════════════════════════════════════════════════════ */
          <View style={{ flex: 1 }}>
            {/* Liquid Watercolor Gradient Background: Soft Mint to Crystal White */}
            <LinearGradient
              colors={['#A7F3D0', '#CCFBF1', '#E6FAF6', '#F4FBF9', '#FFFFFF', '#FFFFFF']}
              locations={[0, 0.18, 0.38, 0.6, 0.85, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Glowing Water Wave & Plane Watermark (Login Screen Signature) */}
            <View style={styles.waterGlowCircle} pointerEvents="none" />
            <View style={styles.planeArtWrap} pointerEvents="none">
              <ExpoImage
                source={require('../../../assets/images/home-header-plane.png')}
                style={styles.planeArt}
                contentFit="contain"
                priority="high"
              />
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.subScrollContent,
                {
                  paddingTop: getSafeHeaderPaddingTop(insets.top) + 6,
                  paddingBottom: insets.bottom + 80,
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* SUB-SCREEN 1: EDIT PROFILE */}
              {activeSubScreen === 'edit_profile' && (
                <View>
                  {renderSubScreenHeader('My Profile', 'Manage your personal information & contact details')}

                  <View style={styles.waterFormCard}>
                    {/* Centered Avatar Picker with Camera Badge */}
                    <View style={styles.avatarPickerCenter}>
                      <TouchableOpacity
                        style={styles.largeAvatarCircle}
                        onPress={handlePickAvatar}
                        activeOpacity={0.85}
                      >
                        {avatarUri ? (
                          <ExpoImage
                            source={{ uri: avatarUri }}
                            style={styles.largeAvatarImage}
                            contentFit="cover"
                          />
                        ) : (
                          <Text style={[styles.largeAvatarInitials, { fontSize: fontScale(28) }]}>{initials}</Text>
                        )}
                        <View style={styles.largeAvatarCameraBadge}>
                          <Ionicons name="camera" size={scale(15)} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                      <Text style={[styles.avatarHintText, { fontSize: fontScale(11) }]}>
                        Tap avatar to upload new photo (Max 5MB)
                      </Text>
                    </View>

                    {/* Success Message Banner */}
                    {!!saveSuccessMsg && (
                      <View style={styles.waterSuccessBanner}>
                        <Ionicons name="checkmark-circle" size={scale(18)} color="#0D9488" />
                        <Text style={[styles.waterSuccessText, { fontSize: fontScale(12) }]}>{saveSuccessMsg}</Text>
                      </View>
                    )}

                    {/* First Name & Last Name */}
                    <View style={styles.waterInputGroup}>
                      <Text style={[styles.waterInputLabel, { fontSize: fontScale(10) }]}>FIRST NAME</Text>
                      <View style={styles.waterInputWrap}>
                        <Ionicons name="person-outline" size={scale(18)} color="#0D9488" style={{ marginRight: 10 }} />
                        <TextInput
                          style={[styles.waterTextInput, { fontSize: fontScale(13) }]}
                          value={firstName}
                          onChangeText={setFirstName}
                          placeholder="Enter first name"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>

                    <View style={styles.waterInputGroup}>
                      <Text style={[styles.waterInputLabel, { fontSize: fontScale(10) }]}>LAST NAME</Text>
                      <View style={styles.waterInputWrap}>
                        <Ionicons name="person-outline" size={scale(18)} color="#0D9488" style={{ marginRight: 10 }} />
                        <TextInput
                          style={[styles.waterTextInput, { fontSize: fontScale(13) }]}
                          value={lastName}
                          onChangeText={setLastName}
                          placeholder="Enter last name"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>

                    {/* Email */}
                    <View style={styles.waterInputGroup}>
                      <Text style={[styles.waterInputLabel, { fontSize: fontScale(10) }]}>EMAIL ADDRESS</Text>
                      <View style={styles.waterInputWrap}>
                        <Ionicons name="mail-outline" size={scale(18)} color="#0D9488" style={{ marginRight: 10 }} />
                        <TextInput
                          style={[styles.waterTextInput, { fontSize: fontScale(13) }]}
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          placeholder="name@flyorago.me"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.waterInputGroup}>
                      <Text style={[styles.waterInputLabel, { fontSize: fontScale(10) }]}>PHONE NUMBER</Text>
                      <View style={styles.waterInputWrap}>
                        <Ionicons name="call-outline" size={scale(18)} color="#0D9488" style={{ marginRight: 10 }} />
                        <TextInput
                          style={[styles.waterTextInput, { fontSize: fontScale(13) }]}
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                          placeholder="+91 94277 00297"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>

                    {/* Languages */}
                    <View style={styles.waterInputGroup}>
                      <Text style={[styles.waterInputLabel, { fontSize: fontScale(10) }]}>LANGUAGES SPOKEN</Text>
                      <View style={styles.waterInputWrap}>
                        <Ionicons name="globe-outline" size={scale(18)} color="#0D9488" style={{ marginRight: 10 }} />
                        <TextInput
                          style={[styles.waterTextInput, { fontSize: fontScale(13) }]}
                          value={languages}
                          onChangeText={setLanguages}
                          placeholder="e.g. English, Hindi, Gujarati"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>

                    {/* Bio */}
                    <View style={styles.waterInputGroup}>
                      <Text style={[styles.waterInputLabel, { fontSize: fontScale(10) }]}>BIO DETAILS</Text>
                      <View style={[styles.waterInputWrap, { height: scale(80), alignItems: 'flex-start', paddingTop: 10 }]}>
                        <TextInput
                          style={[styles.waterTextInput, { height: scale(60), fontSize: fontScale(13) }]}
                          value={bio}
                          onChangeText={setBio}
                          multiline
                          placeholder="Describe your travel frequency, preferred item types, etc."
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                      style={[styles.waterActionBtn, isSavingProfile && { opacity: 0.7 }]}
                      onPress={handleSaveProfile}
                      disabled={isSavingProfile}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#0D9488', '#089A8D', '#065F56']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.waterBtnGradient}
                      >
                        <Ionicons name="save-outline" size={scale(18)} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={[styles.waterBtnText, { fontSize: fontScale(13) }]}>
                          {isSavingProfile ? 'SAVING CHANGES...' : 'SAVE PROFILE CHANGES'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Danger Zone */}
                  <View style={styles.waterDangerCard}>
                    <View style={styles.waterDangerHeader}>
                      <Ionicons name="warning-outline" size={scale(20)} color="#DC2626" />
                      <Text style={[styles.waterDangerTitle, { fontSize: fontScale(14) }]}>Danger Zone</Text>
                    </View>
                    <Text style={[styles.waterDangerSub, { fontSize: fontScale(11) }]}>
                      Permanently delete your FlyoraGo account and remove active trip listings. This action is irreversible.
                    </Text>

                    {deletionRequested ? (
                      <View style={styles.waterPendingDeleteWrap}>
                        <Text style={[styles.waterPendingDeleteText, { fontSize: fontScale(11) }]}>
                          Account deletion is currently pending admin review.
                        </Text>
                        <TouchableOpacity
                          style={styles.waterCancelDeleteBtn}
                          onPress={handleCancelDelete}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.waterCancelDeleteText, { fontSize: fontScale(11) }]}>Cancel Deletion Request</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.waterDeleteBtn}
                        onPress={() => setShowDeleteModal(true)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="trash-outline" size={scale(17)} color="#DC2626" style={{ marginRight: 8 }} />
                        <Text style={[styles.waterDeleteBtnText, { fontSize: fontScale(12) }]}>Request Account Deletion</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* SUB-SCREEN 2: NOTIFICATIONS */}
              {activeSubScreen === 'notifications' && (
                <View>
                  {renderSubScreenHeader('Notifications', 'Manage your push, email & escrow alerts')}

                  <View style={styles.waterFormCard}>
                    <Text style={[styles.waterCardHeaderTag, { fontSize: fontScale(11) }]}>NOTIFICATION PREFERENCES</Text>
                    <Text style={[styles.waterCardSubDesc, { fontSize: fontScale(12) }]}>
                      Choose how you want FlyoraGo to keep you updated about matches, luggage space, and payments.
                    </Text>

                    {/* Preference 1 */}
                    <View style={styles.waterPrefRow}>
                      <View style={[styles.waterPrefIconWrap, { backgroundColor: '#E6FAF6' }]}>
                        <Ionicons name="notifications" size={scale(20)} color="#0D9488" />
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[styles.waterPrefTitle, { fontSize: fontScale(13) }]}>Browser & Mobile Push Notifications</Text>
                        <Text style={[styles.waterPrefSub, { fontSize: fontScale(11) }]}>
                          Receive real-time alerts when travelers match or message you.
                        </Text>
                      </View>
                      <Switch
                        value={pushNotify}
                        onValueChange={setPushNotify}
                        trackColor={{ false: '#E2E8F0', true: '#99F6E4' }}
                        thumbColor={pushNotify ? '#0D9488' : '#FFFFFF'}
                      />
                    </View>

                    <View style={styles.waterPrefDivider} />

                    {/* Preference 2 */}
                    <View style={styles.waterPrefRow}>
                      <View style={[styles.waterPrefIconWrap, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="mail" size={scale(20)} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[styles.waterPrefTitle, { fontSize: fontScale(13) }]}>Email Flight & Delivery Summaries</Text>
                        <Text style={[styles.waterPrefSub, { fontSize: fontScale(11) }]}>
                          Get journey receipts, flight itinerary updates, and booking PDFs.
                        </Text>
                      </View>
                      <Switch
                        value={emailTripNotify}
                        onValueChange={setEmailTripNotify}
                        trackColor={{ false: '#E2E8F0', true: '#99F6E4' }}
                        thumbColor={emailTripNotify ? '#0D9488' : '#FFFFFF'}
                      />
                    </View>

                    <View style={styles.waterPrefDivider} />

                    {/* Preference 3 */}
                    <View style={styles.waterPrefRow}>
                      <View style={[styles.waterPrefIconWrap, { backgroundColor: '#ECFDF5' }]}>
                        <Ionicons name="shield-checkmark" size={scale(20)} color="#10B981" />
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[styles.waterPrefTitle, { fontSize: fontScale(13) }]}>Escrow Security & Payout Alerts</Text>
                        <Text style={[styles.waterPrefSub, { fontSize: fontScale(11) }]}>
                          Instant alerts when payments are deposited into escrow or released to wallet.
                        </Text>
                      </View>
                      <Switch
                        value={escrowNotify}
                        onValueChange={setEscrowNotify}
                        trackColor={{ false: '#E2E8F0', true: '#99F6E4' }}
                        thumbColor={escrowNotify ? '#0D9488' : '#FFFFFF'}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.waterActionBtn, { marginTop: scale(24) }]}
                      onPress={handleSaveProfile}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#0D9488', '#089A8D', '#065F56']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.waterBtnGradient}
                      >
                        <Text style={[styles.waterBtnText, { fontSize: fontScale(13) }]}>SAVE PREFERENCES</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* SUB-SCREEN 3: INVITE FRIENDS */}
              {activeSubScreen === 'invite' && (
                <View>
                  {renderSubScreenHeader('Invite Friends', 'Earn bonus luggage credits for every friend')}

                  <View style={styles.waterFormCard}>
                    <View style={styles.waterReferralBadge}>
                      <Text style={[styles.waterReferralBadgeText, { fontSize: fontScale(10) }]}>REFERRAL PROGRAM</Text>
                    </View>
                    <Text style={[styles.waterReferralHeroTitle, { fontSize: fontScale(18) }]}>
                      Invite Friends & Earn Bonus Luggage Credits
                    </Text>
                    <Text style={[styles.waterReferralHeroSub, { fontSize: fontScale(12) }]}>
                      Invite your traveler and sender friends to FlyoraGo. When they complete their first delivery, both of you earn ₹250 wallet credits!
                    </Text>

                    {/* Referral Link Box */}
                    <View style={styles.waterReferralLinkBox}>
                      <Text style={[styles.waterReferralLinkText, { fontSize: fontScale(11) }]} numberOfLines={1}>
                        {referralLink}
                      </Text>
                      <TouchableOpacity
                        style={styles.waterCopyLinkBtn}
                        onPress={handleCopyInvite}
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name={copiedLink ? 'checkmark' : 'copy-outline'}
                          size={scale(15)}
                          color="#FFFFFF"
                          style={{ marginRight: 5 }}
                        />
                        <Text style={[styles.waterCopyLinkBtnText, { fontSize: fontScale(11) }]}>
                          {copiedLink ? 'Copied' : 'Copy Link'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Share Platforms */}
                    <Text style={[styles.waterShareHeading, { fontSize: fontScale(10) }]}>SHARE VIA PLATFORMS</Text>
                    <View style={styles.waterShareRow}>
                      <TouchableOpacity
                        style={[styles.waterPlatformBtn, { backgroundColor: '#25D366' }]}
                        onPress={handleShareWhatsApp}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="logo-whatsapp" size={scale(18)} color="#FFFFFF" />
                        <Text style={[styles.waterPlatformBtnText, { fontSize: fontScale(11) }]}>WhatsApp</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.waterPlatformBtn, { backgroundColor: '#EA4335' }]}
                        onPress={handleShareEmail}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="mail" size={scale(18)} color="#FFFFFF" />
                        <Text style={[styles.waterPlatformBtnText, { fontSize: fontScale(11) }]}>Email</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.waterPlatformBtn, { backgroundColor: '#0088CC' }]}
                        onPress={handleShareTelegram}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="paper-plane" size={scale(18)} color="#FFFFFF" />
                        <Text style={[styles.waterPlatformBtnText, { fontSize: fontScale(11) }]}>Telegram</Text>
                      </TouchableOpacity>
                    </View>

                    {/* More Share Options */}
                    <TouchableOpacity
                      style={styles.waterDirectShareBtn}
                      onPress={handleCopyInvite}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="share-social-outline" size={scale(18)} color="#0D9488" style={{ marginRight: 8 }} />
                      <Text style={[styles.waterDirectShareBtnText, { fontSize: fontScale(12) }]}>More Sharing Options</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* SUB-SCREEN 4: GUIDELINES */}
              {activeSubScreen === 'guidelines' && (
                <View>
                  {renderSubScreenHeader('Community Guidelines', 'Policies for safe, verified and trusted shipping')}

                  <View style={styles.waterFormCard}>
                    <Text style={[styles.waterCardHeaderTag, { fontSize: fontScale(11) }]}>OFFICIAL SAFETY PROTOCOLS</Text>
                    <Text style={[styles.waterCardSubDesc, { fontSize: fontScale(12) }]}>
                      To keep FlyoraGo safe, trusted, and respectful for travelers and senders, all users must adhere to these policies:
                    </Text>

                    {[
                      {
                        title: 'Physical Inspection Required',
                        desc: 'Travelers must physically inspect all contents before accepting any parcel for travel.',
                        icon: 'eye-outline',
                      },
                      {
                        title: 'Strictly Prohibited Goods',
                        desc: 'Never carry hazardous substances, contraband, unpackaged perishables, or illegal materials.',
                        icon: 'ban-outline',
                      },
                      {
                        title: 'Secure Escrow Only',
                        desc: 'Never exchange off-platform cash. All payments must stay secured in Flyora Escrow.',
                        icon: 'lock-closed-outline',
                      },
                      {
                        title: 'OTP Handover Verification',
                        desc: 'Only release package at dropoff upon matching the secure receiver OTP code.',
                        icon: 'keypad-outline',
                      },
                      {
                        title: 'Honest Space & Weight',
                        desc: 'Accurately declare parcel weight and dimensions to avoid airline overweight baggage penalties.',
                        icon: 'scale-outline',
                      },
                      {
                        title: 'Respect & Communication',
                        desc: 'Maintain respectful, prompt communication between travelers and senders at all times.',
                        icon: 'chatbubbles-outline',
                      },
                    ].map((guide, idx) => (
                      <View key={idx} style={styles.waterGuideItem}>
                        <View style={styles.waterGuideIconWrap}>
                          <Ionicons name={guide.icon as any} size={scale(18)} color="#0D9488" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.waterGuideTitle, { fontSize: fontScale(13) }]}>{guide.title}</Text>
                          <Text style={[styles.waterGuideDesc, { fontSize: fontScale(11) }]}>{guide.desc}</Text>
                        </View>
                      </View>
                    ))}

                    <View style={styles.waterWarningBox}>
                      <Ionicons name="information-circle" size={scale(20)} color="#D97706" style={{ marginRight: 10 }} />
                      <Text style={[styles.waterWarningText, { fontSize: fontScale(11) }]}>
                        Failure to follow community guidelines may result in trust score deduction, payout freeze, or account termination.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* SUB-SCREEN 5: HELP & SUPPORT */}
              {activeSubScreen === 'support' && (
                <View>
                  {renderSubScreenHeader('Help & Support', '24/7 Support Desk for inquiries, claims & disputes')}

                  <View style={styles.waterFormCard}>
                    <View style={styles.waterSupportBadge}>
                      <Ionicons name="headset" size={scale(13)} color="#0D9488" />
                      <Text style={[styles.waterSupportBadgeText, { fontSize: fontScale(10) }]}>24/7 SUPPORT DESK</Text>
                    </View>

                    <Text style={[styles.waterSupportHeroTitle, { fontSize: fontScale(18) }]}>Help & Customer Support</Text>
                    <Text style={[styles.waterSupportHeroSub, { fontSize: fontScale(12) }]}>
                      Got questions about your trip, baggage booking, or escrow release? Our dedicated support team is available 24/7.
                    </Text>

                    {/* Email Card */}
                    <TouchableOpacity
                      style={styles.waterSupportCardLink}
                      onPress={() => Linking.openURL('mailto:support@flyorago.me')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.waterSupportIconWrap, { backgroundColor: '#E6FAF6' }]}>
                        <Ionicons name="mail" size={scale(22)} color="#0D9488" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.waterSupportCardTitle, { fontSize: fontScale(13) }]}>Email Support</Text>
                        <Text style={[styles.waterSupportCardSub, { fontSize: fontScale(11) }]}>For detailed inquiries & disputes</Text>
                        <Text style={[styles.waterSupportCardAction, { fontSize: fontScale(11) }]}>support@flyorago.me →</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Helpline Card */}
                    <TouchableOpacity
                      style={styles.waterSupportCardLink}
                      onPress={() => Linking.openURL('tel:+9118002004567')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.waterSupportIconWrap, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="call" size={scale(22)} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.waterSupportCardTitle, { fontSize: fontScale(13) }]}>Toll-Free Helpline</Text>
                        <Text style={[styles.waterSupportCardSub, { fontSize: fontScale(11) }]}>Instant phone assistance</Text>
                        <Text style={[styles.waterSupportCardAction, { color: '#2563EB', fontSize: fontScale(11) }]}>+91 1800 200 4567 →</Text>
                      </View>
                    </TouchableOpacity>

                    {/* WhatsApp Card */}
                    <TouchableOpacity
                      style={styles.waterSupportCardLink}
                      onPress={() => Linking.openURL('https://wa.me/919427700297?text=Hi%20FlyoraGo%20Support')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.waterSupportIconWrap, { backgroundColor: '#ECFDF5' }]}>
                        <Ionicons name="logo-whatsapp" size={scale(22)} color="#16A34A" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.waterSupportCardTitle, { fontSize: fontScale(13) }]}>WhatsApp Live Chat</Text>
                        <Text style={[styles.waterSupportCardSub, { fontSize: fontScale(11) }]}>Quick questions & tracking help</Text>
                        <Text style={[styles.waterSupportCardAction, { color: '#16A34A', fontSize: fontScale(11) }]}>Chat on WhatsApp →</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DELETE ACCOUNT MODAL                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.dangerIconCircle}>
                <Ionicons name="trash" size={scale(22)} color="#DC2626" />
              </View>
              <Text style={[styles.modalTitle, { fontSize: fontScale(17) }]}>Delete FlyoraGo Account</Text>
            </View>
            <Text style={[styles.modalSub, { fontSize: fontScale(12) }]}>
              Are you sure you want to request account deletion? Please let us know the reason so we can process your request:
            </Text>

            <TextInput
              style={[styles.modalTextInput, { fontSize: fontScale(13) }]}
              value={deleteReason}
              onChangeText={setDeleteReason}
              placeholder="E.g. No longer traveling, moving to another service..."
              placeholderTextColor="#94A3B8"
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelBtnText, { fontSize: fontScale(13) }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, isSubmittingDelete && { opacity: 0.6 }]}
                onPress={handleSubmitDelete}
                disabled={isSubmittingDelete}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalConfirmBtnText, { fontSize: fontScale(13) }]}>
                  {isSubmittingDelete ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SERVER ENDPOINT CONFIG MODAL                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal
        visible={isServerModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsServerModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { fontSize: fontScale(17) }]}>Configure API Server</Text>
            <Text style={[styles.modalSub, { fontSize: fontScale(12) }]}>
              Set your local network IP (e.g. http://192.168.0.117:8000) for testing with the backend:
            </Text>
            <TextInput
              style={[styles.serverInput, { fontSize: fontScale(13) }]}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://192.168.x.x:8000"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsServerModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelBtnText, { fontSize: fontScale(13) }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={saveServerConfig}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalSaveBtnText, { fontSize: fontScale(13) }]}>Save</Text>
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
    backgroundColor: '#F8FCFB',
  },

  // ═══════════════════════════════════════════════════════════════
  // 1. MAIN PROFILE PAGE (EXACT SAME AS HOME / DASHBOARD SCREEN)
  // ═══════════════════════════════════════════════════════════════
  mainScrollContent: {
    paddingBottom: 20,
  },
  homeHeaderWrap: {
    borderBottomLeftRadius: scale(36),
    borderBottomRightRadius: scale(36),
    overflow: 'hidden',
    backgroundColor: '#033D37',
    ...Shadows.card,
  },
  homeHeaderGradient: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(24),
    position: 'relative',
  },
  homeHeaderPlaneArtWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 12,
    right: -25,
    width: scale(250),
    height: scale(190),
    opacity: 0.22,
    zIndex: 1,
  },
  homeHeaderPlaneArt: {
    width: '100%',
    height: '100%',
  },
  homeTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
    zIndex: 2,
  },
  homeGreetingText: {
    color: '#A7D9D3',
    fontWeight: '500',
  },
  homeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  homeUserNameText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  homeHeaderIconBtn: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Identity Card embedded inside Emerald Header
  embeddedProfileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    padding: scale(16),
    zIndex: 2,
  },
  embeddedAvatarZone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeAvatarCircle: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: '#089A8D',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  homeAvatarImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
  },
  homeAvatarInitials: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  homeAvatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#065F56',
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  embeddedInfoCol: {
    flex: 1,
    marginLeft: scale(14),
  },
  embeddedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  embeddedNameText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  embeddedEmailText: {
    color: '#CCFBF1',
    marginTop: 2,
  },
  embeddedPhoneText: {
    color: '#99F6E4',
    fontWeight: '600',
    marginTop: 1,
  },
  embeddedStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: scale(14),
    paddingVertical: scale(10),
    marginTop: scale(14),
  },
  embeddedStatItem: {
    alignItems: 'center',
  },
  embeddedStatLabel: {
    fontWeight: '700',
    color: '#A7D9D3',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  embeddedStatVal: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  embeddedStatDivider: {
    width: 1,
    height: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },

  // Main Body Content under Header
  homeBodyContent: {
    paddingHorizontal: scale(18),
    paddingTop: scale(16),
  },
  personaBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    padding: scale(14),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  personaLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personaIconBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  personaTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  personaSub: {
    color: '#64748B',
    marginTop: 1,
  },
  personaPill: {
    backgroundColor: '#E6FAF6',
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(20),
  },
  personaPillText: {
    fontWeight: '700',
    color: '#089A8D',
  },

  kycBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    padding: scale(14),
    marginBottom: scale(20),
    borderWidth: 1,
    ...Shadows.sm,
  },
  kycBannerApproved: {
    borderColor: '#A7F3D0',
  },
  kycBannerPending: {
    borderColor: '#FDE68A',
  },
  kycLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  kycIconBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  kycTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  kycSub: {
    color: '#64748B',
    marginTop: 1,
  },

  menuSectionHeader: {
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: scale(8),
    marginLeft: scale(4),
  },
  menuStackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: scale(20),
    ...Shadows.card,
  },
  menuActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(14),
    paddingHorizontal: scale(16),
  },
  menuIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(14),
  },
  menuContentCol: {
    flex: 1,
    paddingRight: scale(6),
  },
  menuTitleText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSubText: {
    color: '#64748B',
    marginTop: 2,
  },
  menuDividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: scale(70),
  },
  earnBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(8),
    marginLeft: scale(6),
  },
  earnBadgeText: {
    fontWeight: '800',
    color: '#A855F7',
  },

  homeLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: scale(16),
    paddingVertical: scale(14),
    marginBottom: scale(16),
  },
  homeLogoutText: {
    fontWeight: '700',
    color: '#EF4444',
  },
  homeVersionFooter: {
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: scale(20),
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. INNER SUB-PAGES (EXACT LOGIN LIQUID WATERCOLOR THEME)
  // ═══════════════════════════════════════════════════════════════
  subScrollContent: {
    paddingHorizontal: scale(18),
  },
  waterGlowCircle: {
    position: 'absolute',
    top: -scale(120),
    right: -scale(100),
    width: scale(320),
    height: scale(320),
    borderRadius: scale(160),
    backgroundColor: 'rgba(45, 212, 191, 0.28)',
  },
  planeArtWrap: {
    position: 'absolute',
    top: scale(50),
    right: -scale(30),
    width: scale(240),
    height: scale(200),
    opacity: 0.16,
  },
  planeArt: {
    width: '100%',
    height: '100%',
  },

  subScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  backButtonCircle: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    ...Shadows.sm,
  },
  subScreenHeaderTitle: {
    fontWeight: '900',
    color: '#062738',
  },
  subScreenHeaderSub: {
    color: '#64748B',
    marginTop: 2,
  },

  waterFormCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(24),
    padding: scale(20),
    borderWidth: 1,
    borderColor: 'rgba(204, 251, 241, 0.8)',
    marginBottom: scale(18),
    ...Shadows.card,
  },
  waterCardHeaderTag: {
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.8,
    marginBottom: scale(4),
  },
  waterCardSubDesc: {
    color: '#64748B',
    lineHeight: scale(18),
    marginBottom: scale(16),
  },

  avatarPickerCenter: {
    alignItems: 'center',
    marginBottom: scale(18),
  },
  largeAvatarCircle: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.sm,
  },
  largeAvatarImage: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
  },
  largeAvatarInitials: {
    fontWeight: '900',
    color: '#FFFFFF',
  },
  largeAvatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#065F56',
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHintText: {
    color: '#64748B',
    marginTop: scale(8),
  },

  waterSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: scale(12),
    padding: scale(10),
    marginBottom: scale(14),
  },
  waterSuccessText: {
    color: '#065F56',
    fontWeight: '700',
    marginLeft: scale(8),
  },

  waterInputGroup: {
    marginBottom: scale(14),
  },
  waterInputLabel: {
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: scale(6),
  },
  waterInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: scale(12),
    height: scale(48),
  },
  waterTextInput: {
    flex: 1,
    color: '#0F172A',
    fontWeight: '500',
  },

  waterActionBtn: {
    borderRadius: scale(16),
    overflow: 'hidden',
    marginTop: scale(10),
    ...Shadows.sm,
  },
  waterBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(14),
  },
  waterBtnText: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  waterDangerCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: scale(20),
    padding: scale(18),
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: scale(20),
  },
  waterDangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(6),
  },
  waterDangerTitle: {
    fontWeight: '800',
    color: '#DC2626',
    marginLeft: scale(6),
  },
  waterDangerSub: {
    color: '#991B1B',
    lineHeight: scale(16),
    marginBottom: scale(12),
  },
  waterDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: scale(12),
    paddingVertical: scale(10),
  },
  waterDeleteBtnText: {
    fontWeight: '700',
    color: '#DC2626',
  },
  waterPendingDeleteWrap: {
    backgroundColor: '#FEF2F2',
    padding: scale(12),
    borderRadius: scale(12),
  },
  waterPendingDeleteText: {
    color: '#991B1B',
    fontWeight: '600',
    marginBottom: scale(8),
  },
  waterCancelDeleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: scale(8),
    borderRadius: scale(10),
    alignItems: 'center',
  },
  waterCancelDeleteText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Notification Preferences
  waterPrefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
  },
  waterPrefIconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  waterPrefTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  waterPrefSub: {
    color: '#64748B',
    marginTop: scale(2),
    lineHeight: scale(15),
  },
  waterPrefDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // Invite Friends Sub-Screen
  waterReferralBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6FAF6',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(20),
    marginBottom: scale(8),
  },
  waterReferralBadgeText: {
    fontWeight: '800',
    color: '#0D9488',
  },
  waterReferralHeroTitle: {
    fontWeight: '900',
    color: '#062738',
    letterSpacing: -0.3,
    marginBottom: scale(6),
  },
  waterReferralHeroSub: {
    color: '#64748B',
    lineHeight: scale(18),
    marginBottom: scale(16),
  },
  waterReferralLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingLeft: scale(12),
    paddingRight: scale(6),
    height: scale(48),
    marginBottom: scale(20),
  },
  waterReferralLinkText: {
    flex: 1,
    color: '#0D9488',
    fontWeight: '600',
    marginRight: scale(6),
  },
  waterCopyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
  },
  waterCopyLinkBtnText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  waterShareHeading: {
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: scale(10),
  },
  waterShareRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: scale(12),
  },
  waterPlatformBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(12),
    paddingVertical: scale(10),
    gap: scale(6),
  },
  waterPlatformBtnText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  waterDirectShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6FAF6',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: scale(14),
    paddingVertical: scale(12),
  },
  waterDirectShareBtnText: {
    fontWeight: '700',
    color: '#0D9488',
  },

  // Guidelines Sub-Screen
  waterGuideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(16),
    padding: scale(12),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  waterGuideIconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(10),
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
    marginTop: scale(2),
  },
  waterGuideTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  waterGuideDesc: {
    color: '#64748B',
    lineHeight: scale(16),
    marginTop: scale(2),
  },
  waterWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: scale(14),
    padding: scale(12),
    marginTop: scale(10),
  },
  waterWarningText: {
    flex: 1,
    color: '#92400E',
    lineHeight: scale(16),
  },

  // Support Sub-Screen
  waterSupportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6FAF6',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(20),
    marginBottom: scale(8),
  },
  waterSupportBadgeText: {
    fontWeight: '800',
    color: '#0D9488',
    marginLeft: scale(4),
  },
  waterSupportHeroTitle: {
    fontWeight: '900',
    color: '#062738',
    marginBottom: scale(6),
  },
  waterSupportHeroSub: {
    color: '#64748B',
    lineHeight: scale(18),
    marginBottom: scale(18),
  },
  waterSupportCardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  waterSupportIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  waterSupportCardTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  waterSupportCardSub: {
    color: '#64748B',
    marginTop: scale(2),
  },
  waterSupportCardAction: {
    fontWeight: '700',
    color: '#0D9488',
    marginTop: scale(4),
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(24),
    padding: scale(22),
    ...Shadows.card,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  dangerIconCircle: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  modalTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    color: '#64748B',
    lineHeight: scale(17),
    marginBottom: scale(14),
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: scale(12),
    color: '#0F172A',
    height: scale(80),
    textAlignVertical: 'top',
    marginBottom: scale(16),
  },
  serverInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: scale(12),
    color: '#0F172A',
    marginBottom: scale(16),
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scale(10),
  },
  modalCancelBtn: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: scale(12),
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    fontWeight: '700',
    color: '#64748B',
  },
  modalConfirmBtn: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: scale(12),
    backgroundColor: '#DC2626',
  },
  modalConfirmBtnText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSaveBtn: {
    paddingHorizontal: scale(18),
    paddingVertical: scale(10),
    borderRadius: scale(12),
    backgroundColor: '#0D9488',
  },
  modalSaveBtnText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
