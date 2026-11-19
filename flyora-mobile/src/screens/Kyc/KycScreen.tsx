import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const KycScreen: React.FC = () => {
  const { kycStatus, updateKycStatus, user } = useAuth();
  const [docType, setDocType] = useState<'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID'>('PASSPORT');
  const [docNumber, setDocNumber] = useState('');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [country, setCountry] = useState('India');
  const [submitting, setSubmitting] = useState(false);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);

  const handleSubmitKyc = async () => {
    if (!docNumber.trim() || !fullName.trim()) {
      Alert.alert('Incomplete Form', 'Please enter your full legal name and document number.');
      return;
    }

    setSubmitting(true);
    setTimeout(async () => {
      setSubmitting(false);
      await updateKycStatus('APPROVED');
      Alert.alert(
        'Identity Verified',
        'Congratulations! Your KYC documents have been reviewed and approved. You now have the FlyoraGo Verified Traveler & Sender Trust Badge!'
      );
    }, 1500);
  };

  const handleInstantToggle = async () => {
    const next = kycStatus === 'APPROVED' ? 'NOT_SUBMITTED' : 'APPROVED';
    await updateKycStatus(next);
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
              <Text style={styles.subtitle}>Trust & Compliance</Text>
              <Text style={styles.title}>Identity Verification</Text>
            </View>
            <TouchableOpacity
              style={styles.sandboxToggle}
              onPress={handleInstantToggle}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={14} color="#FBBF24" />
              <Text style={styles.sandboxText}>Quick Demo Toggle</Text>
            </TouchableOpacity>
          </View>

          {/* Current Status Card */}
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusIconCircle,
                kycStatus === 'APPROVED' ? styles.bgApproved : styles.bgPending,
              ]}
            >
              <Ionicons
                name={kycStatus === 'APPROVED' ? 'shield-checkmark' : 'time-outline'}
                size={24}
                color={kycStatus === 'APPROVED' ? '#14B8A6' : '#F59E0B'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusState}>
                {kycStatus === 'APPROVED' ? 'KYC Approved & Verified' : 'KYC Verification Required'}
              </Text>
              <Text style={styles.statusDescription}>
                {kycStatus === 'APPROVED'
                  ? 'Your identity is fully verified. You can monetize luggage and ship packages without limits.'
                  : 'Submit a valid passport or government ID to unlock luggage sharing and instant escrow payouts.'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {kycStatus === 'APPROVED' ? (
          <View style={styles.verifiedBox}>
            <Ionicons name="checkmark-done-circle" size={54} color={FlyoraColors.teal} />
            <Text style={styles.verifiedHeading}>You are 100% Verified</Text>
            <Text style={styles.verifiedParagraph}>
              Your official credentials are tied to trust score 4.95. Travelers and senders on
              FlyoraGo prioritize verified members for guaranteed safety and fast transactions.
            </Text>

            <View style={styles.badgeFeaturesGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="airplane" size={18} color={FlyoraColors.tealDark} />
                <Text style={styles.featureText}>Unlimited Flight Luggage Listings</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={18} color={FlyoraColors.tealDark} />
                <Text style={styles.featureText}>Full Escrow Vault Insurance Coverage</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="flash" size={18} color={FlyoraColors.tealDark} />
                <Text style={styles.featureText}>Instant Payout Releases on OTP</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.reVerifyBtn}
              onPress={() => updateKycStatus('NOT_SUBMITTED')}
            >
              <Text style={styles.reVerifyText}>Re-submit / Update Documents</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Document Submission</Text>

            {/* Document Type Picker */}
            <Text style={styles.label}>Select Document Type</Text>
            <View style={styles.docTypeRow}>
              {[
                { key: 'PASSPORT', label: 'Passport', icon: 'airplane-outline' },
                { key: 'DRIVING_LICENSE', label: 'Driving License', icon: 'car-outline' },
                { key: 'NATIONAL_ID', label: 'National ID', icon: 'card-outline' },
              ].map((doc) => {
                const isSelected = docType === doc.key;
                return (
                  <TouchableOpacity
                    key={doc.key}
                    style={[styles.docTypeBtn, isSelected && styles.docTypeBtnActive]}
                    onPress={() => setDocType(doc.key as any)}
                  >
                    <Ionicons
                      name={doc.icon as any}
                      size={18}
                      color={isSelected ? FlyoraColors.tealDark : FlyoraColors.gray600}
                    />
                    <Text
                      style={[styles.docTypeText, isSelected && styles.docTypeTextActive]}
                    >
                      {doc.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Full Legal Name (as on ID) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Vedant Panchal"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Document / Passport Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Z5948291"
              autoCapitalize="characters"
              value={docNumber}
              onChangeText={setDocNumber}
            />

            <Text style={styles.label}>Country of Issuance</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
            />

            {/* Upload Buttons */}
            <Text style={styles.label}>Document Upload & Biometric Check</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity
                style={[styles.uploadBox, frontUploaded && styles.uploadBoxDone]}
                onPress={() => setFrontUploaded(!frontUploaded)}
              >
                <Ionicons
                  name={frontUploaded ? 'checkmark-circle' : 'camera-outline'}
                  size={24}
                  color={frontUploaded ? FlyoraColors.teal : FlyoraColors.gray600}
                />
                <Text style={styles.uploadText}>
                  {frontUploaded ? 'Front ID Attached' : 'Upload Front of ID'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, selfieTaken && styles.uploadBoxDone]}
                onPress={() => setSelfieTaken(!selfieTaken)}
              >
                <Ionicons
                  name={selfieTaken ? 'checkmark-circle' : 'person-circle-outline'}
                  size={24}
                  color={selfieTaken ? FlyoraColors.teal : FlyoraColors.gray600}
                />
                <Text style={styles.uploadText}>
                  {selfieTaken ? 'Selfie Verified' : 'Live Selfie Check'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmitKyc}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={FlyoraColors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Submit ID for Verification</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  sandboxToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  sandboxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 14,
  },
  statusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgApproved: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
  },
  bgPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusState: {
    fontSize: 15,
    fontWeight: '800',
    color: FlyoraColors.white,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  verifiedBox: {
    alignItems: 'center',
    backgroundColor: FlyoraColors.surface,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    ...Shadows.card,
  },
  verifiedHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: FlyoraColors.gray900,
    marginTop: 12,
    marginBottom: 8,
  },
  verifiedParagraph: {
    fontSize: 13,
    color: FlyoraColors.gray600,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  badgeFeaturesGrid: {
    width: '100%',
    backgroundColor: FlyoraColors.tealSubtle,
    borderRadius: BorderRadius.md,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: FlyoraColors.tealLight,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: FlyoraColors.tealDark,
  },
  reVerifyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  reVerifyText: {
    fontSize: 13,
    fontWeight: '600',
    color: FlyoraColors.gray600,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: FlyoraColors.gray900,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: FlyoraColors.gray700,
    marginBottom: 6,
    marginTop: 10,
  },
  docTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  docTypeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlyoraColors.gray100,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    gap: 4,
  },
  docTypeBtnActive: {
    backgroundColor: FlyoraColors.tealSubtle,
    borderColor: FlyoraColors.teal,
  },
  docTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: FlyoraColors.gray700,
  },
  docTypeTextActive: {
    color: FlyoraColors.tealDark,
    fontWeight: '700',
  },
  input: {
    backgroundColor: FlyoraColors.surface,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: FlyoraColors.gray900,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  uploadBox: {
    flex: 1,
    backgroundColor: FlyoraColors.surface,
    borderWidth: 1.5,
    borderColor: FlyoraColors.borderStrong,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadBoxDone: {
    borderColor: FlyoraColors.teal,
    backgroundColor: FlyoraColors.tealSubtle,
    borderStyle: 'solid',
  },
  uploadText: {
    fontSize: 11,
    fontWeight: '600',
    color: FlyoraColors.gray700,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: FlyoraColors.teal,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: FlyoraColors.white,
  },
});
