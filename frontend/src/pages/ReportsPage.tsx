import { formatCurrency } from '../utils/format';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api } from '../utils/api';
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
            const data = await api.get<Transaction[]>(`/finance?t=${new Date().getTime()}`);
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching data:', error);
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
            startDate.setMonth(now.getMonth() - monthsBack + 1);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            // Definimos endDate para o futuro distante, garantindo que contas marcadas como pagas com 
            // data de vencimento no futuro apareçam nas colunas do relatório (ex: Abril, Maio, etc).
            endDate = new Date(9999, 11, 31, 23, 59, 59); 
        }

        transactions.forEach(t => {
            if (t.status !== 'PAID') return;
            
            // Pega estritamente a data (ano-mes-dia) para evitar problemas de fuso horário movendo a data para o dia anterior.
            const [yearStr, monthStr, dayStr] = t.dueDate.split('T')[0].split('-');
            const tDate = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr), 12, 0, 0); // Meio-dia local

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

    const totals = monthlyData.reduce(
        (acc, item) => {
            acc.income += item.income;
            acc.expense += item.expense;
            acc.profit += item.profit;
            return acc;
        },
        { income: 0, expense: 0, profit: 0 }
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Relatórios Financeiros</h2>
                    <p className="text-slate-500 text-sm font-medium">Análise de receitas, despesas e resultados</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    {['1M', '3M', '6M', '9M', '12M'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range as any)}
                            className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all ${dateRange === range
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button
                        onClick={() => setDateRange('CUSTOM')}
                        className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all ${dateRange === 'CUSTOM'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'text-slate-600 hover:bg-slate-100'
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
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600">Até:</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total de Receitas</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totals.income)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total de Despesas</p>
                    <p className="text-2xl font-bold text-rose-600">{formatCurrency(totals.expense)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 mb-1">Resultado Líquido</p>
                    <p className={`text-2xl font-bold ${totals.profit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {formatCurrency(totals.profit)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-indigo-100 flex flex-col justify-center">
                    <p className="text-sm font-medium text-indigo-800/70 mb-1">Capital em Estoque</p>
                    <p className="text-2xl font-bold text-indigo-700">{formatCurrency(inventoryTotal)}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        Entradas vs Saídas
                    </h3>
                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} dy={12} />
                                <YAxis 
                                    tickFormatter={(val) => new Intl.NumberFormat('pt-BR', { notation: "compact", compactDisplay: "short" }).format(val)} 
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    width={65} 
                                />
                                <Tooltip 
                                    formatter={(value: any) => formatCurrency(Number(value))} 
                                    cursor={{ fill: '#f8fafc' }} 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '24px', fontSize: '13px', fontWeight: 500 }} />
                                <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                                <Bar dataKey="expense" name="Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={45} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Trend Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        Evolução do Resultado
                    </h3>
                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} dy={12} />
                                <YAxis 
                                    tickFormatter={(val) => new Intl.NumberFormat('pt-BR', { notation: "compact", compactDisplay: "short" }).format(val)} 
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    width={65} 
                                />
                                <Tooltip 
                                    formatter={(value: any) => formatCurrency(Number(value))} 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '24px', fontSize: '13px', fontWeight: 500 }} />
                                <Area type="monotone" dataKey="profit" name="Resultado Líquido" stroke="#6366f1" strokeWidth={3} fill="#818cf8" fillOpacity={0.15} activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* DRE Table */}
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
                    <h3 className="text-lg font-bold text-slate-800">Demonstrativo de Resultados (DRE)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] text-slate-500 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Período</th>
                                <th className="px-6 py-4 text-right">Receita Bruta</th>
                                <th className="px-6 py-4 text-right">Despesas</th>
                                <th className="px-6 py-4 text-right">Resultado Líquido</th>
                                <th className="px-6 py-4 text-right">Margem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {monthlyData.map((item) => (
                                <tr key={item.name} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">{item.name}</td>
                                    <td className="px-6 py-4 text-right text-emerald-600 font-semibold whitespace-nowrap">{formatCurrency(item.income)}</td>
                                    <td className="px-6 py-4 text-right text-rose-600 font-semibold whitespace-nowrap">{formatCurrency(item.expense)}</td>
                                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${item.profit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                        {formatCurrency(item.profit)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 font-medium whitespace-nowrap">
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
