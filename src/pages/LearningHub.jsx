import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ExternalLink, 
  Heart, 
  Eye, 
  Star,
  Play,
  FileText,
  Code,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LearningHub = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedType, selectedDifficulty, searchTerm]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/resources`, {
        params: {
          category: selectedCategory,
          type: selectedType,
          difficulty: selectedDifficulty,
          search: searchTerm
        }
      });
      setResources(response.data.resources);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning resources',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const likeResource = async (resourceId) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to like resources',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('syncup_token');
      await axios.post(`${API_BASE}/api/resources/${resourceId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchResources();
    } catch (error) {
      console.error('Failed to like resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to like resource',
        variant: 'destructive'
      });
    }
  };

  const incrementViews = async (resourceId) => {
    try {
      await axios.post(`${API_BASE}/api/resources/${resourceId}/view`);
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: BookOpen },
    { value: 'Frontend', label: 'Frontend', icon: Code },
    { value: 'Backend', label: 'Backend', icon: Wrench },
    { value: 'AI', label: 'AI & ML', icon: Star },
    { value: 'Cloud', label: 'Cloud', icon: FileText },
    { value: 'Mobile', label: 'Mobile', icon: Play },
    { value: 'Design', label: 'Design', icon: Heart },
    { value: 'DevOps', label: 'DevOps', icon: Wrench },
    { value: 'General', label: 'General', icon: BookOpen }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return Play;
      case 'article': return FileText;
      case 'tutorial': return BookOpen;
      case 'documentation': return FileText;
      case 'tool': return Wrench;
      case 'course': return Star;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading learning resources...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Learning Hub - SyncUp</title>
        <meta name="description" content="Discover curated learning resources for hackathons, programming, and technology development." />
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
              <span className="gradient-text">Learning Hub</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover curated resources to level up your hackathon skills and technical knowledge.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-6 rounded-xl mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="article">Articles</option>
                  <option value="video">Videos</option>
                  <option value="tutorial">Tutorials</option>
                  <option value="documentation">Documentation</option>
                  <option value="tool">Tools</option>
                  <option value="course">Courses</option>
                </select>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
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
                    className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 flex items-center gap-2"
                  >
                    <category.icon className="h-4 w-4" />
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Resources Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resources.map((resource, index) => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <motion.div
                  key={resource._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="glass-card p-6 rounded-xl hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20">
                      <TypeIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{resource.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{resource.likes.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => likeResource(resource._id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Heart className={`h-4 w-4 ${user && resource.likes.includes(user._id) ? 'fill-current text-red-400' : ''}`} />
                      </Button>
                      <Button
                        onClick={() => {
                          incrementViews(resource._id);
                          window.open(resource.url, '_blank');
                        }}
                        className="glass-button"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {resources.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or filters.</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default LearningHub;