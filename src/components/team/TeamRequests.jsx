import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, X, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getPendingTeamRequests, respondToInvite } from '@/api/team';

const TeamRequests = ({ onRequestUpdate }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await getPendingTeamRequests();
      setRequests(response.requests || []);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      toast({
        title: 'Failed to load requests',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (request, response) => {
    const requestId = `${request.hackathonId}_${request.leaderEmail}`;
    setRespondingTo(requestId);
    
    try {
      await respondToInvite(request.leaderEmail, request.hackathonId, response);
      
      toast({
        title: response === 'accepted' ? 'Invitation accepted!' : 'Invitation rejected',
        description: response === 'accepted' 
          ? `You have successfully joined ${request.teamName} for ${request.hackathonName}` 
          : `You have declined the invitation for ${request.hackathonName}`
      });

      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== request.id));
      
      // Notify parent component
      if (onRequestUpdate) {
        onRequestUpdate();
      }
    } catch (error) {
      toast({
        title: 'Failed to respond',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setRespondingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-400">Loading team requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Team Requests</h3>
          <p className="text-gray-400">You don't have any pending team invitations.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl"
    >
      <div className="flex items-center mb-6">
        <Mail className="h-5 w-5 mr-2 text-blue-400" />
        <h3 className="text-xl font-bold text-white">
          Team Requests ({requests.length})
        </h3>
      </div>

      <div className="space-y-4">
        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{request.teamName}</h4>
                    <p className="text-gray-400 text-sm">by {request.leaderName}</p>
                  </div>
                </div>
                
                <div className="ml-11 space-y-1">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-400 w-20">Hackathon:</span>
                    <span className="text-white">{request.hackathonName}</span>
                  </div>
                  {request.projectName && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 w-20">Project:</span>
                      <span className="text-white">{request.projectName}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <span className="text-gray-400 w-20">Invited:</span>
                    <span className="text-gray-400">
                      {new Date(request.invitedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <Button
                  onClick={() => handleResponse(request, 'accepted')}
                  disabled={respondingTo === `${request.hackathonId}_${request.leaderEmail}`}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-3 py-1 text-sm"
                >
                  {respondingTo === `${request.hackathonId}_${request.leaderEmail}` ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => handleResponse(request, 'rejected')}
                  disabled={respondingTo === `${request.hackathonId}_${request.leaderEmail}`}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1 text-sm"
                >
                  {respondingTo === `${request.hackathonId}_${request.leaderEmail}` ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TeamRequests;