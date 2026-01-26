import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, X, FileWarning, Activity, ArrowRight, Database } from 'lucide-react';
import { INITIAL_ACCOUNTS } from '../constants';

interface Transaction {
  id: string;
  time: string;
  amount: string;
  sender: string;
  receiver: string;
  type: 'Wire' | 'Crypto' | 'Off-Shore';
  status: 'Flagged';
}

interface TimelineEvent {
  id: string;
  x: number; // Percentage 0-100 (Horizontal position)
  y: number; // Deviation amount (Vertical)
  direction: 'up' | 'down';
  timestamp: number;
  fraudIds: string[];
  transactions: Transaction[];
}

const LiveMonitor: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const frameRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);

  // Helper: Generate realistic fraud transactions
  const generateTransactions = (accounts: string[]): Transaction[] => {
    return Array.from({ length: Math.floor(Math.random() * 4) + 2 }).map((_, i) => ({
      id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
      time: new Date(Date.now() - Math.floor(Math.random() * 100000)).toISOString().split('T')[1].slice(0, 8),
      amount: `$${(Math.random() * 50000 + 5000).toFixed(2)}`,
      sender: accounts[i % accounts.length] || 'Unknown',
      receiver: `Shell Co ${Math.floor(Math.random() * 99)}`,
      type: Math.random() > 0.6 ? 'Crypto' : 'Wire',
      status: 'Flagged'
    }));
  };

  // Animation Loop
  useEffect(() => {
    const loop = (time: number) => {
      // 1. Scroll events to the left
      setEvents(prev => {
        const speed = 0.15; // Speed of time
        // Move existing events, remove old ones
        const nextEvents = prev
          .map(e => ({ ...e, x: e.x - speed }))
          .filter(e => e.x > -20); // Keep them a bit after they leave screen for smooth exit

        return nextEvents;
      });

      // 2. Spawn new "Nexus Events" (Deflections)
      // Spawn rate: Random check every frame, but limited by time
      if (time - lastSpawnTime.current > 1500) { 
         if (Math.random() > 0.4) { // 60% chance to spawn every 1.5s
             const isUp = Math.random() > 0.5;
             const fraudAccounts = INITIAL_ACCOUNTS
                .filter(a => a.status === 'Flagged' || a.riskScore > 60)
                .sort(() => 0.5 - Math.random())
                .slice(0, 2)
                .map(a => a.name);

             const newEvent: TimelineEvent = {
                 id: `VAR-${Date.now()}`,
                 x: 100, // Start at right edge
                 y: 25 + Math.random() * 45, // Random severity (height)
                 direction: isUp ? 'up' : 'down',
                 timestamp: Date.now(),
                 fraudIds: fraudAccounts,
                 transactions: generateTransactions(fraudAccounts)
             };
             setEvents(prev => [...prev, newEvent]);
             lastSpawnTime.current = time;
         } else {
             // Reset timer to check again sooner if we didn't spawn
             lastSpawnTime.current = time - 1000;
         }
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="w-full h-full bg-black relative overflow-hidden flex flex-col items-center justify-center font-mono">
      {/* 1. CRT Effects & Grain */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-20 mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-black/80 via-transparent to-black/80" 
           style={{ backgroundSize: '100% 3px', backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.4) 50%)' }} 
      />
      
      {/* 2. UI Overlays */}
      <div className="absolute top-6 left-8 z-30">
        <div className="flex items-center gap-3 text-amber-500 border border-amber-500/30 bg-black/80 backdrop-blur px-4 py-2 rounded-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Activity className="animate-pulse" size={18} />
            <div className="text-xs tracking-[0.2em] font-bold">TEMPORAL FRAUD MONITOR</div>
        </div>
        <div className="text-[10px] text-amber-500/60 mt-1 ml-1">SECTOR: 199999 /// FLOW: UNSTABLE</div>
      </div>

      <div className="absolute top-6 right-8 z-30 text-right">
        <div className="text-xs text-amber-500/60 tracking-widest mb-1">BRANCH COUNT</div>
        <div className="text-2xl text-rose-500 font-bold tracking-widest drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
            {events.length.toString().padStart(3, '0')}
        </div>
      </div>

      {/* 3. The Visualization */}
      <div className="w-full h-full relative z-10">
        <svg className="w-full h-full" preserveAspectRatio="none">
           <defs>
             <filter id="glow-main" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="6" result="coloredBlur" />
               <feMerge>
                 <feMergeNode in="coloredBlur" />
                 <feMergeNode in="SourceGraphic" />
               </feMerge>
             </filter>
             <filter id="glow-branch" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="3" result="coloredBlur" />
               <feMerge>
                 <feMergeNode in="coloredBlur" />
                 <feMergeNode in="SourceGraphic" />
               </feMerge>
             </filter>
             <linearGradient id="branch-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fb7185" stopOpacity="1" />
                <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
             </linearGradient>
           </defs>

           {/* Grid Lines */}
           <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
           <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />

           {/* The "Sacred Timeline" (Main Central Flow) */}
           {/* We give it a slight wobble to look like a live signal */}
           <path 
             d="M 0 50 Q 25 49, 50 50 T 100 50" 
             stroke="#38bdf8" 
             strokeWidth="4" 
             fill="none" 
             filter="url(#glow-main)" 
             className="opacity-80"
           />
            {/* Inner bright core of main line */}
            <path 
             d="M 0 50 L 100 50" 
             stroke="#e0f2fe" 
             strokeWidth="1" 
             fill="none" 
             opacity="0.9"
           />

           {/* Branch Events */}
           {events.map((evt) => {
             // Logic for the visual branch path
             // Instead of a smooth curve, we want a sharp "deflection" or "fracture" look
             const startY = 50;
             const endY = evt.direction === 'up' ? 50 - evt.y : 50 + evt.y;
             
             // Calculate points for a jagged bolt-like path
             // Start (x, 50) -> Slight bump (x+2, 50+/-5) -> Sharp Turn (x+5, endY) -> Trail off
             const x = evt.x;
             
             // Dynamic path definition
             const p1x = x + 2;
             const p1y = evt.direction === 'up' ? 48 : 52;
             
             const p2x = x + 8; // The peak of the deflection
             const p2y = endY;

             const p3x = x + 25; // Trail off
             const p3y = endY * 0.95 + (50 * 0.05); // Slightly back towards center

             // SVG Path Command
             const d = `M ${x} 50 L ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y}`;

             return (
               <g key={evt.id} 
                  className="cursor-pointer group hover:opacity-100 transition-opacity" 
                  onClick={() => setSelectedEvent(evt)}
                >
                  {/* Hit Area (Invisible wide stroke for easier clicking) */}
                  <path d={d} stroke="transparent" strokeWidth="20" fill="none" />

                  {/* The Branch Visual */}
                  <path 
                    d={d}
                    fill="none" 
                    stroke="url(#branch-gradient)" 
                    strokeWidth="2"
                    filter="url(#glow-branch)"
                    className="group-hover:stroke-[3px] group-hover:stroke-rose-400 transition-all"
                  />
                  
                  {/* The Nexus Point (Origin) */}
                  <circle cx={x} cy={50} r="2" fill="#fff" filter="url(#glow-branch)" />

                  {/* Red Zone Indicator at the peak */}
                  <circle cx={p2x} cy={p2y} r="4" fill="#e11d48" opacity="0.6" className="animate-pulse" />
                  
                  {/* Label */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                     <text x={p2x + 2} y={p2y - 2} fill="#fb7185" fontSize="3" fontWeight="bold">Click to Inspect</text>
                     <line x1={p2x} y1={p2y} x2={p2x} y2={50} stroke="#fb7185" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.5" />
                  </g>
               </g>
             );
           })}
        </svg>
      </div>

      {/* 4. Detailed Modal (Temporal Variance File) */}
      {selectedEvent && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 w-full max-w-2xl border border-amber-600/40 shadow-[0_0_100px_rgba(217,119,6,0.15)] relative flex flex-col max-h-[80vh]">
                
                {/* Decorative Borders */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>

                {/* Header */}
                <div className="bg-slate-950/50 p-5 border-b border-amber-600/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-500/10 p-2 rounded border border-rose-500/20">
                            <FileWarning className="text-rose-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-amber-500 font-bold tracking-widest text-lg">TEMPORAL VARIANCE FILE</h2>
                            <div className="flex items-center gap-2 text-xs text-amber-500/60 font-mono mt-0.5">
                                <span>ID: {selectedEvent.id}</span>
                                <span>•</span>
                                <span>SEVERITY: CRITICAL</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedEvent(null)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-black/40 p-3 border border-slate-800 rounded">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">Total Volume</div>
                            <div className="text-xl text-slate-200 font-mono">
                                {selectedEvent.transactions.reduce((acc, t) => acc + parseFloat(t.amount.replace('$','')), 0).toLocaleString('en-US', {style:'currency', currency:'USD'})}
                            </div>
                        </div>
                        <div className="bg-black/40 p-3 border border-slate-800 rounded">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">Entities Involved</div>
                            <div className="text-xl text-slate-200 font-mono">{selectedEvent.fraudIds.length}</div>
                        </div>
                         <div className="bg-black/40 p-3 border border-slate-800 rounded">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">Detection Time</div>
                            <div className="text-xl text-rose-400 font-mono">T-Minus 0s</div>
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="border border-slate-800 rounded-md overflow-hidden">
                        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <Database size={12} /> Transaction Log
                        </div>
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-950/50 text-slate-500">
                                <tr>
                                    <th className="p-3">Time</th>
                                    <th className="p-3">Transaction ID</th>
                                    <th className="p-3">Sender</th>
                                    <th className="p-3">Receiver</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {selectedEvent.transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-rose-900/10 transition-colors">
                                        <td className="p-3 text-slate-500">{txn.time}</td>
                                        <td className="p-3">{txn.id}</td>
                                        <td className="p-3 text-white">{txn.sender}</td>
                                        <td className="p-3 text-slate-400">{txn.receiver}</td>
                                        <td className="p-3 text-white font-bold">{txn.amount}</td>
                                        <td className="p-3 text-right">
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                                <AlertTriangle size={10} /> {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-3">
                    <button 
                        onClick={() => setSelectedEvent(null)}
                        className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                    >
                        Ignore Signal
                    </button>
                    <button 
                        onClick={() => setSelectedEvent(null)}
                        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-[0_0_15px_rgba(217,119,6,0.4)] flex items-center gap-2"
                    >
                        <Activity size={14} /> Prune Timeline
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LiveMonitor;