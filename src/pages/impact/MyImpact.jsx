/**
 * MyImpact — Combined driver + passenger lifetime ESG stats.
 * Route: /impact/my
 * Access: Any authenticated user
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { impactService } from '../../services/impactService';

const StatCard = ({ icon, label, value, unit, color }) => (
  <div className={`p-5 bg-white border rounded-xl shadow-sm border-l-4 ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-stone-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-stone-900">
          {value ?? '—'}
          {unit && <span className="text-xs font-normal text-stone-500 ml-1">{unit}</span>}
        </p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

const SectionHeader = ({ icon, title, subtitle, bg }) => (
  <div className={`${bg} rounded-xl p-5 mb-4`}>
    <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">{icon} {title}</h2>
    <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>
  </div>
);

const MyImpact = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [passenger, setPassenger] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const impactRes = await impactService.getLifetimeImpact();
        const data = impactRes.data;
        // Support both new shape { asDriver, asPassenger } and legacy flat shape
        if (data?.asDriver !== undefined) {
          setDriver(data.asDriver);
          setPassenger(data.asPassenger);
        } else {
          setDriver(data);
          setPassenger(null);
        }
        try {
          const partnersRes = await impactService.getCommutePartners(5);
          setPartners(partnersRes.data || []);
        } catch {
          setPartners([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load impact data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto" style={{ width: 48, height: 48 }}></div>
          <p className="mt-4 text-stone-600">Loading your impact data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Failed to Load</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fmt = (n, decimals = 2) =>
    n != null ? Number(n).toFixed(decimals) : '0';

  const totalCo2 = (driver?.totalCo2SavedKg ?? 0) + (passenger?.totalCo2SavedKg ?? 0);
  const totalTrees = (driver?.totalTreesEquivalent ?? 0) + (passenger?.totalTreesEquivalent ?? 0);
  const totalDist = (driver?.totalDistanceKm ?? 0) + (passenger?.totalDistanceKm ?? 0);
  const totalFuel = (driver?.totalFuelCostSavingsINR ?? 0) + (passenger?.totalFuelCostSavingsINR ?? 0);

  const hasDriverActivity = (driver?.totalTrips ?? 0) > 0;
  const hasPassengerActivity = (passenger?.totalRides ?? 0) > 0;
  const hasAnyActivity = hasDriverActivity || hasPassengerActivity;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-5xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">My Environmental Impact</h1>
            <p className="text-stone-500 mt-1">Your lifetime CO₂ savings across all commutes</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary text-sm"
          >
            ← Back
          </button>
        </div>

        {/* Zero state */}
        {!hasAnyActivity && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-emerald-700 font-medium">
              No completed trips yet. Offer or join a ride to start tracking your impact!
            </p>
          </div>
        )}

        {/* Combined summary banner */}
        {hasAnyActivity && (
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <h2 className="text-base font-semibold opacity-80 mb-3">Combined Lifetime Impact</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold">{fmt(totalCo2, 2)} kg</p>
                <p className="text-xs opacity-75 mt-0.5">Total CO₂ Saved</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{fmt(totalTrees, 2)}</p>
                <p className="text-xs opacity-75 mt-0.5">Trees Equivalent</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{fmt(totalDist, 1)} km</p>
                <p className="text-xs opacity-75 mt-0.5">Green Km Travelled</p>
              </div>
              <div>
                <p className="text-2xl font-bold">₹{fmt(totalFuel, 0)}</p>
                <p className="text-xs opacity-75 mt-0.5">Fuel Cost Saved</p>
              </div>
            </div>
          </div>
        )}

        {/* AS A DRIVER section */}
        <div className="mb-8">
          <SectionHeader
            icon="🚗"
            title="As a Driver"
            subtitle="Impact from trips you offered and completed"
            bg="bg-blue-50 border border-blue-100"
          />
          {!hasDriverActivity ? (
            <p className="text-stone-400 text-sm px-2">You haven&apos;t completed any trips as a driver yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <StatCard icon="" label="Trips Offered" value={driver?.totalTrips} color="border-blue-400" />
                <StatCard icon="" label="Distance Driven" value={fmt(driver?.totalDistanceKm, 1)} unit="km" color="border-indigo-400" />
                <StatCard icon="" label="CO₂ Saved" value={fmt(driver?.totalCo2SavedKg, 3)} unit="kg" color="border-emerald-400" />
                <StatCard icon="" label="Trees Equivalent" value={fmt(driver?.totalTreesEquivalent, 3)} color="border-green-400" />
                <StatCard icon="" label="Fuel Cost Saved" value={`₹${fmt(driver?.totalFuelCostSavingsINR, 0)}`} color="border-yellow-400" />
                <StatCard icon="" label="Maintenance Saved" value={`₹${fmt(driver?.totalMaintenanceSavingsINR, 0)}`} color="border-orange-400" />
                <StatCard icon="" label="Carpool CO₂ Bonus" value={fmt(driver?.totalCarpoolSavingsKg, 3)} unit="kg" color="border-teal-400" />
              </div>

              {/* Top Commute Partners */}
              {partners.length > 0 && (
                <div className="bg-white border rounded-xl shadow-sm p-6">
                  <h3 className="text-base font-semibold text-stone-900 mb-3">🤝 Top Commute Partners</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-stone-500">
                          <th className="pb-3 font-medium">Rank</th>
                          <th className="pb-3 font-medium">Partner</th>
                          <th className="pb-3 font-medium text-right">Shared Trips</th>
                          <th className="pb-3 font-medium text-right">CO₂ Saved Together</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.map((p, i) => (
                          <tr key={p.partnerId} className="border-b last:border-0 hover:bg-stone-50">
                            <td className="py-3 text-sm text-stone-500">
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </td>
                            <td className="py-3 text-sm font-medium text-stone-900">{p.partnerName}</td>
                            <td className="py-3 text-sm text-stone-700 text-right">{p.sharedTrips}</td>
                            <td className="py-3 text-sm text-emerald-700 font-medium text-right">
                              {Number(p.co2SavedTogether).toFixed(3)} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* AS A PASSENGER section */}
        <div className="mb-8">
          <SectionHeader
            icon="🧑‍🤝‍🧑"
            title="As a Passenger"
            subtitle="CO₂ you avoided by carpooling instead of driving solo"
            bg="bg-emerald-50 border border-emerald-100"
          />
          {!hasPassengerActivity ? (
            <p className="text-stone-400 text-sm px-2">You haven&apos;t completed any rides as a passenger yet.</p>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard icon="" label="Rides Taken" value={passenger?.totalRides} color="border-emerald-400" />
              <StatCard icon="" label="Distance as Passenger" value={fmt(passenger?.totalDistanceKm, 1)} unit="km" color="border-green-400" />
              <StatCard icon="" label="CO₂ Avoided vs Solo" value={fmt(passenger?.totalCo2SavedKg, 3)} unit="kg" color="border-teal-400" />
              <StatCard icon="" label="Trees Equivalent" value={fmt(passenger?.totalTreesEquivalent, 3)} color="border-lime-500" />
              <StatCard icon="" label="Fuel Cost Avoided" value={`₹${fmt(passenger?.totalFuelCostSavingsINR, 0)}`} color="border-yellow-400" />
            </div>
          )}
          {hasPassengerActivity && (
            <p className="text-xs text-stone-400 mt-3 px-1">
              * Calculated using solo-drive baseline of 0.21 kg CO₂/km — the emissions you would have produced driving alone.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyImpact;
