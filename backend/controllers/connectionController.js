import Connection from "../models/Connection.js";

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Missing sender or receiver ID" });
    }

    console.log(" Received connection request:", { senderId, receiverId });

    const newConnection = new Connection({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    await newConnection.save();
    res.status(201).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("❌ Error creating connection:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Respond to connection request (accept/decline)
export const respondConnection = async (req, res) => {
  try {
    const { status } = req.body; // accepted | declined
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);
    if (!connection) return res.status(404).json({ message: "Connection not found" });

    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    connection.status = status;
    await connection.save();

    res.json({ message: `Connection ${status}`, connection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all user connections
export const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
