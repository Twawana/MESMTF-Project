/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// API Base Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    UPDATE_STATUS: (id) => `/users/${id}/status`
  },
  
  // Patients
  PATIENTS: {
    BASE: '/patients',
    BY_ID: (id) => `/patients/${id}`,
    SEARCH: '/patients/search'
  },
  
  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id) => `/appointments/${id}`,
    UPDATE_STATUS: (id) => `/appointments/${id}/status`
  },
  
  // Diagnoses
  DIAGNOSIS: {
    BASE: '/diagnosis',
    BY_ID: (id) => `/diagnosis/${id}`,
    EXPERT_SYSTEM: '/diagnosis/expert-system/assess'
  },
  
  // Prescriptions
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    BY_ID: (id) => `/prescriptions/${id}`,
    DISPENSE: (id) => `/prescriptions/${id}/dispense`,
    CANCEL: (id) => `/prescriptions/${id}/cancel`
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SYSTEM_HEALTH: '/admin/system-health',
    REPORTS: '/admin/reports/summary',
    AUDIT_LOGS: '/admin/audit-logs',
    BACKUP: '/admin/backup',
    SETTINGS: '/admin/settings'
  }
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN: 'An unexpected error occurred.'
};

// Request Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'mesmtf_access_token',
  REFRESH_TOKEN: 'mesmtf_refresh_token',
  USER_DATA: 'mesmtf_user_data',
  REMEMBER_ME: 'mesmtf_remember_me'
};
