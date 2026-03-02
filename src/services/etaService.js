/**
 * @fileoverview Frontend ETA Calculation Service
 * @description Fetches real-time ETA from a driver's current GPS position to the trip
 * destination using the free OSRM (Open Source Routing Machine) routing API.
 *
 * This service is used as a 60-second polling fallback inside the passenger's
 * live-tracking view so the ETA stays accurate even between driver location pushes.
 *
 * @module services/etaService
 */

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Calculate ETA via OSRM
 *
 * @async
 * @param {{ lat: number, lng: number }} driverLocation  – Current driver GPS
 * @param {{ lat: number, lng: number }} destination     – Trip destination
 * @returns {Promise<ETAResult|null>}  null if params missing or request fails
 *
 * @typedef {Object} ETAResult
 * @property {number}  durationSeconds  – Remaining driving time in seconds
 * @property {number}  distanceMeters   – Remaining distance in metres
 * @property {string}  etaText          – Human-readable time  ("12 min", "1h 5m")
 * @property {string}  distanceText     – Human-readable distance ("2.3 km")
 * @property {boolean} fallback         – True when straight-line estimate used
 */
const calculateETA = async (driverLocation, destination) => {
  if (!driverLocation?.lat || !driverLocation?.lng ||
    !destination?.lat   || !destination?.lng) {
    return null;
  }

  const coords = `${driverLocation.lng},${driverLocation.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_BASE}/${coords}?overview=false`;

  try {
    const res  = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error('No route from OSRM');
    }

    const route = data.routes[0];
    return {
      durationSeconds : Math.round(route.duration),
      distanceMeters  : Math.round(route.distance),
      etaText         : formatDuration(route.duration),
      distanceText    : formatDistance(route.distance),
      fallback        : false,
    };
  } catch (err) {
    console.warn('[ETA] OSRM failed, using Haversine fallback:', err.message);
    const distKm        = haversineKm(driverLocation, destination);
    const durationSecs  = (distKm / 40) * 3600; // assume 40 km/h

    return {
      durationSeconds : Math.round(durationSecs),
      distanceMeters  : Math.round(distKm * 1000),
      etaText         : formatDuration(durationSecs),
      distanceText    : formatDistance(distKm * 1000),
      fallback        : true,
    };
  }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return m <= 0 ? '<1 min' : `${m} min`;
};

const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineKm = (p1, p2) => {
  const R   = 6371;
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a   =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export { calculateETA, formatDuration, formatDistance };
export default calculateETA;
