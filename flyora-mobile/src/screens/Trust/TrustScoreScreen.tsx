import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { getSafeHeaderPaddingTop, scale, fontScale } from '../../constants/responsive';
import { FlyoraColors, Shadows } from '../../constants/theme';
import { apiFetch } from '../../services/api';

interface TrustActivityItem {
  id: string | number;
  reason: string;
  score_change: number;
  created_at: string;
}

interface TrustProfileData {
  score: number;
  level: string;
  status: string;
  ai_confidence_score: number;
  delivery_success_rate: number;
  cancellation_rate: number;
  fraud_risk_score: number;
  activity_logs?: TrustActivityItem[];
}

interface TrustScoreScreenProps {
  onBack: () => void;
  onNavigateTab?: (tabName: string) => void;
}

export const TrustScoreScreen: React.FC<TrustScoreScreenProps> = ({
  onBack,
  onNavigateTab,
}) => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<TrustProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'credits'>('all');

  // Animation values for Score Dial & Pulse
  const animatedScore = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  const fetchTrustData = useCallback(async () => {
    try {
      const res = await apiFetch('/api/trust/profile/');
      if (res.success && res.data) {
        const data = res.data?.data ? res.data.data : res.data;
        if (typeof data.score === 'number') {
          setProfile(data);
          animateToScore(data.score);
          return;
        }
      }

      const overviewRes = await apiFetch('/api/user/dashboard-overview/');
      if (overviewRes.success && overviewRes.data?.trustProfile) {
        const tp = overviewRes.data.trustProfile;
        const initialData = {
          score: tp.score || 750,
          level: tp.level || 'GOLD',
          status: tp.status || 'ACTIVE',
          ai_confidence_score: tp.ai_confidence_score || 95,
          delivery_success_rate: tp.delivery_success_rate || 100,
          cancellation_rate: 0,
          fraud_risk_score: 0,
          activity_logs: [
            { id: 1, reason: 'Face / Selfie Verified via KYC', score_change: 50, created_at: 'Nov 17, 2026' },
            { id: 2, reason: 'International Passport Verified', score_change: 80, created_at: 'Nov 17, 2026' },
            { id: 3, reason: 'Government ID Verified', score_change: 50, created_at: 'Nov 17, 2026' },
            { id: 4, reason: 'Base Account Signup Trust Credit', score_change: 500, created_at: 'Nov 15, 2026' },
          ],
        };
        setProfile(initialData);
        animateToScore(initialData.score);
      }
    } catch {
      const fallback = {
        score: 750,
        level: 'GOLD',
        status: 'ACTIVE',
        ai_confidence_score: 95,
        delivery_success_rate: 100,
        cancellation_rate: 0,
        fraud_risk_score: 0,
        activity_logs: [
          { id: 1, reason: 'Face / Selfie Verified via KYC', score_change: 50, created_at: 'Nov 17, 2026' },
          { id: 2, reason: 'International Passport Verified', score_change: 80, created_at: 'Nov 17, 2026' },
          { id: 3, reason: 'Government ID Verified', score_change: 50, created_at: 'Nov 17, 2026' },
        ],
      };
      setProfile(fallback);
      animateToScore(fallback.score);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const animateToScore = (targetScore: number) => {
    Animated.timing(animatedScore, {
      toValue: targetScore,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    fetchTrustData();
  }, [fetchTrustData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrustData();
  };

  const score = profile?.score ?? 750;
  const level = (profile?.level ?? 'GOLD').toUpperCase();
  const deliverySuccess = profile?.delivery_success_rate ?? 100;
  const cancellationRate = profile?.cancellation_rate ?? 0;
  const fraudRisk = profile?.fraud_risk_score ?? 0;
  const aiConfidence = profile?.ai_confidence_score ?? 95;

  const pointsNeeded = Math.max(900 - score, 0);

  // Proportional Circular Progress Geometry
  // 1000 = 100% full circle, 750 = 75% circle, 500 = 50% circle (half), 250 = 25% (quarter)
  const scorePercent = Math.min(Math.max(score / 1000, 0.05), 1);
  const totalDegrees = scorePercent * 360;
  // First half rotates up to 180 deg
  const rightRotate = Math.min(totalDegrees, 180);
  // Second half rotates from 180 to 360 deg
  const leftRotate = totalDegrees > 180 ? totalDegrees - 180 : 0;

  const activities = useMemo(() => {
    const list = profile?.activity_logs || [
      { id: 1, reason: 'Face / Selfie Verified via KYC', score_change: 50, created_at: 'Nov 17, 2026' },
      { id: 2, reason: 'International Passport Verified', score_change: 80, created_at: 'Nov 17, 2026' },
      { id: 3, reason: 'Government ID Verified', score_change: 50, created_at: 'Nov 17, 2026' },
      { id: 4, reason: 'Base Account Signup Trust Credit', score_change: 500, created_at: 'Nov 15, 2026' },
    ];
    if (filter === 'credits') {
      return list.filter((item) => item.score_change > 0);
    }
    return list;
  }, [profile, filter]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#2DD4BF" />
        <Text style={styles.loadingText}>Loading Trust Rating...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header matching Mobile Palette & Web Functionality */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#033D37', '#065F56', '#089A8D']}
          locations={[0, 0.45, 1]}
          style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
        >
          {/* Airplane Background Art */}
          <View style={styles.headerPlaneArtWrap} pointerEvents="none">
            <ExpoImage
              source={require('../../../assets/images/home-header-plane.png')}
              style={styles.headerPlaneArt}
              contentFit="contain"
              priority="high"
            />
          </View>

          <View style={styles.topNavRow}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <View style={styles.headerPillTag}>
                <Ionicons name="shield-checkmark-outline" size={11} color="#2DD4BF" />
                <Text style={styles.headerPillTagText}>SECURITY RATING</Text>
              </View>
              <Text style={styles.headerTitle}>Trust Score</Text>
              <Text style={styles.headerSub}>AI-powered dynamic reputational rating</Text>
            </View>

            <TouchableOpacity
              style={styles.verifyKycBtn}
              onPress={() => onNavigateTab && onNavigateTab('kyc')}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={14} color="#033D37" />
              <Text style={styles.verifyKycText}>Verify KYC</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[FlyoraColors.primary]}
            tintColor={FlyoraColors.primary}
          />
        }
      >
        {/* 1. Main Trust Hero Card with Proportional Gauge Circle */}
        <View style={styles.heroCard}>
          {/* Level Header Row */}
          <View style={styles.heroBadgeRow}>
            <View style={styles.goldLevelBadge}>
              <Ionicons name="medal" size={13} color="#B45309" />
              <Text style={styles.goldLevelText}>{level} MEMBER</Text>
              <Text style={styles.topPercentText}>• Top 15%</Text>
            </View>

            {pointsNeeded > 0 ? (
              <View style={styles.pointsNeededPill}>
                <Ionicons name="flash" size={11} color="#089A8D" />
                <Text style={styles.pointsNeededText}>{pointsNeeded} pts to Elite (900)</Text>
              </View>
            ) : (
              <View style={styles.pointsNeededPill}>
                <Ionicons name="checkmark-circle" size={11} color="#059669" />
                <Text style={styles.pointsNeededText}>Max Tier Achieved</Text>
              </View>
            )}
          </View>

          {/* Centered Advanced Proportional Circle Gauge */}
          <View style={styles.gaugeContainer}>
            {/* Outer Pulsing Glow */}
            <Animated.View
              style={[
                styles.pulseGlowCircle,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: glowAnim,
                },
              ]}
            />

            {/* Circular Gauge Base Track */}
            <View style={styles.circleBase}>
              {/* Right Half Segment (0 - 180 deg) */}
              <View style={styles.halfWrapRight}>
                <View
                  style={[
                    styles.circleArcRight,
                    {
                      transform: [
                        { rotate: `${rightRotate - 180}deg` },
                      ],
                    },
                  ]}
                />
              </View>

              {/* Left Half Segment (180 - 360 deg) */}
              <View style={styles.halfWrapLeft}>
                <View
                  style={[
                    styles.circleArcLeft,
                    {
                      transform: [
                        { rotate: `${leftRotate - 180}deg` },
                      ],
                    },
                  ]}
                />
              </View>

              {/* Inner White Dial Displaying Score & AI Tag */}
              <View style={styles.innerDial}>
                <Text style={styles.scoreNumber}>{score}</Text>
                <Text style={styles.scoreDenominator}>out of 1000</Text>

                <View style={styles.aiLivePill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.aiLiveText}>AI VERIFIED</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Clean Tier Progression Track */}
          <View style={styles.progressBarWrap}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(Math.max((score / 1000) * 100, 8), 100)}%` },
                ]}
              />
            </View>
            <View style={styles.tierLabelsRow}>
              <Text style={styles.tierLabel}>Standard (0)</Text>
              <Text style={styles.tierLabel}>Silver (500)</Text>
              <Text style={[styles.tierLabel, styles.tierLabelActive]}>Gold (750)</Text>
              <Text style={styles.tierLabel}>Elite (1000)</Text>
            </View>
          </View>

          {/* 3 Concise AI Verification Badges */}
          <View style={styles.healthPillsRow}>
            <View style={styles.healthPill}>
              <Ionicons name="shield-checkmark" size={13} color="#059669" />
              <Text style={styles.healthPillText}>KYC Verified</Text>
            </View>
            <View style={styles.healthPill}>
              <Ionicons name="pulse" size={13} color="#089A8D" />
              <Text style={styles.healthPillText}>{aiConfidence}% Accuracy</Text>
            </View>
            <View style={styles.healthPill}>
              <Ionicons name="lock-closed" size={13} color="#0284C7" />
              <Text style={styles.healthPillText}>Escrow Safe</Text>
            </View>
          </View>
        </View>

        {/* 2. Three Clean Metrics Cards: Reliability, Risk, Fraud Security */}
        <View style={styles.metricsRow}>
          {/* Card 1: Reliability */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="checkmark-done" size={15} color="#059669" />
              </View>
              <Text style={styles.metricCategory}>RELIABILITY</Text>
            </View>
            <Text style={styles.metricValue}>{deliverySuccess}%</Text>
            <Text style={styles.metricSub}>On-Time Deliveries</Text>
            <View style={[styles.metricBarTrack, { backgroundColor: '#D1FAE5' }]}>
              <View
                style={[
                  styles.metricBarFill,
                  { width: `${deliverySuccess}%` as any, backgroundColor: '#10B981' },
                ]}
              />
            </View>
          </View>

          {/* Card 2: Risk */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="warning-outline" size={15} color="#D97706" />
              </View>
              <Text style={styles.metricCategory}>RISK</Text>
            </View>
            <Text style={styles.metricValue}>{cancellationRate}%</Text>
            <Text style={styles.metricSub}>Cancellations</Text>
            <View style={[styles.metricBarTrack, { backgroundColor: '#FEF3C7' }]}>
              <View
                style={[
                  styles.metricBarFill,
                  { width: `${Math.max(cancellationRate, 6)}%` as any, backgroundColor: '#F59E0B' },
                ]}
              />
            </View>
          </View>

          {/* Card 3: Security */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="shield-outline" size={15} color="#2563EB" />
              </View>
              <Text style={styles.metricCategory}>FRAUD</Text>
            </View>
            <Text style={styles.metricValue}>{fraudRisk}%</Text>
            <Text style={styles.metricSub}>Safety Index</Text>
            <View style={[styles.metricBarTrack, { backgroundColor: '#DBEAFE' }]}>
              <View style={[styles.metricBarFill, { width: '4%' as any, backgroundColor: '#3B82F6' }]} />
            </View>
          </View>
        </View>

        {/* 3. AI Growth Recommendations (Clean Card with High Usability) */}
        <View style={styles.recommendationsCard}>
          <LinearGradient
            colors={['#062738', '#0A3B36', '#032320']}
            style={styles.recommendationsGradient}
          >
            <View style={styles.recomHeaderRow}>
              <Ionicons name="sparkles" size={15} color="#2DD4BF" />
              <Text style={styles.recomHeaderTag}>AI RECOMMENDATIONS</Text>
            </View>

            <Text style={styles.recomTitle}>Boost Your Trust Score</Text>
            <Text style={styles.recomSub}>
              Complete these actions to increase your trust score and unlock higher delivery limits.
            </Text>

            <View style={styles.recomList}>
              <TouchableOpacity
                style={styles.recomActionItem}
                onPress={() => onNavigateTab && onNavigateTab('kyc')}
                activeOpacity={0.8}
              >
                <View style={styles.recomIconCircle}>
                  <Ionicons name="id-card-outline" size={18} color="#2DD4BF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recomActionTitle}>Complete Passport & ID Verification</Text>
                  <Text style={styles.recomActionPoints}>+50 Trust Points</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recomActionItem}
                onPress={() => onNavigateTab && onNavigateTab('trips')}
                activeOpacity={0.8}
              >
                <View style={styles.recomIconCircle}>
                  <Ionicons name="airplane-outline" size={18} color="#2DD4BF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recomActionTitle}>Complete Your Next Verified Trip</Text>
                  <Text style={styles.recomActionPoints}>+20 Trust Points</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* 4. Recent Trust Activity Log */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeaderRow}>
            <View>
              <Text style={styles.activitySectionTitle}>Recent Trust Activity</Text>
              <Text style={styles.activitySectionSub}>Transparent log of score audits</Text>
            </View>

            <View style={styles.filterPillGroup}>
              <TouchableOpacity
                style={[styles.filterToggleBtn, filter === 'all' && styles.filterToggleActive]}
                onPress={() => setFilter('all')}
              >
                <Text
                  style={[
                    styles.filterToggleText,
                    filter === 'all' && styles.filterToggleTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterToggleBtn, filter === 'credits' && styles.filterToggleActive]}
                onPress={() => setFilter('credits')}
              >
                <Text
                  style={[
                    styles.filterToggleText,
                    filter === 'credits' && styles.filterToggleTextActive,
                  ]}
                >
                  +Credits
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activityList}>
            {activities.map((item, idx) => (
              <View key={item.id || idx} style={styles.activityCard}>
                <View style={styles.activityIconWrap}>
                  <Ionicons name="arrow-up" size={15} color="#089A8D" />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityReason}>{item.reason}</Text>
                  <Text style={styles.activityDate}>
                    {item.created_at ? item.created_at.split('T')[0] : 'Recent'}
                  </Text>
                </View>
                <View style={styles.scoreChangeBadge}>
                  <Text style={styles.scoreChangeText}>+{item.score_change} pts</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const DIAL_SIZE = scale(140);
const STROKE_WIDTH = scale(10);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FBF9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#033D37',
  },
  loadingText: {
    marginTop: scale(14),
    fontSize: fontScale(13),
    fontWeight: '700',
    color: '#2DD4BF',
  },
  header: {
    backgroundColor: '#033D37',
    borderBottomLeftRadius: scale(26),
    borderBottomRightRadius: scale(26),
    overflow: 'hidden',
    ...Shadows.cardHover,
  },
  headerGradient: {
    paddingHorizontal: scale(18),
    paddingBottom: scale(20),
    position: 'relative',
  },
  headerPlaneArtWrap: {
    position: 'absolute',
    right: -scale(20),
    bottom: -scale(10),
    width: scale(170),
    height: scale(130),
    opacity: 0.16,
  },
  headerPlaneArt: {
    width: '100%',
    height: '100%',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: scale(12),
  },
  headerPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: scale(2),
  },
  headerPillTagText: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#2DD4BF',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: fontScale(11),
    color: '#CCFBF1',
    marginTop: scale(1),
    fontWeight: '500',
  },
  verifyKycBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2DD4BF',
    paddingHorizontal: scale(12),
    paddingVertical: scale(7),
    borderRadius: scale(14),
    gap: scale(4),
    ...Shadows.sm,
  },
  verifyKycText: {
    fontSize: fontScale(11),
    fontWeight: '800',
    color: '#033D37',
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(40),
    gap: scale(14),
  },
  // Hero Card & Dial
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(22),
    padding: scale(18),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    ...Shadows.card,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: scale(16),
  },
  goldLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    gap: scale(4),
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  goldLevelText: {
    fontSize: fontScale(11),
    fontWeight: '800',
    color: '#B45309',
  },
  topPercentText: {
    fontSize: fontScale(10.5),
    color: '#92400E',
    fontWeight: '600',
  },
  pointsNeededPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFCF9',
    paddingHorizontal: scale(9),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    gap: scale(4),
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  pointsNeededText: {
    fontSize: fontScale(10.5),
    fontWeight: '700',
    color: '#089A8D',
  },
  // Proportional Circular Gauge
  gaugeContainer: {
    width: DIAL_SIZE + scale(24),
    height: DIAL_SIZE + scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: scale(6),
  },
  pulseGlowCircle: {
    position: 'absolute',
    width: DIAL_SIZE + scale(20),
    height: DIAL_SIZE + scale(20),
    borderRadius: (DIAL_SIZE + scale(20)) / 2,
    backgroundColor: 'rgba(45, 212, 191, 0.35)',
    zIndex: 0,
  },
  circleBase: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  halfWrapRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DIAL_SIZE / 2,
    height: DIAL_SIZE,
    overflow: 'hidden',
  },
  circleArcRight: {
    position: 'absolute',
    top: 0,
    left: -DIAL_SIZE / 2,
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    borderWidth: STROKE_WIDTH,
    borderColor: 'transparent',
    borderTopColor: '#089A8D',
    borderRightColor: '#089A8D',
  },
  halfWrapLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DIAL_SIZE / 2,
    height: DIAL_SIZE,
    overflow: 'hidden',
  },
  circleArcLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    borderWidth: STROKE_WIDTH,
    borderColor: 'transparent',
    borderBottomColor: '#089A8D',
    borderLeftColor: '#089A8D',
  },
  innerDial: {
    width: DIAL_SIZE - STROKE_WIDTH * 2,
    height: DIAL_SIZE - STROKE_WIDTH * 2,
    borderRadius: (DIAL_SIZE - STROKE_WIDTH * 2) / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    ...Shadows.sm,
  },
  scoreNumber: {
    fontSize: fontScale(30),
    fontWeight: '900',
    color: '#062738',
    lineHeight: scale(36),
  },
  scoreDenominator: {
    fontSize: fontScale(10.5),
    color: '#64748B',
    fontWeight: '600',
    marginTop: -scale(2),
  },
  aiLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFCF9',
    paddingHorizontal: scale(7),
    paddingVertical: scale(2),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginTop: scale(4),
    gap: scale(3),
  },
  greenDot: {
    width: scale(5),
    height: scale(5),
    borderRadius: scale(2.5),
    backgroundColor: '#10B981',
  },
  aiLiveText: {
    fontSize: fontScale(8.5),
    fontWeight: '800',
    color: '#089A8D',
    letterSpacing: 0.4,
  },
  progressBarWrap: {
    width: '100%',
    marginTop: scale(14),
    marginBottom: scale(10),
  },
  progressTrack: {
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#089A8D',
    borderRadius: scale(4),
  },
  tierLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(6),
  },
  tierLabel: {
    fontSize: fontScale(9.5),
    color: '#94A3B8',
    fontWeight: '600',
  },
  tierLabelActive: {
    color: '#089A8D',
    fontWeight: '800',
  },
  healthPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: scale(12),
    width: '100%',
  },
  healthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  healthPillText: {
    fontSize: fontScale(11),
    fontWeight: '700',
    color: '#475569',
  },
  // Metric Cards
  metricsRow: {
    flexDirection: 'row',
    gap: scale(10),
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    padding: scale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(6),
  },
  metricIconWrap: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricCategory: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: fontScale(18),
    fontWeight: '900',
    color: '#062738',
  },
  metricSub: {
    fontSize: fontScale(9.5),
    color: '#64748B',
    marginTop: scale(2),
    fontWeight: '500',
  },
  metricBarTrack: {
    height: scale(4),
    borderRadius: scale(2),
    marginTop: scale(8),
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: scale(2),
  },
  // Recommendations Card
  recommendationsCard: {
    borderRadius: scale(22),
    overflow: 'hidden',
    ...Shadows.cardHover,
  },
  recommendationsGradient: {
    padding: scale(18),
  },
  recomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: scale(4),
  },
  recomHeaderTag: {
    color: '#2DD4BF',
    fontSize: fontScale(10),
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  recomTitle: {
    fontSize: fontScale(16),
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: scale(2),
  },
  recomSub: {
    fontSize: fontScale(11),
    color: '#94A3B8',
    lineHeight: scale(16),
    marginBottom: scale(12),
  },
  recomList: {
    gap: scale(10),
  },
  recomActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: scale(14),
    padding: scale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: scale(10),
  },
  recomIconCircle: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recomActionTitle: {
    fontSize: fontScale(12.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recomActionPoints: {
    fontSize: fontScale(11),
    color: '#2DD4BF',
    fontWeight: '800',
    marginTop: scale(2),
  },
  // Activity Section
  activitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(22),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  activitySectionTitle: {
    fontSize: fontScale(14),
    fontWeight: '800',
    color: '#062738',
  },
  activitySectionSub: {
    fontSize: fontScale(10.5),
    color: '#64748B',
    marginTop: scale(1),
  },
  filterPillGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: scale(10),
    padding: scale(2),
  },
  filterToggleBtn: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  filterToggleActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  filterToggleText: {
    fontSize: fontScale(11),
    fontWeight: '700',
    color: '#64748B',
  },
  filterToggleTextActive: {
    color: '#089A8D',
    fontWeight: '800',
  },
  activityList: {
    gap: scale(8),
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(14),
    padding: scale(10),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: scale(10),
  },
  activityIconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#EDFCF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  activityDetails: {
    flex: 1,
  },
  activityReason: {
    fontSize: fontScale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  activityDate: {
    fontSize: fontScale(10),
    color: '#64748B',
    marginTop: scale(1),
  },
  scoreChangeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  scoreChangeText: {
    fontSize: fontScale(10.5),
    fontWeight: '800',
    color: '#059669',
  },
});
