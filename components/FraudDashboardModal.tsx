import React, { useState } from 'react';
import { X, Calendar, Download, BarChart3, PieChart, TrendingUp, ShieldAlert, ShieldCheck, Activity, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';

import { Account } from '../types';
import { formatCurrency } from '../utils';

interface FraudDashboardModalProps {
    accounts: Account[];
    currency: string;
}

const FraudDashboardModal: React.FC<FraudDashboardModalProps> = ({ accounts, currency }) => {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    const [riskThreshold, setRiskThreshold] = useState(80);

    const filteredAccounts = accounts
        .filter(a => a.riskScore >= riskThreshold)
        .sort((a, b) => b.riskScore - a.riskScore);

    // Aggregate History Data from actual accounts
    // We assume 'history' in accounts is relevant to the selected timeRange.
    // For this implementation, we will aggregate all history points by index (assuming synchronized history).
    // If not synchronized, we'd need date parsing. Ideally, usage depends on data shape.
    // Here we will sum up amounts for "Fraud" (high risk accounts) vs "Normal".

    const generateActivityData = () => {
        // Map of index -> { name, fraud, notFraud }
        const dataMap: Record<number, { name: string; fraud: number; notFraud: number }> = {};

        // Dynamic points based on time range
        const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;

        for (let i = 0; i < points; i++) {
            dataMap[i] = {
                name: `T-${points - i}`,
                fraud: 0,
                notFraud: 0
            };
        }

        accounts.forEach(acc => {
            const isRisky = acc.riskScore > 80; // Consistent High Risk Threshold
            // Reverse history to map Oldest -> Newest (Left -> Right on chart)
            // We take the last 'points' number of history items
            const historyAsc = [...acc.history].reverse().slice(-points);

            historyAsc.forEach((h, idx) => {
                // Determine bucket index. 
                // We have 'points' map (0..points-1).
                // unique history length might be < points.
                // We align to the RIGHT? Or just fill from left?
                // If we fill from left (0), and we have 5 items: 0,1,2,3,4.
                // T-20, T-19, ... T-16. 
                // That's fine for a filling chart.

                if (dataMap[idx]) {
                    if (isRisky) {
                        dataMap[idx].fraud += h.amount;
                    } else {
                        dataMap[idx].notFraud += h.amount;
                    }
                }
            });
        });

        return Object.values(dataMap);
    };

    const activityData = generateActivityData();

    // Risk Severity Categories for Pie Chart
    const criticalCount = accounts.filter(a => a.riskScore > 90).length;
    const highCount = accounts.filter(a => a.riskScore > 70 && a.riskScore <= 90).length;
    const mediumCount = accounts.filter(a => a.riskScore > 40 && a.riskScore <= 70).length;
    const lowCount = accounts.filter(a => a.riskScore <= 40).length;

    const riskPieData = [
        { name: 'Critical (>90)', value: criticalCount, color: '#f43f5e' }, // Rose-500
        { name: 'High (70-90)', value: highCount, color: '#f97316' },      // Orange-500
        { name: 'Medium (40-70)', value: mediumCount, color: '#eab308' },    // Yellow-500
        { name: 'Low (<40)', value: lowCount, color: '#10b981' },        // Emerald-500
    ];

    const totalFraudCases = criticalCount + highCount + mediumCount;

    const riskDistribution = [
        { name: 'Low', value: lowCount, color: '#10b981' },
        { name: 'Medium', value: mediumCount, color: '#eab308' },
        { name: 'High', value: highCount, color: '#f97316' },
        { name: 'Critical', value: criticalCount, color: '#f43f5e' },
    ];

    return (
        <div className="relative w-full h-full bg-slate-50 dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden animate-in fade-in duration-500">

            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-white/[0.02]">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="text-indigo-500" />
                        Fraud Analysis Dashboard
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time threat monitoring and heuristic analysis</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-200 dark:bg-white/5 rounded-lg p-1">
                        {(['24h', '7d', '30d'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${timeRange === r ? 'bg-white dark:bg-indigo-500 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 dark:bg-black/20">

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Volume</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                {formatCurrency(accounts.reduce((acc, curr) => acc + curr.volumeValue, 0), currency)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Active Entities</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                {accounts.length}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">High Risk (&gt;70)</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                {accounts.filter(a => a.riskScore > 70).length}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg Risk Score</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                {(accounts.reduce((acc, curr) => acc + curr.riskScore, 0) / (accounts.length || 1)).toFixed(1)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 1. Main Time Series Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <TrendingUp size={16} className="text-indigo-500" /> Fraud Activity Over Time
                            </h3>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <div className="flex items-center gap-2 text-rose-500 px-2 py-1 bg-rose-500/10 rounded-lg">
                                    <ShieldAlert size={12} /> Fraud
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-lg">
                                    <ShieldCheck size={12} /> Not Fraud
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[250px] md:min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorNotFraud" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e1e24', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="fraud" name="Fraud" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorFraud)" />
                                    <Area type="monotone" dataKey="notFraud" name="Not Fraud" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNotFraud)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Side Panel (Risk & Pie) */}
                    <div className="flex flex-col gap-6">

                        {/* Risk Distribution Bar Chart */}
                        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm flex-1 flex flex-col">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart3 size={16} className="text-slate-400" /> Count by Risk Level
                            </h3>
                            <div className="flex-1 min-h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskDistribution} layout="vertical" barSize={12}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={60} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e1e24', borderColor: '#333', borderRadius: '8px' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {riskDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Risk Severity Breakdown Pie Chart */}
                        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm flex-1 flex flex-col">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <PieChart size={16} className="text-purple-500" /> Risk Severity Breakdown
                            </h3>
                            <div className="flex-1 min-h-[240px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={riskPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {riskPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1e1e24', borderColor: '#333', borderRadius: '8px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', opacity: 0.8 }} />
                                    </RePieChart>
                                </ResponsiveContainer>

                                {/* Center Label: Total Fraud Cases */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{totalFraudCases}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Fraud Cases</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. Live Threat Feed (Forensics Integration) */}
                <div className="mt-6 bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldAlert size={16} className="text-rose-500" /> Live Threat Feed
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Accounts exceeding cumulative risk thresholds</p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 p-2 rounded-xl">
                            <span className="text-xs font-bold text-slate-500 uppercase">Risk Threshold</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={riskThreshold}
                                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                                className="w-32 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="text-xs font-mono font-bold text-indigo-500 w-8">{riskThreshold}%</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-400 text-[10px] uppercase tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 font-semibold">Risk Score</th>
                                    <th className="p-3 font-semibold">Entity</th>
                                    <th className="p-3 font-semibold hidden md:table-cell">User ID</th>
                                    <th className="p-3 font-semibold hidden md:table-cell">IP Address</th>
                                    <th className="p-3 font-semibold text-right">Volume</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                                {filteredAccounts.map((acc, i) => (
                                    <tr key={acc.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-bold ${acc.riskScore > 80 ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {acc.riskScore}
                                            </span>
                                        </td>
                                        <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                                            {acc.name}
                                            {acc.entity.includes('Shell') && <span className="ml-2 text-[8px] bg-rose-500/10 text-rose-500 px-1 rounded border border-rose-500/20">SHELL</span>}
                                        </td>
                                        <td className="p-3 opacity-70 hidden md:table-cell">{acc.userId}</td>
                                        <td className="p-3 text-indigo-500 hidden md:table-cell">{acc.ipAddress}</td>
                                        <td className="p-3 text-right font-bold">{formatCurrency(acc.volumeValue, currency)}</td>
                                    </tr>
                                ))}
                                {filteredAccounts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                                            No threats detected above {riskThreshold}% risk score.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FraudDashboardModal;
