import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { rideService } from '../../services/rideService';
import { safetyService } from '../../services/safetyService';
import LiveTrackingMap from '../../components/LiveTrackingMap';
import TripSummary from '../../components/TripSummary';
import RoutePreview from '../../components/RoutePreview';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config/api.config';

const ActiveTrip = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [pickupLoading, setPickupLoading] = useState({});
  const [passengerCancelAlert, setPassengerCancelAlert] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // Get user from localStorage - try multiple keys
  const getUserData = () => {
    try {
      // Try 'user' key first
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== '{}') {
        return JSON.parse(userStr);
      }

      // Try decoding JWT token
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      }

      return {};
    } catch (err) {
      console.error('Error getting user data:', err);
      return {};
    }
  };

  const user = getUserData();

  const fetchTripDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripById(tripId);
      setTrip(data.trip);
      
      // Fetch optimized route if trip is scheduled/started and has approved passengers
      if ((data.trip.status === 'SCHEDULED' || data.trip.status === 'STARTED' || data.trip.status === 'IN_PROGRESS') && data.trip.isOptimized) {
        fetchOptimizedRoute();
      }
    } catch (err) {
      setError(err.message || 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  const fetchOptimizedRoute = useCallback(async () => {
    try {
      setRouteLoading(true);
      const routeData = await rideService.getOptimizedRoutePreview(tripId);
      setOptimizedRoute(routeData.route);
    } catch (err) {
      // Non-critical error - route optimization may not be available yet
      console.log('Route preview not available:', err.message);
      setOptimizedRoute(null);
    } finally {
      setRouteLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  // Socket connection: listen for passenger cancellations
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on('ride-cancelled-by-passenger', (data) => {
      setPassengerCancelAlert(data.message || 'A passenger has cancelled their ride.');
      // Auto-clear after 6 seconds
      setTimeout(() => setPassengerCancelAlert(null), 6000);
      // Refresh trip details to update passenger list
      fetchTripDetails();
    });

    return () => socket.disconnect();
  }, [fetchTripDetails]);

  const handleStartTrip = async () => {
    try {
      setActionLoading(true);
      setError('');
      await tripService.startTrip(tripId);
      await fetchTripDetails(); // Refresh trip data
    } catch (err) {
      setError(err.message || 'Failed to start trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!window.confirm('Are you sure you want to complete this trip?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await tripService.completeTrip(tripId);
      await fetchTripDetails(); // Refresh trip data

      // Show summary modal instead of redirecting immediately
      setShowSummary(true);
    } catch (err) {
      setError(err.message || 'Failed to complete trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    navigate('/driver/requests');
  };

  const handleCancelTrip = async () => {
    if (!window.confirm('Are you sure you want to cancel this trip? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await tripService.cancelTrip(tripId);

      // Redirect to driver dashboard
      setTimeout(() => {
        navigate('/driver/requests');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to cancel trip');
    } finally {
      setActionLoading(false);
    }
  };
  const handlePickup = async (rideId) => {
    try {
      setPickupLoading(prev => ({ ...prev, [rideId]: true }));
      setError('');
      await rideService.markAsPickedUp(rideId);
      await fetchTripDetails(); // Refresh trip data
    } catch (err) {
      setError(err.message || 'Failed to mark as picked up');
    } finally {
      setPickupLoading(prev => ({ ...prev, [rideId]: false }));
    }
  };

  const handleDropoff = async (rideId) => {
    try {
      setPickupLoading(prev => ({ ...prev, [rideId]: true }));
      setError('');
      await rideService.markAsDroppedOff(rideId);
      await fetchTripDetails(); // Refresh trip data
    } catch (err) {
      setError(err.message || 'Failed to mark as dropped off');
    } finally {
      setPickupLoading(prev => ({ ...prev, [rideId]: false }));
    }
  };

  const handleShareTrip = async () => {
    try {
      setShareLoading(true);
      const res = await safetyService.createShareLink(tripId);
      const url = res.trackingUrl ?? res.data?.trackingUrl ?? '';
      setShareLink(url);
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to generate share link');
    } finally {
      setShareLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto" style={{ width: 48, height: 48 }}></div>
          <p className="mt-4 text-stone-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Error Loading Trip</h2>
            <p className="text-stone-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/driver/requests')}
              className="btn-primary"
            >
              Back to Trips
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if current user is the driver
  const driverIdString = trip.driverId?._id?.toString() || trip.driverId?.toString();
  const userIdString = user.userId?.toString() || user.id?.toString();
  const isDriver = driverIdString === userIdString;

  console.log('Driver Check:', {
    driverIdString,
    userIdString,
    isDriver,
    tripStatus: trip.status,
    user
  });

  const approvedPassengers = (trip.rides || []).filter(ride => ride.status === 'APPROVED');

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Trip Details</h1>
            <p className="text-stone-600 mt-1">
              {trip.status === 'STARTED' ? 'Trip in progress' : `Trip ${trip.status.toLowerCase()}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/driver/requests')}
            className="btn-secondary text-sm"
          >
            ← Back to Trips
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Passenger cancelled alert */}
        {passengerCancelAlert && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start space-x-3">
            <span className="text-amber-500 text-xl">ℹ️</span>
            <div>
              <p className="font-semibold text-amber-800">Passenger Cancellation</p>
              <p className="text-amber-700 text-sm mt-1">{passengerCancelAlert}</p>
            </div>
          </div>
        )}

        {/* Trip Info Card */}
        <div className="card p-5 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-stone-900 mb-4">Route Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-stone-500">From:</span>
                  <p className="font-medium text-stone-900">{trip.source}</p>
                </div>
                <div>
                  <span className="text-sm text-stone-500">To:</span>
                  <p className="font-medium text-stone-900">{trip.destination}</p>
                </div>
                <div>
                  <span className="text-sm text-stone-500">Scheduled Time:</span>
                  <p className="font-medium text-stone-900">
                    {new Date(trip.scheduledTime).toLocaleString()}
                  </p>
                </div>
                {trip.actualStartTime && (
                  <div>
                    <span className="text-sm text-stone-500">Started At:</span>
                    <p className="font-medium text-stone-900">
                      {new Date(trip.actualStartTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-4">Trip Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-stone-500">Vehicle Type:</span>
                  <p className="font-medium text-stone-900">{trip.vehicleType}</p>
                </div>
                <div>
                  <span className="text-sm text-stone-500">Total Seats:</span>
                  <p className="font-medium text-stone-900">{trip.totalSeats}</p>
                </div>
                <div>
                  <span className="text-sm text-stone-500">Passengers:</span>
                  <p className="font-medium text-stone-900">
                    {approvedPassengers.length} / {trip.totalSeats}
                  </p>
                </div>

                {isDriver && trip.status === 'SCHEDULED' && (
                  <div className="pt-3">
                    <button
                      onClick={handleStartTrip}
                      disabled={actionLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <><span className="spinner" /> Starting...</> : 'Start Trip'}
                    </button>
                  </div>
                )}
                {isDriver && trip.status === 'STARTED' && (
                  <div className="pt-3">
                    <button
                      onClick={handleCompleteTrip}
                      disabled={actionLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <><span className="spinner" /> Completing...</> : 'Complete Trip'}
                    </button>
                  </div>
                )}
                {trip.status === 'COMPLETED' && (
                  <div className="pt-3">
                    <button
                      onClick={() => setShowSummary(true)}
                      className="btn-primary w-full"
                    >
                      View Trip Summary
                    </button>
                  </div>
                )}
                {isDriver && trip.status === 'SCHEDULED' && (
                  <div>
                    <button
                      onClick={handleCancelTrip}
                      disabled={actionLoading}
                      className="btn-danger w-full"
                    >
                      {actionLoading ? 'Cancelling...' : 'Cancel Trip'}
                    </button>
                  </div>
                )}
                {(trip.status === 'SCHEDULED' || trip.status === 'STARTED') && (
                  <div className="pt-1">
                    <button
                      onClick={handleShareTrip}
                      disabled={shareLoading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      {shareLoading ? 'Generating…' : shareCopied ? '✓ Link Copied!' : '🔗 Share Trip Link'}
                    </button>
                    {shareLink && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 break-all select-all">
                        {shareLink}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Optimized Route Preview - Show before trip starts */}
        {isDriver && trip.status === 'SCHEDULED' && optimizedRoute && (
          <div className="card p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-stone-900">Optimized Route Preview</h3>
                <p className="text-sm text-stone-600 mt-1">
                  Review the optimized pickup sequence for your passengers
                </p>
              </div>
              <div className="badge-success">
                Route Optimized
              </div>
            </div>
            
            <RoutePreview 
              source={{
                lat: optimizedRoute.source.coordinates?.[1],
                lng: optimizedRoute.source.coordinates?.[0],
                address: optimizedRoute.source.address
              }}
              destination={{
                lat: optimizedRoute.destination.coordinates?.[1],
                lng: optimizedRoute.destination.coordinates?.[0],
                address: optimizedRoute.destination.address
              }}
              waypoints={optimizedRoute.waypoints || []}
              totalDistance={optimizedRoute.totalDistance}
              estimatedDuration={optimizedRoute.estimatedDuration}
              isOptimized={optimizedRoute.isOptimized}
            />
            
            <div className="mt-4 pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-stone-500">Total Distance:</span>
                <p className="font-medium text-stone-900">{optimizedRoute.totalDistance?.toFixed(2)} km</p>
              </div>
              <div>
                <span className="text-stone-500">Estimated Duration:</span>
                <p className="font-medium text-stone-900">{optimizedRoute.estimatedDuration?.toFixed(0)} minutes</p>
              </div>
            </div>
          </div>
        )}

        {/* Show message if no optimized route yet */}
        {isDriver && trip.status === 'SCHEDULED' && approvedPassengers.length > 0 && !optimizedRoute && !routeLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              ℹ️ Route will be optimized automatically when you approve more passengers. 
              Start the trip to see passenger pickup locations.
            </p>
          </div>
        )}

        {/* Passengers List */}
        {approvedPassengers.length > 0 && (
          <div className="card p-5 sm:p-6 mb-6">
            <h3 className="font-semibold text-stone-900 mb-4">
              Passengers ({approvedPassengers.length})
            </h3>
            <div className="space-y-3">
              {approvedPassengers.map((ride) => (
                <div key={ride._id} className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ride.pickupStatus === 'DROPPED_OFF'
                        ? 'bg-stone-100'
                        : ride.pickupStatus === 'PICKED_UP'
                          ? 'bg-emerald-100'
                          : 'bg-blue-100'
                        }`}>
                        <span className={`font-semibold ${ride.pickupStatus === 'DROPPED_OFF'
                          ? 'text-stone-700'
                          : ride.pickupStatus === 'PICKED_UP'
                            ? 'text-emerald-700'
                            : 'text-blue-700'
                          }`}>
                          {(ride.passengerId?.name || 'P')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-stone-900">
                            {ride.passengerId?.name || 'Passenger'}
                          </p>
                          <span className={ride.pickupStatus === 'DROPPED_OFF'
                            ? 'badge-neutral'
                            : ride.pickupStatus === 'PICKED_UP'
                              ? 'badge-success'
                              : 'badge-warning'
                            }>
                            {ride.pickupStatus === 'DROPPED_OFF' ? 'Dropped Off' :
                              ride.pickupStatus === 'PICKED_UP' ? 'On Board' :
                                'Waiting'}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600">
                          {ride.passengerId?.email || 'No email'}
                        </p>
                        {ride.passengerId?.phone && (
                          <p className="text-sm text-stone-600">
                            {ride.passengerId.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pickup/Dropoff Buttons */}
                    {isDriver && trip.status === 'STARTED' && (
                      <div className="ml-3 flex flex-col space-y-2">
                        {ride.pickupStatus === 'WAITING' && (
                          <button
                            onClick={() => handlePickup(ride._id)}
                            disabled={pickupLoading[ride._id]}
                            className="btn-primary px-3 py-1 text-sm whitespace-nowrap"
                          >
                            {pickupLoading[ride._id] ? '...' : '✓ Pick Up'}
                          </button>
                        )}
                        {ride.pickupStatus === 'PICKED_UP' && (
                          <button
                            onClick={() => handleDropoff(ride._id)}
                            disabled={pickupLoading[ride._id]}
                            className="btn-primary px-3 py-1 text-sm whitespace-nowrap"
                          >
                            {pickupLoading[ride._id] ? '...' : '✓ Drop Off'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route Info - Show during active trip */}
        {isDriver && (trip.status === 'STARTED' || trip.status === 'IN_PROGRESS') && trip.waypoints && trip.waypoints.length > 0 && (
          <div className="card p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-stone-900">Pickup Sequence</h3>
                <p className="text-sm text-stone-600 mt-1">
                  Follow the optimized route to pick up passengers
                </p>
              </div>
              <div className="badge-info">
                {trip.waypoints.length} {trip.waypoints.length === 1 ? 'Stop' : 'Stops'}
              </div>
            </div>
            
            <div className="space-y-2">
              {trip.waypoints.map((waypoint, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-stone-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {waypoint.order || index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900">{waypoint.passengerName || 'Passenger'}</p>
                    <p className="text-sm text-stone-600 truncate">{waypoint.address}</p>
                  </div>
                  {waypoint.distanceFromPrevious && (
                    <div className="text-xs text-stone-500 flex-shrink-0">
                      +{waypoint.distanceFromPrevious.toFixed(1)} km
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Tracking Map */}
        <LiveTrackingMap
          trip={trip}
          userRole={isDriver ? 'driver' : 'passenger'}
          optimizedWaypoints={trip.waypoints || []}
        />
      </div>

      {/* Trip Summary Modal */}
      {showSummary && (
        <TripSummary
          tripId={tripId}
          onClose={handleCloseSummary}
        />
      )}
    </div>
  );
};

export default ActiveTrip;
