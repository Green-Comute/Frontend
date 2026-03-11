/**
 * @fileoverview Traffic Overlay Component
 * @description Adds a TomTom traffic flow tile layer and traffic incident markers
 * to a Leaflet map. Designed to be used as a child of react-leaflet's MapContainer.
 *
 * Features:
 *  • Traffic flow colour overlay (green/yellow/red) via TomTom tile layer
 *  • Traffic incident markers with popup details (accidents, jams, closures, etc.)
 *  • Auto-refresh incidents every 60 seconds
 *  • Refreshes incidents on map pan/zoom
 *
 * @module components/TrafficOverlay
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import {
    getTrafficFlowTileUrl,
    fetchTrafficIncidents,
    getBoundsFromMap,
    isTrafficApiConfigured,
    getSeverityLabel,
} from '../services/trafficService';

// ─── Incident Marker Icon Factory ────────────────────────────────────────────

/**
 * Create a circular div-icon for incident markers
 * @param {string} emoji - Emoji to display
 * @param {string} color - Background hex colour
 * @returns {L.DivIcon}
 */
const createIncidentIcon = (emoji, color) =>
    L.divIcon({
        className: 'traffic-incident-icon',
        html: `<div style="
      background: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      cursor: pointer;
    ">${emoji}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -18],
    });

// ─── Internal: incident marker layer (used inside MapContainer) ─────────────

const IncidentMarkers = ({ incidents }) => {
    if (!incidents || incidents.length === 0) return null;

    return (
        <>
            {incidents.map((incident) => (
                <Marker
                    key={incident.id}
                    position={[incident.position.lat, incident.position.lng]}
                    icon={createIncidentIcon(incident.icon, incident.color)}
                >
                    <Popup maxWidth={280} minWidth={200}>
                        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px',
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{incident.icon}</span>
                                <strong style={{ fontSize: '14px', color: '#1a202c' }}>
                                    {incident.category}
                                </strong>
                            </div>

                            <p style={{ fontSize: '13px', color: '#4a5568', margin: '0 0 6px' }}>
                                {incident.description}
                            </p>

                            {incident.roadName && incident.roadName !== 'Unknown road' && (
                                <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 4px' }}>
                                    📍 {incident.roadName}
                                </p>
                            )}

                            {incident.from && (
                                <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 4px' }}>
                                    From: {incident.from}
                                </p>
                            )}

                            {incident.to && (
                                <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 4px' }}>
                                    To: {incident.to}
                                </p>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '8px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span
                                    style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        background: incident.delay > 300 ? '#FEE2E2' : '#FEF3C7',
                                        color: incident.delay > 300 ? '#991B1B' : '#92400E',
                                    }}
                                >
                                    {incident.delayText}
                                </span>
                                <span
                                    style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        background: '#EBF5FF',
                                        color: '#1E40AF',
                                    }}
                                >
                                    {getSeverityLabel(incident.severity)}
                                </span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

IncidentMarkers.propTypes = {
    incidents: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            position: PropTypes.shape({
                lat: PropTypes.number,
                lng: PropTypes.number,
            }),
            description: PropTypes.string,
            category: PropTypes.string,
            icon: PropTypes.string,
            color: PropTypes.string,
            severity: PropTypes.number,
            roadName: PropTypes.string,
            delay: PropTypes.number,
            delayText: PropTypes.string,
            from: PropTypes.string,
            to: PropTypes.string,
        })
    ),
};

// ─── Incident fetcher component (inside MapContainer) ──────────────────────

const IncidentFetcher = ({ onIncidentsLoaded, refreshKey }) => {
    const map = useMap();

    // Fetch incidents for current map view
    const loadIncidents = useCallback(async () => {
        const bounds = getBoundsFromMap(map);
        if (!bounds) return;

        const incidents = await fetchTrafficIncidents(bounds);
        onIncidentsLoaded(incidents);
    }, [map, onIncidentsLoaded]);

    // Load on mount and when refreshKey changes
    useEffect(() => {
        loadIncidents();
    }, [loadIncidents, refreshKey]);

    // Reload when map moves / zooms
    useMapEvents({
        moveend: loadIncidents,
        zoomend: loadIncidents,
    });

    return null;
};

IncidentFetcher.propTypes = {
    onIncidentsLoaded: PropTypes.func.isRequired,
    refreshKey: PropTypes.number,
};

// ─── Main TrafficOverlay (used inside MapContainer) ─────────────────────────

/**
 * TrafficOverlay Component
 *
 * @description Renders traffic flow tiles and incident markers on the map.
 * Must be a child of a react-leaflet MapContainer.
 *
 * @param {Object}  props
 * @param {boolean} props.showTraffic   - Whether the traffic layer is visible
 * @param {boolean} props.showIncidents - Whether to show incident markers
 *
 * @example
 * <MapContainer ...>
 *   <TileLayer url="..." />
 *   <TrafficOverlay showTraffic={true} showIncidents={true} />
 * </MapContainer>
 */
const TrafficOverlay = ({ showTraffic = false, showIncidents = false }) => {
    const [incidents, setIncidents] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const timerRef = useRef(null);

    const apiConfigured = isTrafficApiConfigured();

    // Auto-refresh incidents every 60 seconds
    useEffect(() => {
        if (!showIncidents || !apiConfigured) return;

        timerRef.current = setInterval(() => {
            setRefreshKey((k) => k + 1);
        }, 60_000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [showIncidents, apiConfigured]);

    const handleIncidentsLoaded = useCallback((data) => {
        setIncidents(data);
    }, []);

    if (!apiConfigured) return null;

    return (
        <>
            {/* Traffic flow colour tile overlay */}
            {showTraffic && (
                <TileLayer
                    url={getTrafficFlowTileUrl()}
                    opacity={0.7}
                    zIndex={400}
                    maxZoom={22}
                    subdomains={['a', 'b', 'c', 'd']}
                    attribution='&copy; <a href="https://www.tomtom.com/">TomTom</a> Traffic'
                />
            )}

            {/* Traffic incident markers */}
            {showIncidents && (
                <>
                    <IncidentFetcher
                        onIncidentsLoaded={handleIncidentsLoaded}
                        refreshKey={refreshKey}
                    />
                    <IncidentMarkers incidents={incidents} />
                </>
            )}
        </>
    );
};

TrafficOverlay.propTypes = {
    showTraffic: PropTypes.bool,
    showIncidents: PropTypes.bool,
};

export default TrafficOverlay;
// eslint-disable-next-line react-refresh/only-export-components
export { IncidentMarkers, IncidentFetcher, createIncidentIcon };
