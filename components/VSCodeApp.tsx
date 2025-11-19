import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FileSystemNode, FileType } from '../utils/filesystem';
import { 
  Files, Search, GitBranch, Bug, MonitorPlay, Settings, 
  ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, X, Circle
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

  // --- Render Helpers ---

  const renderTree = (node: FileSystemNode, path: string = 'root', depth: number = 0) => {
      if (node.type === 'file') {
          return (
              <div 
                  key={path} 
                  className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] ${activeFile === path ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'}`}
                  style={{ paddingLeft: `${depth * 12 + 10}px` }}
                  onClick={() => openFile(path, node.name, node.content || '')}
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
                  className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] text-[#cccccc]`}
                  style={{ paddingLeft: `${depth * 12 + 10}px` }}
                  onClick={() => toggleFolder(path)}
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
          <div className="p-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
              <span>Explorer</span>
              <span className="text-xs text-gray-500">...</span>
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
          <div className="flex-1 relative">
              {activeFileObj ? (
                  <Editor
                      height="100%"
                      defaultLanguage="typescript" // Simple default, could be dynamic
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
                      }}
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
    </div>
  );
};
