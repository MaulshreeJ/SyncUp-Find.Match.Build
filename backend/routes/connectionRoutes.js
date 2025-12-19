import express from "express";
import Connection from "../models/Connection.js";

const router = express.Router();

// Send connection request
router.post("/send", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    console.log(" Received connection request:", req.body);

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Missing sender or receiver ID" });
    }

    //  Check both directions (sender → receiver OR receiver → sender)
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: { $in: ["pending", "accepted"] }
    });

    if (existingConnection) {
      if (existingConnection.status === "pending") {
        return res.status(200).json({
          message: "Connection request already sent. Waiting for approval.",
          connection: existingConnection
        });
      } else if (existingConnection.status === "accepted") {
        return res.status(200).json({
          message: "You are already connected!",
          connection: existingConnection
        });
      }
    }

    // Create new pending connection
    const newConnection = new Connection({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    });

    await newConnection.save();

    res.status(201).json({
      message: "Connection request sent successfully. Waiting for approval.",
      connection: newConnection
    });
  } catch (error) {
    console.error(" Error in /send:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all pending requests (both sent and received)
router.get("/requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "pending"
    })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar");

    res.status(200).json({ requests });
  } catch (error) {
    console.error(" Error in /requests:", error.message);
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
});

// Get all received (pending) requests
router.get("/received/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await Connection.find({
      receiver: userId,
      status: "pending"
    }).populate("sender", "name email avatar");

    res.status(200).json({ requests });
  } catch (error) {
    console.error(" Error in /received:", error.message);
    res.status(500).json({ message: "Failed to fetch received requests" });
  }
});
// Get all accepted connections (friends/team members)
router.get("/accepted/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all connections where the user is either the sender or receiver and status is accepted
    const connections = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar");

    res.status(200).json({ connections });
  } catch (error) {
    console.error(" Error in /accepted:", error.message);
    res.status(500).json({ message: "Failed to fetch accepted connections" });
  }
});

// Accept connection
router.post("/accept", async (req, res) => {
  try {
    const { requestId } = req.body;
    const connection = await Connection.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true }
    );
    if (!connection) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Connection accepted!", connection });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//  Reject connection
router.post("/reject", async (req, res) => {
  try {
    const { requestId } = req.body;
    const connection = await Connection.findByIdAndUpdate(
      requestId,
      { status: "rejected" },
      { new: true }
    );
    if (!connection) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Connection rejected!", connection });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
