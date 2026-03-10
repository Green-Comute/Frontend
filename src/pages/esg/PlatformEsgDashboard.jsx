/**
 * PlatformEsgDashboard — Platform-wide global ESG stats for Platform Admins.
 * Route: /platform/esg
 * Access: PLATFORM_ADMIN only
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

const PlatformEsgDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await impactService.getGlobalEsgStats();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load global ESG data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading global ESG stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Failed to Load</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fmt = (n, d = 2) => (n != null ? Number(n).toFixed(d) : '0');
  const maxCo2 = data?.topOrganizations?.[0]?.co2SavedKg || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">🌍 Global ESG Dashboard</h1>
            <p className="text-stone-500 mt-1">Platform-wide sustainability metrics across all organisations</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm"
          >
            ← Back
          </button>
        </div>

        {/* Zero state */}
        {data?.totalTrips === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-amber-700 font-medium">No completed trips platform-wide yet.</p>
          </div>
        )}

        {/* Global Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🚗" label="Total Trips" value={data?.totalTrips} color="border-blue-400" />
          <StatCard icon="👤" label="Unique Drivers" value={data?.uniqueDriverCount} color="border-indigo-400" />
          <StatCard icon="📍" label="Total Distance" value={fmt(data?.totalDistanceKm)} unit="km" color="border-violet-400" />
          <StatCard icon="🌿" label="Total CO₂ Saved" value={fmt(data?.totalCo2SavedKg, 3)} unit="kg" color="border-emerald-400" />
          <StatCard icon="🌳" label="Trees Equivalent" value={fmt(data?.totalTreesEquivalent, 3)} color="border-green-400" />
          <StatCard icon="⛽" label="Total Fuel Savings" value={`₹${fmt(data?.totalFuelCostSavingsINR)}`} color="border-yellow-400" />
          <StatCard icon="🔧" label="Maintenance Savings" value={`₹${fmt(data?.totalMaintenanceSavingsINR)}`} color="border-orange-400" />
        </div>

        {/* Platform Summary */}
        {data?.totalCo2SavedKg > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">🌏 Platform Environmental Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-800">{fmt(data.totalCo2SavedKg / 21.77, 1)}</p>
                <p className="text-xs text-blue-600 mt-1">trees needed to absorb same CO₂/year</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-800">{fmt(data.totalCo2SavedKg / 0.21, 0)}</p>
                <p className="text-xs text-blue-600 mt-1">km equivalent solo car trips avoided</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-800">
                  ₹{fmt(data.totalFuelCostSavingsINR + data.totalMaintenanceSavingsINR)}
                </p>
                <p className="text-xs text-blue-600 mt-1">total cost savings across all users</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Organisations Leaderboard */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">🏆 Top Organisations by CO₂ Saved</h2>
          {!data?.topOrganizations || data.topOrganizations.length === 0 ? (
            <p className="text-stone-500 text-sm">No organisation data available.</p>
          ) : (
            <div className="space-y-4">
              {data.topOrganizations.map((org, i) => {
                const barWidth = ((org.co2SavedKg / maxCo2) * 100).toFixed(1);
                return (
                  <div key={org.organizationId || i} className="flex items-center gap-4">
                    <div className="w-6 text-center text-sm font-bold text-stone-400 flex-shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-stone-900 truncate">{org.orgName}</span>
                        <div className="flex items-center gap-3 text-xs text-stone-500 flex-shrink-0 ml-2">
                          <span>{org.trips} trips</span>
                          <span className="font-semibold text-emerald-700">{fmt(org.co2SavedKg, 3)} kg CO₂</span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PlatformEsgDashboard;
