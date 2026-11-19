import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Shipment, MOCK_SHIPMENTS, apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['All', 'Documents', 'Electronics', 'Apparel', 'Medicines', 'Gifts'];

interface ShipmentsScreenProps {
  onOpenChat?: () => void;
  onOpenProfile?: () => void;
}

export const ShipmentsScreen: React.FC<ShipmentsScreenProps> = ({ onOpenChat, onOpenProfile }) => {
  const { currentRole, user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New Shipment Request Modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Electronics' | 'Documents' | 'Apparel' | 'Medicines' | 'Gifts' | 'Other'>('Documents');
  const [weightKg, setWeightKg] = useState('2.5');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [rewardOffer, setRewardOffer] = useState('50');
  const [insuranceIncluded, setInsuranceIncluded] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Shipment Details Modal
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [offerSuccess, setOfferSuccess] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/shipments/');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setShipments(res.data);
      }
    } catch {
      // Retain existing state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.originCity.toLowerCase().includes(q) ||
      item.destinationCity.toLowerCase().includes(q) ||
      item.senderName.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCreateShipment = async () => {
    if (!title.trim() || !originCity.trim() || !destinationCity.trim()) {
      Alert.alert('Incomplete Form', 'Please enter a title, origin city, and destination city.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        category,
        weight_kg: Number(weightKg) || 1.0,
        origin_city: originCity,
        destination_city: destinationCity,
        target_delivery_date: targetDate || '2026-11-28',
        reward_offer: Number(rewardOffer) || 40,
        insurance_included: insuranceIncluded,
      };

      const res = await apiFetch('/api/shipments/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const newShipment: Shipment = {
        id: res.data?.id || `sh-${Date.now()}`,
        senderName: 'You (Verified Sender)',
        title,
        category,
        weightKg: Number(weightKg) || 1.0,
        originCity,
        destinationCity,
        targetDeliveryDate: targetDate || '2026-11-28',
        rewardOffer: Number(rewardOffer) || 40,
        status: 'PENDING_MATCH',
        insuranceIncluded,
        dimensions: '25x20x10 cm',
      };

      setShipments([newShipment, ...shipments]);
      setIsPostModalOpen(false);
      setTitle('');
      setOriginCity('');
      setDestinationCity('');
      setRewardOffer('50');
      Alert.alert('Request Published', 'Your package delivery request is live. Verified travelers flying this route will be notified!');
    } catch {
      Alert.alert('Notice', 'Request published locally in offline test mode.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCarryOffer = () => {
    setOfferSuccess(true);
    setTimeout(() => {
      setOfferSuccess(false);
      setSelectedShipment(null);
      Alert.alert('Delivery Offer Sent', 'The sender has been notified. Check your messages to coordinate parcel pickup!');
    }, 1200);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'electronics':
        return '#3B82F6';
      case 'documents':
        return '#0D9488';
      case 'apparel':
        return '#8B5CF6';
      case 'medicines':
        return '#EF4444';
      default:
        return '#F59E0B';
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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSubtitle}>Sender Requests & Parcels</Text>
              <Text style={styles.headerTitle}>Package Directory</Text>
            </View>
            <View style={styles.topRightActions}>
              <TouchableOpacity
                style={styles.postBtn}
                onPress={() => setIsPostModalOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color={FlyoraColors.white} />
                <Text style={styles.postBtnText}>Post</Text>
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

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={FlyoraColors.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by city (e.g. Mumbai, Dubai, London)..."
              placeholderTextColor={FlyoraColors.gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={FlyoraColors.gray400} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </LinearGradient>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={FlyoraColors.teal} />
          <Text style={styles.loadingText}>Fetching active delivery requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredShipments}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={FlyoraColors.gray400} />
              <Text style={styles.emptyTitle}>No matching parcels found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your city search or filter categories.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedShipment(item)}
              activeOpacity={0.88}
            >
              {/* Category & Status Row */}
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: `${getCategoryColor(item.category)}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryTagText,
                      { color: getCategoryColor(item.category) },
                    ]}
                  >
                    {item.category}
                  </Text>
                </View>

                <View style={styles.bountyBadge}>
                  <Text style={styles.bountyAmount}>${item.rewardOffer}</Text>
                  <Text style={styles.bountyLabel}>Reward</Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.parcelTitle} numberOfLines={2}>
                {item.title}
              </Text>

              {/* Route */}
              <View style={styles.routeRow}>
                <Ionicons name="location" size={16} color={FlyoraColors.teal} />
                <Text style={styles.routeCity}>{item.originCity}</Text>
                <Ionicons name="arrow-forward" size={14} color={FlyoraColors.gray400} />
                <Text style={styles.routeCity}>{item.destinationCity}</Text>
              </View>

              {/* Specs Grid */}
              <View style={styles.specsRow}>
                <View style={styles.specItem}>
                  <Ionicons name="barbell-outline" size={14} color={FlyoraColors.gray500} />
                  <Text style={styles.specText}>{item.weightKg} kg</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="calendar-outline" size={14} color={FlyoraColors.gray500} />
                  <Text style={styles.specText}>Need by {item.targetDeliveryDate}</Text>
                </View>
                {item.insuranceIncluded && (
                  <View style={styles.specItem}>
                    <Ionicons name="shield-checkmark" size={14} color={FlyoraColors.teal} />
                    <Text style={[styles.specText, { color: FlyoraColors.tealDark }]}>
                      Insured
                    </Text>
                  </View>
                )}
              </View>

              {/* Footer Sender Bar */}
              <View style={styles.cardFooter}>
                <View style={styles.senderInfo}>
                  <Ionicons name="person-circle-outline" size={20} color={FlyoraColors.gray600} />
                  <Text style={styles.senderName}>{item.senderName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setSelectedShipment(item)}
                >
                  <Text style={styles.actionBtnText}>
                    {currentRole === 'traveler' ? 'Carry Package' : 'View Details'}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={FlyoraColors.tealDark} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Post Shipment Modal */}
      <Modal
        visible={isPostModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsPostModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send a Package</Text>
            <TouchableOpacity onPress={() => setIsPostModalOpen(false)}>
              <Ionicons name="close" size={24} color={FlyoraColors.gray700} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Package Title / Description *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Urgent Legal Contracts & Business Cards"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Item Category</Text>
            <View style={styles.categoryPickerRow}>
              {(['Documents', 'Electronics', 'Apparel', 'Medicines', 'Gifts'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Origin City *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Mumbai"
                  value={originCity}
                  onChangeText={setOriginCity}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Destination City *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Dubai"
                  value={destinationCity}
                  onChangeText={setDestinationCity}
                />
              </View>
            </View>

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Package Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={weightKg}
                  onChangeText={setWeightKg}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Traveler Bounty ($)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={rewardOffer}
                  onChangeText={setRewardOffer}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Target Delivery Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD (e.g. 2026-11-28)"
              value={targetDate}
              onChangeText={setTargetDate}
            />

            {/* Insurance Toggle */}
            <TouchableOpacity
              style={styles.insuranceBox}
              onPress={() => setInsuranceIncluded(!insuranceIncluded)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={insuranceIncluded ? 'checkbox' : 'square-outline'}
                size={22}
                color={insuranceIncluded ? FlyoraColors.teal : FlyoraColors.gray400}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.insuranceTitle}>FlyoraGo Escrow Protection</Text>
                <Text style={styles.insuranceSubtitle}>
                  Includes guaranteed loss cover up to $500. Funds held in vault.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleCreateShipment}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={FlyoraColors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Publish Delivery Request</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Shipment Details & Claim Modal */}
      <Modal
        visible={Boolean(selectedShipment)}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedShipment(null)}
      >
        <View style={styles.detailsBackdrop}>
          <View style={styles.detailsCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Parcel Request</Text>
              <TouchableOpacity onPress={() => setSelectedShipment(null)}>
                <Ionicons name="close" size={24} color={FlyoraColors.gray700} />
              </TouchableOpacity>
            </View>

            {selectedShipment && (
              <ScrollView style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                <View style={styles.detailsTopBadgeRow}>
                  <View
                    style={[
                      styles.categoryTag,
                      { backgroundColor: `${getCategoryColor(selectedShipment.category)}15` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTagText,
                        { color: getCategoryColor(selectedShipment.category) },
                      ]}
                    >
                      {selectedShipment.category}
                    </Text>
                  </View>
                  <Text style={styles.detailsReward}>
                    Bounty: ${selectedShipment.rewardOffer} USD
                  </Text>
                </View>

                <Text style={styles.detailsMainTitle}>{selectedShipment.title}</Text>

                <View style={styles.detailsRouteBox}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.detailsRouteLabel}>FROM</Text>
                    <Text style={styles.detailsRouteCity}>{selectedShipment.originCity}</Text>
                  </View>
                  <Ionicons name="airplane" size={22} color={FlyoraColors.teal} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.detailsRouteLabel}>TO</Text>
                    <Text style={styles.detailsRouteCity}>{selectedShipment.destinationCity}</Text>
                  </View>
                </View>

                <View style={styles.detailsMetaGrid}>
                  <View style={styles.detailsMetaCard}>
                    <Text style={styles.detailsMetaTitle}>Weight</Text>
                    <Text style={styles.detailsMetaVal}>{selectedShipment.weightKg} kg</Text>
                  </View>
                  <View style={styles.detailsMetaCard}>
                    <Text style={styles.detailsMetaTitle}>Deadline</Text>
                    <Text style={styles.detailsMetaVal}>{selectedShipment.targetDeliveryDate}</Text>
                  </View>
                  <View style={styles.detailsMetaCard}>
                    <Text style={styles.detailsMetaTitle}>Security</Text>
                    <Text style={[styles.detailsMetaVal, { color: FlyoraColors.tealDark }]}>
                      Escrow Vault
                    </Text>
                  </View>
                </View>

                <View style={styles.escrowNoticeBox}>
                  <Ionicons name="lock-closed" size={20} color={FlyoraColors.tealDark} />
                  <Text style={styles.escrowNoticeText}>
                    Funds are placed in verified escrow before pickup and released instantly into
                    your wallet when recipient confirms OTP delivery.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.claimButton, offerSuccess && { backgroundColor: FlyoraColors.success }]}
                  onPress={handleCarryOffer}
                  disabled={offerSuccess}
                >
                  {offerSuccess ? (
                    <Text style={styles.claimButtonText}>✓ Offer Sent to Sender!</Text>
                  ) : (
                    <Text style={styles.claimButtonText}>
                      {currentRole === 'traveler'
                        ? `Accept & Earn $${selectedShipment.rewardOffer}`
                        : 'Message / Match Traveler'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
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
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: FlyoraColors.white,
    letterSpacing: -0.5,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FlyoraColors.teal,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 4,
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
  postBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: FlyoraColors.white,
    fontSize: 14,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  categoryPillActive: {
    backgroundColor: FlyoraColors.tealBright,
    borderColor: FlyoraColors.tealBright,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  categoryTextActive: {
    color: FlyoraColors.navyDark,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: FlyoraColors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    ...Shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bountyBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bountyAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: FlyoraColors.tealDark,
  },
  bountyLabel: {
    fontSize: 11,
    color: FlyoraColors.gray500,
    fontWeight: '500',
  },
  parcelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FlyoraColors.gray900,
    marginBottom: 10,
    lineHeight: 22,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: FlyoraColors.gray50,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  routeCity: {
    fontSize: 13,
    fontWeight: '600',
    color: FlyoraColors.gray800,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontSize: 12,
    color: FlyoraColors.gray600,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: FlyoraColors.borderSubtle,
    paddingTop: 12,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: FlyoraColors.gray700,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.tealDark,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: FlyoraColors.gray600,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FlyoraColors.gray800,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: FlyoraColors.gray500,
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: FlyoraColors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: FlyoraColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FlyoraColors.gray900,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.gray700,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: FlyoraColors.gray50,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: FlyoraColors.gray900,
    marginBottom: 16,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryOption: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    backgroundColor: FlyoraColors.gray100,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
  },
  categoryOptionSelected: {
    backgroundColor: FlyoraColors.tealSubtle,
    borderColor: FlyoraColors.teal,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: FlyoraColors.gray700,
  },
  categoryOptionTextSelected: {
    color: FlyoraColors.tealDark,
    fontWeight: '700',
  },
  rowTwoCols: {
    flexDirection: 'row',
  },
  insuranceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FlyoraColors.tealSubtle,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: FlyoraColors.tealLight,
    marginBottom: 20,
  },
  insuranceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.tealDark,
  },
  insuranceSubtitle: {
    fontSize: 11,
    color: FlyoraColors.gray600,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: FlyoraColors.teal,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
  detailsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detailsCard: {
    backgroundColor: FlyoraColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  detailsTopBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  detailsReward: {
    fontSize: 16,
    fontWeight: '800',
    color: FlyoraColors.tealDark,
  },
  detailsMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FlyoraColors.gray900,
    marginBottom: 16,
  },
  detailsRouteBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: FlyoraColors.gray50,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
  },
  detailsRouteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: FlyoraColors.gray400,
    letterSpacing: 0.5,
  },
  detailsRouteCity: {
    fontSize: 16,
    fontWeight: '800',
    color: FlyoraColors.gray900,
    marginTop: 2,
  },
  detailsMetaGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailsMetaCard: {
    flex: 1,
    backgroundColor: FlyoraColors.gray50,
    padding: 10,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FlyoraColors.borderSubtle,
  },
  detailsMetaTitle: {
    fontSize: 11,
    color: FlyoraColors.gray500,
    fontWeight: '600',
  },
  detailsMetaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.gray900,
    marginTop: 2,
  },
  escrowNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    padding: 12,
    borderRadius: BorderRadius.md,
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  escrowNoticeText: {
    fontSize: 12,
    color: FlyoraColors.tealDark,
    flex: 1,
    lineHeight: 17,
  },
  claimButton: {
    backgroundColor: FlyoraColors.teal,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  claimButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
});
