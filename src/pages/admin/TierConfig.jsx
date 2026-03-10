import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, GripVertical, AlertTriangle } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Story 4.4 — ORG_ADMIN: Tier Config
 * Validates 3-10 tiers, strictly increasing minPoints (no overlap).
 */
const TierConfigPage = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        gamificationService.getOrgTiers()
            .then(res => setTiers(res.data))
            .catch(err => setError(err.message || 'Failed to load tiers'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setError(''); setSuccess('');

        // Validations (4.4)
        if (tiers.length < 3 || tiers.length > 10) {
            return setError('Must have between 3 and 10 tiers.');
        }

        const sorted = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].minPoints <= sorted[i - 1].minPoints) {
                return setError('Tier min points must be strictly increasing. Found overlapping thresholds.');
            }
        }

        // Assign maxPoints based on next tier
        for (let i = 0; i < sorted.length - 1; i++) {
            sorted[i].maxPoints = sorted[i + 1].minPoints - 1;
        }
        sorted[sorted.length - 1].maxPoints = null;

        try {
            setSaving(true);
            const res = await gamificationService.updateOrgTiers(sorted);
            setTiers(res.data);
            setSuccess('Tier configuration saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to save tiers');
        } finally {
            setSaving(false);
        }
    };

    const addTier = () => {
        if (tiers.length >= 10) return;
        const maxCurrent = Math.max(...tiers.map(t => t.minPoints), 0);
        setTiers([...tiers, {
            name: 'NEW TIER',
            minPoints: maxCurrent + 1000,
            maxPoints: null,
            color: '#475569',
            icon: '✨',
            multiplier: 1.0,
            perks: []
        }]);
    };

    const removeTier = (index) => {
        if (tiers.length <= 3) return alert('Minimum 3 tiers required');
        setTiers(tiers.filter((_, i) => i !== index));
    };

    const updateTier = (index, field, value) => {
        const newTiers = [...tiers];
        newTiers[index][field] = field === 'minPoints' || field === 'multiplier' ? Number(value) : value;
        setTiers(newTiers);
    };

    if (loading) return <div className="p-8">Loading tier configuration...</div>;

    return (
        <div className="p-6 md:p-8 bg-stone-50 min-h-screen animate-fade-in">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900">Tier Configuration</h1>
                            <p className="text-sm text-stone-500">Configure point thresholds and multipliers</p>
                        </div>
                    </div>
                    <button
                        disabled={saving}
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex gap-2"><AlertTriangle className="w-5 h-5" /> {error}</div>}
                {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">{success}</div>}

                <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-stone-800">Tier Ladder ({tiers.length}/10)</h3>
                        <button
                            onClick={addTier}
                            disabled={tiers.length >= 10}
                            className="flex items-center gap-1 text-sm text-emerald-600 font-semibold hover:bg-emerald-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> Add Tier
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tiers.map((tier, idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-stone-50 border p-3 rounded-xl hover:shadow-sm transition">
                                <GripVertical className="w-5 h-5 text-stone-300 cursor-grab" />

                                <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                                    <div className="col-span-1">
                                        <input type="text" value={tier.icon} onChange={e => updateTier(idx, 'icon', e.target.value)} className="w-full text-center text-xl bg-white border rounded py-1.5" title="Emoji Icon" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="text" value={tier.name} onChange={e => updateTier(idx, 'name', e.target.value)} className="w-full font-bold text-stone-800 bg-white border rounded px-3 py-1.5 uppercase" placeholder="Tier Name" />
                                    </div>
                                    <div className="col-span-3 relative">
                                        <span className="absolute left-3 top-2 text-xs text-stone-400">Min Pts:</span>
                                        <input type="number" min="0" value={tier.minPoints} onChange={e => updateTier(idx, 'minPoints', e.target.value)} className="w-full bg-white border rounded pl-14 pr-3 py-1.5" />
                                    </div>
                                    <div className="col-span-2 relative">
                                        <span className="absolute left-3 top-2 text-xs text-stone-400">Mult. x</span>
                                        <input type="number" step="0.1" min="0.1" value={tier.multiplier} onChange={e => updateTier(idx, 'multiplier', e.target.value)} className="w-full bg-white border rounded pl-14 pr-3 py-1.5" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="color" value={tier.color} onChange={e => updateTier(idx, 'color', e.target.value)} className="w-full h-8 bg-white border rounded px-1 cursor-pointer" title="Badge Color" />
                                    </div>
                                </div>

                                <button onClick={() => removeTier(idx)} disabled={tiers.length <= 3} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TierConfigPage;
