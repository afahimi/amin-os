
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThinkingNebula from './ThinkingNebula';
import Window from './Window';
import Taskbar from './Taskbar';
import CommandPalette from './CommandPalette';
import { AppId, WindowState, Notification, Achievement } from '../types';
import { AppContent } from './AppContents';
import { INITIAL_ACHIEVEMENTS } from '../constants';
import { CheckCircle } from 'lucide-react';
import { INITIAL_FS, FileSystemNode } from '../utils/filesystem';

const Desktop: React.FC = () => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeId, setActiveId] = useState<AppId | null>(null);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Achievement System
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // File System State (Lifted)
  const [fileSystem, setFileSystem] = useState<FileSystemNode>(INITIAL_FS);

  // Load Achievements from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('aminos_achievements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved with initial to ensure new achievements are added
        const merged = INITIAL_ACHIEVEMENTS.map(init => {
           const found = parsed.find((p: Achievement) => p.id === init.id);
           return found ? found : init;
        });
        setAchievements(merged);
      } catch (e) {
        console.error("Failed to load achievements", e);
      }
    }
  }, []);

  // Unlock Achievement Handler
  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const exists = prev.find(a => a.id === id);
      if (exists && !exists.unlocked) {
        const updated = prev.map(a => a.id === id ? { ...a, unlocked: true, date: new Date().toLocaleDateString() } : a);
        localStorage.setItem('aminos_achievements', JSON.stringify(updated));
        addNotification({
          id: Date.now().toString(),
          title: 'Achievement Unlocked!',
          message: exists.title,
          type: 'achievement'
        });
        return updated;
      }
      return prev;
    });
  };

  // Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 4000);
  };

  // Focus Management
  const focusWindow = (id: AppId) => {
    setActiveId(id);
    setWindows(prev => prev.map(w => ({
      ...w,
      zIndex: w.id === id ? 50 : (w.zIndex > 1 ? w.zIndex - 1 : 1)
    })));
  };

  const openApp = (id: AppId) => {
    const existing = windows.find(w => w.id === id);
    
    // Check for 'Explorer' achievement
    if (windows.length >= 4) {
        unlockAchievement('explorer');
    }

    if (existing) {
      if (existing.isMinimized) {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false } : w));
      }
      focusWindow(id);
    } else {
      // Add new window with random slight offset
      const offset = isMobile ? 0 : windows.length * 20;
      const newWindow: WindowState = {
        id,
        isOpen: true,
        isMinimized: false,
        isMaximized: isMobile, // Default max on mobile
        zIndex: 50,
        position: { x: isMobile ? 0 : 100 + offset, y: isMobile ? 0 : 50 + offset }
      };
      setWindows(prev => [...prev.map(w => ({...w, zIndex: 1})), newWindow]); // Demote others
      setActiveId(id);
    }
  };

  const closeWindow = (id: AppId) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const toggleMaximize = (id: AppId) => {
    if (isMobile) return; // Disable manual toggle on mobile
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  };

  const toggleMinimize = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
    if (activeId === id) setActiveId(null);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // On boot achievement
  useEffect(() => {
    setTimeout(() => unlockAchievement('hello_world'), 2000);
  }, []);

  return (
    <div 
      ref={desktopRef} 
      className="relative w-full h-screen overflow-hidden text-white select-none bg-[#050608]"
    >
      {/* 3D Background - lighter on mobile? */}
      <ThinkingNebula />

      {/* Background Overlay UI */}
      <div className={`absolute top-8 right-8 text-right pointer-events-none z-0 opacity-50 ${isMobile ? 'hidden' : 'block'}`}>
         <h1 className="font-display font-bold text-4xl tracking-tighter">AMIN.OS</h1>
         <div className="font-mono text-os-cyan">SYSTEM_STATUS: NORMAL</div>
         <div className="font-mono text-xs text-gray-500">MEMORY_USAGE: 128TB</div>
      </div>

      {/* Notification Toast Container */}
      <div className="absolute top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-os-panel border border-os-cyan/30 p-4 rounded shadow-lg backdrop-blur-md w-72 flex items-start gap-3 pointer-events-auto"
            >
              {n.type === 'achievement' && <CheckCircle className="text-os-yellow shrink-0" size={20} />}
              <div>
                <div className="text-sm font-bold text-os-cyan">{n.title}</div>
                <div className="text-xs text-gray-300">{n.message}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Windows Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {windows.map(win => (
            <div key={win.id} className="pointer-events-auto">
              <Window
                state={win}
                isMobile={isMobile}
                parentRef={desktopRef}
                onClose={closeWindow}
                onFocus={focusWindow}
                onMaximize={toggleMaximize}
                onMinimize={toggleMinimize}
              >
                <AppContent 
                    appId={win.id} 
                    unlockAchievement={unlockAchievement} 
                    achievements={achievements}
                    fileSystem={fileSystem}
                    setFileSystem={setFileSystem}
                />
              </Window>
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global UI */}
      <Taskbar 
        openWindows={windows} 
        activeId={activeId} 
        onOpen={openApp} 
      />

      <CommandPalette 
        isOpen={cmdPaletteOpen} 
        onClose={() => setCmdPaletteOpen(false)}
        onLaunch={openApp}
      />
    </div>
  );
};

export default Desktop;
