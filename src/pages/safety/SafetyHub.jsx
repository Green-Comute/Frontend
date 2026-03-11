import { useEffect, useState } from 'react';
import { Shield, Phone, UserX, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { safetyService } from '../../services/safetyService';

// ── Emergency Contacts section ────────────────────────────────────────────────

const RELATIONSHIPS = ['Partner', 'Parent', 'Sibling', 'Friend', 'Other'];

const EmergencyContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', relationship: 'Friend' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = () =>
        safetyService
            .getContacts()
            .then((res) => setContacts(res.data ?? res))
            .catch(() => {})
            .finally(() => setLoading(false));

    useEffect(() => { load(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await safetyService.addContact(form.name, form.phone, form.relationship);
            setForm({ name: '', phone: '', relationship: 'Friend' });
            setShowForm(false);
            await load();
        } catch (err) {
            setError(err.message || 'Failed to add contact.');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Remove this emergency contact?')) return;
        try {
            await safetyService.removeContact(id);
            setContacts((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            alert(err.message || 'Failed to remove contact.');
        }
    };

    return (
        <section className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-stone-900">Emergency Contacts</h2>
                </div>
                {contacts.length < 3 && (
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                )}
            </div>
            <p className="text-sm text-stone-500 mb-4">
                Up to 3 contacts. These are not automatically notified — they are for your personal reference.
            </p>

            {showForm && (
                <form onSubmit={handleAdd} className="bg-stone-50 rounded-xl p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            required
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full"
                        />
                        <input
                            required
                            placeholder="+1234567890"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full"
                        />
                    </div>
                    <select
                        value={form.relationship}
                        onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                        className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full"
                    >
                        {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving…' : 'Save Contact'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setError(''); }}
                            className="px-4 py-2 border border-stone-300 text-stone-600 text-sm rounded-lg hover:bg-stone-100"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p className="text-sm text-stone-400">Loading…</p>
            ) : contacts.length === 0 ? (
                <p className="text-sm text-stone-400 italic">No emergency contacts added yet.</p>
            ) : (
                <ul className="space-y-2">
                    {contacts.map((c) => (
                        <li key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                            <div>
                                <p className="text-sm font-medium text-stone-800">{c.name}</p>
                                <p className="text-xs text-stone-500">{c.phone} · {c.relationship}</p>
                            </div>
                            <button
                                onClick={() => handleRemove(c._id)}
                                className="text-stone-400 hover:text-red-500 transition"
                                aria-label="Remove contact"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

// ── Blocked Users section ─────────────────────────────────────────────────────

const BlockedUsers = () => {
    const [blocked, setBlocked] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        safetyService
            .getBlockedUsers()
            .then((res) => setBlocked(res.data ?? res))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleUnblock = async (blockedId) => {
        if (!window.confirm('Unblock this user?')) return;
        try {
            await safetyService.unblockUser(blockedId);
            setBlocked((prev) => prev.filter((b) => (b.blockedId?._id ?? b.blockedId) !== blockedId));
        } catch (err) {
            alert(err.message || 'Failed to unblock user.');
        }
    };

    return (
        <section className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <UserX className="w-5 h-5 text-stone-600" />
                <h2 className="text-lg font-semibold text-stone-900">Blocked Users</h2>
            </div>
            <p className="text-sm text-stone-500 mb-4">
                Blocked users won&apos;t be matched with you on trips.
            </p>

            {loading ? (
                <p className="text-sm text-stone-400">Loading…</p>
            ) : blocked.length === 0 ? (
                <p className="text-sm text-stone-400 italic">You haven&apos;t blocked anyone.</p>
            ) : (
                <ul className="space-y-2">
                    {blocked.map((b) => {
                        const user = b.blockedId ?? {};
                        const id = user._id ?? b.blockedId;
                        const name = user.name ?? user.email ?? id;
                        return (
                            <li key={id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                                <p className="text-sm font-medium text-stone-800">{name}</p>
                                <button
                                    onClick={() => handleUnblock(id)}
                                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                                >
                                    Unblock
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};

// ── Report Incident form ──────────────────────────────────────────────────────

const ReportIncident = () => {
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await safetyService.reportIncident(null, description);
            setSubmitted(true);
            setDescription('');
        } catch (err) {
            setError(err.message || 'Failed to submit report.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-stone-900">Report an Incident</h2>
            </div>

            {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
                    ✓ Your report has been submitted. Our team will review it within 48 hours.
                    <button
                        className="ml-3 underline text-emerald-700"
                        onClick={() => setSubmitted(false)}
                    >
                        Submit another
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        required
                        minLength={10}
                        rows={4}
                        placeholder="Describe what happened…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting…' : 'Submit Report'}
                    </button>
                </form>
            )}
        </section>
    );
};

// ── Page shell ────────────────────────────────────────────────────────────────

/**
 * Stories 5.7, 5.10 — Safety hub: emergency contacts, blocked users, incident reporting.
 * Route: /safety
 */
const SafetyHub = () => (
    <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            <div>
                <h1 className="text-2xl font-bold text-stone-900">Safety</h1>
                <p className="text-sm text-stone-500">Manage your safety preferences and contacts.</p>
            </div>
        </div>
        <EmergencyContacts />
        <BlockedUsers />
        <ReportIncident />
    </div>
);

export default SafetyHub;
