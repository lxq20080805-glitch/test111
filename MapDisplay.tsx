import React from 'react';
import { AppStatus, SimulationResult } from '../types';
import { Icons } from './Icons';

interface MapDisplayProps {
  centerLat: number;
  centerLon: number;
  status: AppStatus;
  result: SimulationResult | null;
  elapsedTime: number;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ 
  centerLat, centerLon, status, result, elapsedTime 
}) => {
  // Offset for Street Level View
  const offset = 0.0004; 
  const bbox = `${centerLon - offset},${centerLat - offset},${centerLon + offset},${centerLat + offset}`;

  // CSS Filter to make OSM look like a dark vector map
  const mapFilter = 'invert(100%) hue-rotate(180deg) contrast(1.1) grayscale(0.5) brightness(0.9) saturate(1.2)';

  // Calculate walking time (approx 75m/min for urban environment with crossings)
  const walkTime = result ? Math.ceil(result.dist / 75) : 0;

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden group">
        {/* Iframe Map Layer (z-0) */}
        <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight={0} 
            marginWidth={0} 
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
            style={{ filter: mapFilter }}
            className="opacity-60 transition-opacity duration-1000 group-hover:opacity-70 absolute inset-0 z-0"
            title="Live Map"
        />

        {/* Grid Overlay (z-0) */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
            backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
        }}></div>

        {/* Center Target Marker (z-40: Needs to be on top of line) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-40 pointer-events-none">
            <div className="relative">
                <div className="w-3 h-3 bg-rose-500 rounded-full border border-white shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-pulse z-20 relative"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-rose-500/10 rounded-full animate-ping-slow border border-rose-500/20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[1px] bg-rose-500/20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[300px] bg-rose-500/20"></div>
            </div>
            <div className="mt-4 bg-black/80 text-rose-400 text-[9px] px-2 py-1 rounded border border-rose-500/30 backdrop-blur-md font-mono font-bold tracking-[0.2em]">
                TARGET LOCK
            </div>
        </div>

        {/* Status Overlay: Searching (z-20) */}
        {status === 'WAITING' && (
            <div className="absolute inset-0 bg-slate-900/40 z-20 flex items-center justify-center backdrop-blur-[2px]">
                <div className="relative">
                    <div className="w-[280px] h-[280px] border border-amber-500/30 rounded-full animate-spin-slow border-t-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.2)]"></div>
                    <div className="w-[200px] h-[200px] border border-sky-500/20 rounded-full animate-spin-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-sky-500/60" style={{ animationDirection: 'reverse', animationDuration: '8s' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 px-4 py-2 rounded border border-amber-500/30 text-amber-500 font-mono text-xs font-bold animate-pulse backdrop-blur-md shadow-xl">
                            AWAITING POOL RELEASE...
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Status Overlay: Success */}
        {status === 'ASSIGNED' && result && (
            <>
                {/* Visual Data Link Layer (z-10: Behind the center marker and target marker) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={result.type === '居民共享' ? '#0ea5e9' : '#10b981'} stopOpacity="0.1" />
                            <stop offset="50%" stopColor={result.type === '居民共享' ? '#0ea5e9' : '#10b981'} stopOpacity="0.8" />
                            <stop offset="100%" stopColor={result.type === '居民共享' ? '#0ea5e9' : '#10b981'} stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    {/* Line from Center (50%, 50%) to Parking Spot (Left 75%, Top 35%) */}
                    <line 
                        x1="50%" y1="50%" 
                        x2="75%" y2="35%" 
                        stroke={`url(#lineGradient)`}
                        strokeWidth="2" 
                        strokeDasharray="6,4"
                        className="animate-pulse"
                    />
                    <circle cx="50%" cy="50%" r="2" fill={result.type === '居民共享' ? '#0ea5e9' : '#10b981'} className="animate-ping" />
                    <circle cx="75%" cy="35%" r="3" fill={result.type === '居民共享' ? '#0ea5e9' : '#10b981'} />
                </svg>

                {/* Marker & Info Card (z-50: Topmost layer) */}
                {/* Positioned at Left 75%, Top 35% to match the SVG line endpoint */}
                <div className="absolute top-[35%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-50 animate-in zoom-in slide-in-from-bottom-10 duration-700 ease-out">
                    <div className="relative group cursor-pointer">
                        <div className={`w-10 h-10 ${result.type === '居民共享' ? 'bg-sky-500' : 'bg-emerald-500'} text-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.5)] border-2 border-white z-20 relative ring-4 ring-black/50`}>
                            {result.type === '居民共享' ? <Icons.Home className="w-5 h-5" /> : <Icons.CheckCircle2 className="w-5 h-5" />}
                        </div>
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 ${result.type === '居民共享' ? 'bg-sky-500/20' : 'bg-emerald-500/20'} rounded-full animate-ping-slow`}></div>
                    </div>

                    {/* Data Card */}
                    <div className="absolute left-[120%] top-[-80px] w-[220px]">
                        <div className="bg-slate-900/95 text-white text-[10px] p-0 rounded-lg border border-slate-600/50 backdrop-blur-xl shadow-2xl overflow-hidden transform transition-transform hover:scale-105">
                            <div className="px-4 py-3 border-b border-slate-800">
                                <div className={`font-bold mb-1 ${result.type === '居民共享' ? 'text-sky-400' : 'text-emerald-400'} uppercase tracking-widest text-[9px]`}>
                                {result.type === '居民共享' ? 'RESIDENTIAL MATCH' : 'COMMERCIAL SPOT'}
                                </div>
                                <div className="text-slate-200 font-bold text-sm leading-tight">{result.name}</div>
                            </div>
                            <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Icons.Walk className="w-3 h-3" />
                                    <span>~{walkTime} min</span>
                                </div>
                                <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{result.dist}m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* HUD Info Box (z-50) */}
        <div className="absolute top-6 right-6 font-mono text-[10px] text-sky-400/90 bg-black/80 p-4 border-l-2 border-sky-500 backdrop-blur-md z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-r-none rounded-l-lg border-y border-y-slate-800/50 border-r border-r-slate-800/50 min-w-[180px]">
            <div className="flex items-center gap-2 mb-3 text-sky-300 font-bold border-b border-sky-500/20 pb-2">
                <Icons.Activity className="w-4 h-4" />
                <span>LIVE MONITOR</span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-slate-500">STATUS</span> 
                    <span className={`font-bold px-1.5 py-0.5 rounded ${status === 'ASSIGNED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                        {status}
                    </span>
                </div>
                {status === 'WAITING' && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                        <span className="text-amber-500">LATENCY</span> 
                        <span className="text-amber-400 font-bold">+{elapsedTime.toFixed(1)}s</span>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-slate-500">LAT/LON</span> 
                    <span className="text-slate-400">{centerLat.toFixed(4)}, {centerLon.toFixed(4)}</span>
                </div>
            </div>
        </div>
    </div>
  );
};