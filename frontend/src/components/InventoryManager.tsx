import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash, Package, AlertTriangle } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import { formatCurrency } from '../utils/format';

interface Project {
    id: number;
    name: string;
}

interface InventoryItem {
    id: number;
    name: string;
    description?: string;
    quantity: string | number;
    unit: string;
    minQuantity?: string | number;
    unitValue?: string | number;
    projectId?: number;
    project?: Project;
}

export default function InventoryManager() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        quantity: string | number;
        unit: string;
        minQuantity: string | number;
        unitValue: string | number;
        projectId: string;
    }>({
        name: '',
        description: '',
        quantity: '',
        unit: 'Un',
        minQuantity: '',
        unitValue: '',
        projectId: '',
    });

    useEffect(() => {
        fetchItems();
        fetchProjects();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch(`http://localhost:3000/inventory?t=${new Date().getTime()}`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:3000/projects');
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleOpenModal = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description || '',
                quantity: item.quantity,
                unit: item.unit,
                minQuantity: item.minQuantity || '',
                unitValue: item.unitValue || '',
                projectId: item.projectId ? item.projectId.toString() : '',
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                quantity: '',
                unit: 'Un',
                minQuantity: '',
                unitValue: '',
                projectId: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este item do estoque?')) return;
        try {
            await fetch(`http://localhost:3000/inventory/${id}`, { method: 'DELETE' });
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingItem ? `http://localhost:3000/inventory/${editingItem.id}` : 'http://localhost:3000/inventory';
        const method = editingItem ? 'PATCH' : 'POST';

        const payload = {
            ...formData,
            quantity: formData.quantity,
            minQuantity: formData.minQuantity ? formData.minQuantity : undefined,
            unitValue: formData.unitValue ? formData.unitValue : undefined,
            projectId: formData.projectId ? Number(formData.projectId) : undefined,
        };

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Erro ao salvar item.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-6 h-6 text-orange-500" />
                        Estoque Físico
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Gerencie materiais e equipamentos no estoque central ou em obras.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl flex items-center gap-3">
                        <span className="text-sm font-medium text-orange-800">Total em Estoque:</span>
                        <span className="text-lg font-bold text-orange-600">
                            {formatCurrency(items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unitValue) || 0)), 0))}
                        </span>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Item
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar itens no estoque..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Material / Item</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Descrição</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Qtd</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">V. Unitário</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">V. Total</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Mín.</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Alocação</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">Carregando itens...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Nenhum item cadastrado no estoque.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => {
                                    const qty = Number(item.quantity);
                                    const minQty = item.minQuantity ? Number(item.minQuantity) : 0;
                                    const isLowStock = minQty > 0 && qty <= minQty;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">{item.description || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                                                        {item.quantity} {item.unit}
                                                    </span>
                                                    {isLowStock && (
                                                        <span title="Estoque Mínimo Atingido!">
                                                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {item.unitValue ? formatCurrency(Number(item.unitValue)) : '-'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {item.unitValue ? formatCurrency(Number(item.quantity) * Number(item.unitValue)) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {item.minQuantity ? `${item.minQuantity} ${item.unit}` : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.project ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {item.project.name}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                        Estoque Central
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingItem ? 'Editar Item do Estoque' : 'Adicionar Novo Item'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Item *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Ex: Cimento Portland 50kg"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Detalhes adicionais, marca, especificações..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade *</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unidade de Medida *</label>
                                    <select
                                        required
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="Un">Unidade (Un)</option>
                                        <option value="Kg">Quilograma (Kg)</option>
                                        <option value="L">Litro (L)</option>
                                        <option value="M">Metro (M)</option>
                                        <option value="M2">Metro Quadrado (M²)</option>
                                        <option value="M3">Metro Cúbico (M³)</option>
                                        <option value="Cx">Caixa (Cx)</option>
                                        <option value="Pct">Pacote (Pct)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.minQuantity}
                                        onChange={e => setFormData({ ...formData, minQuantity: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Avisar abaixo de..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Alocação (Obra)</label>
                                    <select
                                        value={formData.projectId}
                                        onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Estoque Central (Sem Obra)</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Unitário</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 sm:text-sm">Gs</span>
                                        </div>
                                        <CurrencyInput
                                            value={formData.unitValue}
                                            onValueChange={(val) => setFormData({ ...formData, unitValue: val })}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 font-medium rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 font-medium rounded-xl transition-colors shadow-sm"
                                >
                                    {editingItem ? 'Salvar Alterações' : 'Adicionar Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
