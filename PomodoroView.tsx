
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Coffee, Brain, Armchair, Settings2, Volume2, ArrowLeft, Award, Clock3 } from 'lucide-react';
import { SOUNDS, SoundKey, PomodoroPreset, PomodoroStats } from './types';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroViewProps {
  onFinished?: (sound: string) => void;
  stopAudio?: () => void;
  previewSound?: (sound: string) => void;
}

const PRESETS_DATA: Record<Exclude<PomodoroPreset, 'custom'>, { work: number, short: number, long: number, label: string }> = {
  micro: { work: 10, short: 2, long: 10, label: 'Micro' },
  classic: { work: 25, short: 5, long: 15, label: 'Clássico' },
  medium: { work: 40, short: 8, long: 20, label: 'Médio' },
  doubled: { work: 50, short: 10, long: 30, label: 'Dobrado' }
};

export const PomodoroView: React.FC<PomodoroViewProps> = ({ onFinished, stopAudio, previewSound }) => {
  const [activePreset, setActivePreset] = useState<PomodoroPreset>(() => (localStorage.getItem('pomodoro_active_preset') as PomodoroPreset) || 'classic');
  const [configs, setConfigs] = useState(() => {
    const saved = localStorage.getItem('pomodoro_configs');
    return saved ? JSON.parse(saved) : { work: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4, sound: 'forest' as SoundKey };
  });
  const [stats, setStats] = useState<PomodoroStats>(() => {
    const saved = localStorage.getItem('pomodoro_stats');
    return saved ? JSON.parse(saved) : { work: 0, shortBreak: 0, longBreak: 0 };
  });

  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(configs.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const presets = {
    work: { label: 'Foco Total', color: 'text-blue-600', bg: 'bg-blue-500/10', icon: Brain },
    shortBreak: { label: 'Pausa Curta', color: 'text-teal-600', bg: 'bg-teal-500/10', icon: Coffee },
    longBreak: { label: 'Pausa Longa', color: 'text-violet-600', bg: 'bg-violet-500/10', icon: Armchair },
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) {
            setIsRunning(false);
            onFinished?.(configs.sound);
            setStats(s => ({ ...s, [mode]: s[mode] + 1 }));
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    } else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    stopAudio?.();
    const newTime = newMode === 'work' ? configs.work : newMode === 'shortBreak' ? configs.shortBreak : configs.longBreak;
    setTimeLeft(newTime * 60);
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="w-full flex justify-end mb-4">
        <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm"><Settings2 size={16} /> CUSTOMIZAR</button>
      </div>

      <div className="flex p-1 bg-white dark:bg-slate-800 rounded-2xl mb-10 w-full shadow-lg border border-slate-200 dark:border-slate-700">
        {(Object.keys(presets) as Mode[]).map((m) => (
          <button key={m} onClick={() => switchMode(m)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === m ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
            {presets[m].label}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-full mb-12">
        <div className={`p-12 md:p-16 rounded-full border-4 border-slate-200 dark:border-slate-800 ${presets[mode].bg} shadow-xl`}>
          <div className={`text-9xl font-mono font-bold tracking-tighter ${presets[mode].color}`}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-center">
        <button onClick={() => setIsRunning(!isRunning)} className={`flex items-center gap-3 px-12 py-5 rounded-3xl font-bold text-xl transition-all shadow-2xl ${isRunning ? 'bg-white dark:bg-slate-800 text-amber-600 border border-amber-500/30' : 'bg-blue-600 text-white'}`}>
          {isRunning ? <><Pause size={28} fill="currentColor" /> PAUSAR</> : <><Play size={28} fill="currentColor" className="ml-1" /> INICIAR</>}
        </button>
        <button onClick={() => setShowSummary(true)} className="px-8 py-5 rounded-3xl bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shadow-xl font-bold text-xs">RESUMO</button>
      </div>

      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[40px] p-10 text-center animate-in zoom-in-95">
            <Award size={48} className="mx-auto mb-6 text-blue-600" />
            <h2 className="text-3xl font-black mb-2">Sua Produtividade</h2>
            <div className="grid grid-cols-2 gap-4 my-8">
              <div className="bg-blue-50 dark:bg-blue-500/5 p-6 rounded-3xl border border-blue-100">
                <div className="text-4xl font-black text-blue-600">{stats.work * configs.work}</div>
                <div className="text-[10px] font-bold uppercase text-blue-500">Minutos de Foco</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100">
                <div className="text-4xl font-black">{stats.work}</div>
                <div className="text-[10px] font-bold uppercase text-slate-500">Ciclos Concluídos</div>
              </div>
            </div>
            <button onClick={() => setShowSummary(false)} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl">VOLTAR</button>
          </div>
        </div>
      )}
    </div>
  );
};
