import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const VaporwaveCursor = ({ mousePosition, cursorXSpring, cursorYSpring, isPointer }: any) => {
  const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
      mousePosRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    let animationFrameId: number;
    
    const updateTrail = () => {
      setTrail(prev => {
        const currentPos = mousePosRef.current;
        const lastPos = prev[0];
        const dx = lastPos ? currentPos.x - lastPos.x : 100;
        const dy = lastPos ? currentPos.y - lastPos.y : 100;
        
        if (Math.sqrt(dx * dx + dy * dy) > 2) {
           return [{x: currentPos.x, y: currentPos.y, id: Math.random()}, ...prev].slice(0, 12);
        }
        return prev;
      });
      animationFrameId = requestAnimationFrame(updateTrail);
    };
    
    animationFrameId = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <>
      {trail.map((pos, index) => (
        <div 
          key={pos.id}
          className="fixed pointer-events-none z-[9998] rounded-full bg-fuchsia-500 blur-md"
          style={{ 
            left: pos.x, 
            top: pos.y,
            width: 32 - index * 2,
            height: 32 - index * 2,
            opacity: (0.4 - index * 0.03),
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.2s ease-out'
          }}
        />
      ))}
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
};

const PixelCursor = ({ mousePosition }: any) => (
  <div 
    className="fixed pointer-events-none z-[9999]"
    style={{ 
      left: mousePosition.x, 
      top: mousePosition.y,
      transform: 'translate(-50%, -50%)'
    }}
  >
    <div className="relative">
        <div className="w-4 h-4 flex items-center justify-center">
            <div className="absolute w-4 h-1 bg-blue-400" />
            <div className="absolute w-1 h-4 bg-blue-400" />
        </div>
    </div>
  </div>
);

const MinimalCursor = ({ cursorXSpring, cursorYSpring, isPointer }: any) => (
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

const CustomCursor: React.FC = () => {
  const { currentTheme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  
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
      
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };

    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (currentTheme.cursor.type !== 'default') {
      const style = document.createElement('style');
      style.innerHTML = `* { cursor: none !important; }`;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [currentTheme.cursor.type]);

  if (currentTheme.cursor.type === 'default') return null;

  if (currentTheme.cursor.type === 'pixel') {
    return <PixelCursor mousePosition={mousePosition} />;
  }

  if (currentTheme.cursor.type === 'vaporwave') {
    return <VaporwaveCursor mousePosition={mousePosition} cursorXSpring={cursorXSpring} cursorYSpring={cursorYSpring} isPointer={isPointer} />;
  }

  if (currentTheme.cursor.type === 'minimal') {
    return <MinimalCursor cursorXSpring={cursorXSpring} cursorYSpring={cursorYSpring} isPointer={isPointer} />;
  }

  return null;
};

export default CustomCursor;
