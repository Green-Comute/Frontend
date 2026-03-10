import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { tripService } from '../../services/tripService';
import { ratingService } from '../../services/ratingService';
import { getUserFromToken } from '../../utils/jwt';

const STARS = [1, 2, 3, 4, 5];

const StarPicker = ({ value, onChange }) => (
    <div className="flex gap-2">
        {STARS.map((n) => (
            <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className="focus:outline-none"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
            >
                <Star
                    className={`w-8 h-8 transition-colors ${
                        n <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                    }`}
                />
            </button>
        ))}
    </div>
);

/**
 * Story 5.1 / 5.2 — Post-trip rating page.
 * Route: /trip/:tripId/rate
 * Determines whether the current user is the driver or a passenger
 * and shows the appropriate rating form.
 */
const RateTrip = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const currentUser = getUserFromToken();

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    // For drivers rating passengers, they need to pick which passenger to rate.
    const [targetPassengerId, setTargetPassengerId] = useState('');

    useEffect(() => {
        tripService
            .getTripById(tripId)
            .then((res) => {
                const t = res.data ?? res;
                setTrip(t);
                // Pre-select first passenger if driver
                if (t.passengers?.length === 1) {
                    setTargetPassengerId(t.passengers[0]?.userId ?? t.passengers[0]?._id ?? '');
                }
            })
            .catch(() => setError('Could not load trip details.'))
            .finally(() => setLoading(false));
    }, [tripId]);

    const isDriver =
        trip && currentUser && (trip.driverId === currentUser.userId || trip.driver === currentUser.userId);

    const passengers = trip?.passengers ?? [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (stars === 0) { setError('Please select a star rating.'); return; }
        if (isDriver && !targetPassengerId) { setError('Please select a passenger to rate.'); return; }

        setSubmitting(true);
        setError('');
        try {
            if (isDriver) {
                await ratingService.ratePassenger(tripId, targetPassengerId, stars, comment);
            } else {
                // targetUserId is the driver's userId — required by backend
                const driverUserId = trip.driverId ?? trip.driver?._id ?? trip.driver;
                await ratingService.rateDriver(tripId, driverUserId, stars, comment);
            }
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to submit rating.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-stone-500">Loading trip details…</div>;
    if (!trip) return <div className="p-8 text-red-500">{error || 'Trip not found.'}</div>;

    if (submitted) {
        return (
            <div className="max-w-lg mx-auto p-8 text-center">
                <div className="text-5xl mb-4">🌟</div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Thanks for your feedback!</h2>
                <p className="text-stone-500 mb-6">Your rating has been submitted. Ratings are revealed once both parties have reviewed.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6 md:p-8">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Rate Your Trip</h1>
            <p className="text-stone-500 text-sm mb-6">
                {isDriver ? 'Rate the passenger(s) on this trip.' : 'Rate your driver for this trip.'}
                {' '}Ratings are double-blind — visible only after both sides submit.
            </p>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
                {/* Driver rating a passenger: pick which passenger */}
                {isDriver && passengers.length > 1 && (
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Passenger</label>
                        <select
                            value={targetPassengerId}
                            onChange={(e) => setTargetPassengerId(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">-- Select passenger --</option>
                            {passengers.map((p) => {
                                const id = p.userId ?? p._id ?? p;
                                const name = p.name ?? p.email ?? id;
                                return <option key={id} value={id}>{name}</option>;
                            })}
                        </select>
                    </div>
                )}

                {/* Star picker */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Rating</label>
                    <StarPicker value={stars} onChange={setStars} />
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                        Comment <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Share your experience…"
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                        {submitting ? 'Submitting…' : 'Submit Rating'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition"
                    >
                        Skip
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RateTrip;
