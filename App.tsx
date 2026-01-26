import React, { useState, useEffect } from 'react';
import { Account, Page } from './types';
import Sidebar from './components/Sidebar';
import NetworkGraph from './components/NetworkGraph';
import DataGrid from './components/DataGrid';
import IntelligencePanel from './components/IntelligencePanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import ProfileModal from './components/ProfileModal';
import IntroScreen from './components/IntroScreen';
import ProjectWorkflowPage from './components/ProjectWorkflowPage';
import SearchPage from './components/SearchPage';
import FraudDashboardModal from './components/FraudDashboardModal';
import SettingsModal from './components/SettingsModal';
import LoginPage from './components/LoginPage';
import { Bell, LayoutGrid, Network, Search, Menu, Settings as SettingsIcon, LogOut, User, ScanEye, Trash2, X } from 'lucide-react';


const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>('network');
    const [accounts, setAccounts] = useState<Account[]>([]);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'graph' | 'grid'>('graph');

    const [showIntro, setShowIntro] = useState(true);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // Settings State
    const [settings, setSettings] = useState({
        neuralEngine: true,
        ghostMode: false,
        darkMode: true,
        reducedMotion: false,
        currency: 'INR',
    });

    // Notifications State
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Fraud Pattern Detected', time: 'NOW', desc: 'Cyclic movement identified in Sector 7.', type: 'critical' },
        { id: 2, title: 'Volume Spike', time: '15m', desc: 'Entity Acct-8822 exceeded threshold.', type: 'warning' }
    ]);

    // Modals & Panels state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Derived state
    const selectedAccount = accounts.find(a => a.id === selectedId);

    const generateHistory = (isRisk: boolean) => {
        return Array.from({ length: 20 }).map((_, i) => {
            let val = Math.random() * 4;
            const isSpike = Math.random() > 0.85;
            if (isSpike) val += (Math.random() * 8 + 6);
            if (!isRisk) val = val * 0.2;
            return {
                date: `T-${20 - i}`,
                amount: parseFloat(val.toFixed(2)),
                isSpike: val > 10
            };
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_BASE_URL}/graph`);
                const data = await response.json();

                const { nodes, links } = data;

                // 1. Process Links first to build History and Volume
                const nodeStats: Record<string, { totalVol: number; history: any[]; neighbors: Set<string> }> = {};

                // Helper to init stats
                const initStats = (id: string) => {
                    if (!nodeStats[id]) {
                        nodeStats[id] = { totalVol: 0, history: [], neighbors: new Set() };
                    }
                };

                links.forEach((l: any) => {
                    initStats(l.source);
                    initStats(l.target);

                    // Add to Volume (we'll sum in+out for "Total Volume")
                    nodeStats[l.source].totalVol += l.amount;
                    nodeStats[l.target].totalVol += l.amount;

                    // Add neighbors
                    nodeStats[l.source].neighbors.add(l.target);
                    nodeStats[l.target].neighbors.add(l.source);

                    // Add to History
                    const historyItem = {
                        date: `Step ${l.step}`,
                        amount: parseFloat(l.amount.toFixed(2)),
                        isSpike: l.fraud // Use fraud flag or high amount for spike
                    };

                    // We interpret 'step' as time.
                    nodeStats[l.source].history.push(historyItem);
                    nodeStats[l.target].history.push(historyItem);
                });

                setAccounts(prevAccounts => {
                    // Create a map of existing positions and history to prevent jitter and data loss
                    const posMap = new Map<string, { x: number, y: number }>(prevAccounts.map(a => [a.id, { x: a.x, y: a.y }]));
                    const historyMap = new Map<string, any[]>(prevAccounts.map(a => [a.id, a.history]));

                    return nodes.map((n: any) => {
                        const stats = nodeStats[n.id] || { totalVol: 0, history: [], neighbors: new Set() };

                        // Merge with previous history (to create a scrolling effect)
                        const previousHistory = historyMap.get(n.id) || [];
                        const newHistory = stats.history;

                        // Deduplicate by step (date string)
                        const historyMapByStep = new Map();
                        [...previousHistory, ...newHistory].forEach(h => {
                            historyMapByStep.set(h.date, h);
                        });

                        // Convert back to array and sort
                        const allHistory = Array.from(historyMapByStep.values());

                        // Sort history by step/time (descending for "recent")
                        const sortedHistory = allHistory.sort((a: any, b: any) => {
                            const stepA = parseInt(a.date.replace('Step ', ''));
                            const stepB = parseInt(b.date.replace('Step ', ''));
                            return stepB - stepA;
                        }).slice(0, 20); // Keep last 20 points

                        // Deterministic IP generation (mock but consistent)
                        const ipSuffix = n.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 255;

                        // Preserve position if exists, else random
                        const existingPos = posMap.get(n.id);
                        const x = existingPos ? existingPos.x : Math.random() * 1600;
                        const y = existingPos ? existingPos.y : Math.random() * 900;

                        return {
                            id: n.id,
                            userId: `USR-${n.id}`,
                            transactionId: `TXN-${n.id.substring(0, 8)}`, // Consistent TXN ref
                            ipAddress: `192.168.1.${ipSuffix}`,
                            name: `${n.id}`, // Use real ID
                            entity: n.id.startsWith('M') ? 'Merchant' : 'Customer',
                            type: n.id.startsWith('M') ? 'Corporate' : 'Individual',
                            riskScore: n.riskScore ? parseFloat(n.riskScore.toFixed(2)) : (n.graphScore * 10),
                            status: (n.riskScore > 80 || n.graphClass === 'AT_RISK') ? 'Flagged' : 'Safe',

                            volume: `₹${stats.totalVol.toFixed(2)}`,
                            volumeValue: stats.totalVol,

                            flagCount: n.graphScore > 2 ? n.graphScore : 0,
                            lastActive: sortedHistory.length > 0 ? sortedHistory[0].date : 'N/A',

                            x: x,
                            y: y,

                            isRingMember: n.graphClass === 'AT_RISK',
                            connections: Array.from(stats.neighbors),
                            history: sortedHistory.length > 0 ? sortedHistory : generateHistory(n.riskScore > 50) // Fallback
                        };
                    });
                });

            } catch (error) {
                console.error("Failed to fetch backend data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 3000);
        return () => clearInterval(intervalId);
    }, []);

    // Theme Effect
    useEffect(() => {
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.darkMode]);

    const handleClosePanel = () => {
        setSelectedId(null);
    };

    const handleNavigate = (page: Page) => {
        setSearchQuery(null);
        setCurrentPage(page);
        if (page === 'settings') {
            setIsSettingsOpen(true);
        } else {
            setIsSettingsOpen(false);
        }
    };

    const handleLogout = () => {
        setIsSettingsOpen(false);
        setIsAuthenticated(false);
        setShowIntro(true);
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const dismissNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    if (!isAuthenticated) {
        return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <>
            {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}

            <div className={`flex h-screen w-screen bg-slate-50 dark:bg-[#030303] text-slate-900 dark:text-slate-200 overflow-hidden font-inter selection:bg-indigo-500/30 transition-colors duration-500 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>

                {/* Global Noise Texture (Dark Mode Only) */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:block hidden"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Mobile Sidebar Overlay */}
                {isMobileNavOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in"
                        onClick={() => setIsMobileNavOpen(false)}
                    />
                )}

                {/* Responsive Sidebar Container */}
                <div className={`fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar
                        currentPage={currentPage}
                        onNavigate={(page) => {
                            handleNavigate(page);
                            setIsMobileNavOpen(false); // Close on navigate
                        }}
                        onProfileClick={() => setIsProfileOpen(true)}
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">

                    {/* Top Header */}
                    <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/60 dark:bg-black/20 backdrop-blur-sm flex items-center justify-between px-6 z-10 shrink-0 transition-colors">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsMobileNavOpen(true)} className="lg:hidden text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"><Menu size={20} /></button>

                            <div className="flex items-center text-xs text-slate-500 dark:text-white/30 gap-3 tracking-widest uppercase">
                                <span className="text-slate-900 dark:text-white/60 font-bold">Nexus Intelligence</span>
                                <span className="hidden md:inline text-slate-300 dark:text-white/10">/</span>
                                <span className="hidden md:flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    System Online
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">

                            {/* View Toggle */}
                            <div className="bg-slate-200 dark:bg-white/5 p-1 rounded-full border border-slate-300 dark:border-white/5 flex transition-colors">
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`p-2 rounded-full transition-all ${viewMode === 'graph' ? 'bg-white dark:bg-white text-black shadow-sm' : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    <Network size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white text-black shadow-sm' : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                            </div>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <Bell size={20} />
                                    {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 z-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Alerts</h3>
                                            <button onClick={clearAllNotifications} className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-1"><Trash2 size={12} /> CLEAR</button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div key={n.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border-l-2 border-indigo-500 relative group">
                                                        <button onClick={() => dismissNotification(n.id)} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                                                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{n.title}</div>
                                                        <div className="text-[10px] text-slate-500">{n.desc}</div>
                                                        <div className="text-[9px] text-slate-400 mt-2 font-mono">{n.time}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-xs text-slate-500 py-8">No active alerts</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Settings Button */}
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <SettingsIcon size={20} />
                            </button>

                            {/* User Menu */}
                            <button className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10 group" onClick={() => setIsProfileOpen(true)}>
                                <div className="text-right hidden md:block">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">Vigilante</div>
                                    <div className="text-[10px] text-slate-500 dark:text-white/40">Security Analyst</div>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                    V
                                </div>
                            </button>
                        </div>
                    </header>

                    {/* Workspace Grid */}
                    <main className="flex-1 flex overflow-hidden relative p-6 gap-6">
                        <div className="flex-1 flex flex-col min-w-0 gap-6 transition-all duration-300">
                            {/* Main Visualization Area */}
                            <div className="flex-1 min-h-0 relative">
                                {currentPage === 'search' ? (
                                    <SearchPage
                                        key={searchQuery || 'search-page'}
                                        accounts={accounts}
                                        currency={settings.currency}
                                        initialQuery={searchQuery}
                                    />
                                ) : currentPage === 'dashboard' ? (
                                    <FraudDashboardModal
                                        accounts={accounts}
                                    />

                                ) : currentPage === 'workflow' ? (
                                    <ProjectWorkflowPage onNavigate={() => handleNavigate('network')} />
                                ) : viewMode === 'graph' ? (
                                    <NetworkGraph
                                        accounts={accounts}
                                        selectedId={selectedId}
                                        onNodeClick={setSelectedId}
                                        isDarkMode={settings.darkMode}
                                        currency={settings.currency}
                                    />
                                ) : (
                                    <DataGrid
                                        accounts={accounts}
                                        selectedId={selectedId}
                                        onRowClick={setSelectedId}
                                    />
                                )}
                            </div>

                            {/* Bottom Analytics - Expands on click */}
                            <div className={`flex-shrink-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedId ? 'h-72 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
                                <AnalyticsPanel accounts={accounts} selectedId={selectedId} />
                            </div>
                        </div>

                        {/* Intelligence Panel */}
                        <div className={`hidden xl:block transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${selectedAccount ? 'w-96 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-20 overflow-hidden'}`}>
                            {selectedAccount && (
                                <IntelligencePanel
                                    account={selectedAccount}
                                    onInvestigate={(acc) => {
                                        setSearchQuery(acc.id);
                                        setCurrentPage('search');
                                        setSelectedId(null);
                                    }}
                                    onClose={handleClosePanel}
                                />
                            )}
                        </div>

                        {/* Mobile Panel Overlay */}
                        {selectedAccount && (
                            <div className="xl:hidden absolute right-4 top-4 bottom-4 z-30 flex w-full max-w-sm bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all animate-in slide-in-from-right">
                                <IntelligencePanel
                                    account={selectedAccount}
                                    onInvestigate={(acc) => {
                                        setSearchQuery(acc.id);
                                        setCurrentPage('search');
                                    }}
                                    onClose={handleClosePanel}
                                />
                            </div>
                        )}
                    </main>

                    {/* Modals */}
                    <ProfileModal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                    />

                    <SettingsModal
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        settings={settings}
                        onToggle={toggleSetting}
                        onCurrencyChange={(curr) => setSettings(prev => ({ ...prev, currency: curr }))}
                        onLogout={handleLogout}
                    />
                </div>
            </div>
        </>
    );
};

export default App;