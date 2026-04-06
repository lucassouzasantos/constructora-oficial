import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Edit, Copy, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

interface Quote {
    id: number;
    title: string;
    customer: { name: string } | null;
    totalArea: number;
    status: string;
    createdAt: string;
    marginPercentage: number;
    stages: any[];
    indirectCosts: any[];
}

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setQuotes(data);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL}/quotes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchQuotes();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes/${id}/duplicate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchQuotes();
            }
        } catch (error) {
            console.error('Error duplicating:', error);
        }
    };

    const handleConvertToProject = async (id: number) => {
        if (!confirm('Deseja converter este orçamento em uma nova Obra?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes/${id}/convert`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const newProject = await res.json();
                navigate(`/projects/${newProject.id}`);
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error('Conversion failed:', errData);
                alert(`Erro ao converter: ${errData.message || res.statusText}`);
            }
        } catch (error) {
            console.error('Error converting:', error);
            alert('Erro de rede ao tentar converter o orçamento.');
        }
    };

    const calculateTotal = (quote: Quote) => {
        let itemsTotal = 0;
        quote.stages?.forEach((s: any) => {
            s.items?.forEach((i: any) => {
                itemsTotal += (Number(i.quantity) * Number(i.unitCost));
            });
        });
        const indirectTotal = quote.indirectCosts?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;
        const subtotal = itemsTotal + indirectTotal;
        const margin = quote.marginPercentage ? Number(quote.marginPercentage) : 0;
        return subtotal * (1 + (margin / 100));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">Aprovado</span>;
            case 'SENT': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">Enviado</span>;
            case 'REJECTED': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">Rejeitado</span>;
            default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">Rascunho</span>;
        }
    };

    const filteredQuotes = quotes.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Orçamentos e Propostas</h1>
                    <p className="text-slate-500 mt-1">Gerencie propostas comerciais, custos calculados e conversões em obra.</p>
                </div>
                <Link
                    to="/quotes/new"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 mt-2 sm:mt-0 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm shadow-orange-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Orçamento
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por título ou cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Orçamento</th>
                                <th className="px-6 py-4 font-medium">Cliente</th>
                                <th className="px-6 py-4 font-medium">Valor Estimado</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Data</th>
                                <th className="px-6 py-4 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Carregando orçamentos...
                                    </td>
                                </tr>
                            ) : filteredQuotes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum orçamento encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-slate-800 block text-base">{quote.title}</span>
                                                    <span className="text-slate-500 text-xs">{quote.totalArea ? `${quote.totalArea} m²` : 'Sem área'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {quote.customer?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-700">
                                                {formatCurrency(calculateTotal(quote))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(quote.status)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(quote.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleConvertToProject(quote.id)}
                                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Converter em Obra"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDuplicate(quote.id)}
                                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Duplicar Orçamento"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    to={`/quotes/${quote.id}`}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar Detalhes"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(quote.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
