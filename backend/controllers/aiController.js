import { GoogleGenAI } from '@google/genai';
import asyncHandler from "express-async-handler";
import ChatHistory from "../models/ChatHistory.js";

const HACKATHON_CONTEXT = `You are an AI hackathon coach for SyncUp, a platform that helps developers collaborate on hackathons. Your role is to provide expert guidance on:

1. Project Ideas: Suggest innovative, feasible project concepts based on current tech trends
2. Team Strategy: Advise on team formation, role distribution, and collaboration best practices
3. Technical Guidance: Help with technology choices, architecture decisions, and implementation approaches
4. Time Management: Provide strategies for effective hackathon time management and milestone planning
5. Presentation Tips: Guide users on creating compelling pitches and demos
6. Problem-Solving: Help debug issues and overcome technical challenges

Keep responses practical, encouraging, and focused on hackathon success. Be concise but thorough.`;

export const chatWithGemini = async (req, res) => {
  const userMessage = (req.body?.message || '').toString().trim();
  const sessionId = req.body?.sessionId || null;
  const userId = req.user?._id || null;

  if (!userMessage) {
    return res.json({ reply: 'Please enter a message.' });
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      // Initialize Gemini client
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      // Build conversation context
      let conversationHistory = [
        { role: 'user', parts: [{ text: HACKATHON_CONTEXT }] },
        { role: 'model', parts: [{ text: 'I understand. I\'m your AI hackathon coach, ready to help you succeed in hackathons with project ideas, team strategies, technical guidance, and more. What would you like to work on?' }] }
      ];

      // If user is authenticated and has a session, load chat history
      if (userId && sessionId) {
        try {
          const chatHistory = await ChatHistory.findOne({ 
            user: userId, 
            sessionId: sessionId 
          });
          
          if (chatHistory && chatHistory.messages.length > 0) {
            // Convert stored messages to Gemini format
            const historyMessages = chatHistory.messages.slice(-10).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            }));
            conversationHistory = [...conversationHistory, ...historyMessages];
          }
        } catch (error) {
          console.warn('Failed to load chat history:', error);
        }
      }

      // Add current user message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      // Generate response
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: conversationHistory,
      });

      // Extract reply text
      const reply = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t respond.';

      // Save to chat history if user is authenticated
      if (userId && sessionId) {
        try {
          let chatHistory = await ChatHistory.findOne({ 
            user: userId, 
            sessionId: sessionId 
          });

          if (!chatHistory) {
            chatHistory = new ChatHistory({
              user: userId,
              sessionId: sessionId,
              messages: [],
              title: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '')
            });
          }

          // Add both user message and AI response
          chatHistory.messages.push(
            { content: userMessage, type: 'user' },
            { content: reply, type: 'ai' }
          );

          // Keep only last 50 messages to prevent excessive storage
          if (chatHistory.messages.length > 50) {
            chatHistory.messages = chatHistory.messages.slice(-50);
          }

          await chatHistory.save();
        } catch (error) {
          console.warn('Failed to save chat history:', error);
        }
      }

      return res.json({ reply, sessionId });
    } catch (error) {
      console.error('Gemini API error:', error);
      return res.status(500).json({ reply: 'Error connecting to Gemini AI service.' });
    }
  }

  // Fallback responses for hackathon coaching
  const fallbackResponses = [
    "That's a great question! For hackathon success, I'd recommend focusing on solving a real problem that affects many people. What specific domain interests you?",
    "Excellent thinking! Consider starting with an MVP approach - build the core functionality first, then add features if time permits. What's your main technical challenge?",
    "For team collaboration, I suggest establishing clear roles early and using tools like GitHub for code and Slack for communication. How's your team dynamic?",
    "Time management is crucial! Try the 40-30-20-10 rule: 40% planning, 30% development, 20% testing, 10% presentation prep. Where are you in your timeline?",
    "Great project idea! To make it stand out, consider adding a unique twist or combining multiple technologies. What makes your solution different?"
  ];

  const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  return res.json({ reply: randomResponse });
};

/**
 * @desc    Get chat history for user
 * @route   GET /api/ai/history
 * @access  Private
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const chatSessions = await ChatHistory.find({ user: req.user._id })
    .select('sessionId title createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ChatHistory.countDocuments({ user: req.user._id });

  res.json({
    sessions: chatSessions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

/**
 * @desc    Save chat session
 * @route   POST /api/ai/history
 * @access  Private
 */
export const saveChatSession = asyncHandler(async (req, res) => {
  const { sessionId, messages, title } = req.body;

  let chatHistory = await ChatHistory.findOne({ 
    user: req.user._id, 
    sessionId: sessionId 
  });

  if (!chatHistory) {
    chatHistory = new ChatHistory({
      user: req.user._id,
      sessionId: sessionId,
      messages: [],
      title: title || 'AI Chat Session'
    });
  }

  if (messages && Array.isArray(messages)) {
    chatHistory.messages = messages;
  }

  if (title) {
    chatHistory.title = title;
  }

  await chatHistory.save();

  res.json(chatHistory);
});

/**
 * @desc    Delete chat session
 * @route   DELETE /api/ai/history/:sessionId
 * @access  Private
 */
export const deleteChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const chatHistory = await ChatHistory.findOne({ 
    user: req.user._id, 
    sessionId: sessionId 
  });

  if (!chatHistory) {
    res.status(404);
    throw new Error("Chat session not found");
  }

  await ChatHistory.findByIdAndDelete(chatHistory._id);

  res.json({ message: "Chat session deleted successfully" });
});