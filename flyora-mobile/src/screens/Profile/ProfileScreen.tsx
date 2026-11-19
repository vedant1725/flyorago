import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../../services/api';

interface ProfileScreenProps {
  onNavigateTab: (tabName: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateTab }) => {
  const { user, currentRole, switchRole, kycStatus, logout } = useAuth();
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState('https://api.flyorago.me');

  const openServerConfig = async () => {
    const current = await getApiBaseUrl();
    setServerUrl(current);
    setIsServerModalOpen(true);
  };

  const saveServerConfig = async () => {
    if (!serverUrl.trim()) return;
    await setApiBaseUrl(serverUrl.trim());
    setIsServerModalOpen(false);
    Alert.alert('Server Endpoint Updated', `App will connect to: ${serverUrl.trim()}`);
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

  const nameInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'F';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#062738', '#089A8D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{nameInitial}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.userName}>{user?.fullName || 'FlyoraGo Member'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'member@flyorago.me'}</Text>
              <View style={styles.roleTag}>
                <Ionicons
                  name={currentRole === 'sender' ? 'cube-outline' : 'airplane-outline'}
                  size={12}
                  color="#2DD4BF"
                />
                <Text style={styles.roleTagText}>
                  Active as {currentRole === 'sender' ? 'Sender' : 'Traveler'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Role Switcher Banner */}
        <TouchableOpacity
          style={styles.roleSwitchCard}
          onPress={switchRole}
          activeOpacity={0.88}
        >
          <View style={styles.roleSwitchLeft}>
            <View style={styles.roleSwitchIconWrap}>
              <Ionicons name="swap-horizontal" size={22} color={FlyoraColors.tealDark} />
            </View>
            <View>
              <Text style={styles.roleSwitchTitle}>Switch User Persona</Text>
              <Text style={styles.roleSwitchSub}>
                Currently browsing as: <Text style={{ fontWeight: '700' }}>{currentRole.toUpperCase()}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.switchPill}>
            <Text style={styles.switchPillText}>
              Toggle to {currentRole === 'sender' ? 'Traveler' : 'Sender'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* KYC Verification Card */}
        <TouchableOpacity
          style={styles.kycCard}
          onPress={() => onNavigateTab('kyc')}
          activeOpacity={0.88}
        >
          <View style={styles.kycCardLeft}>
            <Ionicons
              name={kycStatus === 'APPROVED' ? 'shield-checkmark' : 'alert-circle'}
              size={26}
              color={kycStatus === 'APPROVED' ? FlyoraColors.teal : FlyoraColors.warning}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.kycCardTitle}>
                {kycStatus === 'APPROVED' ? 'Identity Verified' : 'KYC Verification Required'}
              </Text>
              <Text style={styles.kycCardSub}>
                {kycStatus === 'APPROVED'
                  ? 'Airport customs & luggage monetization unlocked'
                  : 'Submit passport to share luggage and accept deliveries'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={FlyoraColors.gray400} />
        </TouchableOpacity>

        {/* User Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{user?.completedDeliveries ?? 14}</Text>
            <Text style={styles.statLabel}>Parcels Sent</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{user?.completedTrips ?? 8}</Text>
            <Text style={styles.statLabel}>Flights Shared</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: FlyoraColors.tealDark }]}>
              {user?.trustScore ?? 4.95}★
            </Text>
            <Text style={styles.statLabel}>Trust Score</Text>
          </View>
        </View>

        {/* Menu Options */}
        <Text style={styles.sectionHeading}>Account & Preferences</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigateTab('wallet')}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="wallet-outline" size={20} color={FlyoraColors.gray700} />
            <Text style={styles.menuTitle}>Escrow Wallet & Payouts</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={FlyoraColors.gray400} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={openServerConfig}>
          <View style={styles.menuLeft}>
            <Ionicons name="server-outline" size={20} color={FlyoraColors.gray700} />
            <Text style={styles.menuTitle}>API Backend Endpoint</Text>
          </View>
          <View style={styles.menuRightBadge}>
            <Text style={styles.menuBadgeText}>Configure</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert(
              'Escrow Security',
              'FlyoraGo secures 100% of transaction payments in an escrow vault until the parcel recipient confirms delivery with a 4-digit OTP.'
            )
          }
        >
          <View style={styles.menuLeft}>
            <Ionicons name="shield-outline" size={20} color={FlyoraColors.gray700} />
            <Text style={styles.menuTitle}>Escrow Security Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={FlyoraColors.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert(
              'About FlyoraGo',
              'FlyoraGo v1.0.0 (Expo React Native)\nPeer-to-peer Luggage Sharing & Parcel Delivery Network.'
            )
          }
        >
          <View style={styles.menuLeft}>
            <Ionicons name="information-circle-outline" size={20} color={FlyoraColors.gray700} />
            <Text style={styles.menuTitle}>About & Legal Terms</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={FlyoraColors.gray400} />
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={FlyoraColors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Server Endpoint Config Modal */}
      <Modal
        visible={isServerModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsServerModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>API Server Configuration</Text>
              <TouchableOpacity onPress={() => setIsServerModalOpen(false)}>
                <Ionicons name="close" size={24} color={FlyoraColors.gray700} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Backend Base URL</Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://api.flyorago.me"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.urlPresetRow}>
              <TouchableOpacity
                style={styles.presetPill}
                onPress={() => setServerUrl('https://api.flyorago.me')}
              >
                <Text style={styles.presetText}>Production Cloud</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetPill}
                onPress={() => setServerUrl('http://10.0.2.2:8000')}
              >
                <Text style={styles.presetText}>Android Local (10.0.2.2)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveServerBtn} onPress={saveServerConfig}>
              <Text style={styles.saveServerBtnText}>Save & Apply Endpoint</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FlyoraColors.background,
  },
  header: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '900',
    color: FlyoraColors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: FlyoraColors.white,
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  roleSwitchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FlyoraColors.tealSubtle,
    borderRadius: BorderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: FlyoraColors.tealLight,
    marginBottom: 14,
  },
  roleSwitchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleSwitchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleSwitchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: FlyoraColors.tealDark,
  },
  roleSwitchSub: {
    fontSize: 11,
    color: FlyoraColors.gray600,
    marginTop: 2,
  },
  switchPill: {
    backgroundColor: FlyoraColors.teal,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  switchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
  kycCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FlyoraColors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    marginBottom: 14,
    ...Shadows.card,
  },
  kycCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  kycCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: FlyoraColors.gray900,
  },
  kycCardSub: {
    fontSize: 11,
    color: FlyoraColors.gray500,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: FlyoraColors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    ...Shadows.card,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: FlyoraColors.gray900,
  },
  statLabel: {
    fontSize: 11,
    color: FlyoraColors.gray500,
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: FlyoraColors.gray900,
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FlyoraColors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: FlyoraColors.gray800,
  },
  menuRightBadge: {
    backgroundColor: FlyoraColors.gray100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  menuBadgeText: {
    fontSize: 11,
    color: FlyoraColors.gray600,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FlyoraColors.dangerBg,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: FlyoraColors.dangerBorder,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: FlyoraColors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: FlyoraColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FlyoraColors.gray900,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.gray700,
    marginBottom: 6,
  },
  input: {
    backgroundColor: FlyoraColors.gray50,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: FlyoraColors.gray900,
    marginBottom: 12,
  },
  urlPresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  presetPill: {
    backgroundColor: FlyoraColors.gray100,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: FlyoraColors.gray700,
  },
  saveServerBtn: {
    backgroundColor: FlyoraColors.teal,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveServerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
});
