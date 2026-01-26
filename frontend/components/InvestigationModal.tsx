import React, { useState } from 'react';
import { Account } from '../types';
import { X, Filter, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';

interface InvestigationModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: Account[]; // The full database
}

const InvestigationModal: React.FC<InvestigationModalProps> = ({ isOpen, onClose, accounts }) => {
    const [riskThreshold, setRiskThreshold] = useState(80);

    if (!isOpen) return null;

    // Filter Logic: Show only accounts > riskThreshold
    const filteredAccounts = accounts
        .filter(a => a.riskScore >= riskThreshold)
        .sort((a, b) => b.riskScore - a.riskScore);

    return (
        <div className="w-full h-full bg-slate-950 border border-slate-800 shadow-sm rounded-lg flex flex-col overflow-hidden animate-in fade-in duration-300">

            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-sm shadow-[0_0_10px_#6366f1]"></span>
                        Forensic Investigation
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 ml-4 font-mono">Ledger Access /// Secured</p>
                </div>
            </div>

            {/* Toolbar with Slider */}
            <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex flex-wrap gap-6 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Filter size={18} />
                        <span className="text-sm font-bold uppercase tracking-wider">Risk Filter</span>
                    </div>

                    <div className="flex items-center gap-4 flex-1 max-w-md">
                        <span className="text-xs text-slate-500 font-mono">0%</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={riskThreshold}
                            onChange={(e) => setRiskThreshold(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                        />
                        <span className="text-xs text-slate-500 font-mono">100%</span>
                    </div>

                    <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded text-indigo-400 text-sm font-bold font-mono min-w-[80px] text-center">
                        &gt; {riskThreshold}%
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Matches Found:</span>
                    <span className="text-sm font-mono text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{filteredAccounts.length}</span>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-lg">
                        <tr>
                            <th className="p-4 border-b border-slate-800 bg-slate-950">Risk Score</th>
                            <th className="p-4 border-b border-slate-800 bg-slate-950">Account Entity</th>
                            <th className="p-4 border-b border-slate-800 bg-slate-950">User ID</th>
                            <th className="p-4 border-b border-slate-800 bg-slate-950">Txn Ref</th>
                            <th className="p-4 border-b border-slate-800 bg-slate-950">IP Address</th>
                            <th className="p-4 border-b border-slate-800 bg-slate-950">Volume (INR)</th>
                            <th className="p-4 border-b border-slate-800 bg-slate-950">Connections</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-300 font-mono">
                        {filteredAccounts.map((acc, i) => (
                            <tr key={acc.id} className={`border-b border-slate-800/50 hover:bg-indigo-500/5 transition-colors ${i % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'}`}>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-8 rounded-full ${acc.riskScore > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                        <span className={`text-lg font-bold ${acc.riskScore > 80 ? 'text-rose-400' : 'text-emerald-400'
                                            }`}>
                                            {acc.riskScore}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 font-sans font-medium text-white">
                                    {acc.name}
                                    {acc.entity.includes('Shell') && <span className="ml-2 text-[10px] bg-rose-500/10 text-rose-500 px-1 rounded border border-rose-500/20">SHELL</span>}
                                </td>
                                <td className="p-4 text-slate-500">{acc.userId}</td>
                                <td className="p-4 text-slate-500">{acc.transactionId}</td>
                                <td className="p-4 text-indigo-400">{acc.ipAddress}</td>
                                <td className="p-4 text-white font-bold tracking-wide">{acc.volume}</td>
                                <td className="p-4 text-slate-400">{acc.connections.length}</td>
                            </tr>
                        ))}
                        {filteredAccounts.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-20 text-center text-slate-500 flex flex-col items-center justify-center">
                                    <Filter size={48} className="mb-4 opacity-20" />
                                    <span className="text-lg font-medium">No records found matching criteria</span>
                                    <span className="text-sm opacity-60 mt-1">Try lowering the risk threshold slider.</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvestigationModal;