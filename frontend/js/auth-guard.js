/**
 * Authentication Guard
 * Protects pages and ensures users are authenticated and authorized
 */

import { AuthService } from './api/auth.js';

/**
 * Authentication Guard Class
 */
class AuthGuard {
  /**
   * Initialize authentication guard for a page
   * @param {string|string[]} requiredRoles - Required roles to access the page
   * @param {boolean} redirectIfNotAuth - Whether to redirect if not authenticated
   */
  static init(requiredRoles = null, redirectIfNotAuth = true) {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated) {
      if (redirectIfNotAuth) {
        console.log('User not authenticated, redirecting to login');
        window.location.href = '/login.html';
        return false;
      }
      return false;
    }

    // Check role-based access if roles are specified
    if (requiredRoles) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      if (!AuthService.hasAnyRole(roles)) {
        console.log('User does not have required role, redirecting');
        this.redirectToUnauthorized();
        return false;
      }
    }

    // Update UI with user information
    this.updateUserUI();
    
    // Setup logout handlers
    this.setupLogoutHandlers();
    
    return true;
  }

  /**
   * Update UI elements with user information
   */
  static updateUserUI() {
    const user = AuthService.currentUser;
    if (!user) return;

    // Update user name displays
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(element => {
      element.textContent = user.name || user.username;
    });

    // Update user role displays
    const userRoleElements = document.querySelectorAll('[data-user-role]');
    userRoleElements.forEach(element => {
      element.textContent = this.formatRole(user.role);
    });

    // Update user email displays
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    userEmailElements.forEach(element => {
      element.textContent = user.email || '';
    });

    // Show/hide elements based on roles
    this.handleRoleBasedVisibility();
  }

  /**
   * Handle role-based element visibility
   */
  static handleRoleBasedVisibility() {
    const userRole = AuthService.getUserRole();
    
    // Show elements for specific roles
    document.querySelectorAll('[data-show-for-role]').forEach(element => {
      const allowedRoles = element.getAttribute('data-show-for-role').split(',').map(r => r.trim());
      element.style.display = allowedRoles.includes(userRole) ? '' : 'none';
    });

    // Hide elements for specific roles
    document.querySelectorAll('[data-hide-for-role]').forEach(element => {
      const hiddenRoles = element.getAttribute('data-hide-for-role').split(',').map(r => r.trim());
      element.style.display = hiddenRoles.includes(userRole) ? 'none' : '';
    });

    // Show elements for authenticated users only
    document.querySelectorAll('[data-auth-required]').forEach(element => {
      element.style.display = AuthService.isAuthenticated ? '' : 'none';
    });

    // Show elements for non-authenticated users only
    document.querySelectorAll('[data-guest-only]').forEach(element => {
      element.style.display = !AuthService.isAuthenticated ? '' : 'none';
    });
  }

  /**
   * Setup logout handlers
   */
  static setupLogoutHandlers() {
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
          try {
            await AuthService.logout();
          } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            AuthService.clearAuthData();
            window.location.href = '/login.html';
          }
        }
      });
    });
  }

  /**
   * Redirect to unauthorized page
   */
  static redirectToUnauthorized() {
    // You can create an unauthorized.html page or redirect to a specific page
    alert('You do not have permission to access this page.');
    
    // Redirect to appropriate page based on user role
    if (AuthService.isAuthenticated) {
      AuthService.redirectToRolePage();
    } else {
      window.location.href = '/login.html';
    }
  }

  /**
   * Format role name for display
   */
  static formatRole(role) {
    const roleNames = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      pharmacist: 'Pharmacist',
      receptionist: 'Receptionist',
      patient: 'Patient'
    };
    
    return roleNames[role] || role;
  }

  /**
   * Check if current user can access patient data
   */
  static canAccessPatient(patientId) {
    const userRole = AuthService.getUserRole();
    const userId = AuthService.getUserId();
    
    // Admin and medical staff can access all patients
    if (['admin', 'doctor', 'nurse', 'pharmacist', 'receptionist'].includes(userRole)) {
      return true;
    }
    
    // Patients can only access their own data
    if (userRole === 'patient') {
      // This would need to be enhanced to check if the current user is linked to this patient
      return true; // For now, allow access
    }
    
    return false;
  }

  /**
   * Show loading overlay
   */
  static showLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'auth-loading-overlay';
    overlay.innerHTML = `
      <div style="text-align: center; color: white;">
        <div class="loading-spinner"></div>
        <p style="margin-top: 16px;">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  /**
   * Hide loading overlay
   */
  static hideLoadingOverlay() {
    const overlay = document.getElementById('auth-loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Refresh user data
   */
  static async refreshUserData() {
    try {
      this.showLoadingOverlay('Refreshing user data...');
      const user = await AuthService.getCurrentUser();
      if (user) {
        this.updateUserUI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    } finally {
      this.hideLoadingOverlay();
    }
  }

  /**
   * Setup periodic token refresh
   */
  static setupTokenRefresh() {
    // Check token every 10 minutes
    setInterval(async () => {
      if (AuthService.isAuthenticated && AuthService.isTokenExpired()) {
        const refreshed = await AuthService.refreshToken();
        if (!refreshed) {
          alert('Your session has expired. Please login again.');
          AuthService.logout();
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
  }
}

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Setup token refresh for all pages
  AuthGuard.setupTokenRefresh();
});

export default AuthGuard;
