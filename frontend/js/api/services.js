/**
 * API Services
 * Service layer for all API operations
 */

import { httpClient } from './httpClient.js';
import { API_ENDPOINTS } from './config.js';

/**
 * User Service
 */
export class UserService {
  static async getUsers(params = {}) {
    return httpClient.get(API_ENDPOINTS.USERS.BASE, params);
  }

  static async getUserById(id) {
    return httpClient.get(API_ENDPOINTS.USERS.BY_ID(id));
  }

  static async createUser(userData) {
    return httpClient.post(API_ENDPOINTS.USERS.BASE, userData);
  }

  static async updateUser(id, userData) {
    return httpClient.put(API_ENDPOINTS.USERS.BY_ID(id), userData);
  }

  static async deleteUser(id) {
    return httpClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
  }

  static async updateUserStatus(id, status) {
    return httpClient.patch(API_ENDPOINTS.USERS.UPDATE_STATUS(id), { status });
  }
}

/**
 * Patient Service
 */
export class PatientService {
  static async getPatients(params = {}) {
    return httpClient.get(API_ENDPOINTS.PATIENTS.BASE, params);
  }

  static async getPatientById(id) {
    return httpClient.get(API_ENDPOINTS.PATIENTS.BY_ID(id));
  }

  static async createPatient(patientData) {
    return httpClient.post(API_ENDPOINTS.PATIENTS.BASE, patientData);
  }

  static async updatePatient(id, patientData) {
    return httpClient.put(API_ENDPOINTS.PATIENTS.BY_ID(id), patientData);
  }

  static async deletePatient(id) {
    return httpClient.delete(API_ENDPOINTS.PATIENTS.BY_ID(id));
  }

  static async searchPatients(query) {
    return httpClient.get(API_ENDPOINTS.PATIENTS.SEARCH, { q: query });
  }
}

/**
 * Appointment Service
 */
export class AppointmentService {
  static async getAppointments(params = {}) {
    return httpClient.get(API_ENDPOINTS.APPOINTMENTS.BASE, params);
  }

  static async getAppointmentById(id) {
    return httpClient.get(API_ENDPOINTS.APPOINTMENTS.BY_ID(id));
  }

  static async createAppointment(appointmentData) {
    return httpClient.post(API_ENDPOINTS.APPOINTMENTS.BASE, appointmentData);
  }

  static async updateAppointment(id, appointmentData) {
    return httpClient.put(API_ENDPOINTS.APPOINTMENTS.BY_ID(id), appointmentData);
  }

  static async cancelAppointment(id) {
    return httpClient.delete(API_ENDPOINTS.APPOINTMENTS.BY_ID(id));
  }

  static async updateAppointmentStatus(id, status) {
    return httpClient.patch(API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS(id), { status });
  }

  static async getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments({ date: today });
  }

  static async getUpcomingAppointments(days = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return this.getAppointments({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }
}

/**
 * Diagnosis Service
 */
export class DiagnosisService {
  static async getDiagnoses(params = {}) {
    return httpClient.get(API_ENDPOINTS.DIAGNOSIS.BASE, params);
  }

  static async getDiagnosisById(id) {
    return httpClient.get(API_ENDPOINTS.DIAGNOSIS.BY_ID(id));
  }

  static async createDiagnosis(diagnosisData) {
    return httpClient.post(API_ENDPOINTS.DIAGNOSIS.BASE, diagnosisData);
  }

  static async updateDiagnosis(id, diagnosisData) {
    return httpClient.put(API_ENDPOINTS.DIAGNOSIS.BY_ID(id), diagnosisData);
  }

  static async getExpertSystemAssessment(symptoms, testResults = {}) {
    return httpClient.post(API_ENDPOINTS.DIAGNOSIS.EXPERT_SYSTEM, {
      symptoms,
      testResults
    });
  }

  static async getPatientDiagnoses(patientId) {
    return this.getDiagnoses({ patient: patientId });
  }
}

/**
 * Prescription Service
 */
export class PrescriptionService {
  static async getPrescriptions(params = {}) {
    return httpClient.get(API_ENDPOINTS.PRESCRIPTIONS.BASE, params);
  }

  static async getPrescriptionById(id) {
    return httpClient.get(API_ENDPOINTS.PRESCRIPTIONS.BY_ID(id));
  }

  static async createPrescription(prescriptionData) {
    return httpClient.post(API_ENDPOINTS.PRESCRIPTIONS.BASE, prescriptionData);
  }

  static async updatePrescription(id, prescriptionData) {
    return httpClient.put(API_ENDPOINTS.PRESCRIPTIONS.BY_ID(id), prescriptionData);
  }

  static async dispensePrescription(id, dispensingData) {
    return httpClient.patch(API_ENDPOINTS.PRESCRIPTIONS.DISPENSE(id), dispensingData);
  }

  static async cancelPrescription(id) {
    return httpClient.patch(API_ENDPOINTS.PRESCRIPTIONS.CANCEL(id));
  }

  static async getPendingPrescriptions() {
    return this.getPrescriptions({ status: 'pending' });
  }

  static async getPatientPrescriptions(patientId) {
    return this.getPrescriptions({ patient: patientId });
  }
}

/**
 * Admin Service
 */
export class AdminService {
  static async getDashboardStats() {
    return httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
  }

  static async getSystemHealth() {
    return httpClient.get(API_ENDPOINTS.ADMIN.SYSTEM_HEALTH);
  }

  static async getSummaryReports(period = 'monthly') {
    return httpClient.get(API_ENDPOINTS.ADMIN.REPORTS, { period });
  }

  static async getAuditLogs(params = {}) {
    return httpClient.get(API_ENDPOINTS.ADMIN.AUDIT_LOGS, params);
  }

  static async initiateBackup() {
    return httpClient.post(API_ENDPOINTS.ADMIN.BACKUP);
  }

  static async getSystemSettings() {
    return httpClient.get(API_ENDPOINTS.ADMIN.SETTINGS);
  }

  static async updateSystemSettings(settings) {
    return httpClient.put(API_ENDPOINTS.ADMIN.SETTINGS, settings);
  }
}

/**
 * Utility Service for common operations
 */
export class UtilityService {
  /**
   * Format date for display
   */
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  }

  /**
   * Format date and time for display
   */
  static formatDateTime(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Debounce function for search inputs
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Show notification/toast message
   */
  static showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, duration);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  /**
   * Show loading spinner
   */
  static showLoading(element) {
    if (element) {
      element.classList.add('loading');
      element.disabled = true;
    }
  }

  /**
   * Hide loading spinner
   */
  static hideLoading(element) {
    if (element) {
      element.classList.remove('loading');
      element.disabled = false;
    }
  }

  /**
   * Validate form data
   */
  static validateForm(formData, rules) {
    const errors = {};
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = formData[field];
      
      if (rule.required && (!value || value.trim() === '')) {
        errors[field] = `${field} is required`;
        continue;
      }
      
      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
        continue;
      }
      
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
        continue;
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field} format is invalid`;
        continue;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
