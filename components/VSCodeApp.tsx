import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FileSystemNode, FileType } from '../utils/filesystem';
import { 
  Files, Search, GitBranch, Bug, MonitorPlay, Settings, 
  ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, X, Circle,
  FilePlus, FolderPlus, Trash2
} from 'lucide-react';

interface VSCodeAppProps {
  fileSystem: FileSystemNode;
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystemNode>>;
}

interface OpenFile {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
}

export const VSCodeApp: React.FC<VSCodeAppProps> = ({ fileSystem, setFileSystem }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'root/home', 'root/home/guest']));
  const [selectedNodePath, setSelectedNodePath] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, path: string, type: 'file' | 'directory' } | null>(null);

  // --- File System Helpers ---

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

  const updateFileContent = (pathStr: string, newContent: string) => {
      const path = pathStr.split('/').filter(p => p !== 'root');
      const parentPath = path.slice(0, -1);
      const fileName = path[path.length - 1];
      
      // Create a deep copy to avoid mutation
      const newFS = JSON.parse(JSON.stringify(fileSystem));
      const parentNode = getNode(parentPath, newFS);

      if (parentNode && parentNode.children) {
          parentNode.children[fileName] = { 
              ...parentNode.children[fileName], 
              content: newContent 
          };
          setFileSystem(newFS);
      }
  };


  const getParentPath = (path: string): string[] => {
      const parts = path.split('/').filter(p => p !== 'root');
      return parts.slice(0, -1);
  };

  const createFile = (name: string, targetPathStr?: string) => {
      const targetPath = targetPathStr || selectedNodePath || 'root/home/guest';
      const pathParts = targetPath.split('/').filter(p => p !== 'root');
      
      const newFS = JSON.parse(JSON.stringify(fileSystem));
      
      // If target is a file, add to its parent. If directory, add to it.
      // But for context menu on a file, we usually want to add to its parent.
      // For context menu on a directory, add to the directory.
      // We need to check the type of the target path node.
      
      let parentPath = pathParts;
      const targetNode = getNode(pathParts, newFS);
      
      if (targetNode && targetNode.type === 'file') {
          parentPath = pathParts.slice(0, -1);
      }
      
      const parentNode = getNode(parentPath, newFS);
      if (parentNode && parentNode.children) {
          parentNode.children[name] = { name, type: 'file', content: '' };
          setFileSystem(newFS);
      }
  };

  const createFolder = (name: string, targetPathStr?: string) => {
      const targetPath = targetPathStr || selectedNodePath || 'root/home/guest';
      const pathParts = targetPath.split('/').filter(p => p !== 'root');
      
      const newFS = JSON.parse(JSON.stringify(fileSystem));
      
      let parentPath = pathParts;
      const targetNode = getNode(pathParts, newFS);
      
      if (targetNode && targetNode.type === 'file') {
          parentPath = pathParts.slice(0, -1);
      }
      
      const parentNode = getNode(parentPath, newFS);
      if (parentNode && parentNode.children) {
          parentNode.children[name] = { name, type: 'directory', children: {} };
          setFileSystem(newFS);
      }
  };

  const deleteNode = (targetPathStr?: string) => {
      const target = targetPathStr || selectedNodePath;
      if (!target || target === 'root') return;
      
      const pathParts = target.split('/').filter(p => p !== 'root');
      const parentPath = pathParts.slice(0, -1);
      const nodeName = pathParts[pathParts.length - 1];
      
      const newFS = JSON.parse(JSON.stringify(fileSystem));
      const parentNode = getNode(parentPath, newFS);
      
      if (parentNode && parentNode.children) {
          delete parentNode.children[nodeName];
          setFileSystem(newFS);
          if (selectedNodePath === target) setSelectedNodePath(null);
          // Close if open
          if (openFiles.find(f => f.path === target)) {
              setOpenFiles(prev => prev.filter(f => f.path !== target));
              if (activeFile === target) setActiveFile(null);
          }
      }
  };

  // --- Actions ---

  const toggleFolder = (path: string) => {
      const newExpanded = new Set(expandedFolders);
      if (newExpanded.has(path)) {
          newExpanded.delete(path);
      } else {
          newExpanded.add(path);
      }
      setExpandedFolders(newExpanded);
  };

  const openFile = (path: string, name: string, content: string) => {
      if (!openFiles.find(f => f.path === path)) {
          setOpenFiles([...openFiles, { path, name, content, isDirty: false }]);
      }
      setActiveFile(path);
  };

  const closeFile = (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      const newFiles = openFiles.filter(f => f.path !== path);
      setOpenFiles(newFiles);
      if (activeFile === path) {
          setActiveFile(newFiles.length > 0 ? newFiles[newFiles.length - 1].path : null);
      }
  };

  const handleEditorChange = (value: string | undefined) => {
      if (value === undefined || !activeFile) return;

      // Update open file state
      setOpenFiles(prev => prev.map(f => 
          f.path === activeFile ? { ...f, content: value, isDirty: true } : f
      ));

      // Auto-save to file system (VS Code style)
      updateFileContent(activeFile, value);
  };

  // Context Menu Handlers
  useEffect(() => {
      const handleClick = () => setContextMenu(null);
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, path: string, type: 'file' | 'directory') => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, path, type });
      setSelectedNodePath(path);
  };

  // Ctrl+S Handler
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              if (activeFile) {
                  const file = openFiles.find(f => f.path === activeFile);
                  if (file) {
                      updateFileContent(activeFile, file.content);
                      setOpenFiles(prev => prev.map(f => f.path === activeFile ? { ...f, isDirty: false } : f));
                  }
              }
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, openFiles]);

  // C Linting
  const handleValidate = (markers: any[]) => {
      // This is where we'd get default markers. 
      // For C, we'll add our own simple checks if the file is .c
      if (activeFile?.endsWith('.c') && activeFileObj) {
          const code = activeFileObj.content;
          const lines = code.split('\n');
          const newMarkers = [...markers];
          
          lines.forEach((line, i) => {
              const trimmed = line.trim();
              if (trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.includes('if') && !trimmed.includes('for') && !trimmed.includes('while')) {
                  newMarkers.push({
                      startLineNumber: i + 1,
                      startColumn: 1,
                      endLineNumber: i + 1,
                      endColumn: line.length + 1,
                      message: "Expected ';'",
                      severity: 8 // Error
                  });
              }
          });
          // Note: We can't easily set markers back to Monaco from here without the instance.
          // But Monaco's onValidate gives us markers. We'd need the editor instance to setModelMarkers.
          // For simplicity in this 'react' wrapper, we might just rely on the fact that we can't easily inject custom markers 
          // without a ref to the editor instance or monaco instance.
          // Let's use the `onMount` prop to get the monaco instance.
      }
  };

  const handleEditorMount = (editor: any, monaco: any) => {
      // Register C language IntelliSense
      monaco.languages.registerCompletionItemProvider('c', {
          provideCompletionItems: (model: any, position: any) => {
              const suggestions = [
                  // C Keywords
                  ...['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
                      'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
                      'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
                      'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while'
                  ].map(keyword => ({
                      label: keyword,
                      kind: monaco.languages.CompletionItemKind.Keyword,
                      insertText: keyword,
                      detail: 'C keyword'
                  })),
                  
                  // Common C Library Functions
                  ...[
                      { label: 'printf', snippet: 'printf("$1", $2);', detail: 'Print formatted output' },
                      { label: 'scanf', snippet: 'scanf("$1", &$2);', detail: 'Read formatted input' },
                      { label: 'fgets', snippet: 'fgets($1, $2, stdin);', detail: 'Read string from stdin' },
                      { label: 'malloc', snippet: 'malloc($1)', detail: 'Allocate memory' },
                      { label: 'free', snippet: 'free($1);', detail: 'Free allocated memory' },
                      { label: 'strcpy', snippet: 'strcpy($1, $2);', detail: 'Copy string' },
                      { label: 'strlen', snippet: 'strlen($1)', detail: 'Get string length' },
                      { label: 'strcmp', snippet: 'strcmp($1, $2)', detail: 'Compare strings' },
                      { label: 'strcspn', snippet: 'strcspn($1, "$2")', detail: 'Get span until character in string' },
                      { label: 'strcat', snippet: 'strcat($1, $2);', detail: 'Concatenate strings' },
                      { label: 'atoi', snippet: 'atoi($1)', detail: 'Convert string to integer' },
                      { label: 'exit', snippet: 'exit($1);', detail: 'Exit program' }
                  ].map(func => ({
                      label: func.label,
                      kind: monaco.languages.CompletionItemKind.Function,
                      insertText: func.snippet,
                      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      detail: func.detail
                  })),
                  
                  // Data Types
                  ...['int', 'char', 'float', 'double', 'void', 'long', 'short', 'unsigned', 'signed'].map(type => ({
                      label: type,
                      kind: monaco.languages.CompletionItemKind.TypeParameter,
                      insertText: type,
                      detail: 'C data type'
                  })),
                  
                  // Preprocessor Directives
                  ...[
                      { label: '#include', snippet: '#include <$1>', detail: 'Include header file' },
                      { label: '#define', snippet: '#define $1 $2', detail: 'Define macro' },
                      { label: '#ifdef', snippet: '#ifdef $1\n$2\n#endif', detail: 'Conditional compilation' },
                      { label: '#ifndef', snippet: '#ifndef $1\n$2\n#endif', detail: 'Conditional compilation' },
                      { label: '#endif', snippet: '#endif', detail: 'End conditional' }
                  ].map(directive => ({
                      label: directive.label,
                      kind: monaco.languages.CompletionItemKind.Keyword,
                      insertText: directive.snippet,
                      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      detail: directive.detail
                  }))
              ];
              
              return { suggestions };
          }
      });

      // C Linting
      editor.onDidChangeModelContent(() => {
          if (activeFile?.endsWith('.c')) {
              const model = editor.getModel();
              const value = model.getValue();
              const markers: any[] = [];
              
              const lines = value.split('\n');
              lines.forEach((line: string, i: number) => {
                  const trimmed = line.trim();
                  if (trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.includes('if') && !trimmed.includes('for') && !trimmed.includes('while') && !trimmed.includes('else')) {
                      markers.push({
                          startLineNumber: i + 1,
                          startColumn: 1,
                          endLineNumber: i + 1,
                          endColumn: line.length + 1,
                          message: "Expected ';'",
                          severity: monaco.MarkerSeverity.Error
                      });
                  }
              });
              monaco.editor.setModelMarkers(model, 'c-linter', markers);
          }
      });
  };

  // --- Render Helpers ---

  const renderTree = (node: FileSystemNode, path: string = 'root', depth: number = 0) => {
      if (node.type === 'file') {
          return (
              <div 
                  key={path} 
                  className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] ${activeFile === path ? 'bg-[#37373d] text-white' : selectedNodePath === path ? 'bg-[#2a2d2e] text-white' : 'text-[#cccccc]'}`}
                  style={{ paddingLeft: `${depth * 12 + 10}px` }}
                  onClick={(e) => {
                      e.stopPropagation();
                      openFile(path, node.name, node.content || '');
                      setSelectedNodePath(path);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, path, 'file')}
              >
                  <FileCode size={14} className="text-[#519aba] shrink-0" />
                  <span className="truncate text-sm">{node.name}</span>
              </div>
          );
      }

      const isExpanded = expandedFolders.has(path);
      const children = node.children ? Object.entries(node.children) : [];
      
      return (
          <div key={path}>
              <div 
                  className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] ${selectedNodePath === path ? 'bg-[#2a2d2e] text-white' : 'text-[#cccccc]'}`}
                  style={{ paddingLeft: `${depth * 12 + 10}px` }}
                  onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(path);
                      setSelectedNodePath(path);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, path, 'directory')}
              >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {isExpanded ? <FolderOpen size={14} className="text-[#dcb67a] shrink-0" /> : <Folder size={14} className="text-[#dcb67a] shrink-0" />}
                  <span className="truncate text-sm font-bold">{node.name}</span>
              </div>
              {isExpanded && children.map(([name, child]) => renderTree(child, `${path}/${name}`, depth + 1))}
          </div>
      );
  };

  const activeFileObj = openFiles.find(f => f.path === activeFile);

  return (
    <div className="flex h-full w-full bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-4 shrink-0">
          <div className="p-2 border-l-2 border-white cursor-pointer"><Files size={24} className="text-white" /></div>
          <div className="p-2 border-l-2 border-transparent opacity-50 hover:opacity-100 cursor-pointer"><Search size={24} /></div>
          <div className="p-2 border-l-2 border-transparent opacity-50 hover:opacity-100 cursor-pointer"><GitBranch size={24} /></div>
          <div className="p-2 border-l-2 border-transparent opacity-50 hover:opacity-100 cursor-pointer"><Bug size={24} /></div>
          <div className="p-2 border-l-2 border-transparent opacity-50 hover:opacity-100 cursor-pointer"><MonitorPlay size={24} /></div>
          <div className="mt-auto p-2 opacity-50 hover:opacity-100 cursor-pointer"><Settings size={24} /></div>
      </div>

      {/* Sidebar */}
      <div className="w-60 bg-[#252526] flex flex-col border-r border-[#1e1e1e] shrink-0">
          <div className="p-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center group">
              <span>Explorer</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FilePlus size={14} className="cursor-pointer hover:text-white" onClick={() => {
                      const name = prompt('File name:');
                      if (name) createFile(name);
                  }} />
                  <FolderPlus size={14} className="cursor-pointer hover:text-white" onClick={() => {
                      const name = prompt('Folder name:');
                      if (name) createFolder(name);
                  }} />
                  <Trash2 size={14} className="cursor-pointer hover:text-white" onClick={() => {
                      if (confirm('Delete selected?')) deleteNode();
                  }} />
              </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="py-2">
                  <div className="px-4 text-xs font-bold uppercase mb-1 flex items-center gap-1 cursor-pointer" onClick={() => toggleFolder('root')}>
                      <ChevronDown size={12} /> AMIN-OS
                  </div>
                  {renderTree(fileSystem)}
              </div>
          </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          {/* Tabs */}
          <div className="flex bg-[#252526] overflow-x-auto custom-scrollbar">
              {openFiles.map(file => (
                  <div 
                      key={file.path}
                      className={`flex items-center gap-2 px-3 py-2 text-sm border-r border-[#1e1e1e] cursor-pointer min-w-[120px] max-w-[200px] group ${activeFile === file.path ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]' : 'bg-[#2d2d2d] text-[#969696]'}`}
                      onClick={() => setActiveFile(file.path)}
                  >
                      <FileCode size={14} className={activeFile === file.path ? 'text-[#519aba]' : 'text-gray-500'} />
                      <span className="truncate flex-1">{file.name}</span>
                      {file.isDirty && <Circle size={8} className="fill-white text-white" />}
                      <X 
                          size={14} 
                          className={`opacity-0 group-hover:opacity-100 hover:bg-[#4e4e4e] rounded p-0.5 ${file.isDirty ? 'hidden' : ''}`} 
                          onClick={(e) => closeFile(e, file.path)}
                      />
                  </div>
              ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative" onMouseDown={(e) => e.stopPropagation()}>
              {activeFileObj ? (
                  <Editor
                      height="100%"
                      defaultLanguage={activeFileObj.path.endsWith('.c') ? 'c' : activeFileObj.path.endsWith('.ts') || activeFileObj.path.endsWith('.tsx') ? 'typescript' : activeFileObj.path.endsWith('.js') ? 'javascript' : 'plaintext'}
                      path={activeFileObj.path} // Helps Monaco with model caching
                      value={activeFileObj.content}
                      theme="vs-dark"
                      onChange={handleEditorChange}
                      options={{
                          minimap: { enabled: true },
                          fontSize: 14,
                          wordWrap: 'on',
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                          suggestOnTriggerCharacters: true,
                          quickSuggestions: true,
                      }}
                      onMount={handleEditorMount}
                  />
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#3b3b3b]">
                      <div className="mb-4 opacity-20"><Files size={120} /></div>
                      <div className="text-sm">Select a file to edit</div>
                      <div className="text-xs mt-2">Cmd+P to search files</div>
                  </div>
              )}
          </div>
          
          {/* Status Bar */}
          <div className="h-6 bg-[#007acc] text-white text-xs flex items-center px-3 justify-between shrink-0">
              <div className="flex gap-4">
                  <div className="flex items-center gap-1"><GitBranch size={10} /> main*</div>
                  <div className="flex items-center gap-1"><Circle size={10} className="fill-white" /> 0 errors</div>
              </div>
              <div className="flex gap-4">
                  {activeFileObj && (
                      <>
                          <span>Ln 1, Col 1</span>
                          <span>UTF-8</span>
                          <span>TypeScript JSX</span>
                      </>
                  )}
                  <div className="hover:bg-white/20 px-1 cursor-pointer"><MonitorPlay size={12} /></div>
              </div>
          </div>

      </div>

      {/* Context Menu */}
      {contextMenu && (
          <div 
              className="fixed bg-[#252526] border border-[#454545] shadow-xl rounded py-1 z-50 min-w-[160px]"
              style={{ top: contextMenu.y, left: contextMenu.x }}
          >
              <div 
                  className="px-4 py-1 hover:bg-[#094771] hover:text-white cursor-pointer text-sm flex items-center gap-2"
                  onClick={() => {
                      const name = prompt('File name:');
                      if (name) createFile(name, contextMenu.path);
                  }}
              >
                  <FilePlus size={14} /> New File
              </div>
              <div 
                  className="px-4 py-1 hover:bg-[#094771] hover:text-white cursor-pointer text-sm flex items-center gap-2"
                  onClick={() => {
                      const name = prompt('Folder name:');
                      if (name) createFolder(name, contextMenu.path);
                  }}
              >
                  <FolderPlus size={14} /> New Folder
              </div>
              <div className="h-[1px] bg-[#454545] my-1" />
              <div 
                  className="px-4 py-1 hover:bg-[#094771] hover:text-white cursor-pointer text-sm flex items-center gap-2 text-red-400"
                  onClick={() => {
                      if (confirm('Delete selected?')) deleteNode(contextMenu.path);
                  }}
              >
                  <Trash2 size={14} /> Delete
              </div>
          </div>
      )}
    </div>
  );
};
