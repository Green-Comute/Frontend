import { useEffect, useState } from 'react';
import { Settings, ShieldAlert } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Story 4.13 — Opt-out of gamification leaderboards.
 * Simple toggle switch component.
 */
const PrivacySettings = () => {
    const [optedOut, setOptedOut] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        gamificationService.getBalance()
            .then(res => setOptedOut(res.data.optedOut))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = async () => {
        setSaving(true);
        try {
            const res = await gamificationService.toggleOptOut();
            setOptedOut(res.data.optedOut);
        } catch (err) {
            alert(err.message || 'Failed to update privacy settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-stone-700" />
                <h1 className="text-2xl font-bold text-stone-900">Privacy Settings</h1>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-stone-900 mb-2 flex items-center gap-2">
                            Leaderboard Visibility
                        </h3>
                        <p className="text-sm text-stone-500 mb-4 leading-relaxed">
                            If you prefer not to participate in the gamification leaderboards, you can hide your profile.
                            You will continue to earn points and can still redeem rewards, but your name and rank will be hidden from everyone else in your organization.
                        </p>

                        {optedOut && (
                            <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm flex gap-2 border border-amber-200 inline-flex items-center">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                Your profile is currently hidden from all leaderboards.
                            </div>
                        )}
                    </div>

                    <div className="pt-1">
                        <button
                            onClick={handleToggle}
                            disabled={saving}
                            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:opacity-50 ${optedOut ? 'bg-stone-300' : 'bg-emerald-600'
                                }`}
                        >
                            <span className="sr-only">Toggle Leaderboard Visibility</span>
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${optedOut ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <div className="text-xs text-center text-stone-400 mt-2 font-medium">
                            {optedOut ? 'Hidden' : 'Visible'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
