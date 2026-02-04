
import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

export const TimerView: React.FC<{playAudio: any, stopAudio: any, previewSound: any}> = ({ playAudio, stopAudio }) => {
  const [seconds, setSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      playAudio('timer_beep', true);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="text-8xl md:text-9xl font-mono font-bold text-slate-900 dark:text-white">{format(seconds)}</div>
      <div className="flex gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center">
          {isRunning ? <Pause/> : <Play fill="white"/>}
        </button>
        <button onClick={() => { setIsRunning(false); setSeconds(300); stopAudio(); }} className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center"><RefreshCw/></button>
      </div>
    </div>
  );
};
