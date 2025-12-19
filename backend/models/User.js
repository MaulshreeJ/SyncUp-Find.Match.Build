
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic auth fields
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },

    // Profile fields
    title: { type: String, default: "" },             
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },            
    location: { type: String, default: "" },

    // Arrays / preferences
    skills: {
      type: [String],
      default: [],
    },
    preferredRoles: {
      type: [String],
      default: [],
    },

    // availability and metadata
    availability: {
      type: String,
      enum: ["Available", "Busy", "Maybe"],
      default: "Available",
    },

    // role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // join timestamp
    joinedAt: {
      type: Date,
      default: Date.now,
    },

    // toggles
    isActive: { type: Boolean, default: true },

    // Direct messages with other users
    conversations: [{
      participantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
      },
      messages: [{
        senderId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User",
          required: true 
        },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        read: { type: Boolean, default: false }
      }],
      lastMessageAt: { type: Date, default: Date.now }
    }],



    // Multiple hackathons support - NEW STRUCTURE
    hackathonsJoined: {
      type: [{
        hackathonId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Hackathon",
          required: true 
        },
        hackathonName: { type: String, required: true },
        teamName: { type: String, required: true },
        projectName: { type: String, default: "" },
        isTeamLeader: { type: Boolean, default: false },
        teamLeaderEmail: { type: String, default: "" },
        joinedAt: { type: Date, default: Date.now },
        teamMembers: [{
          name: { type: String, required: true },
          email: { type: String, required: true },
          status: { 
            type: String, 
            enum: ["pending", "accepted", "rejected"], 
            default: "pending" 
          },
          invitedAt: { type: Date, default: Date.now },
          respondedAt: { type: Date }
        }],
        // Project details for this hackathon
        project: {
          description: { type: String, default: "" },
          techStack: { type: [String], default: [] },
          githubLink: { type: String, default: "" },
          deploymentLink: { type: String, default: "" },
          status: { 
            type: String, 
            enum: ["Planning", "In Progress", "Completed", "Submitted"], 
            default: "Planning" 
          },
          sharedCode: { 
            type: String, 
            default: "// Start coding with your teammates!" 
          },
          // Collaborative workspace files
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
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now }
        }
      }],
      default: []
    },


  },
  { timestamps: true }
);

// Password hashing before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});



// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
