import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Story 4.14 — PLATFORM_ADMIN: Point Rules Dashboard
 * Configures the global PointRuleConfig (organizationId=null).
 */
const PointRulesDashboard = () => {
    const [rules, setRules] = useState({
        passengerPerRide: 10,
        driverPerPassenger: 5,
        bonusEarlyBooking: 3,
        bonusPeakHour: 5,
        dailyCap: 50,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        gamificationService.getPointRules()
            .then(res => setRules(res.data))
            .catch(err => setError(err.message || 'Failed to load point rules'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(''); setSuccess('');
        try {
            const payload = {
                passengerPerRide: Number(rules.passengerPerRide),
                driverPerPassenger: Number(rules.driverPerPassenger),
                bonusEarlyBooking: Number(rules.bonusEarlyBooking),
                bonusPeakHour: Number(rules.bonusPeakHour),
                dailyCap: Number(rules.dailyCap),
            };
            const res = await gamificationService.updatePointRules(payload);
            setRules(res.data);
            setSuccess('Global point rules updated. Note: changes apply to future rides only.');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message || 'Failed to save rules');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setRules({ ...rules, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="p-8">Loading rules configuration...</div>;

    return (
        <div className="p-6 md:p-8 bg-stone-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">Platform Point Rules</h1>
                        <p className="text-sm text-stone-500">Global economy settings for the entire platform</p>
                    </div>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
                {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {success}</div>}

                <form onSubmit={handleSave} className="bg-white rounded-xl border shadow-sm p-6 md:p-8">

                    <h3 className="font-semibold text-stone-900 border-b pb-2 mb-6 text-lg">Base Earning Rates</h3>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Passenger per ride</label>
                            <div className="relative">
                                <input type="number" min="0" name="passengerPerRide" value={rules.passengerPerRide} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 pr-12 text-stone-900 text-lg font-medium" />
                                <span className="absolute right-3 top-2.5 text-stone-400 text-sm">pts</span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">Awarded to passenger upon successful dropoff.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Driver per passenger</label>
                            <div className="relative">
                                <input type="number" min="0" name="driverPerPassenger" value={rules.driverPerPassenger} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 pr-12 text-stone-900 text-lg font-medium" />
                                <span className="absolute right-3 top-2.5 text-stone-400 text-sm">pts</span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">Awarded to driver for each passenger dropped off.</p>
                        </div>
                    </div>

                    <h3 className="font-semibold text-stone-900 border-b pb-2 mb-6 text-lg">Bonuses & Constraints</h3>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Early Booking Bonus</label>
                            <input type="number" min="0" name="bonusEarlyBooking" value={rules.bonusEarlyBooking} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-stone-900 font-medium" />
                            <p className="text-xs text-stone-500 mt-1">+pts if booked {'>'}24h before trip.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Peak Hour Bonus</label>
                            <input type="number" min="0" name="bonusPeakHour" value={rules.bonusPeakHour} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-stone-900 font-medium" />
                            <p className="text-xs text-stone-500 mt-1">+pts for riding during peak hours.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Daily Cap Limit</label>
                            <input type="number" min="1" name="dailyCap" value={rules.dailyCap} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 bg-stone-50 text-stone-900 font-bold border-stone-300" />
                            <p className="text-xs text-red-600 mt-1 font-medium">Max points per user per day UTC.</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t mt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50 transition"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Global Rules'}
                        </button>
                    </div>

                    <div className="mt-4 p-4 bg-amber-50 rounded-lg text-sm text-amber-800 flex items-start gap-2 border border-amber-200">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p><strong>Note:</strong> Adjusting these rules affects the platform economy. Changes apply instantaneously to all future ride completions but do not retroactively alter points already earned by users.</p>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default PointRulesDashboard;
