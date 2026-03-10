import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import { adminSafetyService } from '../../services/adminSafetyService';

/**
 * Story 5.5 — Admin: publish safety guidelines.
 * Route: /admin/guidelines
 */
const GuidelinesAdmin = () => {
    const [active, setActive] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: '', content: '' });
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadActive = () =>
        adminSafetyService
            .getActiveGuideline()
            .then((res) => setActive(res.data ?? res))
            .catch(() => setActive(null))
            .finally(() => setLoading(false));

    useEffect(() => { loadActive(); }, []);

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;
        setPublishing(true);
        setError('');
        setSuccess('');
        try {
            await adminSafetyService.publishGuideline(form.title.trim(), form.content.trim());
            setForm({ title: '', content: '' });
            setSuccess('Guideline published successfully. Previous version deactivated.');
            setLoading(true);
            await loadActive();
        } catch (err) {
            setError(err.message || 'Failed to publish guideline.');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-emerald-600" />
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Safety Guidelines</h1>
                    <p className="text-sm text-stone-500">Publish community safety guidelines for all users.</p>
                </div>
            </div>

            {/* Current active guideline */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-stone-50 border-b flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-semibold text-stone-700">Current Active Guideline</h2>
                </div>
                <div className="p-5">
                    {loading ? (
                        <p className="text-sm text-stone-400">Loading…</p>
                    ) : !active ? (
                        <p className="text-sm text-stone-400 italic">No active guideline published yet.</p>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-stone-800">{active.title}</p>
                                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                                    v{active.version}
                                </span>
                            </div>
                            <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
                                {active.content}
                            </p>
                            <p className="text-xs text-stone-400">
                                Published {new Date(active.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                })}
                                {' '}· {active.acceptances?.length ?? 0} acceptance(s)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Publish new guideline */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-base font-semibold text-stone-900 mb-4">Publish New Version</h2>
                <form onSubmit={handlePublish} className="space-y-4">
                    <div>
                        <label className="block text-sm text-stone-600 mb-1">Title</label>
                        <input
                            required
                            placeholder="e.g., GreenCommute Community Safety Rules v3"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-stone-600 mb-1">Content</label>
                        <textarea
                            required
                            rows={8}
                            placeholder="Write the full guideline content here…"
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                        ⚠ Publishing a new guideline will deactivate the current one. All users will be
                        prompted to re-accept.
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-emerald-700">{success}</p>}

                    <button
                        type="submit"
                        disabled={publishing || !form.title || !form.content}
                        className="px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                        {publishing ? 'Publishing…' : 'Publish Guideline'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GuidelinesAdmin;
