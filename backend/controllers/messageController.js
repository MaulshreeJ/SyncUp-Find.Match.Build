import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

// @desc    Get all conversations for a user
// @route   GET /api/messages
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Use aggregation to avoid validation issues
    const result = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: { path: "$conversations", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "conversations.participantId",
          foreignField: "_id",
          as: "participant",
          pipeline: [
            { $project: { name: 1, email: 1, avatar: 1 } }
          ]
        }
      },
      {
        $project: {
          conversationId: "$conversations._id",
          participant: { $arrayElemAt: ["$participant", 0] },
          messages: "$conversations.messages",
          lastMessageAt: "$conversations.lastMessageAt"
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    const conversations = result
      .filter(conv => conv.participant) // Only include conversations with valid participants
      .map(conv => ({
        conversationId: conv.conversationId,
        participant: conv.participant,
        lastMessage: conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null,
        unreadCount: conv.messages ? conv.messages.filter(m => !m.read && m.senderId.toString() !== userId.toString()).length : 0,
        lastMessageAt: conv.lastMessageAt
      }));

    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    // Use aggregation to get messages without validation issues
    const result = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(currentUserId) } },
      { $unwind: "$conversations" },
      { $match: { "conversations.participantId": new mongoose.Types.ObjectId(otherUserId) } },
      {
        $project: {
          messages: "$conversations.messages"
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.json({ messages: [] });
    }

    const messages = result[0].messages || [];

    // Mark messages as read using atomic update
    await User.updateOne(
      { 
        _id: new mongoose.Types.ObjectId(currentUserId),
        'conversations.participantId': new mongoose.Types.ObjectId(otherUserId)
      },
      {
        $set: {
          'conversations.$.messages.$[elem].read': true
        }
      },
      {
        arrayFilters: [{ 'elem.senderId': new mongoose.Types.ObjectId(otherUserId) }]
      }
    );

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Send a message to a user
// @route   POST /api/messages/:userId
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Get both users
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const newMessage = {
      senderId,
      message: message.trim(),
      timestamp: new Date(),
      read: false
    };

    // Update sender's conversation using findByIdAndUpdate to avoid validation issues
    const senderUpdate = await User.findOneAndUpdate(
      { 
        _id: senderId,
        'conversations.participantId': receiverId 
      },
      {
        $push: { 'conversations.$.messages': newMessage },
        $set: { 'conversations.$.lastMessageAt': new Date() }
      },
      { new: true }
    );

    // If conversation doesn't exist, create it
    if (!senderUpdate) {
      await User.findByIdAndUpdate(senderId, {
        $push: {
          conversations: {
            participantId: receiverId,
            messages: [newMessage],
            lastMessageAt: new Date()
          }
        }
      });
    }

    // Update receiver's conversation
    const receiverUpdate = await User.findOneAndUpdate(
      { 
        _id: receiverId,
        'conversations.participantId': senderId 
      },
      {
        $push: { 'conversations.$.messages': newMessage },
        $set: { 'conversations.$.lastMessageAt': new Date() }
      },
      { new: true }
    );

    // If conversation doesn't exist, create it
    if (!receiverUpdate) {
      await User.findByIdAndUpdate(receiverId, {
        $push: {
          conversations: {
            participantId: senderId,
            messages: [newMessage],
            lastMessageAt: new Date()
          }
        }
      });
    }

    console.log(`✅ Message sent from ${sender.name} to ${receiver.name}`);
    res.json({ 
      message: "Message sent successfully",
      data: newMessage,
      success: true 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Delete a conversation
// @route   DELETE /api/messages/:userId
// @access  Private
export const deleteConversation = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const convIndex = user.conversations.findIndex(
      conv => conv.participantId.toString() === otherUserId
    );

    if (convIndex === -1) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    user.conversations.splice(convIndex, 1);
    await user.save();

    res.json({ 
      message: "Conversation deleted successfully",
      success: true 
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
