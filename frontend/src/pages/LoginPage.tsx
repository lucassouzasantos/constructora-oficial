
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (err) {
            setError('Email ou senha incorretos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fine Line Construction Watermark - Increased Opacity for Visibility */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
                <svg className="w-full h-full text-orange-500" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" strokeWidth="0.8">
                    {/* Modern Skyscrapers Line Art */}
                    <path d="M50 600 V200 H150 V600" />
                    <path d="M70 200 V600 M90 200 V600 M110 200 V600 M130 200 V600" strokeDasharray="4 8" />

                    <path d="M200 600 V100 H300 V600" />
                    <path d="M200 130 H300 M200 160 H300 M200 190 H300 M200 220 H300 M200 250 H300" />

                    <path d="M350 600 V250 H450 V600" />
                    <path d="M370 250 V600 M390 250 V600 M410 250 V600 M430 250 V600" strokeDasharray="2 4" />

                    {/* Crane Structure - Detailed */}
                    <path d="M600 600 V100" strokeWidth="1.5" /> {/* Main Mast */}
                    <path d="M600 100 L780 100" strokeWidth="1.5" /> {/* Boom */}
                    <path d="M600 100 L550 150" strokeWidth="1" /> {/* Counterweight */}

                    {/* Crane Jig/Webbing */}
                    <path d="M600 100 L620 120 L640 100 L660 120 L680 100 L700 120 L720 100 L740 120 L760 100 L780 120" strokeWidth="0.5" />

                    {/* Cable & Hook */}
                    <line x1="750" y1="100" x2="750" y2="350" strokeDasharray="4 2" />
                    <circle cx="750" cy="360" r="8" strokeWidth="1.5" />
                    <path d="M746 366 L742 380 L758 380 L754 366" strokeWidth="1" fill="currentColor" className="text-orange-300" />

                    {/* Background City Silhouette Layer 2 */}
                    <path d="M0 600 L100 500 L200 600" strokeWidth="0.5" opacity="0.5" />
                    <path d="M650 600 L700 500 L750 600" strokeWidth="0.5" opacity="0.5" />
                </svg>
            </div>

            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100 relative z-10">
                <div className="bg-orange-500 p-8 text-center relative overflow-hidden">
                    {/* Header Decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white transform rotate-12">
                            <path d="M2 22h20M6 22v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                            <path d="M12 4V2" strokeWidth="2.5" />
                            <path d="M12 2L18 2" strokeWidth="2.5" />
                            <path d="M14 2L12 6" strokeWidth="1.5" />
                        </svg>
                    </div>

                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm relative z-10">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white relative z-10">Bem-vindo de volta!</h1>
                    <p className="text-orange-100 mt-2 text-sm relative z-10">Acesse o sistema de gestão da sua construtora.</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
