
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Coffee, Brain, Armchair, Settings2, Volume2, ArrowLeft, BarChart3, CheckCircle2, Repeat, ChevronRight, ChevronLeft, Award, Clock3, ClipboardList } from 'lucide-react';
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
  const initialConfigsRef = useRef(configs);

  const presets = {
    work: { label: 'Foco Total', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', icon: Brain, emoji: '🍅' },
    shortBreak: { label: 'Pausa Curta', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10', icon: Coffee, emoji: '☕' },
    longBreak: { label: 'Pausa Longa', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', icon: Armchair, emoji: '🛋️' },
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning) {
      document.title = `${presets[mode].emoji} ${formatTime(timeLeft)} | Pomodoro`;
    }
  }, [timeLeft, isRunning, mode]);

  useEffect(() => {
    localStorage.setItem('pomodoro_configs', JSON.stringify(configs));
    localStorage.setItem('pomodoro_active_preset', activePreset);
  }, [configs, activePreset]);

  useEffect(() => {
    localStorage.setItem('pomodoro_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleCycleFinished();
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
    if (!isRunning) {
      const currentModeTime = mode === 'work' ? configs.work : mode === 'shortBreak' ? configs.shortBreak : configs.longBreak;
      setTimeLeft(currentModeTime * 60);
    }
  }, [configs, mode]);

  const handleCycleFinished = () => {
    setIsRunning(false);
    onFinished?.(configs.sound);
    setStats(prev => ({
      ...prev,
      work: mode === 'work' ? prev.work + 1 : prev.work,
      shortBreak: mode === 'shortBreak' ? prev.shortBreak + 1 : prev.shortBreak,
      longBreak: mode === 'longBreak' ? prev.longBreak + 1 : prev.longBreak
    }));
    setTimeout(() => {
      let nextMode: Mode;
      if (mode === 'work') {
        const interval = configs.longBreakInterval || 4;
        nextMode = (stats.work + 1) % interval === 0 ? 'longBreak' : 'shortBreak';
      } else { nextMode = 'work'; }
      switchMode(nextMode);
      setIsRunning(true);
    }, 2000);
  };

  const selectPreset = (p: PomodoroPreset) => {
    setActivePreset(p);
    if (p !== 'custom') {
      const data = PRESETS_DATA[p];
      setConfigs({ ...configs, work: data.work, shortBreak: data.short, longBreak: data.long });
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    stopAudio?.(); 
    const newTime = newMode === 'work' ? configs.work : newMode === 'shortBreak' ? configs.shortBreak : configs.longBreak;
    setTimeLeft(newTime * 60);
    document.title = 'Pomodoro / Despertador para Estudar | DespertaFoco';
  };

  const handleSaveSettings = () => {
    const hasChanged = initialConfigsRef.current.work !== configs.work || initialConfigsRef.current.shortBreak !== configs.shortBreak || initialConfigsRef.current.longBreak !== configs.longBreak;
    if (hasChanged) {
      setIsRunning(false);
      const newTime = mode === 'work' ? configs.work : mode === 'shortBreak' ? configs.shortBreak : configs.longBreak;
      setTimeLeft(newTime * 60);
    }
    setShowSettings(false);
  };

  const handleEndSession = () => {
    setIsRunning(false);
    stopAudio?.();
    setShowSummary(true);
    document.title = 'Sessão Encerrada | DespertaFoco';
  };

  const resetAllStats = () => {
    setStats({ work: 0, shortBreak: 0, longBreak: 0 });
    setTimeLeft(configs.work * 60);
    setMode('work');
    setShowSummary(false);
    document.title = 'Pomodoro / Despertador para Estudar | DespertaFoco';
  };

  const totalFocusMinutes = stats.work * configs.work;

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="w-full flex justify-end mb-4">
        <button onClick={() => { initialConfigsRef.current = {...configs}; setShowSettings(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"><Settings2 size={16} /> CUSTOMIZAR TEMPOS</button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center gap-4">
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" /></button>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nível de foco</h3>
            </div>
            <div className="p-6 space-y-2 max-h-[70vh] overflow-y-auto">
              {(Object.entries(PRESETS_DATA) as [Exclude<PomodoroPreset, 'custom'>, any][]).map(([key, data]) => (
                <label key={key} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${activePreset === key ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200' : 'hover:bg-slate-50 border-transparent'}`}>
                  <input type="radio" checked={activePreset === key} onChange={() => selectPreset(key)} className="sr-only" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${activePreset === key ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>{activePreset === key && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                  <div className="flex-1 text-slate-800 dark:text-white"><div className="font-bold">{data.label}</div><div className="text-xs text-slate-500">{data.work} min • {data.short} min</div></div>
                </label>
              ))}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50"><button onClick={handleSaveSettings} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl">SALVAR ALTERAÇÕES</button></div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-200 text-center p-10 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Award size={48} /></div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase mb-8">Sessão Encerrada!</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-500/5 p-6 rounded-3xl"><div className="text-4xl font-black text-blue-600">{totalFocusMinutes}</div><div className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Min de Foco</div></div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl"><div className="text-4xl font-black text-slate-900 dark:text-white">{stats.work}</div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ciclos</div></div>
            </div>
            <button onClick={() => setShowSummary(false)} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl mb-3">CONTINUAR</button>
            <button onClick={resetAllStats} className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest">REINICIAR ESTATÍSTICAS</button>
          </div>
        </div>
      )}

      <div className="flex p-1 bg-white dark:bg-slate-800 rounded-2xl mb-10 w-full shadow-lg border border-slate-200 transition-colors">
        {(Object.keys(presets) as Mode[]).map((m) => (
          <button key={m} onClick={() => switchMode(m)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === m ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>{presets[m].label}</button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-full mb-12">
        <div className={`relative p-12 md:p-16 rounded-full border-4 border-slate-200 dark:border-slate-800 transition-colors duration-500 ${presets[mode].bg} shadow-xl`}>
          <div className={`text-9xl font-mono font-bold tracking-tighter tabular-nums ${presets[mode].color} transition-colors`}>{formatTime(timeLeft)}</div>
          <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-200 flex items-center gap-2 shadow-2xl ${presets[mode].color}`}>
            {React.createElement(presets[mode].icon, { size: 18 })}<span className="uppercase tracking-widest text-xs font-bold">{presets[mode].label}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-center mb-16">
        <button onClick={() => { if(!isRunning) stopAudio?.(); setIsRunning(!isRunning); }} className={`flex items-center gap-3 px-12 py-5 rounded-3xl font-bold text-xl transition-all shadow-2xl ${isRunning ? 'bg-white dark:bg-slate-800 text-amber-600 border border-amber-500/30' : 'bg-blue-600 text-white'}`}>
          {isRunning ? <><Pause size={28} fill="currentColor" /> PAUSAR</> : <><Play size={28} fill="currentColor" className="ml-1" /> INICIAR</>}
        </button>
        <button onClick={handleEndSession} className="px-8 py-5 rounded-3xl bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors border border-slate-200 font-bold text-xs">ENCERRAR</button>
      </div>
    </div>
  );
};
