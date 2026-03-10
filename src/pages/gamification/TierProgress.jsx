import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Stories 4.5 + 4.6 — Tier progress bar + real-time tier-upgrade notification
 */
const TierProgress = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');

    const load = async () => {
        try {
            const res = await gamificationService.getTierProgress();
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();

        // 4.6 — Listen for instant tier-upgrade socket event
        const token = localStorage.getItem('authToken');
        const socket = io('http://localhost:5000', { auth: { token } });

        socket.on('tier-upgrade', (payload) => {
            setToast(payload.message);
            load(); // refresh progress bar immediately
            setTimeout(() => setToast(''), 5000);
        });

        return () => socket.disconnect();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="spinner"></div></div>;
    }

    if (!data) {
        return <div className="p-8 text-red-600">Failed to load tier data.</div>;
    }

    const { currentTier, nextTier, progressPct, pointsNeeded, totalEarned, allTiers } = data;

    const tierColors = {
        BRONZE: 'bg-amber-700',
        SILVER: 'bg-stone-400',
        GOLD: 'bg-amber-500',
        PLATINUM: 'bg-violet-600',
    };
    const barColor = tierColors[currentTier?.name] || 'bg-emerald-600';

    return (
        <div className="min-h-screen bg-stone-50 p-6 md:p-8 animate-fade-in">
            <div className="max-w-2xl mx-auto">
                {/* Toast notification (4.6) */}
                {toast && (
                    <div className="mb-6 p-4 bg-emerald-600 text-white rounded-xl text-center font-semibold shadow-lg animate-pulse">
                        {toast}
                    </div>
                )}

                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <Star className="w-8 h-8 text-emerald-600" />
                    <h1 className="text-2xl font-bold text-stone-900">Tier Progress</h1>
                </div>

                {/* Current tier badge */}
                <div className="card p-8 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">{currentTier?.icon || '🥉'}</span>
                        <span
                            className="px-4 py-1 rounded-full text-white text-sm font-bold"
                            style={{ backgroundColor: currentTier?.color || '#78716c' }}
                        >
                            {currentTier?.name}
                        </span>
                    </div>

                    <p className="text-stone-500 text-sm mt-2 mb-6">{totalEarned.toLocaleString()} total points earned</p>

                    {/* Progress bar */}
                    <div>
                        <div className="flex justify-between text-xs text-stone-500 mb-1">
                            <span>{currentTier?.name} ({currentTier?.minPoints.toLocaleString()} pts)</span>
                            {nextTier && <span>{nextTier.name} ({nextTier.minPoints.toLocaleString()} pts)</span>}
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">
                            <div
                                className={`${barColor} h-4 rounded-full transition-all duration-700`}
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        {nextTier ? (
                            <p className="text-sm text-stone-600 mt-2 text-right">
                                <strong>{pointsNeeded.toLocaleString()} pts</strong> to reach {nextTier.icon} {nextTier.name}
                            </p>
                        ) : (
                            <p className="text-sm text-emerald-600 font-bold mt-2 text-center">🎉 Maximum tier reached!</p>
                        )}
                    </div>

                    {/* Perks */}
                    {currentTier?.perks?.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Your Perks</p>
                            <ul className="space-y-1">
                                {currentTier.perks.map((p, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-emerald-700">
                                        <ChevronRight className="w-4 h-4" /> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* All tiers ladder */}
                <div className="card p-6">
                    <h2 className="font-semibold text-stone-700 mb-4">All Tiers</h2>
                    <div className="space-y-3">
                        {allTiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`flex items-center justify-between p-3 rounded-lg border ${tier.name === currentTier?.name
                                        ? 'border-emerald-400 bg-emerald-50'
                                        : 'border-stone-100'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{tier.icon}</span>
                                    <div>
                                        <p className="font-medium text-stone-800 text-sm">{tier.name}</p>
                                        <p className="text-xs text-stone-500">{tier.minPoints.toLocaleString()}+ pts &middot; {tier.multiplier}× multiplier</p>
                                    </div>
                                </div>
                                {tier.name === currentTier?.name && (
                                    <span className="text-xs px-2 py-1 bg-emerald-600 text-white rounded-full font-semibold">
                                        Current
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TierProgress;
