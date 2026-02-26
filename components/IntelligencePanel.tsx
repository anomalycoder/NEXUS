import React from 'react';
import { Account } from '../types';
import { Activity, ShieldAlert, Cpu, Search, X, Hash, Globe, User, ScanLine, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils';

interface IntelligencePanelProps {
  account: Account | undefined;
  onInvestigate: (account: Account) => void;
  onClose?: () => void;
  currency: string;
}

const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ account, onInvestigate, onClose, currency }) => {
  if (!account) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-white/20 p-6 text-center bg-white/90 dark:bg-black/40 backdrop-blur-xl border-l border-slate-200 dark:border-white/5 rounded-l-3xl">
        <ScanLine size={48} className="mb-4 opacity-30 animate-pulse" />
        <p className="text-xs tracking-widest uppercase">Target Not Acquired</p>
      </div>
    );
  }

  const isCritical = account.riskScore > 80;

  return (
    <div className="h-full flex flex-col bg-white/95 dark:bg-[#080808]/90 backdrop-blur-2xl border-l border-slate-200 dark:border-white/10 w-full md:w-96 shadow-[-20px_0_40px_rgba(0,0,0,0.05)] dark:shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-40 rounded-l-3xl overflow-hidden transition-colors duration-500">
      {/* Cinematic Header */}
      <div className="p-8 pb-4 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${account.riskScore > 80 ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e]' :
          account.riskScore > 50 ? 'bg-amber-500 shadow-[0_0_20px_#f59e0b]' :
            'bg-emerald-500 shadow-[0_0_20px_#10b981]'
          }`}></div>

        <div className="flex justify-between items-start z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${isCritical ? 'border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                account.riskScore > 50 ? 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                  'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                {isCritical ? 'THREAT DETECTED' : account.riskScore > 50 ? 'POTENTIAL RISK' : 'CLEAN RECORD'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{account.name}</h2>
            <p className="text-xs text-slate-500 dark:text-white/40 font-mono tracking-wider uppercase">
              LAST ACTIVITY: {account.lastActive.toUpperCase()} <span className="text-slate-300 dark:text-white/20 mx-2">|</span> {account.history.length} TOTAL TRANSACTIONS
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Database Details */}
      <div className="p-8 pt-2 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[9px] text-slate-400 dark:text-white/40 uppercase tracking-widest mb-1 z-10">Risk Index</div>
            <div className={`text-3xl font-mono font-bold z-10 ${isCritical ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
              account.riskScore > 50 ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'
              }`}>{account.riskScore}</div>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[9px] text-slate-400 dark:text-white/40 uppercase tracking-widest mb-1 z-10">Links</div>
            <div className="text-3xl font-mono font-bold text-slate-700 dark:text-white z-10">{account.connections.length}</div>
          </div>
        </div>

        <h3 className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
          <Cpu size={12} /> Digital Footprint
        </h3>

        <div className="space-y-3">
          <DataRow icon={<Activity size={14} />} label="Net Volume" value={formatCurrency(account.volumeValue, currency)} />
          <DataRow icon={<ArrowUpRight size={14} />} label="Max Transaction" value={formatCurrency(Math.max(0, ...account.history.map(h => h.amount)), currency)} />
          <DataRow icon={<Activity size={14} />} label="Avg Transaction" value={formatCurrency((account.history.reduce((a, b) => a + b.amount, 0) / (account.history.length || 1)), currency)} />
          <DataRow icon={<ShieldAlert size={14} />} label="Flagged Txns" value={`${account.history.filter(h => h.isSpike).length}`} />
        </div>

        {isCritical && (
          <div className="mt-8 p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-1">Anomaly Detected</p>
                <p className="text-[11px] text-rose-600/70 dark:text-rose-200/60 leading-relaxed">
                  Pattern matching algorithms indicate high probability of structuring (smurfing) across multiple shell entities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-8 pt-0 bg-transparent">
        <button
          onClick={() => onInvestigate(account)}
          className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        >
          <Search size={16} /> Initiate Trace
        </button>
      </div>
    </div>
  );
};

const DataRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
    <div className="flex items-center gap-3">
      <div className="text-slate-400 dark:text-white/20 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{icon}</div>
      <div className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wide">{label}</div>
    </div>
    <div className="text-xs font-mono text-slate-700 dark:text-white/80">{value}</div>
  </div>
);

export default IntelligencePanel;