import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, Building, User } from 'lucide-react';

export default function SignupPage() {
    const [form, setForm] = useState({ companyName: '', name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                const data = await response.json();
                const msg = typeof data.message === 'string'
                    ? data.message
                    : data.message?.message || 'Erro ao criar conta';
                throw new Error(msg);
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
                <svg className="w-full h-full text-orange-500" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <path d="M50 600 V200 H150 V600" />
                    <path d="M70 200 V600 M90 200 V600 M110 200 V600 M130 200 V600" strokeDasharray="4 8" />
                    <path d="M200 600 V100 H300 V600" />
                    <path d="M200 130 H300 M200 160 H300 M200 190 H300 M200 220 H300 M200 250 H300" />
                    <path d="M350 600 V250 H450 V600" />
                    <path d="M370 250 V600 M390 250 V600 M410 250 V600 M430 250 V600" strokeDasharray="2 4" />
                    <path d="M600 600 V100" strokeWidth="1.5" />
                    <path d="M600 100 L780 100" strokeWidth="1.5" />
                    <path d="M600 100 L550 150" strokeWidth="1" />
                    <line x1="750" y1="100" x2="750" y2="350" strokeDasharray="4 2" />
                    <circle cx="750" cy="360" r="8" strokeWidth="1.5" />
                </svg>
            </div>

            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100 relative z-10">
                <div className="bg-orange-500 p-8 text-center relative overflow-hidden">
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Building className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Criar conta gratuita</h1>
                    <p className="text-orange-100 mt-2 text-sm">Configure o sistema para sua construtora em minutos.</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nome da empresa</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="companyName"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Construtora Silva Ltda"
                                    value={form.companyName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Seu nome</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="João Silva"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="joao@construtora.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Mínimo 6 caracteres"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                'Criar conta e entrar'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="text-orange-600 font-medium hover:underline">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
