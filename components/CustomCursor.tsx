import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const { currentTheme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  
  // Smooth mouse movement for some cursors
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // Check if hovering over clickable element
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };

    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  // Force hide default cursor globally when custom cursor is active
  useEffect(() => {
    if (currentTheme.cursor.type !== 'default') {
      const style = document.createElement('style');
      style.innerHTML = `
        * { cursor: none !important; }
        /* Restore cursor for specific elements if needed, but for now hide all */
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [currentTheme.cursor.type]);

  if (currentTheme.cursor.type === 'default') return null;

  // Pixel Cursor (Pixel Night Sky)
  if (currentTheme.cursor.type === 'pixel') {
    return (
      <div 
        className="fixed pointer-events-none z-[9999]"
        style={{ 
          left: mousePosition.x, 
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="relative">
            {/* Pixel Crosshair */}
            <div className="w-4 h-4 flex items-center justify-center">
                <div className="absolute w-4 h-1 bg-blue-400" />
                <div className="absolute w-1 h-4 bg-blue-400" />
            </div>
        </div>
      </div>
    );
  }

  // Droplet/Vaporwave Cursor (Vaporwave) - Pink Blob with Ghost Trail
  if (currentTheme.cursor.type === 'vaporwave') {
    // Trail state
    const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
    
    useEffect(() => {
      let animationFrameId: number;
      
      const updateTrail = () => {
        setTrail(prev => {
          // Only add point if moved significantly to avoid stacking
          const lastPos = prev[0];
          const dx = lastPos ? mousePosition.x - lastPos.x : 100;
          const dy = lastPos ? mousePosition.y - lastPos.y : 100;
          
          if (Math.sqrt(dx * dx + dy * dy) > 2) {
             return [{x: mousePosition.x, y: mousePosition.y, id: Math.random()}, ...prev].slice(0, 12);
          }
          return prev;
        });
        animationFrameId = requestAnimationFrame(updateTrail);
      };
      
      animationFrameId = requestAnimationFrame(updateTrail);
      return () => cancelAnimationFrame(animationFrameId);
    }, [mousePosition]);

    return (
      <>
        {/* Ghost Trail / Aura */}
        {trail.map((pos, index) => (
          <div 
            key={pos.id}
            className="fixed pointer-events-none z-[9998] rounded-full bg-fuchsia-500 blur-md"
            style={{ 
              left: pos.x, 
              top: pos.y,
              width: 32 - index * 2, // Start larger
              height: 32 - index * 2,
              opacity: (0.4 - index * 0.03), // Lower opacity for "aura" feel
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.2s ease-out' // Smooth fade
            }}
          />
        ))}
        
        {/* Main Blob Cursor */}
        <motion.div 
          className="fixed pointer-events-none z-[9999] mix-blend-screen"
          style={{ 
            left: cursorXSpring, 
            top: cursorYSpring,
            x: '-50%',
            y: '-50%'
          }}
        >
          <div 
              className={`rounded-full bg-fuchsia-300 shadow-[0_0_20px_#d946ef] transition-all duration-200 ${isPointer ? 'w-6 h-6 opacity-90' : 'w-4 h-4 opacity-100'}`}
          />
        </motion.div>
      </>
    );
  }

  // Minimal Cursor (Zen Mono)
  if (currentTheme.cursor.type === 'minimal') {
    return (
      <motion.div 
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{ 
          left: cursorXSpring, 
          top: cursorYSpring,
          x: '-50%',
          y: '-50%'
        }}
      >
        <div 
            className={`rounded-full border border-white transition-all duration-200 ${isPointer ? 'w-8 h-8 bg-white/20' : 'w-3 h-3 bg-white'}`}
        />
      </motion.div>
    );
  }

  return null;
};

export default CustomCursor;
