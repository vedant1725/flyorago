import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FlyoraColors, BorderRadius, Shadows } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { SplashView } from '../components/SplashView';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignupScreen } from '../screens/Auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { TripsScreen } from '../screens/Trips/TripsScreen';
import { ShipmentsScreen } from '../screens/Shipments/ShipmentsScreen';
import { WalletScreen } from '../screens/Wallet/WalletScreen';
import { KycScreen } from '../screens/Kyc/KycScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';
import { TrustScoreScreen } from '../screens/Trust/TrustScoreScreen';
import { WelcomeModal } from '../components/WelcomeModal';
import { Storage } from '../services/storage';
import { GlobalNotificationSync } from '../services/notificationSync';
import { getSafeHeaderPaddingTop, getSafeBottomPadding } from '../constants/responsive';

const STORAGE_FIRST_LAUNCH_SHOWN_KEY = 'flyora_has_seen_welcome_modal';

type MainTabKey = 'dashboard' | 'trips' | 'wallet' | 'shipments' | 'profile';
type SubScreenKey = 'chat' | 'kyc' | 'notifications' | 'trust' | null;

export default function AppEntry() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>('');
  const [unverifiedAutoOtp, setUnverifiedAutoOtp] = useState<boolean>(false);

  // Navigation state: 5 Main Bottom Tabs + Chat/KYC/Notifications Subscreens
  const [mainTab, setMainTab] = useState<MainTabKey>('dashboard');
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreenKey>(null);
  const [activeChatTarget, setActiveChatTarget] = useState<{ userId?: number; userName?: string } | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(2);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  // Reset navigation states when user logs out or logs in
  useEffect(() => {
    if (!isAuthenticated) {
      setMainTab('dashboard');
      setActiveSubScreen(null);
      setActiveChatTarget(null);
      setAuthView('login');
    } else {
      // Whenever user successfully authenticates/logs in, default to dashboard
      setMainTab('dashboard');
      setActiveSubScreen(null);
      setActiveChatTarget(null);
    }
  }, [isAuthenticated]);

  // Start Global Notification Synchronizer on Auth
  useEffect(() => {
    if (isAuthenticated && user) {
      GlobalNotificationSync.start(user);
      const unsubscribe = GlobalNotificationSync.onUnreadCountChange((count) => {
        setUnreadNotifs(count);
      });

      return () => {
        unsubscribe();
        GlobalNotificationSync.stop();
      };
    } else {
      GlobalNotificationSync.stop();
    }
  }, [isAuthenticated, user]);

  // Check if first-time launch / login popup or mandatory KYC should be prioritized
  useEffect(() => {
    if (isAuthenticated) {
      const checkFirstLaunch = async () => {
        try {
          // If user just signed up or KYC is not submitted/pending, auto open KYC
          if (user?.kycStatus === 'NOT_SUBMITTED') {
            setActiveSubScreen('kyc');
          }
          const hasSeen = await Storage.getItem(STORAGE_FIRST_LAUNCH_SHOWN_KEY);
          if (!hasSeen) {
            // First time login - display world-class welcome popup!
            setShowWelcomeModal(true);
          }
        } catch {}
      };
      checkFirstLaunch();
    }
  }, [isAuthenticated, user?.kycStatus]);

  const handleCloseWelcomeModal = async () => {
    setShowWelcomeModal(false);
    await Storage.setItem(STORAGE_FIRST_LAUNCH_SHOWN_KEY, 'true');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // 1. Initial Splash Screen
  if (showSplash) {
    return <SplashView onFinish={() => setShowSplash(false)} />;
  }

  // 2. Auth loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={FlyoraColors.primary} />
        <Text style={styles.loadingText}>Connecting to FlyoraGo...</Text>
      </View>
    );
  }

  // 3. Unauthenticated User Flow (Login / Signup with Google / Forgot Password)
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return (
        <SignupScreen
          onNavigateToLogin={() => {
            setUnverifiedEmail('');
            setUnverifiedAutoOtp(false);
            setAuthView('login');
          }}
          initialEmail={unverifiedEmail}
          autoOpenOtp={unverifiedAutoOtp}
        />
      );
    }
    if (authView === 'forgot_password') {
      return <ForgotPasswordScreen onNavigateToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginScreen
        onNavigateToSignup={(initialEmail?: string, autoOpenOtp?: boolean) => {
          setUnverifiedEmail(initialEmail || '');
          setUnverifiedAutoOtp(!!autoOpenOtp);
          setAuthView('signup');
        }}
        onNavigateToForgotPassword={() => setAuthView('forgot_password')}
      />
    );
  }

  // 4. Authenticated Navigation Handlers
  const handleOpenChat = (target?: { userId?: number; userName?: string }) => {
    if (target?.userId) {
      setActiveChatTarget(target);
    } else {
      setActiveChatTarget(null);
    }
    setActiveSubScreen('chat');
  };
  const handleOpenKyc = () => setActiveSubScreen('kyc');
  const handleOpenNotifications = () => setActiveSubScreen('notifications');
  const handleOpenTrust = () => setActiveSubScreen('trust');
  const handleCloseSubScreen = () => {
    setActiveSubScreen(null);
    setActiveChatTarget(null);
  };

  const renderActiveView = () => {
    // If a subscreen (Chat / KYC / Notifications / Trust) is active
    if (activeSubScreen) {
      switch (activeSubScreen) {
        case 'chat':
          return (
            <View style={{ flex: 1 }}>
              <ChatScreen
                onBack={handleCloseSubScreen}
                targetUserId={activeChatTarget?.userId}
                targetUserName={activeChatTarget?.userName}
              />
            </View>
          );
        case 'kyc':
          return (
            <View style={{ flex: 1 }}>
              <KycScreen onBack={handleCloseSubScreen} onSuccess={handleCloseSubScreen} />
            </View>
          );
        case 'trust':
          return (
            <TrustScoreScreen
              onBack={handleCloseSubScreen}
              onNavigateTab={(tab) => {
                handleCloseSubScreen();
                if (tab === 'kyc') handleOpenKyc();
                else if (tab === 'trips' || tab === 'wallet' || tab === 'profile') {
                  setMainTab(tab as MainTabKey);
                }
              }}
            />
          );
        case 'notifications':
          return (
            <NotificationsScreen
              onBack={handleCloseSubScreen}
              onNavigateTab={(tab) => {
                handleCloseSubScreen();
                if (tab === 'trips' || tab === 'shipments' || tab === 'wallet' || tab === 'profile') {
                  setMainTab(tab as MainTabKey);
                } else if (tab === 'kyc') {
                  handleOpenKyc();
                }
              }}
              onUnreadCountChange={(count) => setUnreadNotifs(count)}
            />
          );
      }
    }

    // 5 Main Tabs
    switch (mainTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigateTab={(tab) => {
              if (tab === 'chat') handleOpenChat();
              else if (tab === 'kyc') handleOpenKyc();
              else if (tab === 'notifications') handleOpenNotifications();
              else if (tab === 'trust') handleOpenTrust();
              else if (tab === 'trips' || tab === 'shipments' || tab === 'wallet' || tab === 'profile') {
                setMainTab(tab as MainTabKey);
              }
            }}
            onOpenChat={handleOpenChat}
            onOpenNotifications={handleOpenNotifications}
            onOpenTrust={handleOpenTrust}
            onPostTrip={() => setMainTab('trips')}
            onPostShipment={() => setMainTab('shipments')}
            unreadNotificationsCount={unreadNotifs}
          />
        );
      case 'trips':
        return <TripsScreen onOpenChat={handleOpenChat} onNavigateToKyc={handleOpenKyc} />;
      case 'wallet':
        return <WalletScreen onOpenChat={handleOpenChat} onNavigateToKyc={handleOpenKyc} />;
      case 'shipments':
        return <ShipmentsScreen onOpenChat={handleOpenChat} onNavigateToKyc={handleOpenKyc} />;
      case 'profile':
        return (
          <ProfileScreen
            onNavigateTab={(tab) => {
              if (tab === 'kyc') {
                handleOpenKyc();
              } else if (tab === 'wallet') {
                setMainTab('wallet');
              }
            }}
          />
        );
    }
  };

  const isWalletActive = !activeSubScreen && mainTab === 'wallet';

  return (
    <View style={styles.appContainer}>
      <View style={styles.screenArea}>{renderActiveView()}</View>

      {/* First-Time Launch & Login Welcome Popup (Matches Web Dashboard Exactly) */}
      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />

      {/* World-Class 5-Tab Navigation Bar with Elevated Center Wallet Button (Hidden on active SubScreen e.g. Chat, KYC, Notifications) */}
      {!activeSubScreen && (
        <View style={[styles.bottomNavWrapper, { paddingBottom: getSafeBottomPadding(insets.bottom, 10) }]}>
        <View style={styles.bottomNavContainer}>
          {/* 1. Left Tab 1: Home */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveSubScreen(null);
              setMainTab('dashboard');
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconBox,
                !activeSubScreen && mainTab === 'dashboard' && styles.iconBoxActive,
              ]}
            >
              <Ionicons
                name={!activeSubScreen && mainTab === 'dashboard' ? 'grid' : 'grid-outline'}
                size={22}
                color={!activeSubScreen && mainTab === 'dashboard' ? '#089A8D' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                !activeSubScreen && mainTab === 'dashboard' && styles.navLabelActive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* 2. Left Tab 2: Trips */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveSubScreen(null);
              setMainTab('trips');
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconBox,
                !activeSubScreen && mainTab === 'trips' && styles.iconBoxActive,
              ]}
            >
              <Ionicons
                name={!activeSubScreen && mainTab === 'trips' ? 'airplane' : 'airplane-outline'}
                size={22}
                color={!activeSubScreen && mainTab === 'trips' ? '#089A8D' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                !activeSubScreen && mainTab === 'trips' && styles.navLabelActive,
              ]}
            >
              Trips
            </Text>
          </TouchableOpacity>

          {/* 3. CENTER: Floating Masterpiece Wallet Button */}
          <View style={styles.centerFloatingWrap}>
            <TouchableOpacity
              style={styles.centerFabTouchable}
              onPress={() => {
                setActiveSubScreen(null);
                setMainTab('wallet');
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isWalletActive
                    ? ['#033D37', '#089A8D', '#14B8A6']
                    : ['#044C47', '#066B65', '#089A8D']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.centerFabGradient,
                  isWalletActive && styles.centerFabActiveRing,
                ]}
              >
                <Ionicons
                  name={isWalletActive ? 'shield-checkmark' : 'wallet-outline'}
                  size={26}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
            <Text
              style={[
                styles.centerFabLabel,
                isWalletActive && styles.centerFabLabelActive,
              ]}
            >
              Wallet
            </Text>
          </View>

          {/* 4. Right Tab 1: Sender */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveSubScreen(null);
              setMainTab('shipments');
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconBox,
                !activeSubScreen && mainTab === 'shipments' && styles.iconBoxActive,
              ]}
            >
              <Ionicons
                name={!activeSubScreen && mainTab === 'shipments' ? 'cube' : 'cube-outline'}
                size={22}
                color={!activeSubScreen && mainTab === 'shipments' ? '#089A8D' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                !activeSubScreen && mainTab === 'shipments' && styles.navLabelActive,
              ]}
            >
              Sender
            </Text>
          </TouchableOpacity>

          {/* 5. Right Tab 2: Profile */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveSubScreen(null);
              setMainTab('profile');
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconBox,
                !activeSubScreen && mainTab === 'profile' && styles.iconBoxActive,
              ]}
            >
              <Ionicons
                name={!activeSubScreen && mainTab === 'profile' ? 'person' : 'person-outline'}
                size={22}
                color={!activeSubScreen && mainTab === 'profile' ? '#089A8D' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                !activeSubScreen && mainTab === 'profile' && styles.navLabelActive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      )}
    </View>
  );
}

// Subscreen Header for back navigation
const SubScreenHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.subHeader, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}>
      <TouchableOpacity style={styles.subBackBtn} onPress={onBack} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.subHeaderTitle} numberOfLines={1}>{title}</Text>
      <View style={{ width: 36 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },
  screenArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4FCFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#089A8D',
    fontWeight: '700',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#033D37',
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  subBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  bottomNavWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    ...Shadows.card,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconBox: {
    width: 38,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxActive: {
    backgroundColor: '#E6FAF6',
  },
  navLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#089A8D',
    fontWeight: '800',
  },
  centerFloatingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -24,
    zIndex: 10,
  },
  centerFabTouchable: {
    ...Shadows.tealGlow,
  },
  centerFabGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#089A8D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  centerFabActiveRing: {
    borderColor: '#CCF5EF',
  },
  centerFabLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 3,
  },
  centerFabLabelActive: {
    color: '#089A8D',
    fontWeight: '900',
  },
});
