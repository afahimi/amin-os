
import { User, Briefcase, FileText, FlaskConical, Paperclip, Mail, Heart, Trophy, Gamepad2, Terminal } from 'lucide-react';
import { AppConfig, Project, LogEntry, Achievement } from './types';

export const APPS: AppConfig[] = [
  { id: 'profile', title: 'Profile', icon: User, defaultSize: { w: 600, h: 500 } },
  { id: 'missions', title: 'Missions', icon: Briefcase, defaultSize: { w: 800, h: 600 } },
  { id: 'log', title: 'Log', icon: FileText, defaultSize: { w: 700, h: 600 } },
  { id: 'labs', title: 'Labs', icon: FlaskConical, defaultSize: { w: 700, h: 550 } },
  { id: 'resume', title: 'Resume', icon: Paperclip, defaultSize: { w: 650, h: 700 } },
  { id: 'contact', title: 'Contact', icon: Mail, defaultSize: { w: 500, h: 400 } },
  { id: 'care', title: 'Self Care', icon: Heart, defaultSize: { w: 500, h: 500 } },
  { id: 'achievements', title: 'Trophies', icon: Trophy, defaultSize: { w: 450, h: 500 } },
  { id: 'game', title: 'Snake.exe', icon: Gamepad2, defaultSize: { w: 400, h: 500 } },
  { id: 'terminal', title: 'Terminal', icon: Terminal, defaultSize: { w: 600, h: 400 } },
];

export const PROJECTS: Project[] = [
  {
    id: 'aisdom',
    title: 'Aisdom GPU Marketplace',
    role: 'Lead Engineer',
    desc: 'A decentralized marketplace for renting high-end GPU compute for ML training.',
    stack: ['Next.js', 'Go', 'Postgres', 'Docker'],
    impact: 'Scaled to 10k+ users, reduced compute costs by 40% for researchers.'
  },
  {
    id: 'swe-platform',
    title: 'Microsoft SWE',
    role: 'SDE Intern',
    desc: 'Crucial tooling for visualizing analytics across global regions.',
    stack: ['React', 'C# .NET', 'Azure Data Factory'],
    impact: 'Optimized query time by 60% using materialized views.'
  },
  {
    id: 'breathe',
    title: 'BreatheBreak Extension',
    role: 'Solo Dev',
    desc: 'Browser extension forcing developers to take mindful breathing breaks.',
    stack: ['TypeScript', 'WebExtensions API', 'Canvas'],
    impact: '500+ daily active users. Featured on Product Hunt.'
  }
];

export const LOGS: LogEntry[] = [
  {
    id: '1',
    date: '2023-10-24',
    title: 'Why I treat my brain like an OS',
    tags: ['meta', 'productivity'],
    content: "We spend so much time optimizing servers and render loops, but run our own brains on legacy spaghetti code. This site is an attempt to visualize the kernel panic that is my daily existence."
  },
  {
    id: '2',
    date: '2023-11-02',
    title: 'The joy of shaders',
    tags: ['graphics', 'learning'],
    content: "Finally wrapped my head around fragment shaders. The realization that everything is just math from -1 to 1 changed how I see UI design. Expect more glowing orbs."
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'hello_world', title: 'Hello World', desc: 'Booted AminOS for the first time.', icon: '🚀', unlocked: false },
  { id: 'gamer', title: 'Gamer', desc: 'Played a game of Snake.', icon: '🎮', unlocked: false },
  { id: 'reader', title: 'Reader', desc: 'Read a log entry.', icon: '📖', unlocked: false },
  { id: 'zen', title: 'Zen Master', desc: 'Completed a breathing session.', icon: '🧘', unlocked: false },
  { id: 'explorer', title: 'Explorer', desc: 'Opened 5 different apps.', icon: '🧭', unlocked: false },
  { id: 'system_destroyer', title: 'System Destroyer', desc: 'Tried to delete the entire OS.', icon: '💥', unlocked: false },
];
