import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Crown, UserCheck, UserX, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { inviteTeamMember, getTeamDetails } from '@/api/team';
import { useAuth } from '@/contexts/AuthContext';

const TeamManagement = ({ teamData, onTeamUpdate }) => {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [teamDetails, setTeamDetails] = useState(teamData);

  useEffect(() => {
    setTeamDetails(teamData);
  }, [teamData]);

  const handleInviteMember = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address to invite.',
        variant: 'destructive'
      });
      return;
    }

    if (inviteEmail.toLowerCase() === user?.email?.toLowerCase()) {
      toast({
        title: 'Invalid email',
        description: 'You cannot invite yourself.',
        variant: 'destructive'
      });
      return;
    }

    setIsInviting(true);
    try {
      const response = await inviteTeamMember(inviteEmail);
      
      toast({
        title: 'Invitation sent!',
        description: `Successfully sent invitation to ${inviteEmail}`
      });

      setInviteEmail('');
      
      // Refresh team details
      if (onTeamUpdate) {
        onTeamUpdate();
      }
    } catch (error) {
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsInviting(false);
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

  if (!teamDetails) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Team Yet</h3>
          <p className="text-gray-400">Join a hackathon to create or join a team.</p>
        </div>
      </div>
    );
  }

  const isLeader = teamDetails.role === 'leader';
  const acceptedMembers = teamDetails.members?.filter(member => member.status === 'accepted') || [];
  const pendingMembers = teamDetails.members?.filter(member => member.status === 'pending') || [];

  return (
    <div className="space-y-6">
      {/* Team Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Management
          </h3>
          {isLeader && (
            <div className="flex items-center text-yellow-400 text-sm">
              <Crown className="h-4 w-4 mr-1" />
              Team Leader
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <span className="text-gray-400 text-sm">Team Name:</span>
            <p className="text-white font-medium">{teamDetails.teamName}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Hackathon:</span>
            <p className="text-white font-medium">{teamDetails.hackathonName}</p>
          </div>
          {teamDetails.projectName && (
            <div>
              <span className="text-gray-400 text-sm">Project:</span>
              <p className="text-white font-medium">{teamDetails.projectName}</p>
            </div>
          )}
        </div>

        {/* Team Leader */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Crown className="h-4 w-4 mr-2 text-yellow-400" />
            Team Leader
          </h4>
          <div className="flex items-center p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-600/20 flex items-center justify-center mr-3">
              <Crown className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-medium">{teamDetails.leader?.name}</p>
              <p className="text-gray-400 text-sm">{teamDetails.leader?.email}</p>
            </div>
          </div>
        </div>

        {/* Accepted Team Members */}
        {acceptedMembers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">
              Team Members ({acceptedMembers.length})
            </h4>
            <div className="space-y-2">
              {acceptedMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
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

        {/* Pending Invitations */}
        {isLeader && pendingMembers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">
              Pending Invitations ({pendingMembers.length})
            </h4>
            <div className="space-y-2">
              {pendingMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
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
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Invite Team Member
            </h4>
            <form onSubmit={handleInviteMember} className="flex space-x-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address to invite..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isInviting}
                />
              </div>
              <Button 
                type="submit" 
                className="glass-button px-6"
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? 'Sending...' : 'Invite'}
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeamManagement;