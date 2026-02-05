
import React, { useState, useEffect, useRef } from 'react';
import { View, Alarm, SOUNDS } from './types';
import { AlarmView } from './AlarmView';
import { StopwatchView } from './StopwatchView';
import { TimerView } from './TimerView';
import { PomodoroView } from './PomodoroView';
import { DashboardView } from './DashboardView';
import { AlarmClock, Timer, Hourglass, BellRing, Moon, Sun, Brain, LayoutDashboard, X } from 'lucide-react';

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

  useEffect(() => {
    let viewTitle = '';
    switch (currentView) {
      case 'dashboard': viewTitle = 'Início'; break;
      case 'alarms': viewTitle = 'Alarmes'; break;
      case 'pomodoro': viewTitle = 'Pomodoro'; break;
      case 'temporizador': viewTitle = 'Timer'; break;
      case 'stopwatch': viewTitle = 'Cronômetro'; break;
    }

    const activeAlarmsTimes = alarms
      .filter(a => a.active)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(a => a.time);
    
    if (activeAlarmsTimes.length > 0) {
      const alarmsString = activeAlarmsTimes.join(' ~ ');
      document.title = `(${alarmsString}) ${viewTitle} | DespertaFoco`;
    } else {
      document.title = `${viewTitle} | DespertaFoco`;
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
      
      alarms.forEach(alarm => {
        if (!alarm.active) return;
        if (alarm.time === currentTime && now.getSeconds() === 0 && ringingAlarmId !== alarm.id) {
          setRingingAlarmId(alarm.id);
          playAudio(alarm.sound, true);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [alarms, ringingAlarmId]);

  const playAudio = (soundKey: string, loop: boolean = false) => {
    stopAudio();
    const sound = SOUNDS[soundKey as keyof typeof SOUNDS];
    if (sound) {
      audioRef.current = new Audio(sound.url);
      audioRef.current.loop = loop;
      audioRef.current.play().catch(e => console.error("Erro áudio", e));
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const previewSound = (soundKey: string) => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    playAudio(soundKey, false);
    previewTimeoutRef.current = window.setTimeout(() => stopAudio(), 3000);
  };

  const stopAlarm = () => {
    stopAudio();
    if (ringingAlarmId) {
      setAlarms(prev => prev.map(a => a.id === ringingAlarmId ? { ...a, active: false } : a));
    }
    setRingingAlarmId(null);
  };

  const addAlarm = () => {
    const now = new Date();
    const suggested = new Date(now.getTime() + 60 * 60 * 1000);
    const suggestedTime = `${String(suggested.getHours()).padStart(2, '0')}:${String(suggested.getMinutes()).padStart(2, '0')}`;
    const newAlarm: Alarm = { id: Date.now().toString(), time: suggestedTime, label: '', sound: 'classic_soft', active: false };
    setAlarms([...alarms, newAlarm]);
  };

  const updateAlarm = (id: string, updates: Partial<Alarm>) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
    { id: 'alarms', icon: AlarmClock, label: 'Alarmes' },
    { id: 'pomodoro', icon: Brain, label: 'Pomodoro' },
    { id: 'temporizador', icon: Hourglass, label: 'Timer' },
    { id: 'stopwatch', icon: Timer, label: 'Cronômetro' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white"><LayoutDashboard size={20} /></div>
          <span className="font-bold tracking-tight">DespertaFoco</span>
        </div>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <nav className="fixed bottom-0 w-full md:w-24 md:static md:h-screen bg-white dark:bg-slate-800 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 z-40 flex md:flex-col items-center justify-around md:justify-center gap-4 p-2">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setCurrentView(item.id as View)} className={`p-3 rounded-2xl transition-all ${currentView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
            <item.icon size={24} />
          </button>
        ))}
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="hidden md:flex p-3 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 mt-auto mb-8">
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-12 pb-24 md:pb-12 max-w-6xl mx-auto w-full overflow-y-auto">
        {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} />}
        {currentView === 'alarms' && <AlarmView alarms={alarms} addAlarm={addAlarm} updateAlarm={updateAlarm} deleteAlarm={deleteAlarm} previewSound={previewSound} />}
        {currentView === 'stopwatch' && <StopwatchView />}
        {currentView === 'temporizador' && <TimerView playAudio={playAudio} stopAudio={stopAudio} previewSound={previewSound} />}
        {currentView === 'pomodoro' && <PomodoroView onFinished={(sound) => playAudio(sound, false)} stopAudio={stopAudio} previewSound={previewSound} />}
      </main>

      {ringingAlarmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-lg p-6">
          <div className="bg-slate-800 p-10 rounded-[40px] shadow-2xl border border-slate-700 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <BellRing size={40} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase mb-2">ALARME!</h2>
            <p className="text-slate-400 mb-10">{alarms.find(a => a.id === ringingAlarmId)?.label || 'Hora de acordar'}</p>
            <button onClick={stopAlarm} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3">
              <X size={24} /> DESLIGAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
