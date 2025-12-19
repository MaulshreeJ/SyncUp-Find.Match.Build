import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Loader2,
  ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { getConversations, getMessages, sendMessage } from '@/api/messages';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get('user');
  
  console.log('🟢 Messages component loaded');
  console.log('🟢 URL search params:', searchParams.toString());
  console.log('🟢 Selected user ID from URL:', selectedUserId);
  console.log('🟢 Current user:', user);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    // Initialize Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('💬 Connected to messages');
      socketRef.current.emit('joinDirectMessage', { userId: user._id });
    });

    // Listen for new direct messages
    socketRef.current.on('directMessage', ({ message, senderId, senderName, timestamp }) => {
      console.log('📥 Received direct message from:', senderName);
      
      const newMessage = {
        senderId,
        message,
        timestamp: new Date(timestamp),
        read: false
      };

      // If this is the active conversation, add message
      if (selectedConversation && selectedConversation.participant._id === senderId) {
        setMessages(prev => [...prev, newMessage]);
      }

      // Update conversations list
      loadConversations();
    });

    loadConversations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    const initializeConversation = async () => {
      console.log('🔍 Initializing conversation, selectedUserId:', selectedUserId);
      console.log('🔍 Conversations:', conversations);
      
      if (!selectedUserId) {
        console.log('⚠️ No selectedUserId');
        return;
      }

      // Try to find existing conversation
      const conv = conversations.find(c => c.participant._id === selectedUserId);
      if (conv) {
        console.log('✅ Found existing conversation:', conv);
        handleSelectConversation(conv);
      } else if (selectedUserId) {
        console.log('📝 Creating new conversation for user:', selectedUserId);
        // Create a new conversation placeholder
        // We need to fetch the user details first
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${selectedUserId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('syncup_token') || localStorage.getItem('token')}`
            }
          });
          const userData = await response.json();
          console.log('✅ Fetched user data:', userData);
          
          // Create a temporary conversation object
          const newConv = {
            conversationId: `temp_${selectedUserId}`,
            participant: {
              _id: selectedUserId,
              name: userData.name || 'User',
              email: userData.email || '',
              avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserId}`
            },
            lastMessage: null,
            unreadCount: 0,
            lastMessageAt: new Date()
          };
          
          console.log('✅ Setting selected conversation:', newConv);
          setSelectedConversation(newConv);
          setMessages([]);
        } catch (error) {
          console.error('❌ Failed to fetch user details:', error);
        }
      }
    };

    initializeConversation();
  }, [selectedUserId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const msgs = await getMessages(conversation.participant._id);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const response = await sendMessage(selectedConversation.participant._id, inputMessage);
      
      const newMessage = response.data;
      setMessages(prev => [...prev, newMessage]);

      // Broadcast via Socket.IO
      if (socketRef.current) {
        socketRef.current.emit('directMessage', {
          receiverId: selectedConversation.participant._id,
          message: newMessage.message,
          senderId: user._id,
          senderName: user.name,
          timestamp: newMessage.timestamp
        });
      }

      setInputMessage('');
      loadConversations(); // Refresh to update last message
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
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Messages - SyncUp</title>
      </Helmet>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-400" />
              Messages
            </h1>
          </motion.div>

          <div className="glass-card rounded-2xl overflow-hidden h-[calc(100vh-200px)] flex">
            {/* Conversations List */}
            <div className="w-80 border-r border-white/10 flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                    <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Connect with users to start chatting!</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.conversationId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                        selectedConversation?.participant._id === conv.participant._id
                          ? 'bg-white/10'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage 
                            src={conv.participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(conv.participant.email)}`} 
                          />
                          <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium truncate">{conv.participant.name}</p>
                            {conv.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm truncate">
                            {conv.lastMessage?.message || 'No messages yet'}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatTime(conv.lastMessageAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar>
                      <AvatarImage 
                        src={selectedConversation.participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedConversation.participant.email)}`} 
                      />
                      <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{selectedConversation.participant.name}</p>
                      <p className="text-gray-400 text-sm">{selectedConversation.participant.email}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isCurrentUser = msg.senderId.toString() === user._id;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] p-3 rounded-2xl ${
                              isCurrentUser 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/10 text-white'
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                              }`}>
                                {formatTime(msg.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef}></div>
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="bg-white/5 border-white/10"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sending || !inputMessage.trim()}
                        className="glass-button"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
