import React from 'react';
import { Account } from '../types';
import { ShieldAlert, ShieldCheck, Snowflake } from 'lucide-react';

interface DataGridProps {
  accounts: Account[];
  selectedId: string | null;
  onRowClick: (id: string) => void;
  currency: string;
}

import { formatCurrency } from '../utils';

const DataGrid: React.FC<DataGridProps> = ({ accounts, selectedId, onRowClick, currency }) => {
  return (
    <div className="w-full h-full bg-slate-100/50 dark:bg-[#050505] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col transition-colors duration-500 backdrop-blur-sm">
      <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/40 dark:bg-white/[0.02]">
        <h3 className="text-slate-900 dark:text-white font-bold text-xs tracking-[0.2em] uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Account Database
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">{accounts.length} RECORDS FOUND</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
          <thead className="bg-white/50 dark:bg-white/[0.02] text-slate-400 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="p-5 font-semibold tracking-wider uppercase hidden md:table-cell">Account ID</th>
              <th className="p-5 font-semibold tracking-wider uppercase">Entity Name</th>
              <th className="p-5 font-semibold tracking-wider uppercase">Status</th>
              <th className="p-5 font-semibold tracking-wider uppercase">Risk Score</th>
              <th className="p-5 font-semibold tracking-wider uppercase hidden md:table-cell">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {accounts.map(account => (
              <tr
                key={account.id}
                onClick={() => onRowClick(account.id)}
                className={`cursor-pointer transition-all duration-300 hover:bg-indigo-50/50 dark:hover:bg-white/5 ${selectedId === account.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}
              >
                <td className="p-5 font-mono text-slate-700 dark:text-slate-300 font-medium hidden md:table-cell">{account.name}</td>
                <td className="p-5 text-slate-600 dark:text-slate-200">{account.entity}</td>
                <td className="p-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-opacity-10 text-[10px] font-bold uppercase tracking-wider border border-opacity-20
                    ${account.status === 'Flagged' ? 'bg-rose-500 text-rose-500 border-rose-500' :
                      account.status === 'Frozen' ? 'bg-slate-500 text-slate-500 border-slate-500' :
                        'bg-emerald-500 text-emerald-500 border-emerald-500'}`}>
                    {account.status === 'Flagged' && <ShieldAlert size={12} />}
                    {account.status === 'Frozen' && <Snowflake size={12} />}
                    {account.status === 'Safe' && <ShieldCheck size={12} />}
                    {account.status}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${account.riskScore > 70 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                        style={{ width: `${account.riskScore}%` }}
                      />
                    </div>
                    <span className={`font-mono font-bold ${account.riskScore > 70 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>{account.riskScore}</span>
                  </div>
                </td>
                <td className="p-5 font-mono text-slate-700 dark:text-slate-200 font-bold hidden md:table-cell">{formatCurrency(account.volumeValue, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataGrid;