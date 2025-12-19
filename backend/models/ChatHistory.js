import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Please add message content"],
    },
    type: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
  },
  { timestamps: true }
);

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    messages: [messageSchema],
    title: {
      type: String,
      default: "AI Chat Session",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatHistory", chatHistorySchema);