import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export interface AIAction {
  label: string;
  path: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actions?: AIAction[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  updatedAt: string;
  isPinned?: boolean;
}

interface FlyoraAIContextType {
  isOpen: boolean;
  isExpanded: boolean;
  isMinimized: boolean;
  isGenerating: boolean;
  messages: AIMessage[];
  conversations: AIConversation[];
  activeConversationId: string;
  suggestedPrompts: { id: number; title: string; prompt: string }[];
  quickActions: AIAction[];
  openAI: (initialPrompt?: string) => void;
  closeAI: () => void;
  toggleExpand: () => void;
  toggleMinimize: () => void;
  sendMessage: (promptText: string) => Promise<void>;
  clearChat: () => void;
  regenerateLastResponse: () => Promise<void>;
  createNewChat: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
}

const FlyoraAIContext = createContext<FlyoraAIContextType | undefined>(undefined);

export const FlyoraAIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [conversations, setConversations] = useState<AIConversation[]>(() => {
    try {
      const saved = localStorage.getItem('flyora_ai_conversations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return localStorage.getItem('flyora_ai_active_conv_id') || 'default-chat';
  });

  const [messages, setMessages] = useState<AIMessage[]>(() => {
    const welcomeMsg: AIMessage = {
      id: 'welcome-1',
      sender: 'ai',
      text: "Hello! 👋 I am **Flyora AI**, your personal assistant for FlyoraGo.\n\nHow can I help you today? Ask me about **Luggage Sharing**, **Parcel Delivery**, **Wallet & Escrow**, or general travel tips!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: "🧳 Luggage Sharing", path: "/luggage-sharing" },
        { label: "📦 Send Package", path: "/sender" },
        { label: "💰 Wallet & Escrow", path: "/wallet" }
      ]
    };
    return [welcomeMsg];
  });

  const [suggestedPrompts, setSuggestedPrompts] = useState<{ id: number; title: string; prompt: string }[]>([
    { id: 1, title: "🧳 How does Luggage Sharing work?", prompt: "How does Luggage Sharing work?" },
    { id: 2, title: "📦 How do I send a parcel?", prompt: "How do I send a parcel?" },
    { id: 3, title: "💰 Is my payment safe in Escrow?", prompt: "How is my payment protected in Escrow?" },
    { id: 4, title: "🛡️ What is Trust Score & KYC?", prompt: "What is Trust Score & KYC?" },
  ]);

  const [quickActions, setQuickActions] = useState<AIAction[]>([
    { label: "🧳 Luggage Sharing", path: "/luggage-sharing" },
    { label: "💰 Open Wallet", path: "/wallet" },
    { label: "📦 Send Package", path: "/sender" },
    { label: "✈️ Publish Trip", path: "/trips" },
    { label: "⭐ Trust Score", path: "/trust" },
  ]);

  // Save Conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flyora_ai_conversations', JSON.stringify(conversations));
      localStorage.setItem('flyora_ai_active_conv_id', activeConversationId);
    } catch (e) {
      console.error('Failed to save AI conversations:', e);
    }
  }, [conversations, activeConversationId]);

  const openAI = (initialPrompt?: string) => {
    setIsOpen(true);
    setIsMinimized(false);
    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  };

  const closeAI = () => {
    setIsOpen(false);
    setIsExpanded(false);
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);
  const toggleMinimize = () => setIsMinimized(!isMinimized);

  const sendMessage = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isGenerating) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }));
      const res = await apiFetch('/api/ai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, history: historyPayload })
      });

      if (res.status === 'success' && res.data) {
        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.text,
          actions: res.data.actions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(res.message || 'AI generation failed');
      }
    } catch (err: any) {
      const fallbackMsg: AIMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "I am having trouble connecting to the network right now. Please check your internet connection or ask another question!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = () => {
    const welcomeMsg: AIMessage = {
      id: 'welcome-1',
      sender: 'ai',
      text: "Chat cleared! 👋 How can **Flyora AI** assist you now?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: quickActions
    };
    setMessages([welcomeMsg]);
  };

  const regenerateLastResponse = async () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      await sendMessage(lastUserMsg.text);
    }
  };

  const createNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: AIConversation = {
      id: newId,
      title: `Chat ${conversations.length + 1}`,
      messages: [],
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    clearChat();
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    const conv = conversations.find(c => c.id === id);
    if (conv && conv.messages.length > 0) {
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      createNewChat();
    }
  };

  return (
    <FlyoraAIContext.Provider
      value={{
        isOpen,
        isExpanded,
        isMinimized,
        isGenerating,
        messages,
        conversations,
        activeConversationId,
        suggestedPrompts,
        quickActions,
        openAI,
        closeAI,
        toggleExpand,
        toggleMinimize,
        sendMessage,
        clearChat,
        regenerateLastResponse,
        createNewChat,
        selectConversation,
        deleteConversation
      }}
    >
      {children}
    </FlyoraAIContext.Provider>
  );
};

export const useFlyoraAI = () => {
  const context = useContext(FlyoraAIContext);
  if (!context) {
    throw new Error('useFlyoraAI must be used within a FlyoraAIProvider');
  }
  return context;
};
