import { useState } from 'react';
import { MapPin, Clock, Check, X } from 'lucide-react';
import PropTypes from 'prop-types';

const RideRequestCard = ({ rideRequest, onDecision }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDecision = async (decision) => {
    setIsProcessing(true);
    try {
      await onDecision(rideRequest._id, decision);
    } finally {
      setIsProcessing(false);
    }
  };

  const statusBadge = {
    PENDING: 'badge-warning',
    APPROVED: 'badge-success',
    REJECTED: 'badge-danger',
  };

  return (
    <article className="card p-5">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-stone-900 truncate">
            {rideRequest.passengerId?.name || 'Unknown Passenger'}
          </h3>
          <p className="text-sm text-stone-500 mt-0.5 truncate">
            {rideRequest.passengerId?.email}
          </p>
        </div>
        <span className={`badge flex-shrink-0 ${statusBadge[rideRequest.status] || 'badge-neutral'}`}>
          {rideRequest.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-stone-600 gap-2">
          <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{rideRequest.tripId?.source} → {rideRequest.tripId?.destination}</span>
        </div>

        <div className="flex items-center text-sm text-stone-600 gap-2">
          <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" aria-hidden="true" />
          <span>Requested: {new Date(rideRequest.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {rideRequest.status === 'PENDING' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleDecision('APPROVED')}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            aria-label={`Approve ride request from ${rideRequest.passengerId?.name}`}
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => handleDecision('REJECTED')}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 active:bg-red-800 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            aria-label={`Reject ride request from ${rideRequest.passengerId?.name}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </article>
  );
};

RideRequestCard.propTypes = {
  rideRequest: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    passengerId: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    tripId: PropTypes.shape({
      source: PropTypes.string,
      destination: PropTypes.string,
    }),
  }).isRequired,
  onDecision: PropTypes.func.isRequired,
};

export default RideRequestCard;
