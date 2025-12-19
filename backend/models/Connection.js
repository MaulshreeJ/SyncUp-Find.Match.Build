// import mongoose from "mongoose";

// const connectionSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   receiver: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["pending", "accepted", "rejected"],
//     default: "pending",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Connection = mongoose.model("Connection", connectionSchema);
// export default Connection;
import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Connection = mongoose.model("Connection", connectionSchema);
export default Connection; // ✅ THIS LINE IS IMPORTANT

