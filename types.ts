
export type View = 'dashboard' | 'alarms' | 'stopwatch' | 'temporizador' | 'pomodoro';

export interface Alarm {
  id: string;
  time: string; // Format "HH:mm"
  label: string;
  sound: string;
  active: boolean;
  snoozedUntil?: number | null; // Timestamp
  activationTime?: number; // Timestamp when alarm was activated
}

export type PomodoroPreset = 'micro' | 'classic' | 'medium' | 'doubled' | 'custom';

export interface PomodoroStats {
  work: number;
  shortBreak: number;
  longBreak: number;
}

export type SoundKey = 'forest' | 'crystal' | 'dawn' | 'piano' | 'summer_wind' | 'zen' | 'classic_soft' | 'timer_beep' | 'timer_bell' | 'timer_alert' | 'timer_whistle';

export interface SoundOption {
  key: SoundKey;
  label: string;
  url: string;
}

export const SOUNDS: Record<SoundKey, SoundOption> = {
  forest: { key: 'forest', label: '🌲 Pássaros na Floresta', url: 'https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3' },
  crystal: { key: 'crystal', label: '💎 Sino de Cristal', url: 'https://assets.mixkit.co/active_storage/sfx/1004/1004-preview.mp3' },
  dawn: { key: 'dawn', label: '🌅 Amanhecer Dourado', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  piano: { key: 'piano', label: '🎹 Piano Sereno', url: 'https://assets.mixkit.co/active_storage/sfx/936/936-preview.mp3' },
  summer_wind: { key: 'summer_wind', label: '🌬️ Vento de Verão', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3' },
  zen: { key: 'zen', label: '🧘 Jardim Zen', url: 'https://assets.mixkit.co/active_storage/sfx/2653/2653-preview.mp3' },
  classic_soft: { key: 'classic_soft', label: '⏰ Beep Suave', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  // Novos sons para o Timer
  timer_beep: { key: 'timer_beep', label: '📟 Bipe Digital', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  timer_bell: { key: 'timer_bell', label: '🔔 Sino de Escola', url: 'https://assets.mixkit.co/active_storage/sfx/1085/1085-preview.mp3' },
  timer_alert: { key: 'timer_alert', label: '🚨 Alerta Urgente', url: 'https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3' },
  timer_whistle: { key: 'timer_whistle', label: '🏁 Apito', url: 'https://assets.mixkit.co/active_storage/sfx/1013/1013-preview.mp3' },
};
