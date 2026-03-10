import { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import CurrencyInput from '../components/CurrencyInput';

interface Worker {
    id: number;
    name: string;
    role: string;
    dailyRate: number;
    phone: string;
    active: boolean;
}

export default function TeamPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        dailyRate: '',
        phone: ''
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const response = await fetch('http://localhost:3000/workers');
            const data = await response.json();
            setWorkers(data);
        } catch (error) {
            console.error('Error fetching workers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `http://localhost:3000/workers/${editingId}`
                : 'http://localhost:3000/workers';

            const method = editingId ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setIsModalOpen(false);
            setEditingId(null);
            resetForm();
            fetchWorkers();
        } catch (error) {
            console.error('Error saving worker:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Desativar colaborador?')) return;
        try {
            await fetch(`http://localhost:3000/workers/${id}`, { method: 'DELETE' });
            fetchWorkers();
        } catch (error) {
            console.error('Error deleting worker:', error);
        }
    };

    const handleEdit = (worker: Worker) => {
        setEditingId(worker.id);
        setFormData({
            name: worker.name,
            role: worker.role,
            dailyRate: worker.dailyRate.toString(),
            phone: worker.phone
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', role: '', dailyRate: '', phone: '' });
        setEditingId(null);
    };

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Equipe / Mão de Obra</h2>
                    <p className="text-slate-500">Gerenciamento de colaboradores e taxas horárias</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-5 h-5" /> Novo Colaborador
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou função..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Colaborador</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Função</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Custo/Dia</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Contato</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredWorkers.map(worker => (
                                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-slate-900">{worker.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium bg-slate-50/50 rounded-lg w-fit px-3 py-1 m-2 inline-block">
                                        {worker.role}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                        {formatCurrency(worker.dailyRate)}/dia
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {worker.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${worker.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                            {worker.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {worker.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(worker)} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-blue-600 transition-all">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(worker.id)} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-red-600 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredWorkers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum colaborador encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-lg text-slate-800">
                                {editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Função / Cargo</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="Ex: Pedreiro"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Custo Diário (₲)</label>
                                    <CurrencyInput
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        value={formData.dailyRate}
                                        onValueChange={val => setFormData({ ...formData, dailyRate: val })}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                                    <input
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(09X) ..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-lg shadow-orange-500/20 transition-all"
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
