import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  scale,
  verticalScale,
  moderateScale,
  fontScale,
  SCREEN,
  getSafeHeaderPaddingTop,
} from '../../constants/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { AppAlert as Alert } from '../../components/AppAlertModal';
import { RazorpayCheckoutModal } from '../../components/RazorpayCheckoutModal';
import { KycValidationModal } from '../../components/KycValidationModal';
import { apiFetch } from '../../services/api';

interface WalletScreenProps {
  onOpenChat?: () => void;
  onOpenProfile?: () => void;
  onNavigateToKyc?: () => void;
}

interface TransactionItem {
  id: string;
  rawId: number | string;
  description: string;
  date: string;
  category: string;
  type: 'credit' | 'debit';
  amount: number;
  status: string;
  reference: string;
  counterparty?: any;
  booking_details?: any;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onOpenChat, onOpenProfile, onNavigateToKyc }) => {
  const insets = useSafeAreaInsets();
  const { user, kycStatus } = useAuth();

  // Balance and Stats (matching Web WalletPage exactly)
  const [walletStats, setWalletStats] = useState({
    walletBalance: 0,
    escrowBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<TransactionItem | null>(null);

  // KYC validation guard
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycActionTitle, setKycActionTitle] = useState('Wallet deposit/withdrawal');

  const isKycApproved = (kycStatus || user?.kycStatus || '').toUpperCase() === 'APPROVED';

  const handleOpenAddFunds = () => {
    if (!isKycApproved) {
      setKycActionTitle('Adding funds to wallet');
      setIsKycModalOpen(true);
      return;
    }
    setIsDepositOpen(true);
  };

  const handleOpenWithdraw = () => {
    if (!isKycApproved) {
      setKycActionTitle('Withdrawing funds / payout');
      setIsKycModalOpen(true);
      return;
    }
    setIsWithdrawOpen(true);
  };

  // Razorpay Checkout Modal state
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [razorpayAmount, setRazorpayAmount] = useState(0);
  const [razorpayPurpose, setRazorpayPurpose] = useState<'add_funds' | 'withdraw'>('add_funds');
  const [razorpayOrderId, setRazorpayOrderId] = useState('');

  // Form Inputs
  const [depositAmount, setDepositAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Fetch all live wallet data from backend
  const fetchWalletData = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // 1. Fetch Summary (/api/wallet/summary)
      const summaryRes = await apiFetch('/api/wallet/summary');
      if (summaryRes?.success && summaryRes?.data) {
        setWalletStats({
          walletBalance: parseFloat(summaryRes.data.balance_available) || 0,
          pendingBalance: parseFloat(summaryRes.data.balance_pending) || 0,
          escrowBalance: parseFloat(summaryRes.data.balance_escrow) || 0,
          totalEarnings: typeof summaryRes.data.total_earnings === 'number'
            ? summaryRes.data.total_earnings
            : (parseFloat(summaryRes.data.total_earnings) || 0),
        });
      }

      // 2. Fetch Payout Methods (/api/wallet/payout-methods)
      const payoutsRes = await apiFetch('/api/wallet/payout-methods');
      if (payoutsRes?.success && Array.isArray(payoutsRes.data)) {
        const mappedPayouts = payoutsRes.data.map((pm: any) => ({
          id: pm.id.toString(),
          type: pm.type === 'Bank Account' ? 'bank' : 'card',
          name: pm.provider || 'Stripe Bank Transfer',
          lastFour: pm.mask ? pm.mask.replace('••••', '').trim() : '4242',
          isDefault: pm.is_default,
          mask: pm.mask || '•••• 4242',
        }));
        setPayoutMethods(mappedPayouts);
        if (mappedPayouts.length > 0 && !selectedPaymentMethod) {
          setSelectedPaymentMethod(mappedPayouts[0].id);
        }
      }

      // 3. Fetch Transactions (/api/wallet/transactions)
      const txsRes = await apiFetch('/api/wallet/transactions');
      const rawTxs = Array.isArray(txsRes?.results)
        ? txsRes.results
        : (Array.isArray(txsRes?.data?.results)
            ? txsRes.data.results
            : (Array.isArray(txsRes?.data)
                ? txsRes.data
                : (Array.isArray(txsRes) ? txsRes : [])));

      if (rawTxs && rawTxs.length > 0) {
        const mappedTxs: TransactionItem[] = rawTxs.map((t: any) => {
          const typeStr = (t.type || '').trim();
          // Escrow Release, Deposit, Payment Received, Refund are incoming credits (+)
          const isCredit = ['Deposit', 'Payment Received', 'Refund', 'Escrow Release'].includes(typeStr);
          return {
            id: `#TXN${t.id}`,
            rawId: t.id,
            description: t.description || 'Wallet transaction',
            date: t.createdAt || 'Just now',
            category: typeStr || 'Transaction',
            type: isCredit ? 'credit' : 'debit',
            amount: parseFloat(t.amount) || 0.00,
            status: t.status || 'Completed',
            reference: t.refId || t.reference_id || `REF-${t.id}`,
            counterparty: t.counterparty || null,
            booking_details: t.booking_details || null,
          };
        });
        setTransactions(mappedTxs);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn('Failed to load wallet data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedPaymentMethod]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Filtered transactions matching Web Search & Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.description.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q);

      const matchesType = filterType === 'all' || tx.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType, transactions]);

  // Handle Proceed to Razorpay for Deposit
  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid deposit amount.');
      return;
    }

    setSubmittingAction(true);
    try {
      // 1. Call Backend to create Razorpay Order
      const res = await apiFetch('/api/wallet/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: amt,
          purpose: 'add_funds',
        }),
      });

      const orderData = (res as any)?.data || res;
      const orderId = orderData?.order_id || `order_${Date.now()}`;

      // 2. Open Razorpay Checkout Modal
      setIsDepositOpen(false);
      setRazorpayAmount(amt);
      setRazorpayPurpose('add_funds');
      setRazorpayOrderId(orderId);
      setIsRazorpayOpen(true);
    } catch (err: any) {
      Alert.alert('Razorpay Error', err.message || 'Unable to initialize Razorpay checkout.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Proceed to Razorpay for Withdrawal
  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (amt > walletStats.walletBalance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance.');
      return;
    }

    setSubmittingAction(true);
    try {
      // 1. Call Backend to create Razorpay Payout Order
      const res = await apiFetch('/api/wallet/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: amt,
          purpose: 'withdraw',
        }),
      });

      const orderData = (res as any)?.data || res;
      const orderId = orderData?.order_id || `order_payout_${Date.now()}`;

      // 2. Open Razorpay Payout Modal
      setIsWithdrawOpen(false);
      setRazorpayAmount(amt);
      setRazorpayPurpose('withdraw');
      setRazorpayOrderId(orderId);
      setIsRazorpayOpen(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Withdrawal initialization failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Callback when Razorpay payment is authorized/completed
  const handleRazorpaySuccess = async (details: { razorpay_payment_id: string; razorpay_order_id: string }) => {
    setIsRazorpayOpen(false);
    setIsLoading(true);

    try {
      const verifyRes = await apiFetch('/api/wallet/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: details.razorpay_order_id,
          razorpay_payment_id: details.razorpay_payment_id,
          amount: razorpayAmount,
          purpose: razorpayPurpose,
        }),
      });

      if (verifyRes.success) {
        if (razorpayPurpose === 'withdraw') {
          Alert.alert(
            'Payout Successful',
            `🎉 ₹${razorpayAmount.toFixed(2)} has been withdrawn and transferred via Razorpay Payouts!`
          );
        } else {
          Alert.alert(
            'Deposit Successful',
            `🎉 ₹${razorpayAmount.toFixed(2)} has been deposited into your FlyoraGo Escrow Wallet via Razorpay!`
          );
        }
        fetchWalletData();
      } else {
        Alert.alert('Verification Failed', verifyRes.message || 'Payment could not be verified.');
      }
    } catch (err: any) {
      Alert.alert('Verification Error', err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTxColor = (type: 'credit' | 'debit') => {
    return type === 'credit' ? FlyoraColors.success : FlyoraColors.gray800;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#062738', '#089A8D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
        >
          <View style={styles.topRow}>
            <View>
              <Text style={styles.subtitle}>Secure Escrow & Payouts</Text>
              <Text style={styles.title}>FlyoraGo Wallet</Text>
            </View>
            <View style={styles.topRightActions}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => fetchWalletData(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={19} color={FlyoraColors.white} />
              </TouchableOpacity>
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
              ₹{walletStats.walletBalance.toFixed(2)}
            </Text>
            <Text style={styles.mainBalanceSub}>Instant withdrawal to linked bank account</Text>

            <View style={styles.dualBalances}>
              <View style={styles.dualCol}>
                <Text style={styles.dualLabel}>In Escrow (Locked)</Text>
                <Text style={styles.dualValTeal}>₹{walletStats.escrowBalance.toFixed(2)}</Text>
              </View>
              <View style={styles.dualDivider} />
              <View style={styles.dualCol}>
                <Text style={styles.dualLabel}>Total Earnings</Text>
                <Text style={styles.dualVal}>₹{walletStats.totalEarnings.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Quick Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.depositBtn}
              onPress={handleOpenAddFunds}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color={FlyoraColors.navyDark} />
              <Text style={styles.depositBtnText}>Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={handleOpenWithdraw}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchWalletData(true)} colors={[FlyoraColors.teal]} />
        }
      >
        {/* Escrow Mechanism Explainer */}
        <View style={styles.explainerCard}>
          <View style={styles.explainerHeader}>
            <Ionicons name="shield-checkmark" size={18} color={FlyoraColors.tealDark} />
            <Text style={styles.explainerTitle}>Zero-Risk Escrow Protection</Text>
          </View>
          <Text style={styles.explainerDesc}>
            Funds never go directly to the traveler upfront. They are securely held in a regulated escrow
            vault and released only when recipient verifies the handover QR code / OTP.
          </Text>
        </View>

        {/* Filter and Search Bar */}
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={16} color={FlyoraColors.gray400} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID, desc or ref..."
              placeholderTextColor={FlyoraColors.gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={FlyoraColors.gray400} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={[styles.filterPill, filterType === 'all' && styles.filterPillActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterPillText, filterType === 'all' && styles.filterPillTextActive]}>
                All Types ({transactions.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, filterType === 'credit' && styles.filterPillActive]}
              onPress={() => setFilterType('credit')}
            >
              <Text style={[styles.filterPillText, filterType === 'credit' && styles.filterPillTextActive]}>
                Credits (+)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, filterType === 'debit' && styles.filterPillActive]}
              onPress={() => setFilterType('debit')}
            >
              <Text style={[styles.filterPillText, filterType === 'debit' && styles.filterPillTextActive]}>
                Debits (-)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <Text style={styles.txCount}>{filteredTransactions.length} Records</Text>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={FlyoraColors.teal} />
            <Text style={styles.loadingText}>Fetching real transactions...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={40} color={FlyoraColors.gray300} />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'Try clearing your search query' : 'Your wallet activity will appear here'}
            </Text>
          </View>
        ) : (
          filteredTransactions.map((tx) => {
            const isHold = tx.category.toLowerCase().includes('hold');
            const isRelease = tx.category.toLowerCase().includes('release');
            const isCredit = tx.type === 'credit';

            return (
              <TouchableOpacity
                key={tx.id}
                style={styles.txCard}
                onPress={() => setSelectedTxForDetail(tx)}
                activeOpacity={0.7}
              >
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.txIconCircle,
                      {
                        backgroundColor: isHold
                          ? '#FEF3C7'
                          : isRelease
                            ? '#D1FAE5'
                            : isCredit
                              ? '#CCFBF1'
                              : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        isHold
                          ? 'lock-closed-outline'
                          : isRelease
                            ? 'shield-checkmark-outline'
                            : isCredit
                              ? 'arrow-down-outline'
                              : 'arrow-up-outline'
                      }
                      size={20}
                      color={
                        isHold
                          ? '#D97706'
                          : isRelease
                            ? '#059669'
                            : isCredit
                              ? '#0D9488'
                              : '#475569'
                      }
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
                    {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </Text>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            tx.status === 'Completed' || tx.status === 'PAYMENT_RELEASED'
                              ? '#10B981'
                              : '#F59E0B',
                        },
                      ]}
                    />
                    <Text style={styles.txStatus}>{tx.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Funds Modal */}
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

            <Text style={styles.label}>Deposit Amount (₹ INR)</Text>
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
                  <Text style={styles.chipText}>+₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.actionSubmitBtn}
              onPress={handleDeposit}
              disabled={submittingAction}
            >
              {submittingAction ? (
                <ActivityIndicator size="small" color={FlyoraColors.white} />
              ) : (
                <Text style={styles.actionSubmitText}>Proceed with Razorpay</Text>
              )}
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

            <Text style={styles.label}>Withdrawal Amount (₹ INR)</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="50"
            />

            <Text style={styles.label}>Linked Bank Account / Payout Method</Text>
            <View style={styles.payoutSelector}>
              <Ionicons name="business-outline" size={18} color={FlyoraColors.teal} />
              <Text style={styles.payoutSelectorText}>
                {payoutMethods.length > 0 ? `${payoutMethods[0].name} (${payoutMethods[0].mask})` : 'HDFC Bank (•••• 4092)'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionSubmitBtn, { backgroundColor: FlyoraColors.blue }]}
              onPress={handleWithdraw}
              disabled={submittingAction}
            >
              {submittingAction ? (
                <ActivityIndicator size="small" color={FlyoraColors.white} />
              ) : (
                <Text style={styles.actionSubmitText}>Proceed with Razorpay Payout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transaction Dossier / View Details Modal (Top-Tier Liquid Watercolor UI) */}
      <Modal
        visible={!!selectedTxForDetail}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedTxForDetail(null)}
      >
        <View style={styles.dossierOverlay}>
          <View style={styles.dossierCard}>
            {/* Header: Emerald Water Color Gradient with Shimmer & Shield */}
            <LinearGradient
              colors={['#033D37', '#065F56', '#089A8D']}
              locations={[0, 0.5, 1]}
              style={styles.dossierHeader}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.dossierTagRow}>
                  <View style={styles.dossierTagIdBox}>
                    <Text style={styles.dossierTagId}>{selectedTxForDetail?.id}</Text>
                  </View>
                  <Text style={styles.dossierTagDate}>{selectedTxForDetail?.date}</Text>
                </View>
                <View style={styles.dossierTitleRow}>
                  <Text style={styles.dossierTitle}>Transaction Dossier</Text>
                  <Ionicons name="shield-checkmark" size={16} color="#2DD4BF" />
                </View>
                <Text style={styles.dossierSub}>Flyora Escrow Financial Trace & Audit Record</Text>
              </View>
              <TouchableOpacity
                style={styles.dossierCloseBtn}
                onPress={() => setSelectedTxForDetail(null)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.dossierBody}>
              {/* Value and Status Banner with Aqua-Mint Accent */}
              <View style={styles.dossierAmountRow}>
                <View>
                  <Text style={styles.dossierMetaLabel}>TRANSACTION VALUE</Text>
                  <Text
                    style={[
                      styles.dossierAmountVal,
                      {
                        color:
                          selectedTxForDetail?.type === 'credit'
                            ? '#059669'
                            : '#0F172A',
                      },
                    ]}
                  >
                    {selectedTxForDetail?.type === 'credit' ? '+' : '-'}₹
                    {selectedTxForDetail?.amount.toFixed(2)}{' '}
                    <Text style={styles.currencyCode}>INR</Text>
                  </Text>
                </View>
                <View
                  style={[
                    styles.dossierStatusPill,
                    selectedTxForDetail?.type === 'credit'
                      ? styles.dossierStatusPillCredit
                      : styles.dossierStatusPillDebit,
                  ]}
                >
                  <Ionicons
                    name={
                      selectedTxForDetail?.type === 'credit'
                        ? 'arrow-down-circle'
                        : 'arrow-up-circle'
                    }
                    size={14}
                    color={
                      selectedTxForDetail?.type === 'credit'
                        ? '#059669'
                        : '#089A8D'
                    }
                  />
                  <Text
                    style={[
                      styles.dossierStatusText,
                      {
                        color:
                          selectedTxForDetail?.type === 'credit'
                            ? '#059669'
                            : '#089A8D',
                      },
                    ]}
                  >
                    {selectedTxForDetail?.status || 'COMPLETED'}
                  </Text>
                </View>
              </View>

              {/* Description box */}
              <View style={styles.dossierDescBox}>
                <View style={styles.dossierDescIconWrap}>
                  <Ionicons
                    name="document-text"
                    size={15}
                    color="#089A8D"
                  />
                </View>
                <Text style={styles.dossierDescText}>
                  {selectedTxForDetail?.description}
                </Text>
              </View>

              {/* Counterparty / Booking details if available */}
              {selectedTxForDetail?.counterparty && (
                <View style={styles.dossierCounterpartyRow}>
                  <View style={styles.dossierUserIconWrap}>
                    <Ionicons
                      name="person"
                      size={14}
                      color="#089A8D"
                    />
                  </View>
                  <Text style={styles.dossierCounterpartyText}>
                    {selectedTxForDetail.counterparty.role}:{' '}
                    <Text style={{ fontWeight: '800', color: '#0F172A' }}>
                      {selectedTxForDetail.counterparty.name}
                    </Text>
                  </Text>
                </View>
              )}

              {/* Audit Meta Grid with Watercolor Border and Tint */}
              <View style={styles.dossierMetaTable}>
                <View style={styles.dossierMetaTableRow}>
                  <View style={styles.dossierMetaLabelWrap}>
                    <Ionicons name="pricetag-outline" size={13} color="#089A8D" />
                    <Text style={styles.dossierTableRowLabel}>Nature / Category</Text>
                  </View>
                  <Text style={styles.dossierTableRowVal}>
                    {selectedTxForDetail?.category}
                  </Text>
                </View>
                <View style={styles.dossierMetaDivider} />
                <View style={styles.dossierMetaTableRow}>
                  <View style={styles.dossierMetaLabelWrap}>
                    <Ionicons name="finger-print-outline" size={13} color="#089A8D" />
                    <Text style={styles.dossierTableRowLabel}>Reference Token</Text>
                  </View>
                  <Text style={styles.dossierTableRowVal}>
                    #{selectedTxForDetail?.reference}
                  </Text>
                </View>
              </View>

              {/* Action Button: Emerald Watercolor Gradient Button */}
              <TouchableOpacity
                style={styles.dossierBtnWrap}
                onPress={() => setSelectedTxForDetail(null)}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#089A8D', '#033D37']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dossierButton}
                >
                  <Ionicons name="checkmark-done" size={17} color="#FFFFFF" />
                  <Text style={styles.dossierButtonText}>Close Dossier</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Razorpay Responsive Checkout Modal */}
      <RazorpayCheckoutModal
        visible={isRazorpayOpen}
        amount={razorpayAmount}
        purpose={razorpayPurpose}
        orderId={razorpayOrderId}
        onSuccess={handleRazorpaySuccess}
        onClose={() => setIsRazorpayOpen(false)}
      />

      {/* KYC Validation Modal */}
      <KycValidationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        kycStatus={kycStatus}
        actionTitle={kycActionTitle}
        onNavigateToKyc={() => {
          setIsKycModalOpen(false);
          if (onNavigateToKyc) onNavigateToKyc();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FlyoraColors.background,
  },
  header: {
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: moderateScale(18),
    paddingBottom: verticalScale(20),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  headerIconBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  chatBadgeDot: {
    position: 'absolute',
    top: moderateScale(6),
    right: moderateScale(6),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#2DD4BF',
    borderWidth: 1.5,
    borderColor: '#0A1628',
  },
  subtitle: {
    fontSize: fontScale(11),
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontScale(22),
    fontWeight: '800',
    color: FlyoraColors.white,
    letterSpacing: -0.5,
  },
  mainBalanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: verticalScale(14),
  },
  mainBalanceLabel: {
    fontSize: fontScale(12),
    color: '#CBD5E1',
    fontWeight: '600',
  },
  mainBalanceValue: {
    fontSize: fontScale(32),
    fontWeight: '900',
    color: FlyoraColors.white,
    letterSpacing: -0.5,
    marginVertical: verticalScale(4),
  },
  mainBalanceSub: {
    fontSize: fontScale(11),
    color: '#94A3B8',
  },
  dualBalances: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: verticalScale(12),
    paddingTop: verticalScale(10),
  },
  dualCol: {
    flex: 1,
  },
  dualDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: moderateScale(12),
  },
  dualLabel: {
    fontSize: fontScale(11),
    color: '#94A3B8',
  },
  dualValTeal: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#2DD4BF',
    marginTop: 2,
  },
  dualVal: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: FlyoraColors.white,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  depositBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2DD4BF',
    paddingVertical: verticalScale(11),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
  },
  depositBtnText: {
    fontSize: fontScale(13),
    fontWeight: '800',
    color: FlyoraColors.navyDark,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: verticalScale(11),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
  },
  withdrawBtnText: {
    fontSize: fontScale(13),
    fontWeight: '700',
    color: FlyoraColors.white,
  },
  scrollContent: {
    padding: moderateScale(14),
    paddingBottom: verticalScale(100),
  },
  explainerCard: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: BorderRadius.md,
    padding: moderateScale(13),
    marginBottom: verticalScale(14),
  },
  explainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: verticalScale(3),
  },
  explainerTitle: {
    fontSize: fontScale(13),
    fontWeight: '700',
    color: FlyoraColors.tealDark,
  },
  explainerDesc: {
    fontSize: fontScale(11.5),
    color: FlyoraColors.gray700,
    lineHeight: fontScale(16),
  },
  filterSection: {
    marginBottom: verticalScale(14),
    gap: verticalScale(8),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FlyoraColors.surface,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(7),
  },
  searchIcon: {
    marginRight: moderateScale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: fontScale(13),
    color: FlyoraColors.gray900,
    padding: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
  },
  filterPill: {
    paddingHorizontal: moderateScale(11),
    paddingVertical: verticalScale(5),
    borderRadius: BorderRadius.full,
    backgroundColor: FlyoraColors.gray100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPillActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#2DD4BF',
  },
  filterPillText: {
    fontSize: fontScale(11.5),
    fontWeight: '600',
    color: FlyoraColors.gray600,
  },
  filterPillTextActive: {
    color: FlyoraColors.tealDark,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  sectionTitle: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: FlyoraColors.gray900,
  },
  txCount: {
    fontSize: fontScale(11.5),
    color: FlyoraColors.gray500,
    fontWeight: '600',
  },
  loadingBox: {
    padding: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(8),
  },
  loadingText: {
    fontSize: fontScale(12.5),
    color: FlyoraColors.gray500,
  },
  emptyCard: {
    backgroundColor: FlyoraColors.surface,
    borderRadius: BorderRadius.md,
    padding: moderateScale(28),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FlyoraColors.border,
  },
  emptyTitle: {
    fontSize: fontScale(14),
    fontWeight: '700',
    color: FlyoraColors.gray700,
    marginTop: verticalScale(8),
  },
  emptySub: {
    fontSize: fontScale(11.5),
    color: FlyoraColors.gray400,
    marginTop: verticalScale(3),
    textAlign: 'center',
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FlyoraColors.surface,
    borderRadius: BorderRadius.md,
    padding: moderateScale(12),
    marginBottom: verticalScale(9),
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    ...Shadows.card,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: moderateScale(10),
  },
  txIconCircle: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    justifyContent: 'center',
    alignItems: 'center',
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    fontSize: fontScale(12.5),
    fontWeight: '700',
    color: FlyoraColors.gray900,
    marginBottom: 2,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  txDate: {
    fontSize: fontScale(10.5),
    color: FlyoraColors.gray500,
  },
  txDot: {
    fontSize: fontScale(10.5),
    color: FlyoraColors.gray400,
  },
  txId: {
    fontSize: fontScale(10.5),
    fontWeight: '700',
    color: FlyoraColors.gray500,
  },
  txRight: {
    alignItems: 'flex-end',
    marginLeft: moderateScale(8),
  },
  txAmount: {
    fontSize: fontScale(14),
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    marginTop: 2,
  },
  statusDot: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
  },
  txStatus: {
    fontSize: fontScale(9.5),
    fontWeight: '700',
    color: FlyoraColors.gray500,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: FlyoraColors.surface,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: moderateScale(18),
    paddingBottom: verticalScale(34),
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  modalHeading: {
    fontSize: fontScale(17),
    fontWeight: '800',
    color: FlyoraColors.gray900,
  },
  label: {
    fontSize: fontScale(12.5),
    fontWeight: '700',
    color: FlyoraColors.gray700,
    marginBottom: verticalScale(5),
    marginTop: verticalScale(8),
  },
  amountInput: {
    backgroundColor: FlyoraColors.gray50,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(10),
    fontSize: fontScale(15),
    color: FlyoraColors.gray900,
  },
  quickChips: {
    flexDirection: 'row',
    gap: moderateScale(8),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(18),
  },
  chip: {
    paddingVertical: verticalScale(6),
    paddingHorizontal: moderateScale(11),
    backgroundColor: FlyoraColors.gray100,
    borderRadius: BorderRadius.sm,
  },
  chipText: {
    fontSize: fontScale(11.5),
    fontWeight: '700',
    color: FlyoraColors.gray700,
  },
  payoutSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FlyoraColors.gray50,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(10),
    gap: moderateScale(8),
    marginBottom: verticalScale(18),
  },
  payoutSelectorText: {
    fontSize: fontScale(13),
    fontWeight: '600',
    color: FlyoraColors.gray800,
  },
  actionSubmitBtn: {
    backgroundColor: FlyoraColors.teal,
    borderRadius: BorderRadius.md,
    paddingVertical: verticalScale(13),
    alignItems: 'center',
  },
  actionSubmitText: {
    fontSize: fontScale(14),
    fontWeight: '700',
    color: FlyoraColors.white,
  },
  dossierOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(14),
  },
  dossierCard: {
    width: '100%',
    maxWidth: SCREEN.width > 500 ? 440 : SCREEN.width - 28,
    backgroundColor: FlyoraColors.white,
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    ...Shadows.cardHover,
    borderWidth: 1,
    borderColor: 'rgba(8, 154, 141, 0.15)',
  },
  dossierHeader: {
    padding: moderateScale(18),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dossierTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: verticalScale(6),
  },
  dossierTagIdBox: {
    backgroundColor: 'rgba(45, 212, 191, 0.22)',
    paddingHorizontal: moderateScale(8),
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.45)',
  },
  dossierTagId: {
    color: '#2DD4BF',
    fontSize: fontScale(10.5),
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
  },
  dossierTagDate: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: fontScale(11),
    fontWeight: '500',
  },
  dossierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dossierTitle: {
    fontSize: fontScale(18),
    fontWeight: '900',
    color: FlyoraColors.white,
    letterSpacing: -0.3,
  },
  dossierSub: {
    fontSize: fontScale(11),
    color: '#A7D9D3',
    marginTop: 3,
    fontWeight: '500',
  },
  dossierCloseBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dossierBody: {
    padding: moderateScale(18),
    gap: verticalScale(14),
    backgroundColor: '#FFFFFF',
  },
  dossierAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F0FDFA',
  },
  dossierMetaLabel: {
    fontSize: fontScale(9.5),
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  dossierAmountVal: {
    fontSize: fontScale(26),
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  currencyCode: {
    fontSize: fontScale(13),
    fontWeight: '700',
    color: '#64748B',
  },
  dossierStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  dossierStatusPillCredit: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dossierStatusPillDebit: {
    backgroundColor: '#E6FAF6',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  dossierStatusText: {
    fontSize: fontScale(11),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dossierDescBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: moderateScale(12),
    borderRadius: moderateScale(14),
    gap: moderateScale(10),
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  dossierDescIconWrap: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#089A8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dossierDescText: {
    fontSize: fontScale(12.5),
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    lineHeight: 18,
  },
  dossierCounterpartyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    backgroundColor: '#F8FCFB',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E6FAF6',
  },
  dossierUserIconWrap: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: '#E6FAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dossierCounterpartyText: {
    fontSize: fontScale(12),
    color: '#475569',
  },
  dossierMetaTable: {
    backgroundColor: '#F8FCFB',
    borderRadius: moderateScale(14),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  dossierMetaTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
  },
  dossierMetaLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dossierMetaDivider: {
    height: 1,
    backgroundColor: '#E6FAF6',
    marginVertical: verticalScale(6),
  },
  dossierTableRowLabel: {
    fontSize: fontScale(11),
    color: '#64748B',
    fontWeight: '600',
  },
  dossierTableRowVal: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#033D37',
  },
  dossierBtnWrap: {
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    marginTop: verticalScale(4),
    ...Shadows.sm,
  },
  dossierButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(14),
  },
  dossierButtonText: {
    fontSize: fontScale(13.5),
    fontWeight: '800',
    color: FlyoraColors.white,
    letterSpacing: 0.2,
  },
});
