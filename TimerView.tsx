
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

  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);
  const secondsOptions = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isRunning && !isRinging) {
      const totalSeconds = selH * 3600 + selM * 60 + selS;
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
    }
  }, [selH, selM, selS, isRunning, isRinging]);

  const handleFinished = () => {
    setIsRunning(false);
    setIsRinging(true);
    playAudio(selectedSound, true);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏲️ Temporizador encerrado!", { body: "Seu tempo acabou." });
    }
  };

  const startTimer = () => {
    const totalSeconds = selH * 3600 + selM * 60 + selS;
    if (totalSeconds === 0) return;
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsRinging(false);
    stopAudio();
    const totalSeconds = selH * 3600 + selM * 60 + selS;
    setTimeLeft(totalSeconds);
  };

  const stopRinging = () => {
    setIsRinging(false);
    stopAudio();
  };

  const clearSelectors = () => {
    setIsRunning(false);
    setSelH(0);
    setSelM(0);
    setSelS(0);
    setTimeLeft(0);
  };

  const formatDisplayTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = initialTime > 0 ? (timeLeft / initialTime) * circumference : 0;
  const dashoffset = circumference - progress;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500 py-4 relative">
      <div className="relative mb-8">
        <svg width="300" height="300" className="transform -rotate-90">
          <circle cx="150" cy="150" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800 transition-colors" />
          <circle cx="150" cy="150" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" className={`transition-all duration-1000 ease-linear ${timeLeft < 10 && timeLeft > 0 ? 'text-red-500' : 'text-blue-600 dark:text-blue-500'}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-mono font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            {formatDisplayTime(timeLeft)}
          </div>
          {isRunning && (
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-2 animate-pulse">
              Contando...
            </div>
          )}
        </div>
      </div>

      {!isRinging && (
        <div className="flex gap-6 items-center mb-10">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`h-20 w-20 rounded-3xl flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 ${
              isRunning 
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-2 border-amber-500/30' 
                : 'bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-500'
            }`}
            disabled={timeLeft === 0 && !isRunning}
          >
            {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>

          <button onClick={resetTimer} className="p-5 rounded-3xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-lg active:rotate-180 duration-500">
            <RefreshCw size={26} />
          </button>
        </div>
      )}

      {!isRunning && !isRinging ? (
        <div className="w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-6 text-slate-500 dark:text-slate-400">
             <Clock size={16} />
             <span className="text-xs font-bold uppercase tracking-wider">Configurar Temporizador</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Horas', value: selH, setter: setSelH, options: hoursOptions },
              { label: 'Minutos', value: selM, setter: setSelM, options: minutesOptions },
              { label: 'Segundos', value: selS, setter: setSelS, options: secondsOptions }
            ].map(item => (
              <div key={item.label} className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">{item.label}</label>
                <div className="relative">
                  <select
                    value={item.value}
                    onChange={(e) => item.setter(Number(e.target.value))}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all text-center"
                  >
                    {item.options.map(val => (
                      <option key={val} value={val}>{String(val).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button onClick={clearSelectors} className="w-full py-2 mb-6 text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center justify-center gap-2 transition-colors uppercase tracking-widest">
            <Trash2 size={12} /> Zerar Tempos
          </button>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              <Volume2 size={12} /> Som do Alerta
            </label>
            <div className="relative">
              <select value={selectedSound} onChange={(e) => { const s = e.target.value as SoundKey; setSelectedSound(s); previewSound(s); }} className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all">
                {TIMER_SOUNDS.map(s => <option key={s} value={s}>{SOUNDS[s].label}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Volume2 size={16} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 mb-8 italic text-slate-400 dark:text-slate-500 text-sm animate-pulse">
          {!isRinging ? 'Pausar para ajustar temporizador' : ''}
        </div>
      )}

      {isRinging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="bg-slate-800 p-10 rounded-[40px] shadow-2xl border border-slate-700 max-w-sm w-full text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-ping">
              <BellRing size={48} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">TEMPO ESGOTADO!</h2>
            <p className="text-slate-400 mb-10 font-medium">O temporizador chegou ao fim.</p>
            <button onClick={stopRinging} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xl transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center justify-center gap-3">
              <Square size={24} fill="currentColor" /> PARAR
            </button>
          </div>
        </div>
      )}
      
      {!isRinging && (
        <p className="mt-4 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">
          {timeLeft > 0 ? 'Temporizador Pronto' : 'Aguardando Configuração'}
        </p>
      )}
    </div>
  );
};
