import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Inbox, CheckCircle, XCircle, Clock } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Story 4.12 — ORG_ADMIN: Redemption Queue
 */
const RedemptionQueue = () => {
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const loadQueue = async () => {
        try {
            setLoading(true);
            const res = await gamificationService.listRedemptions('PENDING');
            setRedemptions(res.data);
        } catch (err) {
            setError(err.message || 'Failed to load queue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();

        // Listen for new redemptions real-time
        const token = localStorage.getItem('authToken');
        const socket = io('http://localhost:5000', { auth: { token } });

        socket.on('redemption-submitted', () => {
            loadQueue(); // Refresh queue when a new submission arrives
        });

        return () => socket.disconnect();
    }, []);

    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            await gamificationService.approveRedemption(id);
            setRedemptions(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            alert(err.message || 'Failed to approve');
        } finally { setProcessingId(null); }
    };

    const handleReject = async (id) => {
        const reason = prompt("Enter a reason for rejection (points will be refunded to the user):");
        if (reason === null) return; // cancelled

        setProcessingId(id);
        try {
            await gamificationService.rejectRedemption(id, reason);
            setRedemptions(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            alert(err.message || 'Failed to reject');
        } finally { setProcessingId(null); }
    };

    return (
        <div className="p-6 md:p-8 bg-stone-50 min-h-screen animate-fade-in">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Inbox className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">Redemption Queue</h1>
                        <p className="text-sm text-stone-500">Review and approve point redemption requests</p>
                    </div>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-stone-500">Loading queue...</div>
                    ) : redemptions.length === 0 ? (
                        <div className="p-16 text-center text-stone-500 flex flex-col items-center">
                            <CheckCircle className="w-12 h-12 text-stone-300 mb-3" />
                            <h3 className="text-lg font-medium text-stone-800">All caught up!</h3>
                            <p>There are no pending redemption requests right now.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100">
                            {redemptions.map(r => (
                                <div key={r._id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-stone-50 transition">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-lg text-stone-900">{r.userId?.name}</span>
                                            <span className="text-sm text-stone-500">{r.userId?.email}</span>
                                        </div>

                                        <div className="p-3 bg-stone-50 border rounded-lg flex items-start sm:items-center gap-4">
                                            {r.rewardItemId?.imageUrl ? (
                                                <img src={`http://localhost:5000/${r.rewardItemId.imageUrl}`} className="w-12 h-12 rounded object-cover border" alt="" />
                                            ) : <div className="w-12 h-12 rounded bg-stone-200" />}

                                            <div>
                                                <p className="font-semibold text-stone-800">{r.rewardItemId?.name}</p>
                                                <p className="text-sm text-stone-600 font-bold text-emerald-600">{r.pointsSpent.toLocaleString()} pts spent</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Requested on {new Date(r.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="w-full md:w-auto flex flex-row md:flex-col gap-3">
                                        <button
                                            disabled={processingId === r._id}
                                            onClick={() => handleApprove(r._id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            disabled={processingId === r._id}
                                            onClick={() => handleReject(r._id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject & Refund
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RedemptionQueue;
