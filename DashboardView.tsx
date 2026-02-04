
import React from 'react';
import { View } from './types';
import { AlarmClock, Timer, Hourglass, Brain, ArrowRight } from 'lucide-react';

export const DashboardView: React.FC<{ onNavigate: (v: View) => void }> = ({ onNavigate }) => {
  const tools = [
    { id: 'alarms' as View, title: 'Alarmes', icon: AlarmClock, color: 'bg-blue-500' },
    { id: 'pomodoro' as View, title: 'Pomodoro', icon: Brain, color: 'bg-indigo-500' },
    { id: 'temporizador' as View, title: 'Temporizador', icon: Hourglass, color: 'bg-amber-500' },
    { id: 'stopwatch' as View, title: 'Cronômetro', icon: Timer, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Desperta<span className="text-blue-600">Foco</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map(tool => (
          <button key={tool.id} onClick={() => onNavigate(tool.id)} className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-6">
              <div className={`p-4 ${tool.color} text-white rounded-2xl`}><tool.icon size={28}/></div>
              <div className="text-left font-bold text-xl">{tool.title}</div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
