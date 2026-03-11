/**
 * @fileoverview API Configuration
 * @description Centralized configuration for API and WebSocket URLs
 */

/**
 * API Base URL - for REST API calls
 * Uses VITE_API_URL from environment or defaults to localhost
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Socket.IO Base URL - for WebSocket connections
 * Derives from VITE_API_URL by removing '/api' suffix
 */
export const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

/**
 * Static Assets Base URL - for images, documents, etc.
 * Derives from VITE_API_URL by removing '/api' suffix
 */
export const ASSETS_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';
