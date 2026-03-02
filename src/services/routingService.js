/**
 * @fileoverview Routing and Geospatial Service
 * @description Provides route calculation, distance calculation, and formatting utilities
 * using OSRM (Open Source Routing Machine) and Haversine formula.
 * @module services/routingService
 */

/**
 * OSRM Base URL
 * @constant {string}
 * @description Open Source Routing Machine API endpoint for driving routes
 */
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Get Route Between Points
 * 
 * @description Calculates optimal driving route with actual road geometry
 * using OSRM API. Falls back to straight line if routing fails.
 * 
 * @async
 * @param {Object} source - Source point
 * @param {number} source.lat - Source latitude
 * @param {number} source.lng - Source longitude
 * @param {Object} destination - Destination point
 * @param {number} destination.lat - Destination latitude
 * @param {number} destination.lng - Destination longitude
 * @param {Array<Object>} [waypoints=[]] - Optional intermediate waypoints [{lat, lng}, ...]
 * 
 * @returns {Promise<Object>} Route data
 * @returns {Array<Array<number>>} result.coordinates - Route points [[lat, lng], ...]
 * @returns {number|null} result.distance - Distance in meters (null if fallback)
 * @returns {number|null} result.duration - Duration in seconds (null if fallback)
 * @returns {Array<Object>} result.steps - Turn-by-turn navigation steps
 * @returns {boolean} [result.fallback] - True if straight line fallback used
 * 
 * @example
 * const route = await getRoute(
 *   { lat: 37.7749, lng: -122.4194 },
 *   { lat: 37.6213, lng: -122.3893 }
 * );
 * console.log('Distance:', route.distance, 'meters');
 * console.log('Duration:', route.duration, 'seconds');
 * console.log('Route points:', route.coordinates.length);
 * 
 * @example
 * // With waypoints
 * const route = await getRoute(
 *   { lat: 37.7749, lng: -122.4194 },
 *   { lat: 37.6213, lng: -122.3893 },
 *   [
 *     { lat: 37.7000, lng: -122.4000 },
 *     { lat: 37.6500, lng: -122.3500 }
 *   ]
 * );
 * 
 * @external OSRM API based on OpenStreetMap data
 */
export const getRoute = async (source, destination, waypoints = []) => {
  try {
    // Build coordinates string: lng,lat;lng,lat;...
    const points = [source, ...waypoints, destination];
    const coordinates = points
      .map(point => `${point.lng},${point.lat}`)
      .join(';');

    const url = `${OSRM_BASE_URL}/${coordinates}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch route');
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    
    return {
      coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Convert [lng, lat] to [lat, lng]
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      steps: route.legs[0]?.steps || [],
    };
  } catch (error) {
    console.error('Routing error:', error);
    // Fallback to straight line if routing fails
    return {
      coordinates: [
        [source.lat, source.lng],
        [destination.lat, destination.lng]
      ],
      distance: null,
      duration: null,
      steps: [],
      fallback: true
    };
  }
};

/**
 * Calculate Distance Between Points
 * 
 * @description Calculates great-circle distance between two points
 * using Haversine formula. Accurate for small distances.
 * 
 * @param {Object} point1 - First point
 * @param {number} point1.lat - Latitude
 * @param {number} point1.lng - Longitude
 * @param {Object} point2 - Second point
 * @param {number} point2.lat - Latitude
 * @param {number} point2.lng - Longitude
 * 
 * @returns {number} Distance in kilometers
 * 
 * @example
 * const distance = calculateDistance(
 *   { lat: 37.7749, lng: -122.4194 },
 *   { lat: 37.6213, lng: -122.3893 }
 * );
 * console.log('Distance:', distance.toFixed(2), 'km');
 * 
 * @formula Haversine formula for spherical distance
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert Degrees to Radians
 * 
 * @description Helper function for trigonometric calculations.
 * 
 * @param {number} value - Angle in degrees
 * @returns {number} Angle in radians
 * @private
 */
const toRad = (value) => {
  return value * Math.PI / 180;
};

/**
 * Format Distance for Display
 * 
 * @description Converts meters to human-readable distance string.
 * Uses meters for < 1km, kilometers otherwise.
 * 
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance (e.g., '150 m', '2.5 km', 'N/A')
 * 
 * @example
 * formatDistance(500);      // '500 m'
 * formatDistance(1500);     // '1.5 km'
 * formatDistance(null);     // 'N/A'
 */
export const formatDistance = (meters) => {
  if (!meters) return 'N/A';
  
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format Duration for Display
 * 
 * @description Converts seconds to human-readable duration string.
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., '25m', '1h 30m', 'N/A')
 * 
 * @example
 * formatDuration(300);      // '5m'
 * formatDuration(3900);     // '1h 5m'
 * formatDuration(null);     // 'N/A'
 */
export const formatDuration = (seconds) => {
  if (!seconds) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};
