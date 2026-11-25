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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop, scale, fontScale } from '../../constants/responsive';
import { FlyoraColors, Shadows } from '../../constants/theme';
import { apiFetch } from '../../services/api';
import { LocationAutocompleteInput } from '../../components/LocationAutocompleteInput';
import { DatePickerModal } from '../../components/DatePickerModal';
import { useAuth } from '../../context/AuthContext';
import { AppAlert as Alert } from '../../components/AppAlertModal';

interface CreateTripScreenProps {
  onBack: () => void;
  onTripCreated: () => void;
}

export const CreateTripScreen: React.FC<CreateTripScreenProps> = ({
  onBack,
  onTripCreated,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [travelDate, setTravelDate] = useState('2026-11-25');
  const [departureTime, setDepartureTime] = useState('10:00');
  const [availableWeight, setAvailableWeight] = useState('15');
  const [pricePerKg, setPricePerKg] = useState('10');
  const [travelMode, setTravelMode] = useState<'Flight' | 'Train' | 'Bus' | 'Cab'>('Flight');
  const [carrierName, setCarrierName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!departureCity.trim()) {
      Alert.alert('Missing Departure', 'Please select a departure location.');
      return;
    }
    if (!arrivalCity.trim()) {
      Alert.alert('Missing Arrival', 'Please select an arrival destination.');
      return;
    }
    if (!travelDate.trim()) {
      Alert.alert('Missing Date', 'Please enter your travel date (YYYY-MM-DD).');
      return;
    }

    setSubmitting(true);
    try {
      const weightNum = parseFloat(availableWeight) || 15;
      const priceNum = parseFloat(pricePerKg) || 10;
      const randomFlightNum = 'FL-' + Math.floor(100 + Math.random() * 900);

      const payload = {
        traveler: user?.id || '5',
        from_location: departureCity,
        to_location: arrivalCity,
        from_airport: departureCity,
        to_airport: arrivalCity,
        departure_date: travelDate,
        departure_time: departureTime ? `${departureTime}:00` : '10:00:00',
        arrival_date: travelDate,
        arrival_time: '12:30:00',
        flight_number: carrierName || randomFlightNum,
        airline: `${travelMode} Express`,
        capacity_weight: weightNum,
        available_weight: weightNum,
        price_per_kg: priceNum,
        status: 'Active',
      };

      const res = await apiFetch('/api/trips/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success || res.data) {
        Alert.alert('Success', 'Trip published successfully!', [
          { text: 'OK', onPress: onTripCreated },
        ]);
      } else {
        throw new Error(res.message || 'Failed to create trip');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to publish trip. Please try again.');
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

          {/* Top Row: Back button & Header Badges */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backButtonGlass} onPress={onBack} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={scale(20)} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerPillBadge}>
              <Ionicons name="shield-checkmark" size={scale(13)} color="#2DD4BF" />
              <Text style={styles.headerPillText}>Verified Traveler</Text>
            </View>
          </View>

          {/* Main Title & Tagline */}
          <View style={styles.titleArea}>
            <Text style={styles.screenHeading}>Post a Trip</Text>
            <Text style={styles.screenTagline}>
              Monetize empty baggage space securely across Indian transit hubs
            </Text>
          </View>

          {/* Quick Route Summary Card */}
          <View style={styles.routePreviewCard}>
            <View style={styles.routePoint}>
              <View style={[styles.routeIconDot, { backgroundColor: '#2DD4BF' }]} />
              <Text style={styles.routeCityLabel} numberOfLines={1}>
                {departureCity.split(',')[0] || 'Origin City'}
              </Text>
            </View>

            <View style={styles.routePlaneDivider}>
              <View style={styles.routeDottedLine} />
              <View style={styles.routePlaneIconCircle}>
                <Ionicons name="airplane" size={scale(14)} color="#089A8D" />
              </View>
              <View style={styles.routeDottedLine} />
            </View>

            <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
              <View style={[styles.routeIconDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.routeCityLabel} numberOfLines={1}>
                {arrivalCity.split(',')[0] || 'Destination'}
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
        {/* Section 1: Route & Timings */}
        <View style={styles.metaCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Travel Route & Schedule</Text>
              <Text style={styles.sectionSub}>Select departure, arrival, and timing</Text>
            </View>
          </View>

          {/* Departure Input */}
          <LocationAutocompleteInput
            label="DEPARTURE LOCATION *"
            value={departureCity}
            onChange={setDepartureCity}
            placeholder="e.g. Ahmedabad, Surat, Mumbai, Rajkot..."
            iconName="airplane-outline"
          />

          {/* Arrival Input */}
          <LocationAutocompleteInput
            label="ARRIVAL LOCATION *"
            value={arrivalCity}
            onChange={setArrivalCity}
            placeholder="e.g. Delhi, Bangalore, Pune, Vadodara, Idar..."
            iconName="location-outline"
          />

          {/* Date & Time Row */}
          <View style={styles.twoColRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>TRAVEL DATE *</Text>
              <TouchableOpacity
                style={styles.metaInputBox}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
                <Text style={[styles.metaInputText, { color: travelDate ? '#0F172A' : '#94A3B8' }]}>
                  {travelDate || 'Select Date'}
                </Text>
                <Ionicons name="chevron-down" size={scale(14)} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>DEPARTURE TIME</Text>
              <View style={styles.metaInputBox}>
                <Ionicons name="time-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
                <TextInput
                  style={styles.metaTextInput}
                  value={departureTime}
                  onChangeText={setDepartureTime}
                  placeholder="10:00"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Space, Pricing & Mode */}
        <View style={styles.metaCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Luggage Space & Earnings</Text>
              <Text style={styles.sectionSub}>Specify weight capacity, rate, and carrier</Text>
            </View>
          </View>

          {/* Travel Mode Pills */}
          <Text style={styles.fieldLabel}>TRAVEL MODE</Text>
          <View style={styles.modePillRow}>
            {(['Flight', 'Train', 'Bus', 'Cab'] as const).map((mode) => {
              const isActive = travelMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modePill, isActive && styles.modePillActive]}
                  onPress={() => setTravelMode(mode)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      mode === 'Flight'
                        ? 'airplane'
                        : mode === 'Train'
                        ? 'train'
                        : mode === 'Bus'
                        ? 'bus'
                        : 'car'
                    }
                    size={scale(15)}
                    color={isActive ? '#FFFFFF' : '#089A8D'}
                  />
                  <Text style={[styles.modePillText, isActive && styles.modePillTextActive]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Weight & Price Row */}
          <View style={styles.twoColRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>AVAILABLE WEIGHT *</Text>
              <View style={styles.metaInputBox}>
                <Ionicons name="scale-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
                <TextInput
                  style={styles.metaTextInput}
                  value={availableWeight}
                  onChangeText={setAvailableWeight}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.inputSuffix}>KG</Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>PRICE PER KG *</Text>
              <View style={styles.metaInputBox}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.metaTextInput}
                  value={pricePerKg}
                  onChangeText={setPricePerKg}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.inputSuffix}>/kg</Text>
              </View>
            </View>
          </View>

          {/* Optional Carrier/Flight Number */}
          <View style={{ marginTop: scale(14) }}>
            <Text style={styles.fieldLabel}>FLIGHT / TICKET / CARRIER NUMBER</Text>
            <View style={styles.metaInputBox}>
              <Ionicons name="ticket-outline" size={scale(17)} color="#089A8D" style={styles.fieldIcon} />
              <TextInput
                style={styles.metaTextInput}
                value={carrierName}
                onChangeText={setCarrierName}
                placeholder="e.g. 6E 2132 or Train 12951"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Potential Earnings Display */}
          <View style={styles.earningsBanner}>
            <View style={styles.earningsIconBox}>
              <Ionicons name="wallet-outline" size={scale(18)} color="#089A8D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.earningsTitle}>Estimated Payout</Text>
              <Text style={styles.earningsValue}>
                ₹{(parseFloat(availableWeight || '0') * parseFloat(pricePerKg || '0')).toFixed(0)}
                <Text style={styles.earningsSub}> guaranteed via Escrow</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button Row */}
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
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={scale(17)} color="#FFFFFF" />
                <Text style={styles.publishButtonText}>Publish Trip</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={travelDate}
        onSelectDate={(d) => setTravelDate(d)}
        title="Select Travel Date"
      />
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
  twoColRow: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: scale(10),
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
  currencyPrefix: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#089A8D',
    marginRight: scale(6),
  },
  inputSuffix: {
    fontSize: fontScale(11.5),
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: scale(4),
  },
  modePillRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: scale(16),
  },
  modePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    height: scale(42),
    borderRadius: scale(14),
    backgroundColor: '#F0FDFA',
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
  },
  modePillActive: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
    shadowColor: '#089A8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modePillText: {
    fontSize: fontScale(12),
    fontWeight: '700',
    color: '#0F766E',
  },
  modePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  earningsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    backgroundColor: '#F0FDFA',
    borderRadius: scale(16),
    padding: scale(14),
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginTop: scale(16),
  },
  earningsIconBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(12),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  earningsTitle: {
    fontSize: fontScale(11),
    fontWeight: '700',
    color: '#0F766E',
  },
  earningsValue: {
    fontSize: fontScale(16),
    fontWeight: '900',
    color: '#033D37',
  },
  earningsSub: {
    fontSize: fontScale(11),
    fontWeight: '500',
    color: '#64748B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginTop: scale(6),
    marginBottom: scale(20),
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
});
