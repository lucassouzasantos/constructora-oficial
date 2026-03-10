import { useState } from 'react';
import { Users, Package } from 'lucide-react';
import RegistersPage from './RegistersPage';
import InventoryManager from '../components/InventoryManager';

export default function SuppliesPage() {
    const [activeTab, setActiveTab] = useState<'SUPPLIERS' | 'INVENTORY'>('SUPPLIERS');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Suprimentos</h1>
                    <p className="text-slate-500 mt-1">Gerencie fornecedores e controle do estoque central.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('SUPPLIERS')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === 'SUPPLIERS'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                >
                    <Users className="w-5 h-5" />
                    Fornecedores
                </button>
                <button
                    onClick={() => setActiveTab('INVENTORY')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === 'INVENTORY'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                >
                    <Package className="w-5 h-5" />
                    Estoque Físico
                </button>
            </div>

            {/* Content Area */}
            <div className="mt-6">
                {activeTab === 'SUPPLIERS' && (
                    <RegistersPage type="SUPPLIERS" hideHeader={true} />
                )}
                {activeTab === 'INVENTORY' && (
                    <InventoryManager />
                )}
            </div>
        </div>
    );
}
