import { Menu, X, Home, Users, Building, LogOut, PieChart, Contact, ArrowUpCircle, Package, FileText, Settings, Calculator } from 'lucide-react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user?.role === 'ADMIN';

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/projects', icon: Building, label: 'Obras' },
        { path: '/quotes', icon: Calculator, label: 'Orçamentos' },
        { path: '/finance', icon: ArrowUpCircle, label: 'Financeiro' },
        { path: '/supplies', icon: Package, label: 'Suprimentos' },
        { path: '/team', icon: Users, label: 'Equipe' },
        { path: '/contracts', icon: FileText, label: 'Contratos' },
        { path: '/customers', icon: Contact, label: 'Clientes' },
        { path: '/reports', icon: PieChart, label: 'Relatórios' },
        ...(isAdmin ? [{ path: '/admin', icon: Settings, label: 'Administração' }] : [])
    ];

    return (
        <div className="flex h-screen bg-slate-50 relative overflow-hidden">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Dark Modern */}
            <aside className={`fixed lg:static top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 md:p-8 border-b border-slate-800 flex items-center justify-between lg:justify-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center transform rotate-3">
                            <Building className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Construtora<span className="text-orange-500">Sys</span></h1>
                    </div>
                    <button 
                        className="lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
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
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg md:text-xl font-semibold text-slate-800 line-clamp-1">
                            {navItems.find(i => isActive(i.path))?.label || 'Visão Geral'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="flex flex-col items-end mr-3 hidden sm:flex">
                            <span className="text-sm font-semibold text-slate-800">{user?.name || 'Usuário'}</span>
                            <span className="text-xs text-slate-500">{user?.role === 'ADMIN' ? 'Administrador' : 'Membro'}</span>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                            <span className="text-sm md:text-base font-bold text-slate-500">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
