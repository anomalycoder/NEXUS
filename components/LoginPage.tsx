import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, ScanEye } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Fake authentication delay
        setTimeout(() => {
            setIsLoading(false);
            onLogin();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] text-white font-inter overflow-hidden">

            {/* Interactive Particle Background */}
            <InteractiveBackground />

            {/* Animated Gradient Orb (kept for atmospheric lighting) */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">

                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-2xl shadow-indigo-500/20">
                        <ScanEye size={32} className="text-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-white">NEXUS INTELLIGENCE</h1>
                    <p className="text-slate-300 font-medium text-sm tracking-wide uppercase">Restricted Access // Authorized Personnel Only</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Agent ID</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User size={18} className="text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
                                placeholder="ENTER ID"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Passkey</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={18} className="text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>Verifying Credentials...</>
                        ) : (
                            <>
                                Authenticate Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Security Badge */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span>Secure Connection</span>
                    </div>
                    <span className="font-mono text-slate-400">v2.4.0-RC3</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
