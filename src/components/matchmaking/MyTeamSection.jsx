import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageCircle,
  CheckCircle,
  XCircle,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getReceivedConnections,
  acceptConnection,
  rejectConnection,
  getAcceptedConnections, // ✅ new import
} from "../../api/connection";

const MyTeamSection = ({ onMessage }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // 📨 Fetch pending connection requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const data = await getReceivedConnections(user._id);
        setRequests(data);
      } catch (error) {
        console.error("❌ Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  // 👥 Fetch accepted (approved) team members
  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?._id) return;
      setLoadingTeam(true);
      try {
        const connections = await getAcceptedConnections(user._id);
        const members = connections.map((conn) =>
          conn.sender._id === user._id ? conn.receiver : conn.sender
        );
        setTeamMembers(members);
      } catch (error) {
        console.error("❌ Error fetching team:", error);
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchTeam();
  }, [user]);

  // 🟢 Accept connection
  const handleAccept = async (requestId) => {
    try {
      const accepted = await acceptConnection(requestId);

      // ✅ Remove from requests
      setRequests((prev) => prev.filter((r) => r._id !== requestId));

      // ✅ Add sender to My Team instantly
      if (accepted?.connection?.sender) {
        const newMember = accepted.connection.sender;
        setTeamMembers((prev) => [
          ...prev,
          {
            _id: newMember._id,
            name: newMember.name,
            title: newMember.role || "Teammate",
            avatar: newMember.avatar || "/default-avatar.png",
          },
        ]);
      }
    } catch (error) {
      console.error("❌ Accept failed:", error);
    }
  };

  // 🔴 Reject connection
  const handleReject = async (requestId) => {
    try {
      await rejectConnection(requestId);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (error) {
      console.error("❌ Reject failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-16 space-y-12"
    >
      {/* ✅ Connection Requests */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Connection Requests
        </h2>
        {loading ? (
          <p className="text-gray-400">Loading requests...</p>
        ) : requests.length > 0 ? (
          <div className="glass-card p-6 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between bg-white/5 p-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={req.sender?.avatar || "/default-avatar.png"}
                      alt={req.sender?.name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="text-white font-medium">
                        {req.sender?.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {req.sender?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAccept(req._id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button
                      onClick={() => handleReject(req._id)}
                      variant="outline"
                      className="text-red-400 border-red-500/30 hover:bg-red-500/20"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-2xl text-center">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No pending requests
            </h3>
            <p className="text-gray-400">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* 👥 My Team Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">My Team</h2>
        {loadingTeam ? (
          <p className="text-gray-400">Loading team...</p>
        ) : teamMembers.length > 0 ? (
          <div className="glass-card p-6 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center p-4 bg-white/5 rounded-lg"
                >
                  <img
                    src={member.avatar || "/default-avatar.png"}
                    alt={member.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {member.role || "Teammate"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('🟣 MyTeamSection: Clicking message for member:', member);
                      console.log('🟣 Member ID:', member._id);
                      console.log('🟣 Member object keys:', Object.keys(member));
                      onMessage(member);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-2xl text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No team members yet
            </h3>
            <p className="text-gray-400">
              Start connecting with teammates to build your dream team!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyTeamSection;
