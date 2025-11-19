import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Save } from 'lucide-react';

interface TerminalProps {
  onClose: () => void;
  onUnlockAchievement: (id: string) => void;
}

interface HistoryItem {
  type: 'input' | 'output' | 'error';
  content: string;
}

type FileType = 'file' | 'directory';

interface FileSystemNode {
  name: string;
  type: FileType;
  content?: string;
  children?: { [name: string]: FileSystemNode };
}

const INITIAL_FS: FileSystemNode = {
  name: 'root',
  type: 'directory',
  children: {
    'home': {
      name: 'home',
      type: 'directory',
      children: {
        'guest': {
          name: 'guest',
          type: 'directory',
          children: {
            'readme.txt': { name: 'readme.txt', type: 'file', content: 'Welcome to AminOS Terminal.\nThis is a mock terminal environment.\n\nTry commands like:\n- ls\n- cd\n- mkdir\n- touch\n- nano' },
            'secrets.txt': { name: 'secrets.txt', type: 'file', content: 'TOP SECRET\n----------------\nThe password is: password123' },
            'todo.list': { name: 'todo.list', type: 'file', content: '- Buy milk\n- Hack the mainframe\n- Sleep' },
            'projects': {
                name: 'projects',
                type: 'directory',
                children: {}
            }
          }
        }
      }
    },
    'bin': {
      name: 'bin',
      type: 'directory',
      children: {
          'echo': { name: 'echo', type: 'file', content: 'Binary file' },
          'ls': { name: 'ls', type: 'file', content: 'Binary file' },
          'cat': { name: 'cat', type: 'file', content: 'Binary file' }
      }
    },
    'etc': {
        name: 'etc',
        type: 'directory',
        children: {
            'hosts': { name: 'hosts', type: 'file', content: '127.0.0.1 localhost' },
            'passwd': { name: 'passwd', type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000:guest:/home/guest:/bin/bash' }
        }
    },
    'var': {
        name: 'var',
        type: 'directory',
        children: {
            'log': {
                name: 'log',
                type: 'directory',
                children: {
                    'syslog': { name: 'syslog', type: 'file', content: 'System booted successfully.' }
                }
            }
        }
    }
  }
};

export const Terminal: React.FC<TerminalProps> = ({ onClose, onUnlockAchievement }) => {
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'output', content: 'AminOS v1.0.0' },
    { type: 'output', content: 'Type "help" for a list of commands.' },
  ]);
  const [input, setInput] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>(['home', 'guest']);
  const [fileSystem, setFileSystem] = useState<FileSystemNode>(INITIAL_FS);
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editorFilePath, setEditorFilePath] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  useEffect(() => {
      if (isEditorOpen && editorRef.current) {
          editorRef.current.focus();
      } else if (!isEditorOpen && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isEditorOpen]);

  // --- VFS Helpers ---

  const getNode = (path: string[], fs: FileSystemNode = fileSystem): FileSystemNode | null => {
      let current = fs;
      for (const segment of path) {
          if (current.children && current.children[segment]) {
              current = current.children[segment];
          } else {
              return null;
          }
      }
      return current;
  };

  const resolvePath = (pathStr: string): string[] => {
      if (pathStr === '/') return [];
      if (pathStr === '~') return ['home', 'guest'];
      
      const parts = pathStr.split('/').filter(p => p.length > 0);
      let newPath = pathStr.startsWith('/') ? [] : [...currentPath];

      for (const part of parts) {
          if (part === '.') continue;
          if (part === '..') {
              if (newPath.length > 0) newPath.pop();
          } else if (part === '~') {
              newPath = ['home', 'guest'];
          } else {
              newPath.push(part);
          }
      }
      return newPath;
  };

  const getDirContent = (path: string[]): string[] | null => {
      const node = getNode(path);
      if (node && node.type === 'directory' && node.children) {
          return Object.keys(node.children);
      }
      return null;
  };

  // --- Command Handlers ---

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setHistory(prev => [...prev, { type: 'input', content: trimmedCmd }]);
    
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        setHistory(prev => [...prev, { type: 'output', content: 
`Available commands:
  File Operations:
    ls [dir]        List directory contents
    cd [dir]        Change directory
    pwd             Print working directory
    mkdir [dir]     Create directory
    touch [file]    Create empty file
    cp [src] [dst]  Copy file/directory
    mv [src] [dst]  Move/rename file/directory
    rm [file]       Remove file (-r for recursive)
    cat [file]      Display file contents
    nano [file]     Open text editor

  System:
    clear           Clear the terminal screen
    echo [text]     Print text to the screen
    whoami          Display current user
    hostname        Display system hostname
    uptime          Display system uptime
    top             Display processes
    date            Show current date and time
    
  Easter Eggs:
    rm -rf /        ???` 
        }]);
        break;
      
      case 'clear':
        setHistory([]);
        break;
        
      case 'echo':
        setHistory(prev => [...prev, { type: 'output', content: args.join(' ') }]);
        break;
        
      case 'whoami':
        setHistory(prev => [...prev, { type: 'output', content: 'guest' }]);
        break;
        
      case 'hostname':
        setHistory(prev => [...prev, { type: 'output', content: 'amin-os' }]);
        break;
        
      case 'uptime':
        setHistory(prev => [...prev, { type: 'output', content: 'up 42 days, 13:37, 1 user, load average: 0.01, 0.05, 0.15' }]);
        break;
        
      case 'top':
        setHistory(prev => [...prev, { type: 'output', content: 
`PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  1 root      20   0   12.5m   2.1m   1.8m S   0.0   0.1   0:01.23 init
 42 guest     20   0  800.2m 200.5m  50.2m S   2.3  12.5  42:00.00 amin-os-renderer
 99 guest     20   0   24.5m   4.2m   3.1m R   0.5   0.2   0:00.05 top` 
        }]);
        break;

      case 'pwd':
        setHistory(prev => [...prev, { type: 'output', content: '/' + currentPath.join('/') }]);
        break;

      case 'cd':
        const targetPath = args[0] || '~';
        const resolvedPath = resolvePath(targetPath);
        const targetNode = getNode(resolvedPath);
        
        if (targetNode && targetNode.type === 'directory') {
            setCurrentPath(resolvedPath);
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `cd: ${targetPath}: No such file or directory` }]);
        }
        break;

      case 'ls':
        const lsPath = args[0] ? resolvePath(args[0]) : currentPath;
        const contents = getDirContent(lsPath);
        if (contents) {
            const node = getNode(lsPath);
            const formatted = contents.map(name => {
                const child = node?.children?.[name];
                return child?.type === 'directory' ? `\x1b[1;34m${name}/\x1b[0m` : name;
            }).join('  ');
            // Basic color simulation using spans in render
            setHistory(prev => [...prev, { type: 'output', content: contents.map(name => {
                const child = node?.children?.[name];
                return child?.type === 'directory' ? `${name}/` : name;
            }).join('  ') }]);
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `ls: cannot access '${args[0]}': No such file or directory` }]);
        }
        break;

      case 'mkdir':
        if (!args[0]) {
            setHistory(prev => [...prev, { type: 'error', content: 'mkdir: missing operand' }]);
            break;
        }
        const mkdirPath = resolvePath(args[0]);
        const mkdirParentPath = mkdirPath.slice(0, -1);
        const mkdirName = mkdirPath[mkdirPath.length - 1];
        const mkdirParent = getNode(mkdirParentPath);
        
        if (mkdirParent && mkdirParent.type === 'directory') {
            if (mkdirParent.children && mkdirParent.children[mkdirName]) {
                setHistory(prev => [...prev, { type: 'error', content: `mkdir: cannot create directory '${args[0]}': File exists` }]);
            } else {
                const newFS = JSON.parse(JSON.stringify(fileSystem));
                const parentNode = getNode(mkdirParentPath, newFS);
                if (parentNode && parentNode.children) {
                    parentNode.children[mkdirName] = { name: mkdirName, type: 'directory', children: {} };
                    setFileSystem(newFS);
                }
            }
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `mkdir: cannot create directory '${args[0]}': No such file or directory` }]);
        }
        break;

      case 'touch':
        if (!args[0]) {
            setHistory(prev => [...prev, { type: 'error', content: 'touch: missing operand' }]);
            break;
        }
        const touchPath = resolvePath(args[0]);
        const touchParentPath = touchPath.slice(0, -1);
        const touchName = touchPath[touchPath.length - 1];
        const touchParent = getNode(touchParentPath);

        if (touchParent && touchParent.type === 'directory') {
             const newFS = JSON.parse(JSON.stringify(fileSystem));
             const parentNode = getNode(touchParentPath, newFS);
             if (parentNode && parentNode.children) {
                 parentNode.children[touchName] = { name: touchName, type: 'file', content: '' };
                 setFileSystem(newFS);
             }
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `touch: cannot touch '${args[0]}': No such file or directory` }]);
        }
        break;

      case 'rm':
        const isRecursive = args[0] === '-r' || args[0] === '-rf';
        const rmTarget = isRecursive ? args[1] : args[0];
        
        if (args.join(' ') === '-rf /') {
            triggerRmRf();
            return;
        }

        if (!rmTarget) {
             setHistory(prev => [...prev, { type: 'error', content: 'rm: missing operand' }]);
             break;
        }

        const rmPath = resolvePath(rmTarget);
        const rmParentPath = rmPath.slice(0, -1);
        const rmName = rmPath[rmPath.length - 1];
        const rmNode = getNode(rmPath);
        
        if (rmNode) {
            if (rmNode.type === 'directory' && !isRecursive) {
                setHistory(prev => [...prev, { type: 'error', content: `rm: cannot remove '${rmTarget}': Is a directory` }]);
            } else {
                const newFS = JSON.parse(JSON.stringify(fileSystem));
                const parentNode = getNode(rmParentPath, newFS);
                if (parentNode && parentNode.children) {
                    delete parentNode.children[rmName];
                    setFileSystem(newFS);
                }
            }
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `rm: cannot remove '${rmTarget}': No such file or directory` }]);
        }
        break;

      case 'cat':
        if (!args[0]) {
            setHistory(prev => [...prev, { type: 'error', content: 'cat: missing operand' }]);
            break;
        }
        const catPath = resolvePath(args[0]);
        const catNode = getNode(catPath);
        
        if (catNode) {
            if (catNode.type === 'directory') {
                setHistory(prev => [...prev, { type: 'error', content: `cat: ${args[0]}: Is a directory` }]);
            } else {
                setHistory(prev => [...prev, { type: 'output', content: catNode.content || '' }]);
            }
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `cat: ${args[0]}: No such file or directory` }]);
        }
        break;

      case 'cp':
        if (args.length < 2) {
            setHistory(prev => [...prev, { type: 'error', content: 'cp: missing file operand' }]);
            break;
        }
        const cpSrcPath = resolvePath(args[0]);
        const cpDestPath = resolvePath(args[1]);
        const cpSrcNode = getNode(cpSrcPath);
        
        if (!cpSrcNode) {
            setHistory(prev => [...prev, { type: 'error', content: `cp: cannot stat '${args[0]}': No such file or directory` }]);
            break;
        }

        // If dest is a directory, copy into it with same name
        let finalCpDestPath = [...cpDestPath];
        const cpDestNode = getNode(cpDestPath);
        if (cpDestNode && cpDestNode.type === 'directory') {
            finalCpDestPath.push(cpSrcPath[cpSrcPath.length - 1]);
        }

        const cpDestParentPath = finalCpDestPath.slice(0, -1);
        const cpDestName = finalCpDestPath[finalCpDestPath.length - 1];
        const cpDestParent = getNode(cpDestParentPath);

        if (cpDestParent && cpDestParent.type === 'directory') {
             if (cpDestParent.children) {
                 // Deep copy the node
                 cpDestParent.children[cpDestName] = JSON.parse(JSON.stringify(cpSrcNode));
                 // Update name in the copied node
                 cpDestParent.children[cpDestName].name = cpDestName;
                 setFileSystem({...fileSystem});
             }
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `cp: cannot create regular file '${args[1]}': No such file or directory` }]);
        }
        break;

      case 'mv':
        if (args.length < 2) {
            setHistory(prev => [...prev, { type: 'error', content: 'mv: missing file operand' }]);
            break;
        }
        const mvSrcPath = resolvePath(args[0]);
        const mvDestPath = resolvePath(args[1]);
        const mvSrcNode = getNode(mvSrcPath);
        
        if (!mvSrcNode) {
            setHistory(prev => [...prev, { type: 'error', content: `mv: cannot stat '${args[0]}': No such file or directory` }]);
            break;
        }

        // If dest is a directory, move into it with same name
        let finalMvDestPath = [...mvDestPath];
        const mvDestNode = getNode(mvDestPath);
        if (mvDestNode && mvDestNode.type === 'directory') {
            finalMvDestPath.push(mvSrcPath[mvSrcPath.length - 1]);
        }

        const mvDestParentPath = finalMvDestPath.slice(0, -1);
        const mvDestName = finalMvDestPath[finalMvDestPath.length - 1];
        const mvDestParent = getNode(mvDestParentPath);

        if (mvDestParent && mvDestParent.type === 'directory') {
             if (mvDestParent.children) {
                 // Remove from old location
                 const mvSrcParentPath = mvSrcPath.slice(0, -1);
                 const mvSrcName = mvSrcPath[mvSrcPath.length - 1];
                 const mvSrcParent = getNode(mvSrcParentPath);
                 if (mvSrcParent && mvSrcParent.children) {
                     delete mvSrcParent.children[mvSrcName];
                 }

                 // Add to new location
                 mvDestParent.children[mvDestName] = mvSrcNode;
                 mvDestParent.children[mvDestName].name = mvDestName;
                 setFileSystem({...fileSystem});
             }
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `mv: cannot move '${args[0]}' to '${args[1]}': No such file or directory` }]);
        }
        break;

      case 'nano':
      case 'vim':
        if (!args[0]) {
             setHistory(prev => [...prev, { type: 'error', content: 'nano: missing operand' }]);
             break;
        }
        const editPath = resolvePath(args[0]);
        const editNode = getNode(editPath);
        
        if (editNode && editNode.type === 'directory') {
            setHistory(prev => [...prev, { type: 'error', content: `nano: ${args[0]}: Is a directory` }]);
        } else {
            setEditorFilePath(args[0]); // Store original arg for display
            setEditorContent(editNode?.content || '');
            setIsEditorOpen(true);
        }
        break;

      case 'date':
        setHistory(prev => [...prev, { type: 'output', content: new Date().toString() }]);
        break;
        
      case 'matrix':
         setHistory(prev => [...prev, { type: 'output', content: 'Follow the white rabbit...' }]);
         break;

      case 'neofetch':
              setHistory(prev => [
        ...prev,
        {
          type: "output",
          content: `
      \x1b█████╗ ███╗   ███╗██╗███╗   ██╗\x1b
      \x1b██╔══██╗████╗ ████║██║████╗  ██║\x1b
      \x1b███████║██╔████╔██║██║██╔██╗ ██║\x1b
      \x1b██╔══██║██║╚██╔╝██║██║██║╚██╗██║\x1b
      \x1b██║  ██║██║ ╚═╝ ██║██║██║ ╚████║\x1b
      \x1b╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝\x1b

      \x1bamin@amin-os\x1b
      -------------
      OS: AminOS v1.0.0
      Host: Web Browser
      Kernel: React 18
      Uptime: ${new Date().toLocaleTimeString()}
      Shell: Zsh (Simulated)
      Resolution: ${window.innerWidth}x${window.innerHeight}
      Theme: Matrix Green
      Font: Monospace
      `
        }
      ]);

         break;
         
      case '':
        break;
        
      default:
        setHistory(prev => [...prev, { type: 'error', content: `command not found: ${command}` }]);
    }
  };

  const saveFile = () => {
      if (editorFilePath) {
          const path = resolvePath(editorFilePath);
          const parentPath = path.slice(0, -1);
          const fileName = path[path.length - 1];
          const parentNode = getNode(parentPath);
          
          if (parentNode && parentNode.type === 'directory') {
              const newFS = JSON.parse(JSON.stringify(fileSystem));
              const newParent = getNode(parentPath, newFS);
              if (newParent && newParent.children) {
                  newParent.children[fileName] = { name: fileName, type: 'file', content: editorContent };
                  setFileSystem(newFS);
                  setHistory(prev => [...prev, { type: 'output', content: `File '${editorFilePath}' saved.` }]);
              }
          } else {
              setHistory(prev => [...prev, { type: 'error', content: `Error saving file: Directory does not exist` }]);
          }
      }
      setIsEditorOpen(false);
      setEditorFilePath(null);
      setEditorContent('');
  };

  const triggerRmRf = () => {
    setHistory(prev => [...prev, { type: 'error', content: 'INITIATING SYSTEM DELETION...' }]);
    setIsGlitching(true);
    
    setTimeout(() => {
      setHistory(prev => [...prev, { type: 'error', content: 'DELETING SYSTEM32...' }]);
    }, 1000);

    setTimeout(() => {
      setHistory(prev => [...prev, { type: 'error', content: 'KERNEL PANIC!' }]);
    }, 2000);

    setTimeout(() => {
      setIsGlitching(false);
      setHistory(prev => [...prev, { type: 'output', content: 'Just kidding! Don\'t scare me like that.' }]);
      onUnlockAchievement('system_destroyer');
    }, 4000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];
        
        // Resolve path to directory to search in
        let searchPath = currentPath;
        let searchPrefix = lastPart;
        
        if (lastPart.includes('/')) {
            const pathParts = lastPart.split('/');
            searchPrefix = pathParts.pop() || '';
            const dirPart = pathParts.join('/');
            searchPath = resolvePath(dirPart);
        }

        const node = getNode(searchPath);
        if (node && node.children) {
            const matches = Object.keys(node.children).filter(name => name.startsWith(searchPrefix));
            if (matches.length === 1) {
                const completed = matches[0];
                const newInput = parts.slice(0, -1).join(' ') + (parts.length > 1 ? ' ' : '') + 
                                 (lastPart.includes('/') ? lastPart.substring(0, lastPart.lastIndexOf('/') + 1) : '') + 
                                 completed + (node.children[completed].type === 'directory' ? '/' : '');
                setInput(newInput);
            } else if (matches.length > 1) {
                setHistory(prev => [...prev, 
                    { type: 'input', content: input },
                    { type: 'output', content: matches.join('  ') }
                ]);
            }
        }
    }
  };
  
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
      if (e.ctrlKey) {
          if (e.key === 'o') {
              e.preventDefault();
              saveFile();
          } else if (e.key === 'x') {
              e.preventDefault();
              setIsEditorOpen(false);
              setEditorFilePath(null);
              setEditorContent('');
          }
      }
  };

  // --- Render ---

  if (isEditorOpen) {
      return (
        <div className="h-full w-full bg-black text-gray-200 font-mono flex flex-col" onKeyDown={handleEditorKeyDown} tabIndex={0}>
            <div className="bg-gray-800 text-white px-2 py-1 flex justify-between items-center">
                <span>GNU nano 7.2</span>
                <span>{editorFilePath}</span>
                <span>Modified</span>
            </div>
            <textarea 
                ref={editorRef}
                className="flex-1 bg-black text-white p-2 border-none outline-none resize-none font-mono"
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                onKeyDown={handleEditorKeyDown}
            />
            <div className="bg-gray-800 text-white px-2 py-1 grid grid-cols-2 gap-4 text-xs">
                <div className="flex gap-2 cursor-pointer hover:bg-gray-700 px-1 rounded" onClick={saveFile}>
                    <span className="font-bold">^O</span> Write Out
                </div>
                <div className="flex gap-2 cursor-pointer hover:bg-gray-700 px-1 rounded" onClick={() => setIsEditorOpen(false)}>
                    <span className="font-bold">^X</span> Exit
                </div>
            </div>
        </div>
      );
  }

  return (
    <div 
      className={`h-full w-full bg-black text-green-500 font-mono p-4 overflow-hidden flex flex-col ${isGlitching ? 'animate-pulse' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {history.map((item, i) => (
          <div key={i} className={`mb-1 ${item.type === 'error' ? 'text-red-500' : item.type === 'input' ? 'text-white' : 'text-green-500'}`}>
            {item.type === 'input' ? (
              <span>
                <span className="text-blue-400">guest@amin-os</span>:<span className="text-blue-300">/{currentPath.slice(2).join('/')}</span>$ {item.content}
              </span>
            ) : (
              <pre className="whitespace-pre-wrap font-mono">{item.content}</pre>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center mt-2">
        <span className="text-blue-400">guest@amin-os</span>:<span className="text-blue-300">/{currentPath.slice(2).join('/')}</span>$&nbsp;
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none flex-1 text-white font-mono"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
};
