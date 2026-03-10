import { useEffect, useState } from 'react';
import { FileWarning, ChevronDown, ChevronUp } from 'lucide-react';
import { adminSafetyService } from '../../services/adminSafetyService';

const STATUS_OPTIONS = ['', 'PENDING', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];

const STATUS_COLOR = {
    PENDING: 'bg-amber-100 text-amber-700',
    UNDER_REVIEW: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-stone-100 text-stone-500',
};

const REVIEW_ACTIONS = [
    { value: 'WARN', label: 'Issue Warning (→ Resolved)' },
    { value: 'INVESTIGATE', label: 'Escalate for Investigation (→ Under Review)' },
    { value: 'SUSPEND', label: 'Suspend User (→ Resolved)' },
];

const IncidentRow = ({ incident, onReviewed }) => {
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState('WARN');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const statusClass = STATUS_COLOR[incident.status] ?? 'bg-stone-100 text-stone-500';

    const handleReview = async (e) => {
        e.preventDefault();
        if (note.trim().length < 5) { setError('Note must be at least 5 characters.'); return; }
        setSaving(true);
        setError('');
        try {
            await adminSafetyService.reviewIncident(incident._id, action, note.trim());
            setNote('');
            onReviewed();
        } catch (err) {
            setError(err.message || 'Failed to submit review.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <li className="border-b last:border-0">
            <button
                className="w-full flex items-start gap-3 px-4 py-4 hover:bg-stone-50 transition text-left"
                onClick={() => setOpen((v) => !v)}
            >
                <span className={`shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>
                    {incident.status}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700">{incident.description}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                        Trip: {incident.tripId?.toString?.() ?? '—'} &nbsp;·&nbsp;
                        {new Date(incident.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium', timeStyle: 'short',
                        })}
                    </p>
                </div>
                <div className="ml-2 text-stone-400 shrink-0 mt-0.5">
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {open && (
                <div className="px-4 pb-5 space-y-4">
                    {/* Admin notes history */}
                    {incident.adminNotes?.length > 0 && (
                        <div className="bg-stone-50 rounded-xl p-3 space-y-2">
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Admin Notes</p>
                            {incident.adminNotes.map((n, i) => (
                                <div key={i} className="text-xs text-stone-600">
                                    <span className="font-medium">{n.action}</span> — {n.note}{' '}
                                    <span className="text-stone-400">
                                        ({new Date(n.createdAt).toLocaleDateString()})
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Review form — only for non-closed incidents */}
                    {!['RESOLVED', 'CLOSED'].includes(incident.status) && (
                        <form onSubmit={handleReview} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">Action</label>
                                <select
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    {REVIEW_ACTIONS.map((a) => (
                                        <option key={a.value} value={a.value}>{a.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">Note</label>
                                <textarea
                                    required
                                    minLength={5}
                                    rows={3}
                                    placeholder="Add an admin note (min 5 chars)…"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm resize-none"
                                />
                            </div>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                                {saving ? 'Saving…' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </li>
    );
};

/**
 * Story 5.4 — Admin incident review dashboard.
 * Route: /admin/incidents
 */
const IncidentReview = () => {
    const [incidents, setIncidents] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;
        adminSafetyService
            .getIncidents(statusFilter, page)
            .then((res) => {
                if (!active) return;
                const d = res.data ?? res;
                const list = d.reports ?? d.incidents ?? [];
                setIncidents(Array.isArray(list) ? list : []);
                setTotal(d.total ?? list.length);
            })
            .catch(() => {})
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [statusFilter, page, refreshKey]);

    const handleReviewed = () => { setLoading(true); setRefreshKey((k) => k + 1); };

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3">
                <FileWarning className="w-8 h-8 text-amber-500" />
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Incident Review</h1>
                    <p className="text-sm text-stone-500">Review and action user-reported incidents.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <label className="text-sm text-stone-600 shrink-0">Filter by status:</label>
                <select
                    value={statusFilter}
                    onChange={(e) => { setLoading(true); setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s || 'All'}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-4 text-sm text-stone-400">Loading…</p>
                ) : incidents.length === 0 ? (
                    <p className="p-4 text-sm text-stone-400 italic">No incidents found.</p>
                ) : (
                    <ul>
                        {incidents.map((i) => (
                            <IncidentRow key={i._id} incident={i} onReviewed={handleReviewed} />
                        ))}
                    </ul>
                )}
            </div>

            {/* Pagination */}
            {total > 20 && (
                <div className="flex items-center justify-center gap-3 text-sm">
                    <button
                        disabled={page === 1}
                        onClick={() => { setLoading(true); setPage((p) => p - 1); }}
                        className="px-3 py-1.5 border border-stone-300 rounded-lg disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-stone-500">Page {page}</span>
                    <button
                        disabled={incidents.length < 20}
                        onClick={() => { setLoading(true); setPage((p) => p + 1); }}
                        className="px-3 py-1.5 border border-stone-300 rounded-lg disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default IncidentReview;
