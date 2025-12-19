import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { MessageSquare, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('syncup_token');
      if (!token) {
        toast({ title: 'Error', description: 'Please login first', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_BASE}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      if (error.response?.status === 401) {
        toast({ title: 'Error', description: 'Unauthorized. Please login again.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(`${API_BASE}/api/announcements`, newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Success', description: 'Announcement created!' });
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create announcement', variant: 'destructive' });
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const token = localStorage.getItem('syncup_token');
      await axios.delete(`${API_BASE}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Success', description: 'Announcement deleted' });
      fetchAnnouncements();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;

  return (
    <>
      <Helmet><title>Announcements - Admin</title></Helmet>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8"><span className="gradient-text">Announcements</span></h1>

          <div className="glass-card p-6 rounded-xl mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Create New Announcement</h3>
            <div className="space-y-4">
              <Input placeholder="Title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="bg-white/5 border-white/10" />
              <textarea placeholder="Message" value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={4} />
              <Button onClick={createAnnouncement} className="glass-button w-full"><Plus className="h-4 w-4 mr-2" />Create Announcement</Button>
            </div>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <motion.div key={announcement._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 rounded-xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{announcement.title}</h3>
                    <p className="text-gray-400 mb-2">{announcement.content}</p>
                    <p className="text-gray-500 text-sm">Posted {new Date(announcement.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(announcement._id)} className="text-red-400"><Trash className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAnnouncements;
