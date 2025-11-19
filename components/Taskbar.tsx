
import React from 'react';
import { AppId, WindowState } from '../types';
import { APPS } from '../constants';
import { format } from 'date-fns';

interface TaskbarProps {
  openWindows: WindowState[];
  activeId: AppId | null;
  onOpen: (id: AppId) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ openWindows, activeId, onOpen }) => {
  const time = useTime();

  return (
    <div className="absolute bottom-4 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex justify-center px-4 md:px-0 pointer-events-none">
      <div className="
          pointer-events-auto
          h-16 md:h-16 px-4 md:px-6 
          bg-white/10 backdrop-blur-xl border border-white/10 
          rounded-2xl md:rounded-2xl
          flex items-center gap-3 md:gap-4 
          shadow-2xl
          overflow-x-auto
          max-w-full
          custom-scrollbar-hidden
      ">
        {APPS.map(app => {
          const isOpen = openWindows.find(w => w.id === app.id);
          const isActive = activeId === app.id;
          
          return (
            <button
              key={app.id}
              onClick={() => onOpen(app.id)}
              className={`
                relative group min-w-[40px] w-10 h-10 md:w-10 md:h-10 flex items-center justify-center rounded-xl transition-all duration-300
                ${isActive ? 'bg-white/10 -translate-y-1 md:-translate-y-2 scale-105 md:scale-110 shadow-lg shadow-os-cyan/20' : 'hover:bg-white/5 hover:scale-105'}
              `}
            >
              <app.icon 
                size={20} 
                className={`transition-colors ${isActive ? 'text-os-cyan' : 'text-gray-400 group-hover:text-white'}`} 
              />
              
              {/* Tooltip - Hidden on Touch */}
              <div className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {app.title}
              </div>

              {/* Active Indicator */}
              {isOpen && (
                <div className="absolute -bottom-1 md:-bottom-2 w-1 h-1 rounded-full bg-os-cyan shadow-[0_0_5px_#22d3ee]"></div>
              )}
            </button>
          );
        })}
        
        <div className="w-px h-8 bg-white/10 mx-1 md:mx-2 shrink-0"></div>
        
        <div className="text-right shrink-0 hidden md:block">
          <div className="text-xs font-bold text-white">{time.split(' ')[0]}</div>
          <div className="text-[10px] text-gray-500 font-mono">{new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  );
};

function useTime() {
  const [time, setTime] = React.useState('');
  React.useEffect(() => {
    const timer = setInterval(() => setTime(format(new Date(), 'HH:mm a')), 1000);
    setTime(format(new Date(), 'HH:mm a'));
    return () => clearInterval(timer);
  }, []);
  return time;
}

export default Taskbar;
