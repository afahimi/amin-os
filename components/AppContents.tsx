import React, { useState, useEffect, useRef } from 'react';
import { AppId, Project, LogEntry, Achievement } from '../types';
import { PROJECTS, LOGS } from '../constants';
import { 
  Github, Linkedin, Mail, Send, Play, ExternalLink, Heart, 
  Cpu, RefreshCw, Trophy, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X,
  Palette, Sparkles, Timer, Search
} from 'lucide-react';
import Window from './Window';
import { Terminal } from './Terminal';
import { VSCodeApp } from './VSCodeApp';
import SettingsApp from './SettingsApp';
import { FileSystemNode } from '../utils/filesystem';

interface AppContentsProps {
  appId: AppId;
  unlockAchievement: (id: string) => void;
  achievements: Achievement[];
  fileSystem: FileSystemNode;
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystemNode>>;
}

export const AppContent: React.FC<AppContentsProps> = ({ appId, unlockAchievement, achievements, fileSystem, setFileSystem }) => {
  switch (appId) {
    case 'profile': return <ProfileApp />;
    case 'missions': return <MissionsApp />;
    case 'log': return <LogApp onRead={() => unlockAchievement('reader')} />;
    case 'labs': return <LabsApp onRunGame={() => unlockAchievement('game')} />;
    case 'resume': return <ResumeApp />;
    case 'contact': return <ContactApp />;
    case 'care': return <SelfCareApp onComplete={() => unlockAchievement('zen')} />;
    case 'achievements': return <AchievementsApp achievements={achievements} />;
    case 'game': return <SnakeGame onPlay={() => unlockAchievement('gamer')} />;
    case 'terminal': return <Terminal onClose={() => {}} onUnlockAchievement={unlockAchievement} fileSystem={fileSystem} setFileSystem={setFileSystem} />;
    case 'vscode': return <VSCodeApp fileSystem={fileSystem} setFileSystem={setFileSystem} />;
    case 'settings': return <SettingsApp />;
    default: return <div className="p-4">App not found</div>;
  }
};

// --- Snake Game ---
const SnakeGame = ({ onPlay }: { onPlay: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Game Config
    const CELL_SIZE = 20;
    const GRID_SIZE = 20; // 20x20 grid

    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        let snake = [{ x: 10, y: 10 }];
        let food = { x: 15, y: 15 };
        let dx = 1;
        let dy = 0;
        let intervalId: ReturnType<typeof setInterval>;

        const draw = () => {
            // Background
            ctx.fillStyle = '#050608';
            ctx.fillRect(0, 0, 400, 400);

            // Grid Lines (Retro feel)
            ctx.strokeStyle = '#111';
            ctx.beginPath();
            for(let i=0; i<=400; i+=CELL_SIZE) {
                ctx.moveTo(i, 0); ctx.lineTo(i, 400);
                ctx.moveTo(0, i); ctx.lineTo(400, i);
            }
            ctx.stroke();

            // Food
            ctx.fillStyle = '#f97373';
            ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);

            // Snake
            ctx.fillStyle = '#22d3ee';
            snake.forEach(segment => {
                ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
            });
        };

        const move = () => {
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            
            // Wall collision
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                setGameOver(true);
                return;
            }
            // Self collision
            if (snake.some(s => s.x === head.x && s.y === head.y)) {
                setGameOver(true);
                return;
            }

            snake.unshift(head);

            // Eat food
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                food = {
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE)
                };
                // Don't spawn food on snake
                while(snake.some(s => s.x === food.x && s.y === food.y)) {
                    food = {
                        x: Math.floor(Math.random() * GRID_SIZE),
                        y: Math.floor(Math.random() * GRID_SIZE)
                    };
                }
            } else {
                snake.pop();
            }

            draw();
        };

        // Controls
        const handleKey = (e: KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowUp': if(dy !== 1) { dx = 0; dy = -1; } break;
                case 'ArrowDown': if(dy !== -1) { dx = 0; dy = 1; } break;
                case 'ArrowLeft': if(dx !== 1) { dx = -1; dy = 0; } break;
                case 'ArrowRight': if(dx !== -1) { dx = 1; dy = 0; } break;
            }
        };
        window.addEventListener('keydown', handleKey);

        // Initial Draw
        draw();
        intervalId = setInterval(move, 150);
        onPlay();

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('keydown', handleKey);
        };
    }, [gameStarted, gameOver, onPlay]);

    // Mobile Controls
    const sendInput = (key: string) => {
        const event = new KeyboardEvent('keydown', { key });
        window.dispatchEvent(event);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-black/80 p-4 overflow-y-auto">
            <div className="mb-4 flex justify-between w-full max-w-[400px] items-center">
                <span className="font-mono text-os-cyan">SCORE: {score}</span>
                <button 
                    onClick={() => {
                        setGameStarted(true);
                        setGameOver(false);
                        setScore(0);
                        // Re-trigger effect
                    }} 
                    className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs font-bold"
                >
                    {gameOver ? 'RETRY?' : 'RESET'}
                </button>
            </div>
            
            <div className="relative border-2 border-white/10 rounded shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                {!gameStarted && !gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                        <Gamepad2 size={48} className="text-os-cyan mb-4" />
                        <button 
                            onClick={() => setGameStarted(true)}
                            className="bg-os-cyan text-black font-bold px-6 py-2 rounded hover:scale-105 transition-transform"
                        >
                            START_GAME.EXE
                        </button>
                        <p className="mt-4 text-xs text-gray-500 font-mono">USE ARROW KEYS</p>
                    </div>
                )}
                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
                        <div className="text-os-red font-mono text-2xl mb-2 font-bold">GAME OVER</div>
                        <div className="text-white font-mono mb-6">FINAL SCORE: {score}</div>
                        <button 
                            onClick={() => { setGameOver(false); setScore(0); }}
                            className="border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded"
                        >
                            TRY AGAIN
                        </button>
                    </div>
                )}
                <canvas ref={canvasRef} width={400} height={400} className="bg-[#050608] max-w-full" />
            </div>

            {/* Mobile D-Pad */}
            <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
                <div></div>
                <button className="p-4 bg-white/10 rounded active:bg-os-cyan" onClick={() => sendInput('ArrowUp')}><ArrowUp/></button>
                <div></div>
                <button className="p-4 bg-white/10 rounded active:bg-os-cyan" onClick={() => sendInput('ArrowLeft')}><ArrowLeft/></button>
                <button className="p-4 bg-white/10 rounded active:bg-os-cyan" onClick={() => sendInput('ArrowDown')}><ArrowDown/></button>
                <button className="p-4 bg-white/10 rounded active:bg-os-cyan" onClick={() => sendInput('ArrowRight')}><ArrowRight/></button>
            </div>
        </div>
    );
};

// --- Individual Apps ---

const ProfileApp = () => (
  <div className="p-6 text-gray-300 space-y-8 h-full overflow-y-auto custom-scrollbar pb-20">
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 border-b border-white/10 pb-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-os-cyan to-os-purple p-[2px] shrink-0">
        <img 
          src="https://picsum.photos/200/200" 
          alt="Amin" 
          className="w-full h-full rounded-full object-cover border-2 border-black"
        />
      </div>
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-display font-bold text-white">Amin F.</h2>
        <p className="text-os-cyan font-mono">Frontend Engineer & System Thinker</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2 text-xs font-mono text-gray-500">
          <span>LVL 24</span>
          <span>•</span>
          <span>VANCOUVER</span>
          <span>•</span>
          <span>ONLINE</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/5 p-4 rounded border border-white/10">
        <h3 className="text-xs font-mono text-gray-500 mb-2">[CURRENT_FOCUS]</h3>
        <p className="text-sm">Mastering WebGL shaders and prepping for full-stack system design interviews.</p>
      </div>
      <div className="bg-white/5 p-4 rounded border border-white/10">
        <h3 className="text-xs font-mono text-gray-500 mb-2">[OBSESSION]</h3>
        <p className="text-sm">Procedural generation and digital gardening.</p>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
        <Cpu size={16} className="text-os-purple"/> System Traits
      </h3>
      <div className="space-y-4">
        {['Pixel Perfection', 'System Architecture', 'Caffeine Tolerance', 'Shipping Speed'].map(trait => (
          <div key={trait} className="group">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>{trait}</span>
              <span className="text-os-cyan">94%</span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-os-cyan to-os-purple" 
                style={{ width: '94%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MissionsApp = () => (
  <div className="h-full flex flex-col">
    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
      <span className="font-mono text-xs text-gray-500">SELECT MISSION_</span>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pb-20">
      {PROJECTS.map(project => (
        <div key={project.id} className="bg-white/5 border border-white/10 p-4 rounded hover:border-os-cyan/50 transition-colors group cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white group-hover:text-os-cyan transition-colors">{project.title}</h3>
            <span className="text-[10px] font-mono border border-white/20 px-1 rounded text-gray-400">{project.role}</span>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.desc}</p>
          <div className="flex flex-wrap gap-2">
            {project.stack.map(tech => (
              <span key={tech} className="text-[10px] font-mono bg-os-purple/10 text-os-purple px-2 py-0.5 rounded">
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LogApp = ({ onRead }: { onRead: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string>(LOGS[0].id);

  const filteredLogs = LOGS.filter(log => 
    log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    log.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLog = LOGS.find(l => l.id === selectedLogId) || LOGS[0];

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 border-r border-white/10 bg-black/20 flex flex-col max-h-[200px] md:max-h-full overflow-y-auto">
        <div className="p-3 border-b border-white/10 sticky top-0 bg-[#050608] flex items-center gap-2">
          <Search size={14} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="grep logs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm text-white focus:outline-none font-mono placeholder:text-gray-600"
          />
        </div>
        <div className="flex-1">
          {filteredLogs.map(log => (
            <div 
                key={log.id} 
                className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${selectedLogId === log.id ? 'bg-white/10 border-l-2 border-l-os-cyan' : ''}`}
                onClick={() => {
                    setSelectedLogId(log.id);
                    onRead();
                }}
            >
              <div className="text-[10px] font-mono text-gray-500 mb-1">{log.date}</div>
              <div className="text-sm font-medium text-gray-200">{log.title}</div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-xs font-mono">
                  No logs found matching query.
              </div>
          )}
        </div>
      </div>
      <div className="w-full md:w-2/3 p-6 overflow-y-auto pb-20">
        <h1 className="text-2xl font-display font-bold text-white mb-2">{selectedLog.title}</h1>
        <div className="flex gap-2 mb-6">
          {selectedLog.tags.map(tag => (
            <span key={tag} className="text-xs font-mono text-os-cyan">#{tag}</span>
          ))}
        </div>
        <div className="prose prose-invert prose-sm font-sans max-w-none">
          <p>{selectedLog.content}</p>
          <p className="mt-4 text-gray-400">
            [System Note: This is a simulated OS. Click on logs to trigger reading achievement.]
          </p>
        </div>
      </div>
    </div>
  );
};

const LabsApp = ({ onRunGame }: { onRunGame: () => void }) => {
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col">
      {activeExperiment ? (
        <div className="flex-1 relative">
          <button 
            onClick={() => setActiveExperiment(null)}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/10"
          >
            <X size={20} />
          </button>
          {activeExperiment === 'matrix' && <MatrixRain />}
          {activeExperiment === 'fractal' && <FractalTree />}
          {activeExperiment === 'physics' && <PhysicsPlayground />}
          {activeExperiment === 'color' && <ColorHeist />}
          {activeExperiment === 'names' && <CyberNameGen />}
          {activeExperiment === 'pomodoro' && <PomodoroTimer />}
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">


          {/* Matrix Rain */}
          <div className="aspect-video bg-black/50 border border-green-500/30 rounded relative group overflow-hidden cursor-pointer" onClick={() => setActiveExperiment('matrix')}>
            <div className="absolute inset-0 flex items-center justify-center bg-black">
               <div className="text-green-500 font-mono text-2xl font-bold">MATRIX_RAIN</div>
            </div>
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Fractal Tree */}
          <div className="aspect-video bg-black/50 border border-pink-500/30 rounded relative group overflow-hidden cursor-pointer" onClick={() => setActiveExperiment('fractal')}>
            <div className="absolute inset-0 flex items-center justify-center bg-black">
               <div className="text-pink-500 font-mono text-2xl font-bold">FRACTAL_TREE</div>
            </div>
            <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Physics Playground */}
          <div className="aspect-video bg-black/50 border border-yellow-500/30 rounded relative group overflow-hidden cursor-pointer" onClick={() => setActiveExperiment('physics')}>
            <div className="absolute inset-0 flex items-center justify-center bg-black">
               <div className="text-yellow-500 font-mono text-2xl font-bold">PHYSICS_BOX</div>
            </div>
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Color Heist */}
          <div className="aspect-video bg-black/50 border border-indigo-500/30 rounded relative group overflow-hidden cursor-pointer" onClick={() => setActiveExperiment('color')}>
            <div className="absolute inset-0 flex items-center justify-center bg-black">
               <div className="text-indigo-500 font-mono text-2xl font-bold flex items-center gap-2"><Palette /> COLOR_HEIST</div>
            </div>
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Cyber Name Gen */}
          <div className="aspect-video bg-black/50 border border-cyan-500/30 rounded relative group overflow-hidden cursor-pointer" onClick={() => setActiveExperiment('names')}>
            <div className="absolute inset-0 flex items-center justify-center bg-black">
               <div className="text-cyan-500 font-mono text-2xl font-bold flex items-center gap-2"><Sparkles /> NAME_GEN</div>
            </div>
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Pomodoro */}
          <div className="aspect-video bg-black/50 border border-red-500/30 rounded relative group overflow-hidden cursor-pointer" onClick={() => setActiveExperiment('pomodoro')}>
            <div className="absolute inset-0 flex items-center justify-center bg-black">
               <div className="text-red-500 font-mono text-2xl font-bold flex items-center gap-2"><Timer /> POMODORO</div>
            </div>
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Experiments ---

const MatrixRain = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        const handleResize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

const FractalTree = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [angle, setAngle] = useState(0.5);
    const [length, setLength] = useState(100);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const drawTree = (startX: number, startY: number, len: number, ang: number, branchWidth: number) => {
            ctx.beginPath();
            ctx.save();
            ctx.strokeStyle = `hsl(${len * 2}, 100%, 50%)`;
            ctx.lineWidth = branchWidth;
            ctx.translate(startX, startY);
            ctx.rotate(ang * Math.PI / 180);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -len);
            ctx.stroke();

            if (len < 10) {
                ctx.restore();
                return;
            }

            drawTree(0, -len, len * 0.75, ang - angle * 50, branchWidth * 0.7);
            drawTree(0, -len, len * 0.75, ang + angle * 50, branchWidth * 0.7);
            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawTree(canvas.width / 2, canvas.height, length, 0, 10);
        };

        requestAnimationFrame(animate);

    }, [angle, length]);

    return (
        <div className="w-full h-full relative bg-black flex flex-col items-center">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute bottom-4 bg-black/80 p-4 rounded border border-white/10 flex gap-8" onMouseDown={(e) => e.stopPropagation()}>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Angle</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.01" 
                        value={angle} 
                        onChange={(e) => setAngle(parseFloat(e.target.value))} 
                        className="w-32"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Length</label>
                    <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={length} 
                        onChange={(e) => setLength(parseInt(e.target.value))} 
                        className="w-32"
                    />
                </div>
            </div>
        </div>
    );
};

const PhysicsPlayground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Use ref for physics state to avoid closure staleness in animation loop
    const ballsRef = useRef<{x: number, y: number, vx: number, vy: number, radius: number, color: string}[]>([]);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        // Initialize some balls
        ballsRef.current = Array.from({ length: 5 }).map(() => ({
            x: Math.random() * 400,
            y: Math.random() * 200,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            radius: 10 + Math.random() * 20,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        }));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const update = () => {
            if (!canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update physics
            ballsRef.current = ballsRef.current.map(ball => {
                let { x, y, vx, vy, radius } = ball;

                vy += 0.5; // Gravity
                vx *= 0.99; // Air resistance
                vy *= 0.99;

                x += vx;
                y += vy;

                if (y + radius > canvas.height) {
                    y = canvas.height - radius;
                    vy *= -0.7;
                }
                if (x + radius > canvas.width) {
                    x = canvas.width - radius;
                    vx *= -0.7;
                }
                if (x - radius < 0) {
                    x = radius;
                    vx *= -0.7;
                }

                return { ...ball, x, y, vx, vy };
            });

            // Draw
            ballsRef.current.forEach(ball => {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = ball.color;
                ctx.fill();
            });

            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const addBall = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ballsRef.current.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            radius: 10 + Math.random() * 20,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
    };

    return (
        <div className="w-full h-full relative bg-gray-900" onClick={addBall}>
            <canvas ref={canvasRef} className="w-full h-full block" width={800} height={600} />
            <div className="absolute top-4 left-4 text-white/50 text-xs pointer-events-none">
                Click to add balls
            </div>
        </div>
    );
};

const ColorHeist = () => {
    const [color, setColor] = useState('#22d3ee');
    const [palette, setPalette] = useState<string[]>([]);

    const generatePalette = () => {
        const newPalette = [];
        for(let i=0; i<5; i++) {
            newPalette.push(`hsl(${Math.random() * 360}, 70%, 60%)`);
        }
        setPalette(newPalette);
    };

    useEffect(() => {
        generatePalette();
    }, []);

    return (
        <div className="w-full h-full bg-gray-900 p-8 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-display font-bold text-white mb-8">COLOR_HEIST v1.0</h2>
            
            <div className="flex gap-4 mb-8">
                {palette.map((c, i) => (
                    <div 
                        key={i} 
                        className="w-16 h-32 rounded cursor-pointer hover:scale-110 transition-transform relative group"
                        style={{ backgroundColor: c }}
                        onClick={() => {
                            setColor(c);
                            navigator.clipboard.writeText(c);
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 text-white text-xs font-mono font-bold">
                            COPY
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={generatePalette}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded font-mono border border-white/10"
                >
                    GENERATE_NEW
                </button>
                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded border border-white/10">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-white font-mono">{color}</span>
                </div>
            </div>
        </div>
    );
};

const CyberNameGen = () => {
    const [name, setName] = useState('');
    
    const prefixes = ['Cyber', 'Neo', 'Tech', 'Data', 'Net', 'Web', 'Bit', 'Byte', 'Pixel', 'Void', 'Null', 'Zero'];
    const suffixes = ['Punk', 'Runner', 'Surfer', 'Mancer', 'Hacker', 'Ghost', 'Bot', 'Droid', 'Mind', 'Soul', 'Core'];

    const generate = () => {
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        const n = Math.floor(Math.random() * 9999);
        setName(`${p}${s}_${n}`);
    };

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center p-4">
            <div className="text-os-cyan font-mono text-sm mb-4">IDENTITY_GENERATOR</div>
            <div className="text-4xl md:text-6xl font-display font-bold text-white mb-8 text-center tracking-tighter">
                {name || 'READY?'}
            </div>
            <button 
                onClick={generate}
                className="bg-os-purple hover:bg-os-purple/80 text-white px-8 py-3 rounded font-bold tracking-widest hover:scale-105 transition-transform"
            >
                GENERATE
            </button>
        </div>
    );
};

const PomodoroTimer = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'break'>('work');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound or notify
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
    };

    const switchMode = () => {
        const newMode = mode === 'work' ? 'break' : 'work';
        setMode(newMode);
        setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center transition-colors duration-500 ${mode === 'work' ? 'bg-red-900/20' : 'bg-green-900/20'}`}>
            <div className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">
                {mode === 'work' ? 'Focus Sequence' : 'Recharge Cycle'}
            </div>
            <div className="text-8xl font-mono font-bold text-white mb-8 tabular-nums">
                {formatTime(timeLeft)}
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={toggleTimer}
                    className="bg-white/10 hover:bg-white/20 text-white w-16 h-16 rounded-full flex items-center justify-center border border-white/10 transition-all hover:scale-110"
                >
                    {isActive ? <div className="w-4 h-4 bg-white rounded-sm" /> : <Play className="fill-white" />}
                </button>
                <button 
                    onClick={resetTimer}
                    className="bg-white/10 hover:bg-white/20 text-white w-16 h-16 rounded-full flex items-center justify-center border border-white/10 transition-all hover:scale-110"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            <button 
                onClick={switchMode}
                className="mt-8 text-xs font-mono text-gray-500 hover:text-white underline decoration-dotted"
            >
                Switch to {mode === 'work' ? 'Break' : 'Work'} Mode
            </button>
        </div>
    );
};

const ResumeApp = () => (
  <div className="h-full flex flex-col bg-white text-black">
    <div className="p-2 bg-gray-200 border-b border-gray-300 flex justify-between items-center shrink-0">
      <span className="text-xs font-mono text-gray-600">resume_final_v24.pdf</span>
      <button className="text-xs flex items-center gap-1 hover:text-blue-600 px-2 py-1 rounded hover:bg-gray-300 transition-colors">
        <ExternalLink size={12} /> Download
      </button>
    </div>
    <div className="flex-1 p-6 md:p-8 overflow-y-auto font-sans pb-20">
      <header className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tighter">Amin F.</h1>
        <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-sm mt-2 text-gray-600">
          <span>github.com/amin</span>
          <span>linkedin.com/in/amin</span>
          <span>vancouver, bc</span>
        </div>
      </header>
      
      <section className="mb-6">
        <h2 className="font-bold text-lg uppercase border-b border-gray-300 mb-3">Experience</h2>
        {PROJECTS.map(p => (
          <div key={p.id} className="mb-4">
            <div className="flex flex-col md:flex-row justify-between items-baseline">
              <h3 className="font-bold">{p.title}</h3>
              <span className="text-sm text-gray-600">2022 - Present</span>
            </div>
            <div className="text-sm italic mb-1">{p.role}</div>
            <p className="text-sm text-gray-700">{p.impact}</p>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-lg uppercase border-b border-gray-300 mb-3">Skills</h2>
        <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
            <div><span className="font-bold">Languages:</span> TypeScript, Go, Python, SQL</div>
            <div><span className="font-bold">Frontend:</span> React, Next.js, Three.js, Tailwind</div>
            <div><span className="font-bold">Backend:</span> Node.js, Docker, Postgres, AWS</div>
            <div><span className="font-bold">Tools:</span> Git, Figma, Linear</div>
        </div>
      </section>
    </div>
  </div>
);

const ContactApp = () => (
  <div className="p-6 md:p-8 h-full flex flex-col justify-center overflow-y-auto">
    <div className="max-w-md mx-auto w-full pb-10">
      <h2 className="text-2xl font-display font-bold text-white mb-6">Initialize Handshake</h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-mono text-os-cyan mb-1">SOURCE_IDENTITY</label>
          <input type="text" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-os-cyan outline-none transition-colors" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-xs font-mono text-os-cyan mb-1">TRANSMISSION_CONTENT</label>
          <textarea className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-os-cyan outline-none h-32 transition-colors" placeholder="Message..." />
        </div>
        <button className="w-full bg-os-cyan text-black font-bold py-2 rounded hover:bg-white transition-colors flex items-center justify-center gap-2">
          <Send size={16} /> TRANSMIT
        </button>
      </form>
      <div className="mt-8 flex justify-center gap-6">
        <Github className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
        <Linkedin className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
        <Mail className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
      </div>
    </div>
  </div>
);

const SelfCareApp = ({ onComplete }: { onComplete: () => void }) => {
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
      if (!active) {
          setTimer(0);
          return;
      }
      
      const interval = setInterval(() => {
          setTimer(t => t + 1);
      }, 1000);

      return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
      if (!active) return;
      const cycleTime = timer % 12; // 4-4-4 breathing
      if (cycleTime < 4) setPhase('Inhale');
      else if (cycleTime < 8) setPhase('Hold');
      else setPhase('Exhale');

      if (timer > 0 && timer % 12 === 0) {
          // Completed a cycle
          if (timer > 30) onComplete(); // Trigger achievement after ~3 cycles
      }
  }, [timer, active, onComplete]);
  
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-b from-black to-[#1a1a2e] overflow-hidden">
      <div className="text-center relative z-10">
        <div className={`relative w-48 h-48 mx-auto mb-8 flex items-center justify-center transition-all duration-1000`}>
           {/* Breathing Animation */}
           <div className={`
                absolute inset-0 bg-os-purple/20 rounded-full blur-xl transition-all duration-[4000ms] ease-in-out
                ${active && phase === 'Inhale' ? 'scale-150 opacity-100' : ''}
                ${active && phase === 'Hold' ? 'scale-150 opacity-80' : ''}
                ${active && phase === 'Exhale' ? 'scale-100 opacity-40' : ''}
                ${!active ? 'scale-100 opacity-0' : ''}
           `}></div>
           
           <div className={`
                absolute inset-0 border-2 border-os-purple/30 rounded-full transition-all duration-[4000ms] ease-in-out
                ${active && phase === 'Inhale' ? 'scale-125' : 'scale-100'}
           `}></div>
           
           <Heart 
                size={48} 
                className={`
                    text-os-purple relative z-10 transition-all duration-1000
                    ${active ? 'animate-pulse scale-110' : 'scale-100'}
                `} 
            />
            
            {active && (
                <div className="absolute font-mono text-2xl font-bold text-white drop-shadow-lg">
                    {phase}
                </div>
            )}
        </div>
        
        <h2 className="text-xl font-display text-white mb-2">System Cooldown</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
          {active ? `Session Time: ${timer}s` : 'Sync your breathing. Inhale (4s), Hold (4s), Exhale (4s).'}
        </p>
        
        <button 
          onClick={() => setActive(!active)}
          className={`px-8 py-3 rounded-full font-mono font-bold transition-all flex items-center gap-2 mx-auto ${active ? 'bg-os-red text-black' : 'bg-os-purple text-black hover:bg-white'}`}
        >
          {active ? <><RefreshCw className="animate-spin" size={16}/> STOP_SEQUENCE</> : 'INITIATE_BREATHE'}
        </button>
      </div>
    </div>
  );
};

const AchievementsApp = ({ achievements }: { achievements: Achievement[] }) => (
  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto h-full pb-20">
    {achievements.map(ach => (
      <div key={ach.id} className={`p-4 rounded border flex flex-col items-center text-center gap-2 transition-all ${ach.unlocked ? 'bg-white/10 border-os-yellow/30 scale-105' : 'bg-black/50 border-white/5 opacity-50 grayscale'}`}>
        <div className="text-4xl mb-2">{ach.icon}</div>
        <h3 className={`font-bold text-sm ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title}</h3>
        <p className="text-xs text-gray-400">{ach.desc}</p>
        {ach.unlocked ? (
            <div className="text-[10px] font-mono text-os-yellow mt-2 border border-os-yellow/20 px-2 py-0.5 rounded bg-os-yellow/10">UNLOCKED: {ach.date}</div>
        ) : (
            <div className="text-[10px] font-mono text-gray-600 mt-2">LOCKED</div>
        )}
      </div>
    ))}
  </div>
);
