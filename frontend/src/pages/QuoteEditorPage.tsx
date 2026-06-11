import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, FileDown, Plus, Trash2, ChevronDown, ChevronRight, Calculator } from 'lucide-react';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { formatCurrency } from '../utils/format';
import { api } from '../utils/api';

export default function QuoteEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(isEditing);
    const [activeTab, setActiveTab] = useState('DETAILS'); // DETAILS, STAGES, PROPOSAL
    const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({});

    const proposalRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<any>({
        title: '',
        customerId: '',
        address: '',
        city: '',
        type: 'Residencial',
        totalArea: '',
        responsible: '',
        status: 'DRAFT',
        paymentTerms: '',
        estimatedTime: '',
        includedItems: '',
        excludedItems: '',
        validityDays: 15,
        marginPercentage: 0,
        stages: [],
        indirectCosts: []
    });

    useEffect(() => {
        fetchCustomers();
        if (isEditing) fetchQuote();
    }, [id]);

    const fetchCustomers = async () => {
        try {
            const data = await api.get<any[]>('/customers');
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchQuote = async () => {
        try {
            const data = await api.get<any>(`/quotes/${id}`);
            setFormData({
                ...data,
                customerId: data.customerId || '',
                stages: data.stages || [],
                indirectCosts: data.indirectCosts || []
            });
            const expanded: Record<number, boolean> = {};
            data.stages.forEach((_: any, idx: number) => { expanded[idx] = true; });
            setExpandedStages(expanded);
        } catch (error) {
            console.error('Error fetching quote:', error);
        } finally {
            setLoading(false);
        }
    };

    const parseBrNumber = (val: any): number | undefined => {
        if (val === null || val === undefined || val === '') return undefined;
        // Se for string, remove pontos de milhar e substitui vírgula por ponto.
        const cleanStr = String(val).replace(/\./g, '').replace(',', '.');
        const parsed = Number(cleanStr);
        return isNaN(parsed) ? undefined : parsed;
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                customerId: formData.customerId ? Number(formData.customerId) : undefined,
                totalArea: parseBrNumber(formData.totalArea),
                validityDays: parseBrNumber(formData.validityDays),
                marginPercentage: parseBrNumber(formData.marginPercentage),
                stages: formData.stages.map((s: any) => ({
                    ...s,
                    items: s.items.map((i: any) => ({
                        ...i,
                        quantity: parseBrNumber(i.quantity) || 0,
                        unitCost: parseBrNumber(i.unitCost) || 0
                    }))
                })),
                indirectCosts: formData.indirectCosts.map((ic: any) => ({
                    ...ic,
                    amount: parseBrNumber(ic.amount) || 0
                }))
            };

            if (isEditing) {
                await api.patch(`/quotes/${id}`, payload);
            } else {
                await api.post('/quotes', payload);
            }
            navigate('/quotes');
        } catch (error: any) {
            console.error('Save error:', error);
            alert(`Erro ao salvar orçamento.\nDetalhes: ${error?.message || 'Revise os campos obrigatórios.'}`);
        }
    };

    const generatePDF = async () => {
        if (!proposalRef.current) return;
        try {
            const canvas = await toCanvas(proposalRef.current, { pixelRatio: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Image total height applied to PDF width scale
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight; // Negative position shifts image up
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Proposta_${formData.title}.pdf`);
        } catch (error) {
            console.error('PDF error:', error);
            alert('Erro ao gerar PDF.');
        }
    };

    // Form Interactions - Stages & Items
    const addStage = () => {
        const newStages = [...formData.stages, { name: 'Nova Etapa', description: '', items: [] }];
        setFormData({ ...formData, stages: newStages });
        setExpandedStages({ ...expandedStages, [newStages.length - 1]: true });
    };

    const removeStage = (idx: number) => {
        const newStages = formData.stages.filter((_: any, i: number) => i !== idx);
        setFormData({ ...formData, stages: newStages });
    };

    const addItem = (stageIdx: number) => {
        const newStages = [...formData.stages];
        newStages[stageIdx].items.push({ description: '', unit: 'un', quantity: 1, unitCost: 0 });
        setFormData({ ...formData, stages: newStages });
    };

    const removeItem = (stageIdx: number, itemIdx: number) => {
        const newStages = [...formData.stages];
        newStages[stageIdx].items = newStages[stageIdx].items.filter((_: any, i: number) => i !== itemIdx);
        setFormData({ ...formData, stages: newStages });
    };

    const updateStage = (stageIdx: number, field: string, value: string) => {
        const newStages = [...formData.stages];
        newStages[stageIdx][field] = value;
        setFormData({ ...formData, stages: newStages });
    };

    const updateItem = (stageIdx: number, itemIdx: number, field: string, value: string | number) => {
        const newStages = [...formData.stages];
        newStages[stageIdx].items[itemIdx][field] = value;
        setFormData({ ...formData, stages: newStages });
    };

    // Calculate totals
    const calculateStageTotal = (stage: any) => {
        return stage.items?.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.unitCost)), 0) || 0;
    };

    const totalMaterialsAndLabor = formData.stages.reduce((acc: number, stage: any) => acc + calculateStageTotal(stage), 0);
    const totalIndirectCosts = formData.indirectCosts.reduce((acc: number, ic: any) => acc + Number(ic.amount), 0);
    const subtotal = totalMaterialsAndLabor + totalIndirectCosts;
    const marginAmount = subtotal * (Number(formData.marginPercentage) / 100);
    const finalPrice = subtotal + marginAmount;

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>;

    const customerName = customers.find(c => c.id === Number(formData.customerId))?.name || 'Cliente a Definir';

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full pb-24">
            {/* Editor Area */}
            <div className="flex-1 space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}</h1>
                        <p className="text-slate-500 mt-1">Preencha os detalhes e itens da obra.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                        >
                            <Save className="w-5 h-5" />
                            Salvar
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
                    {['DETAILS', 'STAGES', 'PROPOSAL'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab === 'DETAILS' && 'Dados Gerais'}
                            {tab === 'STAGES' && 'Etapas & Custos'}
                            {tab === 'PROPOSAL' && 'Dados da Proposta'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    {activeTab === 'DETAILS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título do Orçamento</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    placeholder="Ex: Reforma Casa Condomínio Y"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                                <select
                                    value={formData.customerId}
                                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Obra</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                >
                                    <option value="Residencial">Residencial</option>
                                    <option value="Comercial">Comercial</option>
                                    <option value="Industrial">Industrial</option>
                                    <option value="Reforma">Reforma</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Área Total (m²)</label>
                                <input
                                    type="number"
                                    value={formData.totalArea}
                                    onChange={e => setFormData({ ...formData, totalArea: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                            <div className="col-span-full md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço da Obra</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'STAGES' && (
                        <div className="space-y-6">
                            {formData.stages.map((stage: any, sIdx: number) => (
                                <div key={sIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                    <div
                                        className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedStages({ ...expandedStages, [sIdx]: !expandedStages[sIdx] })}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            {expandedStages[sIdx] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                            <input
                                                type="text"
                                                value={stage.name}
                                                onChange={e => updateStage(sIdx, 'name', e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                                className="font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 text-lg w-full max-w-xs"
                                                placeholder="Nome da Etapa"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-orange-600">
                                                {formatCurrency(calculateStageTotal(stage))}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeStage(sIdx); }}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedStages[sIdx] && (
                                        <div className="p-4 bg-white">
                                            <div className="mb-4">
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Descrição para Proposta</label>
                                                <input
                                                    type="text"
                                                    value={stage.description}
                                                    onChange={e => updateStage(sIdx, 'description', e.target.value)}
                                                    className="w-full mt-1 text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                                    placeholder="Ex: Execução completa da fundação..."
                                                />
                                            </div>

                                            <div className="overflow-x-auto w-full pb-4">
<table className="w-full text-sm text-left mb-4">
                                                <thead className="text-xs text-slate-500 uppercase border-b border-slate-100">
                                                    <tr>
                                                        <th className="pb-2 font-medium w-1/2">Item / Descrição</th>
                                                        <th className="pb-2 font-medium">Unid.</th>
                                                        <th className="pb-2 font-medium">Qtd</th>
                                                        <th className="pb-2 font-medium">Valor Unit.</th>
                                                        <th className="pb-2 font-medium text-right">Subtotal</th>
                                                        <th className="pb-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {stage.items.map((item: any, iIdx: number) => (
                                                        <tr key={iIdx}>
                                                            <td className="py-2 pr-2">
                                                                <input type="text" value={item.description} onChange={e => updateItem(sIdx, iIdx, 'description', e.target.value)} className="w-full px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-orange-500" placeholder="Descrição do item" />
                                                            </td>
                                                            <td className="py-2 pr-2">
                                                                <input type="text" value={item.unit} onChange={e => updateItem(sIdx, iIdx, 'unit', e.target.value)} className="w-16 px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-orange-500" placeholder="m², un" />
                                                            </td>
                                                            <td className="py-2 pr-2">
                                                                <input type="number" value={item.quantity} onChange={e => updateItem(sIdx, iIdx, 'quantity', e.target.value)} className="w-20 px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-orange-500" />
                                                            </td>
                                                            <td className="py-2 pr-2">
                                                                <input type="number" value={item.unitCost} onChange={e => updateItem(sIdx, iIdx, 'unitCost', e.target.value)} className="w-24 px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-orange-500" />
                                                            </td>
                                                            <td className="py-2 font-medium text-slate-700 text-right">
                                                                {formatCurrency(Number(item.quantity) * Number(item.unitCost))}
                                                            </td>
                                                            <td className="py-2 text-right">
                                                                <button onClick={() => removeItem(sIdx, iIdx)} className="text-slate-400 hover:text-red-500 p-1">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
</div>

                                            <button
                                                onClick={() => addItem(sIdx)}
                                                className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                            >
                                                <Plus className="w-4 h-4" /> Adicionar Item
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addStage}
                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors flex flex-col items-center justify-center gap-2 font-medium"
                            >
                                <Plus className="w-6 h-6" />
                                Adicionar Nova Etapa
                            </button>
                        </div>
                    )}

                    {activeTab === 'PROPOSAL' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">O que está incluído</label>
                                <textarea
                                    value={formData.includedItems || ''}
                                    onChange={e => setFormData({ ...formData, includedItems: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    placeholder="Ex: Materiais de construção originais, Mão de Obra especializada..."
                                />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">O que não está incluído</label>
                                <textarea
                                    value={formData.excludedItems || ''}
                                    onChange={e => setFormData({ ...formData, excludedItems: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    placeholder="Ex: Ligação definitiva de energia, Taxas da prefeitura..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                                <input
                                    type="text"
                                    value={formData.paymentTerms || ''}
                                    onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    placeholder="Ex: 30% entrada, saldo em 5x"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prazo Estimado</label>
                                    <input
                                        type="text"
                                        value={formData.estimatedTime || ''}
                                        onChange={e => setFormData({ ...formData, estimatedTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                        placeholder="Ex: 90 dias"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Validade (dias)</label>
                                    <input
                                        type="number"
                                        value={formData.validityDays || ''}
                                        onChange={e => setFormData({ ...formData, validityDays: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Calculator */}
            <div className="w-full lg:w-80 space-y-4">
                <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 border border-slate-800">
                    <div className="flex items-center gap-2 mb-6 text-orange-400">
                        <Calculator className="w-5 h-5" />
                        <h2 className="font-bold">Resumo Financeiro</h2>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Custos Diretos (Etapas)</span>
                            <span className="font-medium">{formatCurrency(totalMaterialsAndLabor)}</span>
                        </div>

                        {/* Indirect Costs List Mini */}
                        <div className="pt-2 border-t border-slate-800">
                            <span className="text-xs text-slate-400 font-semibold mb-2 block">CUSTOS INDIRETOS (Adicionar)</span>
                            {formData.indirectCosts.map((ic: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center mb-2">
                                    <input
                                        type="text"
                                        value={ic.description}
                                        onChange={e => {
                                            const newIc = [...formData.indirectCosts];
                                            newIc[idx].description = e.target.value;
                                            setFormData({ ...formData, indirectCosts: newIc });
                                        }}
                                        className="bg-transparent border-none text-slate-300 w-24 focus:ring-0 p-0 text-sm"
                                        placeholder="Ex: Imposto"
                                    />
                                    <input
                                        type="number"
                                        value={ic.amount}
                                        onChange={e => {
                                            const newIc = [...formData.indirectCosts];
                                            newIc[idx].amount = e.target.value;
                                            setFormData({ ...formData, indirectCosts: newIc });
                                        }}
                                        className="bg-slate-800 border-none rounded text-right text-white w-20 px-1 py-0.5"
                                    />
                                    <button onClick={() => {
                                        const newIc = formData.indirectCosts.filter((_: any, i: number) => i !== idx);
                                        setFormData({ ...formData, indirectCosts: newIc });
                                    }} className="text-slate-500 hover:text-red-400 ml-1"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                            <button
                                onClick={() => setFormData({ ...formData, indirectCosts: [...formData.indirectCosts, { description: 'Taxas', amount: 0 }] })}
                                className="text-xs text-orange-400 hover:text-orange-300 mt-1"
                            >
                                + Adicionar despesa
                            </button>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-slate-300 font-semibold">
                            <span>Custo Base (Subtotal)</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                            <span className="text-slate-300">Lucro Alvo (%)</span>
                            <input
                                type="number"
                                value={formData.marginPercentage}
                                onChange={e => setFormData({ ...formData, marginPercentage: e.target.value })}
                                className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-1">Preço Final Sugerido</span>
                            <div className="text-2xl font-bold text-white flex items-center justify-end">
                                <span>{formatCurrency(finalPrice)}</span>
                            </div>
                            {formData.totalArea > 0 && (
                                <div className="text-right text-xs text-slate-400 mt-1">
                                    {formatCurrency(finalPrice / formData.totalArea)} / m²
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={generatePDF}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors border border-slate-700 shadow-sm"
                >
                    <FileDown className="w-5 h-5" />
                    Gerar PDF Proposta
                </button>
            </div>

            {/* ----- HIDDEN PREVIEW FOR PDF GENERATION ----- */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={proposalRef} style={{ width: '800px', fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#1e293b' }}>

                    {/* --- COVER PAGE --- */}
                    <div style={{ height: '1130px', position: 'relative', overflow: 'hidden', backgroundColor: '#ffffff' }}>

                        {/* Abstract Architectural Background Elements (SVG) */}
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} viewBox="0 0 800 1130" preserveAspectRatio="none">
                            {/* Top subtle geometric lines */}
                            <path d="M -100 150 Q 300 350 900 50" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                            <path d="M -100 180 Q 300 380 900 80" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.2" />
                            <circle cx="650" cy="180" r="150" fill="none" stroke="#f8fafc" strokeWidth="40" opacity="0.5" />

                            {/* Bottom elegant orange and dark gray geometric waves */}
                            <path d="M 0 1130 L 0 750 C 300 950 500 650 800 900 L 800 1130 Z" fill="#f97316" opacity="0.05" />
                            <path d="M 0 1130 L 0 880 C 250 1020 450 820 800 1020 L 800 1130 Z" fill="#f97316" opacity="0.8" />
                            <path d="M 0 1130 L 0 1000 C 200 1090 400 960 800 1090 L 800 1130 Z" fill="#1e293b" />
                        </svg>

                        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '80px 48px' }}>

                            {/* Logo at the top/center */}
                            <div className="w-full flex justify-center mt-16">
                                <img src="/logo.png" alt="ConstructoraSys" style={{ width: '400px', objectFit: 'contain' }} />
                            </div>

                            {/* Minimalist Title Section */}
                            <div className="w-full text-center flex-1 flex flex-col justify-center items-center">
                                <div style={{ width: '80px', height: '4px', backgroundColor: '#f97316', marginBottom: '40px' }}></div>
                                <h1 className="font-light text-5xl uppercase tracking-[0.2em]" style={{ color: '#1e293b', marginBottom: '24px' }}>
                                    Proposta Comercial
                                </h1>
                                <p className="text-2xl font-medium tracking-wide" style={{ color: '#475569' }}>
                                    {formData.title || 'Construção Residencial'}
                                </p>
                            </div>

                            {/* Presentation Section */}
                            <div className="w-full text-center mt-8 mb-24">
                                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Apresentado a</p>
                                <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>{customerName}</p>
                            </div>

                        </div>
                    </div>
                    {/* --- COVER PAGE END --- */}

                    {/* --- PAGE 2 ONWARDS --- */}
                    <div className="p-12">
                        {/* Header Content Pages */}
                        <div className="flex justify-between items-start pb-6 mb-8" style={{ borderBottom: '2px solid #f97316' }}>
                            <div className="flex items-center gap-4">
                                <img src="/logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                            </div>
                            <div className="text-right text-sm" style={{ color: '#475569' }}>
                                <p className="font-semibold">Proposta Comercial #{id || 'NOVA'}</p>
                                <p>Data: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Customer Data */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold mb-2 uppercase text-sm pb-1" style={{ color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>Para</h2>
                            <p className="font-semibold text-xl">{customerName}</p>
                            {formData.address && <p style={{ color: '#475569' }}>{formData.address} - {formData.city}</p>}
                            <p className="mt-2 font-medium" style={{ color: '#475569' }}>Obra: {formData.title}</p>
                            {formData.totalArea > 0 && <p style={{ color: '#475569' }}>Área: {formData.totalArea} m² ({formData.type})</p>}
                        </div>

                        {/* Simple Stages Table */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold mb-4 pb-2" style={{ color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>Resumo de Serviços e Valores</h2>
                            <div className="overflow-x-auto w-full pb-4">
<table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                                <thead className="text-xs uppercase" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                                    <tr>
                                        <th className="py-3 px-4 font-semibold">Etapa / Serviço</th>
                                        <th className="py-3 px-4 font-semibold text-right">Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.stages.map((stage: any, idx: number) => {
                                        // Calculate stage total and apply proportional margin to hide internal numbers
                                        const baseTotal = calculateStageTotal(stage);
                                        let marginRatio = 1;
                                        if (subtotal > 0 && formData.marginPercentage > 0) {
                                            // Spread profit margin proportionally across stages so Client sees final price per stage
                                            marginRatio = 1 + (Number(formData.marginPercentage) / 100);
                                            // Include indirect costs proportionally
                                            const stageRatio = baseTotal / totalMaterialsAndLabor;
                                            const indirectShare = totalIndirectCosts * stageRatio;
                                            marginRatio = (baseTotal + indirectShare) / baseTotal * marginRatio;
                                        }

                                        const finalStagePrice = baseTotal * (Number.isNaN(marginRatio) ? 1 : marginRatio);

                                        return (
                                            <tr key={idx}>
                                                <td className="py-3 px-4 align-top" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <div className="font-semibold text-sm">{stage.name}</div>
                                                    {stage.description && <div className="text-xs mt-1 mb-2" style={{ color: '#64748b' }}>{stage.description}</div>}
                                                    {stage.items && stage.items.length > 0 && (
                                                        <div className="mt-2 pl-3" style={{ borderLeft: '2px solid #e2e8f0' }}>
                                                            {stage.items.map((item: any, iIdx: number) => {
                                                                const itemBaseTotal = Number(item.quantity) * Number(item.unitCost);
                                                                const itemFinalPrice = itemBaseTotal * (Number.isNaN(marginRatio) ? 1 : marginRatio);
                                                                return (
                                                                    <div key={iIdx} className="text-xs flex justify-between items-start py-0.5" style={{ color: '#475569' }}>
                                                                        <span className="flex-1 leading-snug pr-2">• {item.description || 'Item sem descrição'}</span>
                                                                        <span style={{ minWidth: '60px', textAlign: 'right', whiteSpace: 'nowrap' }}>{item.quantity} {item.unit}</span>
                                                                        <span style={{ minWidth: '110px', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600, paddingLeft: '8px' }}>{formatCurrency(itemFinalPrice)}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium align-top" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    {formatCurrency(finalStagePrice)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
</div>

                            <div className="flex justify-end mt-4">
                                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f1f5f9', minWidth: '360px' }}>
                                    <div className="flex justify-between items-center gap-8 text-lg font-bold" style={{ color: '#1e293b' }}>
                                        <span style={{ whiteSpace: 'nowrap' }}>Total Geral Final:</span>
                                        <span style={{ color: '#16a34a', whiteSpace: 'nowrap' }}>{formatCurrency(finalPrice)}</span>
                                    </div>
                                    {formData.totalArea > 0 && (
                                        <div className="flex justify-end text-sm mt-1" style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                                            {formatCurrency(finalPrice / formData.totalArea)} / m²
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className="grid grid-cols-2 gap-8 mb-12 text-sm" style={{ color: '#334155' }}>
                            <div>
                                <h3 className="font-bold pb-1 mb-2" style={{ borderBottom: '1px solid #cbd5e1' }}>Prazos e Condições</h3>
                                <p><span className="font-semibold">Pagamento:</span> {formData.paymentTerms || 'A combinar'}</p>
                                <p><span className="font-semibold">Prazo de Obra:</span> {formData.estimatedTime || 'A definir'}</p>
                            </div>
                            <div>
                                <h3 className="font-bold pb-1 mb-2" style={{ borderBottom: '1px solid #cbd5e1' }}>Inclusões</h3>
                                {formData.includedItems && <div className="mb-2"><span className="font-semibold block" style={{ color: '#15803d' }}>✓ Inclui:</span> {formData.includedItems}</div>}
                                {formData.excludedItems && <div><span className="font-semibold block" style={{ color: '#b91c1c' }}>✗ Não Inclui:</span> {formData.excludedItems}</div>}
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-24 grid grid-cols-2 gap-12">
                            <div className="pt-2 text-center" style={{ borderTop: '1px solid #94a3b8' }}>
                                <p className="font-bold" style={{ color: '#1e293b' }}>Assinatura do Cliente</p>
                                <p className="text-sm" style={{ color: '#64748b' }}>{customerName}</p>
                            </div>
                            <div className="pt-2 text-center" style={{ borderTop: '1px solid #94a3b8' }}>
                                <p className="font-bold" style={{ color: '#1e293b' }}>ConstrutoraSys</p>
                                <p className="text-sm" style={{ color: '#64748b' }}>Departamento Comercial</p>
                            </div>
                        </div>

                    </div>{/* End p-12 */}
                </div>
                {/* ----------------------------------------------- */}

            </div>
        </div>
    );
}
