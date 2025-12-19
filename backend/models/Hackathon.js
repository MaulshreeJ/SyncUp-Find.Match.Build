import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ["In-Person", "Virtual", "Hybrid"], required: true },
    theme: { type: String, required: true },
    participantsLimit: { type: Number, default: 100 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    prize: String,
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    description: String,
    organizer: String,
    tags: [String],
    // Collaborative workspace - shared by all team members
    workspace: {
      files: [{
        fileName: { type: String, required: true },
        content: { type: String, default: "" },
        language: { type: String, default: "javascript" },
        lastModified: { type: Date, default: Date.now },
        lastModifiedBy: { type: String, default: "" }
      }],
      activeUsers: [{
        userId: { type: String },
        userName: { type: String },
        currentFile: { type: String },
        lastSeen: { type: Date }
      }]
    },
    // Chat messages
    chatMessages: [{
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      userAvatar: { type: String, default: "" },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    // Kanban board
    kanban: {
      tasks: {
        type: Map,
        of: {
          id: String,
          content: String,
          assignee: String,
          dueDate: Date,
          createdAt: { type: Date, default: Date.now }
        },
        default: new Map()
      },
      columns: {
        type: Map,
        of: {
          id: String,
          title: String,
          taskIds: [String]
        },
        default: new Map([
          ['todo', { id: 'todo', title: 'To Do', taskIds: [] }],
          ['inProgress', { id: 'inProgress', title: 'In Progress', taskIds: [] }],
          ['done', { id: 'done', title: 'Done', taskIds: [] }]
        ])
      },
      columnOrder: {
        type: [String],
        default: ['todo', 'inProgress', 'done']
      }
    },
    // Notes and links
    notes: [{
      title: { type: String, required: true },
      content: { type: String, required: true },
      createdBy: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }],
    links: [{
      title: { type: String, required: true },
      url: { type: String, required: true },
      description: { type: String, default: "" },
      addedBy: { type: String, required: true },
      addedAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Hackathon", hackathonSchema);
