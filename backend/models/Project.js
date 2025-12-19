import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a task title"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const chatMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Please add message content"],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a project name"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    goals: {
      type: String,
      default: "",
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    tasks: [taskSchema],
    chat: [chatMessageSchema],
    files: [fileSchema],
    technologies: [{
      type: String,
      trim: true,
    }],
    repositoryUrl: {
      type: String,
      default: "",
    },
    demoUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["planning", "development", "testing", "completed", "submitted"],
      default: "planning",
    },
    sharedCode: {
      type: String,
      default: "// Start coding with your teammates!",
    },
    // Collaborative workspace
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
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);