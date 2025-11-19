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

  // Droplet/Vaporwave Cursor (Vaporwave) - Let's make it a retro triangle
  if (currentTheme.id === 'vaporwave') {
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
            className={`w-6 h-6 border-2 border-fuchsia-500 rotate-45 transition-transform duration-100 ${isPointer ? 'scale-150 bg-fuchsia-500/20' : ''}`}
            style={{ boxShadow: '0 0 10px #d946ef' }}
        />
      </motion.div>
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
