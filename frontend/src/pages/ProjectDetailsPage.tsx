import { formatCurrency } from '../utils/format';
import { useState, useEffect } from 'react';

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, CheckCircle, Circle, Trash2, Battery, Edit, X } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import CurrencyInput from '../components/CurrencyInput';

interface ProjectStage {
    id: number;
    name: string;
    startDatePlanned: string;
    endDatePlanned: string;
    startDateReal?: string;
    endDateReal?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Project {
    id: number;
    name: string;
    location: string;
    customer?: { name: string };
    stages?: ProjectStage[];
    totalArea?: number;
    salesValue?: number;
    status: string;
}

interface Worker {
    id: number;
    name: string;
    role: string;
    dailyRate: number;
}

interface WorkLog {
    id: number;
    date: string;
    days: number;
    description: string;
    worker: Worker;
    amount: number; // calculated cost
}

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [stages, setStages] = useState<ProjectStage[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);

    // Modal controls
    const [activeTab, setActiveTab] = useState('schedule');
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isWorkLogModalOpen, setIsWorkLogModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // WorkLog Form
    const [workLogFormData, setWorkLogFormData] = useState({
        workerId: '',
        date: new Date().toISOString().split('T')[0],
        days: '',
        description: ''
    });

    // ... existing states ...

    const [financeFormData, setFinanceFormData] = useState<{
        description: string;
        amount: string;
        status: string;
        dueDate: string;
        category: string;
        quantity: string;
        unit: string;
    }>({
        description: '',
        amount: '',
        status: 'PENDING',
        dueDate: new Date().toISOString().split('T')[0],
        category: '',
        quantity: '',
        unit: ''
    });

    // ... existing effects ...

    const openMaterialModal = () => {
        setFinanceFormData({
            description: '',
            amount: '',
            status: 'PENDING',
            dueDate: new Date().toISOString().split('T')[0],
            category: 'MATERIAIS',
            quantity: '',
            unit: ''
        });
        setIsMaterialModalOpen(true);
    };

    const openServiceModal = () => {
        setFinanceFormData({
            description: '',
            amount: '',
            status: 'PENDING',
            dueDate: new Date().toISOString().split('T')[0],
            category: 'MÃO_DE_OBRA',
            quantity: '',
            unit: ''
        });
        setIsServiceModalOpen(true);
    };

    const handleFinanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:3000/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...financeFormData,
                    amount: Number(financeFormData.amount),
                    quantity: financeFormData.quantity ? Number(financeFormData.quantity) : null,
                    type: 'EXPENSE',
                    projectId: Number(id)
                }),
            });
            setIsMaterialModalOpen(false);
            setIsServiceModalOpen(false);
            fetchExpenses();
        } catch (error) {
            console.error('Error creating finance entry:', error);
        }
    };
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

    // Editing states
    const [editingStage, setEditingStage] = useState<ProjectStage | null>(null);
    const [editingBudget, setEditingBudget] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        startDatePlanned: '',
        endDatePlanned: '',
        status: 'PENDING'
    });

    const [budgetFormData, setBudgetFormData] = useState({
        category: '',
        amount: '',
        description: ''
    });

    useEffect(() => {
        if (id) {
            fetchProject();
            fetchStages();
            fetchBudgets();
            fetchBudgets();
            fetchExpenses();
            fetchWorkLogs();
            fetchWorkers();
        }
    }, [id]);

    const fetchWorkers = async () => {
        try {
            const response = await fetch('http://localhost:3000/workers');
            const data = await response.json();
            if (Array.isArray(data)) {
                setWorkers(data.filter((w: any) => w.active));
            } else {
                setWorkers([]);
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
            setWorkers([]);
        }
    };

    const fetchWorkLogs = async () => {
        try {
            const response = await fetch(`http://localhost:3000/work-logs?projectId=${id}&t=${new Date().getTime()}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setWorkLogs(data);
            } else {
                setWorkLogs([]);
            }
        } catch (error) {
            console.error('Error fetching work logs:', error);
            setWorkLogs([]);
        }
    };

    const handleWorkLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:3000/work-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: Number(id),
                    workerId: Number(workLogFormData.workerId),
                    date: new Date(workLogFormData.date).toISOString(),
                    days: Number(workLogFormData.days),
                    description: workLogFormData.description
                })
            });
            setIsWorkLogModalOpen(false);
            setWorkLogFormData({
                workerId: '',
                date: new Date().toISOString().split('T')[0],
                days: '',
                description: ''
            });
            fetchWorkLogs();
        } catch (error) {
            console.error('Error creating work log:', error);
        }
    };

    const handleDeleteWorkLog = async (logId: number) => {
        if (!confirm('Excluir lançamento?')) return;
        try {
            await fetch(`http://localhost:3000/work-logs/${logId}`, { method: 'DELETE' });
            fetchWorkLogs();
        } catch (error) {
            console.error('Error deleting work log:', error);
        }
    };

    const fetchBudgets = async () => {
        try {
            const response = await fetch(`http://localhost:3000/project-budgets?projectId=${id}&t=${new Date().getTime()}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setBudgets(data);
            } else {
                setBudgets([]);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    const fetchExpenses = async () => {
        try {
            const response = await fetch(`http://localhost:3000/finance?projectId=${id}&t=${new Date().getTime()}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setExpenses(data);
            } else {
                setExpenses([]);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const openBudgetModal = (budget?: any) => {
        if (budget) {
            setEditingBudget(budget);
            setBudgetFormData({
                category: budget.category,
                amount: budget.amount,
                description: budget.description || ''
            });
        } else {
            setEditingBudget(null);
            setBudgetFormData({ category: '', amount: '', description: '' });
        }
        setIsBudgetModalOpen(true);
    };

    const handleBudgetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingBudget
                ? `http://localhost:3000/project-budgets/${editingBudget.id}`
                : 'http://localhost:3000/project-budgets';

            const method = editingBudget ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...budgetFormData,
                    projectId: Number(id)
                }),
            });
            setIsBudgetModalOpen(false);
            setEditingBudget(null);
            fetchBudgets();
        } catch (error) {
            console.error('Error saving budget:', error);
        }
    };

    const handleDeleteBudget = async (budgetId: number) => {
        if (!confirm('Excluir este orçamento previsto?')) return;
        try {
            await fetch(`http://localhost:3000/project-budgets/${budgetId}`, { method: 'DELETE' });
            fetchBudgets();
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
    };

    const fetchProject = async () => {
        try {
            const response = await fetch(`http://localhost:3000/projects/${id}`);
            const data = await response.json();
            setProject(data);
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    const fetchStages = async () => {
        try {
            const response = await fetch(`http://localhost:3000/project-stages?projectId=${id}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setStages(data);
            } else {
                setStages([]);
            }
        } catch (error) {
            console.error('Error fetching stages:', error);
        }
    };

    const handleOpenModal = (stage?: ProjectStage) => {
        if (stage) {
            setEditingStage(stage);
            setFormData({
                name: stage.name,
                startDatePlanned: stage.startDatePlanned ? stage.startDatePlanned.split('T')[0] : '',
                endDatePlanned: stage.endDatePlanned ? stage.endDatePlanned.split('T')[0] : '',
                status: stage.status
            });
        } else {
            setEditingStage(null);
            setFormData({ name: '', startDatePlanned: '', endDatePlanned: '', status: 'PENDING' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingStage
                ? `http://localhost:3000/project-stages/${editingStage.id}`
                : 'http://localhost:3000/project-stages';

            const method = editingStage ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    projectId: Number(id)
                }),
            });
            setIsModalOpen(false);
            setEditingStage(null);
            fetchStages();
        } catch (error) {
            console.error('Error saving stage:', error);
        }
    };

    const handleDeleteStage = async (stageId: number) => {
        if (!confirm('Excluir etapa?')) return;
        try {
            await fetch(`http://localhost:3000/project-stages/${stageId}`, { method: 'DELETE' });
            fetchStages();
        } catch (error) {
            console.error('Error deleting stage:', error);
        }
    };

    const handleDeleteExpense = async (expenseId: number) => {
        if (!confirm('Excluir lançamento financeiro?')) return;
        try {
            await fetch(`http://localhost:3000/finance/${expenseId}`, { method: 'DELETE' });
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const getProgressData = () => {
        const total = stages.length;
        if (total === 0) return [];

        const completed = stages.filter(s => s.status === 'COMPLETED').length;
        const progress = Math.round((completed / total) * 100);

        return [
            { name: 'Avanço', Realizado: progress, Restante: 100 - progress }
        ];
    };

    const calculateFinancials = () => {
        const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalLabor = workLogs.reduce((acc, curr) => acc + (Number(curr.days) * Number(curr.worker.dailyRate)), 0);
        const totalCost = totalExpenses + totalLabor;

        const totalBudget = budgets.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const budgetDeviation = totalCost - totalBudget;

        const salesValue = Number(project?.salesValue || 0);
        const margin = salesValue > 0 ? ((salesValue - totalCost) / salesValue) * 100 : 0;
        const profit = salesValue - totalCost;

        const totalArea = Number(project?.totalArea || 0);
        const costPerM2 = totalArea > 0 ? totalCost / totalArea : 0;
        const predictedProfit = salesValue - totalBudget;
        const predictedMargin = salesValue > 0 ? (predictedProfit / salesValue) * 100 : 0;

        return { totalCost, totalBudget, budgetDeviation, margin, profit, costPerM2, salesValue, totalArea, predictedProfit, predictedMargin };
    };

    const financials = calculateFinancials();

    const handleFinishProject = async () => {
        if (!confirm('Tem certeza que deseja finalizar esta obra? Não será possível reverter essa ação.')) return;
        try {
            const response = await fetch(`http://localhost:3000/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'FINISHED' })
            });
            if (response.ok) {
                fetchProject();
            }
        } catch (error) {
            console.error('Error finishing project:', error);
        }
    };

    if (!project) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/projects" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
                            {project.status === 'FINISHED' && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase tracking-wide">
                                    Finalizada
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            {project.location} • {project.customer?.name}
                        </p>
                    </div>
                </div>
                {project.status !== 'FINISHED' && (
                    <button
                        onClick={handleFinishProject}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm shadow-green-500/20"
                    >
                        <CheckCircle className="w-5 h-5" /> Finalizar Obra
                    </button>
                )}
            </div>



            {/* Dashboard Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Valor do Contrato</p>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-slate-800">
                            {formatCurrency(financials.salesValue)}
                        </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Lucro Previsto</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${financials.predictedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(financials.predictedProfit)}
                                </span>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${financials.predictedMargin >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {financials.predictedMargin.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Saldo Restante Atual (Margem)</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${financials.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(financials.profit)}
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${financials.margin >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {financials.margin.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">% Executado</p>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-800">
                            {stages.length > 0
                                ? Math.round((stages.filter(s => s.status === 'COMPLETED').length / stages.length) * 100)
                                : 0}%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Desvio Orçamentário</p>
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${financials.budgetDeviation <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(financials.budgetDeviation)}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Previsto: {formatCurrency(financials.totalBudget)}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Custo por m²</p>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-800">
                            {formatCurrency(financials.costPerM2)}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Área: {financials.totalArea} m²
                    </p>
                </div>
            </div>

            {/* Materials and Services Section */}
            <div className="w-full space-y-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Cronograma
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'materials' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Materiais
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Serviços
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'team' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Equipe
                    </button>
                </div>

                {activeTab === 'schedule' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-slate-700">Cronograma de Etapas</h3>
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Nova Etapa
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {stages.map((stage) => (
                                        <div key={stage.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {stage.status === 'COMPLETED' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : stage.status === 'IN_PROGRESS' ? (
                                                    <Battery className="w-5 h-5 text-blue-500" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-slate-300" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-800">{stage.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>
                                                            {stage.startDatePlanned ? stage.startDatePlanned.split('T')[0].split('-').reverse().join('/') : 'A definir'} - {stage.endDatePlanned ? stage.endDatePlanned.split('T')[0].split('-').reverse().join('/') : 'A definir'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={`text-xs px-2 py-1 rounded-full font-medium
                                                        ${stage.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        stage.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-600'}`}>
                                                    {stage.status === 'COMPLETED' ? 'Concluído' :
                                                        stage.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Pendente'}
                                                </div>
                                                <button
                                                    onClick={() => handleOpenModal(stage)}
                                                    className="text-slate-400 hover:text-blue-500 transition-colors"
                                                    title="Editar Etapa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteStage(stage.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Excluir Etapa">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {stages.length === 0 && (
                                        <div className="p-8 text-center text-slate-400">
                                            Nenhuma etapa cadastrada.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-slate-700">Avanço Físico</h3>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getProgressData()} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" hide />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Realizado" fill="#22c55e" radius={[0, 4, 4, 0]} stackId="a" />
                                        <Bar dataKey="Restante" fill="#e2e8f0" radius={[0, 4, 4, 0]} stackId="a" />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-4 text-center">
                                    <span className="text-3xl font-bold text-slate-800">
                                        {stages.length > 0
                                            ? Math.round((stages.filter(s => s.status === 'COMPLETED').length / stages.length) * 100)
                                            : 0}%
                                    </span>
                                    <p className="text-sm text-slate-500">Concluído</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'materials' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-slate-700">Controle de Materiais</h3>
                            <button
                                onClick={() => openMaterialModal()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Registrar Material
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Data</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Item / Descrição</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Qtd</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Unid</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Fornecedor</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Valor Unit.</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Total</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.filter(e => e.category === 'MATERIAIS').map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.dueDate ? item.dueDate.split('T')[0].split('-').reverse().join('/') : '-'}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.description}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.quantity || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.unit || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.supplier?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {item.quantity ? formatCurrency(Number(item.amount) / Number(item.quantity)) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                {formatCurrency(Number(item.amount))}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteExpense(item.id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Excluir Lançamento"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.filter(e => e.category === 'MATERIAIS').length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Nenhum registro de material.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-slate-700">Controle de Serviços</h3>
                            <button
                                onClick={() => openServiceModal()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Registrar Serviço
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Data</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Serviço / Descrição</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Fornecedor / Prestador</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Total</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.filter(e => e.category === 'SERVIÇOS' || e.category === 'MÃO_DE_OBRA').map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.dueDate ? item.dueDate.split('T')[0].split('-').reverse().join('/') : '-'}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.description}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.supplier?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {item.status === 'PAID' ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                {formatCurrency(Number(item.amount))}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteExpense(item.id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Excluir Lançamento"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.filter(e => e.category === 'SERVIÇOS' || e.category === 'MÃO_DE_OBRA').length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhum registro de serviço.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-slate-700">Controle de Mão de Obra</h3>
                            <button
                                onClick={() => setIsWorkLogModalOpen(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Registrar Dias
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Total de Dias</p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {workLogs.reduce((acc, curr) => acc + Number(curr.days), 0)} dias
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Custo Total</p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {formatCurrency(workLogs.reduce((acc, curr) => acc + (Number(curr.days) * Number(curr.worker.dailyRate)), 0))}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Data</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Colaborador</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Dias</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Custo/Dia</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Total</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Descrição</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {workLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {log.date ? log.date.split('T')[0].split('-').reverse().join('/') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                                {log.worker.name}
                                                <span className="block text-xs text-slate-400 font-normal">{log.worker.role}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {log.days} d
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {formatCurrency(log.worker.dailyRate)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                {formatCurrency(Number(log.days) * Number(log.worker.dailyRate))}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {log.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteWorkLog(log.id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {workLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                                Nenhum lançamento de dias de trabalho.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                {/* Budget Section */}
                <div className="space-y-4 mt-16 pt-8 border-t-2 border-slate-100">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-slate-700">Orçamento Previsto vs. Realizado</h3>
                        <button
                            onClick={() => openBudgetModal()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Definir Orçamento
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-slate-100">
                            {/* Planned */}
                            <div className="p-6 space-y-4">
                                <h4 className="font-medium text-slate-500 mb-2 uppercase text-xs tracking-wider">Previsto (Planejamento)</h4>
                                {budgets.length === 0 ? (
                                    <p className="text-slate-400 text-sm">Nenhum orçamento definido.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {['MÃO_DE_OBRA', 'MATERIAIS', 'SERVIÇOS', 'OUTROS'].map(cat => {
                                            const item = budgets.find(b => b.category === cat);
                                            if (!item) return null;
                                            return (
                                                <div key={cat} className="flex justify-between items-center text-sm group">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-700 font-medium capitalize">{cat.replace(/_/g, ' ').toLowerCase()}</span>
                                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openBudgetModal(item)}
                                                                className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                                                                title="Editar Orçamento"
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteBudget(item.id)}
                                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                                title="Excluir Orçamento"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-slate-900">
                                                        {formatCurrency(Number(item.amount))}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <span className="font-bold text-slate-800">Total Previsto</span>
                                            <span className="font-bold text-blue-600 text-lg">
                                                {formatCurrency(budgets.reduce((acc, curr) => acc + Number(curr.amount), 0))}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Realized */}
                            <div className="p-6 space-y-4 bg-slate-50/50">
                                <h4 className="font-medium text-slate-500 mb-2 uppercase text-xs tracking-wider">Realizado (Gastos)</h4>
                                {(expenses.length === 0 && workLogs.length === 0) ? (
                                    <p className="text-slate-400 text-sm">Nenhuma despesa ou custo registrado.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {['MÃO_DE_OBRA', 'MATERIAIS', 'SERVIÇOS', 'OUTROS'].map(cat => {
                                            let total = expenses
                                                .filter(e => e.category === cat && e.type === 'EXPENSE')
                                                .reduce((acc, curr) => acc + Number(curr.amount), 0);

                                            // Include internal labor cost in MÃO_DE_OBRA
                                            if (cat === 'MÃO_DE_OBRA') {
                                                const internalLaborCost = workLogs.reduce((acc, curr) => acc + (Number(curr.days) * Number(curr.worker.dailyRate)), 0);
                                                total += internalLaborCost;
                                            }

                                            const budgetItem = budgets.find(b => b.category === cat);
                                            const budgetAmount = budgetItem ? Number(budgetItem.amount) : 0;
                                            const percent = budgetAmount > 0 ? (total / budgetAmount) * 100 : 0;
                                            const isOver = total > budgetAmount;

                                            if (total === 0 && budgetAmount === 0) return null;

                                            return (
                                                <div key={cat} className="space-y-1">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-700 capitalize">{cat.replace(/_/g, ' ').toLowerCase()}</span>
                                                        <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-slate-900'}`}>
                                                            {formatCurrency(total)}
                                                        </span>
                                                    </div>
                                                    {budgetAmount > 0 && (
                                                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
                                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <span className="font-bold text-slate-800">Total Realizado</span>
                                            <span className="font-bold text-slate-900 text-lg">
                                                {formatCurrency(
                                                    expenses.filter(e => e.type === 'EXPENSE').reduce((acc, curr) => acc + Number(curr.amount), 0) +
                                                    workLogs.reduce((acc, curr) => acc + (Number(curr.days) * Number(curr.worker.dailyRate)), 0)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-slate-800">{editingStage ? 'Editar Etapa' : 'Nova Etapa'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nome da Etapa</label>
                                    <input
                                        required
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Início Planejado</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={formData.startDatePlanned}
                                        onChange={e => setFormData({ ...formData, startDatePlanned: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Término Planejado</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={formData.endDatePlanned}
                                        onChange={e => setFormData({ ...formData, endDatePlanned: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status Atual</label>
                                    <select
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={formData.status}
                                        onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="PENDING">Pendente</option>
                                        <option value="IN_PROGRESS">Em Andamento</option>
                                        <option value="COMPLETED">Concluído</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
                                >
                                    {editingStage ? 'Salvar Alterações' : 'Adicionar Etapa'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Budget Modal */}
                {isBudgetModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-slate-800">{editingBudget ? 'Editar Orçamento' : 'Definir Orçamento'}</h3>
                                <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleBudgetSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoria</label>
                                    <select
                                        required
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={budgetFormData.category}
                                        onChange={e => setBudgetFormData({ ...budgetFormData, category: e.target.value })}
                                        disabled={!!editingBudget}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="MÃO_DE_OBRA">Mão de Obra</option>
                                        <option value="MATERIAIS">Materiais</option>
                                        <option value="SERVIÇOS">Serviços</option>
                                        <option value="CHAVE_EM_MAO">Chave em Mão</option>
                                        <option value="OUTROS">Outros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Valor Previsto (₲)</label>
                                    <CurrencyInput
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={budgetFormData.amount}
                                        onValueChange={val => setBudgetFormData({ ...budgetFormData, amount: val })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                                >
                                    Salvar Orçamento
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {/* Material/Service Modal */}
            {
                (isMaterialModalOpen || isServiceModalOpen) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-slate-800">
                                    {isMaterialModalOpen ? 'Registrar Material' : 'Registrar Serviço'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsMaterialModalOpen(false);
                                        setIsServiceModalOpen(false);
                                    }}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleFinanceSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {isMaterialModalOpen ? 'Item / Material' : 'Descrição do Serviço'}
                                    </label>
                                    <input
                                        required
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={financeFormData.description}
                                        onChange={e => setFinanceFormData({ ...financeFormData, description: e.target.value })}
                                        placeholder={isMaterialModalOpen ? "Ex: Cimento, Areia" : "Ex: Instalação Elétrica"}
                                    />
                                </div>
                                {isMaterialModalOpen && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Qtd</label>
                                            <input
                                                type="number"
                                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={financeFormData.quantity}
                                                onChange={e => setFinanceFormData({ ...financeFormData, quantity: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Unidade</label>
                                            <input
                                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={financeFormData.unit}
                                                onChange={e => setFinanceFormData({ ...financeFormData, unit: e.target.value })}
                                                placeholder="Ex: sc, m, un"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Valor Total (₲)</label>
                                    <CurrencyInput
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={financeFormData.amount}
                                        onValueChange={val => setFinanceFormData({ ...financeFormData, amount: val })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Data</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={financeFormData.dueDate}
                                            onChange={e => setFinanceFormData({ ...financeFormData, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={financeFormData.status}
                                            onChange={e => setFinanceFormData({ ...financeFormData, status: e.target.value })}
                                        >
                                            <option value="PAID">Pago</option>
                                            <option value="PENDING">Pendente</option>
                                        </select>
                                    </div>
                                </div>
                                {isServiceModalOpen && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Categoria</label>
                                        <select
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={financeFormData.category}
                                            onChange={e => setFinanceFormData({ ...financeFormData, category: e.target.value })}
                                        >
                                            <option value="MÃO_DE_OBRA">Mão de Obra</option>
                                            <option value="SERVIÇOS">Serviços Terc.</option>
                                        </select>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                                >
                                    Registrar {isMaterialModalOpen ? 'Material' : 'Serviço'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* WorkLog Modal */}
            {
                isWorkLogModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-slate-800">Registrar Dias</h3>
                                <button onClick={() => setIsWorkLogModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleWorkLogSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Colaborador</label>
                                    <select
                                        required
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={workLogFormData.workerId}
                                        onChange={e => setWorkLogFormData({ ...workLogFormData, workerId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {workers.map(worker => (
                                            <option key={worker.id} value={worker.id}>
                                                {worker.name} ({formatCurrency(worker.dailyRate)}/dia)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Data</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={workLogFormData.date}
                                        onChange={e => setWorkLogFormData({ ...workLogFormData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Dias Trabalhados</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.5"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={workLogFormData.days}
                                        onChange={e => setWorkLogFormData({ ...workLogFormData, days: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Descrição / Atividade</label>
                                    <input
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={workLogFormData.description}
                                        onChange={e => setWorkLogFormData({ ...workLogFormData, description: e.target.value })}
                                        placeholder="Ex: Reboco parede sala"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
                                >
                                    Registrar Dias
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
