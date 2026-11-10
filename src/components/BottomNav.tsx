import React from 'react';
import { Home, BarChart2, Package, Terminal, Settings } from 'lucide-react';

export type TabType = 'home' | 'usage' | 'plans' | 'logs' | 'settings';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'usage', label: 'Usage', icon: BarChart2 },
    { id: 'plans', label: 'Plans', icon: Package },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full pt-1.5 pb-2 px-2 border-t border-slate-800/80 bg-[#050C1B]/95 backdrop-blur-md select-none">
      <div className="grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]' : ''}`} />
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-cyan-400 mx-auto mt-0.5 block" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 font-medium tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
