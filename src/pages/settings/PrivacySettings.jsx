import { useEffect, useState } from 'react';
import { Settings, ShieldAlert, Eye, MapPin, BookOpen, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gamificationService } from '../../services/gamificationService';
import { privacyService } from '../../services/privacyService';

// ── Reusable toggle row ───────────────────────────────────────────────────────

const ToggleRow = ({ label, description, checked, onChange, disabled }) => (
    <div className="flex items-start justify-between gap-6 py-4 border-b last:border-0">
        <div className="flex-1">
            <p className="text-sm font-medium text-stone-800">{label}</p>
            {description && <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{description}</p>}
        </div>
        <div className="pt-0.5 shrink-0">
            <button
                type="button"
                onClick={onChange}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ease-in-out focus:outline-none disabled:opacity-50 ${
                    checked ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
            >
                <span className="sr-only">{label}</span>
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    </div>
);

/**
 * Stories 4.13 + 5.11 + 5.12 + 5.13 + 5.14 — Combined privacy settings page.
 * Route: /settings/privacy
 */
const PrivacySettings = () => {
    const navigate = useNavigate();

    // ── Epic 4 — Gamification ─────────────────────────────────────────────────
    const [optedOut, setOptedOut] = useState(false);
    const [gamifLoading, setGamifLoading] = useState(true);
    const [gamifSaving, setGamifSaving] = useState(false);

    // ── Epic 5 — Profile / trip privacy ──────────────────────────────────────
    const [privSettings, setPrivSettings] = useState({
        hideProfile: false,
        hideRatings: false,
        hideTrips: false,
        womenOnlyPreference: false,
    });
    const [privLoading, setPrivLoading] = useState(true);
    const [privSaving, setPrivSaving] = useState(false);

    // ── Epic 5 — GPS consent ──────────────────────────────────────────────────
    const [gpsEnabled, setGpsEnabled] = useState(true);
    const [gpsLoading, setGpsLoading] = useState(true);
    const [gpsSaving, setGpsSaving] = useState(false);

    // ── Epic 5 — Tutorial ─────────────────────────────────────────────────────
    const [tutorialCompleted, setTutorialCompleted] = useState(false);
    const [tutorialLoading, setTutorialLoading] = useState(true);
    const [tutorialSaving, setTutorialSaving] = useState(false);

    // ── Epic 5 — Delete account ───────────────────────────────────────────────
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        // Load all sections in parallel
        gamificationService
            .getBalance()
            .then((res) => setOptedOut(res.data.optedOut))
            .catch(console.error)
            .finally(() => setGamifLoading(false));

        privacyService
            .getSettings()
            .then((res) => {
                const d = res.data ?? res;
                setPrivSettings({
                    hideProfile: !!d.hideProfile,
                    hideRatings: !!d.hideRatings,
                    hideTrips: !!d.hideTrips,
                    womenOnlyPreference: !!d.womenOnlyPreference,
                });
            })
            .catch(console.error)
            .finally(() => setPrivLoading(false));

        privacyService
            .getGps()
            .then((res) => setGpsEnabled(!!(res.data ?? res).gpsEnabled))
            .catch(() => setGpsEnabled(true))
            .finally(() => setGpsLoading(false));

        privacyService
            .getTutorial()
            .then((res) => setTutorialCompleted(!!(res.data ?? res).completed))
            .catch(() => setTutorialCompleted(false))
            .finally(() => setTutorialLoading(false));
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleGamifToggle = async () => {
        setGamifSaving(true);
        try {
            const res = await gamificationService.toggleOptOut();
            setOptedOut(res.data.optedOut);
        } catch (err) {
            alert(err.message || 'Failed to update leaderboard setting.');
        } finally {
            setGamifSaving(false);
        }
    };

    const handlePrivToggle = async (key) => {
        const next = { ...privSettings, [key]: !privSettings[key] };
        setPrivSettings(next);
        setPrivSaving(true);
        try {
            await privacyService.updateSettings({ [key]: next[key] });
        } catch (err) {
            // Rollback
            setPrivSettings((prev) => ({ ...prev, [key]: !next[key] }));
            alert(err.message || 'Failed to save setting.');
        } finally {
            setPrivSaving(false);
        }
    };

    const handleGpsToggle = async () => {
        const next = !gpsEnabled;
        setGpsEnabled(next);
        setGpsSaving(true);
        try {
            await privacyService.setGps(next);
        } catch (err) {
            setGpsEnabled(!next);
            alert(err.message || 'Failed to update GPS setting.');
        } finally {
            setGpsSaving(false);
        }
    };

    const handleCompleteTutorial = async () => {
        setTutorialSaving(true);
        try {
            await privacyService.completeTutorial();
            setTutorialCompleted(true);
        } catch (err) {
            alert(err.message || 'Failed to mark tutorial complete.');
        } finally {
            setTutorialSaving(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (deleteConfirm !== 'DELETE') {
            setDeleteError('Type DELETE to confirm.');
            return;
        }
        if (!deletePassword) {
            setDeleteError('Password is required.');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        try {
            await privacyService.deleteAccount(deletePassword);
            // Redirect to login after successful deletion
            localStorage.removeItem('authToken');
            navigate('/login');
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete account.');
        } finally {
            setDeleting(false);
        }
    };

    const loading = gamifLoading || privLoading || gpsLoading || tutorialLoading;
    if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="spinner"></div></div>;

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-stone-700" />
                <h1 className="text-2xl font-bold text-stone-900">Privacy & Settings</h1>
            </div>

            {/* ── Gamification (Epic 4) ────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                    Leaderboard Visibility
                </h2>
                <p className="text-sm text-stone-500 mb-4 leading-relaxed">
                    You continue to earn points and can redeem rewards, but your name and rank
                    will be hidden from everyone else in your organisation.
                </p>
                {optedOut && (
                    <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm flex gap-2 border border-amber-200 items-center">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        Your profile is currently hidden from all leaderboards.
                    </div>
                )}
                <ToggleRow
                    label={optedOut ? 'Hidden from leaderboards' : 'Visible on leaderboards'}
                    checked={!optedOut}
                    onChange={handleGamifToggle}
                    disabled={gamifSaving}
                />
            </section>

            {/* ── Profile & Trip Privacy (Epic 5.11) ──────────────────────── */}
            <section className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-stone-500" />
                    Profile & Trip Visibility
                </h2>
                <p className="text-sm text-stone-500 mb-2 leading-relaxed">
                    Control what other users can see about you.
                </p>
                <div>
                    <ToggleRow
                        label="Show my profile to other users"
                        description="When off, your name and photo are hidden from other members."
                        checked={!privSettings.hideProfile}
                        onChange={() => handlePrivToggle('hideProfile')}
                        disabled={privSaving}
                    />
                    <ToggleRow
                        label="Show my ratings"
                        description="When off, your average star rating is not visible to anyone."
                        checked={!privSettings.hideRatings}
                        onChange={() => handlePrivToggle('hideRatings')}
                        disabled={privSaving}
                    />
                    <ToggleRow
                        label="Show my trip history"
                        description="When off, your past trips are not visible to other users."
                        checked={!privSettings.hideTrips}
                        onChange={() => handlePrivToggle('hideTrips')}
                        disabled={privSaving}
                    />
                    <ToggleRow
                        label="Women-only ride preference"
                        description="When on, you'll only be matched with women-identifying drivers or passengers."
                        checked={privSettings.womenOnlyPreference}
                        onChange={() => handlePrivToggle('womenOnlyPreference')}
                        disabled={privSaving}
                    />
                </div>
            </section>

            {/* ── GPS Consent (Epic 5.12) ──────────────────────────────────── */}
            <section className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-stone-500" />
                    Location & GPS
                </h2>
                <p className="text-sm text-stone-500 mb-2 leading-relaxed">
                    GPS is required for live tracking, trip share links, and accurate navigation.
                    Disabling it will prevent real-time features from working.
                </p>
                <ToggleRow
                    label="Enable GPS / location sharing"
                    checked={gpsEnabled}
                    onChange={handleGpsToggle}
                    disabled={gpsSaving}
                />
            </section>

            {/* ── Tutorial (Epic 5.13) ─────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-stone-500" />
                    Onboarding Tutorial
                </h2>
                {tutorialCompleted ? (
                    <p className="text-sm text-emerald-700 flex items-center gap-2">
                        ✓ Tutorial marked as complete.
                    </p>
                ) : (
                    <>
                        <p className="text-sm text-stone-500 mb-3 leading-relaxed">
                            Mark the onboarding tutorial as complete to dismiss the intro prompts.
                        </p>
                        <button
                            onClick={handleCompleteTutorial}
                            disabled={tutorialSaving}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                            {tutorialSaving ? 'Saving…' : 'Mark Tutorial Complete'}
                        </button>
                    </>
                )}
            </section>

            {/* ── Delete Account (Epic 5.14) ───────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
                <h2 className="text-base font-semibold text-red-700 mb-1 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                </h2>
                <p className="text-sm text-stone-500 mb-4 leading-relaxed">
                    Permanently delete your account and anonymise all personal data. Active trips
                    must be completed or cancelled first. This action cannot be undone.
                </p>
                <form onSubmit={handleDeleteAccount} className="space-y-3">
                    <input
                        type="password"
                        required
                        placeholder="Your current password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="input-field"
                    />
                    <input
                        required
                        placeholder='Type DELETE to confirm'
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className="input-field"
                    />
                    {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
                    <button
                        type="submit"
                        disabled={deleting || deleteConfirm !== 'DELETE'}
                        className="px-5 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                    >
                        {deleting ? 'Deleting…' : 'Delete My Account'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default PrivacySettings;
