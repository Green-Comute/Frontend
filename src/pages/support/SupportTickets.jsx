import { useEffect, useState } from 'react';
import { LifeBuoy, PlusCircle, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { supportService } from '../../services/supportService';

const ISSUE_TYPES = ['BILLING', 'SAFETY', 'DRIVER', 'TECHNICAL', 'OTHER'];

const STATUS_COLOR = {
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-stone-100 text-stone-500',
};

// ── New ticket form ────────────────────────────────────────────────────────────

const NewTicketForm = ({ onCreated }) => {
    const [form, setForm] = useState({ issueType: 'TECHNICAL', message: '' });
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.message.trim().length < 10) {
            setError('Message must be at least 10 characters.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            await supportService.createTicket(form.issueType, form.message.trim(), file);
            setForm({ issueType: 'TECHNICAL', message: '' });
            setFile(null);
            onCreated();
        } catch (err) {
            setError(err.message || 'Failed to create ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                New Support Request
            </h2>

            <div>
                <label className="block text-sm text-stone-600 mb-1">Issue Type</label>
                <select
                    value={form.issueType}
                    onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                    className="w-full input-field"
                >
                    {ISSUE_TYPES.map((t) => (
                        <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm text-stone-600 mb-1">Message</label>
                <textarea
                    required
                    minLength={10}
                    rows={4}
                    placeholder="Describe your issue in detail…"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-field resize-none"
                />
                <p className="text-xs text-stone-400 mt-1">{form.message.length} / 2000</p>
            </div>

            {/* Optional attachment */}
            <div>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-800">
                    <Paperclip className="w-4 h-4" />
                    {file ? file.name : 'Attach a file (optional — max 5 MB)'}
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.pdf"
                        className="sr-only"
                        onChange={(e) => setFile(e.target.files[0] ?? null)}
                    />
                </label>
                {file && (
                    <button
                        type="button"
                        className="text-xs text-red-500 mt-1"
                        onClick={() => setFile(null)}
                    >
                        Remove file
                    </button>
                )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
            >
                {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
        </form>
    );
};

// ── Ticket list ───────────────────────────────────────────────────────────────

const TicketRow = ({ ticket }) => {
    const [open, setOpen] = useState(false);
    const statusClass = STATUS_COLOR[ticket.status] ?? 'bg-stone-100 text-stone-500';

    return (
        <li className="border-b last:border-0">
            <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition text-left"
                onClick={() => setOpen((v) => !v)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>
                            {ticket.status}
                        </span>
                        <span className="text-xs text-stone-400">
                            {ticket.issueType.charAt(0) + ticket.issueType.slice(1).toLowerCase()}
                        </span>
                    </div>
                    <p className="text-sm text-stone-700 truncate">{ticket.message}</p>
                </div>
                <div className="ml-3 text-stone-400 shrink-0">
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>
            {open && (
                <div className="px-4 pb-4 space-y-2">
                    <p className="text-sm text-stone-600 whitespace-pre-wrap">{ticket.message}</p>
                    {ticket.attachmentUrl && (
                        <a
                            href={ticket.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-700 underline"
                        >
                            View attachment
                        </a>
                    )}
                    <p className="text-xs text-stone-400">
                        Submitted {new Date(ticket.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium', timeStyle: 'short',
                        })}
                    </p>
                </div>
            )}
        </li>
    );
};

// ── Page ──────────────────────────────────────────────────────────────────────

/**
 * Story 5.9 — Support ticket creation and list.
 * Route: /support/tickets
 */
const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const loadTickets = () =>
        supportService
            .getMyTickets()
            .then((res) => setTickets(res.data ?? res))
            .catch(() => {})
            .finally(() => setLoading(false));

    useEffect(() => { loadTickets(); }, []);

    const handleCreated = async () => {
        setShowForm(false);
        setLoading(true);
        await loadTickets();
    };

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <LifeBuoy className="w-8 h-8 text-emerald-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">Support</h1>
                        <p className="text-sm text-stone-500">Get help from our team.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition"
                >
                    {showForm ? 'Cancel' : '+ New Request'}
                </button>
            </div>

            {showForm && <NewTicketForm onCreated={handleCreated} />}

            {/* Ticket list */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b bg-stone-50">
                    <h2 className="text-sm font-semibold text-stone-700">My Requests</h2>
                </div>
                {loading ? (
                    <p className="p-4 text-sm text-stone-400">Loading…</p>
                ) : tickets.length === 0 ? (
                    <p className="p-4 text-sm text-stone-400 italic">No support requests yet.</p>
                ) : (
                    <ul>
                        {tickets.map((t) => <TicketRow key={t._id} ticket={t} />)}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SupportTickets;
