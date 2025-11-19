import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Save } from 'lucide-react';
import { FileSystemNode, FileType } from '../utils/filesystem';

interface TerminalProps {
  onClose: () => void;
  onUnlockAchievement: (id: string) => void;
  fileSystem: FileSystemNode;
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystemNode>>;
}

interface HistoryItem {
  type: 'input' | 'output' | 'error';
  content: string;
}

type EditorType = 'nano' | 'vim';
type VimMode = 'NORMAL' | 'INSERT' | 'COMMAND';



export const Terminal: React.FC<TerminalProps> = ({ onClose, onUnlockAchievement, fileSystem, setFileSystem }) => {
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'output', content: 'AminOS v1.0.0' },
    { type: 'output', content: 'Type "help" for a list of commands.' },
  ]);
  const [input, setInput] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>(['home', 'guest']);
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<EditorType>('nano');
  const [editorContent, setEditorContent] = useState('');
  const [editorFilePath, setEditorFilePath] = useState<string | null>(null);
  
  // Vim State
  const [vimMode, setVimMode] = useState<VimMode>('NORMAL');
  const [vimCommand, setVimCommand] = useState('');
  const [vimStatusMsg, setVimStatusMsg] = useState('');

  const [cursorPos, setCursorPos] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

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
            setHistory(prev => [...prev, { type: 'error', content: `${command}: ${args[0]}: Is a directory` }]);
        } else {
            setEditorType(command as EditorType);
            setEditorFilePath(args[0]); // Store original arg for display
            setEditorContent(editNode?.content || '');
            setIsEditorOpen(true);
            if (command === 'vim') {
                setVimMode('NORMAL');
                setVimCommand('');
                setVimStatusMsg(`"${args[0]}" ${editNode ? '' : '[New File]'}`);
            }
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

  const saveFile = (shouldClose: boolean = true) => {
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
      if (shouldClose) {
          setIsEditorOpen(false);
          setEditorFilePath(null);
          setEditorContent('');
      }
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
      e.stopPropagation();
      if (editorType === 'nano') {
          if (e.ctrlKey) {
              if (e.key === 'o') {
                  e.preventDefault();
                  saveFile(false);
              } else if (e.key === 'x') {
                  e.preventDefault();
                  setIsEditorOpen(false);
                  setEditorFilePath(null);
                  setEditorContent('');
              }
          }
      } else if (editorType === 'vim') {
          if (vimMode === 'NORMAL') {
              if (e.key === 'i') {
                  e.preventDefault();
                  setVimMode('INSERT');
                  setVimStatusMsg('-- INSERT --');
              } else if (e.key === ':') {
                  e.preventDefault();
                  setVimMode('COMMAND');
                  setVimCommand(':');
              } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setVimStatusMsg('');
              } else if (['h', 'j', 'k', 'l'].includes(e.key)) {
                  e.preventDefault();
                  const textarea = editorRef.current;
                  if (!textarea) return;
                  
                  const start = textarea.selectionStart;
                  const value = textarea.value;
                  const width = textarea.cols || 80; // Approximation if cols not set, but for textarea usually we rely on newlines
                  
                  let newPos = start;

                  if (e.key === 'h') {
                      if (start > 0) {
                          newPos = start - 1;
                      }
                  } else if (e.key === 'l') {
                      if (start < value.length) {
                          newPos = start + 1;
                      }
                  } else if (e.key === 'j' || e.key === 'k') {
                      // Simple vertical navigation approximation
                      // Find current line start and column
                      let lineStart = value.lastIndexOf('\n', start - 1) + 1;
                      let lineEnd = value.indexOf('\n', start);
                      if (lineEnd === -1) lineEnd = value.length;
                      const col = start - lineStart;
                      
                      if (e.key === 'j') {
                          // Move down
                          const nextLineStart = lineEnd + 1;
                          if (nextLineStart < value.length) {
                              let nextLineEnd = value.indexOf('\n', nextLineStart);
                              if (nextLineEnd === -1) nextLineEnd = value.length;
                              const nextLineLength = nextLineEnd - nextLineStart;
                              newPos = nextLineStart + Math.min(col, nextLineLength);
                          }
                      } else if (e.key === 'k') {
                          // Move up
                          if (lineStart > 0) {
                              const prevLineEnd = lineStart - 1;
                              const prevLineStart = value.lastIndexOf('\n', prevLineEnd - 1) + 1;
                              const prevLineLength = prevLineEnd - prevLineStart;
                              newPos = prevLineStart + Math.min(col, prevLineLength);
                          }
                      }
                  }
                  textarea.setSelectionRange(newPos, newPos);
                  setCursorPos(newPos);
              }
          } else if (vimMode === 'INSERT') {
              if (e.key === 'Escape') {
                  e.preventDefault();
                  setVimMode('NORMAL');
                  setVimStatusMsg('');
              }
          } else if (vimMode === 'COMMAND') {
              if (e.key === 'Enter') {
                  e.preventDefault();
                  const cmd = vimCommand.substring(1); // remove :
                  if (cmd === 'w') {
                      saveFile(false);
                      setVimMode('NORMAL');
                      setVimStatusMsg(`"${editorFilePath}" written`);
                  } else if (cmd === 'q') {
                      setIsEditorOpen(false);
                      setEditorFilePath(null);
                      setEditorContent('');
                  } else if (cmd === 'wq') {
                      saveFile(true);
                  } else {
                      setVimMode('NORMAL');
                      setVimStatusMsg(`E492: Not an editor command: ${cmd}`);
                  }
                  setVimCommand('');
              } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setVimMode('NORMAL');
                  setVimCommand('');
                  setVimStatusMsg('');
              } else if (e.key === 'Backspace') {
                  if (vimCommand.length <= 1) {
                      setVimMode('NORMAL');
                      setVimCommand('');
                  } else {
                      setVimCommand(prev => prev.slice(0, -1));
                  }
              } else if (e.key.length === 1) {
                  e.preventDefault();
                  setVimCommand(prev => prev + e.key);
              }
          }
      }
  };

  // --- Render ---

  if (isEditorOpen) {
      if (editorType === 'nano') {
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
                <div className="flex gap-2 cursor-pointer hover:bg-gray-700 px-1 rounded" onClick={() => saveFile(false)}>
                    <span className="font-bold">^O</span> Write Out
                </div>
                    <div className="flex gap-2 cursor-pointer hover:bg-gray-700 px-1 rounded" onClick={() => setIsEditorOpen(false)}>
                        <span className="font-bold">^X</span> Exit
                    </div>
                </div>
            </div>
        );
      } else {
          // Vim Render
          const beforeCursor = editorContent.slice(0, cursorPos);
          const cursorChar = editorContent.slice(cursorPos, cursorPos + 1) || ' ';
          const afterCursor = editorContent.slice(cursorPos + 1);

          return (
            <div className="h-full w-full bg-black text-gray-200 font-mono flex flex-col" onKeyDown={handleEditorKeyDown} tabIndex={0}>
                <div className="flex-1 flex relative overflow-hidden">
                    <div className="w-8 text-blue-500 select-none pt-2 pl-2 bg-black z-10">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i}>~</div>
                        ))}
                    </div>
                    
                    <div className="flex-1 relative">
                        {/* Overlay for custom rendering */}
                        <div 
                            ref={overlayRef}
                            className="absolute inset-0 p-2 whitespace-pre-wrap break-all pointer-events-none font-mono text-transparent"
                            style={{ fontFamily: 'monospace' }}
                        >
                            <span className="text-gray-200">{beforeCursor}</span>
                            <span className={`${vimMode === 'NORMAL' ? 'bg-green-500 text-black' : 'bg-white text-black'} inline-block`}>
                                {cursorChar === '\n' ? ' ' : cursorChar}
                            </span>
                            {cursorChar === '\n' && <br />}
                            <span className="text-gray-200">{afterCursor}</span>
                        </div>

                        {/* Actual textarea for input */}
                        <textarea 
                            ref={editorRef}
                            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent p-2 border-none outline-none resize-none font-mono"
                            style={{ fontFamily: 'monospace' }}
                            value={editorContent}
                            onChange={(e) => {
                                if (vimMode === 'INSERT') {
                                    setEditorContent(e.target.value);
                                    setCursorPos(e.target.selectionStart);
                                }
                            }}
                            onSelect={(e) => {
                                setCursorPos(e.currentTarget.selectionStart);
                            }}
                            onScroll={(e) => {
                                if (overlayRef.current) {
                                    overlayRef.current.scrollTop = e.currentTarget.scrollTop;
                                }
                            }}
                            onKeyDown={handleEditorKeyDown}
                            readOnly={vimMode !== 'INSERT'}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="bg-gray-900 text-white px-2 py-1 text-sm font-bold border-t border-gray-700 flex justify-between">
                    <span>{vimMode === 'COMMAND' ? vimCommand : vimStatusMsg}</span>
                    <span>{vimMode}</span>
                </div>
            </div>
          );
      }
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
