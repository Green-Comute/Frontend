import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Story 4.3 — Points history breakdown
 * Paginated, sorted newest-first. EARN = green, SPEND = red.
 */
const PointsHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState({ ledger: [], page: 1, totalPages: 1, totalItems: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await gamificationService.getHistory(page);
                setHistory(data.data);
            } catch (err) {
                setError(err.message || 'Failed to load history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [page]);

    const reasonLabel = {
        RIDE_AS_PASSENGER: 'Completed a ride',
        DRIVE_TRIP: 'Drove a trip',
        BONUS_EARLY_BOOKING: 'Early booking bonus',
        BONUS_PEAK_HOUR: 'Peak hour bonus',
        REDEMPTION_SPEND: 'Redeemed a reward',
        REDEMPTION_REFUND: 'Reward refunded',
    };

    return (
        <div className="min-h-screen bg-stone-50 p-6 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">Points History</h1>
                        <p className="text-sm text-stone-500">
                            {history.totalItems} total transactions
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-stone-500">
                        Loading your history...
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>
                ) : history.ledger.length === 0 ? (
                    <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
                        <TrendingUp className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <p className="text-stone-500">No points history yet. Complete a ride to start earning!</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead className="bg-stone-50">
                                <tr className="border-b">
                                    <th className="text-left p-4 text-sm font-semibold text-stone-600">Date</th>
                                    <th className="text-left p-4 text-sm font-semibold text-stone-600">Event</th>
                                    <th className="text-right p-4 text-sm font-semibold text-stone-600">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.ledger.map((row) => (
                                    <tr key={row._id} className="border-b hover:bg-stone-50 transition">
                                        <td className="p-4 text-sm text-stone-500">
                                            {new Date(row.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Award className="w-4 h-4 text-stone-400" />
                                                <span className="text-sm font-medium text-stone-800">
                                                    {reasonLabel[row.reason] || row.reason}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`text-sm font-bold px-2 py-1 rounded-full ${row.type === 'EARN'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {row.type === 'EARN' ? '+' : '-'}{row.points} pts
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {history.totalPages > 1 && (
                            <div className="p-4 flex items-center justify-between border-t">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="px-4 py-2 text-sm bg-stone-100 rounded-lg disabled:opacity-40 hover:bg-stone-200 transition"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-stone-500">
                                    Page {history.page} of {history.totalPages}
                                </span>
                                <button
                                    disabled={page === history.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 text-sm bg-stone-100 rounded-lg disabled:opacity-40 hover:bg-stone-200 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PointsHistory;
