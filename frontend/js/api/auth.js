/**
 * Authentication Service
 * Handles user authentication, token management, and session handling
 */

import { httpClient } from './httpClient.js';
import { API_ENDPOINTS, STORAGE_KEYS } from './config.js';

class AuthenticationService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  /**
   * Initialize authentication service
   */
  init() {
    this.loadUserFromStorage();
    this.setupTokenRefresh();
  }

  /**
   * Load user data from localStorage
   */
  loadUserFromStorage() {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearAuthData();
    }
  }

  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.success) {
        this.setAuthData(response.token, response.refreshToken, response.user);
        return { success: true, user: response.user };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.success) {
        this.setAuthData(response.token, response.refreshToken, response.user);
        return { success: true, user: response.user };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      if (this.isAuthenticated) {
        await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
      window.location.href = '/login.html';
    }
  }

  /**
   * Get current user data
   */
  async getCurrentUser() {
    try {
      if (!this.isAuthenticated) {
        return null;
      }

      const response = await httpClient.get(API_ENDPOINTS.AUTH.ME);
      
      if (response.success) {
        this.currentUser = response.data;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        return false;
      }

      const response = await httpClient.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });
      
      if (response.success) {
        this.setAuthData(response.token, response.refreshToken, response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Set authentication data
   */
  setAuthData(accessToken, refreshToken, user) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    this.currentUser = user;
    this.isAuthenticated = true;
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles) {
    return this.currentUser && roles.includes(this.currentUser.role);
  }

  /**
   * Get user role
   */
  getUserRole() {
    return this.currentUser ? this.currentUser.role : null;
  }

  /**
   * Get user ID
   */
  getUserId() {
    return this.currentUser ? this.currentUser.id : null;
  }

  /**
   * Get user name
   */
  getUserName() {
    return this.currentUser ? this.currentUser.name : null;
  }

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    // Check token expiry every 5 minutes
    setInterval(async () => {
      if (this.isAuthenticated && this.isTokenExpired()) {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          this.logout();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Redirect based on user role
   */
  redirectToRolePage() {
    if (!this.currentUser) {
      window.location.href = '/login.html';
      return;
    }

    const rolePages = {
      patient: '/patient.html',
      doctor: '/doctor.html',
      nurse: '/nurse.html',
      pharmacist: '/patientsPage.html',
      receptionist: '/reception.html',
      admin: '/admin.html'
    };

    const targetPage = rolePages[this.currentUser.role] || '/index.html';
    window.location.href = targetPage;
  }
}

// Export singleton instance
export const AuthService = new AuthenticationService();
