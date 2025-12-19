import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null, // null means no expiration
    },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);