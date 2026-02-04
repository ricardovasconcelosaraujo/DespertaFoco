
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

export const StopwatchView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const requestRef = useRef<number>();

  const animate = (timestamp: number) => {
    setTime(prev => prev + 10);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) requestRef.current = requestAnimationFrame(animate);
    else if (requestRef.current) cancelAnimationFrame(requestRef.current);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isRunning]);

  const format = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const cents = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cents).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="text-8xl md:text-9xl font-mono font-bold text-slate-900 dark:text-white">{format(time)}</div>
      <div className="flex gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className={`w-16 h-16 rounded-full flex items-center justify-center ${isRunning ? 'bg-red-500' : 'bg-green-500'} text-white`}>
          {isRunning ? <Pause/> : <Play fill="white"/>}
        </button>
        <button onClick={() => { setIsRunning(false); setTime(0); }} className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><RefreshCw/></button>
      </div>
    </div>
  );
};
