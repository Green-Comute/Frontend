import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { rideService } from '../../services/rideService';
import RideRequestCard from '../../components/RideRequestCard';
import { io } from 'socket.io-client';

const RideRequests = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch driver's trips
  useEffect(() => {
    fetchDriverTrips();
  }, []);

  // Fetch ride requests when a trip is selected
  useEffect(() => {
    if (selectedTrip) {
      fetchRideRequests(selectedTrip._id);
    }
  }, [selectedTrip]);

  // Setup socket for real-time ride request notifications
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const socket = io('http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to socket for ride requests');
    });

    // Listen for new ride requests
    socket.on('new-ride-request', (data) => {
      console.log('New ride request received:', data);
      // Refresh trips and ride requests
      fetchDriverTrips();
      if (selectedTrip) {
        fetchRideRequests(selectedTrip._id);
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedTrip]);

  const fetchDriverTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getDriverTrips();
      setTrips(data.trips || []);
      
      // Auto-select first trip if available
      if (data.trips && data.trips.length > 0) {
        setSelectedTrip(data.trips[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchRideRequests = async (tripId) => {
    try {
      const data = await rideService.getRideRequests(tripId);
      setRideRequests(data.rides || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch ride requests');
    }
  };

  const handleDecision = async (rideId, decision) => {
    try {
      setError('');
      setSuccessMessage('');
      
      await rideService.decideRideRequest(rideId, decision);
      
      setSuccessMessage(`Ride request ${decision.toLowerCase()} successfully!`);
      
      // Refresh ride requests and trips
      if (selectedTrip) {
        await fetchRideRequests(selectedTrip._id);
        await fetchDriverTrips();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to process ride request');
    }
  };

  // Trip status management functions - Required for driver to control trip lifecycle
  // TODO: Wire these up to UI buttons in the trip cards
  // eslint-disable-next-line no-unused-vars
  const handleStartTrip = async (tripId) => {
    try {
      setError('');
      setSuccessMessage('');
      
      await tripService.startTrip(tripId);
      setSuccessMessage('Trip started successfully!');
      
      // Refresh trips
      await fetchDriverTrips();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to start trip');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleEndTrip = async (tripId) => {
    try {
      setError('');
      setSuccessMessage('');
      
      await tripService.endTrip(tripId);
      setSuccessMessage('Trip ended successfully!');
      
      // Refresh trips
      await fetchDriverTrips();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to end trip');
    }
  };

  // Helper functions to determine if trip status actions are available
  // eslint-disable-next-line no-unused-vars
  const canStartTrip = (trip) => {
    return trip.status === 'SCHEDULED';
  };

  // eslint-disable-next-line no-unused-vars
  const canEndTrip = (trip) => {
    return trip.status === 'IN_PROGRESS';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ride Requests</h1>
            <p className="text-gray-600 mt-1">Manage your trips and ride requests</p>
          </div>
          <button
            onClick={() => navigate('/driver/create-trip')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            + Create New Trip
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h2>
            <p className="text-gray-600 mb-6">Create your first trip to start receiving ride requests</p>
            <button
              onClick={() => navigate('/driver/create-trip')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trips List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Trips</h2>
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <div
                      key={trip._id}
                      onClick={() => setSelectedTrip(trip)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTrip?._id === trip._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {trip.source} → {trip.destination}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            trip.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : trip.status === 'IN_PROGRESS'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(trip.scheduledTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {trip.vehicleType} • {trip.availableSeats}/{trip.totalSeats} seats
                      </p>

                      {/* Trip Control Buttons */}
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/driver/trip/${trip._id}`);
                          }}
                          className="w-full py-2 px-3 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          {trip.status === 'STARTED' ? '🚗 Track Trip' : '📋 Manage Trip'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ride Requests */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ride Requests
                  {selectedTrip && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      for {selectedTrip.source} → {selectedTrip.destination}
                    </span>
                  )}
                </h2>

                {!selectedTrip ? (
                  <p className="text-gray-600">Select a trip to view ride requests</p>
                ) : rideRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ride requests yet</h3>
                    <p className="text-gray-600">Passengers will see your trip and can request to join</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rideRequests.map((request) => (
                      <RideRequestCard
                        key={request._id}
                        rideRequest={request}
                        onDecision={handleDecision}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideRequests;
