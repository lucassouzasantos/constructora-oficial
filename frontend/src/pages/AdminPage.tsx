import { Settings } from 'lucide-react';

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Administração</h1>
                <p className="text-slate-500 mt-1">Configurações gerais do sistema.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Settings className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-700">Configurações em breve</h2>
                <p className="text-slate-500 mt-2 max-w-md">
                    Esta área será destinada exclusiva para configurações do sistema, regras de negócio e parâmetros globais.
                </p>
            </div>
        </div>
    );
}
