import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxMembers: {
      type: Number,
      default: 5,
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Generate unique invite code before saving
teamSchema.pre("save", function (next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

export default mongoose.model("Team", teamSchema);
