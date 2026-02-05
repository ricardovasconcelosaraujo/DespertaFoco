
import React, { useState, useEffect, useRef } from 'react';
import { View, Alarm, SOUNDS, SoundKey } from './types';
import { AlarmView } from './AlarmView';
import { StopwatchView } from './StopwatchView';
import { TimerView } from './TimerView';
import { PomodoroView } from './PomodoroView';
import { DashboardView } from './DashboardView';
import { AlarmClock, Timer, Hourglass, X, BellRing, Moon, Sun, Volume2, Brain, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'light';
  });
  
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem('alarms');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [ringingAlarmId, setRingingAlarmId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);
  const autoStopTimeoutRef = useRef<number | null>(null);

  // Lógica de SEO e Títulos Dinâmicos com a nova marca DespertaFoco
  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    let viewTitle = '';

    switch (currentView) {
      case 'dashboard':
        viewTitle = 'DespertaFoco | Alarme Online, Despertador e Pomodoro';
        metaDescription?.setAttribute('content', 'DespertaFoco: Sua ferramenta definitiva de gestão de tempo. Alarme online, despertador personalizado e Pomodoro para foco total.');
        break;
      case 'alarms':
        viewTitle = 'Alarme Online / Despertador Online | DespertaFoco';
        metaDescription?.setAttribute('content', 'Configure seu alarme online ou despertador personalizado com diversos sons e função soneca no DespertaFoco.');
        break;
      case 'pomodoro':
        viewTitle = 'Pomodoro / Despertador para Estudar | DespertaFoco';
        metaDescription?.setAttribute('content', 'Aumente sua produtividade com o cronômetro pomodoro ideal para estudar e trabalhar com foco no DespertaFoco.');
        break;
      case 'temporizador':
        viewTitle = 'Temporizador Online / Timer Regressivo | DespertaFoco';
        metaDescription?.setAttribute('content', 'Contagem regressiva online simples e eficaz para suas atividades diárias no DespertaFoco.');
        break;
      case 'stopwatch':
        viewTitle = 'Cronômetro Online de Precisão | DespertaFoco';
        metaDescription?.setAttribute('content', 'Cronômetro online gratuito com marcação de voltas e alta precisão no DespertaFoco.');
        break;
    }

    // Coleta todos os horários de alarmes ativos para mostrar na aba (Ex: 07:00 ~ 08:00)
    const activeAlarmsTimes = alarms
      .filter(a => a.active)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(a => a.time);
    
    if (activeAlarmsTimes.length > 0) {
      const alarmsString = activeAlarmsTimes.join(' ~ ');
      document.title = `(${alarmsString}) ${viewTitle}`;
    } else {
      document.title = viewTitle;
    }
  }, [currentView, alarms]);

  useEffect(() => {
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentTimestamp = now.getTime();

      alarms.forEach(alarm => {
        if (!alarm.active) return;
        const isTimeMatch = alarm.time === currentTime && now.getSeconds() === 0;
        const isSnoozeMatch = alarm.snoozedUntil && 
          Math.floor(alarm.snoozedUntil / 1000) === Math.floor(currentTimestamp / 1000);

        if ((isTimeMatch || isSnoozeMatch) && ringingAlarmId !== alarm.id) {
          triggerAlarm(alarm);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, ringingAlarmId]);

  const triggerAlarm = (alarm: Alarm) => {
    setRingingAlarmId(alarm.id);
    playAudio(alarm.sound, true);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Alarme!", { body: alarm.label || "Seu alarme está tocando!" });
    }
  };

  const playAudio = (soundKey: string, loop: boolean = false) => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const sound = SOUNDS[soundKey as keyof typeof SOUNDS];
    if (sound) {
      audioRef.current = new Audio(sound.url);
      audioRef.current.loop = loop;
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  };

  const stopAudio = () => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const previewSound = (soundKey: string) => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    playAudio(soundKey, false);
    previewTimeoutRef.current = window.setTimeout(() => {
      stopAudio();
    }, 3000);
  };

  const stopAlarm = () => {
    stopAudio();
    if (ringingAlarmId) {
      updateAlarm(ringingAlarmId, { active: false, snoozedUntil: null });
    }
    setRingingAlarmId(null);
  };

  const snoozeAlarm = (minutes: number) => {
    stopAudio();
    if (ringingAlarmId) {
      const now = new Date();
      const newTimeDate = new Date(now.getTime() + (minutes * 60 * 1000));
      const newTimeStr = `${String(newTimeDate.getHours()).padStart(2, '0')}:${String(newTimeDate.getMinutes()).padStart(2, '0')}`;
      updateAlarm(ringingAlarmId, { 
        time: newTimeStr,
        active: true,
        activationTime: now.getTime(),
        snoozedUntil: null 
      });
    }
    setRingingAlarmId(null);
  };

  const addAlarm = () => {
    const now = new Date();
    const suggested = new Date(now.getTime() + 60 * 60 * 1000);
    const suggestedTime = `${String(suggested.getHours()).padStart(2, '0')}:${String(suggested.getMinutes()).padStart(2, '0')}`;
    
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: suggestedTime,
      label: '',
      sound: 'classic_soft',
      active: false,
      snoozedUntil: null
    };
    setAlarms([...alarms, newAlarm]);
  };

  const updateAlarm = (id: string, updates: Partial<Alarm>) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'alarms':
        return <AlarmView alarms={alarms} addAlarm={addAlarm} updateAlarm={updateAlarm} deleteAlarm={deleteAlarm} previewSound={previewSound} />;
      case 'stopwatch':
        return <StopwatchView />;
      case 'temporizador':
        return <TimerView playAudio={playAudio} stopAudio={stopAudio} previewSound={previewSound} />;
      case 'pomodoro':
        return <PomodoroView 
          onFinished={(sound) => {
            playAudio(sound, false);
            autoStopTimeoutRef.current = window.setTimeout(() => {
              stopAudio();
            }, 3000);
          }} 
          stopAudio={stopAudio}
          previewSound={previewSound} 
        />;
    }
  };

  const ringingAlarm = alarms.find(a => a.id === ringingAlarmId);

  const ThemeToggle = () => (
    <button 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
      className="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
      title={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <span className="font-bold tracking-tight">DespertaFoco</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation Sidebar */}
      <nav className="fixed bottom-0 w-full md:w-24 md:static md:h-screen bg-white dark:bg-slate-800/80 backdrop-blur-md border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 z-40 flex md:flex-col items-center justify-around md:justify-start md:pt-8 md:gap-8">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
          { id: 'alarms', icon: AlarmClock, label: 'Alarmes / Despertador' },
          { id: 'pomodoro', icon: Brain, label: 'Pomodoro' },
          { id: 'temporizador', icon: Hourglass, label: 'Temporizador' },
          { id: 'stopwatch', icon: Timer, label: 'Cronômetro' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1 p-3 md:w-full transition-all duration-300 relative group
              ${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            <item.icon size={24} className={`transition-transform duration-300 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-[10px] md:text-xs font-medium text-center">{item.label}</span>
            {currentView === item.id && (
              <span className="absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:w-1 md:h-8 bottom-0 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full md:rounded-r-full md:rounded-bl-none" />
            )}
          </button>
        ))}
        <div className="hidden md:flex flex-1 flex-col justify-end pb-8 gap-4 w-full items-center">
            <ThemeToggle />
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8 lg:p-12 pb-24 md:pb-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {renderContent()}
      </main>
      {ringingAlarmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <BellRing size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">{ringingAlarm?.time}</h2>
            <p className="text-slate-400 mb-8 text-lg">{ringingAlarm?.label || 'Alarme disparado!'}</p>
            <button onClick={stopAlarm} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl mb-4 text-lg transition-colors shadow-lg shadow-red-500/20">PARAR</button>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15, 30, 60].map(min => (
                <button key={min} onClick={() => snoozeAlarm(min)} className="py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors">+ {min} min</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
