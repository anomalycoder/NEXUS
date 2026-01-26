import React from 'react';
import { X, Settings as SettingsIcon, ScanEye, LogOut, Moon, Sun, Monitor, Zap, Ghost, CreditCard } from 'lucide-react';

interface SettingsState {
    neuralEngine: boolean;
    ghostMode: boolean;
    darkMode: boolean;
    reducedMotion: boolean;
    currency: string;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: SettingsState;
    onToggle: (key: keyof SettingsState) => void;
    onCurrencyChange: (currency: string) => void;
    onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onToggle, onCurrencyChange, onLogout }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white">
                            <SettingsIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Settings</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Configure your Nexus environment</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

                    {/* Appearance Section */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Appearance & preferences</h3>
                        <div className="space-y-3">
                            {/* Dark Mode */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                                        {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Reduce eye strain in low light</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onToggle('darkMode')}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.darkMode ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Reduced Motion */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                        <Monitor size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">Reduced Motion</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Minimize animations</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onToggle('reducedMotion')}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.reducedMotion ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.reducedMotion ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* System Core Section */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">System Core</h3>
                        <div className="space-y-3">
                            {/* Neural Engine */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">Neural Engine</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">AI-powered fraud detection</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onToggle('neuralEngine')}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.neuralEngine ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.neuralEngine ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Ghost Mode */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                        <Ghost size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">Ghost Mode</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Anonymize analyst operations</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onToggle('ghostMode')}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.ghostMode ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.ghostMode ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Currency */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">Base Currency</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Display currency for all values</div>
                                    </div>
                                </div>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => onCurrencyChange(e.target.value)}
                                    className="bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 py-2 pl-3 pr-8"
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="SAR">SAR (﷼)</option>
                                    <option value="AUD">AUD (A$)</option>
                                    <option value="CAD">CAD (C$)</option>
                                    <option value="SGD">SGD (S$)</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <button
                        onClick={onLogout}
                        className="w-full py-4 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Terminate Session
                    </button>
                    <div className="mt-4 text-center">
                        <span className="text-[10px] text-slate-400 flex items-center justify-center gap-2">
                            <ScanEye size={12} /> NEXUS KERNEL V2.4.0
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;
