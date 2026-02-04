
import React, { useState, useEffect } from 'react';
import { Alarm, SOUNDS } from './types';
import { Trash2, Plus, Volume2, Clock, Check, X, Bell, ChevronDown, ChevronUp } from 'lucide-react';

interface AlarmViewProps {
  alarms: Alarm[];
  addAlarm: () => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  previewSound: (sound: string) => void;
}

export const AlarmView: React.FC<AlarmViewProps> = ({ alarms, addAlarm, updateAlarm, deleteAlarm, previewSound }) => {
  const [now, setNow] = useState(new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleActive = (alarm: Alarm) => {
    updateAlarm(alarm.id, { active: !alarm.active, activationTime: !alarm.active ? Date.now() : undefined });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <header className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="text-slate-500 text-sm uppercase mb-1">Hora Atual</div>
        <div className="text-6xl font-mono font-bold text-slate-900 dark:text-white">
          {now.toLocaleTimeString('pt-BR')}
        </div>
      </header>

      <div className="grid gap-4">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div onClick={() => setExpandedId(expandedId === alarm.id ? null : alarm.id)} className="cursor-pointer">
              <div className={`text-4xl font-bold ${alarm.active ? 'text-blue-600' : 'text-slate-400'}`}>{alarm.time}</div>
              <div className="text-sm text-slate-500">{alarm.label || 'Sem rótulo'}</div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => deleteAlarm(alarm.id)} className="text-red-400 hover:text-red-500"><Trash2 size={20}/></button>
              <button onClick={() => handleToggleActive(alarm)} className={`w-12 h-6 rounded-full relative transition-colors ${alarm.active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${alarm.active ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addAlarm} className="fixed bottom-12 right-12 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
        <Plus size={32} />
      </button>
    </div>
  );
};
