import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop, scale, fontScale } from '../../constants/responsive';
import { FlyoraColors, Shadows } from '../../constants/theme';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AppAlert as Alert } from '../../components/AppAlertModal';

export interface ChatMessageItem {
  id: string | number;
  conversation?: number;
  sender?: number;
  sender_email?: string;
  sender_name?: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export interface ChatConversationItem {
  id: number;
  other_participant?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
  last_message?: {
    text: string;
    timestamp: string;
    is_seen?: boolean;
    sender_id?: number;
  };
  unread_count?: number;
  booking_info?: {
    id: number;
    package_name: string;
    status: string;
    reward: string;
    route?: string;
  };
  can_chat?: boolean;
  booking_status?: string;
  package_name?: string;
}

interface ChatScreenProps {
  onBack?: () => void;
  targetUserId?: number;
  targetUserName?: string;
  targetBookingId?: number;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack,
  targetUserId,
  targetUserName,
  targetBookingId,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ChatConversationItem[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canChatInActive, setCanChatInActive] = useState<boolean>(true);
  const [activeBookingNotice, setActiveBookingNotice] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<any>(null);
  const initialTargetHandledRef = useRef<boolean>(false);

  // 1. Fetch conversations from backend
  const fetchConversations = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await apiFetch('/api/chat/conversations');
      if (res?.success && Array.isArray(res?.data)) {
        setConversations(res.data);

        // Auto-open target user conversation ONLY on initial mount if targetUserId was supplied
        if (targetUserId && !initialTargetHandledRef.current) {
          initialTargetHandledRef.current = true;
          const match = res.data.find(
            (c: any) => c.other_participant?.id === targetUserId
          );
          if (match) {
            setActiveConv(match);
            loadMessages(match.id);
          } else {
            createConversationWithUser(targetUserId, targetUserName);
          }
        }
      }
    } catch (e) {
      console.log('Error fetching conversations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetUserId, targetUserName]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Create conversation with verified booking partner
  const createConversationWithUser = async (userId: number, name?: string) => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ participant_id: userId }),
      });
      if (res?.success && res?.data) {
        setActiveConv(res.data);
        loadMessages(res.data.id);
        fetchConversations(true);
      } else {
        Alert.alert(
          'Chat Restricted',
          res?.message || 'Messaging is only available for accepted, active deliveries and is closed once delivery is completed.'
        );
      }
    } catch (err: any) {
      Alert.alert('Chat Error', err.message || 'Could not initiate chat.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch messages for active conversation
  const loadMessages = async (convId: number, isSilent = false) => {
    try {
      const res = await apiFetch(`/api/chat/conversations/${convId}/messages`);
      if (res?.success && res?.data) {
        const rawMsgs = res.data.messages || (Array.isArray(res.data) ? res.data : []);
        const formatted: ChatMessageItem[] = rawMsgs.map((m: any) => ({
          id: m.id,
          conversation: m.conversation,
          sender: m.sender,
          sender_email: m.sender_email,
          sender_name: m.sender_name,
          text: m.text,
          timestamp: m.timestamp || 'Just now',
          isSelf: m.sender === user?.id || m.sender_email === user?.email,
        }));

        setMessages((prev) => {
          if (
            prev.length === formatted.length &&
            prev.length > 0 &&
            prev[prev.length - 1]?.id === formatted[formatted.length - 1]?.id &&
            prev[prev.length - 1]?.text === formatted[formatted.length - 1]?.text
          ) {
            return prev;
          }
          return formatted;
        });

        // Respect backend delivery completion lock
        if (res.data.can_chat !== undefined) {
          setCanChatInActive(res.data.can_chat);
          if (!res.data.can_chat) {
            setActiveBookingNotice('Delivery Confirmed. Messaging is strictly closed.');
          } else if (res.data.booking_info) {
            setActiveBookingNotice(
              `Active Trip: ${res.data.booking_info.package_name || 'Parcel'} • Status: ${res.data.booking_info.status}`
            );
          }
        }
      }
    } catch (e) {
      console.log('Error loading messages:', e);
    }
  };

  // Invert messages order for WhatsApp/Meta style bottom-anchored rendering:
  const reversedMessages = useMemo(() => {
    return [...messages].reverse();
  }, [messages]);

  // Polling for live updates when inside active chat (every 3 seconds)
  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);

      pollingRef.current = setInterval(() => {
        loadMessages(activeConv.id, true);
      }, 3000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConv]);

  const handleSelectConversation = (conv: ChatConversationItem) => {
    setActiveConv(conv);
    setMessages([]);
    loadMessages(conv.id);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || !activeConv) return;

    if (!canChatInActive) {
      Alert.alert(
        'Chat Closed',
        'Delivery has already been confirmed. You cannot send further messages for this booking.'
      );
      return;
    }

    const optimisticMsg: ChatMessageItem = {
      id: `temp-${Date.now()}`,
      text: textToSend.trim(),
      timestamp: 'Just now',
      isSelf: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    if (!customText) setInputText('');

    try {
      const res = await apiFetch(`/api/chat/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: textToSend.trim() }),
      });

      if (res?.success) {
        loadMessages(activeConv.id, true);
        fetchConversations(true);
      } else {
        Alert.alert(
          'Message Not Sent',
          res?.message || 'Traveler must accept the request before chatting, and chat closes after delivery is confirmed.'
        );
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to deliver message.');
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  // Filter conversations by search term
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => {
      const name = c.other_participant?.name?.toLowerCase() || '';
      const email = c.other_participant?.email?.toLowerCase() || '';
      const lastMsg = c.last_message?.text?.toLowerCase() || '';
      const pkg = c.package_name?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || lastMsg.includes(q) || pkg.includes(q);
    });
  }, [conversations, searchQuery]);

  // ─────────────────────────────────────────────────────────────
  // RENDER 1: ACTIVE CHAT SCREEN (Meta / WhatsApp MNC Standard)
  // ─────────────────────────────────────────────────────────────
  if (activeConv) {
    const partnerName = activeConv.other_participant?.name || 'Coordination Partner';
    const partnerRole = activeConv.other_participant?.role || 'Traveler';

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <StatusBar style="light" />

        {/* Top Header - WhatsApp / Meta Style */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#033D37', '#065F56', '#089A8D']}
            locations={[0, 0.45, 1]}
            style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
          >
            <View style={styles.topNavRow}>
              {/* Back button returns to Conversations list */}
              <TouchableOpacity
                onPress={() => {
                  setActiveConv(null);
                  fetchConversations(true);
                }}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Partner Avatar + Info Header */}
              <TouchableOpacity
                style={styles.headerPartnerWrap}
                activeOpacity={0.9}
                onPress={() => {}}
              >
                <View style={styles.headerAvatarCircle}>
                  <Text style={styles.headerAvatarText}>
                    {partnerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerPartnerName} numberOfLines={1}>
                    {partnerName}
                  </Text>
                  <View style={styles.headerSubRow}>
                    <View
                      style={[
                        styles.miniLiveDot,
                        !canChatInActive && { backgroundColor: '#EF4444' },
                      ]}
                    />
                    <Text style={styles.headerPartnerSub} numberOfLines={1}>
                      {canChatInActive
                        ? partnerRole === 'traveler' ? 'Verified Traveler ✈️' : 'Verified Package Sender 📦'
                        : 'Trip Completed • Chat Locked'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Lock or Escrow Safe Badge */}
              <View
                style={[
                  styles.activeDotBadge,
                  !canChatInActive && styles.activeDotBadgeLocked,
                ]}
              >
                <Ionicons
                  name={canChatInActive ? 'shield-checkmark' : 'lock-closed'}
                  size={12}
                  color={canChatInActive ? '#2DD4BF' : '#FCA5A5'}
                />
                <Text
                  style={[
                    styles.activeDotText,
                    !canChatInActive && { color: '#FCA5A5' },
                  ]}
                >
                  {canChatInActive ? 'Escrow Safe' : 'Chat Locked'}
                </Text>
              </View>
            </View>

            {/* In-chat dynamic status notice */}
            {activeBookingNotice && (
              <View
                style={[
                  styles.activeBookingNoticeBar,
                  !canChatInActive && styles.activeBookingNoticeClosed,
                ]}
              >
                <Ionicons
                  name={canChatInActive ? 'shield-checkmark' : 'lock-closed'}
                  size={12}
                  color={canChatInActive ? '#2DD4BF' : '#FCA5A5'}
                />
                <Text
                  style={[
                    styles.activeBookingNoticeText,
                    !canChatInActive && styles.activeBookingNoticeTextClosed,
                  ]}
                  numberOfLines={1}
                >
                  {activeBookingNotice}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Message Thread - INVERTED FLATLIST (Meta/WhatsApp Standard) */}
        {messages.length === 0 ? (
          <View style={styles.emptyChatBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="chatbubbles" size={32} color="#089A8D" />
            </View>
            <Text style={styles.emptyChatTitle}>Encrypted Trip Coordination</Text>
            <Text style={styles.emptyChatText}>
              Send a message to coordinate luggage space, handover location, and flight times. Chat closes automatically once delivery OTP/QR is verified.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={reversedMessages}
            inverted
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isMe = item.isSelf;
              return (
                <View
                  style={[
                    styles.messageRow,
                    isMe ? styles.messageRowSelf : styles.messageRowPartner,
                  ]}
                >
                  {!isMe && (
                    <View style={styles.partnerMiniAvatar}>
                      <Text style={styles.partnerMiniAvatarText}>
                        {partnerName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.messageBubbleSelf : styles.messageBubblePartner,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMe ? styles.messageTextSelf : styles.messageTextPartner,
                      ]}
                    >
                      {item.text}
                    </Text>
                    <View style={styles.bubbleFooterRow}>
                      <Text
                        style={[
                          styles.messageTimestamp,
                          isMe ? styles.messageTimestampSelf : styles.messageTimestampPartner,
                        ]}
                      >
                        {item.timestamp}
                      </Text>
                      {isMe && (
                        <Ionicons
                          name="checkmark-done"
                          size={13}
                          color="#A7F3D0"
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Quick Suggestion Chips */}
        {canChatInActive && (
          <View style={styles.quickChipsRow}>
            {['I have reached the airport ✈️', 'Handover confirmed 👍', 'Where are you meet point? 📍'].map(
              (chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.chipBtn}
                  onPress={() => handleSendMessage(chip)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* Input Bar or Closed Chat Banner */}
        {canChatInActive ? (
          <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TextInput
              style={styles.textInput}
              placeholder="Type message to traveler/sender..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim()}
              activeOpacity={0.85}
            >
              <Ionicons name="send" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.closedChatBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <View style={styles.closedIconBox}>
              <Ionicons name="lock-closed" size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.closedChatBarTitle}>Delivery Confirmed • Chat Locked</Text>
              <Text style={styles.closedChatBarSub}>
                Package has been verified & payment released. Messaging is securely closed.
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER 2: ADVANCED CONVERSATIONS LIST SCREEN (Top MNC Quality)
  // ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Screen Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#033D37', '#065F56', '#089A8D']}
          locations={[0, 0.45, 1]}
          style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
        >
          {/* Airplane Watermark Background Art */}
          <View style={styles.headerPlaneArtWrap} pointerEvents="none">
            <ExpoImage
              source={require('../../../assets/images/home-header-plane.png')}
              style={styles.headerPlaneArt}
              contentFit="contain"
              priority="high"
            />
          </View>

          <View style={styles.topNavRowMessages}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            <View style={styles.headerTitleColumn}>
              <View style={styles.headerRolePill}>
                <Ionicons name="shield-checkmark" size={11} color="#2DD4BF" />
                <Text style={styles.headerRoleText}>ESCROW COORDINATION</Text>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Messages
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                Real-time chats for accepted & active deliveries
              </Text>
            </View>

            {/* Total active count */}
            <View style={styles.headerCountBadge}>
              <Text style={styles.headerCountText}>{conversations.length} Chats</Text>
            </View>
          </View>

          {/* Search Bar inside Header */}
          <View style={styles.searchBarWrap}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations, travelers or parcels..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Summary Trust Banner */}
      <View style={styles.trustInfoBanner}>
        <Ionicons name="shield-checkmark" size={15} color="#089A8D" />
        <Text style={styles.trustInfoText}>
          Chats unlock when request is accepted and automatically lock upon verified delivery.
        </Text>
      </View>

      {/* Content List */}
      {loading && conversations.length === 0 ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#089A8D" />
          <Text style={styles.loadingSmallText}>Loading active chats...</Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchConversations(true)}
              colors={[FlyoraColors.primary]}
            />
          }
        >
          <View style={styles.emptyIconCircleLarge}>
            <Ionicons name="chatbubbles-outline" size={40} color="#089A8D" />
          </View>
          <Text style={styles.emptyMainTitle}>
            {searchQuery ? 'No matching conversations' : 'No Active Chats Yet'}
          </Text>
          <Text style={styles.emptyMainSub}>
            {searchQuery
              ? 'Try searching with a different partner name or package keyword.'
              : 'Direct messaging is activated as soon as a traveler accepts your package request, or when you accept an incoming shipment request.'}
          </Text>
          <View style={styles.ruleBadge}>
            <Ionicons name="lock-closed-outline" size={14} color="#065F46" />
            <Text style={styles.ruleBadgeText}>
              Rule: Accepted to In-Transit Only • Closed After Delivery
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchConversations(true)}
              colors={[FlyoraColors.primary]}
            />
          }
          renderItem={({ item }) => {
            const partnerName = item.other_participant?.name || 'Coordination Partner';
            const partnerRole = item.other_participant?.role || 'Traveler';
            const lastText = item.last_message?.text || 'No messages yet';
            const time = item.last_message?.timestamp || '';
            const unread = item.unread_count || 0;
            const isChatLocked = item.can_chat === false;
            const statusLabel = item.booking_status || (isChatLocked ? 'DELIVERED' : 'ACTIVE');

            return (
              <TouchableOpacity
                style={[
                  styles.convCard,
                  isChatLocked && styles.convCardLocked,
                ]}
                onPress={() => handleSelectConversation(item)}
                activeOpacity={0.85}
              >
                {/* Avatar with Status Ring */}
                <View style={styles.avatarWrap}>
                  <View
                    style={[
                      styles.convAvatarCircle,
                      isChatLocked && styles.convAvatarCircleLocked,
                    ]}
                  >
                    <Text style={styles.convAvatarText}>
                      {partnerName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  {isChatLocked ? (
                    <View style={styles.avatarLockDot}>
                      <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.avatarOnlineDot} />
                  )}
                </View>

                {/* Center Content */}
                <View style={{ flex: 1 }}>
                  <View style={styles.convRowTop}>
                    <Text style={styles.convPartnerName} numberOfLines={1}>
                      {partnerName}
                    </Text>
                    <Text style={styles.convTime}>{time}</Text>
                  </View>

                  {/* Subline: Package name & Role */}
                  <View style={styles.convMetaRow}>
                    <Text style={styles.convMetaRole}>
                      {partnerRole === 'traveler' ? '✈️ Traveler' : '📦 Sender'}
                    </Text>
                    {item.package_name && (
                      <Text style={styles.convMetaPackage} numberOfLines={1}>
                        • {item.package_name}
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.convLastMessage,
                      unread > 0 && styles.convLastMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {lastText}
                  </Text>
                </View>

                {/* Right Badge: Lock Badge OR Unread / Chevron */}
                <View style={styles.convRightCol}>
                  {isChatLocked ? (
                    <View style={styles.lockedPillBadge}>
                      <Ionicons name="lock-closed" size={11} color="#DC2626" />
                      <Text style={styles.lockedPillText}>Chat Locked</Text>
                    </View>
                  ) : unread > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{unread}</Text>
                    </View>
                  ) : (
                    <View style={styles.activePillBadge}>
                      <View style={styles.miniActiveGreen} />
                      <Text style={styles.activePillText}>{statusLabel}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(10),
  },
  loadingSmallText: {
    fontSize: fontScale(12.5),
    fontWeight: '700',
    color: '#089A8D',
  },
  // Top Emerald Header
  header: {
    overflow: 'hidden',
    backgroundColor: '#033D37',
    ...Shadows.card,
  },
  headerGradient: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(14),
    position: 'relative',
  },
  headerPlaneArtWrap: {
    position: 'absolute',
    right: -scale(16),
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
    marginBottom: scale(8),
  },
  topNavRowMessages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    marginBottom: scale(10),
    gap: scale(10),
  },
  headerTitleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  backBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPartnerWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  headerAvatarCircle: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
  },
  headerAvatarText: {
    fontSize: fontScale(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    marginTop: scale(1),
  },
  miniLiveDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#34D399',
  },
  headerRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: scale(2),
  },
  headerRoleText: {
    fontSize: fontScale(9),
    fontWeight: '800',
    color: '#2DD4BF',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: fontScale(19),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerPartnerName: {
    fontSize: fontScale(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: fontScale(11),
    color: '#CCFBF1',
    fontWeight: '600',
  },
  headerPartnerSub: {
    fontSize: fontScale(10.5),
    color: '#CCFBF1',
    fontWeight: '600',
  },
  headerCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerCountText: {
    fontSize: fontScale(11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Search bar
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    gap: scale(8),
    marginTop: scale(2),
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontScale(12.5),
    color: '#0F172A',
    paddingVertical: 0,
  },
  // Trust info banner
  trustInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFCF9',
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#CCFBF1',
    gap: scale(8),
  },
  trustInfoText: {
    flex: 1,
    fontSize: fontScale(10.5),
    fontWeight: '700',
    color: '#089A8D',
    lineHeight: scale(15),
  },
  activeDotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    paddingHorizontal: scale(9),
    paddingVertical: scale(5),
    borderRadius: scale(12),
    gap: scale(5),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  activeDotBadgeLocked: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  activeDotText: {
    fontSize: fontScale(9.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeBookingNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: scale(10),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    marginTop: scale(8),
    gap: scale(6),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  activeBookingNoticeClosed: {
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    borderColor: '#EF4444',
  },
  activeBookingNoticeText: {
    fontSize: fontScale(10.5),
    fontWeight: '700',
    color: '#CCFBF1',
    flex: 1,
  },
  activeBookingNoticeTextClosed: {
    color: '#FCA5A5',
  },
  // Messages List
  messagesList: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(12),
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: scale(8),
    gap: scale(8),
  },
  messageRowSelf: {
    justifyContent: 'flex-end',
  },
  messageRowPartner: {
    justifyContent: 'flex-start',
  },
  partnerMiniAvatar: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: '#089A8D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(2),
  },
  partnerMiniAvatarText: {
    fontSize: fontScale(11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: scale(13),
    paddingVertical: scale(8),
    borderRadius: scale(16),
  },
  messageBubbleSelf: {
    backgroundColor: '#056157', // Rich WhatsApp/Meta emerald
    borderBottomRightRadius: scale(2),
    ...Shadows.sm,
  },
  messageBubblePartner: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: scale(2),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  messageText: {
    fontSize: fontScale(13.5),
    lineHeight: scale(19),
  },
  messageTextSelf: {
    color: '#FFFFFF',
  },
  messageTextPartner: {
    color: '#0F172A',
  },
  bubbleFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: scale(2),
  },
  messageTimestamp: {
    fontSize: fontScale(9.5),
  },
  messageTimestampSelf: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  messageTimestampPartner: {
    color: '#94A3B8',
  },
  // Empty State
  emptyChatBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(32),
  },
  emptyIconCircle: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#EDFCF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  emptyChatTitle: {
    fontSize: fontScale(15),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(6),
  },
  emptyChatText: {
    fontSize: fontScale(11.5),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: scale(17),
  },
  // Quick Chips
  quickChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    gap: scale(6),
  },
  chipBtn: {
    backgroundColor: '#EDFCF9',
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  chipText: {
    fontSize: fontScale(10.5),
    fontWeight: '700',
    color: '#089A8D',
  },
  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: scale(12),
    paddingTop: scale(8),
    gap: scale(8),
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    paddingVertical: scale(8),
    fontSize: fontScale(13),
    maxHeight: scale(90),
    color: '#0F172A',
  },
  sendBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#089A8D',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  closedChatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    paddingHorizontal: scale(16),
    paddingTop: scale(12),
    gap: scale(10),
  },
  closedIconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedChatBarTitle: {
    fontSize: fontScale(12),
    fontWeight: '800',
    color: '#DC2626',
  },
  closedChatBarSub: {
    fontSize: fontScale(10.5),
    color: '#991B1B',
    marginTop: scale(1),
  },
  // Conversations List View
  conversationsList: {
    padding: scale(14),
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(13),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: scale(12),
    ...Shadows.sm,
  },
  convCardLocked: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E2E8F0',
  },
  avatarWrap: {
    position: 'relative',
  },
  convAvatarCircle: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: '#089A8D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  convAvatarCircleLocked: {
    backgroundColor: '#64748B',
  },
  convAvatarText: {
    fontSize: fontScale(17),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: scale(1),
    right: scale(1),
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarLockDot: {
    position: 'absolute',
    bottom: -scale(1),
    right: -scale(1),
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  convRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(2),
  },
  convPartnerName: {
    fontSize: fontScale(14),
    fontWeight: '800',
    color: '#0F172A',
  },
  convTime: {
    fontSize: fontScale(10),
    color: '#94A3B8',
    fontWeight: '600',
  },
  convMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: scale(3),
  },
  convMetaRole: {
    fontSize: fontScale(10),
    fontWeight: '700',
    color: '#089A8D',
  },
  convMetaPackage: {
    fontSize: fontScale(10),
    color: '#64748B',
    fontWeight: '600',
  },
  convLastMessage: {
    fontSize: fontScale(12),
    color: '#64748B',
    lineHeight: scale(16),
  },
  convLastMessageUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  convRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: scale(4),
  },
  lockedPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: scale(7),
    paddingVertical: scale(3),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: scale(3),
  },
  lockedPillText: {
    fontSize: fontScale(9.5),
    fontWeight: '800',
    color: '#DC2626',
  },
  activePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(7),
    paddingVertical: scale(3),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: scale(3),
  },
  miniActiveGreen: {
    width: scale(5),
    height: scale(5),
    borderRadius: scale(2.5),
    backgroundColor: '#10B981',
  },
  activePillText: {
    fontSize: fontScale(9.5),
    fontWeight: '800',
    color: '#065F46',
  },
  unreadBadge: {
    backgroundColor: '#089A8D',
    minWidth: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(5),
  },
  unreadBadgeText: {
    fontSize: fontScale(10),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(32),
  },
  emptyIconCircleLarge: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: '#EDFCF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  emptyMainTitle: {
    fontSize: fontScale(17),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(8),
  },
  emptyMainSub: {
    fontSize: fontScale(12.5),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: scale(18),
    marginBottom: scale(16),
  },
  ruleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: '#ECFDF5',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  ruleBadgeText: {
    fontSize: fontScale(10.5),
    fontWeight: '700',
    color: '#065F46',
  },
});
