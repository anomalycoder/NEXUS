import React from 'react';
import { LayoutDashboard, Settings, ScanEye, Activity, Search, Network, Workflow } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onProfileClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onProfileClick }) => {
  return (
    <div className="w-20 lg:w-24 h-full bg-white/80 dark:bg-black/40 border-r border-slate-200 dark:border-white/5 flex flex-col items-center py-8 flex-shrink-0 z-50 backdrop-blur-2xl relative transition-all duration-500 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      {/* Brand */}
      <div className="mb-12 flex flex-col items-center gap-2 group cursor-pointer">
        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-slate-200 dark:border-white/10 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-500">
          <ScanEye className="text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" size={24} />
        </div>
        <span className="hidden lg:block text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">NEXUS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 w-full px-4 flex flex-col items-center">
        <NavItem
          icon={<Network size={22} />}
          label="Network"
          active={currentPage === 'network'}
          onClick={() => onNavigate('network')}
        />
        <NavItem
          icon={<LayoutDashboard size={22} />}
          label="Dashboard"
          active={currentPage === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
        <NavItem
          icon={<Workflow size={22} />}
          label="Workflow"
          active={currentPage === 'workflow'}
          onClick={() => onNavigate('workflow')}
        />
        <NavItem
          icon={<Search size={22} />}
          label="Search"
          active={currentPage === 'search'}
          onClick={() => onNavigate('search')}
        />

        <NavItem
          icon={<Settings size={22} />}
          label="System"
          active={currentPage === 'settings'}
          onClick={() => onNavigate('settings')}
        />
      </nav>

    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 
    ${active
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
        : 'text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
      }`}
    title={label}
  >
    {icon}
    {active && <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-l-full"></span>}
  </button>
);

export default Sidebar;