import { formatCurrency } from '../utils/format';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Transaction {
    id: number;
    description: string;
    amount: string;
    type: 'INCOME' | 'EXPENSE';
    status: 'PENDING' | 'PAID';
    dueDate: string;
}

interface MonthlyData {
    name: string; // "Jan 2026"
    income: number;
    expense: number;
    profit: number;
}

export default function ReportsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [inventoryTotal, setInventoryTotal] = useState(0);

    // Filter State
    const [dateRange, setDateRange] = useState<'1M' | '3M' | '6M' | '9M' | '12M' | 'CUSTOM'>('6M');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    useEffect(() => {
        fetchTransactions();
        fetchInventory();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            processData();
        }
    }, [transactions, dateRange, customStart, customEnd]);

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`http://localhost:3000/finance?t=${new Date().getTime()}`);
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await fetch(`http://localhost:3000/inventory?t=${new Date().getTime()}`);
            const data = await response.json();
            const total = data.reduce((acc: number, item: any) => acc + ((Number(item.quantity) || 0) * (Number(item.unitValue) || 0)), 0);
            setInventoryTotal(total);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    const processData = () => {
        const grouped: Record<string, { income: number, expense: number, dateObj: number }> = {};

        // Calculate Filter Dates
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        if (dateRange === 'CUSTOM') {
            if (!customStart || !customEnd) return; // Wait for both
            startDate = new Date(customStart + 'T00:00:00');
            endDate = new Date(customEnd + 'T23:59:59');
        } else {
            // Fixed Ranges
            const monthsBack = parseInt(dateRange.replace('M', ''));
            startDate.setMonth(now.getMonth() - monthsBack + 1); // +1 to include current month fully? Usually standard is (now - X months)
            startDate.setDate(1); // Start from beginning of that month
            startDate.setHours(0, 0, 0, 0);
            endDate = now; // Until now
        }

        transactions.forEach(t => {
            if (t.status !== 'PAID') return;
            const tDate = new Date(t.dueDate);

            // Apply Date Filter
            if (tDate < startDate || tDate > endDate) return;

            // Sortable key: YYYY-MM
            const sortKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;

            // Use sortKey for internal sorting, but we can store display name separately if needed
            // For now, let's just use the monthYearInfo as key if unique enough? 
            // Better to group by sortKey first to ensure unique naming collisions (e.g. Jan 2026 vs Jan 2025) don't happen if using name.
            // Actually, the current code used displayKey. Let's stick to simple grouping by YYYY-MM then map to name.

            if (!grouped[sortKey]) {
                grouped[sortKey] = {
                    income: 0,
                    expense: 0,
                    dateObj: tDate.getTime() // Approximate for sorting (not perfect for end of month)
                };
            }

            const val = Number(t.amount);
            if (t.type === 'INCOME') grouped[sortKey].income += val;
            else grouped[sortKey].expense += val;
        });

        const data = Object.keys(grouped)
            .sort() // YYYY-MM sorts correctly alphabetically
            .map(key => {
                const [year, month] = key.split('-');
                const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });

                return {
                    name: monthName,
                    income: grouped[key].income,
                    expense: grouped[key].expense,
                    profit: grouped[key].income - grouped[key].expense,
                    timestamp: grouped[key].dateObj
                };
            });

        setMonthlyData(data);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Relatórios Financeiros</h2>
                    <div className="hidden sm:flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full border border-orange-200 text-sm font-medium">
                        Capital em Estoque: {formatCurrency(inventoryTotal)}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    {['1M', '3M', '6M', '9M', '12M'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range as any)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === range
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button
                        onClick={() => setDateRange('CUSTOM')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === 'CUSTOM'
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Personalizado
                    </button>
                </div>
            </div>

            {/* Custom Range Inputs */}
            {dateRange === 'CUSTOM' && (
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600">De:</label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600">Até:</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-700 mb-6">Entradas vs Saídas</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-700 mb-6">Evolução do Resultado (Lucro/Prejuízo)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Area type="monotone" dataKey="profit" name="Resultado Líquido" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* DRE Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-700">Demonstrativo de Resultados (DRE)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Período</th>
                                <th className="px-6 py-4 font-medium text-right text-green-600">Receita Bruta</th>
                                <th className="px-6 py-4 font-medium text-right text-red-600">Despesas</th>
                                <th className="px-6 py-4 font-medium text-right text-blue-600">Resultado Líquido</th>
                                <th className="px-6 py-4 font-medium text-right">Margem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {monthlyData.map((item) => (
                                <tr key={item.name} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4 text-right text-green-600 font-medium">{formatCurrency(item.income)}</td>
                                    <td className="px-6 py-4 text-right text-red-600 font-medium">{formatCurrency(item.expense)}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${item.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {formatCurrency(item.profit)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600">
                                        {item.income > 0 ? ((item.profit / item.income) * 100).toFixed(1) + '%' : '-'}
                                    </td>
                                </tr>
                            ))}
                            {monthlyData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum dado financeiro registrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
