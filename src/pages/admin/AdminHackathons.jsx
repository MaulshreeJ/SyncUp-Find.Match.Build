import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, Plus, Edit, Trash, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminHackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHackathon, setNewHackathon] = useState({
    name: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    type: 'Virtual',
    theme: '',
    difficulty: 'Beginner',
    participantsLimit: 100,
    prize: '',
    organizer: ''
  });

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/hackathons`);
      setHackathons(response.data);
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hackathons',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addHackathon = async () => {
    if (!newHackathon.name || !newHackathon.date || !newHackathon.endDate) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(`${API_BASE}/api/hackathons`, newHackathon, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Success', description: 'Hackathon created successfully!' });
      setShowAddForm(false);
      setNewHackathon({
        name: '', description: '', date: '', endDate: '', location: '',
        type: 'Virtual', theme: '', difficulty: 'Beginner', participantsLimit: 100,
        prize: '', organizer: ''
      });
      fetchHackathons();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create hackathon', variant: 'destructive' });
    }
  };

  const deleteHackathon = async (id) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return;

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.delete(`${API_BASE}/api/hackathons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Success', description: 'Hackathon deleted successfully' });
      fetchHackathons();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete hackathon', variant: 'destructive' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;

  return (
    <>
      <Helmet><title>Manage Hackathons - Admin</title></Helmet>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Manage <span className="gradient-text">Hackathons</span></h1>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="glass-button">
              <Plus className="h-4 w-4 mr-2" />{showAddForm ? 'Cancel' : 'Add Hackathon'}
            </Button>
          </div>

          {showAddForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-xl mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Create New Hackathon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Name *" value={newHackathon.name} onChange={(e) => setNewHackathon({...newHackathon, name: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Theme" value={newHackathon.theme} onChange={(e) => setNewHackathon({...newHackathon, theme: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="date" placeholder="Start Date *" value={newHackathon.date} onChange={(e) => setNewHackathon({...newHackathon, date: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="date" placeholder="End Date *" value={newHackathon.endDate} onChange={(e) => setNewHackathon({...newHackathon, endDate: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Location" value={newHackathon.location} onChange={(e) => setNewHackathon({...newHackathon, location: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={newHackathon.type} onChange={(e) => setNewHackathon({...newHackathon, type: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Virtual">Virtual</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <select value={newHackathon.difficulty} onChange={(e) => setNewHackathon({...newHackathon, difficulty: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <input type="number" placeholder="Participants Limit" value={newHackathon.participantsLimit} onChange={(e) => setNewHackathon({...newHackathon, participantsLimit: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Prize" value={newHackathon.prize} onChange={(e) => setNewHackathon({...newHackathon, prize: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Organizer" value={newHackathon.organizer} onChange={(e) => setNewHackathon({...newHackathon, organizer: e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea placeholder="Description" value={newHackathon.description} onChange={(e) => setNewHackathon({...newHackathon, description: e.target.value})} className="md:col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} />
              </div>
              <Button onClick={addHackathon} className="glass-button w-full mt-4"><Plus className="h-4 w-4 mr-2" />Create Hackathon</Button>
            </motion.div>
          )}

          <div className="grid gap-6">
            {hackathons.map((hackathon) => (
              <motion.div key={hackathon._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 rounded-xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{hackathon.name}</h3>
                    <p className="text-gray-400 mb-4">{hackathon.description}</p>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>📅 {new Date(hackathon.date).toLocaleDateString()}</span>
                      <span>📍 {hackathon.location}</span>
                      <span>👥 {hackathon.participants?.length || 0} teams</span>
                      <span className={`px-2 py-1 rounded ${hackathon.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' : hackathon.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{hackathon.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteHackathon(hackathon._id)} className="text-red-400"><Trash className="h-4 w-4" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHackathons;
