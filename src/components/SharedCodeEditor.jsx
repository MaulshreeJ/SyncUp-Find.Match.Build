import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Save, Users, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getProjectCode, saveProjectCode } from '@/api/projects';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SharedCodeEditor = ({ projectId }) => {
  const { user } = useAuth();
  const [code, setCode] = useState('// Loading...');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    if (!projectId || !user?._id) return;

    // Initialize Socket.IO connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      setConnected(true);
      socketRef.current.emit('joinProject', projectId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      setConnected(false);
    });

    // Listen for code updates from other users
    socketRef.current.on('codeUpdate', (newCode) => {
      console.log('📥 Received code update from another user');
      isRemoteChange.current = true;
      setCode(newCode);
    });

    // Load initial code from database
    loadCode();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectId, user]);

  const loadCode = async () => {
    try {
      setLoading(true);
      const savedCode = await getProjectCode(user._id, projectId);
      setCode(savedCode);
    } catch (error) {
      console.error('Failed to load code:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved code',
        variant: 'destructive',
      });
      setCode('// Start coding with your teammates!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    if (!value) return;

    // Update local state
    setCode(value);

    // If this is a remote change, don't broadcast it back
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    // Broadcast to other users in real-time
    if (socketRef.current && connected) {
      socketRef.current.emit('codeUpdate', {
        projectId,
        code: value,
      });
    }
  };

  const handleSaveCode = async () => {
    try {
      setSaving(true);
      await saveProjectCode(projectId, code);
      toast({
        title: 'Code Saved!',
        description: 'Your code has been saved successfully.',
      });
    } catch (error) {
      console.error('Failed to save code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save code',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-2xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-3 text-gray-400">Loading code editor...</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">Shared Code Space</h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <Button
          onClick={handleSaveCode}
          disabled={saving}
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
              Save Code
            </>
          )}
        </Button>
      </div>

      <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-white/10">
        <Editor
          height="60vh"
          theme="vs-dark"
          defaultLanguage="javascript"
          value={code}
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
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
        <Users className="h-4 w-4" />
        <span>
          Real-time collaboration enabled. Changes are synced instantly with your teammates.
        </span>
      </div>
    </div>
  );
};

export default SharedCodeEditor;
