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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop } from '../../constants/responsive';
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
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Post a Trip</Text>
          <Text style={styles.headerSubtitle}>Share extra baggage space across Indian cities</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Travel Route */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="location" size={16} color="#089A8D" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Travel Route (All India Search)</Text>
              <Text style={styles.cardSubtitle}>
                Type any Indian city, area, town, or transit airport
              </Text>
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

          {/* Travel Date & Time Row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>TRAVEL DATE *</Text>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={17} color="#089A8D" style={styles.inputIcon} />
                <Text style={[styles.input, { paddingTop: Platform.OS === 'ios' ? 12 : 9, color: travelDate ? '#0F172A' : '#94A3B8' }]}>
                  {travelDate || 'Select Date'}
                </Text>
                <Ionicons name="chevron-down" size={15} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.fieldLabel}>DEPARTURE TIME</Text>
              <View style={styles.inputBox}>
                <Ionicons name="time-outline" size={17} color="#089A8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={departureTime}
                  onChangeText={setDepartureTime}
                  placeholder="10:00"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Space, Mode & Pricing */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="briefcase-outline" size={16} color="#089A8D" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Space, Mode & Pricing</Text>
              <Text style={styles.cardSubtitle}>
                Specify how much weight you can carry and desired rate
              </Text>
            </View>
          </View>

          {/* Mode Selector */}
          <Text style={styles.fieldLabel}>TRAVEL MODE</Text>
          <View style={styles.modeRow}>
            {(['Flight', 'Train', 'Bus', 'Cab'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.modeButton, travelMode === mode && styles.modeButtonActive]}
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
                  size={15}
                  color={travelMode === mode ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    travelMode === mode && styles.modeButtonTextActive,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weight & Price Row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>AVAILABLE WEIGHT (KG) *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="scale-outline" size={17} color="#089A8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={availableWeight}
                  onChangeText={setAvailableWeight}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.inputSuffix}>KG</Text>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.fieldLabel}>PRICE PER KG (₹) *</Text>
              <View style={styles.inputBox}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
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

          {/* Flight/Carrier Number */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.fieldLabel}>FLIGHT / TICKET NUMBER (OPTIONAL)</Text>
            <View style={styles.inputBox}>
              <Ionicons name="ticket-outline" size={17} color="#089A8D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={carrierName}
                onChangeText={setCarrierName}
                placeholder="e.g. 6E 2132 or Train 12951"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.publishButton}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                <Text style={styles.publishButtonText}>Publish Trip</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Interactive Calendar Date Picker Modal */}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '800',
    color: '#089A8D',
    marginRight: 6,
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
    gap: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  publishButton: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#089A8D',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Shadows.card,
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
