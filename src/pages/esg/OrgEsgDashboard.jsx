/**
 * OrgEsgDashboard — Organisation-level ESG stats for Org Admins.
 * Route: /org-admin/esg
 * Access: ORG_ADMIN only
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { impactService } from '../../services/impactService';

const StatCard = ({ icon, label, value, unit, color }) => (
  <div className={`p-6 bg-white border rounded-xl shadow-sm border-l-4 ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-stone-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-stone-900">
          {value ?? '—'}
          {unit && <span className="text-sm font-normal text-stone-500 ml-1">{unit}</span>}
        </p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const FUEL_COLORS = {
  PETROL: 'bg-orange-100 text-orange-700',
  DIESEL: 'bg-yellow-100 text-yellow-800',
  CNG: 'bg-blue-100 text-blue-700',
  ELECTRIC: 'bg-emerald-100 text-emerald-700',
  HYBRID: 'bg-teal-100 text-teal-700',
  UNKNOWN: 'bg-stone-100 text-stone-600',
};

const OrgEsgDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await impactService.getOrgEsgDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load ESG data');
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
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading ESG dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
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

  const fmt = (n, d = 2) => (n != null ? Number(n).toFixed(d) : '0');

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 animate-fade-in">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Organisation ESG Dashboard</h1>
            <p className="text-stone-500 mt-1">Aggregated sustainability metrics for your organisation</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            ← Back
          </button>
        </div>

        {/* Zero state */}
        {data?.totalTrips === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-amber-700 font-medium">No completed trips in your organisation yet.</p>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="" label="Total Trips" value={data?.totalTrips} color="border-blue-400" />
          <StatCard icon="" label="Active Drivers" value={data?.uniqueDriverCount} color="border-indigo-400" />
          <StatCard icon="" label="Total Distance" value={fmt(data?.totalDistanceKm)} unit="km" color="border-violet-400" />
          <StatCard icon="" label="CO₂ Saved" value={fmt(data?.totalCo2SavedKg, 3)} unit="kg" color="border-emerald-400" />
          <StatCard icon="" label="Trees Equivalent" value={fmt(data?.totalTreesEquivalent, 3)} color="border-green-400" />
          <StatCard icon="" label="Fuel Cost Saved" value={`₹${fmt(data?.totalFuelCostSavingsINR)}`} color="border-yellow-400" />
          <StatCard icon="" label="Maintenance Saved" value={`₹${fmt(data?.totalMaintenanceSavingsINR)}`} color="border-orange-400" />
        </div>

        {/* Per Fuel Type Breakdown */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Breakdown by Fuel Type</h2>
          {!data?.byFuelType || data.byFuelType.length === 0 ? (
            <p className="text-stone-500 text-sm">No fuel type data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-stone-500">
                    <th className="pb-3 font-medium">Fuel Type</th>
                    <th className="pb-3 font-medium text-right">Trips</th>
                    <th className="pb-3 font-medium text-right">Distance (km)</th>
                    <th className="pb-3 font-medium text-right">CO₂ Saved (kg)</th>
                    <th className="pb-3 font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byFuelType.map((row) => {
                    const sharePercent = data.totalTrips > 0
                      ? ((row.trips / data.totalTrips) * 100).toFixed(1)
                      : 0;
                    const colorClass = FUEL_COLORS[row.fuelType] || FUEL_COLORS.UNKNOWN;
                    return (
                      <tr key={row.fuelType} className="border-b last:border-0 hover:bg-stone-50">
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
                            {row.fuelType}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-stone-700 text-right">{row.trips}</td>
                        <td className="py-3 text-sm text-stone-700 text-right">{fmt(row.distanceKm)}</td>
                        <td className="py-3 text-sm text-emerald-700 font-medium text-right">{fmt(row.co2SavedKg, 3)}</td>
                        <td className="py-3 w-32">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-stone-100 rounded-full h-2">
                              <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${sharePercent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-stone-500 w-10 text-right">{sharePercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Environmental context */}
        {data?.totalCo2SavedKg > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-emerald-900 mb-3">Environmental Context</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-emerald-800">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{fmt(data.totalCo2SavedKg / 21.77, 1)}</p>
                <p className="text-xs text-emerald-600 mt-1">trees needed to absorb same CO₂ in a year</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{fmt(data.totalCo2SavedKg / 0.21, 0)}</p>
                <p className="text-xs text-emerald-600 mt-1">km equivalent car trips avoided</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{fmt((data.totalFuelCostSavingsINR + data.totalMaintenanceSavingsINR))}</p>
                <p className="text-xs text-emerald-600 mt-1">₹ total savings for your org members</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrgEsgDashboard;
