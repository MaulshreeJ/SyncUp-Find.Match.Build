import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getChatMessages, sendChatMessage } from '@/api/chat';
import { useParams } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatRoom = () => {
  const { teamId, projectId } = useParams();
  const hackathonId = teamId || projectId;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!hackathonId || !user?._id) return;

    // Initialize Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('💬 Connected to chat');
      setConnected(true);
      socketRef.current.emit('joinWorkspace', {
        projectId: hackathonId,
        userId: user._id,
        userName: user.name
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('💬 Disconnected from chat');
      setConnected(false);
    });

    // Listen for new messages from other users
    socketRef.current.on('chatMessage', ({ message, userId, userName, userAvatar, timestamp }) => {
      console.log('📥 Received chat message from:', userName);
      const newMessage = {
        _id: Date.now().toString(),
        userId,
        userName,
        userAvatar,
        message,
        timestamp: new Date(timestamp)
      };
      setMessages(prev => [...prev, newMessage]);
    });

    // Load initial messages
    loadMessages();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [hackathonId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const chatMessages = await getChatMessages(hackathonId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await sendChatMessage(hackathonId, inputMessage);
      
      // Add message to local state
      const newMessage = response.data;
      setMessages(prev => [...prev, newMessage]);

      // Broadcast to other users via Socket.IO
      if (socketRef.current && connected) {
        socketRef.current.emit('chatMessage', {
          projectId: hackathonId,
          message: newMessage.message,
          userId: newMessage.userId,
          userName: newMessage.userName,
          userAvatar: newMessage.userAvatar,
          timestamp: newMessage.timestamp
        });
      }

      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-3 text-gray-400">Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.userId === user._id;
            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}
              >
                {!isCurrentUser && (
                  <img 
                    src={message.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(message.userName)}`} 
                    alt={message.userName} 
                    className="w-8 h-8 rounded-full" 
                  />
                )}
                <div className={`p-4 rounded-2xl max-w-[70%] ${isCurrentUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  {!isCurrentUser && (
                    <p className="text-blue-400 text-xs font-semibold mb-1">{message.userName}</p>
                  )}
                  <p className="text-white text-sm">{message.message}</p>
                  <p className="text-gray-400 text-xs mt-2 text-right">{formatTime(message.timestamp)}</p>
                </div>
                {isCurrentUser && (
                  <User className="w-8 h-8 p-1.5 rounded-full bg-blue-500 text-white" />
                )}
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="p-6 border-t border-white/10">
        <div className="flex space-x-3">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={sending || !inputMessage.trim()}
            className="glass-button px-4 py-3"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;