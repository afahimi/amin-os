import React, { useEffect, useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { APPS, PROJECTS, LOGS } from '../constants';
import { AppId } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (id: AppId) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onLaunch }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = React.useMemo(() => {
    if (!query) return APPS.map(a => ({ type: 'APP', ...a }));
    
    const searchLower = query.toLowerCase();
    const apps = APPS.filter(a => a.title.toLowerCase().includes(searchLower)).map(a => ({ type: 'APP', ...a }));
    const projects = PROJECTS.filter(p => p.title.toLowerCase().includes(searchLower)).map(p => ({ type: 'PROJECT', ...p, icon: null, id: 'missions' as AppId })); // Map to missions app
    const logs = LOGS.filter(l => l.title.toLowerCase().includes(searchLower)).map(l => ({ type: 'LOG', ...l, icon: null, id: 'log' as AppId })); // Map to log app

    return [...apps, ...projects, ...logs].slice(0, 5);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          // @ts-ignore
          onLaunch(results[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onLaunch, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-white/5">
          <Search className="text-gray-400 mr-3" size={20} />
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 font-mono text-lg"
            placeholder="Search my brain..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="text-[10px] font-mono text-gray-600 border border-white/10 px-1.5 rounded">ESC</div>
        </div>
        
        <div className="p-2">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}-${index}`}
              className={`
                w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group
                ${index === selectedIndex ? 'bg-os-cyan/10' : 'hover:bg-white/5'}
              `}
              onClick={() => {
                // @ts-ignore
                onLaunch(result.id);
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${index === selectedIndex ? 'bg-os-cyan text-black' : 'bg-white/5 text-gray-400'}`}>
                  {result.type === 'APP' && result.icon ? <result.icon size={14} /> : <CornerDownLeft size={14} />}
                </div>
                <div>
                  <div className={`text-sm font-medium ${index === selectedIndex ? 'text-os-cyan' : 'text-gray-300'}`}>{result.title}</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">{result.type}</div>
                </div>
              </div>
              {index === selectedIndex && <CornerDownLeft size={14} className="text-os-cyan" />}
            </button>
          ))}
          {results.length === 0 && (
            <div className="p-4 text-center text-gray-500 font-mono text-sm">
              No neural pathways found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;