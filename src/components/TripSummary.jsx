import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { tripService } from '../services/tripService';

/**
 * TripSummary Component
 * 
 * @description Displays comprehensive trip summary after completion including
 * route details, timing metrics, passenger information, and statistics.
 * 
 * @param {Object} props
 * @param {string} props.tripId - MongoDB ObjectId of the trip
 * @param {Function} props.onClose - Callback when summary is closed
 */
const TripSummary = ({ tripId, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await tripService.getTripSummary(tripId);
        setSummary(data.summary);
      } catch (err) {
        setError(err.message || 'Failed to load trip summary');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchSummary();
    }
  }, [tripId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trip summary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Failed to load summary'}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'STARTED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPickupStatusBadge = (status) => {
    switch (status) {
      case 'DROPPED_OFF': return 'bg-green-100 text-green-700';
      case 'PICKED_UP': return 'bg-blue-100 text-blue-700';
      case 'WAITING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🎉 Trip Summary</h2>
              <p className="text-blue-100 mt-1">
                {summary.route.source} → {summary.route.destination}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(summary.status)} bg-white`}>
              {summary.status}
            </span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Duration Card */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">⏱️</div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-xl font-bold text-gray-900">
                    {summary.timing.durationFormatted || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Distance Card */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">📍</div>
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-xl font-bold text-gray-900">
                    {summary.route.estimatedDistance}
                  </p>
                </div>
              </div>
            </div>

            {/* Passengers Card */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">👥</div>
                <div>
                  <p className="text-sm text-gray-600">Passengers</p>
                  <p className="text-xl font-bold text-gray-900">
                    {summary.passengers.total} / {summary.vehicle.totalSeats}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-xl mr-2">🗺️</span>
              Route Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-green-600 font-bold mr-2">🟢</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Pickup Point</p>
                  <p className="font-medium text-gray-900">{summary.route.sourceAddress}</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 font-bold mr-2">🔴</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Drop Point</p>
                  <p className="font-medium text-gray-900">{summary.route.destinationAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timing Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-xl mr-2">🕐</span>
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-medium text-gray-900">{formatDate(summary.timing.scheduledTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Started</span>
                <span className="font-medium text-gray-900">{formatDate(summary.timing.actualStartTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-gray-900">{formatDate(summary.timing.actualEndTime)}</span>
              </div>
              {summary.timing.delayFormatted && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Delay</span>
                  <span className={`font-medium ${summary.timing.delayMinutes >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {summary.timing.delayFormatted}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Driver Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-xl mr-2">👤</span>
              Driver Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name</span>
                <span className="font-medium text-gray-900">{summary.driver.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-medium text-gray-900">{summary.vehicle.type}</span>
              </div>
              {summary.driver.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact</span>
                  <span className="font-medium text-gray-900">{summary.driver.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Passengers List */}
          {summary.passengers.total > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-xl mr-2">👥</span>
                Passengers ({summary.passengers.total})
              </h3>
              <div className="space-y-3">
                {summary.passengers.list.map((passenger, index) => (
                  <div key={passenger.passengerId} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{index + 1}. {passenger.name}</p>
                        <p className="text-sm text-gray-600">{passenger.pickupAddress}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPickupStatusBadge(passenger.pickupStatus)}`}>
                        {passenger.pickupStatus.replace('_', ' ')}
                      </span>
                    </div>
                    {passenger.pickedUpAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Picked up: {formatDate(passenger.pickedUpAt)}
                        {passenger.droppedOffAt && ` • Dropped: ${formatDate(passenger.droppedOffAt)}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Picked Up</p>
                  <p className="text-lg font-bold text-blue-600">{summary.passengers.pickedUp}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Dropped Off</p>
                  <p className="text-lg font-bold text-green-600">{summary.passengers.droppedOff}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cost Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Estimated Trip Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{summary.cost.estimated}
                </p>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

TripSummary.propTypes = {
  tripId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TripSummary;
