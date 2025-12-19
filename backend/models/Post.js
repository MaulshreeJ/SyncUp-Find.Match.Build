import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Please add comment content"],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["General", "Help", "Showcase", "Discussion", "Question"],
      default: "General",
    },
    tags: [{
      type: String,
      trim: true,
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    comments: [commentSchema],
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);