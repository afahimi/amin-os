
export type AppId = 'profile' | 'missions' | 'log' | 'labs' | 'resume' | 'contact' | 'care' | 'achievements' | 'game';

export interface AppConfig {
  id: AppId;
  title: string;
  icon: any; // Lucide icon component
  defaultSize: { w: number; h: number };
  mobileSize?: { w: string; h: string }; // CSS units
}

export interface WindowState {
  id: AppId;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
}

export interface Project {
  id: string;
  title: string;
  role: string;
  desc: string;
  stack: string[];
  impact: string;
}

export interface LogEntry {
  id: string;
  date: string;
  title: string;
  tags: string[];
  content: string;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  date?: string;
  unlocked: boolean;
}
