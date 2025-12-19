import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Trophy, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const JoinHackathonModal = ({ hackathon, isOpen, onClose, onSuccess }) => {
  const { fetchProfile } = useAuth();
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      toast({
        title: 'Team name required',
        description: 'Please enter a team name.',
        variant: 'destructive'
      });
      return;
    }

    setIsJoining(true);
    const token = localStorage.getItem('syncup_token') || localStorage.getItem('token');
    const hackathonId = hackathon._id || hackathon.id;

    try {
      // Step 1: Register for hackathon (become solo)
      try {
        await axios.post(
          `${API_BASE}/api/hackathons/${hackathonId}/register`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        if (!error.response?.data?.message?.includes('Already registered')) {
          throw error;
        }
      }

      // Step 2: Create team (become leader)
      const response = await axios.post(
        `${API_BASE}/api/hackathons/${hackathonId}/team/create`,
        { 
          teamName: teamName.trim(),
          maxMembers: 5 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: 'Team created successfully!',
        description: `You are now the leader of "${teamName}". Share your invite code!`
      });

      if (fetchProfile) {
        try {
          await fetchProfile(token);
        } catch (error) {
          console.warn('Failed to refresh profile:', error);
        }
      }

      setTeamName('');
      if (onSuccess) onSuccess(response.data);
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create team';
      toast({
        title: 'Failed to create team',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        title: 'Invite code required',
        description: 'Please enter an invite code.',
        variant: 'destructive'
      });
      return;
    }

    setIsJoining(true);
    const token = localStorage.getItem('syncup_token') || localStorage.getItem('token');
    const hackathonId = hackathon._id || hackathon.id;

    try {
      // Step 1: Register for hackathon (become solo)
      try {
        await axios.post(
          `${API_BASE}/api/hackathons/${hackathonId}/register`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        if (!error.response?.data?.message?.includes('Already registered')) {
          throw error;
        }
      }

      // Step 2: Join team with invite code
      const response = await axios.post(
        `${API_BASE}/api/hackathons/${hackathonId}/team/join`,
        { inviteCode: inviteCode.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: 'Successfully joined team!',
        description: `You are now a member of the team!`
      });

      if (fetchProfile) {
        try {
          await fetchProfile(token);
        } catch (error) {
          console.warn('Failed to refresh profile:', error);
        }
      }

      setInviteCode('');
      if (onSuccess) onSuccess(response.data);
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to join team';
      toast({
        title: 'Failed to join team',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (!isOpen || !hackathon) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card p-6 rounded-2xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
            Join Hackathon
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Hackathon Info */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <h3 className="text-white font-semibold mb-2">{hackathon.name}</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <p>Theme: {hackathon.theme}</p>
            <p>Difficulty: {hackathon.difficulty}</p>
            {hackathon.prize && <p>Prize: {hackathon.prize}</p>}
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'create'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Create Team
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'join'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Join Team
          </button>
        </div>

        {/* Create Team Form */}
        {mode === 'create' && (
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Team Name *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isJoining}
                  required
                />
              </div>
            </div>

            <div className="text-sm text-gray-400 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="font-medium text-blue-400 mb-1">📋 What happens:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-xs">
                <li>You'll be registered for the hackathon</li>
                <li>Your team will be created</li>
                <li>You'll become the team leader</li>
                <li>You'll get an invite code to share</li>
              </ul>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                disabled={isJoining}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 glass-button"
                disabled={isJoining || !teamName.trim()}
              >
                {isJoining ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        )}

        {/* Join Team Form */}
        {mode === 'join' && (
          <form onSubmit={handleJoinTeam} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Invite Code *
              </label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code (e.g., BCR3JRSM)"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  disabled={isJoining}
                  required
                  maxLength={8}
                />
              </div>
            </div>

            <div className="text-sm text-gray-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="font-medium text-green-400 mb-1">📋 What happens:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-xs">
                <li>You'll be registered for the hackathon</li>
                <li>You'll join the existing team</li>
                <li>You'll become a team member</li>
                <li>You can collaborate with your team</li>
              </ul>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                disabled={isJoining}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 glass-button"
                disabled={isJoining || !inviteCode.trim()}
              >
                {isJoining ? 'Joining...' : 'Join Team'}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default JoinHackathonModal;