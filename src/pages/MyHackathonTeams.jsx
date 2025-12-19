import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Users,
  Crown,
  Calendar,
  MapPin,
  Trophy,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyHackathonTeams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyTeams();
    }
  }, [user]);

  const fetchMyTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('syncup_token');
      
      // Get all hackathons
      const hackathonsRes = await axios.get(`${API_BASE}/api/hackathons`);
      const hackathons = hackathonsRes.data;

      // For each hackathon, check if user is registered
      const teamsData = [];
      for (const hackathon of hackathons) {
        try {
          const regRes = await axios.get(
            `${API_BASE}/api/hackathons/${hackathon._id}/my-registration`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (regRes.data) {
            teamsData.push({
              hackathon: regRes.data.hackathon,
              registration: regRes.data,
              team: regRes.data.teamId,
            });
          }
        } catch (err) {
          // Not registered for this hackathon, skip
        }
      }

      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'leader') {
      return (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold flex items-center gap-1">
          <Crown className="h-3 w-3" />
          LEADER
        </span>
      );
    } else if (role === 'member') {
      return (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
          MEMBER
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-semibold">
          SOLO
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Hackathon Teams - SyncUp</title>
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">My Hackathon Teams</h1>
            <p className="text-gray-400">View all your hackathon registrations and teams</p>
          </motion.div>

          {/* Teams List */}
          {teams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 rounded-xl text-center"
            >
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Hackathon Teams Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Register for a hackathon to get started!
              </p>
              <Button
                onClick={() => navigate('/hackathons')}
                className="glass-button"
              >
                Browse Hackathons
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((item, index) => (
                <motion.div
                  key={item.hackathon._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => navigate(`/hackathons/${item.hackathon._id}`)}
                >
                  {/* Hackathon Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {item.hackathon.name}
                      </h3>
                      {getRoleBadge(item.registration.role)}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(item.hackathon.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {item.hackathon.location}
                      </div>
                      {item.hackathon.prize && (
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1" />
                          {item.hackathon.prize}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Info */}
                  {item.team ? (
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {item.team.name}
                        </h4>
                        <span className="text-sm text-gray-400">
                          {item.team.members?.length || 0}/{item.team.maxMembers} members
                        </span>
                      </div>

                      {/* Team Members Preview */}
                      <div className="flex items-center gap-2 mb-3">
                        {item.team.members?.slice(0, 5).map((member, idx) => (
                          <div
                            key={member._id}
                            className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold"
                            style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                          >
                            {member.name?.charAt(0)}
                          </div>
                        ))}
                        {item.team.members?.length > 5 && (
                          <span className="text-xs text-gray-400 ml-2">
                            +{item.team.members.length - 5} more
                          </span>
                        )}
                      </div>

                      {item.registration.role === 'leader' && (
                        <div className="text-xs text-gray-400">
                          Invite Code: <code className="px-2 py-1 bg-white/5 rounded text-blue-400 font-mono">{item.team.inviteCode}</code>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Solo Participant</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Create or join a team to collaborate
                      </p>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/hackathons/${item.hackathon._id}`);
                    }}
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyHackathonTeams;
