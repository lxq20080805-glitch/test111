import React from 'react';
import { Icons } from './Icons';
import { AppStatus } from '../types';

interface ControlPanelProps {
  query: string;
  setQuery: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  status: AppStatus;
  onInit: () => void;
}

const PRESETS = ['解放碑', 'WFC', '洪崖洞', '来福士'];

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  query, setQuery, duration, setDuration, status, onInit 
}) => {
  const isBusy = status !== 'IDLE' && status !== 'ASSIGNED';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-sky-500 uppercase tracking-widest flex items-center gap-2">
            <Icons.MapPin className="w-3 h-3" /> Target Sector
        </label>
        <div className="relative group">
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isBusy}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-4 rounded-xl focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-medium placeholder:text-slate-600 shadow-inner font-mono disabled:opacity-50"
                placeholder="ENTER LOCATION"
            />
            <div className="absolute right-4 top-4 text-slate-500"><Icons.Search className="w-5 h-5" /></div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-1">
            {PRESETS.map(loc => (
                <button 
                    key={loc}
                    onClick={() => setQuery(loc)}
                    disabled={isBusy}
                    className="text-[10px] px-3 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-md hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/50 transition-all font-medium text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loc}
                </button>
            ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/3 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Icons.Clock className="w-3 h-3" /> Max Wait
            </label>
            <input 
                type="number" 
                value={duration}
                min="1"
                max="8"
                disabled={isBusy}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-2 py-4 rounded-xl focus:ring-1 focus:ring-sky-500 outline-none font-mono text-center font-bold disabled:opacity-50"
            />
        </div>
        <div className="flex items-end flex-1">
            <button 
                onClick={onInit}
                disabled={isBusy}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden group border border-transparent
                    ${isBusy 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700' 
                    : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white hover:shadow-sky-500/25 active:scale-95 border-t-sky-400/20'}`}
            >
                <Icons.Zap className={`w-4 h-4 ${isBusy ? '' : 'text-sky-200'}`} />
                <span className="relative z-10 font-mono">
                  {isBusy ? 'PROCESSING...' : 'INITIATE SCAN'}
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};