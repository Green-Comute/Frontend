/**
 * @fileoverview Centralized API Service
 * @description Provides unified API request handling with authentication, error handling,
 * and automatic token management.
 * @module services/api
 */

/**
 * API Base URL
 * @constant {string}
 * @description Base URL for all API requests. Uses VITE_API_URL from environment or
 * defaults to localhost:5000/api
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get Authentication Token
 * 
 * @description Retrieves JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 * @private
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Create Request Headers
 * 
 * @description Generates HTTP headers including Content-Type and Authorization.
 * Automatically includes JWT token if available.
 * 
 * @returns {Object} Headers object with Content-Type and optional Authorization
 * @private
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Handle API Response
 * 
 * @description Processes API responses, handles errors, and manages authentication.
 * Automatically redirects to login on 401 (Unauthorized) responses.
 * 
 * @param {Response} response - Fetch API response object
 * @returns {Promise<Object>} Parsed JSON response data
 * @throws {Error} If response is not ok or parsing fails
 * 
 * @errorHandling
 * - 401 Unauthorized: Clears authToken and redirects to /login
 * - Other errors: Throws error with server message or generic message
 * 
 * @private
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  // Handle 401 - Unauthorized (redirect to login)
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

/**
 * API Request Helper
 * 
 * @description Generic function for making authenticated API requests.
 * Handles token injection, error handling, and response parsing.
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/users/me', '/trips')
 * @param {Object} [options={}] - Fetch API options (method, body, etc.)
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.body] - Request body (will be JSON stringified)
 * @param {Object} [options.headers] - Additional headers to merge
 * 
 * @returns {Promise<Object>} API response data
 * @throws {Error} If request fails or response indicates error
 * 
 * @example
 * // GET request
 * const user = await apiRequest('/users/me');
 * 
 * @example
 * // POST request
 * const trip = await apiRequest('/trips', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     source: 'Downtown',
 *     destination: 'Airport',
 *     scheduledTime: '2026-02-13T09:00:00.000Z'
 *   })
 * });
 * 
 * @example
 * // With authentication (automatic)
 * const trips = await apiRequest('/trips/search?source=Downtown&destination=Airport');
 * 
 * @security
 * - Automatically includes Authorization header with JWT token
 * - Clears token and redirects on 401 responses
 * - Validates responses before returning data
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default apiRequest;
