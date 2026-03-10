import { Home, Users, Building, LogOut, PieChart, Contact, ArrowUpCircle, Package, FileText, Settings } from 'lucide-react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/projects', icon: Building, label: 'Obras' },
        { path: '/finance', icon: ArrowUpCircle, label: 'Financeiro' },
        { path: '/supplies', icon: Package, label: 'Suprimentos' },
        { path: '/team', icon: Users, label: 'Equipe' },
        { path: '/contracts', icon: FileText, label: 'Contratos' },
        { path: '/customers', icon: Contact, label: 'Clientes' },
        { path: '/reports', icon: PieChart, label: 'Relatórios' },
        { path: '/admin', icon: Settings, label: 'Administração' },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar - Dark Modern */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
                <div className="p-8 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center transform rotate-3">
                            <Building className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Construtora<span className="text-orange-500">Sys</span></h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 translate-x-1'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-orange-400'}`} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Sair do Sistema</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {navItems.find(i => isActive(i.path))?.label || 'Visão Geral'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" alt="Profile" />
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
