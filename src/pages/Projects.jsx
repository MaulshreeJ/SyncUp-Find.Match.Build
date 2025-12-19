import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Folder, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user projects on component mount
  useEffect(() => {
    if (user?._id) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('syncup_token');
      
      // Get all hackathons
      const hackathonsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/hackathons`);
      const hackathons = await hackathonsRes.json();

      // For each hackathon, check if user is registered with a team
      const projectsData = [];
      for (const hackathon of hackathons) {
        try {
          const regRes = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/hackathons/${hackathon._id}/my-registration`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (regRes.ok) {
            const registration = await regRes.json();
            
            // Only show if user has a team (not solo)
            if (registration.teamId) {
              projectsData.push({
                _id: hackathon._id,
                hackathonId: hackathon._id,
                hackathonName: hackathon.name,
                hackathonDate: hackathon.date,
                hackathonLocation: hackathon.location,
                hackathonPrize: hackathon.prize,
                team: registration.teamId,
                role: registration.role,
                projectName: registration.teamId.name || 'Untitled Project',
              });
            }
          }
        } catch (err) {
          // Not registered for this hackathon, skip
        }
      }

      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your projects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading your projects...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Projects - SyncUp</title>
        <meta
          name="description"
          content="Manage your hackathon projects, track progress, and collaborate with your team."
        />
        <meta property="og:title" content="My Projects - SyncUp" />
        <meta
          property="og:description"
          content="Manage your hackathon projects, track progress, and collaborate with your team."
        />
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="gradient-text">My Projects</span>
              </h1>
              <p className="text-xl text-gray-300">
                Track, manage, and collaborate on your hackathon projects.
              </p>
            </div>
            <Link to="/explorer">
              <Button className="glass-button">
                <Plus className="h-4 w-4 mr-2" />
                Join Hackathon
              </Button>
            </Link>
          </motion.div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project.hackathonId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="hackathon-card p-6 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {project.team?.name || 'Team Project'}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        project.role === 'leader' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {project.role === 'leader' ? 'LEADER' : 'MEMBER'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Folder className="h-4 w-4 mr-2" />
                        <span>{project.hackathonName}</span>
                      </div>
                      
                      {project.hackathonLocation && (
                        <div className="text-gray-400 text-xs">
                          📍 {project.hackathonLocation}
                        </div>
                      )}

                      {project.hackathonPrize && (
                        <div className="text-yellow-400 text-xs">
                          🏆 {project.hackathonPrize}
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-400 text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{project.team?.members?.length || 0} Team Members</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <Link to={`/hackathon/${project.hackathonId}`}>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        View Hackathon
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    <Link to={`/projects/${project.hackathonId}`}>
                      <Button className="w-full glass-button">
                        Open Project Room
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="glass-card p-12 rounded-2xl max-w-lg mx-auto">
                <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">
                  No Projects Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Join a hackathon and create/join a team to see your projects here.
                </p>
                <Link to="/explorer">
                  <Button className="glass-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Hackathons
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Projects;

