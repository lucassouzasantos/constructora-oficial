
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Target, Banknote } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import { formatCurrency } from '../utils/format';

interface CostCenter {
    id: number;
    name: string;
    code: string;
    active: boolean;
    budget?: number;
}

interface CostCentersManagerProps {
    onLaunchExpense: (id: number) => void;
}

export default function CostCentersManager({ onLaunchExpense }: CostCentersManagerProps) {
    const [items, setItems] = useState<CostCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<CostCenter>>({});
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/cost-centers');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching cost centers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingId ? 'PATCH' : 'POST';
        const url = editingId
            ? `http://localhost:3000/cost-centers/${editingId}`
            : 'http://localhost:3000/cost-centers';

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({});
            fetchItems();
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminar centro de custos?')) return;
        try {
            await fetch(`http://localhost:3000/cost-centers/${id}`, { method: 'DELETE' });
            fetchItems();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const openEdit = (item: CostCenter) => {
        setFormData(item);
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const openNew = () => {
        setFormData({ active: true });
        setEditingId(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Gerenciar Centros de Custo</h3>
                <button
                    onClick={openNew}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Novo Centro de Custo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar centro de custo..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">Nome</th>
                                <th className="px-6 py-3 font-medium">Código</th>
                                <th className="px-6 py-3 font-medium">Valor Estimado</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{item.code || '-'}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {item.budget ? formatCurrency(Number(item.budget)) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <button
                                            onClick={() => onLaunchExpense(item.id)}
                                            className="text-green-600 hover:text-green-800 p-1 flex items-center gap-1 text-xs font-medium bg-green-50 hover:bg-green-100 rounded-md px-2"
                                            title="Lançar Gasto"
                                        >
                                            <Banknote className="w-4 h-4" />
                                            Lançar
                                        </button>
                                        <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700 p-1">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        {loading ? 'Carregando...' : 'Nenhum centro de custo cadastrado.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">
                            {editingId ? 'Editar' : 'Novo'} Centro de Custo
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                <input
                                    required
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Ex: Administrativo, Marketing..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Código (Opcional)</label>
                                <input
                                    value={formData.code || ''}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Ex: ADM-01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Custo (Opcional)</label>
                                <CurrencyInput
                                    value={formData.budget || ''}
                                    onValueChange={(val) => setFormData({ ...formData, budget: val ? Number(val) : undefined })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Ex: 50.000.000"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="active" className="text-sm text-slate-700">Ativo</label>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
