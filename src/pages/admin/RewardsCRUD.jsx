import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, X, UploadCloud } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

/**
 * Story 4.11 — ORG_ADMIN: Manage Rewards (CRUD)
 */
const RewardsCRUD = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', description: '', pointCost: 100, stock: '', category: 'VOUCHER', imageUrl: ''
    });

    const loadItems = async () => {
        try {
            setLoading(true);
            const res = await gamificationService.listRewardItems();
            setItems(res.data);
        } catch (err) {
            setError(err.message || 'Failed to load items');
        } finally { setLoading(false); }
    };

    useEffect(() => { loadItems(); }, []);

    const openForm = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                pointCost: item.pointCost,
                stock: item.stock === null ? '' : item.stock,
                category: item.category,
                imageUrl: item.imageUrl || ''
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', description: '', pointCost: 100, stock: '', category: 'VOUCHER', imageUrl: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (payload.stock === '') payload.stock = null; // unlimited
            else payload.stock = parseInt(payload.stock);

            if (editingItem) {
                await gamificationService.updateRewardItem(editingItem._id, payload);
            } else {
                await gamificationService.createRewardItem(payload);
            }
            setIsModalOpen(false);
            loadItems();
        } catch (err) {
            alert(err.message || 'Failed to save item');
        }
    };

    const handleDelete = async (id, name) => {
        if (confirm(`Are you sure you want to deactivate "${name}"? It will no longer appear in the catalog.`)) {
            try {
                await gamificationService.deactivateRewardItem(id);
                loadItems();
            } catch (err) { alert(err.message); }
        }
    };

    return (
        <div className="p-6 md:p-8 bg-stone-50 min-h-screen animate-fade-in">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
                            <Package className="w-6 h-6 text-emerald-600" /> Manage Rewards Catalog
                        </h1>
                        <p className="text-sm text-stone-500 mt-1">Add or edit rewards available to your organization</p>
                    </div>
                    <button
                        onClick={() => openForm()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Reward
                    </button>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-stone-500">Loading catalog...</div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center text-stone-500">No items in the catalog yet. Click &quot;Add Reward&quot; to create one.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 border-b">
                                <tr>
                                    <th className="p-4 font-semibold text-stone-600">Item Name</th>
                                    <th className="p-4 font-semibold text-stone-600">Category</th>
                                    <th className="p-4 font-semibold text-stone-600">Cost (pts)</th>
                                    <th className="p-4 font-semibold text-stone-600">Stock</th>
                                    <th className="p-4 font-semibold text-stone-600">Status</th>
                                    <th className="p-4 font-semibold text-right text-stone-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map(item => (
                                    <tr key={item._id} className="hover:bg-stone-50">
                                        <td className="p-4 font-medium text-stone-900">{item.name}</td>
                                        <td className="p-4 text-stone-600 text-sm">{item.category}</td>
                                        <td className="p-4 font-bold text-emerald-600">{item.pointCost}</td>
                                        <td className="p-4 text-stone-600 text-sm">{item.stock === null ? 'Unlimited' : item.stock}</td>
                                        <td className="p-4">
                                            {item.isActive
                                                ? <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">ACTIVE</span>
                                                : <span className="px-2 py-1 bg-stone-100 text-stone-500 text-xs font-bold rounded">INACTIVE</span>
                                            }
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openForm(item)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {item.isActive && (
                                                    <button onClick={() => handleDelete(item._id, item.name)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal Form */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8">
                            <div className="p-6 border-b flex justify-between items-center bg-stone-50">
                                <h3 className="text-lg font-bold text-stone-900">{editingItem ? 'Edit Reward' : 'Add New Reward'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1">Item Name *</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-stone-900" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1">Description</label>
                                    <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-stone-900" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-stone-700 mb-1">Point Cost *</label>
                                        <input type="number" min="1" required value={formData.pointCost} onChange={e => setFormData({ ...formData, pointCost: parseInt(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-stone-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-stone-700 mb-1">Category</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-stone-900 bg-white">
                                            <option value="VOUCHER">Voucher</option>
                                            <option value="MERCHANDISE">Merchandise</option>
                                            <option value="EXPERIENCE">Experience</option>
                                            <option value="DONATION">Donation</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1">Stock (leave blank for unlimited)</label>
                                    <input type="number" min="0" placeholder="Unlimited" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-stone-900" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1 flex items-center gap-2">
                                        <UploadCloud className="w-4 h-4 text-emerald-600" /> Image URL
                                    </label>
                                    <input type="url" placeholder="https://example.com/image.png" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-stone-900" />
                                    <p className="text-xs text-stone-400 mt-1">Link to an external image URL for now.</p>
                                </div>

                                {editingItem && (
                                    <label className="flex items-center gap-2 mt-4 p-3 bg-stone-50 rounded-lg border">
                                        <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-emerald-600" />
                                        <span className="text-sm font-semibold text-stone-700">Currently Active in Catalog</span>
                                    </label>
                                )}

                                <div className="pt-4 flex justify-end gap-3 border-t">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-stone-600 font-medium hover:bg-stone-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm">Save Reward</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RewardsCRUD;
