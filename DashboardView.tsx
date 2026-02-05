
import React from 'react';
import { View } from './types';
import { AlarmClock, Timer, Hourglass, Brain, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: View) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const tools = [
    {
      id: 'alarms' as View,
      title: 'Alarmes / Despertador',
      description: 'Gerencie seus despertadores e rotinas matinais.',
      icon: AlarmClock,
      color: 'bg-blue-500',
      shadow: 'shadow-blue-500/20',
    },
    {
      id: 'pomodoro' as View,
      title: 'Pomodoro',
      description: 'Foco total e produtividade com pausas inteligentes.',
      icon: Brain,
      color: 'bg-indigo-500',
      shadow: 'shadow-indigo-500/20',
    },
    {
      id: 'temporizador' as View,
      title: 'Temporizador',
      description: 'Contagem regressiva para suas tarefas e atividades.',
      icon: Hourglass,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/20',
    },
    {
      id: 'stopwatch' as View,
      title: 'Cronômetro',
      description: 'Acompanhe o tempo com precisão de milissegundos.',
      icon: Timer,
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/20',
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <header className="mb-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
          Olá, bem-vindo ao <span className="text-blue-600">DespertaFoco</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          O seu tempo, sob o seu controle total.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onNavigate(tool.id)}
            className="group relative bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl transition-all hover:scale-[1.02] hover:-translate-y-1 active:scale-95 text-left overflow-hidden"
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 ${tool.color} text-white rounded-2xl shadow-lg ${tool.shadow}`}>
                  <tool.icon size={28} />
                </div>
                <div className="p-2 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors">
                   <ArrowRight size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tool.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{tool.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
