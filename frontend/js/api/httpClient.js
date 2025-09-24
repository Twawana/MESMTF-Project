/**
 * HTTP Client
 * Centralized HTTP client with authentication, error handling, and retry logic
 */

import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES, DEFAULT_HEADERS, STORAGE_KEYS } from './config.js';
import { AuthService } from './auth.js';

class HttpClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Make HTTP request with retry logic
   */
  async request(url, options = {}, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      
      const requestOptions = {
        ...options,
        headers: {
          ...DEFAULT_HEADERS,
          ...this.getAuthHeaders(),
          ...options.headers
        },
        signal: controller.signal
      };

      // Convert body to JSON if it's an object
      if (requestOptions.body && typeof requestOptions.body === 'object') {
        requestOptions.body = JSON.stringify(requestOptions.body);
      }

      const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      // Handle token refresh for 401 errors
      if (response.status === HTTP_STATUS.UNAUTHORIZED && attempt === 1) {
        const refreshed = await AuthService.refreshToken();
        if (refreshed) {
          // Retry with new token
          return this.request(url, options, attempt + 1);
        } else {
          // Refresh failed, redirect to login
          AuthService.logout();
          window.location.href = '/login.html';
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }
      }

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new HttpError(
          data.error || this.getErrorMessage(response.status),
          response.status,
          data
        );
      }

      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle network errors with retry
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT);
      }

      if (error instanceof HttpError) {
        throw error;
      }

      // Retry on network errors
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.request(url, options, attempt + 1);
      }

      throw new Error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * GET request
   */
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request(fullUrl, {
      method: 'GET'
    });
  }

  /**
   * POST request
   */
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: data
    });
  }

  /**
   * PUT request
   */
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: data
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data = {}) {
    return this.request(url, {
      method: 'PATCH',
      body: data
    });
  }

  /**
   * DELETE request
   */
  async delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  }

  /**
   * Upload file
   */
  async upload(url, formData) {
    return this.request(url, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...this.getAuthHeaders()
      }
    });
  }

  /**
   * Check if error should trigger a retry
   */
  shouldRetry(error) {
    return (
      error.name === 'TypeError' || // Network error
      error.message.includes('fetch') ||
      error.message.includes('network')
    );
  }

  /**
   * Delay utility for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get user-friendly error message based on status code
   */
  getErrorMessage(status) {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN;
    }
  }
}

/**
 * Custom HTTP Error class
 */
class HttpError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
export { HttpError };
