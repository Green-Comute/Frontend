import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Building2, Users } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Stories 4.7 + 4.8 — Leaderboard (Org-wide and Department-wise)
 * Excludes opted-out users.
 */
const Leaderboard = () => {
    const navigate = useNavigate();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 'org' or 'dept'
    const [view, setView] = useState('org');
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userDept = user.department || 'Engineering'; // fallback for demo if not set

    useEffect(() => {
        const fetchLeaders = async () => {
            setLoading(true);
            setError('');
            try {
                const res = view === 'org'
                    ? await gamificationService.getLeaderboard()
                    : await gamificationService.getDeptLeaderboard(userDept);
                setLeaders(res.data);
            } catch (err) {
                setError(err.message || 'Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, [view, userDept]);

    const getBadgeColor = (tier) => {
        switch (tier) {
            case 'PLATINUM': return 'bg-violet-100 text-violet-800 border-violet-200';
            case 'GOLD': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'SILVER': return 'bg-stone-200 text-stone-700 border-stone-300';
            default: return 'bg-amber-800/10 text-amber-900 border-amber-900/20'; // BRONZE
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900">Leaderboard</h1>
                            <p className="text-sm text-stone-500">Top earners in your organization</p>
                        </div>
                    </div>

                    <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                        <button
                            onClick={() => setView('org')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${view === 'org' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <Building2 className="w-4 h-4" /> Org-Wide
                        </button>
                        <button
                            onClick={() => setView('dept')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${view === 'dept' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <Users className="w-4 h-4" /> My Department
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-sm">
                    {loading ? (
                        <div className="p-12 text-center text-stone-500">Loading standings...</div>
                    ) : leaders.length === 0 ? (
                        <div className="p-12 text-center text-stone-500">No one is on the leaderboard yet.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-stone-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-stone-600 w-24">Rank</th>
                                    <th className="px-6 py-4 text-left font-semibold text-stone-600">Employee</th>
                                    <th className="px-6 py-4 text-center font-semibold text-stone-600">Tier</th>
                                    <th className="px-6 py-4 text-right font-semibold text-stone-600">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {leaders.map((leader) => (
                                    <tr
                                        key={leader.userId}
                                        className={`transition ${leader.isMe ? 'bg-emerald-50/50' : 'hover:bg-stone-50'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {leader.rank === 1 && <span className="text-2xl" title="1st Place">🥇</span>}
                                                {leader.rank === 2 && <span className="text-2xl" title="2nd Place">🥈</span>}
                                                {leader.rank === 3 && <span className="text-2xl" title="3rd Place">🥉</span>}
                                                {leader.rank > 3 && <span className="font-bold text-stone-400 pl-2">#{leader.rank}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-stone-900 flex items-center gap-2">
                                                {leader.name} {leader.isMe && <span className="text-xs font-normal bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">You</span>}
                                            </div>
                                            {view === 'org' && leader.department && (
                                                <div className="text-xs text-stone-400 mt-0.5">{leader.department}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(leader.currentTier)}`}>
                                                {leader.currentTier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">{leader.pointsBalance.toLocaleString()}</span>
                                            <span className="text-stone-400 text-xs ml-1">pts</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <p className="text-center text-xs text-stone-400 mt-6">
                    Leaderboard updates roughly every hour. Users who have opted out in privacy settings are hidden.
                </p>
            </div>
        </div>
    );
};

export default Leaderboard;
