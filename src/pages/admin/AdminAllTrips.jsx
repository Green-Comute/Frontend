import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, Users, Calendar, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from '../../config/api.config';

const fetchAllTrips = async () => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE_URL}/trips/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch trips");
    return res.json();
};

const AdminAllTrips = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAllTrips()
            .then(data => setTrips(data.trips))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-12 text-center text-stone-500">Loading comprehensive ride data...</div>;
    if (error) return <div className="p-12 text-center text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-stone-50 p-6 md:p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <div className="flex flex-wrap shadow-sm border items-center justify-between gap-4 bg-white p-6 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <Car className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-stone-900">All Organization Rides</h1>
                        </div>
                        <div className="text-sm text-stone-500">
                            Total Recorded Trips: <span className="font-bold text-stone-900">{trips.length}</span>
                        </div>
                    </div>
                </div>

                {/* Trips List */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-stone-50 text-stone-500 text-sm border-b">
                                <tr>
                                    <th className="p-4 font-medium">Date & Time</th>
                                    <th className="p-4 font-medium">Route</th>
                                    <th className="p-4 font-medium">Driver</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Passengers</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {trips.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-stone-500">
                                            No trips found for your organization.
                                        </td>
                                    </tr>
                                ) : (
                                    trips.map(t => (
                                        <tr key={t._id} className="hover:bg-stone-50/50 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-stone-800 font-medium">
                                                    <Calendar className="w-4 h-4 text-stone-400" />
                                                    {new Date(t.scheduledTime).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-stone-500 mt-1 pl-6">
                                                    {new Date(t.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5 min-w-[200px]">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                                                        <span className="text-sm font-medium text-stone-800">{t.source}</span>
                                                    </div>
                                                    <div className="w-0.5 h-3 bg-stone-200 ml-1.5"></div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        <span className="text-sm font-medium text-stone-800">{t.destination}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-stone-800">{t.driverId?.name || "Unknown"}</div>
                                                <div className="text-xs text-stone-500">{t.driverId?.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                          ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                        t.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                            t.status === 'IN_PROGRESS' || t.status === 'STARTED' ? 'bg-indigo-100 text-indigo-700' :
                                                                'bg-amber-100 text-amber-700'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-sm text-stone-600">
                                                    <Users className="w-4 h-4 text-stone-400" />
                                                    <span className="font-semibold">{t.totalSeats - t.availableSeats}</span> / {t.totalSeats} seats booked
                                                </div>
                                                {t.rides?.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {t.rides.filter(r => r.status === 'APPROVED').map(r => (
                                                            <div key={r._id} className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded inline-block mr-1">
                                                                {r.passengerId?.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminAllTrips;
