import { TrendingUp, Users, Wallet, HardHat, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
    const [stats, setStats] = useState({
        activeProjects: 0,
        finishedProjects: 0,
        totalWorkers: 0,
        monthlyRevenue: 0,
        monthlyExpense: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Projects
                const projectsRes = await fetch('http://localhost:3000/projects');
                const projects = await projectsRes.json();
                const activeProjects = Array.isArray(projects) ? projects.filter((p: any) => p.status !== 'FINISHED').length : 0;
                const finishedProjects = Array.isArray(projects) ? projects.filter((p: any) => p.status === 'FINISHED').length : 0;

                // 2. Fetch Workers
                const workersRes = await fetch('http://localhost:3000/workers');
                const workers = await workersRes.json();
                const totalWorkers = Array.isArray(workers) ? workers.length : 0;

                // 3. Fetch Finance for current month
                const financeRes = await fetch(`http://localhost:3000/finance?t=${new Date().getTime()}`);
                const transactions = await financeRes.json();

                let monthlyRevenue = 0;
                let monthlyExpense = 0;

                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                if (Array.isArray(transactions)) {
                    transactions.forEach((t: any) => {
                        const tDate = new Date(t.dueDate);
                        // Filter by Month & Year AND Status PAID
                        if (tDate.getMonth() === currentMonth &&
                            tDate.getFullYear() === currentYear &&
                            t.status === 'PAID') {

                            if (t.type === 'INCOME') monthlyRevenue += Number(t.amount);
                            else monthlyExpense += Number(t.amount);
                        }
                    });
                }

                setStats({
                    activeProjects,
                    finishedProjects,
                    totalWorkers,
                    monthlyRevenue,
                    monthlyExpense
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const cards = [
        { label: 'Obras Ativas', value: loading ? '...' : stats.activeProjects, icon: HardHat, color: 'bg-orange-500', trend: 'Em Andamento' },
        { label: 'Obras Finalizadas', value: loading ? '...' : stats.finishedProjects, icon: CheckCircle, color: 'bg-green-500', trend: 'Concluídas' },
        { label: 'Equipe Total', value: loading ? '...' : stats.totalWorkers, icon: Users, color: 'bg-slate-700', trend: 'Ativos' },
        { label: 'Receita (Mês)', value: loading ? '...' : formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: 'bg-emerald-500', trend: 'Recebido' },
        { label: 'Despesa (Mês)', value: loading ? '...' : formatCurrency(stats.monthlyExpense), icon: Wallet, color: 'bg-red-500', trend: 'Pago' },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {cards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 text-white`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-50 text-slate-600 rounded-full">
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section (Placeholder) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Visão Geral</h3>
                        <p className="text-sm text-slate-400">Implementação futura de gráficos detalhados.</p>
                    </div>
                    <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-300">
                        <p className="text-slate-400">Gráficos em Breve</p>
                    </div>
                </div>

                {/* Side Section (Activity) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Info do Sistema</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-bold text-blue-800">Status</h4>
                            <p className="text-sm text-blue-600">Sistema Operacional conectado ao banco de dados local.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
