import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  UserPlus,
  UserMinus,
  Crown,
  Copy,
  Trash2,
  ArrowLeftRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HackathonDetail = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Team creation/join modals
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showTransferLeadership, setShowTransferLeadership] = useState(false);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [hackathonId, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('syncup_token');

      // Fetch hackathon details
      const hackathonRes = await axios.get(`${API_BASE}/api/hackathons/${hackathonId}`);
      setHackathon(hackathonRes.data);

      // Fetch user's registration
      try {
        const regRes = await axios.get(
          `${API_BASE}/api/hackathons/${hackathonId}/my-registration`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRegistration(regRes.data);
      } catch (err) {
        // Not registered yet
        setRegistration(null);
      }

      // Fetch all teams
      const teamsRes = await axios.get(`${API_BASE}/api/hackathons/${hackathonId}/teams`);
      setTeams(teamsRes.data.teams || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load hackathon details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(
        `${API_BASE}/api/hackathons/${hackathonId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Success', description: 'Registered for hackathon!' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Registration failed', variant: 'destructive' });
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({ title: 'Error', description: 'Team name is required', variant: 'destructive' });
      return;
    }

    try {
      const token = localStorage.getItem('syncup_token');
      const response = await axios.post(
        `${API_BASE}/api/hackathons/${hackathonId}/team/create`,
        { teamName: teamName.trim(), maxMembers: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Success', description: 'Team created successfully! You are now the team leader.' });
      setShowCreateTeam(false);
      setTeamName('');
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create team';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      toast({ title: 'Error', description: 'Invite code is required', variant: 'destructive' });
      return;
    }

    try {
      const token = localStorage.getItem('syncup_token');
      const response = await axios.post(
        `${API_BASE}/api/hackathons/${hackathonId}/team/join`,
        { inviteCode: inviteCode.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Success', description: 'Successfully joined the team!' });
      setShowJoinTeam(false);
      setInviteCode('');
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to join team';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team? You will become a solo participant.')) return;

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(
        `${API_BASE}/api/hackathons/${hackathonId}/team/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Success', description: 'You have left the team and are now a solo participant.' });
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to leave team';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm('⚠️ Are you sure you want to delete this team?\n\nAll members will become solo participants. This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.delete(
        `${API_BASE}/api/hackathons/${hackathonId}/team/delete`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Success', description: 'Team deleted. All members are now solo participants.' });
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete team';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member? They will become a solo participant.')) return;

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(
        `${API_BASE}/api/hackathons/${hackathonId}/team/remove-member`,
        { memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Success', description: 'Member removed. They are now a solo participant.' });
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove member';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
  };

  const handleTransferLeadership = async () => {
    if (!selectedMember) {
      toast({ title: 'Error', description: 'Please select a member', variant: 'destructive' });
      return;
    }

    if (!confirm('Are you sure you want to transfer leadership? You will become a regular member.')) return;

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(
        `${API_BASE}/api/hackathons/${hackathonId}/team/transfer-leadership`,
        { newLeaderId: selectedMember },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Success', description: 'Leadership transferred successfully. You are now a member.' });
      setShowTransferLeadership(false);
      setSelectedMember('');
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to transfer leadership';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: 'Invite code copied to clipboard' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Hackathon not found</div>
      </div>
    );
  }

  const myTeam = registration?.teamId;
  const isLeader = registration?.role === 'leader';
  const isMember = registration?.role === 'member';
  const isSolo = registration?.role === 'solo';

  return (
    <>
      <Helmet>
        <title>{hackathon.name} - SyncUp</title>
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hackathon Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-xl mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">{hackathon.name}</h1>
            <p className="text-gray-300 mb-6">{hackathon.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{new Date(hackathon.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{hackathon.location}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Users className="h-5 w-5 mr-2" />
                <span>{hackathon.type}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Trophy className="h-5 w-5 mr-2" />
                <span>{hackathon.prize}</span>
              </div>
            </div>

            {!registration && (
              <Button onClick={handleRegister} className="glass-button">
                <CheckCircle className="h-4 w-4 mr-2" />
                Register for Hackathon
              </Button>
            )}

            {registration && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  Registered as {registration.role}
                </span>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Team Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">My Team</h2>

              {!registration && (
                <Card className="glass-card p-6">
                  <p className="text-gray-400">Register for the hackathon first to manage teams</p>
                </Card>
              )}

              {isSolo && (
                <Card className="glass-card p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Solo Participant</h3>
                    <p className="text-gray-300 text-sm">
                      You're registered as a solo participant. You can either create your own team or join an existing team using an invite code.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => setShowCreateTeam(true)} className="glass-button">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                    <Button onClick={() => setShowJoinTeam(true)} variant="outline" className="border-white/20">
                      <Users className="h-4 w-4 mr-2" />
                      Join Team
                    </Button>
                  </div>
                </Card>
              )}

              {myTeam && (
                <Card className="glass-card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{myTeam.name}</h3>
                        {isLeader && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                            LEADER
                          </span>
                        )}
                        {isMember && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                            MEMBER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-400">Invite Code:</span>
                        <code className="px-2 py-1 bg-white/5 rounded text-blue-400 font-mono">{myTeam.inviteCode}</code>
                        <Button size="sm" variant="ghost" onClick={() => copyInviteCode(myTeam.inviteCode)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {isLeader && (
                        <p className="text-xs text-gray-400 mt-2">
                          As leader, you can remove members, transfer leadership, or delete the team.
                        </p>
                      )}
                    </div>
                    {isLeader && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowTransferLeadership(true)} className="border-white/20">
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Transfer
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleDeleteTeam}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                    {isMember && (
                      <Button size="sm" variant="outline" onClick={handleLeaveTeam} className="border-white/20">
                        <UserMinus className="h-4 w-4 mr-2" />
                        Leave Team
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-400">Members ({myTeam.members?.length}/{myTeam.maxMembers})</h4>
                    {myTeam.members?.map((member) => (
                      <div key={member._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {member.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-sm text-gray-400">{member.email}</p>
                          </div>
                          {member._id === myTeam.leader?._id && (
                            <Crown className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        {isLeader && member._id !== user._id && (
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(member._id)}>
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* All Teams Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">All Teams ({teams.length})</h2>
              <div className="space-y-4">
                {teams.map((team) => (
                  <Card key={team._id} className="glass-card p-4">
                    <h3 className="text-lg font-bold text-white mb-2">{team.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Users className="h-4 w-4" />
                      <span>{team.members?.length}/{team.maxMembers} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span>{team.leader?.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="glass-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Create Team</h3>
            <Input
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mb-4 bg-white/5 border-white/10"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateTeam} className="glass-button flex-1">Create</Button>
              <Button onClick={() => setShowCreateTeam(false)} variant="outline" className="border-white/20">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="glass-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Join Team</h3>
            <Input
              placeholder="Enter Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="mb-4 bg-white/5 border-white/10"
            />
            <div className="flex gap-2">
              <Button onClick={handleJoinTeam} className="glass-button flex-1">Join</Button>
              <Button onClick={() => setShowJoinTeam(false)} variant="outline" className="border-white/20">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Transfer Leadership Modal */}
      {showTransferLeadership && myTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="glass-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Transfer Leadership</h3>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white mb-4"
            >
              <option value="">Select new leader</option>
              {myTeam.members?.filter(m => m._id !== user._id).map((member) => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleTransferLeadership} className="glass-button flex-1">Transfer</Button>
              <Button onClick={() => setShowTransferLeadership(false)} variant="outline" className="border-white/20">Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default HackathonDetail;
