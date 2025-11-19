import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BootScreenProps {
  onComplete: () => void;
}

const lines = [
  "booting AminOS kernel v2.6.4...",
  "verifying file integrity...",
  "mounting /school/UBC... OK",
  "mounting /work/Microsoft... OK",
  "mounting /projects/Aisdom... OK",
  "loading modules: creativity, logic, anxiety_v2, caffeine... OK",
  "initializing graphics subsystem (Vulkan)... OK",
  "establishing neural link...",
  "DONE."
];

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [log, setLog] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let delay = 0;
    lines.forEach((line, index) => {
      delay += Math.random() * 300 + 100;
      setTimeout(() => {
        setLog(prev => [...prev, line]);
        if (index === lines.length - 1) {
          setTimeout(() => setComplete(true), 500);
        }
      }, delay);
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-green-500 font-mono p-8 z-50 flex flex-col justify-start items-start overflow-hidden">
      <div className="max-w-2xl w-full">
        {log.map((l, i) => (
          <div key={i} className="mb-1">
            <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
            {l}
          </div>
        ))}
        <div className="h-4 w-3 bg-green-500 animate-pulse inline-block mt-1" />
      </div>
      
      {complete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center w-full"
        >
          <button 
            onClick={onComplete}
            className="border border-green-500 px-6 py-2 text-green-500 hover:bg-green-500 hover:text-black transition-colors text-lg animate-pulse"
          >
            PRESS ANY KEY TO START
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default BootScreen;