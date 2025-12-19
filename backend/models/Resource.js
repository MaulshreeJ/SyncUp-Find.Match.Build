import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    category: {
      type: String,
      enum: ["Frontend", "Backend", "AI", "Cloud", "Mobile", "Design", "DevOps", "General"],
      required: true,
    },
    type: {
      type: String,
      enum: ["article", "video", "tutorial", "documentation", "tool", "course"],
      required: true,
    },
    url: {
      type: String,
      required: [true, "Please add a URL"],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    tags: [{
      type: String,
      trim: true,
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);