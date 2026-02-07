import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ControlPanel } from './ControlPanel';
import { LogConsole } from './LogConsole';
import { MapDisplay } from './MapDisplay';
import { JIE_FANG_BEI_HUB } from './constants';
import { ParkingSpot, LogEntry, SimulationResult, AppStatus } from './types';

// Helper for deep simulation logic
const simulateDeepAR = () => {
  const waitTime = Math.floor(Math.random() * (8 - 4 + 1)) + 4; // 4-8s wait
  const rand = Math.random();
  
  if (rand > 0.7) {
    return { type: 'HIGH_DEMAND', label: 'Surge (High Demand)', defer: false, reason: 'Immediate commit to prevent loss.', targetTime: 0 };
  } else if (rand > 0.4) {
    return { type: 'MODERATE', label: 'Moderate Flow', defer: true, targetTime: waitTime, reason: 'Optimization in progress...' };
  } else {
    return { type: 'REGIME_SHIFT', label: 'Regime Shift', defer: true, targetTime: waitTime, reason: 'Awaiting residential release...' };
  }
};

export default function App() {
  const [query, setQuery] = useState('解放碑');
  const [duration, setDuration] = useState('3');
  const [status, setStatus] = useState<AppStatus>('IDLE');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [mapCenter, setMapCenter] = useState(JIE_FANG_BEI_HUB["解放碑"]);

  // Refs for cleanup
  const timerRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString('en-US', { hour12: false }), msg, type }]);
  }, []);

  const executeAssignment = useCallback((matchedKey: string) => {
    const hubData = JIE_FANG_BEI_HUB[matchedKey];
    // Prefer residential for simulation variety
    const residentialSpots = hubData.parking.filter(p => p.type === '居民共享' || p.type === '老旧小区改造');
    const candidates = (residentialSpots.length > 0) ? residentialSpots : hubData.parking;
    const parkingOption = candidates[Math.floor(Math.random() * candidates.length)];

    // Simulate real-world walking path.
    // We want approx 4-5 mins walking time. 
    // Average urban walking speed is ~75m/min. So we aim for 300m - 375m range.
    // Hub distances are usually line-of-sight ~100-200m.
    // We use a higher multiplier to simulate city block detours.
    let walkingFactor = 1.8 + Math.random() * 0.6; 
    let finalDist = Math.floor(parkingOption.dist * walkingFactor);
    
    // Enforce a minimum floor to ensure it feels like a "4-5 min" walk
    if (finalDist < 300) {
        finalDist = 300 + Math.floor(Math.random() * 80);
    }
    
    // Cap strictly so it doesn't get too far (>7 min)
    if (finalDist > 550) {
      finalDist = 450 + Math.floor(Math.random() * 50);
    }

    const res: SimulationResult = {
      name: parkingOption.name,
      type: parkingOption.type,
      dist: finalDist,
      coords: [hubData.lat, hubData.lon]
    };

    setResult(res);
    setStatus('ASSIGNED');
    addLog(`[ASSIGN] ASSIGNMENT LOCKED: ${res.name}`, 'success');
  }, [addLog]);

  const handleRequest = async () => {
    if (!query) return;
    
    // Clear previous state
    setStatus('CHECKING_LIMITS');
    setLogs([]);
    setResult(null);
    setElapsedTime(0);
    if (timerRef.current) clearInterval(timerRef.current);

    addLog(`>>> SYSTEM INIT: DESTINATION [${query}]`, 'cmd');

    try {
      // Find key matching simulation data
      let matchedKey: string | null = null;
      for (const key in JIE_FANG_BEI_HUB) {
        if (query.includes(key) || key.includes(query)) {
          matchedKey = key;
          break;
        }
      }

      if (!matchedKey) {
        setStatus('IDLE');
        addLog(`[ERR] INVALID LOCATION: ${query}. Try '解放碑' or '洪崖洞'`, 'error');
        return;
      }

      const targetLoc = JIE_FANG_BEI_HUB[matchedKey];
      setMapCenter(targetLoc);
      addLog(`[GEO] COORDINATES LOCKED: ${matchedKey}`, 'success');

      // Simulation delays for effect
      await new Promise(r => setTimeout(r, 800));
      addLog(`[SYS] FEASIBILITY CHECK: PASSED`, 'info');

      setStatus('PREDICTING');
      addLog(`[AI] DeepAR MODEL INFERENCE...`, 'info');
      await new Promise(r => setTimeout(r, 1500));

      const prediction = simulateDeepAR();
      addLog(`[FORECAST] ${prediction.label}`, 'warn');

      if (prediction.defer) {
        setStatus('WAITING');
        addLog(`[DQN] STRATEGY: DEFER (Pooling)`, 'warn');
        addLog(`[REASON] ${prediction.reason}`, 'info');

        let currentWait = 0;
        const targetWait = prediction.targetTime || 5;

        // Start real timer
        timerRef.current = window.setInterval(() => {
          currentWait += 0.1;
          setElapsedTime(prev => prev + 0.1);

          if (currentWait >= targetWait) {
            if (timerRef.current) clearInterval(timerRef.current);
            addLog(`[EVENT] SPOT RELEASED (Wait: ${currentWait.toFixed(1)}s)`, 'success');
            executeAssignment(matchedKey!);
          }
        }, 100);
      } else {
        executeAssignment(matchedKey);
      }

    } catch (e) {
      console.error(e);
      setStatus('IDLE');
      addLog(`[CRITICAL] SYSTEM FAILURE`, 'error');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden scanline selection:bg-sky-500/30">
      {/* Left Panel - Controls & Logs */}
      <div className="w-full lg:w-[480px] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/60 bg-[#0b1121]/90 backdrop-blur-2xl z-30 shadow-2xl h-[50vh] lg:h-full shrink-0 relative transition-all duration-300 ease-in-out">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/60 flex-shrink-0">
           <div className="flex items-center gap-4">
               <div className="relative">
                 <div className="absolute inset-0 bg-sky-500 blur-lg opacity-20 animate-pulse"></div>
                 <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl shadow-2xl flex items-center justify-center text-sky-400 relative z-10">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                 </div>
               </div>
               <div>
                   <h1 className="text-xl font-bold text-white tracking-tight font-mono">PARK.OS <span className="text-sky-500">COMMAND</span></h1>
                   <div className="flex items-center gap-2 mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                       <div className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase font-bold">SYSTEM ONLINE</div>
                   </div>
               </div>
           </div>
        </div>

        {/* Inputs */}
        <div className="p-6 flex-shrink-0">
          <ControlPanel 
            query={query} 
            setQuery={setQuery} 
            duration={duration} 
            setDuration={setDuration} 
            status={status}
            onInit={handleRequest}
          />
        </div>

        {/* Logs */}
        <div className="flex-1 min-h-0 flex flex-col p-6 pt-0">
          <LogConsole logs={logs} />
        </div>
      </div>

      {/* Right Panel - Map Visualization */}
      <div className="flex-1 relative z-20 h-[50vh] lg:h-full bg-slate-950">
        <MapDisplay 
          centerLat={mapCenter.lat} 
          centerLon={mapCenter.lon} 
          status={status} 
          result={result}
          elapsedTime={elapsedTime}
        />
        <div className="absolute inset-0 scan-overlay pointer-events-none z-10"></div>
      </div>
    </div>
  );
}