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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Trip, MOCK_TRIPS, apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface TripsScreenProps {
  onOpenChat?: () => void;
  onOpenProfile?: () => void;
}

export const TripsScreen: React.FC<TripsScreenProps> = ({ onOpenChat, onOpenProfile }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Post trip modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originCity, setOriginCity] = useState('');
  const [originAirport, setOriginAirport] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationAirport, setDestinationAirport] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [capacityKg, setCapacityKg] = useState('15');
  const [pricePerKg, setPricePerKg] = useState('20');
  const [submitting, setSubmitting] = useState(false);

  // Booking modal
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [bookingKg, setBookingKg] = useState('2');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/trips/');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTrips(res.data);
      }
    } catch {
      // Fallback to initial mock trips
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.originCity.toLowerCase().includes(q) ||
      t.destinationCity.toLowerCase().includes(q) ||
      t.originAirport.toLowerCase().includes(q) ||
      t.destinationAirport.toLowerCase().includes(q) ||
      t.travelerName.toLowerCase().includes(q)
    );
  });

  const handleCreateTrip = async () => {
    if (!originCity || !destinationCity || !departureDate) {
      Alert.alert('Missing Details', 'Please provide origin, destination, and departure date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        origin_city: originCity,
        origin_airport: originAirport.toUpperCase() || originCity.substring(0, 3).toUpperCase(),
        destination_city: destinationCity,
        destination_airport: destinationAirport.toUpperCase() || destinationCity.substring(0, 3).toUpperCase(),
        flight_number: flightNumber,
        departure_date: departureDate,
        available_weight: Number(capacityKg) || 10,
        price_per_kg: Number(pricePerKg) || 20,
      };

      const res = await apiFetch('/api/trips/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const newTrip: Trip = {
        id: res.data?.id || `tr-${Date.now()}`,
        travelerName: 'You (Verified Traveler)',
        travelerKycVerified: true,
        trustScore: 5.0,
        originAirport: payload.origin_airport,
        originCity: payload.origin_city,
        destinationAirport: payload.destination_airport,
        destinationCity: payload.destination_city,
        flightNumber: payload.flight_number || 'Direct Flight',
        departureDate: payload.departure_date,
        availableWeightKg: payload.available_weight,
        totalCapacityKg: payload.available_weight,
        pricePerKg: payload.price_per_kg,
        status: 'SCHEDULED',
      };

      setTrips([newTrip, ...trips]);
      setIsModalOpen(false);
      Alert.alert('Trip Listed', 'Your flight luggage space is now live for senders to book!');
    } catch {
      Alert.alert('Error', 'Could not create trip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookSpace = async () => {
    if (!selectedTrip) return;
    setBookingLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      Alert.alert(
        'Space Reserved',
        `Successfully requested ${bookingKg} kg on flight ${selectedTrip.originAirport} → ${selectedTrip.destinationAirport}. Escrow funds hold initiated.`
      );
      setSelectedTrip(null);
    } finally {
      setBookingLoading(false);
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
          <View style={styles.headerTopBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Traveler Flights</Text>
              <Text style={styles.headerSubtitle}>
                Verified flight luggage capacity
              </Text>
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

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={FlyoraColors.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by city, airport (BOM, DXB, LHR)..."
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
        </LinearGradient>
      </View>

      {/* List */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchTrips}
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            {/* Top Route */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.airportCode}>{item.originAirport}</Text>
                <Text style={styles.cityName}>{item.originCity}</Text>
              </View>

              <View style={styles.routeVector}>
                <Text style={styles.flightNumText}>{item.flightNumber || 'FLIGHT'}</Text>
                <View style={styles.flightGraphic}>
                  <View style={styles.dot} />
                  <View style={styles.line} />
                  <Ionicons name="airplane" size={16} color={FlyoraColors.teal} />
                  <View style={styles.line} />
                  <View style={styles.dot} />
                </View>
                <Text style={styles.dateText}>{item.departureDate}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.airportCode}>{item.destinationAirport}</Text>
                <Text style={styles.cityName}>{item.destinationCity}</Text>
              </View>
            </View>

            {/* Traveler info & capacity */}
            <View style={styles.cardFooter}>
              <View style={styles.travelerRow}>
                <View style={styles.avatarTiny}>
                  <Text style={styles.avatarLetter}>
                    {item.travelerName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <View style={styles.verifiedRow}>
                    <Text style={styles.travelerName}>{item.travelerName}</Text>
                    {item.travelerKycVerified && (
                      <Ionicons name="checkmark-circle" size={14} color={FlyoraColors.teal} />
                    )}
                  </View>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={styles.ratingText}>{item.trustScore || '4.9'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.pricingAction}>
                <View style={styles.pricePill}>
                  <Text style={styles.priceValue}>${item.pricePerKg}</Text>
                  <Text style={styles.priceUnit}>/kg</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => setSelectedTrip(item)}
                >
                  <Text style={styles.bookBtnText}>Book Space</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Remaining Space Bar */}
            <View style={styles.capacityBarWrap}>
              <View style={styles.capacityLabelRow}>
                <Text style={styles.capacityLabel}>Available Baggage Space</Text>
                <Text style={styles.capacityWeight}>{item.availableWeightKg} kg remaining</Text>
              </View>
              <View style={styles.capacityTrack}>
                <View
                  style={[
                    styles.capacityFill,
                    {
                      width: `${Math.min(
                        100,
                        (item.availableWeightKg / (item.totalCapacityKg || 20)) * 100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={['#0D9488', '#14B8A6']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={24} color={FlyoraColors.white} />
          <Text style={styles.fabText}>Post Trip</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Post Trip Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>List Your Flight Space</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={FlyoraColors.gray600} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalRow}>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Origin City</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Mumbai"
                  value={originCity}
                  onChangeText={setOriginCity}
                />
              </View>
              <View style={[styles.modalInputGroup, { width: 90 }]}>
                <Text style={styles.inputLabel}>Airport</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="BOM"
                  value={originAirport}
                  onChangeText={setOriginAirport}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.modalRow}>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Destination City</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Dubai"
                  value={destinationCity}
                  onChangeText={setDestinationCity}
                />
              </View>
              <View style={[styles.modalInputGroup, { width: 90 }]}>
                <Text style={styles.inputLabel}>Airport</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="DXB"
                  value={destinationAirport}
                  onChangeText={setDestinationAirport}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.modalRow}>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Departure Date</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="YYYY-MM-DD"
                  value={departureDate}
                  onChangeText={setDepartureDate}
                />
              </View>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Flight #</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="EK 505"
                  value={flightNumber}
                  onChangeText={setFlightNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.modalRow}>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Capacity (kg)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="15"
                  value={capacityKg}
                  onChangeText={setCapacityKg}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Price/kg ($)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="20"
                  value={pricePerKg}
                  onChangeText={setPricePerKg}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleCreateTrip}
              disabled={submitting}
            >
              <LinearGradient
                colors={['#0D9488', '#14B8A6']}
                style={styles.modalBtnGradient}
              >
                {submitting ? (
                  <ActivityIndicator color={FlyoraColors.white} />
                ) : (
                  <Text style={styles.modalBtnText}>Publish Flight Space</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Book Space Modal */}
      <Modal visible={Boolean(selectedTrip)} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Luggage Space</Text>
              <TouchableOpacity onPress={() => setSelectedTrip(null)}>
                <Ionicons name="close" size={24} color={FlyoraColors.gray600} />
              </TouchableOpacity>
            </View>

            {selectedTrip && (
              <View>
                <View style={styles.bookingSummaryBox}>
                  <Text style={styles.bookingRoute}>
                    {selectedTrip.originCity} ({selectedTrip.originAirport}) →{' '}
                    {selectedTrip.destinationCity} ({selectedTrip.destinationAirport})
                  </Text>
                  <Text style={styles.bookingTraveler}>
                    Traveler: {selectedTrip.travelerName} • Rate: ${selectedTrip.pricePerKg}/kg
                  </Text>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.inputLabel}>How many kilograms do you need?</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={bookingKg}
                    onChangeText={setBookingKg}
                    keyboardType="numeric"
                    placeholder="2"
                  />
                </View>

                <View style={styles.calcBox}>
                  <Text style={styles.calcLabel}>Estimated Escrow Total:</Text>
                  <Text style={styles.calcTotal}>
                    ${(Number(bookingKg) || 0) * selectedTrip.pricePerKg} USD
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleBookSpace}
                  disabled={bookingLoading}
                >
                  <LinearGradient
                    colors={['#0D9488', '#14B8A6']}
                    style={styles.modalBtnGradient}
                  >
                    {bookingLoading ? (
                      <ActivityIndicator color={FlyoraColors.white} />
                    ) : (
                      <Text style={styles.modalBtnText}>Confirm Escrow Reservation</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
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
    paddingBottom: 22,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: FlyoraColors.white,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: FlyoraColors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  tripCard: {
    backgroundColor: FlyoraColors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: FlyoraColors.borderSubtle,
  },
  airportCode: {
    fontSize: 22,
    fontWeight: '900',
    color: FlyoraColors.navy,
  },
  cityName: {
    fontSize: 12,
    color: FlyoraColors.gray500,
    marginTop: 2,
  },
  routeVector: {
    alignItems: 'center',
  },
  flightNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: FlyoraColors.gray400,
    marginBottom: 2,
  },
  flightGraphic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  line: {
    width: 24,
    height: 1.5,
    backgroundColor: FlyoraColors.borderStrong,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: FlyoraColors.teal,
  },
  dateText: {
    fontSize: 11,
    color: FlyoraColors.gray500,
    marginTop: 4,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarTiny: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: FlyoraColors.tealSubtle,
    borderWidth: 1,
    borderColor: FlyoraColors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: FlyoraColors.tealDark,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  travelerName: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.gray900,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    color: FlyoraColors.gray600,
    fontWeight: '600',
  },
  pricingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: FlyoraColors.navy,
  },
  priceUnit: {
    fontSize: 11,
    color: FlyoraColors.gray500,
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: FlyoraColors.teal,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  bookBtnText: {
    color: FlyoraColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  capacityBarWrap: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: FlyoraColors.borderSubtle,
  },
  capacityLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capacityLabel: {
    fontSize: 11,
    color: FlyoraColors.gray500,
  },
  capacityWeight: {
    fontSize: 11,
    fontWeight: '700',
    color: FlyoraColors.tealDark,
  },
  capacityTrack: {
    height: 4,
    backgroundColor: FlyoraColors.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: FlyoraColors.teal,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.tealGlow,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 6,
  },
  fabText: {
    fontSize: 14,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: FlyoraColors.surface,
    borderRadius: 24,
    padding: 20,
    ...Shadows.cardHover,
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
    color: FlyoraColors.navy,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: FlyoraColors.gray700,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: FlyoraColors.gray50,
    borderWidth: 1.2,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: FlyoraColors.gray900,
  },
  modalSubmitBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: 8,
    ...Shadows.tealGlow,
  },
  modalBtnGradient: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: FlyoraColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  bookingSummaryBox: {
    backgroundColor: FlyoraColors.gray50,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
  },
  bookingRoute: {
    fontSize: 14,
    fontWeight: '800',
    color: FlyoraColors.navy,
    marginBottom: 2,
  },
  bookingTraveler: {
    fontSize: 12,
    color: FlyoraColors.gray600,
  },
  calcBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FlyoraColors.tealSubtle,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FlyoraColors.tealLight,
  },
  calcLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: FlyoraColors.tealDark,
  },
  calcTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: FlyoraColors.tealDark,
  },
});
