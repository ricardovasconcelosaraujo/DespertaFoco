
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Flag } from 'lucide-react';

export const StopwatchView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // milliseconds
  const [laps, setLaps] = useState<number[]>([]);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return {
      text: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      sub: String(centiseconds).padStart(2, '0')
    };
  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp - time;
    const newTime = timestamp - startTimeRef.current;
    setTime(newTime);
    requestRef.current = requestAnimationFrame(animate);
  };

  // Atualiza o título da aba com o tempo do cronômetro
  useEffect(() => {
    if (isRunning) {
      const f = formatTime(time);
      document.title = `⏱️ ${f.text}.${f.sub} | Cronômetro`;
    }
  }, [time, isRunning]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - time;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  const handleLap = () => {
    setLaps(prev => [time, ...prev]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    document.title = 'Cronômetro Online de Precisão | DespertaFoco';
  };

  const formatted = formatTime(time);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mt-10">
        <div className="text-8xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums text-slate-900 dark:text-white transition-colors">
          {formatted.text}
          <span className="text-4xl md:text-5xl text-slate-400 dark:text-slate-500 ml-2">.{formatted.sub}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${
            isRunning 
              ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30' 
              : 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 dark:hover:bg-green-500/30'
          }`}
        >
          {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        
        <button
          onClick={handleLap}
          disabled={!isRunning}
          className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <Flag size={24} />
        </button>

        <button
          onClick={handleReset}
          className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      {laps.length > 0 && (
        <div className="w-full max-w-md mt-8 bg-white dark:bg-slate-800/50 rounded-2xl p-4 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-xl transition-colors">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-700 transition-colors">
                <th className="text-left py-2 px-4 font-bold uppercase tracking-wider text-[10px]">Volta</th>
                <th className="text-right py-2 px-4 font-bold uppercase tracking-wider text-[10px]">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {laps.map((lap, index) => {
                 const f = formatTime(lap);
                 return (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">#{laps.length - index}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-slate-200">
                      {f.text}.{f.sub}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
