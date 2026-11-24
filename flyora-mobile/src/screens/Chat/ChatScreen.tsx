import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeHeaderPaddingTop } from '../../constants/responsive';
import { FlyoraColors, BorderRadius, Shadows } from '../../constants/theme';
import {
  ChatConversation,
  ChatMessage,
  MOCK_CONVERSATIONS,
} from '../../services/api';

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm-1',
      senderId: 'raj',
      text: 'Hi Vedant! I received your package request for Dubai. I have 14kg empty luggage on Emirates EK 505.',
      timestamp: '11:30 AM',
      isSelf: false,
    },
    {
      id: 'm-2',
      senderId: 'self',
      text: 'Great! It is a sealed box with sample engineering fabric swatches and documents (2.5kg).',
      timestamp: '11:42 AM',
      isSelf: true,
    },
    {
      id: 'm-3',
      senderId: 'raj',
      text: 'Perfect, that fits easily in my cabin bag. Escrow is already held by FlyoraGo.',
      timestamp: '12:10 PM',
      isSelf: false,
    },
    {
      id: 'm-4',
      senderId: 'raj',
      text: 'I am arriving at Terminal 3 at 4:30 PM. See you at gate 4.',
      timestamp: '12:45 PM',
      isSelf: false,
    },
  ],
  'conv-2': [
    {
      id: 'm-10',
      senderId: 'sarah',
      text: 'Hello! I am boarding British Airways BA 143 to New Delhi.',
      timestamp: 'Yesterday',
      isSelf: false,
    },
    {
      id: 'm-11',
      senderId: 'sarah',
      text: 'Package was inspected and safely packed in my carry-on.',
      timestamp: 'Yesterday',
      isSelf: false,
    },
  ],
};

export const ChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [conversations] = useState<ChatConversation[]>(MOCK_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const currentMessages = activeConv ? messagesMap[String(activeConv.id)] || [] : [];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'self',
      text: text.trim(),
      timestamp: 'Just now',
      isSelf: true,
    };

    const convId = String(activeConv.id);
    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg],
    }));

    if (!textToSend) setInputText('');

    // Simulate smart partner response
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: 'partner',
        text: 'Got it! I will scan the QR code and confirm upon arrival.',
        timestamp: 'Just now',
        isSelf: false,
      };
      setMessagesMap((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), replyMsg],
      }));
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* If in Active Conversation View */}
      {activeConv ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <LinearGradient
              colors={['#062738', '#089A8D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.chatHeaderGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
            >
              <View style={styles.chatHeaderTop}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setActiveConv(null)}
                >
                  <Ionicons name="arrow-back" size={22} color={FlyoraColors.white} />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.chatPartnerName}>{activeConv.partnerName}</Text>
                  <View style={styles.flightTag}>
                    <Ionicons name="airplane" size={12} color={FlyoraColors.tealBright} />
                    <Text style={styles.flightTagText}>{activeConv.flightRoute}</Text>
                  </View>
                </View>

                <View style={styles.verifiedIconWrap}>
                  <Ionicons name="shield-checkmark" size={18} color="#14B8A6" />
                </View>
              </View>

              {/* Escrow banner inside active chat */}
              <View style={styles.chatEscrowBanner}>
                <Ionicons name="lock-closed" size={14} color="#2DD4BF" />
                <Text style={styles.chatEscrowText}>
                  Escrow Protected: Release funds after recipient confirms OTP.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Messages list */}
          <FlatList
            data={currentMessages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubbleRow,
                  item.isSelf ? styles.selfRow : styles.partnerRow,
                ]}
              >
                {!item.isSelf && (
                  <View style={styles.fbAvatarMini}>
                    <Text style={styles.fbAvatarMiniText}>
                      {activeConv.partnerName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    item.isSelf ? styles.selfBubble : styles.partnerBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      item.isSelf ? styles.selfMessageText : styles.partnerMessageText,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <View style={styles.bubbleMetaRow}>
                    <Text
                      style={[
                        styles.messageTimestamp,
                        item.isSelf ? styles.selfTimestamp : styles.partnerTimestamp,
                      ]}
                    >
                      {item.timestamp}
                    </Text>
                    {item.isSelf && (
                      <Ionicons name="checkmark-circle" size={11} color="rgba(255, 255, 255, 0.85)" />
                    )}
                  </View>
                </View>
              </View>
            )}
          />

          {/* Quick preset chips */}
          <View style={styles.quickChipsBar}>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleSendMessage('What terminal are you arriving at?')}
            >
              <Text style={styles.quickChipText}>📍 Which terminal?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleSendMessage('Delivery OTP for recipient is 8492.')}
            >
              <Text style={styles.quickChipText}>🔑 Send Handover OTP</Text>
            </TouchableOpacity>
          </View>

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type message to traveler..."
              placeholderTextColor={FlyoraColors.gray400}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color={FlyoraColors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* Conversation Inbox View */
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <LinearGradient
              colors={['#062738', '#089A8D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.headerGradient, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
            >
              <Text style={styles.subtitle}>Direct Coordination</Text>
              <Text style={styles.title}>Messages & Handover</Text>
            </LinearGradient>
          </View>

          <FlatList
            data={conversations}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.inboxList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.convCard}
                onPress={() => setActiveConv(item)}
                activeOpacity={0.85}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {item.partnerName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.convTopRow}>
                    <Text style={styles.convName}>{item.partnerName}</Text>
                    <Text style={styles.convTime}>{item.lastMessageTime}</Text>
                  </View>

                  <Text style={styles.convRoute}>{item.flightRoute}</Text>
                  <Text style={styles.convLastMsg} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>

                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
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
  inboxList: {
    padding: 16,
    paddingBottom: 100,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FlyoraColors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    ...Shadows.card,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FlyoraColors.navyMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: FlyoraColors.tealBright,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  convName: {
    fontSize: 15,
    fontWeight: '700',
    color: FlyoraColors.gray900,
  },
  convTime: {
    fontSize: 11,
    color: FlyoraColors.gray500,
  },
  convRoute: {
    fontSize: 11,
    fontWeight: '600',
    color: FlyoraColors.tealDark,
    marginBottom: 4,
  },
  convLastMsg: {
    fontSize: 13,
    color: FlyoraColors.gray600,
  },
  unreadBadge: {
    backgroundColor: FlyoraColors.teal,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '800',
    color: FlyoraColors.white,
  },
  chatHeader: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  chatHeaderGradient: {
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  chatHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  chatPartnerName: {
    fontSize: 16,
    fontWeight: '800',
    color: FlyoraColors.white,
  },
  flightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  flightTagText: {
    fontSize: 11,
    color: '#2DD4BF',
    fontWeight: '600',
  },
  verifiedIconWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.full,
    padding: 6,
  },
  chatEscrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    borderRadius: BorderRadius.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 6,
  },
  chatEscrowText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 10,
  },
  messageBubbleRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  selfRow: {
    justifyContent: 'flex-end',
  },
  partnerRow: {
    justifyContent: 'flex-start',
  },
  fbAvatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#066B65',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  fbAvatarMiniText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  selfBubble: {
    backgroundColor: '#089A8D',
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: '#E4E6EB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  selfMessageText: {
    color: '#FFFFFF',
  },
  partnerMessageText: {
    color: '#050505',
  },
  bubbleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 3,
  },
  messageTimestamp: {
    fontSize: 9,
  },
  selfTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  partnerTimestamp: {
    color: '#65676B',
  },
  quickChipsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  quickChip: {
    backgroundColor: FlyoraColors.gray100,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
  },
  quickChipText: {
    fontSize: 11,
    color: FlyoraColors.gray700,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: FlyoraColors.surface,
    borderTopWidth: 1,
    borderTopColor: FlyoraColors.border,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: FlyoraColors.gray50,
    borderWidth: 1,
    borderColor: FlyoraColors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: FlyoraColors.gray900,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FlyoraColors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
