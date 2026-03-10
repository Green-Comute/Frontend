import { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { adminSafetyService } from '../../services/adminSafetyService';

/**
 * Story 5.5 — View and accept the active safety guideline.
 * Route: /safety/guidelines
 */
const SafetyGuidelines = () => {
    const [guideline, setGuideline] = useState(null);
    const [, setAcceptance] = useState(null); // { required, guidelineId }
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            adminSafetyService.getActiveGuideline().catch(() => null),
            adminSafetyService.checkAcceptance().catch(() => null),
        ]).then(([guidelineRes, acceptanceRes]) => {
            if (guidelineRes) setGuideline(guidelineRes.data ?? guidelineRes);
            if (acceptanceRes) {
                const a = acceptanceRes.data ?? acceptanceRes;
                setAcceptance(a);
                setAccepted(!a.required);
            }
        }).finally(() => setLoading(false));
    }, []);

    const handleAccept = async () => {
        if (!guideline) return;
        setAccepting(true);
        setError('');
        try {
            await adminSafetyService.acceptGuideline(guideline._id);
            setAccepted(true);
            setAcceptance((prev) => ({ ...prev, required: false }));
        } catch (err) {
            setError(err.message || 'Failed to record acceptance.');
        } finally {
            setAccepting(false);
        }
    };

    if (loading) return <div className="p-8 text-stone-500">Loading guidelines…</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Safety Guidelines</h1>
                    <p className="text-sm text-stone-500">Community rules for safe and respectful rides.</p>
                </div>
            </div>

            {!guideline ? (
                <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-stone-400 text-sm">
                    No safety guidelines have been published yet.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-stone-900">{guideline.title}</h2>
                            <p className="text-xs text-stone-500 mt-0.5">
                                Version {guideline.version} &nbsp;·&nbsp; Published{' '}
                                {new Date(guideline.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                })}
                            </p>
                        </div>
                        {accepted && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Accepted
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5">
                        <div className="prose prose-sm max-w-none text-stone-700 whitespace-pre-wrap leading-relaxed">
                            {guideline.content}
                        </div>
                    </div>

                    {/* Accept CTA */}
                    {!accepted && (
                        <div className="border-t px-6 py-4 bg-stone-50 flex items-center justify-between gap-4">
                            <p className="text-sm text-stone-600">
                                Please read and accept these guidelines to continue using GreenCommute.
                            </p>
                            <button
                                onClick={handleAccept}
                                disabled={accepting}
                                className="shrink-0 px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                                {accepting ? 'Saving…' : 'I Accept'}
                            </button>
                        </div>
                    )}
                    {error && (
                        <p className="px-6 pb-4 text-sm text-red-500">{error}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SafetyGuidelines;
