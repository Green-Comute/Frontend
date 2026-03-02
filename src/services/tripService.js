/**
 * @fileoverview Trip Management Service
 * @description Handles trip creation, search, lifecycle management (start/complete/cancel),
 * and driver trip retrieval with geospatial search capabilities.
 * @module services/tripService
 */

import apiRequest from './api';

/**
 * Trip Service
 * 
 * @description Provides comprehensive trip management operations for drivers and passengers.
 * All methods use authenticated API requests.
 */
export const tripService = {
  /**
   * Create New Trip
   * 
   * @description Driver creates a new trip offering.
   * Requires driver privileges and valid route data.
   * 
   * @async
   * @param {Object} tripData - Trip creation data
   * @param {string} tripData.source - Starting location name
   * @param {string} tripData.destination - Ending location name
   * @param {Object} tripData.sourceCoordinates - {type: 'Point', coordinates: [lng, lat]}
   * @param {Object} tripData.destinationCoordinates - {type: 'Point', coordinates: [lng, lat]}
   * @param {string} tripData.scheduledTime - ISO 8601 timestamp
   * @param {number} tripData.seatsAvailable - Number of seats
   * @param {string} [tripData.vehicleType] - Vehicle type (e.g., 'CAR', 'BIKE')
   * @param {Array<Array<number>>} [tripData.route] - Route coordinates [[lng, lat], ...]
   * 
   * @returns {Promise<Object>} Created trip data
   * @returns {string} result._id - Trip ID
   * @returns {string} result.status - 'SCHEDULED'
   * 
   * @throws {Error} If user is not a driver or data is invalid
   * 
   * @example
   * const trip = await tripService.createTrip({
   *   source: 'Downtown Office',
   *   destination: 'Airport Terminal',
   *   sourceCoordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] },
   *   destinationCoordinates: { type: 'Point', coordinates: [-122.3893, 37.6213] },
   *   scheduledTime: '2026-02-13T09:00:00.000Z',
   *   seatsAvailable: 3,
   *   vehicleType: 'CAR'
   * });
   */
  async createTrip(tripData) {
    return await apiRequest('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  /**
   * Search Trips
   * 
   * @description Search for trips with optional filters and proximity search.
   * Supports text search and geospatial queries using coordinates.
   * 
   * @async
   * @param {Object} params - Search parameters
   * @param {string} [params.source] - Source location name (text search)
   * @param {string} [params.destination] - Destination location name (text search)
   * @param {string} [params.vehicleType] - Vehicle type filter
   * @param {number} [params.sourceLat] - Source latitude for proximity search
   * @param {number} [params.sourceLng] - Source longitude for proximity search
   * @param {number} [params.destLat] - Destination latitude for proximity search
   * @param {number} [params.destLng] - Destination longitude for proximity search
   * 
   * @returns {Promise<Array<Object>>} Array of matching trips
   * 
   * @example
   * // Text search
   * const trips = await tripService.searchTrips({
   *   source: 'Downtown',
   *   destination: 'Airport'
   * });
   * 
   * @example
   * // Proximity search (within 5km)
   * const nearbyTrips = await tripService.searchTrips({
   *   sourceLat: 37.7749,
   *   sourceLng: -122.4194,
   *   destLat: 37.6213,
   *   destLng: -122.3893
   * });
   */
  async searchTrips(params) {
    const queryParams = new URLSearchParams();
    
    if (params.source) queryParams.append('source', params.source);
    if (params.destination) queryParams.append('destination', params.destination);
    if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
    
    // Add geolocation coordinates for proximity search
    if (params.sourceLat) queryParams.append('sourceLat', params.sourceLat);
    if (params.sourceLng) queryParams.append('sourceLng', params.sourceLng);
    if (params.destLat) queryParams.append('destLat', params.destLat);
    if (params.destLng) queryParams.append('destLng', params.destLng);
    
    return await apiRequest(`/trips/search?${queryParams.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Get Trip by ID
   * 
   * @description Retrieves detailed information about a specific trip.
   * Includes driver info, route, status, and ride requests.
   * 
   * @async
   * @param {string} tripId - Trip ID
   * 
   * @returns {Promise<Object>} Trip details
   * 
   * @example
   * const trip = await tripService.getTripById('64abc123def456789');
   * console.log('Driver:', trip.driver.name);
   * console.log('Status:', trip.status);
   * console.log('Seats available:', trip.seatsAvailable);
   */
  async getTripById(tripId) {
    return await apiRequest(`/trips/${tripId}`, {
      method: 'GET',
    });
  },

  /**
   * Start Trip
   * 
   * @description Driver starts the trip, marking it as IN_PROGRESS.
   * Only the trip creator can start the trip.
   * 
   * @async
   * @param {string} tripId - Trip ID
   * 
   * @returns {Promise<Object>} Updated trip with IN_PROGRESS status
   * @throws {Error} If not authorized or trip already started
   * 
   * @example
   * await tripService.startTrip('64abc123def456789');
   * console.log('Trip started successfully');
   */
  async startTrip(tripId) {
    return await apiRequest(`/trips/${tripId}/start`, {
      method: 'POST',
    });
  },

  /**
   * Complete Trip
   * 
   * @description Driver completes the trip, marking it as COMPLETED.
   * Finalizes all associated ride requests.
   * 
   * @async
   * @param {string} tripId - Trip ID
   * 
   * @returns {Promise<Object>} Updated trip with COMPLETED status
   * 
   * @example
   * await tripService.completeTrip('64abc123def456789');
   * console.log('Trip completed successfully');
   */
  async completeTrip(tripId) {
    return await apiRequest(`/trips/${tripId}/complete`, {
      method: 'POST',
    });
  },

  /**
   * Cancel Trip
   * 
   * @description Driver cancels the trip, marking it as CANCELLED.
   * Notifies all passengers with approved ride requests.
   * 
   * @async
   * @param {string} tripId - Trip ID
   * 
   * @returns {Promise<Object>} Updated trip with CANCELLED status
   * @throws {Error} If trip already started or completed
   * 
   * @example
   * await tripService.cancelTrip('64abc123def456789');
   * console.log('Trip cancelled');
   */
  async cancelTrip(tripId) {
    return await apiRequest(`/trips/${tripId}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * End Trip (Legacy)
   * 
   * @description Legacy method for ending a trip.
   * Consider using completeTrip() instead.
   * 
   * @async
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Updated trip
   * @deprecated Use completeTrip() instead
   */
  async endTrip(tripId) {
    return await apiRequest(`/trips/${tripId}/end`, {
      method: 'POST',
    });
  },

  /**
   * Get Driver Trips
   * 
   * @description Retrieves all trips created by the authenticated driver.
   * Includes scheduled, in-progress, completed, and cancelled trips.
   * 
   * @async
   * @returns {Promise<Array<Object>>} Array of driver's trips
   * 
   * @throws {Error} If user is not a driver
   * 
   * @example
   * const myTrips = await tripService.getDriverTrips();
   * const upcoming = myTrips.filter(t => t.status === 'SCHEDULED');
   * const active = myTrips.filter(t => t.status === 'IN_PROGRESS');
   */
  async getDriverTrips() {
    return await apiRequest('/trips/driver/trips', {
      method: 'GET',
    });
  },
};
