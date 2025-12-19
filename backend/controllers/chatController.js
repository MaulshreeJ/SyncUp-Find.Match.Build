import Hackathon from "../models/Hackathon.js";
import asyncHandler from "express-async-handler";

// @desc    Get chat messages for a hackathon
// @route   GET /api/chat/:hackathonId
// @access  Private
export const getChatMessages = asyncHandler(async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const messages = hackathon.chatMessages || [];
    
    console.log(`✅ Returning ${messages.length} chat messages for hackathon ${hackathonId}`);
    res.json({ 
      messages,
      hackathonId 
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Send a chat message
// @route   POST /api/chat/:hackathonId
// @access  Private
export const sendChatMessage = asyncHandler(async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Initialize chatMessages if it doesn't exist
    if (!hackathon.chatMessages) {
      hackathon.chatMessages = [];
    }

    const newMessage = {
      userId: req.user._id.toString(),
      userName: req.user.name,
      userAvatar: req.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(req.user.email)}`,
      message: message.trim(),
      timestamp: new Date()
    };

    hackathon.chatMessages.push(newMessage);
    await hackathon.save();

    console.log(`✅ Message sent by ${req.user.name} in hackathon ${hackathonId}`);
    res.json({ 
      message: "Message sent successfully",
      data: newMessage,
      success: true 
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Delete a chat message
// @route   DELETE /api/chat/:hackathonId/:messageId
// @access  Private
export const deleteChatMessage = asyncHandler(async (req, res) => {
  try {
    const { hackathonId, messageId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const messageIndex = hackathon.chatMessages.findIndex(
      msg => msg._id.toString() === messageId
    );

    if (messageIndex === -1) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user owns the message
    if (hackathon.chatMessages[messageIndex].userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    hackathon.chatMessages.splice(messageIndex, 1);
    await hackathon.save();

    console.log(`✅ Message deleted from hackathon ${hackathonId}`);
    res.json({ 
      message: "Message deleted successfully",
      success: true 
    });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
