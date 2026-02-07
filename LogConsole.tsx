import React, { useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { LogEntry } from '../types';

interface LogConsoleProps {
  logs: LogEntry[];
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'cmd': return 'text-sky-400 font-bold';
      case 'success': return 'text-emerald-400';
      case 'warn': return 'text-amber-400';
      case 'error': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 border-t border-slate-800/60 pt-4">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
                <div className="text-slate-500"><Icons.Database className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">System Kernel</span>
            </div>
            <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-600/50 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-slate-600/50 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-slate-600/50 rounded-full"></div>
            </div>
        </div>
        <div className="font-mono text-[11px] space-y-1.5 overflow-y-auto custom-scrollbar pr-2 flex-1 scroll-smooth bg-slate-950/30 p-2 rounded-lg border border-slate-800/30">
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-2 opacity-50">
                <Icons.Activity className="w-8 h-8 animate-pulse" />
                <span className="italic">Awaiting instructions...</span>
              </div>
            )}
            {logs.map((log, i) => (
                <div key={i} className="flex gap-3 opacity-90 hover:opacity-100 transition-opacity leading-relaxed">
                    <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                    <span className={getLogColor(log.type)}>
                        {log.type === 'cmd' && <span className="mr-2 text-sky-600">$</span>}
                        {log.msg}
                    </span>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    </div>
  );
};