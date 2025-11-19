
import React from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { WindowState, AppId } from '../types';
import { APPS } from '../constants';

interface WindowProps {
  state: WindowState;
  isMobile: boolean;
  parentRef: React.RefObject<HTMLDivElement>;
  onClose: (id: AppId) => void;
  onFocus: (id: AppId) => void;
  onMinimize: (id: AppId) => void;
  onMaximize: (id: AppId) => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ 
  state, isMobile, parentRef, onClose, onFocus, onMinimize, onMaximize, children 
}) => {
  const config = APPS.find(a => a.id === state.id);
  
  if (!config) return null;

  // On mobile, always maximized
  const isMaximized = state.isMaximized || isMobile;

  const variants = {
    initial: { scale: 0.9, opacity: 0, x: 0, y: 20 },
    animate: { 
      scale: 1, 
      opacity: 1,
      // If maximized, force 0 position to ensure it snaps to top-left
      x: isMaximized ? 0 : undefined,
      y: isMaximized ? 0 : undefined,
      transition: { type: 'spring' as const, damping: 25, stiffness: 300 }
    },
    exit: { scale: 0.9, opacity: 0 }
  };

  return (
    <motion.div
      drag={!isMaximized}
      dragConstraints={parentRef}
      dragMomentum={false}
      dragElastic={0.1}
      initial="initial"
      animate={state.isMinimized ? { opacity: 0, scale: 0, y: 200 } : "animate"}
      exit="exit"
      variants={variants}
      onMouseDown={() => onFocus(state.id)}
      style={{
        zIndex: state.zIndex,
        position: 'absolute',
        width: isMaximized ? '100%' : config.defaultSize.w,
        height: isMaximized ? '100%' : config.defaultSize.h,
        // When maximized, we override top/left to 0 to snap
        top: isMaximized ? 0 : state.position.y,
        left: isMaximized ? 0 : state.position.x,
        // Ensure touch actions work on mobile
        touchAction: 'none',
      }}
      className={`
        flex flex-col 
        bg-os-panel backdrop-blur-xl border border-os-border 
        shadow-2xl rounded-lg overflow-hidden
        ${isMaximized ? 'rounded-none !border-0' : ''}
        transition-shadow duration-200
        ${state.zIndex === 50 && !isMaximized ? 'ring-1 ring-os-cyan/30 shadow-[0_0_30px_rgba(34,211,238,0.15)]' : ''}
      `}
    >
      {/* Window Header */}
      <div 
        className={`
          h-12 md:h-10 bg-white/5 border-b border-white/5 flex items-center justify-between px-4 md:px-3 
          ${!isMaximized ? 'cursor-grab active:cursor-grabbing' : ''} 
          select-none
        `}
        onDoubleClick={() => !isMobile && onMaximize(state.id)}
      >
        <div className="flex items-center gap-4 md:gap-3">
           <div className="flex gap-2 group">
             {/* Close Button */}
             <button 
                onClick={(e) => { e.stopPropagation(); onClose(state.id); }} 
                className="w-3 h-3 md:w-3 md:h-3 rounded-full bg-os-red hover:brightness-110 flex items-center justify-center text-black/0 hover:text-black/50 transition-all"
             >
               <X size={8} />
             </button>
             
             {/* Minimize/Maximize - Hidden on Mobile */}
             {!isMobile && (
               <>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onMinimize(state.id); }} 
                    className="w-3 h-3 rounded-full bg-os-yellow hover:brightness-110 flex items-center justify-center text-black/0 hover:text-black/50 transition-all"
                 >
                   <Minus size={8} />
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onMaximize(state.id); }} 
                    className="w-3 h-3 rounded-full bg-green-500 hover:brightness-110 flex items-center justify-center text-black/0 hover:text-black/50 transition-all"
                 >
                   {isMaximized ? <Minimize2 size={8} /> : <Maximize2 size={8} />}
                 </button>
               </>
             )}
           </div>
           <span className="text-sm md:text-xs font-mono text-gray-400 flex items-center gap-2">
             <config.icon size={14} className="md:w-3 md:h-3" />
             {config.title}
           </span>
        </div>
        
        {/* Mobile Header Actions */}
        {isMobile && (
          <button onClick={() => onClose(state.id)} className="text-xs font-mono text-gray-500 border border-white/10 px-2 py-1 rounded">
            CLOSE
          </button>
        )}
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden relative bg-black/40 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

export default Window;
