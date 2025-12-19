import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Heart, 
  MessageCircle, 
  User, 
  Calendar,
  Tag,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
    tags: ''
  });

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/community`, {
        params: {
          category: selectedCategory,
          search: searchTerm
        }
      });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load community posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create posts',
        variant: 'destructive'
      });
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both title and content',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(`${API_BASE}/api/community`, {
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'Post created successfully'
      });

      setNewPost({ title: '', content: '', category: 'General', tags: '' });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive'
      });
    }
  };

  const likePost = async (postId) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to like posts',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(`${API_BASE}/api/community/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (error) {
      console.error('Failed to like post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive'
      });
    }
  };

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'General', label: 'General' },
    { value: 'Help', label: 'Help & Support' },
    { value: 'Showcase', label: 'Project Showcase' },
    { value: 'Discussion', label: 'Discussion' },
    { value: 'Question', label: 'Questions' }
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Help': return 'text-red-400 bg-red-500/20';
      case 'Showcase': return 'text-green-400 bg-green-500/20';
      case 'Discussion': return 'text-blue-400 bg-blue-500/20';
      case 'Question': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading community posts...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Community - SyncUp</title>
        <meta name="description" content="Join the SyncUp community - share projects, ask questions, and connect with fellow developers." />
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Community</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with fellow developers, share your projects, and get help from the community.
            </p>
          </motion.div>

          {/* Search and Create */}
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
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="glass-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>

            {/* Create Post Form */}
            {showCreatePost && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="What's on your mind?"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex gap-4">
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Help">Help & Support</option>
                      <option value="Showcase">Project Showcase</option>
                      <option value="Discussion">Discussion</option>
                      <option value="Question">Question</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tags (comma-separated)"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => setShowCreatePost(false)}
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createPost}
                      className="glass-button"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="glass-card p-1 bg-white/5 border border-white/10 flex-wrap h-auto">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.value}
                    value={category.value}
                    className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="glass-card p-6 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => navigate(`/community/post/${post._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.email}`}
                      alt={post.author.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <h4 className="text-white font-medium">{post.author.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>

                <p className="text-gray-300 mb-4 line-clamp-3">
                  {post.content}
                </p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="flex items-center px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        likePost(post._id);
                      }}
                      className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${user && post.likes.includes(user._id) ? 'fill-current text-red-400' : ''}`} />
                      <span>{post.likes.length}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/community/post/${post._id}`);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Read More
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
              <p className="text-gray-400">Be the first to start a conversation!</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Community;