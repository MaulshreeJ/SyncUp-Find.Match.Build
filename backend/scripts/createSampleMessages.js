import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";
import mongoose from "mongoose";

dotenv.config();

const createSampleMessages = async () => {
  try {
    await connectDB();
    
    console.log("💬 Creating sample messages...\n");

    // Get users
    const maulshree = await User.findById("6944f97810cf92c10cee07c5"); // Your user ID from debug
    const alex = await User.findOne({ email: "alex@example.com" });
    const sarah = await User.findOne({ email: "sarah@example.com" });

    if (!maulshree) {
      console.log("❌ Maulshree user not found");
      return;
    }

    if (!alex || !sarah) {
      console.log("❌ Sample users not found");
      return;
    }

    console.log(`✅ Found users:`);
    console.log(`   - ${maulshree.name} (${maulshree._id})`);
    console.log(`   - ${alex.name} (${alex._id})`);
    console.log(`   - ${sarah.name} (${sarah._id})`);

    // Clear existing conversations
    await User.updateMany({}, { $set: { conversations: [] } });
    console.log("🗑️  Cleared existing conversations");

    // Helper function to add conversation to both users
    const addConversation = async (user1, user2, messages) => {
      // Add conversation to user1
      const conversation1 = {
        participantId: user2._id,
        messages: messages,
        lastMessageAt: messages[messages.length - 1].timestamp
      };

      // Add conversation to user2
      const conversation2 = {
        participantId: user1._id,
        messages: messages,
        lastMessageAt: messages[messages.length - 1].timestamp
      };

      await User.findByIdAndUpdate(user1._id, {
        $push: { conversations: conversation1 }
      });

      await User.findByIdAndUpdate(user2._id, {
        $push: { conversations: conversation2 }
      });
    };

    // Conversation between Maulshree and Alex
    const alexMessages = [
      {
        senderId: alex._id,
        message: "Hey! I saw your project on the AI Innovation Challenge. Really impressive work!",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        senderId: maulshree._id,
        message: "Thanks Alex! I'd love to collaborate on future projects. What's your experience with React?",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        read: true
      },
      {
        senderId: alex._id,
        message: "I've been working with React for about 3 years now, mainly with Node.js backends. Your admin skills would be perfect for managing larger projects!",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        read: false
      },
      {
        senderId: maulshree._id,
        message: "That sounds great! Are you interested in joining any upcoming hackathons?",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true
      }
    ];

    // Conversation between Maulshree and Sarah
    const sarahMessages = [
      {
        senderId: sarah._id,
        message: "Hi Maulshree! I noticed you're working on AI projects. I'm a data scientist and would love to discuss some ML approaches for hackathons.",
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        read: false
      },
      {
        senderId: maulshree._id,
        message: "Hi Sarah! That would be amazing. I'm always looking to learn more about the AI/ML side of things. What's your specialty?",
        timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        read: true
      },
      {
        senderId: sarah._id,
        message: "I focus on deep learning and NLP. With your platform management skills and my AI expertise, we could build some really powerful solutions!",
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        read: false
      }
    ];

    // Add conversations
    await addConversation(maulshree, alex, alexMessages);
    await addConversation(maulshree, sarah, sarahMessages);

    console.log("✅ Created sample conversations");
    console.log("\n📊 Sample conversations created:");
    console.log(`   - ${maulshree.name} ↔ ${alex.name}: ${alexMessages.length} messages`);
    console.log(`   - ${maulshree.name} ↔ ${sarah.name}: ${sarahMessages.length} messages`);

    console.log("\n🎉 Sample messages created successfully!");
    console.log("Now you can test the Messages feature with real conversations!");

  } catch (error) {
    console.error("❌ Error creating sample messages:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

createSampleMessages();