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
import {
  WalletSummary,
  WalletTransaction,
  MOCK_WALLET,
  MOCK_TRANSACTIONS,
} from '../../services/api';

interface WalletScreenProps {
  onOpenChat?: () => void;
  onOpenProfile?: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onOpenChat, onOpenProfile }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletSummary>(MOCK_WALLET);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(MOCK_TRANSACTIONS);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [bankAccount, setBankAccount] = useState('HDFC Bank •••• 4092');

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid deposit amount.');
      return;
    }

    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + amt,
    }));

    const newTx: WalletTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'DEPOSIT',
      amount: amt,
      currency: 'USD',
      status: 'COMPLETED',
      date: new Date().toISOString().split('T')[0],
      description: 'Instant Card / UPI Escrow Deposit',
    };

    setTransactions([newTx, ...transactions]);
    setIsDepositOpen(false);
    Alert.alert('Deposit Successful', `$${amt} has been deposited to your FlyoraGo Escrow Wallet.`);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (amt > wallet.availableBalance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance.');
      return;
    }

    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amt,
    }));

    const newTx: WalletTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'WITHDRAWAL',
      amount: amt,
      currency: 'USD',
      status: 'COMPLETED',
      date: new Date().toISOString().split('T')[0],
      description: `Payout transferred to ${bankAccount}`,
    };

    setTransactions([newTx, ...transactions]);
    setIsWithdrawOpen(false);
    Alert.alert('Withdrawal Initiated', `$${amt} has been sent to your linked bank account.`);
  };

  const getTxColor = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'REWARD_EARNED':
      case 'DEPOSIT':
        return FlyoraColors.success;
      case 'WITHDRAWAL':
      case 'ESCROW_HOLD':
        return FlyoraColors.danger;
      default:
        return FlyoraColors.tealDark;
    }
  };

  const getTxSign = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'REWARD_EARNED':
      case 'DEPOSIT':
      case 'ESCROW_RELEASE':
        return '+';
      case 'WITHDRAWAL':
      case 'ESCROW_HOLD':
        return '-';
      default:
        return '';
    }
  };

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
          <View style={styles.topRow}>
            <View>
              <Text style={styles.subtitle}>Secure Escrow & Payouts</Text>
              <Text style={styles.title}>FlyoraGo Wallet</Text>
            </View>
            <View style={styles.topRightActions}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={onOpenChat}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubbles-outline" size={19} color={FlyoraColors.white} />
                <View style={styles.chatBadgeDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Cards */}
          <View style={styles.mainBalanceCard}>
            <Text style={styles.mainBalanceLabel}>Available Balance</Text>
            <Text style={styles.mainBalanceValue}>
              ${wallet.availableBalance.toFixed(2)}
            </Text>
            <Text style={styles.mainBalanceSub}>Instant withdrawal to linked bank account</Text>

            <View style={styles.dualBalances}>
              <View style={styles.dualCol}>
                <Text style={styles.dualLabel}>Escrow Vault Locked</Text>
                <Text style={styles.dualValTeal}>${wallet.escrowLockedBalance.toFixed(2)}</Text>
              </View>
              <View style={styles.dualDivider} />
              <View style={styles.dualCol}>
                <Text style={styles.dualLabel}>Lifetime Earned</Text>
                <Text style={styles.dualVal}>${wallet.lifetimeEarnings.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Quick Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.depositBtn}
              onPress={() => setIsDepositOpen(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color={FlyoraColors.navyDark} />
              <Text style={styles.depositBtnText}>Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => setIsWithdrawOpen(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-up-circle" size={18} color={FlyoraColors.white} />
              <Text style={styles.withdrawBtnText}>Withdraw Payout</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Escrow Mechanism Explainer */}
        <View style={styles.explainerCard}>
          <View style={styles.explainerHeader}>
            <Ionicons name="lock-closed" size={18} color={FlyoraColors.tealDark} />
            <Text style={styles.explainerTitle}>Zero-Risk Escrow Protection</Text>
          </View>
          <Text style={styles.explainerDesc}>
            Funds never go directly to the traveler. They are held safely in a regulated escrow
            vault and released only after you provide your 4-digit recipient delivery OTP.
          </Text>
        </View>

        {/* Transactions List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transaction Activity</Text>
          <Text style={styles.txCount}>{transactions.length} Records</Text>
        </View>

        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txLeft}>
              <View
                style={[
                  styles.txIconCircle,
                  { backgroundColor: `${getTxColor(tx.type)}15` },
                ]}
              >
                <Ionicons
                  name={
                    tx.type === 'DEPOSIT'
                      ? 'wallet-outline'
                      : tx.type === 'WITHDRAWAL'
                        ? 'card-outline'
                        : 'shield-checkmark-outline'
                  }
                  size={20}
                  color={getTxColor(tx.type)}
                />
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txDesc} numberOfLines={1}>
                  {tx.description}
                </Text>
                <View style={styles.txMeta}>
                  <Text style={styles.txDate}>{tx.date}</Text>
                  <Text style={styles.txDot}>•</Text>
                  <Text style={styles.txId}>{tx.id}</Text>
                </View>
              </View>
            </View>

            <View style={styles.txRight}>
              <Text style={[styles.txAmount, { color: getTxColor(tx.type) }]}>
                {getTxSign(tx.type)}${tx.amount.toFixed(2)}
              </Text>
              <Text style={styles.txStatus}>{tx.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={isDepositOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsDepositOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTop}>
              <Text style={styles.modalHeading}>Add Escrow Balance</Text>
              <TouchableOpacity onPress={() => setIsDepositOpen(false)}>
                <Ionicons name="close" size={24} color={FlyoraColors.gray700} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Deposit Amount ($ USD)</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="100"
            />

            <View style={styles.quickChips}>
              {['50', '100', '250', '500'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.chip}
                  onPress={() => setDepositAmount(amt)}
                >
                  <Text style={styles.chipText}>+${amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.actionSubmitBtn} onPress={handleDeposit}>
              <Text style={styles.actionSubmitText}>Deposit Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={isWithdrawOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsWithdrawOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTop}>
              <Text style={styles.modalHeading}>Withdraw Payout</Text>
              <TouchableOpacity onPress={() => setIsWithdrawOpen(false)}>
                <Ionicons name="close" size={24} color={FlyoraColors.gray700} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Withdrawal Amount ($ USD)</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="50"
            />

            <Text style={styles.label}>Bank Account / UPI ID</Text>
            <TextInput
              style={styles.amountInput}
              value={bankAccount}
              onChangeText={setBankAccount}
              placeholder="Account number or UPI"
            />

            <TouchableOpacity
              style={[styles.actionSubmitBtn, { backgroundColor: FlyoraColors.blue }]}
              onPress={handleWithdraw}
            >
              <Text style={styles.actionSubmitText}>Transfer to Bank</Text>
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
    paddingBottom: 22,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  chatBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2DD4BF',
    borderWidth: 1.5,
    borderColor: '#0A1628',
  },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(45, 212, 191, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(45, 212, 191, 0.6)',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: FlyoraColors.white,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: FlyoraColors.white,
    letterSpacing: -0.5,
  },
  escrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.35)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  escrowPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  mainBalanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 16,
  },
  mainBalanceLabel: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  mainBalanceValue: {
    fontSize: 34,
    fontWeight: '900',
    color: FlyoraColors.white,
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  mainBalanceSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  dualBalances: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: 14,
    paddingTop: 12,
  },
  dualCol: {
    flex: 1,
  },
  dualDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 14,
  },
  dualLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  dualValTeal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2DD4BF',
    marginTop: 2,
  },
  dualVal: {
    fontSize: 16,
    fontWeight: '800',
    color: FlyoraColors.white,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  depositBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2DD4BF',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  depositBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FlyoraColors.navyDark,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  withdrawBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  explainerCard: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: BorderRadius.md,
    padding: 14,
    marginBottom: 20,
  },
  explainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  explainerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: FlyoraColors.tealDark,
  },
  explainerDesc: {
    fontSize: 12,
    color: FlyoraColors.gray700,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: FlyoraColors.gray900,
  },
  txCount: {
    fontSize: 12,
    color: FlyoraColors.gray500,
    fontWeight: '600',
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FlyoraColors.surface,
    borderRadius: BorderRadius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    ...Shadows.card,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  txIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.gray900,
    marginBottom: 2,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txDate: {
    fontSize: 11,
    color: FlyoraColors.gray500,
  },
  txDot: {
    fontSize: 11,
    color: FlyoraColors.gray400,
  },
  txId: {
    fontSize: 11,
    color: FlyoraColors.gray500,
  },
  txRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  txStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: FlyoraColors.gray500,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: FlyoraColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: FlyoraColors.gray900,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.gray700,
    marginBottom: 6,
    marginTop: 10,
  },
  amountInput: {
    backgroundColor: FlyoraColors.gray50,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: FlyoraColors.gray900,
  },
  quickChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: FlyoraColors.gray100,
    borderRadius: BorderRadius.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: FlyoraColors.gray700,
  },
  actionSubmitBtn: {
    backgroundColor: FlyoraColors.teal,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionSubmitText: {
    fontSize: 15,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
});
