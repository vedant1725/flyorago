import { Storage, STORAGE_KEYS } from './storage';

export const DEFAULT_API_BASE_URL = 'https://api.flyorago.me';

let cachedBaseUrl: string = DEFAULT_API_BASE_URL;

export async function getApiBaseUrl(): Promise<string> {
  const custom = await Storage.getItem(STORAGE_KEYS.API_BASE_URL);
  if (custom && custom.trim().length > 0) {
    cachedBaseUrl = custom.trim().replace(/\/+$/, '');
    return cachedBaseUrl;
  }
  return DEFAULT_API_BASE_URL;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  cachedBaseUrl = cleanUrl;
  await Storage.setItem(STORAGE_KEYS.API_BASE_URL, cleanUrl);
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, any>;
  results?: T;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = await getApiBaseUrl();
  const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      await Storage.clearAuthSession();
      return {
        success: false,
        message: 'Session expired. Please log in again.',
      };
    }

    const contentType = response.headers.get('content-type') || '';
    let parsedData: any = null;

    if (contentType.includes('application/json')) {
      parsedData = await response.json();
    } else {
      const text = await response.text();
      parsedData = { data: text };
    }

    if (!response.ok) {
      const errorMsg =
        parsedData?.message ||
        parsedData?.detail ||
        parsedData?.error ||
        `Server returned status ${response.status}`;
      return {
        success: false,
        message: errorMsg,
        errors: parsedData?.errors || parsedData,
      };
    }

    return {
      success: true,
      message: parsedData?.message || 'Success',
      data: parsedData?.data !== undefined ? parsedData.data : parsedData,
      results: parsedData?.results,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timed out. Please verify your internet connection.',
      };
    }
    return {
      success: false,
      message: err.message || 'Unable to connect to Flyora servers.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'sender' | 'traveler' | 'both' | 'admin';
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  trustScore?: number;
  completedTrips?: number;
  completedDeliveries?: number;
  avatarUrl?: string;
}

export interface Trip {
  id: string | number;
  travelerName: string;
  travelerAvatar?: string;
  travelerKycVerified: boolean;
  trustScore: number;
  originAirport: string;
  originCity: string;
  destinationAirport: string;
  destinationCity: string;
  flightNumber?: string;
  departureDate: string;
  arrivalDate?: string;
  availableWeightKg: number;
  totalCapacityKg: number;
  pricePerKg: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  description?: string;
}

export interface Shipment {
  id: string | number;
  senderName: string;
  title: string;
  category: 'Electronics' | 'Documents' | 'Apparel' | 'Medicines' | 'Gifts' | 'Other';
  weightKg: number;
  originCity: string;
  destinationCity: string;
  targetDeliveryDate: string;
  rewardOffer: number;
  status: 'PENDING_MATCH' | 'MATCHED' | 'PICKED_UP' | 'IN_FLIGHT' | 'DELIVERED';
  insuranceIncluded: boolean;
  dimensions?: string;
}

export interface WalletSummary {
  availableBalance: number;
  escrowLockedBalance: number;
  lifetimeEarnings: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW_RELEASE' | 'ESCROW_HOLD' | 'REWARD_EARNED';
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  date: string;
  description: string;
}

export interface ChatConversation {
  id: string | number;
  partnerName: string;
  partnerRole: 'traveler' | 'sender';
  partnerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  flightRoute?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard Mock Data for Offline & Fallback Previews
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'tr-101',
    travelerName: 'Raj Patel',
    travelerKycVerified: true,
    trustScore: 4.95,
    originAirport: 'BOM',
    originCity: 'Mumbai',
    destinationAirport: 'DXB',
    destinationCity: 'Dubai',
    flightNumber: 'EK 505',
    departureDate: '2026-11-23',
    availableWeightKg: 14,
    totalCapacityKg: 20,
    pricePerKg: 18,
    status: 'SCHEDULED',
    description: 'Flying Emirates direct with 14kg empty luggage space. Fast handover at Terminal 3.',
  },
  {
    id: 'tr-102',
    travelerName: 'Sarah Jenkins',
    travelerKycVerified: true,
    trustScore: 4.88,
    originAirport: 'LHR',
    originCity: 'London',
    destinationAirport: 'DEL',
    destinationCity: 'New Delhi',
    flightNumber: 'BA 143',
    departureDate: '2026-11-25',
    availableWeightKg: 8,
    totalCapacityKg: 15,
    pricePerKg: 24,
    status: 'SCHEDULED',
    description: 'British Airways flight. Accepting sealed documents, clothing, or gadgets.',
  },
  {
    id: 'tr-103',
    travelerName: 'Arjun Mehta',
    travelerKycVerified: true,
    trustScore: 5.0,
    originAirport: 'JFK',
    originCity: 'New York',
    destinationAirport: 'BOM',
    destinationCity: 'Mumbai',
    flightNumber: 'AI 102',
    departureDate: '2026-11-27',
    availableWeightKg: 18,
    totalCapacityKg: 23,
    pricePerKg: 28,
    status: 'SCHEDULED',
    description: 'Direct Air India. Frequent traveler with 40+ completed luggage deliveries.',
  },
  {
    id: 'tr-104',
    travelerName: 'Elena Rostova',
    travelerKycVerified: true,
    trustScore: 4.92,
    originAirport: 'SIN',
    originCity: 'Singapore',
    destinationAirport: 'BLR',
    destinationCity: 'Bengaluru',
    flightNumber: 'SQ 502',
    departureDate: '2026-11-28',
    availableWeightKg: 10,
    totalCapacityKg: 12,
    pricePerKg: 19,
    status: 'SCHEDULED',
    description: 'Singapore Airlines. Fast delivery to Indiranagar or airport pickup.',
  },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'sh-501',
    senderName: 'Vedant Panchal',
    title: 'Urgent Engineering Blueprints & Sample Swatches',
    category: 'Documents',
    weightKg: 2.5,
    originCity: 'Mumbai',
    destinationCity: 'Dubai',
    targetDeliveryDate: '2026-11-24',
    rewardOffer: 65,
    status: 'PENDING_MATCH',
    insuranceIncluded: true,
    dimensions: '30x20x5 cm',
  },
  {
    id: 'sh-502',
    senderName: 'Priya Sharma',
    title: 'Custom Bridal Lehenga & Jewelry Box',
    category: 'Apparel',
    weightKg: 4.8,
    originCity: 'New Delhi',
    destinationCity: 'London',
    targetDeliveryDate: '2026-11-26',
    rewardOffer: 130,
    status: 'MATCHED',
    insuranceIncluded: true,
    dimensions: '45x35x15 cm',
  },
  {
    id: 'sh-503',
    senderName: 'David Miller',
    title: 'Smartwatch Test Units & Peripheral Sensors',
    category: 'Electronics',
    weightKg: 1.8,
    originCity: 'New York',
    destinationCity: 'Mumbai',
    targetDeliveryDate: '2026-11-28',
    rewardOffer: 85,
    status: 'IN_FLIGHT',
    insuranceIncluded: true,
    dimensions: '25x20x10 cm',
  },
];

export const MOCK_WALLET: WalletSummary = {
  availableBalance: 420.5,
  escrowLockedBalance: 195.0,
  lifetimeEarnings: 2840.0,
  currency: 'USD',
};

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TXN-9841',
    type: 'REWARD_EARNED',
    amount: 145.0,
    currency: 'USD',
    status: 'COMPLETED',
    date: '2026-11-18',
    description: 'Trip BOM -> DXB Luggage Delivery (8kg)',
  },
  {
    id: 'TXN-9832',
    type: 'ESCROW_RELEASE',
    amount: 85.0,
    currency: 'USD',
    status: 'COMPLETED',
    date: '2026-11-15',
    description: 'Escrow payment released for Package #sh-490',
  },
  {
    id: 'TXN-9820',
    type: 'WITHDRAWAL',
    amount: 250.0,
    currency: 'USD',
    status: 'COMPLETED',
    date: '2026-11-10',
    description: 'Payout to Bank Account (Ending in 4092)',
  },
];

export const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    partnerName: 'Raj Patel (Traveler)',
    partnerRole: 'traveler',
    lastMessage: 'I am arriving at Terminal 3 at 4:30 PM. See you at gate 4.',
    lastMessageTime: '12:45 PM',
    unreadCount: 1,
    flightRoute: 'BOM -> DXB (EK 505)',
  },
  {
    id: 'conv-2',
    partnerName: 'Sarah Jenkins (Traveler)',
    partnerRole: 'traveler',
    lastMessage: 'Package was inspected and safely packed in my carry-on.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    flightRoute: 'LHR -> DEL (BA 143)',
  },
];
