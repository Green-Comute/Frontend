import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Car, IndianRupee, MapPin } from 'lucide-react';
import PropTypes from 'prop-types';

const TripCard = ({ trip, onRequestRide, showRequestButton = false, showManageButton = false, requestedTripIds = [] }) => {
  const navigate = useNavigate();
  const [isRequesting, setIsRequesting] = useState(false);
  const isRequested = requestedTripIds.some(id => id?.toString() === trip._id?.toString());

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

  const statusConfig = {
    SCHEDULED: 'badge-info',
    IN_PROGRESS: 'badge-success',
    STARTED: 'badge-success',
    COMPLETED: 'badge-neutral',
    CANCELLED: 'badge-danger',
  };

  return (
    <article className="card p-5 flex flex-col">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-stone-900 truncate">
            <MapPin className="w-4 h-4 inline text-emerald-600 mr-1" aria-hidden="true" />
            {trip.source} → {trip.destination}
          </h3>
          <p className="text-sm text-stone-500 mt-0.5">
            Driver: {trip.driver?.name || 'Unknown'}
          </p>
        </div>
        <span className={`badge flex-shrink-0 ${statusConfig[trip.status] || 'badge-neutral'}`}>
          {trip.status}
        </span>
      </div>

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center text-sm text-stone-600 gap-2">
          <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" aria-hidden="true" />
          <span>{formatDate(trip.scheduledTime)}</span>
        </div>

        <div className="flex items-center text-sm text-stone-600 gap-2">
          <Car className="w-4 h-4 text-stone-400 flex-shrink-0" aria-hidden="true" />
          <span>{trip.vehicleType} · {trip.availableSeats} seat{trip.availableSeats !== 1 ? 's' : ''} available</span>
        </div>

        {trip.estimatedCost && (
          <div className="flex items-center text-sm text-stone-600 gap-2">
            <IndianRupee className="w-4 h-4 text-stone-400 flex-shrink-0" aria-hidden="true" />
            <span>₹{trip.estimatedCost}</span>
          </div>
        )}
      </div>

      {showRequestButton && (
        <button
          onClick={handleRequestRide}
          disabled={isRequesting || isRequested || trip.availableSeats === 0}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            isRequested
              ? 'bg-stone-100 text-stone-500 cursor-not-allowed'
              : trip.availableSeats === 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'btn-primary'
          }`}
          aria-label={
            isRequested ? 'Ride already requested'
              : trip.availableSeats === 0 ? 'No seats available'
              : `Request ride from ${trip.source} to ${trip.destination}`
          }
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
          className="btn-primary w-full text-sm"
        >
          {trip.status === 'STARTED' ? 'Track Trip' : 'Manage Trip'}
        </button>
      )}
    </article>
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
