/**
 * @fileoverview Authentication Utilities
 * @description Simple utility functions for authentication token management and logout.
 * @module utils/auth
 */

/**
 * Get Authentication Token
 * 
 * @description Retrieves JWT token from localStorage.
 * 
 * @returns {string|null} JWT token or null if not found
 * 
 * @example
 * const token = getToken();
 * if (token) {
 *   headers.Authorization = `Bearer ${token}`;
 * }
 */
export const getToken = () => localStorage.getItem("authToken");

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
 * if (isAuthenticated()) {
 *   // Show authenticated UI
 * } else {
 *   // Redirect to login
 * }
 */
export const isAuthenticated = () => !!getToken();

/**
 * Logout User
 * 
 * @description Clears authentication token and redirects to login page.
 * 
 * @sideEffects
 * - Removes authToken from localStorage
 * - Navigates to /login page
 * 
 * @example
 * // In logout button handler
 * logout();
 * // User is logged out and redirected to login
 */
export const logout = () => {
  localStorage.removeItem("authToken");
  window.location.href = "/login";
};
