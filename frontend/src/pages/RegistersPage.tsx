import { useState, useEffect } from 'react';
import { Pencil, Search, Plus, Building, Users, Trash2 } from 'lucide-react';

interface Supplier {
    id: number;
    name: string;
    ruc: string;
    phone: string;
    email: string;
    category: string;
}

interface Customer {
    id: number;
    name: string;
    ci: string;
    phone: string;
    email: string;
    city?: string;
}

interface RegistersPageProps {
    type?: 'ALL' | 'CUSTOMERS' | 'SUPPLIERS';
    hideHeader?: boolean;
}

export default function RegistersPage({ type = 'ALL', hideHeader }: RegistersPageProps) {
    const [activeTab, setActiveTab] = useState<'SUPPLIERS' | 'CUSTOMERS'>(
        type === 'CUSTOMERS' ? 'CUSTOMERS' : 'SUPPLIERS'
    );
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<any>({});
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        if (type !== 'ALL') {
            setActiveTab(type);
        }
    }, [type]);

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        const endpoint = activeTab === 'SUPPLIERS' ? 'suppliers' : 'customers';
        try {
            const response = await fetch(`http://localhost:3000/${endpoint}`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = activeTab === 'SUPPLIERS' ? 'suppliers' : 'customers';
        const method = editingId ? 'PATCH' : 'POST';
        const url = editingId
            ? `http://localhost:3000/${endpoint}/${editingId}`
            : `http://localhost:3000/${endpoint}`;

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
        if (!confirm('Eliminar registro?')) return;
        const endpoint = activeTab === 'SUPPLIERS' ? 'suppliers' : 'customers';
        try {
            const response = await fetch(`http://localhost:3000/${endpoint}/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const data = await response.json();
                alert(data.message || 'Erro ao eliminar. Verifique se existem transações vinculadas.');
                return;
            }
            fetchItems();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Erro ao eliminar registro.');
        }
    };

    const openEdit = (item: any) => {
        setFormData(item);
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const openNew = () => {
        setFormData({});
        setEditingId(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                    {type === 'ALL' ? 'Cadastros' : type === 'SUPPLIERS' ? 'Suprimentos (Fornecedores)' : 'Administração (Clientes)'}
                </h2>
                <button
                    onClick={openNew}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo {activeTab === 'SUPPLIERS' ? 'Fornecedor' : 'Cliente'}
                </button>
            </div>

            {/* Tabs - Only show if type is ALL */}
            {type === 'ALL' && (
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('SUPPLIERS')}
                        className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'SUPPLIERS'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Building className="w-4 h-4" />
                        Fornecedores
                    </button>
                    <button
                        onClick={() => setActiveTab('CUSTOMERS')}
                        className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'CUSTOMERS'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Clientes
                    </button>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Buscar ${activeTab === 'SUPPLIERS' ? 'fornecedor' : 'cliente'}...`}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">Nome</th>
                                <th className="px-6 py-3 font-medium">{activeTab === 'SUPPLIERS' ? 'RUC' : 'CI'}</th>
                                {activeTab === 'CUSTOMERS' && <th className="px-6 py-3 font-medium">Cidade</th>}
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium">Telefone</th>
                                {activeTab === 'SUPPLIERS' && <th className="px-6 py-3 font-medium">Categoria</th>}
                                <th className="px-6 py-3 font-medium text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{activeTab === 'SUPPLIERS' ? item.ruc : item.ci}</td>
                                    {activeTab === 'CUSTOMERS' && <td className="px-6 py-4 text-slate-500">{item.city || '-'}</td>}
                                    <td className="px-6 py-4 text-slate-500">{item.email}</td>
                                    <td className="px-6 py-4 text-slate-500">{item.phone}</td>
                                    {activeTab === 'SUPPLIERS' && <td className="px-6 py-4 text-slate-500">{item.category}</td>}
                                    <td className="px-6 py-4 flex justify-center gap-2">
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        {loading ? 'Carregando...' : 'Nenhum registro encontrado.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">
                            {editingId ? 'Editar' : 'Novo'} {activeTab === 'SUPPLIERS' ? 'Fornecedor' : 'Cliente'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                <input
                                    required
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{activeTab === 'SUPPLIERS' ? 'RUC' : 'CI'}</label>
                                <input
                                    value={(activeTab === 'SUPPLIERS' ? formData.ruc : formData.ci) || ''}
                                    onChange={e => setFormData({ ...formData, [activeTab === 'SUPPLIERS' ? 'ruc' : 'ci']: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                                <input
                                    value={formData.phone || ''}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            {activeTab === 'SUPPLIERS' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                    <input
                                        value={formData.category || ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Ex: Material de Construção"
                                    />
                                </div>
                            )}
                            {activeTab === 'CUSTOMERS' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                                    <input
                                        value={formData.city || ''}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Ex: Asunción"
                                    />
                                </div>
                            )}

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
