/**
 * @fileoverview TomTom Traffic Service
 * @description Provides real-time traffic flow tiles and incident data using
 * the TomTom Traffic API (free tier — 2,500 requests/day, no credit card required).
 *
 * Traffic Flow Tiles: Overlay on Leaflet maps showing green/yellow/red congestion.
 * Traffic Incidents:  Accidents, jams, road closures, construction, etc.
 *
 * @module services/trafficService
 * @see https://developer.tomtom.com/traffic-api/documentation/traffic-flow
 * @see https://developer.tomtom.com/traffic-api/documentation/traffic-incidents
 */

/**
 * TomTom API Key
 * @constant {string}
 * @description Read from VITE_TOMTOM_API_KEY env variable.
 * Get a free key at https://developer.tomtom.com/
 */
const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY || '';

/**
 * TomTom Traffic Flow Tiles base URL
 * @constant {string}
 * @description Style = "relative0" shows speed relative to free-flow
 *   (green = free-flow, yellow = moderate, red = heavy congestion).
 *   The layer uses "flow" tiles with thickness 10 for good visibility.
 */
const TRAFFIC_FLOW_TILE_URL =
  'https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?tileSize=256&key=' +
  TOMTOM_API_KEY;

/**
 * TomTom Traffic Incidents endpoint
 * @constant {string}
 */
const TRAFFIC_INCIDENTS_BASE =
  'https://api.tomtom.com/traffic/services/5/incidentDetails';

// ─── Incident icon category mapping ─────────────────────────────────────────
const INCIDENT_CATEGORIES = {
  0: { label: 'Unknown', icon: '⚠️', color: '#6B7280' },
  1: { label: 'Accident', icon: '🚨', color: '#EF4444' },
  2: { label: 'Fog', icon: '🌫️', color: '#9CA3AF' },
  3: { label: 'Dangerous Conditions', icon: '⚠️', color: '#F59E0B' },
  4: { label: 'Rain', icon: '🌧️', color: '#3B82F6' },
  5: { label: 'Ice', icon: '🧊', color: '#93C5FD' },
  6: { label: 'Jam', icon: '🚗', color: '#DC2626' },
  7: { label: 'Lane Closed', icon: '🚧', color: '#F97316' },
  8: { label: 'Road Closed', icon: '⛔', color: '#B91C1C' },
  9: { label: 'Road Works', icon: '🔧', color: '#D97706' },
  10: { label: 'Wind', icon: '💨', color: '#6366F1' },
  11: { label: 'Flooding', icon: '🌊', color: '#2563EB' },
  14: { label: 'Broken Down Vehicle', icon: '🚙', color: '#EF4444' },
};

/**
 * Get Traffic Flow Tile URL
 *
 * @description Returns the TomTom traffic flow tile URL template that can
 * be used directly with Leaflet's L.tileLayer or react-leaflet's TileLayer.
 *
 * The tiles show colour-coded traffic speed:
 *   🟢 Green  = free-flow (no delay)
 *   🟡 Yellow = moderate congestion
 *   🔴 Red    = heavy congestion / standstill
 *
 * @returns {string} Tile URL template with {s}, {z}, {x}, {y} placeholders
 *
 * @example
 * <TileLayer url={getTrafficFlowTileUrl()} opacity={0.7} />
 */
export const getTrafficFlowTileUrl = () => {
  return TRAFFIC_FLOW_TILE_URL;
};

/**
 * Check if TomTom API key is configured
 *
 * @returns {boolean} True if VITE_TOMTOM_API_KEY is set
 */
export const isTrafficApiConfigured = () => {
  return Boolean(TOMTOM_API_KEY && TOMTOM_API_KEY.length > 0);
};

/**
 * Fetch Traffic Incidents
 *
 * @description Retrieves real-time traffic incidents within a geographic bounding box
 * using the TomTom Traffic Incidents API v5.
 *
 * Incident types include: accidents, jams, road closures, construction, weather, etc.
 *
 * @async
 * @param {Object} bounds - Geographic bounding box
 * @param {number} bounds.southLat - Southern latitude boundary
 * @param {number} bounds.westLng - Western longitude boundary
 * @param {number} bounds.northLat - Northern latitude boundary
 * @param {number} bounds.eastLng - Eastern longitude boundary
 *
 * @returns {Promise<Array<TrafficIncident>>} Array of traffic incidents
 *
 * @typedef {Object} TrafficIncident
 * @property {string}  id          - Unique incident identifier
 * @property {Object}  position    - { lat, lng } of incident
 * @property {string}  description - Human-readable description
 * @property {string}  category    - Incident category label
 * @property {string}  icon        - Emoji icon for display
 * @property {string}  color       - Hex color for the category
 * @property {number}  severity    - Delay magnitude (0-4, 4 = most severe)
 * @property {string}  roadName    - Affected road name
 * @property {number}  delay       - Delay in seconds
 * @property {string}  delayText   - Human-readable delay string
 * @property {string}  from        - Starting location description
 * @property {string}  to          - Ending location description
 *
 * @example
 * const incidents = await fetchTrafficIncidents({
 *   southLat: 12.9,
 *   westLng: 77.5,
 *   northLat: 13.1,
 *   eastLng: 77.7,
 * });
 * console.log(incidents[0].description); // "Accident on MG Road"
 */
export const fetchTrafficIncidents = async (bounds) => {
  if (!isTrafficApiConfigured()) {
    console.warn('[Traffic] TomTom API key not configured. Set VITE_TOMTOM_API_KEY in .env');
    return [];
  }

  if (!bounds || !bounds.southLat || !bounds.westLng || !bounds.northLat || !bounds.eastLng) {
    console.warn('[Traffic] Invalid bounds provided');
    return [];
  }

  const { southLat, westLng, northLat, eastLng } = bounds;
  const bbox = `${southLat},${westLng},${northLat},${eastLng}`;

  const url =
    `${TRAFFIC_INCIDENTS_BASE}?key=${TOMTOM_API_KEY}` +
    `&bbox=${bbox}` +
    `&fields={incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length,delay,roadNumbers}}}` +
    `&language=en-US` +
    `&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11,14` +
    `&timeValidityFilter=present`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`TomTom API HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.incidents || !Array.isArray(data.incidents)) {
      return [];
    }

    return data.incidents.map(parseIncident).filter(Boolean);
  } catch (error) {
    console.error('[Traffic] Failed to fetch incidents:', error.message);
    return [];
  }
};

/**
 * Parse a single TomTom incident into a normalised object
 *
 * @param {Object} incident - Raw TomTom incident object
 * @returns {TrafficIncident|null} Parsed incident or null if invalid
 * @private
 */
const parseIncident = (incident) => {
  try {
    const props = incident.properties || {};
    const geometry = incident.geometry || {};

    // Get position from geometry (Point or first coordinate of LineString)
    let lat, lng;
    if (geometry.type === 'Point' && geometry.coordinates) {
      [lng, lat] = geometry.coordinates;
    } else if (geometry.type === 'LineString' && geometry.coordinates?.length > 0) {
      // Use the midpoint of the line for marker placement
      const mid = Math.floor(geometry.coordinates.length / 2);
      [lng, lat] = geometry.coordinates[mid];
    } else {
      return null;
    }

    const catId = props.iconCategory ?? 0;
    const category = INCIDENT_CATEGORIES[catId] || INCIDENT_CATEGORIES[0];

    // Build description from events
    const eventDescs = (props.events || [])
      .map((e) => e.description)
      .filter(Boolean)
      .join('; ');

    const description = eventDescs || category.label;

    return {
      id: props.id || `incident-${lat}-${lng}`,
      position: { lat, lng },
      description,
      category: category.label,
      icon: category.icon,
      color: category.color,
      severity: props.magnitudeOfDelay ?? 0,
      roadName: (props.roadNumbers || []).join(', ') || 'Unknown road',
      delay: props.delay ?? 0,
      delayText: formatDelay(props.delay),
      from: props.from || '',
      to: props.to || '',
    };
  } catch (err) {
    console.warn('[Traffic] Failed to parse incident:', err.message);
    return null;
  }
};

/**
 * Format delay seconds into a human-readable string
 *
 * @param {number} seconds - Delay in seconds
 * @returns {string} Formatted delay (e.g., "5 min delay", "No delay")
 * @private
 */
const formatDelay = (seconds) => {
  if (!seconds || seconds <= 0) return 'No delay';
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '<1 min delay';
  if (minutes < 60) return `${minutes} min delay`;
  const hours = Math.floor(minutes / 60);
  const remainMins = minutes % 60;
  return `${hours}h ${remainMins}m delay`;
};

/**
 * Get bounds from map for incident queries
 *
 * @description Extracts bounding box from a Leaflet map instance.
 *
 * @param {Object} map - Leaflet map instance
 * @returns {Object|null} Bounds object { southLat, westLng, northLat, eastLng }
 */
export const getBoundsFromMap = (map) => {
  if (!map) return null;

  try {
    const bounds = map.getBounds();
    return {
      southLat: bounds.getSouth(),
      westLng: bounds.getWest(),
      northLat: bounds.getNorth(),
      eastLng: bounds.getEast(),
    };
  } catch (err) {
    console.warn('[Traffic] Failed to get map bounds:', err.message);
    return null;
  }
};

/**
 * Get severity label from magnitude
 *
 * @param {number} magnitude - TomTom delay magnitude (0-4)
 * @returns {string} Human-readable severity label
 */
export const getSeverityLabel = (magnitude) => {
  const labels = {
    0: 'Unknown',
    1: 'Minor',
    2: 'Moderate',
    3: 'Major',
    4: 'Undefined',
  };
  return labels[magnitude] || 'Unknown';
};

export { INCIDENT_CATEGORIES, formatDelay };

export default {
  getTrafficFlowTileUrl,
  isTrafficApiConfigured,
  fetchTrafficIncidents,
  getBoundsFromMap,
  getSeverityLabel,
};
