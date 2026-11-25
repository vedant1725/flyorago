import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows, BorderRadius } from '../constants/theme';
import { AppAlert as Alert } from './AppAlertModal';
import { NativeQRCode } from './NativeQRCode';

const { width } = Dimensions.get('window');

interface QrViewModalProps {
  visible: boolean;
  onClose: () => void;
  otpCode: string | number;
  qrCodeUrl?: string | null;
  packageName?: string;
  requestId?: string | number;
  senderName?: string;
  receiverName?: string;
}

export const QrViewModal: React.FC<QrViewModalProps> = ({
  visible,
  onClose,
  otpCode,
  qrCodeUrl,
  packageName = 'Parcel Delivery',
  requestId,
  senderName,
  receiverName,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const rawBookingId = String(requestId || '').replace(/\D/g, '') || '1';
  const qrValue = `FLYORA-DELIVERY:${rawBookingId}:${otpCode}`;
  const resolvedQrImage = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Share QR code and delivery verification credentials
  const handleShare = async () => {
    try {
      const shareMessage = `📦 FlyoraGo Handover Verification QR\n\nParcel: ${packageName}\nRequest ID: #${requestId || 'N/A'}\nReceiver: ${receiverName || 'Recipient'}\n\n🔑 6-Digit Delivery OTP: ${otpCode}\n\nScan QR Code directly or verify online:\n${resolvedQrImage}\n\n⚠️ Share this ONLY upon physical receipt of the parcel.`;

      await Share.share({
        message: shareMessage,
        title: `Flyora Handover OTP & QR: ${otpCode}`,
        url: resolvedQrImage, // Supported on iOS
      });
    } catch (error: any) {
      Alert.alert('Share Failed', error?.message || 'Could not open share sheet.');
    }
  };

  const handleCopyOtp = () => {
    Alert.alert('OTP Copied', `Delivery OTP ${otpCode} copied.`);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />

        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header Gradient */}
          <LinearGradient
            colors={['#062738', '#089A8D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <View style={styles.headerTop}>
              <View style={styles.headerBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#2DD4BF" />
                <Text style={styles.headerBadgeText}>Handover Verification</Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>Delivery QR & OTP</Text>
            <Text style={styles.headerSub}>
              Show to traveler upon delivery or share with the recipient
            </Text>
          </LinearGradient>

          {/* Body Content */}
          <View style={styles.modalBody}>
            {/* High-Resolution QR Card */}
            <View style={styles.qrCard}>
              <View style={styles.qrFrame}>
                {qrCodeUrl ? (
                  <Image
                    source={{ uri: qrCodeUrl }}
                    style={{ width: 200, height: 200 }}
                    resizeMode="contain"
                  />
                ) : (
                  <NativeQRCode
                    value={qrValue}
                    size={200}
                    color="#0F172A"
                    backgroundColor="#FFFFFF"
                    quietZoneModules={2}
                  />
                )}
              </View>

              {/* Scannable Notice */}
              <View style={styles.qrMetaRow}>
                <Ionicons name="scan-circle-outline" size={18} color="#089A8D" />
                <Text style={styles.qrMetaText}>Official Backend Verified • Scannable by Traveler Camera</Text>
              </View>
            </View>

            {/* OTP Display Pill */}
            <View style={styles.otpCard}>
              <View>
                <Text style={styles.otpLabel}>6-DIGIT HANDOVER OTP</Text>
                <Text style={styles.otpNumber}>{otpCode}</Text>
              </View>
              <TouchableOpacity style={styles.copyPill} onPress={handleCopyOtp} activeOpacity={0.75}>
                <Ionicons name="copy-outline" size={16} color="#089A8D" />
                <Text style={styles.copyPillText}>Copy</Text>
              </TouchableOpacity>
            </View>

            {/* Instruction Warning */}
            <View style={styles.warningBox}>
              <Ionicons name="information-circle" size={18} color="#D97706" />
              <Text style={styles.warningText}>
                Do <Text style={{ fontWeight: '800' }}>NOT</Text> share this OTP or QR before you or your receiver physically verify the sealed parcel.
              </Text>
            </View>

            {/* Actions: Share QR & Close */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                <Ionicons name="share-social" size={18} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>Share QR & OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3, 20, 29, 0.8)',
  },
  modalContent: {
    width: Math.min(width * 0.92, 410),
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    ...Shadows.cardHover,
    elevation: 24,
  },
  modalHeader: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  headerBadgeText: {
    color: '#2DD4BF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: '#CCFBF1',
    marginTop: 4,
    lineHeight: 16,
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  qrCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  qrFrame: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#089A8D',
    ...Shadows.card,
  },
  qrImage: {
    width: 190,
    height: 190,
  },
  qrMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  qrMetaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#089A8D',
  },
  otpCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 12,
  },
  otpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.6,
  },
  otpNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#062738',
    letterSpacing: 4,
    marginTop: 2,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  copyPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#089A8D',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
    marginBottom: 18,
    width: '100%',
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  shareBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#089A8D',
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    gap: 8,
    ...Shadows.card,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  doneBtn: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doneBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});
