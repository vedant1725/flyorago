import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'flyora_access_token',
  REFRESH_TOKEN: 'flyora_refresh_token',
  USER_ID: 'flyora_user_id',
  USER_NAME: 'flyora_user_name',
  USER_EMAIL: 'flyora_user_email',
  USER_ROLE: 'flyora_user_role',
  KYC_STATUS: 'flyora_kyc_status',
  API_BASE_URL: 'flyora_api_base_url',
  REMEMBER_ME: 'flyora_remember_me',
  SAVED_EMAIL: 'flyora_saved_email',
} as const;

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage setItem error', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage removeItem error', e);
    }
  },

  async clearAuthSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.USER_EMAIL,
        STORAGE_KEYS.USER_ROLE,
        STORAGE_KEYS.KYC_STATUS,
      ]);
    } catch (e) {
      console.warn('Error clearing auth session', e);
    }
  },
};
