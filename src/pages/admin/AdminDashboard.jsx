import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Users, 
  Calendar, 
  Trophy, 
  MessageSquare, 
  BookOpen, 
  TrendingUp,
  UserCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('syncup_token');
      const response = await axios.get(`${API_BASE}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading admin dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: `+${stats?.newUsersThisWeek || 0} this week`
    },
    {
      title: 'Total Hackathons',
      value: stats?.totalHackathons || 0,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      change: `${stats?.ongoingHackathons || 0} ongoing`
    },
    {
      title: 'Active Teams',
      value: stats?.totalTeams || 0,
      icon: Trophy,
      color: 'from-green-500 to-green-600',
      change: 'All time'
    },
    {
      title: 'Community Posts',
      value: stats?.totalPosts || 0,
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
      change: 'All time'
    },
    {
      title: 'Learning Resources',
      value: stats?.totalResources || 0,
      icon: BookOpen,
      color: 'from-teal-500 to-teal-600',
      change: 'All time'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      color: 'from-pink-500 to-pink-600',
      change: 'Currently active'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View, activate, or deactivate user accounts',
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/20',
      href: '/admin/users'
    },
    {
      title: 'Manage Hackathons',
      description: 'Create, edit, or delete hackathon events',
      icon: Calendar,
      color: 'from-purple-500/20 to-purple-600/20',
      href: '/admin/hackathons'
    },
    {
      title: 'View Teams',
      description: 'Monitor team formations and activities',
      icon: Trophy,
      color: 'from-green-500/20 to-green-600/20',
      href: '/admin/teams'
    },
    {
      title: 'Announcements',
      description: 'Create platform-wide announcements',
      icon: MessageSquare,
      color: 'from-orange-500/20 to-orange-600/20',
      href: '/admin/announcements'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - SyncUp</title>
        <meta name="description" content="SyncUp admin dashboard for managing users, hackathons, and platform settings." />
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your SyncUp platform with comprehensive admin tools.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {statCards.map((stat, index) => (
              <div key={stat.title} className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-gray-400">{stat.change}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  onClick={() => navigate(action.href)}
                  className="glass-card p-6 rounded-xl text-left hover:bg-white/10 transition-all group"
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} mb-4 w-fit`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-6 rounded-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm">New users registered</p>
                    <p className="text-gray-400 text-xs">Last 7 days</p>
                  </div>
                </div>
                <span className="text-blue-400 font-semibold">+{stats?.newUsersThisWeek || 0}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-500/20">
                    <Calendar className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm">New hackathons created</p>
                    <p className="text-gray-400 text-xs">Last 7 days</p>
                  </div>
                </div>
                <span className="text-purple-400 font-semibold">+{stats?.newHackathonsThisWeek || 0}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <Trophy className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm">Active hackathons</p>
                    <p className="text-gray-400 text-xs">Currently running</p>
                  </div>
                </div>
                <span className="text-green-400 font-semibold">{stats?.ongoingHackathons || 0}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;