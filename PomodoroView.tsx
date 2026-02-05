
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Coffee, Brain, Armchair, Settings2, Volume2, ArrowLeft, BarChart3, CheckCircle2, Repeat, ChevronRight, ChevronLeft, Award, Clock3, ClipboardList, BellRing } from 'lucide-react';
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
  const [activePreset, setActivePreset] = useState<PomodoroPreset>(() => {
    return (localStorage.getItem('pomodoro_active_preset') as PomodoroPreset) || 'classic';
  });

  const [configs, setConfigs] = useState(() => {
    const saved = localStorage.getItem('pomodoro_configs');
    return saved ? JSON.parse(saved) : {
      work: 25,
      shortBreak: 5,
      longBreak: 15,
      longBreakInterval: 4,
      sound: 'dawn' as SoundKey // Alterado de 'forest' para 'dawn' (Amanhecer Dourado)
    };
  });

  const [stats, setStats] = useState<PomodoroStats>(() => {
    const saved = localStorage.getItem('pomodoro_stats');
    return saved ? JSON.parse(saved) : { work: 0, shortBreak: 0, longBreak: 0 };
  });

  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(configs.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false); 
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  const initialConfigsRef = useRef(configs);

  const presets = {
    work: { label: 'Foco Total', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', icon: Brain },
    shortBreak: { label: 'Pausa Curta', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10', icon: Coffee },
    longBreak: { label: 'Pausa Longa', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', icon: Armchair },
  };

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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isRunning && !isFinishing) {
      const currentModeTime = mode === 'work' ? configs.work : mode === 'shortBreak' ? configs.shortBreak : configs.longBreak;
      setTimeLeft(currentModeTime * 60);
    }
  }, [configs, mode, isFinishing]);

  const handleCycleFinished = () => {
    setIsRunning(false);
    setIsFinishing(true); 
    onFinished?.(configs.sound);

    setStats(prev => ({
      ...prev,
      work: mode === 'work' ? prev.work + 1 : prev.work,
      shortBreak: mode === 'shortBreak' ? prev.shortBreak + 1 : prev.shortBreak,
      longBreak: mode === 'longBreak' ? prev.longBreak + 1 : prev.longBreak
    }));

    // Mantém a tela travada por 7 segundos enquanto o som toca
    setTimeout(() => {
      let nextMode: Mode;
      if (mode === 'work') {
        const interval = configs.longBreakInterval || 4;
        nextMode = (stats.work + 1) % interval === 0 ? 'longBreak' : 'shortBreak';
      } else {
        nextMode = 'work';
      }
      
      setIsFinishing(false);
      switchMode(nextMode);
      
      if (nextMode !== 'work') {
        setIsRunning(true);
      }
    }, 7000); 
  };

  const selectPreset = (p: PomodoroPreset) => {
    setActivePreset(p);
    if (p !== 'custom') {
      const data = PRESETS_DATA[p];
      setConfigs({
        ...configs,
        work: data.work,
        shortBreak: data.short,
        longBreak: data.long
      });
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    setIsFinishing(false);
    stopAudio?.(); 
    const newTime = newMode === 'work' ? configs.work : newMode === 'shortBreak' ? configs.shortBreak : configs.longBreak;
    setTimeLeft(newTime * 60);
  };

  const handleSaveSettings = () => {
    const hasChanged = 
      initialConfigsRef.current.work !== configs.work ||
      initialConfigsRef.current.shortBreak !== configs.shortBreak ||
      initialConfigsRef.current.longBreak !== configs.longBreak;

    if (hasChanged) {
      setIsRunning(false);
      const newTime = mode === 'work' ? configs.work : mode === 'shortBreak' ? configs.shortBreak : configs.longBreak;
      setTimeLeft(newTime * 60);
    }
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    setIsRunning(false);
    setIsFinishing(false);
    stopAudio?.();
    setShowSummary(true);
  };

  const resetAllStats = () => {
    setStats({ work: 0, shortBreak: 0, longBreak: 0 });
    setTimeLeft(configs.work * 60);
    setMode('work');
    setShowSummary(false);
    setIsFinishing(false);
  };

  const totalFocusMinutes = stats.work * configs.work;

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto animate-in fade-in duration-500 pb-12">
      
      <div className="w-full flex justify-end mb-4">
        <button 
          onClick={() => { initialConfigsRef.current = {...configs}; setShowSettings(true); }}
          disabled={isFinishing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-50"
        >
          <Settings2 size={16} />
          CUSTOMIZAR TEMPOS
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ajustes do Pomodoro</h3>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Presetações de Foco</label>
                {(Object.entries(PRESETS_DATA) as [Exclude<PomodoroPreset, 'custom'>, any][]).map(([key, data]) => (
                  <label key={key} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${activePreset === key ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent'}`}>
                    <input type="radio" name="preset" checked={activePreset === key} onChange={() => selectPreset(key)} className="sr-only" />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${activePreset === key ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                      {activePreset === key && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 dark:text-white">{data.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{data.work} min • {data.short} min • {data.long} min</div>
                    </div>
                  </label>
                ))}

                <label className={`flex flex-col gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${activePreset === 'custom' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="preset" checked={activePreset === 'custom'} onChange={() => selectPreset('custom')} className="sr-only" />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${activePreset === 'custom' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                      {activePreset === 'custom' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-white">Customizável</div>
                  </div>
                  {activePreset === 'custom' && (
                    <div className="space-y-4 pt-2 animate-in slide-in-from-top-2">
                      {[
                        { key: 'work', label: 'Pomodoro (Foco)', color: 'accent-blue-500', min: 1, max: 90 },
                        { key: 'shortBreak', label: 'Pausa Curta', color: 'accent-teal-500', min: 1, max: 30 },
                        { key: 'longBreak', label: 'Pausa Longa', color: 'accent-violet-500', min: 1, max: 60 }
                      ].map(item => (
                        <div key={item.key}>
                          <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
                            <span>{item.label}</span>
                            <span className="text-slate-900 dark:text-slate-200">{(configs as any)[item.key]} min</span>
                          </div>
                          <input 
                            type="range" 
                            min={item.min} 
                            max={item.max} 
                            value={(configs as any)[item.key]} 
                            onChange={(e) => setConfigs({...configs, [item.key]: Number(e.target.value)})} 
                            className={`w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer ${item.color}`} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-4">Configurações da Sessão</label>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-2">
                    <span>Ciclos até Pausa Longa</span>
                    <span className="text-slate-900 dark:text-slate-200">{configs.longBreakInterval} ciclos</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={configs.longBreakInterval} 
                    onChange={(e) => setConfigs({...configs, longBreakInterval: Number(e.target.value)})} 
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Após {configs.longBreakInterval} ciclos de foco, a próxima pausa será longa.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Som da Notificação</label>
                <div className="relative">
                  <select value={configs.sound} onChange={(e) => { const s = e.target.value as SoundKey; setConfigs({...configs, sound: s}); previewSound?.(s); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-colors text-sm">
                    {Object.values(SOUNDS).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                  <Volume2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
              <button onClick={handleSaveSettings} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">SALVAR ALTERAÇÕES</button>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Sessão Encerrada!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Aqui está o balanço da sua produtividade hoje:</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-500/5 p-6 rounded-3xl border border-blue-100 dark:border-blue-500/20">
                  <div className="text-4xl font-black text-blue-600 mb-1">{totalFocusMinutes}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/70 flex items-center justify-center gap-1"><Clock3 size={12}/> Minutos de Foco</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{stats.work}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-1"><Brain size={12}/> Ciclos Pomodoro</div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 mb-10 text-left">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Coffee size={14}/> Pausas Curtas:</span>
                    <span className="font-bold text-teal-600">{stats.shortBreak} ciclos</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Armchair size={14}/> Pausas Longas:</span>
                    <span className="font-bold text-violet-600">{stats.longBreak} ciclos</span>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowSummary(false)} 
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                >
                  CONTINUAR TRABALHANDO
                </button>
                <button 
                  onClick={resetAllStats} 
                  className="w-full py-4 text-slate-400 hover:text-red-500 font-bold transition-colors text-xs uppercase tracking-widest"
                >
                  REINICIAR TODAS ESTATÍSTICAS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex p-1 bg-white dark:bg-slate-800 rounded-2xl mb-10 w-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors">
        {(Object.keys(presets) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            disabled={isFinishing}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 disabled:opacity-50 ${
              mode === m 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {presets[m].label}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-full mb-12 group">
        <div className={`relative p-12 md:p-16 rounded-full border-4 border-slate-200 dark:border-slate-800 transition-colors duration-500 ${presets[mode].bg} shadow-xl backdrop-blur-sm`}>
          <div className={`text-9xl font-mono font-bold tracking-tighter tabular-nums ${isFinishing ? 'text-amber-500 animate-pulse' : presets[mode].color} drop-shadow-sm dark:drop-shadow-lg transition-colors`}>
            {isFinishing ? "00:00" : formatTime(timeLeft)}
          </div>
          <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-2xl ${isFinishing ? 'text-amber-500' : presets[mode].color} transition-colors`}>
            {isFinishing ? <BellRing size={18} className="animate-bounce" /> : React.createElement(presets[mode].icon, { size: 18 })}
            <span className="uppercase tracking-widest text-xs font-bold">{isFinishing ? 'CICLO FINALIZADO!' : presets[mode].label}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mb-16">
        <div className="flex gap-6 items-center">
          <button
            onClick={() => { if(!isRunning) stopAudio?.(); setIsRunning(!isRunning); }}
            disabled={isFinishing}
            className={`flex items-center gap-3 px-12 py-5 rounded-3xl font-bold text-xl transition-all shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${
              isRunning 
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {isRunning ? <><Pause size={28} fill="currentColor" /> PAUSAR</> : <><Play size={28} fill="currentColor" className="ml-1" /> INICIAR</>}
          </button>

          <button
            onClick={handleEndSession}
            disabled={isFinishing}
            className="px-8 py-5 rounded-3xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors border border-slate-200 dark:border-slate-700 shadow-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
            title="Encerrar e Ver Resumo"
          >
            ENCERRAR
          </button>
        </div>
        
        {isFinishing ? (
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest animate-pulse">
            O som está tocando... Aguarde a transição.
          </p>
        ) : !isRunning && mode === 'work' && (
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
            Clique em INICIAR para começar o foco
          </p>
        )}
      </div>

      <div className="w-full bg-white dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-slate-800 dark:text-white">
            <ClipboardList size={20} className="text-blue-500" />
            <h4 className="font-bold tracking-tight">Sessão Atual</h4>
          </div>
          <div className="text-[10px] font-black uppercase text-blue-500 tracking-tighter bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20">
            {totalFocusMinutes} min totais de foco
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Focos', count: stats.work, color: 'text-blue-500', icon: Brain },
            { label: 'Curtas', count: stats.shortBreak, color: 'text-teal-500', icon: Coffee },
            { label: 'Longas', count: stats.longBreak, color: 'text-violet-500', icon: Armchair }
          ].map(s => (
            <div key={s.label} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
              <div className={`${s.color} flex justify-center mb-2`}><s.icon size={20} /></div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{s.count}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
