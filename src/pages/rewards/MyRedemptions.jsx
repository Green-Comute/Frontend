import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Image as ImageIcon, CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Story 4.15 — User's redemption history
 */
const MyRedemptions = () => {
    const navigate = useNavigate();
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        gamificationService.getMyRedemptions()
            .then(res => setRedemptions(res.data))
            .catch(err => setError(err.message || 'Failed to load redemption history'))
            .finally(() => setLoading(false));
    }, []);

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'APPROVED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wide"><CircleCheck className="w-3.5 h-3.5" /> APPROVED</span>;
            case 'REJECTED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold tracking-wide"><CircleX className="w-3.5 h-3.5" /> REJECTED</span>;
            default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold tracking-wide"><Loader2 className="w-3.5 h-3.5 animate-spin" /> PENDING</span>;
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 p-6 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/rewards')} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Catalog
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center shadow-sm">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">My Redemptions</h1>
                        <p className="text-sm text-stone-500">Track your reward requests</p>
                    </div>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}

                {loading ? (
                    <div className="p-12 text-center text-stone-500"><div className="spinner mx-auto"></div><p className="mt-4">Loading history...</p></div>
                ) : redemptions.length === 0 ? (
                    <div className="bg-white rounded-xl border shadow-sm p-12 text-center justify-center flex flex-col items-center gap-4">
                        <Clock className="w-12 h-12 text-stone-300" />
                        <p className="text-stone-500">You haven&apos;t requested any rewards yet.</p>
                        <button onClick={() => navigate('/rewards')} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
                            Browse Catalog
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="divide-y divide-stone-100">
                            {redemptions.map(r => (
                                <div key={r._id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:bg-stone-50 transition">
                                    {/* Image Thumbnail */}
                                    <div className="w-16 h-16 shrink-0 bg-stone-100 rounded-lg flex items-center justify-center border overflow-hidden">
                                        {r.rewardItemId?.imageUrl ? (
                                            <img src={`http://localhost:5000/${r.rewardItemId.imageUrl}`} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-stone-300" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className="font-bold text-stone-900 text-lg">{r.rewardItemId?.name || 'Deleted Reward'}</h4>
                                            <StatusBadge status={r.status} />
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-500 mt-2">
                                            <span className="font-semibold text-stone-700">{r.pointsSpent.toLocaleString()} pts</span>
                                            <span>&bull;</span>
                                            <span>Requested {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                        </div>

                                        {r.status === 'REJECTED' && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                                                <strong className="font-semibold">Reason for rejection:</strong> {r.rejectionReason}
                                                <p className="mt-1 text-xs text-red-600">Your points have been fully refunded to your balance.</p>
                                            </div>
                                        )}

                                        {r.status === 'APPROVED' && (
                                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-800">
                                                <strong className="font-semibold">Approved by Admin</strong> on {new Date(r.reviewedAt).toLocaleDateString('en-IN')}
                                                <p className="mt-1 text-xs text-emerald-600">Please contact HR or your manager to collect your reward.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRedemptions;
