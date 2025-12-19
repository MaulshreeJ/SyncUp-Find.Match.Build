import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getReceivedConnections,
  acceptConnection,
  rejectConnection,
} from "../../api/connection";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

const ConnectionRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch received connection requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?._id) return;
      try {
        const data = await getReceivedConnections(user._id);
        setRequests(data);
      } catch (err) {
        console.error("❌ Error fetching received requests:", err);
        toast.error("Failed to load connection requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const handleAccept = async (requestId) => {
    try {
      await acceptConnection(requestId);
      toast.success("✅ Connection accepted!");
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      toast.error("Failed to accept request.");
      console.error(err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectConnection(requestId);
      toast.info("🚫 Connection rejected.");
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      toast.error("Failed to reject request.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-400 text-center mt-10"
      >
        Loading connection requests...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Pending Connection Requests</h2>

      {requests.length > 0 ? (
        <div className="glass-card p-6 rounded-2xl">
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between bg-white/5 p-4 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={req.sender?.avatar || "https://via.placeholder.com/40"}
                    alt={req.sender?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="text-white font-medium">
                      {req.sender?.name || "Unknown User"}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {req.sender?.title || "No title"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAccept(req._id)}
                    className="bg-green-500/20 text-green-400 border border-green-500/30"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Accept
                  </Button>
                  <Button
                    onClick={() => handleReject(req._id)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-2xl text-center">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No pending requests
          </h3>
          <p className="text-gray-400">
            You’ll see new connection requests here when someone sends one to you.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ConnectionRequests;
