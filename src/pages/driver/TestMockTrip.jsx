import { useEffect, useState } from 'react';
import LiveTrackingMap from '../../components/LiveTrackingMap';
import { useNavigate } from 'react-router-dom';

/**
 * Test page for debugging trip visualization with mock data
 */
const TestMockTrip = () => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMockTrip = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/mock/trip');
        const data = await response.json();
        
        if (data.success) {
          console.log('📦 Mock Trip Data:', data.trip);
          console.log('📍 Waypoints:', data.trip.waypoints);
          console.log('🚗 Rides:', data.trip.rides);
          setTrip(data.trip);
        } else {
          setError('Failed to load mock trip');
        }
      } catch (err) {
        console.error('Error fetching mock trip:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMockTrip();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mock trip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Mock Trip</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No trip data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🧪 Mock Trip Test Page</h1>
              <p className="text-gray-600 mt-1">Testing trip visualization with pre-configured data</p>
            </div>
            <button
              onClick={() => navigate('/driver/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Trip Info Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Trip Status</p>
              <p className="text-xl font-bold text-blue-900">{trip.status}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Passengers</p>
              <p className="text-xl font-bold text-green-900">{trip.rides?.length || 0}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Waypoints</p>
              <p className="text-xl font-bold text-purple-900">{trip.waypoints?.length || 0}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-600 font-medium">Optimized</p>
              <p className="text-xl font-bold text-amber-900">{trip.isOptimized ? '✓ Yes' : '✗ No'}</p>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">📍 Route Details</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                A
              </div>
              <div>
                <p className="font-medium text-gray-900">Source</p>
                <p className="text-sm text-gray-600">{trip.sourceLocation?.address}</p>
              </div>
            </div>

            {trip.waypoints && trip.waypoints.length > 0 && (
              <div className="ml-4 border-l-2 border-blue-300 pl-4 space-y-3">
                {trip.waypoints.map((wp, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {wp.order || index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{wp.passengerName}</p>
                      <p className="text-sm text-gray-600">{wp.address}</p>
                      {wp.distanceFromPrevious && (
                        <p className="text-xs text-gray-500 mt-1">
                          📏 +{wp.distanceFromPrevious} km from previous stop
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                B
              </div>
              <div>
                <p className="font-medium text-gray-900">Destination</p>
                <p className="text-sm text-gray-600">{trip.destinationLocation?.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Component */}
        <LiveTrackingMap
          trip={trip}
          userRole="driver"
          optimizedWaypoints={trip.waypoints || []}
        />

        {/* Debug Info */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-white mb-3">🐛 Debug Data (Check Console for Full Output)</h3>
          <details className="text-xs">
            <summary className="text-gray-300 cursor-pointer hover:text-white">
              Click to view raw trip data
            </summary>
            <pre className="mt-3 text-green-400 overflow-auto">
              {JSON.stringify(trip, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TestMockTrip;
