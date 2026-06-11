import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import { api } from '../utils/api';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    type: 'INCOME' | 'EXPENSE';
    initialData?: any;
}

export default function TransactionModal({ isOpen, onClose, onSave, type, initialData }: TransactionModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('PENDING');
    const [loading, setLoading] = useState(false);

    // New fields
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [entities, setEntities] = useState<any[]>([]);

    // Project and Category fields
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCostCenterId, setSelectedCostCenterId] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [costCenters, setCostCenters] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchEntities();
            fetchProjects();
            fetchCostCenters();

            if (initialData) {
                setDescription(initialData.description || '');
                setAmount(initialData.amount ? String(initialData.amount) : '');
                setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
                setStatus(initialData.status || 'PENDING');

                // Set Entity (Supplier or Customer)
                if (initialData.supplierId) setSelectedEntityId(String(initialData.supplierId));
                else if (initialData.customerId) setSelectedEntityId(String(initialData.customerId));
                else setSelectedEntityId('');

                // Set Project and Category
                setSelectedProjectId(initialData.projectId ? String(initialData.projectId) : '');
                setSelectedCategory(initialData.category || '');
                setSelectedCostCenterId(initialData.costCenterId ? String(initialData.costCenterId) : '');
            } else {
                // Reset if opening in create mode
                setDescription('');
                setAmount('');
                setDueDate('');
                setStatus('PENDING');
                setSelectedEntityId('');
                setSelectedProjectId('');
                setSelectedCategory('');
                setSelectedCostCenterId('');
            }
        }
    }, [isOpen, type, initialData]);

    const fetchEntities = async () => {
        const endpoint = type === 'EXPENSE' ? 'suppliers' : 'customers';
        try {
            const data = await api.get<any[]>(`/${endpoint}`);
            if (Array.isArray(data)) setEntities(data);
        } catch (error) {
            console.error('Error fetching entities:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const data = await api.get<any[]>('/projects');
            if (Array.isArray(data)) setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchCostCenters = async () => {
        try {
            const data = await api.get<any[]>('/cost-centers');
            if (Array.isArray(data)) setCostCenters(data.filter((cc: any) => cc.active));
        } catch (error) {
            console.error('Error fetching cost centers:', error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            description,
            amount: parseFloat(amount),
            dueDate,
            type,
            status // Use selected status
        };

        if (initialData?.id) {
            payload.id = initialData.id;
        }

        if (selectedEntityId) {
            if (type === 'EXPENSE') payload.supplierId = parseInt(selectedEntityId);
            else payload.customerId = parseInt(selectedEntityId);
        } else {
            if (type === 'EXPENSE') payload.supplierId = null;
            else payload.customerId = null;
        }

        if (selectedProjectId) {
            payload.projectId = parseInt(selectedProjectId);
        } else {
            payload.projectId = null;
        }

        if (selectedCategory) {
            payload.category = selectedCategory;
        } else {
            payload.category = null;
        }

        if (selectedCostCenterId) {
            payload.costCenterId = parseInt(selectedCostCenterId);
        } else {
            payload.costCenterId = null;
        }

        await onSave(payload);
        setLoading(false);
        onClose();

        // Reset logic is now handled by useEffect when modal opens/changes data
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">
                        {initialData ? 'Editar' : 'Nova'} {type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                        <input
                            required
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            placeholder={type === 'INCOME' ? "Ex: Venda de Imóvel" : "Ex: Compra de Cimento"}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor (₲)</label>
                            <CurrencyInput
                                required
                                value={amount}
                                onValueChange={(val) => setAmount(val)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                            <input
                                required
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${status === 'PAID'
                                    ? 'bg-green-50 border-green-200 text-green-700 focus:ring-green-500'
                                    : 'bg-yellow-50 border-yellow-200 text-yellow-700 focus:ring-yellow-500'
                                    }`}
                            >
                                <option value="PENDING">Pendente</option>
                                <option value="PAID">{type === 'INCOME' ? 'Recebido' : 'Pago'}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {type === 'EXPENSE' ? 'Fornecedor' : 'Cliente'} <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <select
                            value={selectedEntityId}
                            onChange={(e) => setSelectedEntityId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="">Selecione...</option>
                            {entities.map(entity => (
                                <option key={entity.id} value={entity.id}>
                                    {entity.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Vincular a Obra (Opcional)</label>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Obra</label>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value="">Sem vínculo</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedProjectId && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Categoria de Custo</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="">Selecione a categoria...</option>
                                        <option value="MATERIAIS">Materiais</option>
                                        <option value="SERVIÇOS">Serviços</option>
                                        <option value="MÃO_DE_OBRA">Mão de Obra</option>
                                        <option value="CHAVE_EM_MAO">Chave em Mão</option>
                                        <option value="OUTROS">Outros</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Centro de Custos (Opcional)</label>
                        <select
                            value={selectedCostCenterId}
                            onChange={(e) => setSelectedCostCenterId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="">Selecione um centro de custo...</option>
                            {costCenters.map(cc => (
                                <option key={cc.id} value={cc.id}>
                                    {cc.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            <Check className="w-4 h-4" />
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
