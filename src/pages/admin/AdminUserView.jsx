import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Car, ArrowLeft, History, MapPin, Gift, Box } from "lucide-react";

/** Fetch directly since it's an admin route or use the existing api wrapper */
const fetchUserDetails = async (id) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`http://localhost:5000/api/users/${id}/admin-details`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch user details");
    return res.json();
};

const AdminUserView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUserDetails(id)
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-12 text-center text-stone-500">Loading comprehensive user history...</div>;
    if (error) return <div className="p-12 text-center text-red-600">{error}</div>;

    const { user, points, tripsOffered, ridesTaken, pointHistory, redemptions } = data;

    return (
        <div className="min-h-screen bg-stone-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center border">
                                <User className="w-7 h-7 text-stone-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-stone-900">{user.name || "Unnamed User"}</h1>
                                <p className="text-stone-500">{user.email} &bull; {user.phone}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${user.role === 'EMPLOYEE' ? 'bg-stone-100 text-stone-600' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {user.role}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${user.isDriver ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                                        {user.isDriver ? 'Driver' : 'Passenger Only'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6 items-center flex-wrap">
                            <div className="text-center px-4">
                                <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">Total Points</p>
                                <p className="text-2xl font-bold text-emerald-600">{points.pointsBalance}</p>
                            </div>
                            <div className="text-center border-l px-4">
                                <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">Tier</p>
                                <p className="text-2xl font-bold text-amber-600">{points.currentTier}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2-Column Grid for History */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Left Column: Rides */}
                    <div className="space-y-6">

                        {/* Trips Offered */}
                        {user.isDriver && (
                            <div className="bg-white rounded-2xl border shadow-sm p-6">
                                <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2 border-b pb-3">
                                    <Car className="w-5 h-5 text-indigo-500" /> Trips Offered
                                </h2>
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                    {tripsOffered.length === 0 ? (
                                        <p className="text-stone-500 text-sm">No trips offered.</p>
                                    ) : tripsOffered.map(t => (
                                        <div key={t._id} className="p-3 bg-stone-50 rounded-xl border text-sm flex justify-between">
                                            <div>
                                                <div className="font-semibold text-stone-800 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.source} &rarr; {t.destination}</div>
                                                <div className="text-stone-500 text-xs mt-1">{new Date(t.scheduledTime).toLocaleString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold">{t.status}</span>
                                                <div className="text-xs text-stone-500 mt-1">{t.vehicleType}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rides Taken */}
                        <div className="bg-white rounded-2xl border shadow-sm p-6">
                            <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2 border-b pb-3">
                                <MapPin className="w-5 h-5 text-emerald-500" /> Rides Taken
                            </h2>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {ridesTaken.length === 0 ? (
                                    <p className="text-stone-500 text-sm">No rides taken.</p>
                                ) : ridesTaken.map(r => (
                                    <div key={r._id} className="p-3 bg-stone-50 rounded-xl border text-sm flex justify-between">
                                        <div>
                                            <div className="font-semibold text-stone-800">Trip ID...{String(r.tripId?._id || r.tripId).slice(-4)}</div>
                                            <div className="text-stone-500 text-xs mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-emerald-700">{r.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Gamification */}
                    <div className="space-y-6">

                        {/* Rewards Redemptions */}
                        <div className="bg-white rounded-2xl border shadow-sm p-6">
                            <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2 border-b pb-3">
                                <Gift className="w-5 h-5 text-amber-500" /> Redemptions
                            </h2>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {redemptions.length === 0 ? (
                                    <p className="text-stone-500 text-sm">No reward redemptions.</p>
                                ) : redemptions.map(r => (
                                    <div key={r._id} className="p-3 bg-stone-50 rounded-xl border text-sm flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg border">
                                                <Box className="w-4 h-4 text-stone-400" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-stone-800">{r.rewardItemId?.name || "Unknown Item"}</div>
                                                <div className="text-stone-500 text-xs mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded 
                        ${r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                    r.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Point History */}
                        <div className="bg-white rounded-2xl border shadow-sm p-6">
                            <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2 border-b pb-3">
                                <History className="w-5 h-5 text-blue-500" /> Point Logs
                            </h2>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {pointHistory.length === 0 ? (
                                    <p className="text-stone-500 text-sm">No point transactions.</p>
                                ) : pointHistory.map(log => (
                                    <div key={log._id} className="p-3 bg-stone-50 rounded-xl border text-sm flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-stone-800">{log.description}</div>
                                            <div className="text-stone-500 text-xs">{new Date(log.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div className={`font-bold ${log.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {log.points > 0 ? '+' : ''}{log.points} pts
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminUserView;
