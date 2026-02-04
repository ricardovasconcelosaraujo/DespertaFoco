
import React, { useState, useEffect } from 'react';
import { Play, Pause, Coffee, Brain } from 'lucide-react';

export const PomodoroView: React.FC<{onFinished: any, stopAudio: any, previewSound: any}> = ({ onFinished }) => {
  const [seconds, setSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      onFinished('forest');
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  return (
    <div className="flex flex-col items-center py-12 space-y-12">
      <div className="bg-blue-500/10 p-12 rounded-full border-4 border-blue-500">
        <div className="text-8xl font-mono font-bold text-blue-600">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </div>
      </div>
      <button onClick={() => setIsRunning(!isRunning)} className={`px-12 py-5 rounded-3xl font-bold text-xl text-white shadow-xl ${isRunning ? 'bg-amber-500' : 'bg-blue-600'}`}>
        {isRunning ? 'PAUSAR' : 'INICIAR FOCO'}
      </button>
    </div>
  );
};
