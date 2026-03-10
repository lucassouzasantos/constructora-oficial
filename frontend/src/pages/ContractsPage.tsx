import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, Building, Users, Calendar, Trash2 } from 'lucide-react';

interface Project {
    id: number;
    name: string;
}

interface Customer {
    id: number;
    name: string;
}

interface Contract {
    id: number;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
    projectId?: number;
    customerId?: number;
    project?: Project;
    customer?: Customer;
}

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // For simplicity, we only handle create in the modal for now with file upload
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: '',
        customerId: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchContracts();
        fetchProjects();
        fetchCustomers();
    }, []);

    const fetchContracts = async () => {
        try {
            const response = await fetch('http://localhost:3000/contracts');
            const data = await response.json();
            setContracts(data);
        } catch (error) {
            console.error('Error fetching contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:3000/projects');
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://localhost:3000/customers');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            title: '',
            description: '',
            projectId: '',
            customerId: '',
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Por favor, selecione um arquivo.');
            return;
        }

        const payload = new FormData();
        payload.append('title', formData.title);
        if (formData.description) payload.append('description', formData.description);
        if (formData.projectId) payload.append('projectId', formData.projectId);
        if (formData.customerId) payload.append('customerId', formData.customerId);
        payload.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:3000/contracts', {
                method: 'POST',
                body: payload,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert(`Erro ao salvar contrato: ${JSON.stringify(errorData)}`);
                return;
            }

            setIsModalOpen(false);
            fetchContracts();
        } catch (error) {
            console.error('Error saving contract:', error);
            alert(`Erro ao salvar contrato: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este contrato?')) return;
        try {
            await fetch(`http://localhost:3000/contracts/${id}`, { method: 'DELETE' });
            fetchContracts();
        } catch (error) {
            console.error('Error deleting contract:', error);
        }
    };

    const [previewFile, setPreviewFile] = useState<{ url: string, type: string, title: string } | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Contratos</h2>
                <button
                    onClick={handleOpenModal}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm shadow-orange-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Contrato
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar contrato..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {contracts.map((contract) => (
                        <div key={contract.id} className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all p-5 space-y-4 group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 transition-colors line-clamp-1" title={contract.title}>
                                            {contract.title}
                                        </h3>
                                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(contract.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(contract.id)}
                                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir Contrato"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {contract.description && (
                                <p className="text-sm text-slate-600 line-clamp-2" title={contract.description}>
                                    {contract.description}
                                </p>
                            )}

                            <div className="space-y-2 text-sm text-slate-600">
                                {contract.project && (
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium text-slate-700 truncate" title={contract.project.name}>Obra: {contract.project.name}</span>
                                    </div>
                                )}
                                {contract.customer && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium text-slate-700 truncate" title={contract.customer.name}>Cliente: {contract.customer.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex gap-2">
                                <button
                                    onClick={() => setPreviewFile({ url: contract.fileUrl, type: contract.fileType, title: contract.title })}
                                    className="flex-1 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 rounded-lg transition-colors font-medium border border-blue-100 hover:border-blue-200"
                                >
                                    <Search className="w-4 h-4" />
                                    Ver Prévia
                                </button>
                                <a
                                    href={`http://localhost:3000${contract.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="flex-1 flex items-center justify-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 py-2 rounded-lg transition-colors font-medium border border-orange-100 hover:border-orange-200"
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar
                                </a>
                            </div>
                        </div>
                    ))}
                    {contracts.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Nenhum contrato cadastrado</h3>
                            <p className="text-slate-500">Comece fazendo upload de um novo contrato.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-lg text-slate-800">Novo Contrato</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título do Contrato *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vincular Obra</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                                        value={formData.projectId}
                                        onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                    >
                                        <option value="">Nenhuma obra</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vincular Cliente</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                                        value={formData.customerId}
                                        onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                    >
                                        <option value="">Nenhum cliente</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo (PDF, Imagens) *</label>
                                <input
                                    required
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    onChange={e => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    }}
                                />
                                <p className="text-xs text-slate-500 mt-1">Para garantir a pré-visualização, prefira arquivos PDF ou Imagens.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm shadow-orange-500/20"
                                >
                                    Salvar Contrato
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-500" />
                                {previewFile.title}
                            </h3>
                            <div className="flex items-center gap-3">
                                <a
                                    href={`http://localhost:3000${previewFile.url}`}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-600 hover:text-orange-600 bg-white border border-slate-200 hover:border-orange-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Baixar
                                </a>
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="text-slate-400 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 p-1.5 rounded-lg transition-colors"
                                    title="Fechar"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-100/50 p-6 flex justify-center items-center">
                            {previewFile.type.includes('image') ? (
                                <img
                                    src={`http://localhost:3000${previewFile.url}`}
                                    alt={previewFile.title}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                />
                            ) : previewFile.type.includes('pdf') || previewFile.url.endsWith('.pdf') ? (
                                <iframe
                                    src={`http://localhost:3000${previewFile.url}`}
                                    className="w-full h-full rounded-lg shadow-sm border border-slate-200 bg-white"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-slate-200">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h4 className="text-lg font-medium text-slate-800 mb-2">Pré-visualização não suportada</h4>
                                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                                        Este tipo de arquivo ({previewFile.type}) não pode ser visualizado diretamente no navegador.
                                    </p>
                                    <a
                                        href={`http://localhost:3000${previewFile.url}`}
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                        Baixar Arquivo para visualizar
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
