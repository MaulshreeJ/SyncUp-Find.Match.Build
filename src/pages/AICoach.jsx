import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Send, Bot, User, Lightbulb, Target, Users, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { askCareerCoach, getProjectIdeas, getTeamStrategy, askMatcherAgent } from '@/api/ai';
import MessageRenderer from '@/components/ui/MessageRenderer';

const AICoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello${user?.name ? ' ' + user.name : ''}! I'm your AI hackathon coach. I'm here to help you with project ideas, team strategies, technical guidance, and winning tips. What would you like to work on today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI Coach.",
        variant: "destructive"
      });
    }
  }, [user]);

  const quickTips = [
    {
      icon: Lightbulb,
      title: "Project Ideas",
      description: "Get innovative project suggestions based on current trends and your skills."
    },
    {
      icon: Target,
      title: "Strategy Planning",
      description: "Learn winning strategies for time management and project execution."
    },
    {
      icon: Users,
      title: "Team Dynamics",
      description: "Tips for effective collaboration and role distribution in your team."
    },
    {
      icon: Code,
      title: "Technical Guidance",
      description: "Get advice on technology choices and implementation approaches."
    }
  ];

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Add user message showing file upload
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `📄 Uploaded resume: ${file.name}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);

    try {
      let resumeText = "";
      
      // Handle different file types (like Streamlit)
      if (file.type === "text/plain" || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        // Text file
        const reader = new FileReader();
        reader.onload = async (e) => {
          resumeText = e.target.result;
          await analyzeResumeText(resumeText, file.name);
        };
        reader.readAsText(file);
      } else if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
        // PDF file - AUTOMATIC EXTRACTION like Streamlit!
        try {
          toast({
            title: "Extracting PDF...",
            description: "Reading text from your PDF file",
          });

          // Call Python service to extract PDF text
          const { extractPdfText } = await import('@/api/ai');
          const extractionResult = await extractPdfText(file);
          
          if (extractionResult.success && extractionResult.text) {
            resumeText = extractionResult.text;
            
            // Show extraction success
            const extractionMessage = {
              id: Date.now() + 1,
              type: 'ai',
              content: `✅ Successfully extracted text from PDF (${extractionResult.page_count} pages, ${extractionResult.text.length} characters). Analyzing now...`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, extractionMessage]);
            
            // Analyze the extracted text
            await analyzeResumeText(resumeText, file.name);
          } else {
            throw new Error("No text extracted from PDF");
          }
        } catch (pdfError) {
          console.error("PDF Extraction Error:", pdfError);
          
          const errorMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: `I had trouble extracting text from the PDF automatically. Please try:\n\n**Option 1**: Copy text from your PDF and paste it here\n**Option 2**: Save your PDF as a .txt file and upload that\n**Option 3**: Type your resume text directly in chat\n\nError: ${pdfError.message}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
          
          toast({
            title: "PDF Extraction Failed",
            description: "Please try copying text manually",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Unsupported File",
          description: "Please upload a PDF or TXT file.",
          variant: "destructive"
        });
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Resume Upload Error:", error);
      toast({
        title: "Error",
        description: "Failed to process resume. Please try again.",
        variant: "destructive"
      });
      setIsTyping(false);
    }
  };

  const analyzeResumeText = async (resumeText, fileName) => {
    try {
      // Add a progress message
      const progressMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content: '🔍 Running comprehensive ATS analysis... This may take 2-3 minutes. Please wait...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, progressMessage]);

      console.log("Sending resume for analysis, length:", resumeText.length);

      // Send resume for analysis
      const response = await askCareerCoach(`Analyze this resume and provide comprehensive ATS scoring and improvement suggestions:\n\n${resumeText}`);
      
      console.log("Received response:", response);
      
      // Remove progress message and add actual response
      setMessages(prev => prev.filter(msg => msg.id !== progressMessage.id));
      
      // Extract content from response
      let content = "";
      if (response.reply) {
        content = response.reply;
      } else if (response.message) {
        content = response.message;
      } else if (response.content) {
        content = response.content;
      } else {
        content = JSON.stringify(response, null, 2);
      }

      console.log("Displaying content:", content.substring(0, 200));
      
      const aiMessage = {
        id: Date.now() + 3,
        type: 'ai',
        content: content,
        timestamp: new Date(),
        data: response
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setShowResumeUpload(false);
      
      toast({
        title: "Resume Analyzed",
        description: `Successfully analyzed ${fileName}`,
      });
    } catch (error) {
      console.error("Resume Analysis Error:", error);
      
      const errorMessage = {
        id: Date.now() + 4,
        type: 'ai',
        content: `Sorry, I encountered an error analyzing your resume: ${error.message}\n\nPlease try again or paste your resume text directly in the chat.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Analysis Error",
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call real AI API (Python FastAPI service)
      const response = await askCareerCoach(currentMessage);
      
      // Handle different response types from Python service
      let content = "";
      
      if (response.type === "chat") {
        content = response.reply || response.message;
        // Show user stats if available
        if (response.user_stats) {
          const stats = response.user_stats;
          content += `\n\n📊 Your Profile Stats:\n`;
          content += `• Projects: ${stats.projects_count}\n`;
          content += `• Hackathons: ${stats.hackathons_count}\n`;
          content += `• Connections: ${stats.connections_count}`;
        }
      } else if (response.type === "team_matching") {
        // Real database team matching results
        content = response.message;
      } else if (response.type === "resume_analysis") {
        content = response.message + "\n\nCheck the analysis results in your profile.";
      } else if (response.type === "github_analysis") {
        content = response.message;
      } else if (response.type === "full_workflow") {
        content = response.message + "\n\nYour personalized career plan is ready!";
      } else {
        content = response.reply || response.message || "I've processed your request.";
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content,
        timestamp: new Date(),
        data: response.result // Store full result for potential display
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Coach Error:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I apologize, but I'm having trouble connecting right now. Please make sure the Python AI service is running (port 8000).",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickTip = async (tip) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use this feature.",
        variant: "destructive"
      });
      return;
    }

    setIsTyping(true);

    try {
      let response;
      let content = "";
      
      switch (tip.title) {
        case "Project Ideas":
          response = await askCareerCoach("Can you suggest innovative hackathon project ideas based on my skills and projects?");
          content = response.reply || response.message;
          break;
        case "Strategy Planning":
          response = await askCareerCoach("What's the best strategy for succeeding in a hackathon based on my experience?");
          content = response.reply || response.message;
          break;
        case "Team Dynamics":
          // This will use REAL DATABASE to find teammates
          response = await askCareerCoach("Find me teammates for a hackathon");
          if (response.teammates && response.teammates.length > 0) {
            content = response.message || "Here are real teammates from our database:\n\n";
            response.teammates.slice(0, 5).forEach((teammate, idx) => {
              content += `${idx + 1}. ${teammate.name} (Match: ${teammate.match_score}/10)\n`;
              content += `   Skills: ${teammate.skills.slice(0, 3).join(", ")}\n`;
              if (teammate.complement_skills && teammate.complement_skills.length > 0) {
                content += `   Complements: ${teammate.complement_skills.join(", ")}\n`;
              }
              content += "\n";
            });
          } else {
            content = response.message || response.reply || "I can help you find teammates! Tell me what skills you need.";
          }
          break;
        case "Technical Guidance":
          response = await askCareerCoach("What are the best technology choices for a hackathon project?");
          content = response.reply || response.message;
          break;
        default:
          response = await askCareerCoach(tip.description);
          content = response.reply || response.message;
      }

      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content,
        timestamp: new Date(),
        data: response // Store full response for debugging
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Quick Tip Error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Make sure Python service is running.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Coach - SyncUp</title>
        <meta name="description" content="Get personalized AI coaching for hackathon success. Receive guidance on project ideas, team strategies, and winning approaches." />
        <meta property="og:title" content="AI Coach - SyncUp" />
        <meta property="og:description" content="Get personalized AI coaching for hackathon success. Receive guidance on project ideas, team strategies, and winning approaches." />
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">AI Hackathon Coach</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get personalized guidance, strategic advice, and winning tips from your AI coaching assistant.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tips Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                  Quick Tips
                </h2>
                <div className="space-y-4">
                  {quickTips.map((tip, index) => (
                    <motion.button
                      key={tip.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      onClick={() => handleQuickTip(tip)}
                      disabled={isTyping || !user}
                      className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all">
                          <tip.icon className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm">{tip.title}</h3>
                          <p className="text-gray-400 text-xs mt-1 leading-relaxed">{tip.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="glass-card rounded-2xl overflow-hidden h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-green-500/20 to-teal-600/20">
                      <Bot className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">AI Coach</h3>
                      <p className="text-gray-400 text-sm">Online • Ready to help</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20' : 'bg-gradient-to-r from-green-500/20 to-teal-600/20'}`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Bot className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <div className={`p-4 rounded-2xl ${message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                          {message.type === 'user' ? (
                            <p className="text-white text-sm leading-relaxed">{message.content}</p>
                          ) : (
                            <MessageRenderer content={message.content} />
                          )}
                          <p className="text-gray-400 text-xs mt-2">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-3 max-w-[80%]">
                        <div className="p-2 rounded-full bg-gradient-to-r from-green-500/20 to-teal-600/20">
                          <Bot className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="chat-bubble-ai p-4 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-6 border-t border-white/10">
                  {showResumeUpload && (
                    <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-300">📄 Upload your resume (PDF or TXT)</p>
                        <button
                          onClick={() => setShowResumeUpload(false)}
                          className="text-sm text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="file"
                        accept=".txt,.md,.pdf"
                        onChange={handleResumeUpload}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Supported formats: PDF, TXT, MD
                      </p>
                    </div>
                  )}
                  <div className="flex space-x-3">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={user ? "Ask me anything about hackathons, project ideas, team strategies..." : "Please log in to chat with AI Coach..."}
                      disabled={!user}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      rows="2"
                    />
                    <div className="flex flex-col space-y-2">
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isTyping || !user}
                        className="glass-button px-4 py-3"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setShowResumeUpload(!showResumeUpload)}
                        disabled={isTyping || !user}
                        className="glass-button px-4 py-3"
                        title="Upload Resume"
                      >
                        📄
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AICoach;