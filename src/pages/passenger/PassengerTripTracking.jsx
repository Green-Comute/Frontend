import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rideService } from '../../services/rideService';
import { tripService } from '../../services/tripService';
import { safetyService } from '../../services/safetyService';
import LiveTrackingMap from '../../components/LiveTrackingMap';
import TripSummary from '../../components/TripSummary';
import { io } from 'socket.io-client';
import calculateETA from '../../services/etaService';

const PassengerTripTracking = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eta, setEta] = useState(null);
  const [etaLastUpdated, setEtaLastUpdated] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [tripCancelledAlert, setTripCancelledAlert] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const tripRef = useRef(null);
  const rideRef = useRef(null);

  // Keep tripRef and rideRef in sync so socket handler always has fresh data
  useEffect(() => { tripRef.current = trip; }, [trip]);
  useEffect(() => { rideRef.current = ride; }, [ride]);

  const fetchRideDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Get passenger's rides and find this one
      const data = await rideService.getPassengerRides();
      const currentRide = data.rides.find(r => r._id === rideId);

      if (!currentRide) {
        setError('Ride not found');
        return;
      }

      setRide(currentRide);

      // Fetch full trip details
      if (currentRide.tripId?._id) {
        const tripData = await tripService.getTripById(currentRide.tripId._id);
        setTrip(tripData.trip);
      }
    } catch (err) {
      setError(err.message || 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    fetchRideDetails();
  }, [rideId, fetchRideDetails]);

  // Setup socket connection for real-time updates
  useEffect(() => {
    if (!ride) return;

    const token = localStorage.getItem('authToken');
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to tracking socket');
      newSocket.emit('joinTrip', ride.tripId._id);
    });

    newSocket.on('locationUpdate', async (data) => {
      if (data.tripId !== ride.tripId._id) return;

      // Stop ETA updates if passenger is dropped off (use ref for fresh state)
      const currentRide = rideRef.current;
      if (currentRide?.pickupStatus === 'DROPPED_OFF') return;

      // Use server-computed ETA if available
      if (data.eta) {
        setEta(data.eta);
        setEtaLastUpdated(Date.now());
        return;
      }

      // Fallback: compute ETA on client from driver location + trip destination
      const currentTrip = tripRef.current;
      if (!currentTrip?.destinationLocation) return;
      const dl = currentTrip.destinationLocation;
      const dest =
        typeof dl.lat === 'number'
          ? { lat: dl.lat, lng: dl.lng }
          : dl.coordinates?.coordinates?.length === 2
            ? { lat: dl.coordinates.coordinates[1], lng: dl.coordinates.coordinates[0] }
            : null;
      if (!dest) return;
      const driverLoc = { lat: data.location.lat, lng: data.location.lng };
      const result = await calculateETA(driverLoc, dest);
      if (result) {
        setEta(result);
        setEtaLastUpdated(Date.now());
      }
    });

    newSocket.on('pickup-status-update', (data) => {
      if (data.rideId === rideId) {
        // Show trip summary when passenger is dropped off
        if (data.pickupStatus === 'DROPPED_OFF') {
          setShowSummary(true);
        }
        setRide(prev => ({
          ...prev,
          pickupStatus: data.pickupStatus
        }));
      }
    });

    newSocket.on('tripStatusUpdate', (data) => {
      if (data.tripId === ride.tripId._id) {
        setTrip(prev => ({ ...prev, status: data.status }));
        // Clear ETA when trip is no longer active
        if (data.status !== 'STARTED') {
          setEta(null);
        }
      }
    });

    // Listen for driver-cancelled trip notifications
    newSocket.on('trip-cancelled', (data) => {
      if (data.tripId === ride.tripId._id || data.rideId === rideId) {
        setTrip(prev => prev ? { ...prev, status: 'CANCELLED' } : prev);
        setTripCancelledAlert(data.message || 'Your trip has been cancelled by the driver');
        setEta(null);
      }
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leaveTrip', ride.tripId._id);
        newSocket.disconnect();
      }
    };
  }, [ride, rideId]);

  const handleShareTrip = async () => {
    try {
      setShareLoading(true);
      const res = await safetyService.createShareLink(trip._id);
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

  const handleCancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel your ride? This action cannot be undone.')) {
      return;
    }
    try {
      setCancelLoading(true);
      setError('');
      await rideService.cancelRide(rideId);
      setCancelSuccess(true);
      // Update local ride state
      setRide(prev => ({ ...prev, status: 'REJECTED' }));
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.message || 'Failed to cancel ride');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!ride || !trip) return { text: 'Unknown', color: 'gray', icon: '❓' };

    // Trip not started yet
    if (trip.status === 'SCHEDULED') {
      return {
        text: 'Trip Scheduled',
        color: 'blue',
        icon: '📅',
        message: 'Waiting for driver to start the trip'
      };
    }

    // Trip started
    if (trip.status === 'STARTED') {
      if (ride.pickupStatus === 'DROPPED_OFF') {
        return {
          text: 'Dropped Off',
          color: 'gray',
          icon: '✓',
          message: 'You have reached your destination'
        };
      } else if (ride.pickupStatus === 'PICKED_UP') {
        return {
          text: 'On Board',
          color: 'green',
          icon: '🚗',
          message: 'You are on the way to your destination'
        };
      } else {
        return {
          text: 'Driver On the Way',
          color: 'amber',
          icon: '⏳',
          message: 'Driver is coming to pick you up'
        };
      }
    }

    // Trip completed
    if (trip.status === 'COMPLETED') {
      return {
        text: 'Trip Completed',
        color: 'green',
        icon: '✓',
        message: 'Thank you for riding with us!'
      };
    }

    // Trip cancelled
    if (trip.status === 'CANCELLED') {
      return {
        text: 'Trip Cancelled',
        color: 'red',
        icon: '✕',
        message: 'This trip has been cancelled'
      };
    }

    return { text: trip.status, color: 'gray', icon: '❓', message: '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !ride || !trip) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Error Loading Trip</h2>
            <p className="text-stone-600 mb-6">{error || 'Ride not found'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  // Show trip summary when dropped off or trip completed
  if (showSummary || trip.status === 'COMPLETED') {
    return (
      <TripSummary
        tripId={trip._id}
        onClose={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Track Your Ride</h1>
            <p className="text-stone-600 mt-1">Real-time trip status and location</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            ← Back
          </button>
        </div>

        {/* Driver-cancelled alert banner */}
        {tripCancelledAlert && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3" role="alert">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            <div>
              <p className="font-semibold text-red-700">Trip Cancelled by Driver</p>
              <p className="text-red-600 text-sm mt-1">{tripCancelledAlert}</p>
              <p className="text-red-500 text-xs mt-1">Redirecting to dashboard shortly…</p>
            </div>
          </div>
        )}

        {/* Passenger cancel success banner */}
        {cancelSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3" role="status">
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            <div>
              <p className="font-semibold text-emerald-700">Ride Cancelled Successfully</p>
              <p className="text-emerald-600 text-sm">Redirecting to dashboard…</p>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="card p-6 mb-6">
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-2 text-${statusInfo.color}-700`}>
              {statusInfo.text}
            </h2>
            <p className="text-stone-600 text-lg">{statusInfo.message}</p>

            {/* ── Inline ETA badge (only when trip is active, not dropped off, and we have data) ── */}
            {trip.status === 'STARTED' && ride.pickupStatus !== 'DROPPED_OFF' && eta && (
              <div className="mt-5 inline-flex items-center gap-4 bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl px-6 py-3.5 text-white shadow-lg">
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400">Arrives in</div>
                  <div className="text-2xl font-extrabold text-emerald-400 leading-none">
                    {eta.etaText}
                  </div>
                  {eta.fallback && (
                    <div className="text-[10px] text-stone-500">≈ estimated</div>
                  )}
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400">Remaining</div>
                  <div className="text-xl font-bold text-emerald-300 leading-none">
                    {eta.distanceText}
                  </div>
                </div>
                {etaLastUpdated && (
                  <div className="text-[10px] text-stone-500 ml-1 self-end">
                    · refreshes 60s
                  </div>
                )}
              </div>
            )}

            {/* Waiting for ETA */}
            {trip.status === 'STARTED' && ride.pickupStatus !== 'DROPPED_OFF' && !eta && (
              <div className="mt-4 inline-flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-500 text-sm">
                <div className="animate-pulse-dot" />
                Calculating ETA — waiting for driver location…
              </div>
            )}
          </div>
        </div>

        {/* Trip Details Card */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-stone-900 mb-4 text-lg">Trip Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-3">Route</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1 shrink-0"></div>
                  <div>
                    <div className="text-sm text-stone-500">Pickup</div>
                    <div className="font-medium text-stone-900">{trip.source}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1 shrink-0"></div>
                  <div>
                    <div className="text-sm text-stone-500">Destination</div>
                    <div className="font-medium text-stone-900">{trip.destination}</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-3">Driver & Vehicle</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-stone-500">Driver:</span>
                  <p className="font-medium text-stone-900">
                    {trip.driverId?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-stone-500">Vehicle:</span>
                  <p className="font-medium text-stone-900">{trip.vehicleType}</p>
                </div>
                <div>
                  <span className="text-sm text-stone-500">Scheduled:</span>
                  <p className="font-medium text-stone-900">
                    {new Date(trip.scheduledTime).toLocaleString()}
                  </p>
                </div>
                {trip.actualStartTime && (
                  <div>
                    <span className="text-sm text-stone-500">Started at:</span>
                    <p className="font-medium text-stone-900">
                      {new Date(trip.actualStartTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Map */}
        {trip.status === 'STARTED' && ride.pickupStatus !== 'DROPPED_OFF' && (
          <div className="mb-6">
            <LiveTrackingMap trip={trip} userRole="passenger" />
          </div>
        )}

        {/* Share trip link — visible while trip is active */}
        {trip.status === 'STARTED' && ride.pickupStatus !== 'DROPPED_OFF' && (
          <div className="card p-4 mb-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900 text-sm">Share your trip</p>
                <p className="text-xs text-stone-500">Let someone track this ride in real time</p>
              </div>
              <button
                onClick={handleShareTrip}
                disabled={shareLoading}
                className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {shareLoading ? 'Generating…' : shareCopied ? '✓ Copied!' : 'Share Link'}
              </button>
            </div>
            {shareLink && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 break-all select-all">
                {shareLink}
              </div>
            )}
          </div>
        )}

        {/* Passenger Cancel Ride – only when trip is SCHEDULED and ride is cancellable */}
        {trip.status === 'SCHEDULED' &&
          (ride.status === 'PENDING' || ride.status === 'APPROVED') &&
          !cancelSuccess && (
            <div className="card p-6 mt-6 border-red-100">
              <h3 className="font-semibold text-stone-900 mb-2">Need to cancel?</h3>
              <p className="text-sm text-stone-600 mb-4">
                You can cancel your ride request while the trip has not yet started.
                {ride.status === 'APPROVED' && (
                  <span className="ml-1 text-amber-600 font-medium">
                    Your approved seat will be freed for other passengers.
                  </span>
                )}
              </p>
              {error && (
                <p className="text-sm text-red-600 mb-3">{error}</p>
              )}
              <button
                id="passenger-cancel-ride-btn"
                onClick={handleCancelRide}
                disabled={cancelLoading}
                className="btn-danger text-sm"
              >
                {cancelLoading ? 'Cancelling…' : 'Cancel My Ride'}
              </button>
            </div>
          )}

        {/* Timeline for pickup status */}
        {trip.status === 'STARTED' && (
          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-stone-900 mb-4">Journey Progress</h3>
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${ride.pickupStatus !== 'WAITING' ? 'text-emerald-600' : 'text-stone-400'
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ride.pickupStatus !== 'WAITING' ? 'bg-emerald-100' : 'bg-stone-100'
                  }`}>
                  ✓
                </div>
                <p className="text-sm mt-2 font-medium">Picked Up</p>
              </div>
              <div className="flex-1 h-1 mx-4 bg-stone-200">
                <div className={`h-full transition-all duration-500 ${ride.pickupStatus === 'PICKED_UP' || ride.pickupStatus === 'DROPPED_OFF'
                  ? 'bg-emerald-500'
                  : 'bg-stone-200'
                  }`} style={{ width: ride.pickupStatus === 'PICKED_UP' ? '50%' : ride.pickupStatus === 'DROPPED_OFF' ? '100%' : '0%' }}></div>
              </div>
              <div className={`flex flex-col items-center ${ride.pickupStatus === 'DROPPED_OFF' ? 'text-emerald-600' : 'text-stone-400'
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ride.pickupStatus === 'DROPPED_OFF' ? 'bg-emerald-100' : 'bg-stone-100'
                  }`}>
                  ✓
                </div>
                <p className="text-sm mt-2 font-medium">Dropped Off</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerTripTracking;
