import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Award, Clock, ArrowLeft, Package, ShieldAlert } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Story 4.9 & 4.10 — Browse rewards and atomic redemption form
 */
const RewardsCatalog = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Redemption modal state
    const [selectedItem, setSelectedItem] = useState(null);
    const [redeeming, setRedeeming] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [redeemErr, setRedeemErr] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            const [catRes, balRes] = await Promise.all([
                gamificationService.getCatalog(),
                gamificationService.getBalance()
            ]);
            setItems(catRes.data);
            setBalance(balRes.data.pointsBalance);
        } catch (err) {
            setError(err.message || 'Failed to load rewards catalog');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleRedeem = async () => {
        if (!selectedItem) return;
        setRedeeming(true);
        setRedeemErr('');
        try {
            await gamificationService.redeemReward(selectedItem._id);
            setSuccessMsg(`Successfully requested redemption for ${selectedItem.name}!`);
            // Update local balance and catalog immediately
            setBalance(b => b - selectedItem.pointCost);
            setSelectedItem(null);
            loadData(); // refresh stock etc
        } catch (err) {
            setRedeemErr(err.message || 'Redemption failed. Please try again.');
        } finally {
            setRedeeming(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 p-6 md:p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Gift className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-stone-900">Rewards Catalog</h1>
                                <p className="text-sm text-stone-500">Redeem your hard-earned points</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => navigate('/gamification/history')}
                            className="px-4 py-2 bg-white border border-stone-200 shadow-sm rounded-lg text-stone-700 font-medium hover:bg-stone-50 transition flex items-center gap-2"
                        >
                            Wallet & History
                        </button>
                        <button
                            onClick={() => navigate('/rewards/my')}
                            className="px-4 py-2 bg-white border border-stone-200 shadow-sm rounded-lg text-stone-700 font-medium hover:bg-stone-50 transition flex items-center gap-2"
                        >
                            <Clock className="w-4 h-4" /> My Redemptions
                        </button>
                        <div className="bg-white px-5 py-3 border shadow-sm rounded-xl">
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Available Balance</p>
                            <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
                                <Award className="w-5 h-5" /> {balance.toLocaleString()} pts
                            </p>
                        </div>
                    </div>
                </div>

                {/* Global Notifications */}
                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
                {successMsg && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center justify-between animate-fade-in">
                        <span>🎉 {successMsg}</span>
                        <button onClick={() => navigate('/rewards/my')} className="text-emerald-700 font-semibold underline text-sm">View Status</button>
                    </div>
                )}

                {/* Catalog Grid */}
                {loading ? (
                    <div className="p-12 text-center text-stone-500"><div className="spinner mx-auto"></div><p className="mt-4">Loading rewards catalog...</p></div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
                        <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-stone-800 mb-1">No rewards available</h3>
                        <p className="text-stone-500">Your organization administrator hasn&apos;t added any active rewards yet.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => {
                            const canAfford = balance >= item.pointCost;
                            const outOfStock = item.stock !== null && item.stock <= 0;
                            const imageUrl = item.imageUrl
                                ? (item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000/${item.imageUrl}`)
                                : null;

                            return (
                                <div key={item._id} className="bg-white rounded-2xl border flex flex-col overflow-hidden hover:shadow-md transition">
                                    <div className="h-48 bg-stone-100 relative flex items-center justify-center border-b">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Gift className="w-16 h-16 text-stone-300" />
                                        )}
                                        {outOfStock && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                                <span className="bg-stone-800 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider text-sm shadow-xl">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-stone-900 leading-tight">{item.name}</h3>
                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                                                {item.category}
                                            </span>
                                        </div>
                                        <p className="text-stone-500 text-sm flex-1 mb-4 line-clamp-2">{item.description}</p>

                                        <div className="flex items-center justify-between mb-4 border-t pt-4">
                                            <div>
                                                <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Cost</p>
                                                <p className={`text-xl font-bold ${canAfford ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {item.pointCost.toLocaleString()} <span className="text-sm font-normal text-stone-500">pts</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Stock</p>
                                                <p className="text-sm font-medium text-stone-700">
                                                    {item.stock === null ? 'Unlimited' : `${item.stock} left`}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            disabled={outOfStock || !canAfford}
                                            onClick={() => setSelectedItem(item)}
                                            className="w-full py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2
                        disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed
                        bg-emerald-600 text-white hover:bg-emerald-700"
                                        >
                                            {outOfStock ? 'Sold Out' : canAfford ? 'Redeem Now' : 'Not Enough Points'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Redemption Confirmation Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden shadow-emerald-900/20">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-stone-900">Confirm Redemption</h3>
                                    <button onClick={() => { setSelectedItem(null); setRedeemErr(''); }} className="text-stone-400 hover:text-stone-600">&times;</button>
                                </div>

                                <p className="text-stone-600 mb-6">
                                    Are you sure you want to redeem <strong className="text-stone-900">{selectedItem.name}</strong>?
                                </p>

                                <div className="bg-stone-50 rounded-xl border p-4 mb-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-stone-500">Current Balance</span>
                                        <span className="font-semibold">{balance.toLocaleString()} pts</span>
                                    </div>
                                    <div className="flex justify-between mb-2 font-medium text-red-600">
                                        <span>Reward Cost</span>
                                        <span>-{selectedItem.pointCost.toLocaleString()} pts</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t mt-2">
                                        <span className="font-semibold text-stone-700">Remaining Balance</span>
                                        <span className="font-bold text-stone-900">
                                            {(balance - selectedItem.pointCost).toLocaleString()} pts
                                        </span>
                                    </div>
                                </div>

                                {redeemErr && (
                                    <div className="mb-4 p-3 bg-red-50 flex gap-2 text-sm text-red-700 rounded-lg">
                                        <ShieldAlert className="w-5 h-5 shrink-0" />
                                        <span>{redeemErr}</span>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        disabled={redeeming}
                                        onClick={() => { setSelectedItem(null); setRedeemErr(''); }}
                                        className="flex-1 py-3 bg-white border shadow-sm rounded-xl font-medium text-stone-700 hover:bg-stone-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={redeeming}
                                        onClick={handleRedeem}
                                        className="flex-1 py-3 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {redeeming ? 'Processing...' : 'Confirm Redemption'}
                                    </button>
                                </div>
                                <p className="text-center text-xs text-stone-400 mt-4">
                                    Redemptions require admin approval. <br /> Points are deducted immediately but will be refunded if rejected.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RewardsCatalog;
