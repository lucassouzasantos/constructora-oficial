import { formatCurrency } from '../utils/format';
import { useState, useEffect } from 'react';
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Activity, Pencil, Trash, CheckCircle, Target } from 'lucide-react';
import { toast } from 'sonner';
import TransactionModal from '../components/TransactionModal';
import CostCentersManager from '../components/CostCentersManager';
import { TableRowSkeleton } from '../components/Skeletons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { api } from '../utils/api';

interface Transaction {
    id: number;
    description: string;
    amount: string;
    type: 'INCOME' | 'EXPENSE';
    status: 'PENDING' | 'PAID';
    dueDate: string;
    supplier?: { id: number; name: string };
    customer?: { id: number; name: string };
    supplierId?: number;
    customerId?: number;
    projectId?: number;
    category?: string;
}

interface CashFlowItem {
    date: string;
    inflow: number;
    outflow: number;
    dailyBalance: number;
    runningBalance: number;
}

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE' | 'CASH_FLOW' | 'COST_CENTER'>('EXPENSE');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([]);
    const [summary, setSummary] = useState({
        currentBalance: 0,
        projectedBalance: 0,
        pendingInflow: 0,
        pendingOutflow: 0
    });
    const [inventoryTotal, setInventoryTotal] = useState(0);

    useEffect(() => {
        // Fetch on mount or when switching to CASH_FLOW to ensure freshness
        fetchTransactions();
        fetchInventory();
    }, [activeTab]);

    useEffect(() => {
        if (transactions.length > 0) {
            calculateCashFlow();
        }
    }, [transactions]);

    const fetchTransactions = async () => {
        try {
            const data = await api.get<Transaction[]>(`/finance?t=${new Date().getTime()}`);
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const data = await api.get<any[]>(`/inventory?t=${new Date().getTime()}`);
            const total = data.reduce((acc: number, item: any) => acc + ((Number(item.quantity) || 0) * (Number(item.unitValue) || 0)), 0);
            setInventoryTotal(total);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    const calculateCashFlow = () => {
        if (!transactions.length) return;

        const sorted = [...transactions].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        // Calculate Summary
        let currentBalance = 0;
        let pendingInflow = 0;
        let pendingOutflow = 0;

        sorted.forEach(t => {
            const val = t.amount ? Number(t.amount) : 0;
            if (isNaN(val)) return;

            // Normalize Status
            const isPaid = t.status === 'PAID';

            if (isPaid) {
                if (t.type === 'INCOME') currentBalance += val;
                else currentBalance -= val;
            } else {
                if (t.type === 'INCOME') pendingInflow += val;
                else pendingOutflow += val;
            }
        });

        // Group by Date for Table
        const groupedByDate: Record<string, { inflow: number, outflow: number }> = {};

        sorted.forEach(t => {
            const date = new Date(t.dueDate).toISOString().split('T')[0];
            if (!groupedByDate[date]) groupedByDate[date] = { inflow: 0, outflow: 0 };

            const val = t.amount ? Number(t.amount) : 0;
            if (isNaN(val)) return;

            if (t.type === 'INCOME') groupedByDate[date].inflow += val;
            else groupedByDate[date].outflow += val;
        });

        // Generate Cash Flow Line Items
        let runningBalance = 0;

        const flowData: CashFlowItem[] = Object.keys(groupedByDate).sort().map(date => {
            const day = groupedByDate[date];
            const dailyNet = day.inflow - day.outflow;
            runningBalance += dailyNet;
            return {
                date,
                inflow: day.inflow,
                outflow: day.outflow,
                dailyBalance: dailyNet,
                runningBalance: runningBalance
            };
        });

        setCashFlowData(flowData);
        setSummary({
            currentBalance,
            projectedBalance: currentBalance + pendingInflow - pendingOutflow,
            pendingInflow,
            pendingOutflow
        });
    };

    const handleSave = async (data: any) => {
        try {
            if (data.id) {
                await api.patch(`/finance/${data.id}`, data);
            } else {
                await api.post('/finance', data);
            }
            fetchTransactions();
            setIsModalOpen(false);
            setEditingTransaction(null);
            toast.success('Transação salva com sucesso!');
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const handleToggleStatus = async (transaction: Transaction) => {
        const newStatus = transaction.status === 'PENDING' ? 'PAID' : 'PENDING';
        try {
            await api.patch(`/finance/${transaction.id}`, { status: newStatus });
            toast.success('Status da transação atualizado!');
            fetchTransactions();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

        try {
            await api.delete(`/finance/${id}`);
            toast.success('Transação excluída com sucesso!');
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const openEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleLaunchExpense = (costCenterId: number) => {
        setEditingTransaction({
            costCenterId,
            type: 'EXPENSE',
            // Default values
            description: '',
            amount: '',
            status: 'PENDING',
            dueDate: new Date().toISOString().split('T')[0]
        } as any);
        setIsModalOpen(true);
    };

    const filteredTransactions = transactions.filter(t => t.type === activeTab);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>
                {(activeTab === 'INCOME' || activeTab === 'EXPENSE') && (
                    <Button onClick={openCreateModal} leftIcon={<Plus className="w-5 h-5" />}>
                        Nova {activeTab === 'INCOME' ? 'Receita' : 'Despesa'}
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('EXPENSE')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'EXPENSE'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <ArrowDownCircle className="w-4 h-4" />
                    Contas a Pagar
                </button>
                <button
                    onClick={() => setActiveTab('INCOME')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'INCOME'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <ArrowUpCircle className="w-4 h-4" />
                    Contas a Receber
                </button>
                <button
                    onClick={() => setActiveTab('CASH_FLOW')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'CASH_FLOW'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Activity className="w-4 h-4" />
                    Fluxo de Caixa
                </button>
                <button
                    onClick={() => setActiveTab('COST_CENTER')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'COST_CENTER'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Target className="w-4 h-4" />
                    Centros de Custo
                </button>
            </div>

            {/* Content */}
            {activeTab === 'CASH_FLOW' && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-sm text-slate-500">Saldo Atual (Realizado)</p>
                            <p className={`text-2xl font-bold ${summary.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.currentBalance)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-sm text-slate-500">Entradas Futuras</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(summary.pendingInflow)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-sm text-slate-500">Saídas Futuras</p>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(summary.pendingOutflow)}
                            </p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 dark">
                            <p className="text-sm text-slate-400">Saldo Projetado</p>
                            <p className={`text-2xl font-bold ${summary.projectedBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(summary.projectedBalance)}
                            </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-200">
                            <p className="text-sm text-orange-600">Capital em Estoque</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {formatCurrency(inventoryTotal)}
                            </p>
                        </div>
                    </div>

                    {/* Cash Flow Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Data</th>
                                        <th className="px-6 py-3 font-medium text-green-600 text-right">Entradas</th>
                                        <th className="px-6 py-3 font-medium text-red-600 text-right">Saídas</th>
                                        <th className="px-6 py-3 font-medium text-right">Resultado Dia</th>
                                        <th className="px-6 py-3 font-medium text-right">Saldo Acumulado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
                                    ) : (
                                        cashFlowData.map((item) => (
                                            <tr key={item.date} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-green-600 text-right">
                                                    {formatCurrency(item.inflow)}
                                                </td>
                                                <td className="px-6 py-4 text-red-600 text-right">
                                                    {formatCurrency(item.outflow)}
                                                </td>
                                                <td className={`px-6 py-4 font-medium text-right ${item.dailyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(item.dailyBalance)}
                                                </td>
                                                <td className={`px-6 py-4 font-bold text-right ${item.runningBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                    {formatCurrency(item.runningBalance)}
                                                </td>
                                            </tr>
                                        )))}
                                    {cashFlowData.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                Sem dados para exibição.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {(activeTab === 'INCOME' || activeTab === 'EXPENSE') && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <div className="max-w-md">
                            <Input
                                icon={<Search className="w-4 h-4" />}
                                placeholder="Buscar transação..."
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Descrição</th>
                                    <th className="px-6 py-3 font-medium">{activeTab === 'EXPENSE' ? 'Fornecedor' : 'Cliente'}</th>
                                    <th className="px-6 py-3 font-medium">Vencimento</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Valor</th>
                                    <th className="px-6 py-3 font-medium text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800">{transaction.description}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {transaction.supplier?.name || transaction.customer?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(transaction.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={transaction.status === 'PAID' ? 'success' : 'warning'}>
                                                    {transaction.status === 'PAID' ? 'Pago' : 'Pendente'}
                                                </Badge>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {formatCurrency(Number(transaction.amount))}
                                            </td>
                                            <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleStatus(transaction)}
                                                    className={transaction.status === 'PAID' ? 'text-green-600' : 'text-slate-400'}
                                                    title={transaction.status === 'PAID' ? "Marcar como Pendente" : "Marcar como Pago/Recebido"}
                                                >
                                                    <CheckCircle className={`w-4 h-4 ${transaction.status === 'PAID' ? 'fill-current' : ''}`} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(transaction)}
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(transaction.id)}
                                                    title="Excluir"
                                                >
                                                    <Trash className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </td>
                                        </tr>
                                    )))}
                                {filteredTransactions.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            {loading ? 'Carregando...' : 'Nenhuma transação encontrada.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
            }

            {
                activeTab === 'COST_CENTER' && (
                    <CostCentersManager onLaunchExpense={handleLaunchExpense} />
                )
            }

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                type={(activeTab === 'INCOME' || activeTab === 'EXPENSE') ? activeTab : 'EXPENSE'}
                initialData={editingTransaction}
            />
        </div >
    );
}
