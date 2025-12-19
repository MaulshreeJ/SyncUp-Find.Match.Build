import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, navigate, currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('syncup_token');
      const response = await axios.get(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          search: searchTerm,
          status: statusFilter
        }
      });
      
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('syncup_token');
      await axios.patch(`${API_BASE}/api/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Success',
        description: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.delete(`${API_BASE}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Success',
        description: 'User deleted successfully'
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading users...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Users - Admin - SyncUp</title>
        <meta name="description" content="Manage SyncUp platform users - view, activate, deactivate, and delete user accounts." />
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
            <div className="flex items-center mb-4">
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="ghost"
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Manage <span className="gradient-text">Users</span>
            </h1>
            <p className="text-gray-400 text-lg">
              View and manage all registered users on the platform.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-6 rounded-xl mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((userData) => (
                    <tr key={userData._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`}
                            alt={userData.name}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-white">{userData.name}</div>
                            <div className="text-sm text-gray-400">{userData.title || 'No title'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {userData.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userData.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userData.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => toggleUserStatus(userData._id, userData.isActive)}
                            variant="ghost"
                            size="sm"
                            className={`${
                              userData.isActive 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-green-400 hover:text-green-300'
                            }`}
                          >
                            {userData.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          {userData.role !== 'admin' && (
                            <Button
                              onClick={() => deleteUser(userData._id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="ghost"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;