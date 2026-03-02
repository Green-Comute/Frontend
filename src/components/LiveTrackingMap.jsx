/**
 * LiveTrackingMap – passenger & driver live-tracking component
 *
 * New in this version:
 *  • ETA panel for passengers (calculated from each locationUpdate)
 *  • 60-second client-side ETA polling via OSRM as a fallback so the ETA
 *    stays fresh even if the driver's location hasn't changed recently
 *  • ETA is reset to null when the trip ends or the driver location disappears
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import MapView from './MapView';
import { io } from 'socket.io-client';
import calculateETA from '../services/etaService';

// ─── ETA display helper ──────────────────────────────────────────────────────
const ETACard = ({ eta, lastUpdated, userRole }) => {
  const [freshness, setFreshness] = useState(null);

  useEffect(() => {
    if (!lastUpdated) return;
    const id = setInterval(() => setFreshness(Math.floor((Date.now() - lastUpdated) / 1000)), 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  if (userRole === 'driver') return null;
  if (!eta) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2040 100%)',
        borderRadius: '16px',
        padding: '20px 24px',
        color: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
      }}
    >
      {/* Main ETA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '160px' }}>
        <div
          style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(99,179,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}
        >
          ⏱️
        </div>
        <div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Arrives in
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1, color: '#63b3ed' }}>
            {eta.etaText}
          </div>
          {eta.fallback && (
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>
              ≈ estimated
            </div>
          )}
        </div>
      </div>

      {/* Distance */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '130px' }}>
        <div
          style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(154,230,180,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          📍
        </div>
        <div>
          <div style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
            Remaining
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#9ae6b4' }}>
            {eta.distanceText}
          </div>
        </div>
      </div>

      {/* Refresh timestamp */}
      {freshness !== null && (
        <div style={{ fontSize: '11px', opacity: 0.45, alignSelf: 'flex-end', marginTop: '4px' }}>
          Updated {freshness < 5 ? 'just now' : `${freshness}s ago`} · refreshes every 60s
        </div>
      )}
    </div>
  );
};

ETACard.propTypes = {
  eta: PropTypes.shape({
    etaText: PropTypes.string,
    distanceText: PropTypes.string,
    fallback: PropTypes.bool,
  }),
  lastUpdated: PropTypes.number,
  userRole: PropTypes.string,
};

// ─── Main Component ──────────────────────────────────────────────────────────
const LiveTrackingMap = ({ trip, userRole }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState('');
  const [simulationInterval, setSimulationInterval] = useState(null);

  // ── ETA state ──
  const [eta, setEta] = useState(null);
  const [etaLastUpdated, setEtaLastUpdated] = useState(null);
  const etaTimerRef = useRef(null);
  const driverLocationRef = useRef(null);  // always up-to-date for timer

  // Keep ref in sync
  useEffect(() => { driverLocationRef.current = driverLocation; }, [driverLocation]);

  // ── Destination from trip ──
  const getDestination = useCallback(() => {
    const dl = trip.destinationLocation;
    if (!dl) return null;
    // Support both flat {lat,lng} and nested {coordinates:{coordinates:[lng,lat]}}
    if (typeof dl.lat === 'number') return { lat: dl.lat, lng: dl.lng };
    const coords = dl.coordinates?.coordinates;
    if (coords?.length === 2) return { lat: coords[1], lng: coords[0] };
    return null;
  }, [trip.destinationLocation]);

  // ── Refresh ETA from OSRM ──
  const refreshETA = useCallback(async () => {
    const loc = driverLocationRef.current;
    const dest = getDestination();
    if (!loc || !dest) return;

    const result = await calculateETA(loc, dest);
    if (result) {
      setEta(result);
      setEtaLastUpdated(Date.now());
    }
  }, [getDestination]);

  // ── 60-second polling (passengers only, trip must be STARTED) ──
  useEffect(() => {
    if (userRole === 'driver' || trip.status !== 'STARTED') return;

    // Clear any previous timer
    if (etaTimerRef.current) clearInterval(etaTimerRef.current);

    etaTimerRef.current = setInterval(refreshETA, 60_000); // every 60 seconds

    return () => {
      if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    };
  }, [userRole, trip.status, refreshETA]);

  // ── Clear ETA when trip ends ──
  useEffect(() => {
    if (trip.status !== 'STARTED') {
      setEta(null);
      setEtaLastUpdated(null);
    }
  }, [trip.status]);

  // Get passenger waypoints from approved ride requests
  const passengerWaypoints = (trip.rideRequests || [])
    .filter(req => req.status === 'APPROVED' && req.passengerId?.pickupLocation)
    .map(req => ({
      lat: req.passengerId.pickupLocation.lat,
      lng: req.passengerId.pickupLocation.lng,
      name: req.passengerId.name || 'Passenger',
      address: req.passengerId.pickupLocation.address
    }));

  // ── Socket connection ──
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const newSocket = io('http://localhost:5000', { auth: { token } });

    newSocket.on('connect', () => {
      console.log('Connected to tracking socket');
      newSocket.emit('joinTrip', trip._id);
    });

    newSocket.on('locationUpdate', (data) => {
      if (data.tripId !== trip._id) return;

      const loc = { lat: data.location.lat, lng: data.location.lng };
      setDriverLocation(loc);

      // ── ETA update from server payload (backend calculated it on each push) ──
      if (userRole === 'passenger') {
        if (data.eta) {
          setEta(data.eta);
          setEtaLastUpdated(Date.now());
        } else {
          // Server couldn't compute ETA — fall back to client calculation
          const dest = getDestination();
          if (dest) {
            calculateETA(loc, dest).then(result => {
              if (result) {
                setEta(result);
                setEtaLastUpdated(Date.now());
              }
            });
          }
        }
      }
    });

    newSocket.on('tripStatusUpdate', (data) => {
      if (data.tripId === trip._id) {
        console.log('Trip status updated:', data.status);
      }
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leaveTrip', trip._id);
        newSocket.disconnect();
      }
    };
  }, [trip._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Driver: watch real GPS position ──
  useEffect(() => {
    if (userRole !== 'driver' || !socket || trip.status !== 'STARTED') return;

    let watchId;

    const startTracking = () => {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setDriverLocation(location);
            socket.emit('updateLocation', { tripId: trip._id, location });
            setIsTracking(true);
          },
          (err) => {
            console.error('Geolocation error:', err);
            setError('Failed to get location. Please enable location services.');
            setIsTracking(false);
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      } else {
        setError('Geolocation not supported by your browser');
      }
    };

    startTracking();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [socket, trip._id, trip.status, userRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Driver: simulate movement along the ACTUAL road route ──
  const startSimulation = async () => {
    if (!trip.sourceLocation || !trip.destinationLocation) {
      setError('Cannot simulate - missing location data');
      return;
    }

    const srcLat = trip.sourceLocation.lat ?? trip.sourceLocation.coordinates?.coordinates?.[1];
    const srcLng = trip.sourceLocation.lng ?? trip.sourceLocation.coordinates?.coordinates?.[0];
    const dstLat = trip.destinationLocation.lat ?? trip.destinationLocation.coordinates?.coordinates?.[1];
    const dstLng = trip.destinationLocation.lng ?? trip.destinationLocation.coordinates?.coordinates?.[0];

    if (!srcLat || !srcLng || !dstLat || !dstLng) {
      setError('Invalid location coordinates');
      return;
    }

    setIsSimulating(true);
    setError('');

    // ── Step 1: fetch the OSRM road geometry ─────────────────────────────────
    // This is the same API the RouteLayer in MapView uses, so the marker will
    // follow exactly the blue line already drawn on the map.
    let routePoints = [];   // array of {lat, lng}

    try {
      const coords = `${srcLng},${srcLat};${dstLng},${dstLat}`;
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
          // OSRM returns [lng, lat]; convert to {lat, lng}
          routePoints = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => ({ lat, lng })
          );
        }
      }
    } catch (err) {
      console.warn('[Simulation] OSRM fetch failed, falling back to straight line:', err.message);
    }

    // Fallback: straight-line if OSRM unavailable
    if (routePoints.length < 2) {
      console.warn('[Simulation] Using straight-line fallback (no OSRM route)');
      const STEPS = 30;
      for (let i = 0; i <= STEPS; i++) {
        routePoints.push({
          lat: srcLat + (dstLat - srcLat) * (i / STEPS),
          lng: srcLng + (dstLng - srcLng) * (i / STEPS),
        });
      }
    }

    // ── Step 2: thin the points so we emit ~1 update every 2 seconds ─────────
    // OSRM can return hundreds of points; keep at most 40 evenly spaced ones
    // so the simulation takes ~80 seconds (realistic for a short trip).
    const MAX_STEPS = 40;
    let displayPoints = routePoints;
    if (routePoints.length > MAX_STEPS) {
      const stride = (routePoints.length - 1) / (MAX_STEPS - 1);
      displayPoints = Array.from({ length: MAX_STEPS }, (_, i) =>
        routePoints[Math.round(i * stride)]
      );
    }

    // ── Step 3: animate the marker along road points ─────────────────────────
    let stepIdx = 0;

    const interval = setInterval(() => {
      if (stepIdx >= displayPoints.length) {
        clearInterval(interval);
        setSimulationInterval(null);
        setIsSimulating(false);
        return;
      }

      const location = displayPoints[stepIdx];
      stepIdx++;

      setDriverLocation(location);

      if (socket) {
        socket.emit('updateLocation', { tripId: trip._id, location });
      }
    }, 2000); // emit every 2 seconds

    setSimulationInterval(interval);
  };

  const stopSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {trip.status === 'STARTED' ? '🚗 Trip In Progress' : '📍 Trip Overview'}
            </h3>
            {userRole === 'driver' && trip.status === 'STARTED' && (
              <p className="text-sm text-gray-600 mt-1">
                {isTracking ? (
                  <span className="text-green-600">✓ Location tracking active</span>
                ) : isSimulating ? (
                  <span className="text-blue-600">🔄 Simulating movement</span>
                ) : (
                  <span className="text-amber-600">⚠ Starting location tracking...</span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {userRole === 'driver' && trip.status === 'STARTED' && (
              <button
                onClick={isSimulating ? stopSimulation : startSimulation}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSimulating
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
              >
                {isSimulating ? '⏹ Stop Test' : '🧪 Test Location'}
              </button>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${trip.status === 'STARTED'
              ? 'bg-blue-100 text-blue-700'
              : trip.status === 'COMPLETED'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
              }`}>
              {trip.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* ── ETA Card (passengers only, when trip is active) ── */}
      {userRole === 'passenger' && trip.status === 'STARTED' && (
        <div className="px-0">
          <ETACard eta={eta} lastUpdated={etaLastUpdated} userRole={userRole} />
          {!eta && driverLocation && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Calculating ETA…
            </p>
          )}
          {!driverLocation && (
            <div
              style={{
                background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
                borderRadius: '16px',
                padding: '20px 24px',
                color: '#a0aec0',
                textAlign: 'center',
                fontSize: '14px',
              }}
            >
              ⏳ Waiting for driver location to calculate ETA…
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Live Route Map</h4>
        <MapView
          sourceLocation={trip.sourceLocation}
          destinationLocation={trip.destinationLocation}
          waypoints={passengerWaypoints}
          driverLocation={driverLocation}
          height="500px"
        />

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Start Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Destination</span>
          </div>
          {passengerWaypoints.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Passengers ({passengerWaypoints.length})</span>
            </div>
          )}
          {driverLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">Driver (Live)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

LiveTrackingMap.propTypes = {
  trip: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    sourceLocation: PropTypes.object,
    destinationLocation: PropTypes.object,
    rideRequests: PropTypes.array,
    status: PropTypes.string
  }).isRequired,
  userRole: PropTypes.string.isRequired
};

export default LiveTrackingMap;
