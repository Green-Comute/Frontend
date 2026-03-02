/**
 * @fileoverview Authentication Service
 * @description Handles user authentication operations including signup, login, logout,
 * and token management.
 * @module services/authService
 */

/**
 * API Base URL
 * @constant {string}
 */
const API_BASE_URL = "http://localhost:5000";

/**
 * Safe JSON Parser
 * 
 * @description Safely parses JSON responses with fallback for non-JSON content.
 * Useful for debugging server errors that return HTML or plain text.
 * 
 * @param {Response} response - Fetch API response object
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If response is not JSON
 * @private
 */
async function safeJson(response) {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  // Not JSON → read as text for debugging
  const text = await response.text();
  throw new Error(`Non-JSON response from server: ${text}`);
}

/**
 * Authentication Service
 * 
 * @description Provides methods for user authentication and session management.
 * All methods return { success, data } or { success, error } format.
 */
export const authService = {
  /**
   * Register New Employee
   * 
   * @description Registers a new employee account with organization code.
   * Account requires organization admin approval before login.
   * 
   * @async
   * @param {Object} credentials - Signup credentials
   * @param {string} credentials.email - User email address
   * @param {string} credentials.phone - User phone number
   * @param {string} credentials.password - Account password
   * @param {string} credentials.orgCode - Organization code
   * 
   * @returns {Promise<Object>} Result object
   * @returns {boolean} result.success - Whether signup succeeded
   * @returns {Object} [result.data] - Response data if successful
   * @returns {string} [result.error] - Error message if failed
   * 
   * @example
   * const result = await authService.signup({
   *   email: 'employee@company.com',
   *   phone: '+1234567890',
   *   password: 'SecurePass123!',
   *   orgCode: 'COMP2024'
   * });
   * 
   * if (result.success) {
   *   console.log('Registration successful, awaiting approval');
   * } else {
   *   console.error('Signup failed:', result.error);
   * }
   */
  async signup({ email, phone, password, orgCode, otp }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, password, orgCode, otp }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      return { success: true, data };
    } catch (error) {
      console.error("SIGNUP ERROR:", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Authenticate User
   * 
   * @description Authenticates user credentials and stores JWT token.
   * Only approved users can successfully login.
   * 
   * @async
   * @param {string} email - User email address
   * @param {string} password - Account password
   * 
   * @returns {Promise<Object>} Result object
   * @returns {boolean} result.success - Whether login succeeded
   * @returns {Object} [result.data] - Response data including token and user info
   * @returns {string} [result.error] - Error message if failed
   * 
   * @sideEffects
   * - Stores JWT token in localStorage on success
   * - Clears existing token on 401 error
   * 
   * @example
   * const result = await authService.login('user@company.com', 'password123');
   * 
   * if (result.success) {
   *   console.log('Login successful');
   *   console.log('User:', result.data.user);
   *   // Token automatically stored in localStorage
   * } else {
   *   console.error('Login failed:', result.error);
   * }
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
        }
        throw new Error(data.message || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      return { success: true, data };
    } catch (error) {
      console.error("LOGIN ERROR:", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Logout User
   * 
   * @description Clears authentication token from localStorage.
   * 
   * @sideEffects Removes authToken from localStorage
   * 
   * @example
   * authService.logout();
   * // User is logged out, token removed
   */
  logout() {
    localStorage.removeItem("authToken");
  },

  /**
   * Get Authentication Token
   * 
   * @description Retrieves stored JWT token from localStorage.
   * 
   * @returns {string|null} JWT token or null if not logged in
   * 
   * @example
   * const token = authService.getToken();
   * if (token) {
   *   // User is logged in
   * }
   */
  getToken() {
    return localStorage.getItem("authToken");
  },

  /**
   * Check Authentication Status
   * 
   * @description Checks if user has a stored authentication token.
   * 
   * @returns {boolean} True if token exists, false otherwise
   * 
   * @note Does not validate token - only checks existence
   * 
   * @example
   * if (authService.isAuthenticated()) {
   *   // User appears to be logged in
   *   // Actual validation happens on API requests
   * }
   */
  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  },
};
