import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('syncup_token');
      // Try to get teams from admin endpoint or users
      const response = await axios.get(`${API_BASE}/api/admin/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      // If endpoint doesn't exist, show empty state
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;

  return (
    <>
      <Helmet><title>View Teams - Admin</title></Helmet>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">View <span className="gradient-text">Teams</span></h1>

          {teams.length === 0 ? (
            <div className="glass-card p-12 rounded-xl text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No teams found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {teams.map((team) => (
                <motion.div key={team._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                      <p className="text-gray-400 mb-4">{team.description || 'No description'}</p>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>👥 {team.members?.length || 0} members</span>
                        <span>🏆 {team.hackathon?.name || 'No hackathon'}</span>
                        <span>📅 Created {new Date(team.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminTeams;
