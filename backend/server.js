// // server.js
// import chatRoutes from "./routes/aiRoutes.js";
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";

// dotenv.config();

// // Connect to MongoDB
// connectDB();

// const app = express();

// // Middleware
// app.use(express.json());

// // ✅ Enable CORS for frontend
// app.use(
//   cors({
//     origin: "http://localhost:5173", // frontend URL
//     credentials: true,
//   })
// );

// // Routes
// app.use("/api", authRoutes);
// app.use("/api", chatRoutes);


// // Start server
// const PORT = process.env.PORT || 5000; // ⚡ don't use 5173 (frontend port)
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




// // server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import aiRoutes from "./routes/aiRoutes.js";
// import hackathonRoutes from "./routes/hackathonRoutes.js";
// import userRoutes from './routes/userRoutes.js';

// dotenv.config();
// connectDB();
// const app = express();
// app.use(express.json());
// app.use(
// cors({
// origin: "http://localhost:5173",
// credentials: true,
// })
// );

// app.use('/api/users', userRoutes);
// app.use("/api", authRoutes);
// app.use("/api/ai", aiRoutes);
// app.use("/api/hackathons", hackathonRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import hackathonRoutes from "./routes/hackathonRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import agentToolsRoutes from "./routes/agentToolsRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import kanbanRoutes from "./routes/kanbanRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import hackathonTeamRoutes from "./routes/hackathonTeamRoutes.js";
import { seedAdmin } from "./scripts/seedAdmin.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// ✅ Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

app.use(express.json());

// ✅ CORS setup
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// ✅ Route setup
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai", agentRoutes); // AI Agent routes (Career Coach & Matcher)
app.use("/api/agent-tools", agentToolsRoutes); // Agent Tools (DB access for Python)
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/hackathons", hackathonTeamRoutes); // New team management routes
app.use("/api/connections", connectionRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/kanban", kanbanRoutes);
app.use("/api/notes", notesRoutes);

// Seed admin user on startup
seedAdmin();

// ✅ Socket.IO real-time workspace collaboration
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join a project workspace
  socket.on("joinWorkspace", ({ projectId, userId, userName }) => {
    socket.join(projectId);
    socket.projectId = projectId;
    socket.userId = userId;
    socket.userName = userName;
    console.log(`👥 ${userName} joined workspace: ${projectId}`);
    
    // Notify others that user joined
    socket.to(projectId).emit("userJoined", { userId, userName });
  });

  // Broadcast file changes to other users
  socket.on("fileChange", ({ projectId, fileName, content, userId }) => {
    console.log(`📝 File change: ${fileName} in ${projectId}`);
    socket.to(projectId).emit("fileChange", { fileName, content, userId });
  });

  // Broadcast file creation
  socket.on("fileCreated", ({ projectId, fileName, content }) => {
    console.log(`📄 File created: ${fileName} in ${projectId}`);
    socket.to(projectId).emit("fileCreated", { fileName, content });
  });

  // Broadcast file deletion
  socket.on("fileDeleted", ({ projectId, fileName }) => {
    console.log(`🗑️ File deleted: ${fileName} in ${projectId}`);
    socket.to(projectId).emit("fileDeleted", { fileName });
  });

  // User is viewing/editing a specific file
  socket.on("fileOpened", ({ projectId, fileName, userId, userName }) => {
    socket.to(projectId).emit("userOpenedFile", { fileName, userId, userName });
  });

  // Cursor position updates (optional, for showing where others are typing)
  socket.on("cursorMove", ({ projectId, fileName, position, userId, userName }) => {
    socket.to(projectId).emit("cursorMove", { fileName, position, userId, userName });
  });

  // Chat message sent
  socket.on("chatMessage", ({ projectId, message, userId, userName, userAvatar, timestamp }) => {
    console.log(`💬 Chat message from ${userName} in ${projectId}`);
    socket.to(projectId).emit("chatMessage", { message, userId, userName, userAvatar, timestamp });
  });

  // User is typing indicator
  socket.on("userTyping", ({ projectId, userId, userName, isTyping }) => {
    socket.to(projectId).emit("userTyping", { userId, userName, isTyping });
  });

  // Direct message events
  socket.on("joinDirectMessage", ({ userId }) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their DM room`);
  });

  socket.on("directMessage", ({ receiverId, message, senderId, senderName, timestamp }) => {
    console.log(`💬 Direct message from ${senderName} to user ${receiverId}`);
    socket.to(`user_${receiverId}`).emit("directMessage", { 
      message, 
      senderId, 
      senderName, 
      timestamp 
    });
  });

  socket.on("disconnect", () => {
    if (socket.projectId && socket.userId) {
      console.log(`🔌 ${socket.userName} disconnected from ${socket.projectId}`);
      socket.to(socket.projectId).emit("userLeft", { 
        userId: socket.userId, 
        userName: socket.userName 
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
