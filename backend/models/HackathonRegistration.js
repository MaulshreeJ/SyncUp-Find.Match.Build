import mongoose from "mongoose";

const hackathonRegistrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    role: {
      type: String,
      enum: ["solo", "leader", "member"],
      default: "solo",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one registration per user per hackathon
hackathonRegistrationSchema.index({ user: 1, hackathon: 1 }, { unique: true });

export default mongoose.model("HackathonRegistration", hackathonRegistrationSchema);
