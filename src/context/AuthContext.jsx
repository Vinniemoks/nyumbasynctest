import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../api/api';
import { auditLogger } from '../utils/auditLogger';
import { csrfProtection } from '../utils/csrfProtection';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = apiService.getAuthToken();
      if (token) {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      // Store tokens securely
      if (response.token) {
        apiService.setAuthToken(response.token, response.expiresIn);
      }
      if (response.refreshToken) {
        apiService.setRefreshToken(response.refreshToken);
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Generate new CSRF token
      csrfProtection.generateToken();
      
      // Set up auto-logout on token expiration
      setupAutoLogout(response.expiresIn);
      
      // Audit log
      auditLogger.logAuth('login_success', { 
        userId: response.user?.id,
        role: response.user?.role 
      });
      
      return response;
    } catch (error) {
      auditLogger.logAuth('login_failed', { 
        identifier: credentials.identifier,
        error: error.message 
      });
      throw error;
    }
  };

  const signup = async (userData) => {
    const response = await apiService.signup(userData);
    
    if (response.token) {
      apiService.setAuthToken(response.token, response.expiresIn);
      if (response.refreshToken) {
        apiService.setRefreshToken(response.refreshToken);
      }
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Set up auto-logout on token expiration
      setupAutoLogout(response.expiresIn);
    }
    return response;
  };

  const logout = async () => {
    const userId = user?.id;
    try {
      await apiService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      apiService.clearAuth();
      csrfProtection.clearToken();
      setUser(null);
      setIsAuthenticated(false);
      clearAutoLogout();
      
      // Audit log
      auditLogger.logAuth('logout', { userId });
    }
  };

  // Auto-logout functionality
  let logoutTimer = null;

  const setupAutoLogout = (expiresIn) => {
    clearAutoLogout();
    if (expiresIn) {
      // Logout 1 minute before token expires
      const timeout = Math.max(0, expiresIn - 60000);
      logoutTimer = setTimeout(() => {
        logout();
      }, timeout);
    }
  };

  const clearAutoLogout = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      logoutTimer = null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
