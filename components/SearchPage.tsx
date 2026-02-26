import React, { useState, useMemo } from 'react';
import { Account } from '../types';
import { Search as SearchIcon, ShieldAlert, ShieldCheck, Snowflake, ArrowUpRight, ArrowDownLeft, Activity, CreditCard, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils';

interface SearchPageProps {
    accounts: Account[];
    currency: string;
    initialQuery?: string | null;
}

const SearchPage: React.FC<SearchPageProps> = ({ accounts, currency, initialQuery }) => {
    const [query, setQuery] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(() => {
        if (initialQuery) {
            return accounts.find(a => a.id === initialQuery) || null;
        }
        return null;
    });

    const filteredAccounts = useMemo(() => {
        if (!query) return [];
        const lower = query.toLowerCase();
        return accounts.filter(a =>
            a.name.toLowerCase().includes(lower) ||
            a.id.toLowerCase().includes(lower) ||
            a.entity.toLowerCase().includes(lower)
        ).slice(0, 10);
    }, [accounts, query]);



    const handleExportCSV = () => {
        if (!selectedAccount) return;

        const headers = ['Date', 'Transaction Ref', 'Type', 'Amount', 'Status'];
        const rows = selectedAccount.history.map(txn => {
            const status = txn.isSpike ? 'Flagged' : 'Verified';
            const type = txn.amount > 5 ? 'High Value Transfer' : 'Standard Credit';
            const txnRef = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`; // Mock Ref to match UI
            return [txn.date, txnRef, type, txn.amount.toFixed(2), status].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${selectedAccount.name.replace(/\s+/g, '_')}_transactions.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto md:overflow-hidden animate-in fade-in duration-500">

            {/* Search Header */}
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Global Entity Search</h1>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Account Name, ID, or Entity..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (e.target.value) setSelectedAccount(null);
                        }}
                        className="w-full h-16 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />

                    {/* Dropdown Results */}
                    {query && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 max-h-[60vh] overflow-y-auto">
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map(acc => (
                                    <div
                                        key={acc.id}
                                        onClick={() => { setSelectedAccount(acc); setQuery(''); }}
                                        className="p-4 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-indigo-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-stretch group/item transition-all"
                                    >
                                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                            {/* Risk Badge */}
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xs md:text-sm font-bold border flex-shrink-0
                                            ${acc.riskScore > 80 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    acc.riskScore > 50 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                {acc.riskScore}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 truncate">{acc.name}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                                    <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded flex-shrink-0">{acc.entity}</span>
                                                    <span className="truncate">{acc.id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-center gap-1 flex-shrink-0 ml-2">
                                            <div className="text-xs md:text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {formatCurrency(acc.volumeValue, currency)}
                                            </div>
                                            <div className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-wide">
                                                {acc.history.length} Txns
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500">No entities found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Details View */}
            {selectedAccount ? (
                <div className="flex-none md:flex-1 h-auto md:h-full overflow-visible md:overflow-hidden flex flex-col max-w-6xl mx-auto w-full gap-6 animate-in slide-in-from-bottom-4 duration-500">

                    {/* Profile Card */}
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="relative z-10 flex items-center gap-4 md:gap-6">
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold shadow-inner flex-shrink-0
                            ${selectedAccount.riskScore > 80 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                    selectedAccount.riskScore > 50 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                {selectedAccount.riskScore}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 break-words leading-tight">{selectedAccount.name}</h2>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-xs font-mono text-slate-600 dark:text-slate-300">{selectedAccount.entity}</span>

                                    {selectedAccount.riskScore > 80 ? (
                                        <span className="flex items-center gap-1 text-xs font-bold uppercase text-rose-500">
                                            <ShieldAlert size={14} /> FLAGGED
                                        </span>
                                    ) : selectedAccount.riskScore > 50 ? (
                                        <span className="flex items-center gap-1 text-xs font-bold uppercase text-amber-500">
                                            <ShieldAlert size={14} /> WARNING
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-bold uppercase text-emerald-500">
                                            <ShieldCheck size={14} /> VERIFIED
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col items-start md:items-end mt-6 md:mt-0">
                            <div className="text-sm text-slate-500 mb-1">Total Volume</div>
                            <div className="text-3xl md:text-4xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter">
                                {(() => {
                                    // Quick format re-use or parse existing volume string if needed.
                                    // Using the volumeValue from data for consistency
                                    return formatCurrency(selectedAccount.volumeValue, currency);
                                })()}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedAccount(null)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/10 p-2 rounded-full"
                        >
                            <span className="sr-only">Close</span>
                            ✕
                        </button>
                    </div>

                    {/* Transaction History Table */}
                    <div className="md:flex-1 h-auto md:h-full bg-slate-100/50 dark:bg-[#050505] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col shadow-inner">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity size={20} className="text-indigo-500" />
                                Transaction History
                            </h3>
                            <button onClick={handleExportCSV} className="text-xs font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest">Export CSV</button>
                        </div>
                        <div className="md:flex-1 h-auto md:h-full overflow-x-auto md:overflow-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="bg-white/50 dark:bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="p-5 font-semibold tracking-wider text-xs uppercase">Date</th>
                                        <th className="p-5 font-semibold tracking-wider text-xs uppercase hidden md:table-cell">Transaction Ref</th>
                                        <th className="p-5 font-semibold tracking-wider text-xs uppercase hidden md:table-cell">Type</th>
                                        <th className="p-5 font-semibold tracking-wider text-xs uppercase text-right">Amount</th>
                                        <th className="p-5 font-semibold tracking-wider text-xs uppercase text-center hidden md:table-cell">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {selectedAccount.history.map((txn, i) => (
                                        <tr key={i} className="hover:bg-white/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="p-5 flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span className="font-mono">{txn.date}</span>
                                            </td>
                                            <td className="p-5 font-mono text-xs opacity-70 hidden md:table-cell">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</td>
                                            <td className="p-5 hidden md:table-cell">
                                                <span className="flex items-center gap-2 text-xs font-bold">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${txn.amount > 5 ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                                                    {txn.amount > 5 ? 'High Value Transfer' : 'Standard Credit'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right font-mono font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(txn.amount, currency)}
                                            </td>
                                            <td className="p-5 text-center hidden md:table-cell">
                                                {txn.isSpike ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase border border-rose-500/20">
                                                        <ShieldAlert size={10} /> Flagged
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20">
                                                        <ShieldCheck size={10} /> Verified
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            ) : (
                /* Empty State / Suggestions */
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-white/10 animate-in fade-in zoom-in-95 duration-500">
                    <SearchIcon size={64} className="mb-6 opacity-20" />
                    <p className="text-xl font-medium text-slate-400 dark:text-white/30 mb-8">Start typing to search for global entities...</p>

                    <div className="w-full max-w-2xl">
                        <div className="text-xs font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4 text-center">Suggested Entities</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {accounts.slice(0, 4).map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => { setQuery(acc.id); setSelectedAccount(acc); }}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-solid hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all group text-left"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
                                        ${acc.riskScore > 80 ? 'bg-rose-500/10 text-rose-500' :
                                            acc.riskScore > 50 ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-emerald-500/10 text-emerald-500'}`}>
                                        {acc.riskScore}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-slate-700 dark:text-white group-hover:text-indigo-500 transition-colors truncate">{acc.name}</div>
                                        <div className="text-xs text-slate-400 font-mono truncate">{acc.id}</div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SearchPage;
