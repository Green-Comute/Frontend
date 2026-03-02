import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for source and destination
const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const passengerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map bounds when markers change
const MapBounds = ({ sourceLocation, destinationLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (sourceLocation && destinationLocation) {
      const bounds = L.latLngBounds(
        [sourceLocation.lat, sourceLocation.lng],
        [destinationLocation.lat, destinationLocation.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (sourceLocation) {
      map.setView([sourceLocation.lat, sourceLocation.lng], 13);
    } else if (destinationLocation) {
      map.setView([destinationLocation.lat, destinationLocation.lng], 13);
    }
  }, [sourceLocation, destinationLocation, map]);

  return null;
};

MapBounds.propTypes = {
  sourceLocation: PropTypes.object,
  destinationLocation: PropTypes.object,
};

// Hook to fetch and display route from OSRM
const RouteLayer = ({ sourceLocation, destinationLocation, waypoints = [] }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!sourceLocation || !destinationLocation) return;

      try {
        // Build coordinates string: source, waypoints, destination
        const coords = [
          `${sourceLocation.lng},${sourceLocation.lat}`,
          ...waypoints.map(wp => `${wp.lng},${wp.lat}`),
          `${destinationLocation.lng},${destinationLocation.lat}`
        ].join(';');

        // Use OSRM API for routing (free, open-source)
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            // Convert [lng, lat] to [lat, lng] for Leaflet
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRouteCoordinates(coordinates);
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to straight line
        setRouteCoordinates([
          [sourceLocation.lat, sourceLocation.lng],
          ...waypoints.map(wp => [wp.lat, wp.lng]),
          [destinationLocation.lat, destinationLocation.lng]
        ]);
      }
    };

    fetchRoute();
  }, [sourceLocation, destinationLocation, waypoints]);

  if (routeCoordinates.length === 0) return null;

  return (
    <>
      <Polyline
        positions={routeCoordinates}
        color="#3B82F6"
        weight={5}
        opacity={0.8}
      />
    </>
  );
};

RouteLayer.propTypes = {
  sourceLocation: PropTypes.object,
  destinationLocation: PropTypes.object,
  waypoints: PropTypes.array,
};

const MapView = ({ 
  sourceLocation, 
  destinationLocation, 
  waypoints = [], 
  driverLocation = null,
  height = '400px', 
  className = '' 
}) => {
  // Validate location has valid coordinates
  const isValidLocation = (loc) => {
    return loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && 
           !isNaN(loc.lat) && !isNaN(loc.lng);
  };

  const validSource = isValidLocation(sourceLocation) ? sourceLocation : null;
  const validDestination = isValidLocation(destinationLocation) ? destinationLocation : null;
  const validDriverLocation = isValidLocation(driverLocation) ? driverLocation : null;
  const validWaypoints = waypoints.filter(isValidLocation);

  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Calculate center and zoom based on available locations
  let center = defaultCenter;
  let zoom = defaultZoom;

  // Calculate bounds to include all points
  const allPoints = [
    validSource,
    validDestination,
    validDriverLocation,
    ...validWaypoints
  ].filter(Boolean);

  if (allPoints.length > 0) {
    if (allPoints.length === 1) {
      center = [allPoints[0].lat, allPoints[0].lng];
      zoom = 13;
    } else {
      // Calculate center of all points
      const avgLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
      const avgLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;
      center = [avgLat, avgLng];
      zoom = 10;
    }
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-md ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Source Marker */}
        {validSource && (
          <Marker
            position={[validSource.lat, validSource.lng]}
            icon={sourceIcon}
          >
            <Popup>
              <div className="font-semibold text-green-700">Pickup Location</div>
              <div className="text-sm text-gray-600">{validSource.address}</div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {validDestination && (
          <Marker
            position={[validDestination.lat, validDestination.lng]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="font-semibold text-red-700">Drop-off Location</div>
              <div className="text-sm text-gray-600">{validDestination.address}</div>
            </Popup>
          </Marker>
        )}

        {/* Passenger Waypoint Markers */}
        {validWaypoints.map((waypoint, index) => (
          <Marker
            key={`waypoint-${index}`}
            position={[waypoint.lat, waypoint.lng]}
            icon={passengerIcon}
          >
            <Popup>
              <div className="font-semibold text-blue-700">
                Passenger Pickup {index + 1}
              </div>
              <div className="text-sm text-gray-600">
                {waypoint.name || waypoint.address}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Driver Location Marker (for live tracking) */}
        {validDriverLocation && (
          <Marker
            position={[validDriverLocation.lat, validDriverLocation.lng]}
            icon={driverIcon}
          >
            <Popup>
              <div className="font-semibold text-yellow-700">Driver Location</div>
              <div className="text-sm text-gray-600">Current position</div>
            </Popup>
          </Marker>
        )}

        {/* Route Line using OSRM routing */}
        {validSource && validDestination && (
          <RouteLayer
            sourceLocation={validSource}
            destinationLocation={validDestination}
            waypoints={validWaypoints}
          />
        )}

        {/* Auto-adjust bounds */}
        <MapBounds 
          sourceLocation={validSource} 
          destinationLocation={validDestination} 
        />
      </MapContainer>
    </div>
  );
};

MapView.propTypes = {
  sourceLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    address: PropTypes.string
  }),
  destinationLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    address: PropTypes.string
  }),
  waypoints: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      address: PropTypes.string
    })
  ),
  driverLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  height: PropTypes.string,
  className: PropTypes.string,
};

export default MapView;
