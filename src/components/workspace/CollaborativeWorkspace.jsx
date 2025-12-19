import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  Plus, 
  Trash2, 
  File, 
  Folder,
  X,
  Users,
  Loader2,
  FileCode,
  Download
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  getWorkspaceFiles,
  saveWorkspaceFile,
  deleteWorkspaceFile
} from '@/api/workspace';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CollaborativeWorkspace = ({ projectId }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState({});
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    if (!projectId || !user?._id) return;

    // Initialize Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to workspace', socketRef.current.id);
      setConnected(true);
      console.log('📤 Emitting joinWorkspace:', { projectId, userId: user._id, userName: user.name });
      socketRef.current.emit('joinWorkspace', {
        projectId,
        userId: user._id,
        userName: user.name
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from workspace');
      setConnected(false);
    });

    // Listen for file changes from other users
    socketRef.current.on('fileChange', ({ fileName, content, userId }) => {
      if (userId !== user._id) {
        console.log('📥 Received file change:', fileName);
        isRemoteChange.current = true;
        setFiles(prev => ({
          ...prev,
          [fileName]: {
            ...prev[fileName],
            content
          }
        }));
      }
    });

    // Listen for new files
    socketRef.current.on('fileCreated', ({ fileName, content }) => {
      console.log('📄 File created:', fileName);
      setFiles(prev => ({
        ...prev,
        [fileName]: {
          content,
          language: getLanguageFromFileName(fileName),
          lastModified: new Date().toISOString()
        }
      }));
    });

    // Listen for file deletions
    socketRef.current.on('fileDeleted', ({ fileName }) => {
      console.log('🗑️ File deleted:', fileName);
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fileName];
        return newFiles;
      });
      setOpenTabs(prev => prev.filter(tab => tab !== fileName));
      if (activeTab === fileName) {
        setActiveTab(openTabs[0] || null);
      }
    });

    // User joined/left
    socketRef.current.on('userJoined', ({ userId, userName }) => {
      console.log('👋 User joined:', userName);
      setActiveUsers(prev => [...prev, { userId, userName }]);
      toast({
        title: `${userName} joined the workspace`,
        duration: 2000
      });
    });

    socketRef.current.on('userLeft', ({ userId, userName }) => {
      console.log('👋 User left:', userName);
      setActiveUsers(prev => prev.filter(u => u.userId !== userId));
    });

    // Load initial files
    loadWorkspace();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectId, user]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading workspace for project:', projectId);
      const workspaceFiles = await getWorkspaceFiles(projectId);
      console.log('✅ Workspace files loaded:', workspaceFiles);
      setFiles(workspaceFiles);
      
      // Open first file by default
      const fileNames = Object.keys(workspaceFiles);
      if (fileNames.length > 0) {
        setActiveTab(fileNames[0]);
        setOpenTabs([fileNames[0]]);
      }
    } catch (error) {
      console.error('❌ Failed to load workspace:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load workspace files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    if (!activeTab || !value) return;

    // Update local state
    setFiles(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        content: value
      }
    }));

    // If this is a remote change, don't broadcast
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    // Broadcast to other users
    if (socketRef.current && connected) {
      console.log('📤 Emitting fileChange:', { projectId, fileName: activeTab, userId: user._id });
      socketRef.current.emit('fileChange', {
        projectId,
        fileName: activeTab,
        content: value,
        userId: user._id
      });
    } else {
      console.log('⚠️ Cannot emit fileChange - socket not connected:', { 
        hasSocket: !!socketRef.current, 
        connected 
      });
    }
  };

  const handleSaveFile = async () => {
    if (!activeTab) return;

    try {
      setSaving(true);
      const file = files[activeTab];
      await saveWorkspaceFile(projectId, activeTab, file.content, file.language);
      
      toast({
        title: 'File Saved!',
        description: `${activeTab} has been saved successfully.`
      });
    } catch (error) {
      console.error('Failed to save file:', error);
      toast({
        title: 'Error',
        description: 'Failed to save file',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    const fileName = newFileName.trim();
    
    if (files[fileName]) {
      toast({
        title: 'Error',
        description: 'File already exists',
        variant: 'destructive'
      });
      return;
    }

    const newFile = {
      content: `// ${fileName}\n`,
      language: getLanguageFromFileName(fileName),
      lastModified: new Date().toISOString()
    };

    setFiles(prev => ({
      ...prev,
      [fileName]: newFile
    }));

    setOpenTabs(prev => [...prev, fileName]);
    setActiveTab(fileName);
    setNewFileName('');
    setShowNewFileInput(false);

    // Broadcast file creation
    if (socketRef.current && connected) {
      console.log('📤 Emitting fileCreated:', { projectId, fileName });
      socketRef.current.emit('fileCreated', {
        projectId,
        fileName,
        content: newFile.content
      });
    } else {
      console.log('⚠️ Cannot emit fileCreated - socket not connected');
    }

    // Save to database
    try {
      await saveWorkspaceFile(projectId, fileName, newFile.content, newFile.language);
    } catch (error) {
      console.error('Failed to save new file:', error);
    }
  };

  const handleDeleteFile = async (fileName) => {
    if (!confirm(`Delete ${fileName}?`)) return;

    try {
      await deleteWorkspaceFile(projectId, fileName);
      
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fileName];
        return newFiles;
      });

      setOpenTabs(prev => prev.filter(tab => tab !== fileName));
      if (activeTab === fileName) {
        const remainingTabs = openTabs.filter(tab => tab !== fileName);
        setActiveTab(remainingTabs[0] || null);
      }

      // Broadcast deletion
      if (socketRef.current && connected) {
        console.log('📤 Emitting fileDeleted:', { projectId, fileName });
        socketRef.current.emit('fileDeleted', {
          projectId,
          fileName
        });
      } else {
        console.log('⚠️ Cannot emit fileDeleted - socket not connected');
      }

      toast({
        title: 'File Deleted',
        description: `${fileName} has been deleted.`
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive'
      });
    }
  };

  const openFile = (fileName) => {
    if (!openTabs.includes(fileName)) {
      setOpenTabs(prev => [...prev, fileName]);
    }
    setActiveTab(fileName);
  };

  const closeTab = (fileName, e) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(tab => tab !== fileName);
    setOpenTabs(newTabs);
    
    if (activeTab === fileName) {
      setActiveTab(newTabs[newTabs.length - 1] || null);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-2xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-3 text-gray-400">Loading workspace...</span>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <FileCode className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Collaborative Workspace</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-400 mr-4">
            <Users className="h-4 w-4" />
            <span>{activeUsers.length + 1} online</span>
          </div>
          <Button
            onClick={handleSaveFile}
            disabled={saving || !activeTab}
            size="sm"
            className="glass-button"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex h-[70vh]">
        {/* File Explorer Sidebar */}
        <div className="w-64 border-r border-white/10 bg-black/20 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase">Files</h4>
            <Button
              onClick={() => setShowNewFileInput(true)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showNewFileInput && (
            <div className="mb-3 flex gap-1">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                placeholder="filename.js"
                className="h-8 text-sm bg-white/5 border-white/10"
                autoFocus
              />
              <Button
                onClick={handleCreateFile}
                size="sm"
                className="h-8 px-2"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => {
                  setShowNewFileInput(false);
                  setNewFileName('');
                }}
                size="sm"
                variant="ghost"
                className="h-8 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="space-y-1">
            {Object.keys(files).map(fileName => (
              <div
                key={fileName}
                className={`flex items-center justify-between p-2 rounded cursor-pointer group ${
                  activeTab === fileName
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
                onClick={() => openFile(fileName)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{fileName}</span>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(fileName);
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex items-center gap-1 p-2 bg-black/20 border-b border-white/10 overflow-x-auto">
              {openTabs.map(fileName => (
                <div
                  key={fileName}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer ${
                    activeTab === fileName
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab(fileName)}
                >
                  <File className="h-3 w-3" />
                  <span className="text-sm">{fileName}</span>
                  <button
                    onClick={(e) => closeTab(fileName, e)}
                    className="hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 bg-[#1e1e1e]">
            {activeTab && files[activeTab] ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={files[activeTab].language}
                value={files[activeTab].content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <FileCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a file to start editing</p>
                  <p className="text-sm mt-2">or create a new file</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-white/10 bg-black/20 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>{activeTab || 'No file selected'}</span>
          {activeTab && files[activeTab] && (
            <span className="text-xs">
              {files[activeTab].language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3" />
          <span className="text-xs">
            Real-time collaboration • Changes sync instantly
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper function
function getLanguageFromFileName(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'shell',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  return languageMap[ext] || 'plaintext';
}

export default CollaborativeWorkspace;
