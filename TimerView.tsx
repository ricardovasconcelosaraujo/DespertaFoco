
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Trash2, Clock, Volume2, BellRing, Square } from 'lucide-react';
import { SOUNDS, SoundKey } from './types';

interface TimerViewProps {
  playAudio: (soundKey: string, loop?: boolean) => void;
  stopAudio: () => void;
  previewSound: (soundKey: string) => void;
}

const TIMER_SOUNDS: SoundKey[] = ['timer_beep', 'timer_bell', 'timer_alert', 'timer_whistle'];

export const TimerView: React.FC<TimerViewProps> = ({ playAudio, stopAudio, previewSound }) => {
  const [timeLeft, setTimeLeft] = useState(0); 
  const [initialTime, setInitialTime] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  
  const [selH, setSelH] = useState(0);
  const [selM, setSelM] = useState(5);
  const [selS, setSelS] = useState(0);
  const [selectedSound, setSelectedSound] = useState<SoundKey>('timer_beep');

  const intervalRef = useRef<number | null>(null);

  const formatDisplayTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsRinging(true);
            playAudio(selectedSound, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isRunning && !isRinging) {
      const totalSeconds = selH * 3600 + selM * 60 + selS;
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
    }
  }, [selH, selM, selS, isRunning, isRinging]);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = initialTime > 0 ? (timeLeft / initialTime) * circumference : 0;
  const dashoffset = circumference - progress;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500 py-4 relative">
      <div className="relative mb-8">
        <svg width="300" height="300" className="transform -rotate-90">
          <circle cx="150" cy="150" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800 transition-colors" />
          <circle cx="150" cy="150" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" className={`transition-all duration-1000 ease-linear ${timeLeft < 10 && timeLeft > 0 ? 'text-red-500' : 'text-blue-600'}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-mono font-bold text-slate-900 dark:text-white">{formatDisplayTime(timeLeft)}</div>
        </div>
      </div>

      {!isRinging && (
        <div className="flex gap-6 items-center mb-10">
          <button onClick={() => (isRunning ? setIsRunning(false) : setTimeLeft(timeLeft) || setIsRunning(true))} className={`h-20 w-20 rounded-3xl flex items-center justify-center transition-all shadow-xl ${isRunning ? 'bg-white dark:bg-slate-800 text-amber-600 border-2 border-amber-500/30' : 'bg-blue-600 text-white'}`}>
            {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={() => { setIsRunning(false); setTimeLeft(initialTime); stopAudio(); setIsRinging(false); }} className="p-5 rounded-3xl bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shadow-lg"><RefreshCw size={26} /></button>
        </div>
      )}

      {!isRunning && !isRinging && (
        <div className="w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl mb-8 animate-in fade-in">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Horas', value: selH, setter: setSelH, max: 23 },
              { label: 'Minutos', value: selM, setter: setSelM, max: 59 },
              { label: 'Segundos', value: selS, setter: setSelS, max: 59 }
            ].map(item => (
              <div key={item.label} className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">{item.label}</label>
                <select value={item.value} onChange={(e) => item.setter(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-slate-900 dark:text-white text-center">
                  {Array.from({ length: item.max + 1 }, (_, i) => i).map(val => (
                    <option key={val} value={val}>{String(val).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Som do Alerta</label>
            <select value={selectedSound} onChange={(e) => { setSelectedSound(e.target.value as SoundKey); previewSound(e.target.value as SoundKey); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              {TIMER_SOUNDS.map(s => <option key={s} value={s}>{SOUNDS[s].label}</option>)}
            </select>
          </div>
        </div>
      )}

      {isRinging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="bg-slate-800 p-10 rounded-[40px] shadow-2xl border border-slate-700 max-w-sm w-full text-center">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-ping"><BellRing size={48} /></div>
            <h2 className="text-2xl font-black text-white uppercase mb-2">TEMPO ESGOTADO!</h2>
            <button onClick={() => { setIsRinging(false); stopAudio(); }} className="w-full py-5 bg-red-600 text-white font-black rounded-2xl text-xl flex items-center justify-center gap-3"><Square size={24} fill="currentColor" /> PARAR</button>
          </div>
        </div>
      )}
    </div>
  );
};
