import React from 'react';
import { Account } from '../types';
import { Network, Share2, TrendingUp, ArrowUpRight, Activity, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../utils';

interface AnalyticsPanelProps {
    accounts: Account[];
    selectedId: string | null;
    currency: string;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ accounts, selectedId, currency }) => {
    const selectedNode = accounts.find(a => a.id === selectedId);
    const neighbors = selectedNode ? accounts.filter(a => selectedNode.connections.includes(a.id)) : [];

    if (!selectedNode) return null;

    const totalVolume = selectedNode.history.reduce((acc, curr) => acc + curr.amount, 0);
    const spikeCount = selectedNode.history.filter(h => h.isSpike).length;

    // Risk Levels
    const isCritical = selectedNode.riskScore > 80;
    const isWarning = selectedNode.riskScore > 50 && !isCritical;
    const isSafe = selectedNode.riskScore <= 50;

    return (
        <div className="h-full bg-white/90 dark:bg-black/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative z-30 transition-colors duration-500">

            {/* Header Bar */}
            <div className="h-10 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center px-6 justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-indigo-500 dark:text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-white/70 uppercase tracking-[0.15em]">Analytics Stream</span>
                    </div>
                    <div className="w-px h-3 bg-slate-300 dark:bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wider">Target:</span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{selectedNode.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1.5 
                        ${isCritical ? 'border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                            isWarning ? 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {isCritical ? <ShieldAlert size={10} /> : isWarning ? <AlertCircle size={10} /> : <ShieldCheck size={10} />}
                        Risk Score: {selectedNode.riskScore}
                    </div>
                </div>
            </div>

            {/* 3-Column Content */}
            <div className="flex-1 flex min-h-0 divide-x divide-slate-200 dark:divide-white/5">

                {/* COL 1: Chart & Primary Stats (Flex Grow) */}
                <div className="flex-1 p-6 flex flex-col min-w-0 relative group">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none opacity-50"></div>

                    <div className="flex justify-between items-end mb-2 z-10">
                        <div>
                            <div className="text-[9px] text-slate-400 dark:text-white/40 uppercase tracking-widest mb-1">Cumulative Volume</div>
                            <div className="text-2xl font-mono text-slate-900 dark:text-white flex items-baseline gap-2">
                                {formatCurrency(totalVolume, currency)}
                            </div>
                        </div>
                        {spikeCount > 0 && (
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold px-2 py-1 bg-rose-50 dark:bg-rose-500/10 rounded border border-rose-200 dark:border-rose-500/20 flex items-center gap-1 animate-pulse">
                                <ArrowUpRight size={10} /> {spikeCount} ANOMALIES DETECTED
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-h-0 w-full z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedNode.history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isCritical ? "#f43f5e" : "#6366f1"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isCritical ? "#f43f5e" : "#6366f1"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }}
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => [formatCurrency(value, currency), '']}
                                />
                                <ReferenceLine y={10} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke={isCritical ? "#f43f5e" : "#818cf8"}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorAmt)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* COL 2: Transaction History (Fixed Width) */}
                <div className="w-80 bg-slate-50 dark:bg-black/20 flex flex-col">
                    <div className="p-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Recent Transactions</span>
                        <Activity size={12} className="text-slate-400 dark:text-white/20" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {selectedNode.history.map((h, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-white dark:hover:bg-white/5 transition-colors cursor-default group border border-transparent hover:border-slate-200 dark:hover:border-white/5 hover:shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 dark:text-white/30 font-mono group-hover:text-slate-700 dark:group-hover:text-white/50">{h.date}</span>
                                    <span className="text-[9px] text-slate-400 dark:text-white/20 uppercase">Wire Transfer</span>
                                </div>
                                <span className={`font-mono text-xs ${h.isSpike ? "text-rose-500 dark:text-rose-400 font-bold" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`}>
                                    {formatCurrency(h.amount, currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COL 3: Connected Nodes (Fixed Width) */}
                <div className="w-72 bg-slate-50 dark:bg-black/20 flex flex-col">
                    <div className="p-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Direct Connections ({neighbors.length})</span>
                        <Share2 size={12} className="text-slate-400 dark:text-white/20" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {neighbors.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-[10px] text-slate-400 dark:text-white/20 uppercase tracking-widest">
                                No Active Links
                            </div>
                        ) : (
                            neighbors.map(neighbor => (
                                <div key={neighbor.id} className="group flex items-center justify-between p-2 rounded hover:bg-white dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/5 hover:shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${neighbor.riskScore > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white tracking-wide">{neighbor.name}</span>
                                    </div>
                                    <span className={`text-[9px] font-mono ${neighbor.riskScore > 80 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        Risk: {neighbor.riskScore}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;