/**
 * Cross-Platform Storage Service
 * Provides unified storage interface for web, mobile, and desktop
 */

import { PLATFORM, STORAGE_KEYS } from '../config/apiConfig';

class StorageService {
  constructor() {
    this.storage = null;
    this.initializeStorage();
  }

  async initializeStorage() {
    if (PLATFORM.isMobile) {
      // React Native AsyncStorage
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        this.storage = AsyncStorage.default;
      } catch (error) {
        console.error('Failed to load AsyncStorage:', error);
      }
    } else if (PLATFORM.isDesktop) {
      // Electron store or localStorage
      this.storage = localStorage;
    } else {
      // Web localStorage
      this.storage = localStorage;
    }
  }

  // Get item from storage
  async getItem(key) {
    try {
      if (PLATFORM.isMobile && this.storage) {
        return await this.storage.getItem(key);
      } else {
        return this.storage?.getItem(key) || null;
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  // Set item in storage
  async setItem(key, value) {
    try {
      if (PLATFORM.isMobile && this.storage) {
        await this.storage.setItem(key, value);
      } else {
        this.storage?.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  // Remove item from storage
  async removeItem(key) {
    try {
      if (PLATFORM.isMobile && this.storage) {
        await this.storage.removeItem(key);
      } else {
        this.storage?.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }

  // Clear all storage
  async clear() {
    try {
      if (PLATFORM.isMobile && this.storage) {
        await this.storage.clear();
      } else {
        this.storage?.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Get multiple items
  async getMultiple(keys) {
    try {
      if (PLATFORM.isMobile && this.storage) {
        const values = await this.storage.multiGet(keys);
        return Object.fromEntries(values);
      } else {
        const result = {};
        keys.forEach(key => {
          result[key] = this.storage?.getItem(key) || null;
        });
        return result;
      }
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  }

  // Set multiple items
  async setMultiple(keyValuePairs) {
    try {
      if (PLATFORM.isMobile && this.storage) {
        const pairs = Object.entries(keyValuePairs);
        await this.storage.multiSet(pairs);
      } else {
        Object.entries(keyValuePairs).forEach(([key, value]) => {
          this.storage?.setItem(key, value);
        });
      }
    } catch (error) {
      console.error('Error setting multiple items:', error);
    }
  }

  // Get JSON object
  async getObject(key) {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error parsing JSON for ${key}:`, error);
      return null;
    }
  }

  // Set JSON object
  async setObject(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error stringifying JSON for ${key}:`, error);
    }
  }

  // Auth-specific methods
  async getAuthToken() {
    return await this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async setAuthToken(token) {
    await this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getRefreshToken() {
    return await this.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async setRefreshToken(token) {
    await this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  async getUserData() {
    return await this.getObject(STORAGE_KEYS.USER_DATA);
  }

  async setUserData(userData) {
    await this.setObject(STORAGE_KEYS.USER_DATA, userData);
  }

  async clearAuth() {
    await this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Device-specific methods
  async getDeviceId() {
    let deviceId = await this.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      await this.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  }

  generateDeviceId() {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Push token methods
  async getPushToken() {
    return await this.getItem(STORAGE_KEYS.PUSH_TOKEN);
  }

  async setPushToken(token) {
    await this.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
  }

  // Theme and preferences
  async getTheme() {
    return await this.getItem(STORAGE_KEYS.THEME) || 'light';
  }

  async setTheme(theme) {
    await this.setItem(STORAGE_KEYS.THEME, theme);
  }

  async getLanguage() {
    return await this.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  }

  async setLanguage(language) {
    await this.setItem(STORAGE_KEYS.LANGUAGE, language);
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
