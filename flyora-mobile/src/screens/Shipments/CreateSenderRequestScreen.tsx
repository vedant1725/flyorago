import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop, scale, fontScale } from '../../constants/responsive';
import { FlyoraColors, Shadows } from '../../constants/theme';
import { apiFetch } from '../../services/api';
import { LocationAutocompleteInput } from '../../components/LocationAutocompleteInput';
import { DatePickerModal } from '../../components/DatePickerModal';
import { AppAlert as Alert } from '../../components/AppAlertModal';

interface CreateSenderRequestScreenProps {
  onBack: () => void;
  onRequestCreated: () => void;
}

export const CreateSenderRequestScreen: React.FC<CreateSenderRequestScreenProps> = ({
  onBack,
  onRequestCreated,
}) => {
  const insets = useSafeAreaInsets();
  const [formPickup, setFormPickup] = useState('');
  const [formDropoff, setFormDropoff] = useState('');
  const [formDeliveryDate, setFormDeliveryDate] = useState('2026-11-25');
  const [formWeight, setFormWeight] = useState('5');
  const [formCategory, setFormCategory] = useState<'General' | 'Electronics' | 'Documents' | 'Apparel' | 'Medicine'>('General');
  const [formDescription, setFormDescription] = useState('');
  const [formReceiverName, setFormReceiverName] = useState('');
  const [formReceiverPhone, setFormReceiverPhone] = useState('');
  const [formReceiverAddress, setFormReceiverAddress] = useState('');
  const [packageImages, setPackageImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPhotoPickerModal, setShowPhotoPickerModal] = useState(false);

  // Pick Image from Gallery
  const pickFromGallery = async () => {
    setShowPhotoPickerModal(false);
    if (packageImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload maximum 5 photos.');
      return;
    }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to upload parcel photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setPackageImages(prev => [...prev, base64Uri].slice(0, 5));
      }
    } catch (e: any) {
      Alert.alert('Gallery Error', e.message || 'Could not select photo from gallery.');
    }
  };

  // Capture Image with Camera
  const captureFromCamera = async () => {
    setShowPhotoPickerModal(false);
    if (packageImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload maximum 5 photos.');
      return;
    }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take parcel photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setPackageImages(prev => [...prev, base64Uri].slice(0, 5));
      }
    } catch (e: any) {
      Alert.alert('Camera Error', e.message || 'Could not capture photo.');
    }
  };

  // Remove Photo from thumbnail list
  const removePhoto = (idx: number) => {
    setPackageImages(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!formPickup.trim()) {
      Alert.alert('Missing Pickup', 'Please select a pickup location.');
      return;
    }
    if (!formDropoff.trim()) {
      Alert.alert('Missing Drop-off', 'Please select a destination drop-off location.');
      return;
    }
    if (!formDeliveryDate.trim()) {
      Alert.alert('Missing Date', 'Please choose a required delivery date.');
      return;
    }

    setSubmitting(true);
    try {
      const weightNum = parseFloat(formWeight) || 5;
      const estimatedReward = Math.max(weightNum * 12, 10);

      const tripPayload = {
        flight_number: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        airline: 'SENDER_REQUEST',
        aircraft: formCategory,
        from_location: formPickup.trim(),
        to_location: formDropoff.trim(),
        from_airport: (formDescription || 'Parcel').slice(0, 150),
        to_airport: formDropoff.trim().slice(0, 150),
        departure_date: formDeliveryDate.trim(),
        departure_time: '12:00:00',
        arrival_date: formDeliveryDate.trim(),
        arrival_time: '18:00:00',
        available_weight: weightNum,
        capacity_weight: weightNum,
        price_per_kg: estimatedReward,
        status: 'Active',
        notes: JSON.stringify({
          receiver_name: formReceiverName,
          receiver_phone: formReceiverPhone,
          receiver_address: formReceiverAddress || formDropoff.trim(),
        }),
        seats: '1',
      };

      const res = await apiFetch('/api/trips/', {
        method: 'POST',
        body: JSON.stringify(tripPayload),
      });

      if (res.success || res.data) {
        const tripId = res.data?.id;

        if (tripId && packageImages.length > 0) {
          try {
            await apiFetch(`/api/trips/${tripId}/upload_photos/`, {
              method: 'POST',
              body: JSON.stringify({ images: packageImages }),
            });
          } catch {}
        }

        Alert.alert(
          'Request Created',
          'Your parcel request has been posted across India. Travelers traveling this route will reach out to you!',
          [{ text: 'OK', onPress: onRequestCreated }]
        );
      } else {
        throw new Error(res.message || 'Could not create sender request');
      }
    } catch (e: any) {
      Alert.alert('Submission Error', e.message || 'Failed to submit parcel request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 1. Header with Airplane Art & Floating Back Button */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#033D37', '#065F56', '#089A8D']}
          locations={[0, 0.45, 1]}
          style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
        >
          {/* Background Plane & Route Art */}
          <View style={styles.headerPlaneArtWrap} pointerEvents="none">
            <ExpoImage
              source={require('../../../assets/images/home-header-plane.png')}
              style={styles.headerPlaneArt}
              contentFit="contain"
              priority="high"
              cachePolicy="memory-disk"
            />
          </View>

          {/* Top Bar: Back button & Escrow protection badge */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backButtonGlass} onPress={onBack} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={scale(20)} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerPillBadge}>
              <Ionicons name="shield-checkmark" size={scale(13)} color="#2DD4BF" />
              <Text style={styles.headerPillText}>100% Escrow Safe</Text>
            </View>
          </View>

          {/* Title Area */}
          <View style={styles.titleArea}>
            <Text style={styles.screenHeading}>Send a Package</Text>
            <Text style={styles.screenTagline}>
              Connect with verified travelers flying or traveling your destination route
            </Text>
          </View>

          {/* Route Overview Indicator */}
          <View style={styles.routePreviewCard}>
            <View style={styles.routePoint}>
              <View style={[styles.routeIconDot, { backgroundColor: '#2DD4BF' }]} />
              <Text style={styles.routeCityLabel} numberOfLines={1}>
                {formPickup.split(',')[0] || 'Pickup City'}
              </Text>
            </View>

            <View style={styles.routePlaneDivider}>
              <View style={styles.routeDottedLine} />
              <View style={styles.routePlaneIconCircle}>
                <Ionicons name="cube" size={scale(13)} color="#089A8D" />
              </View>
              <View style={styles.routeDottedLine} />
            </View>

            <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
              <View style={[styles.routeIconDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.routeCityLabel} numberOfLines={1}>
                {formDropoff.split(',')[0] || 'Delivery City'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* 2. Form Body (Floating Glass-like Surface) */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Route & Target Delivery Date */}
        <View style={styles.metaCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Route & Required Delivery</Text>
              <Text style={styles.sectionSub}>Pick cities and expected delivery target date</Text>
            </View>
          </View>

          {/* Pickup Input */}
          <LocationAutocompleteInput
            label="PICKUP LOCATION *"
            value={formPickup}
            onChange={setFormPickup}
            placeholder="e.g. Ahmedabad, Surat, Mumbai, Himatnagar..."
            iconName="airplane-outline"
          />

          {/* Drop-off Input */}
          <LocationAutocompleteInput
            label="DROP-OFF LOCATION *"
            value={formDropoff}
            onChange={setFormDropoff}
            placeholder="e.g. Delhi, Bangalore, Pune, Vadodara, Idar..."
            iconName="location-outline"
          />

          {/* Delivery Date with Calendar Picker */}
          <Text style={styles.fieldLabel}>DELIVER BY DATE *</Text>
          <TouchableOpacity
            style={styles.metaInputBox}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
            <Text style={[styles.metaInputText, { color: formDeliveryDate ? '#0F172A' : '#94A3B8' }]}>
              {formDeliveryDate || 'Select Date'}
            </Text>
            <Ionicons name="chevron-down" size={scale(14)} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Section 2: Package Specifications & Category */}
        <View style={styles.metaCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Package Details</Text>
              <Text style={styles.sectionSub}>Specify category, weight, and contents</Text>
            </View>
          </View>

          {/* Category Selector Pills */}
          <Text style={styles.fieldLabel}>PACKAGE CATEGORY</Text>
          <View style={styles.categoryPillRow}>
            {(['General', 'Electronics', 'Documents', 'Apparel', 'Medicine'] as const).map((cat) => {
              const isActive = formCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => setFormCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      cat === 'General'
                        ? 'cube'
                        : cat === 'Electronics'
                        ? 'laptop'
                        : cat === 'Documents'
                        ? 'document-text'
                        : cat === 'Apparel'
                        ? 'shirt'
                        : 'medkit'
                    }
                    size={scale(13.5)}
                    color={isActive ? '#FFFFFF' : '#089A8D'}
                  />
                  <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Package Weight & Description */}
          <View style={{ marginTop: scale(10) }}>
            <Text style={styles.fieldLabel}>ESTIMATED WEIGHT (KG) *</Text>
            <View style={styles.metaInputBox}>
              <Ionicons name="scale-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
              <TextInput
                style={styles.metaTextInput}
                value={formWeight}
                onChangeText={setFormWeight}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.inputSuffix}>KG</Text>
            </View>
          </View>

          <View style={{ marginTop: scale(12) }}>
            <Text style={styles.fieldLabel}>ITEM DESCRIPTION & PACKAGING</Text>
            <View style={[styles.metaInputBox, { height: scale(64), alignItems: 'flex-start', paddingTop: scale(8) }]}>
              <Ionicons name="reader-outline" size={scale(17)} color="#089A8D" style={[styles.fieldIcon, { marginTop: scale(2) }]} />
              <TextInput
                style={[styles.metaTextInput, { height: '100%', textAlignVertical: 'top' }]}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="e.g. Legal documents in waterproof sealed folder"
                placeholderTextColor="#94A3B8"
                multiline
              />
            </View>
          </View>

          {/* Package Photo Upload */}
          <View style={{ marginTop: scale(14) }}>
            <Text style={styles.fieldLabel}>PARCEL PHOTOS (UP TO 5)</Text>
            <View style={styles.photoUploadRow}>
              {packageImages.map((uri, idx) => (
                <View key={`img-${idx}`} style={styles.photoThumbWrap}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => removePhoto(idx)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={scale(11)} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              {packageImages.length < 5 && (
                <TouchableOpacity
                  style={styles.photoAddBtn}
                  onPress={() => setShowPhotoPickerModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={scale(20)} color="#089A8D" />
                  <Text style={styles.photoAddText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Section 3: Receiver Information */}
        <View style={styles.metaCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Receiver Information</Text>
              <Text style={styles.sectionSub}>Person who verifies and receives at destination</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>RECEIVER NAME</Text>
          <View style={styles.metaInputBox}>
            <Ionicons name="person-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
            <TextInput
              style={styles.metaTextInput}
              value={formReceiverName}
              onChangeText={setFormReceiverName}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={{ marginTop: scale(12) }}>
            <Text style={styles.fieldLabel}>RECEIVER PHONE</Text>
            <View style={styles.metaInputBox}>
              <Ionicons name="call-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
              <TextInput
                style={styles.metaTextInput}
                value={formReceiverPhone}
                onChangeText={setFormReceiverPhone}
                keyboardType="phone-pad"
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={{ marginTop: scale(12) }}>
            <Text style={styles.fieldLabel}>DELIVERY ADDRESS / LANDMARK</Text>
            <View style={styles.metaInputBox}>
              <Ionicons name="home-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
              <TextInput
                style={styles.metaTextInput}
                value={formReceiverAddress}
                onChangeText={setFormReceiverAddress}
                placeholder="e.g. Apartment, Street, Landmark"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* Section 4: Safety & Publish Action */}
        <View style={styles.metaCard}>
          <View style={styles.trustBanner}>
            <View style={styles.trustShieldBox}>
              <Ionicons name="shield-checkmark" size={scale(20)} color="#089A8D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.trustTitle}>Flyora 100% Escrow Protection</Text>
              <Text style={styles.trustSubtitle}>
                Payment stays protected in Escrow until the receiver verifies OTP & QR code.
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onBack} activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.publishButton}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.88}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={scale(17)} color="#FFFFFF" />
                  <Text style={styles.publishButtonText}>Publish Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={formDeliveryDate}
        onSelectDate={(d) => setFormDeliveryDate(d)}
        title="Select Target Delivery Date"
      />

      {/* Photo Picker Modal */}
      <Modal
        visible={showPhotoPickerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoPickerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoPickerModal(false)}
        >
          <View style={styles.choiceModalContainer}>
            <View style={styles.choiceHeader}>
              <Text style={styles.choiceTitle}>Add Parcel Photo</Text>
              <TouchableOpacity onPress={() => setShowPhotoPickerModal(false)}>
                <Ionicons name="close" size={scale(20)} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.choiceSub}>
              Clear photos increase traveler acceptance by over 300%.
            </Text>

            <TouchableOpacity
              style={styles.choiceOption}
              onPress={captureFromCamera}
              activeOpacity={0.8}
            >
              <View style={styles.choiceIconWrap}>
                <Ionicons name="camera" size={scale(20)} color="#089A8D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.choiceOptionTitle}>Take Photo</Text>
                <Text style={styles.choiceOptionSub}>Open camera and snap parcel</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(16)} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.choiceOption}
              onPress={pickFromGallery}
              activeOpacity={0.8}
            >
              <View style={[styles.choiceIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="images" size={scale(20)} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.choiceOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.choiceOptionSub}>Select from device photos</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(16)} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F8',
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: scale(28),
    borderBottomRightRadius: scale(28),
    ...Shadows.card,
  },
  headerGradient: {
    paddingHorizontal: scale(18),
    paddingBottom: scale(22),
    position: 'relative',
  },
  headerPlaneArtWrap: {
    position: 'absolute',
    right: scale(-20),
    top: scale(30),
    width: scale(190),
    height: scale(170),
    opacity: 0.22,
  },
  headerPlaneArt: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(14),
  },
  backButtonGlass: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
  },
  headerPillText: {
    fontSize: fontScale(11.5),
    fontWeight: '700',
    color: '#E6FAF6',
  },
  titleArea: {
    marginBottom: scale(16),
  },
  screenHeading: {
    fontSize: fontScale(24),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  screenTagline: {
    fontSize: fontScale(12),
    fontWeight: '500',
    color: '#A7F3D0',
    marginTop: scale(4),
    lineHeight: fontScale(17),
  },
  routePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: scale(18),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  routePoint: {
    flex: 1,
  },
  routeIconDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginBottom: scale(4),
  },
  routeCityLabel: {
    fontSize: fontScale(13),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  routePlaneDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  routeDottedLine: {
    width: scale(20),
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  routePlaneIconCircle: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(6),
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(18),
    paddingBottom: scale(40),
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(22),
    padding: scale(18),
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: scale(16),
  },
  accentBar: {
    width: scale(4),
    height: scale(24),
    borderRadius: scale(2),
    backgroundColor: '#089A8D',
  },
  sectionHeading: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: fontScale(11),
    color: '#64748B',
    marginTop: 1,
  },
  fieldLabel: {
    fontSize: fontScale(10.5),
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: scale(7),
  },
  metaInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: scale(14),
    paddingHorizontal: scale(12),
    height: scale(48),
  },
  fieldIcon: {
    marginRight: scale(8),
  },
  metaInputText: {
    flex: 1,
    fontSize: fontScale(13),
    fontWeight: '600',
  },
  metaTextInput: {
    flex: 1,
    fontSize: fontScale(13.5),
    fontWeight: '600',
    color: '#0F172A',
  },
  inputSuffix: {
    fontSize: fontScale(11.5),
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: scale(4),
  },
  categoryPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: scale(12),
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(14),
    backgroundColor: '#F0FDFA',
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
  },
  categoryPillActive: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
    shadowColor: '#089A8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryPillText: {
    fontSize: fontScale(11.5),
    fontWeight: '700',
    color: '#0F766E',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  photoUploadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    marginTop: scale(6),
  },
  photoThumbWrap: {
    position: 'relative',
    width: scale(64),
    height: scale(64),
    borderRadius: scale(14),
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.88)',
    borderRadius: 10,
    width: scale(18),
    height: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddBtn: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(14),
    borderWidth: 1.6,
    borderColor: '#089A8D',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddText: {
    fontSize: fontScale(9.5),
    fontWeight: '800',
    color: '#089A8D',
    marginTop: 3,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    backgroundColor: '#F0FDFA',
    borderRadius: scale(16),
    padding: scale(14),
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: scale(16),
  },
  trustShieldBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(12),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  trustTitle: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#0F766E',
  },
  trustSubtitle: {
    fontSize: fontScale(10.5),
    color: '#475569',
    marginTop: 2,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  cancelButton: {
    flex: 1,
    height: scale(52),
    borderRadius: scale(18),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#64748B',
  },
  publishButton: {
    flex: 2,
    height: scale(52),
    borderRadius: scale(18),
    backgroundColor: '#089A8D',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
    shadowColor: '#089A8D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  publishButtonText: {
    fontSize: fontScale(15),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  choiceModalContainer: {
    width: '100%',
    maxWidth: scale(340),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(24),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  choiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(6),
  },
  choiceTitle: {
    fontSize: fontScale(16),
    fontWeight: '800',
    color: '#0F172A',
  },
  choiceSub: {
    fontSize: fontScale(12),
    color: '#64748B',
    marginBottom: scale(16),
    lineHeight: fontScale(17),
  },
  choiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    backgroundColor: '#F8FAFC',
    borderRadius: scale(16),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: scale(12),
  },
  choiceIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: '#E6FAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceOptionTitle: {
    fontSize: fontScale(13.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  choiceOptionSub: {
    fontSize: fontScale(11),
    color: '#64748B',
    marginTop: 1,
  },
});
