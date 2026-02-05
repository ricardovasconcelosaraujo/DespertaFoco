
import React, { useState, useEffect } from 'react';
import { Alarm, SOUNDS, SoundKey } from './types';
import { Trash2, Plus, Volume2, Clock, Check, X, Bell, ChevronDown, ChevronUp } from 'lucide-react';

interface AlarmViewProps {
  alarms: Alarm[];
  addAlarm: () => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  previewSound: (sound: string) => void;
}

export const AlarmView: React.FC<AlarmViewProps> = ({ 
  alarms, 
  addAlarm, 
  updateAlarm, 
  deleteAlarm, 
  previewSound 
}) => {
  const [now, setNow] = useState(new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (alarms.length > 0) {
      const lastAlarm = alarms[alarms.length - 1];
      const idTimestamp = parseInt(lastAlarm.id);
      if (!Number.isNaN(idTimestamp) && Date.now() - idTimestamp < 1000 && !lastAlarm.active && expandedId !== lastAlarm.id) {
        setExpandedId(lastAlarm.id);
      }
    }
  }, [alarms.length]);

  const handleTimeChange = (id: string, currentFullTime: string, type: 'hour' | 'minute', value: string) => {
    const [h, m] = currentFullTime.split(':');
    let newTime = type === 'hour' ? `${value}:${m}` : `${h}:${value}`;
    updateAlarm(id, { time: newTime });
  };

  const handleDone = (id: string) => {
    updateAlarm(id, { active: true, activationTime: Date.now() });
    setExpandedId(null);
  };

  const handleToggleActive = (alarm: Alarm) => {
    const isActive = !alarm.active;
    updateAlarm(alarm.id, { 
      active: isActive,
      activationTime: isActive ? Date.now() : undefined 
    });
  };

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getMsUntilAlarm = (alarmTime: string): number => {
    const [h, m] = alarmTime.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime() - now.getTime();
  };

  const formatTimeUntil = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getProgressBarStyles = (msUntil: number, activationTime?: number) => {
    if (!activationTime) return { width: '100%', colorClass: 'bg-emerald-500' };
    const targetTime = now.getTime() + msUntil;
    const totalDuration = targetTime - activationTime;
    const safeTotal = Math.max(totalDuration, 1000); 
    const percentage = Math.max(0, Math.min(100, (msUntil / safeTotal) * 100));
    let colorClass = 'bg-emerald-500';
    if (percentage < 30) colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    else if (percentage < 60) colorClass = 'bg-yellow-500';
    return { width: `${percentage}%`, colorClass };
  };

  const nextAlarm = (() => {
    const active = alarms.filter(a => a.active);
    if (active.length === 0) return null;
    return active
      .map(a => ({ ...a, msUntil: getMsUntilAlarm(a.time) }))
      .sort((a, b) => a.msUntil - b.msUntil)[0];
  })();

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <header className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Hora Atual</h2>
            <div className="text-6xl md:text-7xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter drop-shadow-sm dark:drop-shadow-lg transition-colors">{formatCurrentTime(now)}</div>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 font-medium">{now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 min-w-[240px] backdrop-blur-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Próximo Alarme</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${alarms.filter(a => a.active).length > 0 ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {alarms.filter(a => a.active).length} ATIVOS
              </span>
            </div>
            {nextAlarm ? (
              <div>
                <div className="flex items-baseline gap-2 text-slate-900 dark:text-white transition-colors">
                  <span className="text-3xl font-bold">{nextAlarm.time}</span>
                  <span className="text-base text-slate-600 dark:text-slate-300 truncate max-w-[120px] font-semibold">{nextAlarm.label || 'Sem rótulo'}</span>
                </div>
                <div className="mt-2 text-sm font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Clock size={14} /> toca em {formatTimeUntil(nextAlarm.msUntil)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 text-slate-400 dark:text-slate-500 transition-colors">
                <Bell size={24} className="mb-2 opacity-50" />
                <span className="text-sm">Nenhum alarme ativo</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {alarms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 transition-colors">
           <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-4 transition-colors">
              <Bell size={32} />
           </div>
           <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Sua lista está vazia</h3>
           <p className="text-slate-500 text-sm mb-8 transition-colors">Clique no botão abaixo para criar seu primeiro alarme</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alarms.map((alarm) => {
            const msUntil = getMsUntilAlarm(alarm.time);
            const isExpanded = expandedId === alarm.id;
            const [currentHour, currentMinute] = alarm.time.split(':');
            const progressStyles = getProgressBarStyles(msUntil, alarm.activationTime);

            return (
              <div key={alarm.id} className={`bg-white dark:bg-slate-800 border rounded-2xl transition-all duration-300 overflow-hidden ${alarm.active ? 'border-blue-500/30 shadow-lg dark:shadow-blue-500/5' : 'border-slate-200 dark:border-slate-700 opacity-90'}`}>
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="cursor-pointer flex-1" onClick={() => setExpandedId(isExpanded ? null : alarm.id)}>
                      <div className="flex items-baseline gap-3">
                        <span className={`text-4xl md:text-5xl font-bold tracking-tight transition-colors ${alarm.active ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{alarm.time}</span>
                        {alarm.label && <span className="text-xl text-slate-600 dark:text-slate-300 font-bold hidden md:inline-block transition-colors">{alarm.label}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        <span className="text-[10px] uppercase tracking-widest font-bold">{isExpanded ? 'Ocultar ajustes' : 'Configurações'}</span>
                      </div>
                    </div>
                    <button onClick={() => handleToggleActive(alarm)} className={`relative w-14 h-8 rounded-full transition-all focus:outline-none ${alarm.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${alarm.active ? 'translate-x-6' : 'translate-x-0'}`}>
                        {alarm.active ? <Check size={14} className="text-blue-600" /> : <X size={14} className="text-slate-400" />}
                      </span>
                    </button>
                  </div>
                  {alarm.active && !isExpanded && (
                    <div className="mt-4 animate-in fade-in">
                      <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 transition-colors">
                        <span>Tempo restante</span>
                        <span className="text-slate-600 dark:text-slate-200 transition-colors">{formatTimeUntil(msUntil)}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden transition-colors">
                        <div className={`h-full transition-all duration-1000 ease-linear ${progressStyles.colorClass}`} style={{ width: progressStyles.width }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 md:p-6 border-t border-slate-200 dark:border-slate-700/50 animate-in slide-in-from-top-2 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Horário</label>
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <select value={currentHour} onChange={(e) => handleTimeChange(alarm.id, alarm.time, 'hour', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-colors">
                                {hours.map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                            <span className="text-slate-400 font-bold">:</span>
                            <div className="relative flex-1">
                              <select value={currentMinute} onChange={(e) => handleTimeChange(alarm.id, alarm.time, 'minute', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-colors">
                                {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Nome do Alarme</label>
                          <input type="text" value={alarm.label} onChange={(e) => updateAlarm(alarm.id, { label: e.target.value })} placeholder="Ex: Acordar, Remédio..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Som do Alarme</label>
                        <div className="relative">
                          <select 
                            value={alarm.sound} 
                            onChange={(e) => {
                              updateAlarm(alarm.id, { sound: e.target.value });
                              previewSound(e.target.value);
                            }}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-colors"
                          >
                            {Object.values(SOUNDS).map(s => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>
                          <Volume2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                        <p className="mt-2 text-[10px] text-slate-500 italic font-medium">* Reproduzindo prévia de 3s ao selecionar</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50 transition-colors">
                       <button onClick={() => deleteAlarm(alarm.id)} className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-500 px-4 py-2 rounded-lg transition-colors text-sm font-medium"><Trash2 size={16} /> Excluir</button>
                       <button onClick={() => handleDone(alarm.id)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/20 font-bold active:scale-95"><Check size={18} /> Concluir</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button 
        onClick={addAlarm} 
        className={`fixed bottom-24 right-6 md:bottom-12 md:right-12 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl dark:shadow-2xl dark:shadow-blue-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30 ${alarms.length === 0 ? 'px-8 w-auto' : 'w-16'}`}
        title="Criar novo alarme"
      >
        <Plus size={32} />
        {alarms.length === 0 && <span className="ml-3 font-bold text-lg whitespace-nowrap">Cadastrar Alarme</span>}
      </button>
    </div>
  );
};
