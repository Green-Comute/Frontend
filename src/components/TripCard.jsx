import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const TripCard = ({ trip, onRequestRide, showRequestButton = false, showManageButton = false, requestedTripIds = [] }) => {
  const navigate = useNavigate();
  const [isRequesting, setIsRequesting] = useState(false);
  const isRequested = requestedTripIds.includes(trip._id);

  const handleRequestRide = async () => {
    setIsRequesting(true);
    try {
      await onRequestRide(trip._id);
    } finally {
      setIsRequesting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {trip.source} → {trip.destination}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Driver: {trip.driver?.name || 'Unknown'}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
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

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {formatDate(trip.scheduledTime)}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
          {trip.vehicleType} • {trip.availableSeats} seat{trip.availableSeats !== 1 ? 's' : ''} available
        </div>

        {trip.estimatedCost && (
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ₹{trip.estimatedCost}
          </div>
        )}
      </div>

      {showRequestButton && (
        <button
          onClick={handleRequestRide}
          disabled={isRequesting || isRequested || trip.availableSeats === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isRequested
              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
              : trip.availableSeats === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRequesting
            ? 'Requesting...'
            : isRequested
            ? 'Already Requested'
            : trip.availableSeats === 0
            ? 'No Seats Available'
            : 'Request Ride'}
        </button>
      )}

      {showManageButton && (
        <button
          onClick={() => navigate(`/driver/trip/${trip._id}`)}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          {trip.status === 'STARTED' ? '🚗 Track Trip' : '📋 Manage Trip'}
        </button>
      )}
    </div>
  );
};

TripCard.propTypes = {
  trip: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
    scheduledTime: PropTypes.string.isRequired,
    vehicleType: PropTypes.string.isRequired,
  showManageButton: PropTypes.bool,
    availableSeats: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    estimatedCost: PropTypes.number,
    driver: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  onRequestRide: PropTypes.func,
  showRequestButton: PropTypes.bool,
  requestedTripIds: PropTypes.arrayOf(PropTypes.string),
};

export default TripCard;
