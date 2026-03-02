import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import MapView from './MapView';

const LiveTripTracking = ({ tripId, userRole }) => {
  const [tripData, setTripData] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  // Fetch trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTripData(data.trip);
          
          // Set initial driver location if available
          if (data.trip.currentLocation) {
            setDriverLocation({
              lat: data.trip.currentLocation.coordinates[1],
              lng: data.trip.currentLocation.coordinates[0]
            });
          }
        } else {
          setError('Failed to load trip details');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    });

    // Join the trip room
    socketRef.current.emit('joinTrip', tripId);

    // Listen for driver location updates
    socketRef.current.on('driverLocationUpdate', (location) => {
      setDriverLocation({
        lat: location.coordinates[1],
        lng: location.coordinates[0]
      });
    });

    // Listen for trip status updates
    socketRef.current.on('tripStatusUpdate', (status) => {
      setTripData(prev => ({ ...prev, status }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveTrip', tripId);
        socketRef.current.disconnect();
      }
    };
  }, [tripId]);

  // For drivers: Send location updates
  useEffect(() => {
    if (userRole !== 'driver' || !tripData || tripData.status !== 'IN_PROGRESS') {
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    // Watch driver's position and send updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Update local state
        setDriverLocation(location);

        // Send to server via Socket.IO
        if (socketRef.current) {
          socketRef.current.emit('updateDriverLocation', {
            tripId,
            location: {
              type: 'Point',
              coordinates: [location.lng, location.lat]
            }
          });
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [userRole, tripData, tripId]);

  const startTrip = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${tripId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTripData(data.trip);
      }
    } catch {
      setError('Failed to start trip');
    }
  };

  const endTrip = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${tripId}/end`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTripData(data.trip);
      }
    } catch {
      setError('Failed to end trip');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!tripData) return null;

  // Get approved passengers and their locations
  const approvedPassengers = tripData.rides?.filter(r => r.status === 'APPROVED') || [];
  const passengerWaypoints = approvedPassengers
    .map(ride => {
      if (ride.passengerId?.homeAddress) {
        // You might want to geocode the address or use stored coordinates
        return null; // Placeholder - needs passenger pickup location
      }
      return null;
    })
    .filter(Boolean);

  const sourceLocation = tripData.sourceLocation ? {
    lat: tripData.sourceLocation.coordinates[1],
    lng: tripData.sourceLocation.coordinates[0],
    address: tripData.source
  } : null;

  const destinationLocation = tripData.destinationLocation ? {
    lat: tripData.destinationLocation.coordinates[1],
    lng: tripData.destinationLocation.coordinates[0],
    address: tripData.destination
  } : null;

  return (
    <div className="space-y-4">
      {/* Trip Status Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {tripData.status === 'SCHEDULED' && '🕐 Trip Scheduled'}
            {tripData.status === 'IN_PROGRESS' && '🚗 Trip In Progress'}
            {tripData.status === 'COMPLETED' && '✅ Trip Completed'}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            tripData.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
            tripData.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {tripData.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Departure:</span>
            <p className="font-medium">{new Date(tripData.scheduledTime).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-600">Passengers:</span>
            <p className="font-medium">{approvedPassengers.length} / {tripData.totalSeats}</p>
          </div>
        </div>

        {/* Driver Controls */}
        {userRole === 'driver' && (
          <div className="mt-4 flex space-x-2">
            {tripData.status === 'SCHEDULED' && (
              <button
                onClick={startTrip}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Trip
              </button>
            )}
            {tripData.status === 'IN_PROGRESS' && (
              <button
                onClick={endTrip}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Trip
              </button>
            )}
          </div>
        )}
      </div>

      {/* Live Map */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">
          {tripData.status === 'IN_PROGRESS' ? '📍 Live Tracking' : '🗺️ Route Map'}
        </h3>
        <MapView
          sourceLocation={sourceLocation}
          destinationLocation={destinationLocation}
          waypoints={passengerWaypoints}
          driverLocation={tripData.status === 'IN_PROGRESS' ? driverLocation : null}
          height="500px"
        />
        
        {tripData.status === 'IN_PROGRESS' && driverLocation && (
          <div className="mt-3 text-sm text-gray-600 flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Live tracking active - Driver location updates in real-time</span>
          </div>
        )}
      </div>

      {/* Passenger List */}
      {approvedPassengers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-3">👥 Passengers ({approvedPassengers.length})</h3>
          <div className="space-y-2">
            {approvedPassengers.map((ride, index) => (
              <div key={ride._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{ride.passengerId?.name || 'Passenger'}</p>
                    <p className="text-xs text-gray-600">{ride.passengerId?.email}</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium">✓ Confirmed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

LiveTripTracking.propTypes = {
  tripId: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
};

export default LiveTripTracking;
