import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { filtersData } from '@/data/teamMatchmaking';
import TeammateCard from '@/components/matchmaking/TeammateCard';
import FilterControls from '@/components/matchmaking/FilterControls';
import MyTeamSection from '@/components/matchmaking/MyTeamSection';
import { sendConnection } from "@/api/connection";
const TeamMatchmaking = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [connectedUsers, setConnectedUsers] = useState(new Set());

  // remote data
  const [teammatesData, setTeammatesData] = useState(null); // null = loading, [] = loaded
  const [loading, setLoading] = useState(true);

  // fetch public users from backend and map to teammate shape
  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/users', { timeout: 10000 });
        if (cancelled) return;
        const users = Array.isArray(res.data) ? res.data : [];
        // map backend user -> teammate shape expected by UI
        const mapped = users.map((u) => ({
          id: u._id,
          name: u.name || 'Unknown',
          email: u.email || '',
          title: u.title || u.bio || '',
          avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || u._id)}`,
          skills: Array.isArray(u.skills) ? u.skills : (u.skills ? String(u.skills).split(',').map(s => s.trim()) : []),
          preferredRoles: Array.isArray(u.preferredRoles) ? u.preferredRoles : [],
          availability: u.availability || 'Available',
          experience: u.experience || '', // optional
          location: u.location || '',
          joinedAt: u.joinedAt || u.createdAt || null,
          bio: u.bio || ''
        }));
        setTeammatesData(mapped);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setTeammatesData([]); // avoid null stuck
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Could not load users';
        toast({ title: 'Failed to load users', description: msg, variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();
    return () => { cancelled = true; };
  }, []);

  // filtered teammates based on search & selectedFilter
  const filteredTeammates = useMemo(() => {
    if (!teammatesData) return [];
    const term = (searchTerm || '').toLowerCase().trim();
    return teammatesData.filter((teammate) => {
      // search match: name, title, skills, email
      const matchesSearch =
        !term ||
        (teammate.name || '').toLowerCase().includes(term) ||
        (teammate.title || '').toLowerCase().includes(term) ||
        (teammate.email || '').toLowerCase().includes(term) ||
        (teammate.skills || []).some((skill) => String(skill).toLowerCase().includes(term));

      // filter match: based on your existing filters structure
      const matchesFilter = selectedFilter === 'all' ||
        (selectedFilter === 'available' && (teammate.availability || '').toLowerCase() === 'available') ||
        (teammate.preferredRoles || []).some((role) => role.toLowerCase().includes(selectedFilter.replace('-', ' ')));

      return matchesSearch && matchesFilter;
    });
  }, [teammatesData, searchTerm, selectedFilter]);

  

const handleConnect = async (teammateId) => {
  try {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const senderId = loggedInUser?._id;

    if (!senderId) {
      toast({
        title: "User not logged in",
        description: "Please log in before sending connections.",
        variant: "destructive",
      });
      return;
    }

    await sendConnection(senderId, teammateId);

    const newConnected = new Set(connectedUsers);
    newConnected.add(teammateId);
    setConnectedUsers(newConnected);

    toast({
      title: "Connection request sent!",
      description: "Your connection request has been sent successfully.",
    });
  } catch (err) {
    const msg = err.response?.data?.message || "Failed to send connection.";
    toast({
      title: "Error",
      description: msg,
      variant: "destructive",
    });
  }
};

const handleMessage = (teammate) => {
  console.log('🔵 handleMessage called with teammate:', teammate);
  const userId = teammate.id || teammate._id;
  console.log('🔵 User ID:', userId);
  
  if (!userId) {
    console.error('❌ No user ID found in teammate object');
    return;
  }
  
  console.log('🔵 Navigating to:', `/messages?user=${userId}`);
  navigate(`/messages?user=${userId}`);
};


  // UI states
  if (loading || teammatesData === null) {
    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="text-gray-400">Loading teammates…</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Team Matchmaking - SyncUp</title>
        <meta name="description" content="Find and connect with ideal hackathon teammates based on skills, experience, and project preferences." />
        <meta property="og:title" content="Team Matchmaking - SyncUp" />
        <meta property="og:description" content="Find and connect with ideal hackathon teammates based on skills, experience, and project preferences." />
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Find Your Perfect Teammates</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with talented developers, designers, and innovators who share your passion for building amazing projects.
            </p>
          </motion.div>

          <FilterControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            filters={filtersData}
          />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-6">
            <p className="text-gray-400">
              Showing {filteredTeammates.length} of {teammatesData.length} potential teammates
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeammates.map((teammate, index) => (
              <TeammateCard
                key={teammate.id}
                teammate={teammate}
                isConnected={connectedUsers.has(teammate.id)}
                onConnect={handleConnect}
                onMessage={handleMessage}
                index={index}
              />
            ))}
          </motion.div>

          {filteredTeammates.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center py-12">
              <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No teammates found</h3>
                <p className="text-gray-400">Try adjusting your search terms or filters to find more potential teammates.</p>
              </div>
            </motion.div>
          )}

          <MyTeamSection
            connectedUsers={connectedUsers}
            teammates={teammatesData}
            onMessage={handleMessage}
          />
        </div>
      </div>
    </>
  );
};

export default TeamMatchmaking;
