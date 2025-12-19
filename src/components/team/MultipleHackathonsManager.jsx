import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Plus, Mail, Crown, UserCheck, UserX, Clock, Calendar, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { inviteTeamMember, getTeamDetails } from '@/api/team';
import { useAuth } from '@/contexts/AuthContext';

const MultipleHackathonsManager = ({ onUpdate }) => {
  const { user } = useAuth();
  const [hackathonDetails, setHackathonDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmails, setInviteEmails] = useState({}); // hackathonId -> email
  const [inviting, setInviting] = useState({}); // hackathonId -> boolean

  useEffect(() => {
    if (user?._id) {
      fetchHackathonDetails();
    }
  }, [user?._id]);

  const fetchHackathonDetails = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await getTeamDetails(user._id);
      setHackathonDetails(response.hackathons || []);
    } catch (error) {
      console.error('Failed to fetch hackathon details:', error);
      toast({
        title: 'Failed to load hackathons',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (hackathonId, hackathonName) => {
    const email = inviteEmails[hackathonId];
    
    if (!email?.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address to invite.',
        variant: 'destructive'
      });
      return;
    }

    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      toast({
        title: 'Invalid email',
        description: 'You cannot invite yourself.',
        variant: 'destructive'
      });
      return;
    }

    setInviting(prev => ({ ...prev, [hackathonId]: true }));
    try {
      await inviteTeamMember(email, hackathonId);
      
      toast({
        title: 'Invitation sent!',
        description: `Successfully sent invitation to ${email} for ${hackathonName}`
      });

      setInviteEmails(prev => ({ ...prev, [hackathonId]: '' }));
      
      // Refresh data
      await fetchHackathonDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setInviting(prev => ({ ...prev, [hackathonId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <UserCheck className="h-4 w-4 text-green-400" />;
      case 'rejected':
        return <UserX className="h-4 w-4 text-red-400" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'text-green-400 bg-green-500/20';
      case 'rejected':
        return 'text-red-400 bg-red-500/20';
      case 'pending':
      default:
        return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-400">Loading your hackathons...</p>
        </div>
      </div>
    );
  }

  if (hackathonDetails.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Hackathons Yet</h3>
          <p className="text-gray-400">Join a hackathon to start building your team!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          My Hackathons ({hackathonDetails.length})
        </h3>
      </div>

      {hackathonDetails.map((hackathon, index) => {
        const acceptedMembers = hackathon.members?.filter(member => member.status === 'accepted') || [];
        const pendingMembers = hackathon.members?.filter(member => member.status === 'pending') || [];
        const isLeader = hackathon.isTeamLeader;

        return (
          <motion.div
            key={hackathon.hackathonId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-2xl"
          >
            {/* Hackathon Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20 mr-3">
                  <Trophy className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{hackathon.hackathonName}</h4>
                  <p className="text-gray-400 text-sm">Team: {hackathon.teamName}</p>
                </div>
              </div>
              {isLeader && (
                <div className="flex items-center text-yellow-400 text-sm">
                  <Crown className="h-4 w-4 mr-1" />
                  Leader
                </div>
              )}
            </div>

            {/* Project Info */}
            {hackathon.projectName && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <div className="flex items-center text-sm">
                  <Rocket className="h-4 w-4 mr-2 text-purple-400" />
                  <span className="text-gray-400">Project:</span>
                  <span className="text-white ml-2">{hackathon.projectName}</span>
                </div>
              </div>
            )}

            {/* Team Leader Info */}
            {hackathon.leader && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-400 mb-2">Team Leader</h5>
                <div className="flex items-center p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-600/20 flex items-center justify-center mr-3">
                    <Crown className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{hackathon.leader.name}</p>
                    <p className="text-gray-400 text-sm">{hackathon.leader.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Accepted Team Members */}
            {acceptedMembers.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-400 mb-2">
                  Team Members ({acceptedMembers.length})
                </h5>
                <div className="space-y-2">
                  {acceptedMembers.map((member, memberIndex) => (
                    <div key={memberIndex} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500/20 to-teal-600/20 flex items-center justify-center mr-3">
                          <UserCheck className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-gray-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Invitations (only for leaders) */}
            {isLeader && pendingMembers.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-400 mb-2">
                  Pending Invitations ({pendingMembers.length})
                </h5>
                <div className="space-y-2">
                  {pendingMembers.map((member, memberIndex) => (
                    <div key={memberIndex} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-600/20 flex items-center justify-center mr-3">
                          <Clock className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-gray-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite New Member (Only for team leaders) */}
            {isLeader && (
              <div className="border-t border-white/10 pt-4">
                <h5 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Team Member
                </h5>
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="email"
                      value={inviteEmails[hackathon.hackathonId] || ''}
                      onChange={(e) => setInviteEmails(prev => ({ 
                        ...prev, 
                        [hackathon.hackathonId]: e.target.value 
                      }))}
                      placeholder="Enter email address..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      disabled={inviting[hackathon.hackathonId]}
                    />
                  </div>
                  <Button 
                    onClick={() => handleInviteMember(hackathon.hackathonId, hackathon.hackathonName)}
                    className="glass-button px-4 py-2 text-sm"
                    disabled={inviting[hackathon.hackathonId] || !inviteEmails[hackathon.hackathonId]?.trim()}
                  >
                    {inviting[hackathon.hackathonId] ? 'Sending...' : 'Invite'}
                  </Button>
                </div>
              </div>
            )}

            {/* Join Date */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center text-xs text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                Joined: {new Date(hackathon.joinedAt).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MultipleHackathonsManager;