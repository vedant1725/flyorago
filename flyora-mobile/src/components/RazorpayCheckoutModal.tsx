import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, BorderRadius, Shadows } from '../constants/theme';
import {
  scale,
  verticalScale,
  moderateScale,
  fontScale,
  SCREEN,
} from '../constants/responsive';

interface RazorpayModalProps {
  visible: boolean;
  amount: number;
  purpose: 'add_funds' | 'withdraw';
  orderId: string;
  onSuccess: (paymentDetails: { razorpay_payment_id: string; razorpay_order_id: string }) => void;
  onClose: () => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayModalProps> = ({
  visible,
  amount,
  purpose,
  orderId,
  onSuccess,
  onClose,
}) => {
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const isWithdraw = purpose === 'withdraw';
  const displayTitle = isWithdraw ? 'Razorpay Payouts' : 'Razorpay Secure Checkout';
  const buttonText = isWithdraw
    ? `Authorize Payout ₹${amount.toFixed(2)}`
    : `Pay ₹${amount.toFixed(2)} with Razorpay`;

  const handleSimulatePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const fakePaymentId = `pay_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString().slice(-4)}`;
      onSuccess({
        razorpay_payment_id: fakePaymentId,
        razorpay_order_id: orderId || `order_${Date.now()}`,
      });
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Brand Banner */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.razorLogoBox}>
                <Ionicons name="flash" size={16} color="#0C2340" />
              </View>
              <View>
                <Text style={styles.brandName}>Razorpay</Text>
                <Text style={styles.brandSub}>{displayTitle} • Test Mode</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={processing}>
              <Ionicons name="close" size={20} color={FlyoraColors.white} />
            </TouchableOpacity>
          </View>

          {/* Amount Badge */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>
              {isWithdraw ? 'WITHDRAWAL AMOUNT' : 'PAYABLE AMOUNT'}
            </Text>
            <Text style={styles.amountVal}>₹{amount.toFixed(2)}</Text>
            <View style={styles.orderPill}>
              <Text style={styles.orderPillText}>Order ID: {orderId || 'Active Session'}</Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.sectionHeading}>Select Payment Option</Text>

          <View style={styles.methodsList}>
            {/* UPI Option */}
            <TouchableOpacity
              style={[styles.methodItem, selectedMethod === 'upi' && styles.methodItemActive]}
              onPress={() => setSelectedMethod('upi')}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconBox}>
                <Ionicons name="phone-portrait-outline" size={18} color="#0284C7" />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodTitle}>UPI (GPay, PhonePe, Paytm)</Text>
                <Text style={styles.methodSub}>Instant UPI QR or Autopay ID</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedMethod === 'upi' && styles.radioOuterActive,
                ]}
              >
                {selectedMethod === 'upi' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Card Option */}
            <TouchableOpacity
              style={[styles.methodItem, selectedMethod === 'card' && styles.methodItemActive]}
              onPress={() => setSelectedMethod('card')}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconBox}>
                <Ionicons name="card-outline" size={18} color="#0D9488" />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodTitle}>Credit / Debit Card</Text>
                <Text style={styles.methodSub}>Visa, MasterCard, RuPay & Amex</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedMethod === 'card' && styles.radioOuterActive,
                ]}
              >
                {selectedMethod === 'card' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Netbanking Option */}
            <TouchableOpacity
              style={[
                styles.methodItem,
                selectedMethod === 'netbanking' && styles.methodItemActive,
              ]}
              onPress={() => setSelectedMethod('netbanking')}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconBox}>
                <Ionicons name="business-outline" size={18} color="#6366F1" />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodTitle}>NetBanking / Direct Transfer</Text>
                <Text style={styles.methodSub}>All 58 major Indian Banks</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedMethod === 'netbanking' && styles.radioOuterActive,
                ]}
              >
                {selectedMethod === 'netbanking' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Trust badges */}
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={15} color="#10B981" />
            <Text style={styles.trustText}>256-Bit SSL Encrypted • PCI-DSS Level 1 Certified</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.payBtn}
            onPress={handleSimulatePayment}
            disabled={processing}
            activeOpacity={0.85}
          >
            {processing ? (
              <ActivityIndicator size="small" color={FlyoraColors.white} />
            ) : (
              <View style={styles.payBtnContent}>
                <Ionicons name="lock-closed" size={16} color={FlyoraColors.white} />
                <Text style={styles.payBtnText}>{buttonText}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: FlyoraColors.white,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: moderateScale(18),
    paddingBottom: verticalScale(Platform.OS === 'ios' ? 36 : 24),
    maxHeight: '90%',
    ...Shadows.card,
  },
  header: {
    backgroundColor: '#0C2340',
    marginHorizontal: -moderateScale(18),
    marginTop: -moderateScale(18),
    paddingHorizontal: moderateScale(18),
    paddingVertical: verticalScale(14),
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  razorLogoBox: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(8),
    backgroundColor: '#528FF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: fontScale(15),
    fontWeight: '900',
    color: FlyoraColors.white,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: fontScale(10.5),
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: moderateScale(14),
    marginVertical: verticalScale(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: fontScale(10),
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  amountVal: {
    fontSize: fontScale(28),
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: verticalScale(2),
  },
  orderPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: moderateScale(8),
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  orderPillText: {
    fontSize: fontScale(10),
    color: '#475569',
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: fontScale(12.5),
    fontWeight: '800',
    color: '#334155',
    marginBottom: verticalScale(10),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodsList: {
    gap: verticalScale(9),
    marginBottom: verticalScale(14),
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: moderateScale(10),
  },
  methodItemActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  methodIconBox: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    backgroundColor: FlyoraColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodDetails: {
    flex: 1,
  },
  methodTitle: {
    fontSize: fontScale(12.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  methodSub: {
    fontSize: fontScale(10.5),
    color: '#64748B',
    marginTop: 1,
  },
  radioOuter: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#0D9488',
  },
  radioInner: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#0D9488',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    marginBottom: verticalScale(14),
  },
  trustText: {
    fontSize: fontScale(10.5),
    color: '#64748B',
    fontWeight: '600',
  },
  payBtn: {
    backgroundColor: '#0C2340',
    paddingVertical: verticalScale(13),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  payBtnText: {
    fontSize: fontScale(14),
    fontWeight: '800',
    color: FlyoraColors.white,
  },
});
