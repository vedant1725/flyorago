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
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop } from '../../constants/responsive';
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
      Alert.alert('Camera Error', e.message || 'Could not take photo.');
    }
  };

  const removeImage = (index: number) => {
    setPackageImages(prev => prev.filter((_, i) => i !== index));
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
      Alert.alert('Missing Date', 'Please select a delivery date.');
      return;
    }

    setSubmitting(true);
    try {
      const weightNum = parseFloat(formWeight) || 1.0;
      const rateEst = Math.max(10, Math.round(weightNum * 12));
      const payload = {
        flight_number: `REQ-${Date.now().toString().slice(-4)}`,
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
        duration: 'N/A',
        terminal_from: (formReceiverName || 'Receiver').slice(0, 50),
        terminal_to: (formReceiverPhone || '').slice(0, 30),
        notes: JSON.stringify({
          receiver_name: formReceiverName,
          receiver_phone: formReceiverPhone,
          receiver_address: formReceiverAddress || formDropoff.trim(),
        }),
        seats: '1',
        capacity_weight: weightNum,
        available_weight: weightNum,
        price_per_kg: rateEst,
        accepted_parcel_types: packageImages,
      };

      const res = await apiFetch('/api/trips/', { method: 'POST', body: JSON.stringify(payload) });

      if (!res.success && !res.data) {
        throw new Error(res.message || 'Failed to create sender request on server.');
      }

      // Create linked booking
      try {
        await apiFetch('/api/bookings/', {
          method: 'POST',
          body: JSON.stringify({
            sender_trip: res.data?.id,
            package_name: `${formCategory || 'General'} Parcel`,
            package_category: formCategory || 'General',
            package_image: packageImages.length > 0 ? JSON.stringify(packageImages) : '📦',
            weight: weightNum,
            reward: rateEst,
            receiver_name: formReceiverName || 'Receiver',
            receiver_phone: formReceiverPhone || '',
            receiver_address: formReceiverAddress || formDropoff.trim(),
          }),
        });
      } catch (e) {}

      Alert.alert('Success', 'Parcel delivery request published successfully!', [
        { text: 'OK', onPress: onRequestCreated },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to publish request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header - Exact Same Theme as Traveler CreateTripScreen */}
      <View style={[styles.header, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Post a Package Request</Text>
          <Text style={styles.headerSubtitle}>
            Match with verified travelers flying to your destination
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card 1: Route & Date (All India Search) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="location" size={16} color="#089A8D" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Route Details (All India Search)</Text>
              <Text style={styles.cardSubtitle}>
                Type any Indian city, area, town, or transit airport
              </Text>
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
          <Text style={styles.fieldLabel}>DELIVERY BY DATE *</Text>
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={17} color="#089A8D" style={styles.inputIcon} />
            <Text style={[styles.input, { paddingTop: Platform.OS === 'ios' ? 12 : 9, color: formDeliveryDate ? '#0F172A' : '#94A3B8' }]}>
              {formDeliveryDate || 'Select Date'}
            </Text>
            <Ionicons name="chevron-down" size={15} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Card 2: Package Specifications & Category */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="cube-outline" size={16} color="#089A8D" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Package Specifications</Text>
              <Text style={styles.cardSubtitle}>
                Provide accurate weight, category and contents description
              </Text>
            </View>
          </View>

          {/* Category Selector Buttons (Travel Mode styled) */}
          <Text style={styles.fieldLabel}>PACKAGE CATEGORY</Text>
          <View style={styles.modeRow}>
            {(['General', 'Electronics', 'Documents', 'Apparel', 'Medicine'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.modeButton, formCategory === cat && styles.modeButtonActive]}
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
                  size={14}
                  color={formCategory === cat ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    formCategory === cat && styles.modeButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weight */}
          <Text style={styles.fieldLabel}>PACKAGE WEIGHT (KG) *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="scale-outline" size={17} color="#089A8D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formWeight}
              onChangeText={setFormWeight}
              keyboardType="numeric"
              placeholder="e.g. 5"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.inputSuffix}>KG</Text>
          </View>

          {/* Description */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>DESCRIPTION</Text>
          <View style={[styles.inputBox, { height: 75, alignItems: 'flex-start', paddingTop: 10 }]}>
            <Ionicons name="pencil-outline" size={17} color="#089A8D" style={[styles.inputIcon, { marginTop: 2 }]} />
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="Brief description of package contents..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Package Photos Upload */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            <Text style={styles.fieldLabel}>UPLOAD PACKAGE PHOTOS</Text>
            <Text style={{ fontSize: 10, color: '#089A8D', fontWeight: '700' }}>
              {packageImages.length > 0 ? `${packageImages.length}/5 uploaded` : 'Optional'}
            </Text>
          </View>
          <View style={styles.photoUploadRow}>
            {packageImages.map((uri, idx) => (
              <View key={idx} style={styles.photoThumbWrap}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.photoRemoveBtn}
                  onPress={() => removeImage(idx)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {packageImages.length < 5 && (
              <TouchableOpacity
                style={styles.photoAddBtn}
                onPress={() => setShowPhotoPickerModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={24} color="#089A8D" />
                <Text style={styles.photoAddText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Card 3: Designated Receiver Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="person-outline" size={16} color="#089A8D" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Receiver Information</Text>
              <Text style={styles.cardSubtitle}>
                Who will receive and verify this parcel at the destination
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>RECEIVER NAME</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={17} color="#089A8D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formReceiverName}
              onChangeText={setFormReceiverName}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>RECEIVER PHONE</Text>
          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={17} color="#089A8D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formReceiverPhone}
              onChangeText={setFormReceiverPhone}
              keyboardType="phone-pad"
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>DELIVERY ADDRESS</Text>
          <View style={styles.inputBox}>
            <Ionicons name="home-outline" size={17} color="#089A8D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formReceiverAddress}
              onChangeText={setFormReceiverAddress}
              placeholder="e.g. Apartment, Street, Landmark"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Card 4: Safety & Publish Action */}
        <View style={styles.card}>
          <View style={styles.trustBanner}>
            <Ionicons name="shield-checkmark" size={24} color="#089A8D" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.trustTitle}>Flyora 100% Escrow Protection</Text>
              <Text style={styles.trustSubtitle}>
                Payment stays locked in Escrow until the receiver verifies OTP & QR code.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.publishButton, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                <Text style={styles.publishButtonText}>Publish Parcel Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Interactive Calendar Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={formDeliveryDate}
        onSelectDate={(d) => setFormDeliveryDate(d)}
        title="Select Delivery Date"
      />

      {/* Choice Modal for Camera or Gallery */}
      <Modal visible={showPhotoPickerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.choiceModalContainer}>
            <View style={styles.choiceHeader}>
              <Text style={styles.choiceTitle}>Upload Package Photo</Text>
              <TouchableOpacity onPress={() => setShowPhotoPickerModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.choiceSubtitle}>Choose how you want to add photos of your parcel:</Text>

            <View style={styles.choiceActionsRow}>
              <TouchableOpacity style={styles.choiceCard} onPress={captureFromCamera} activeOpacity={0.8}>
                <View style={[styles.choiceIconWrap, { backgroundColor: '#F0FDFA' }]}>
                  <Ionicons name="camera" size={26} color="#089A8D" />
                </View>
                <Text style={styles.choiceCardTitle}>Take Photo</Text>
                <Text style={styles.choiceCardSub}>Use camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.choiceCard} onPress={pickFromGallery} activeOpacity={0.8}>
                <View style={[styles.choiceIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="images" size={26} color="#0284C7" />
                </View>
                <Text style={styles.choiceCardTitle}>Gallery</Text>
                <Text style={styles.choiceCardSub}>Pick from photos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.choiceCancelBtn} onPress={() => setShowPhotoPickerModal(false)}>
              <Text style={styles.choiceCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#033D37',
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#99F6E4',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6FAF6',
    ...Shadows.card,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E6FAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputSuffix: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeButtonActive: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
  },
  modeButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  photoUploadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  photoThumbWrap: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 14,
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
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddBtn: {
    width: 68,
    height: 68,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#089A8D',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#089A8D',
    marginTop: 3,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 16,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#089A8D',
  },
  trustSubtitle: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 2,
    lineHeight: 14,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#089A8D',
    height: 52,
    borderRadius: 16,
    gap: 8,
    ...Shadows.tealGlow,
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  choiceModalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
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
    marginBottom: 6,
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  choiceSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  choiceActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  choiceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  choiceCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  choiceCardSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  choiceCancelBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  choiceCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
