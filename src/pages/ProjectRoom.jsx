import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Link as LinkIcon, 
  ChevronLeft, 
  Edit3, 
  Save, 
  X,
  Github,
  ExternalLink,
  Users,
  Calendar,
  Trophy,
  Code
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import KanbanBoard from '@/components/projects/KanbanBoard';
import ChatRoom from '@/components/projects/ChatRoom';
import NotesLinks from '@/components/projects/NotesLinks';
import CollaborativeWorkspace from '@/components/workspace/CollaborativeWorkspace';
import { getProjectDetails, addOrUpdateProject } from '@/api/projects';

const ProjectRoom = () => {
  const { teamId, projectId } = useParams(); // teamId from /project-room/:teamId or projectId from /projects/:projectId
  const hackathonId = teamId || projectId; // Use whichever is available
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    projectName: '',
    description: '',
    techStack: '',
    githubLink: '',
    deploymentLink: '',
    status: 'Planning'
  });

  useEffect(() => {
    if (user?._id && hackathonId) {
      fetchProjectDetails();
    }
  }, [user, hackathonId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('syncup_token');
      
      // Fetch hackathon details
      const hackathonRes = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/hackathons/${hackathonId}`
      );
      const hackathon = await hackathonRes.json();

      // Fetch user's registration
      const regRes = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/hackathons/${hackathonId}/my-registration`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!regRes.ok) {
        throw new Error('Not registered for this hackathon');
      }

      const registration = await regRes.json();
      
      if (!registration.teamId) {
        throw new Error('You are not in a team for this hackathon');
      }

      // Build project data
      const projectData = {
        _id: hackathon._id,
        hackathonId: hackathon._id,
        hackathonName: hackathon.name,
        hackathonDate: hackathon.date,
        hackathonLocation: hackathon.location,
        hackathonPrize: hackathon.prize,
        team: registration.teamId,
        teamName: registration.teamId.name,
        teamMembers: registration.teamId.members || [],
        role: registration.role,
        projectName: registration.teamId.name,
        project: {
          description: '',
          techStack: [],
          githubLink: '',
          deploymentLink: '',
          status: 'Planning'
        }
      };

      setProject(projectData);
      
      // Initialize edit form
      setEditForm({
        projectName: projectData.projectName || '',
        description: projectData.project?.description || '',
        techStack: projectData.project?.techStack?.join(', ') || '',
        githubLink: projectData.project?.githubLink || '',
        deploymentLink: projectData.project?.deploymentLink || '',
        status: projectData.project?.status || 'Planning'
      });
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load project details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      // Update local state
      setProject({
        ...project,
        projectName: editForm.projectName,
        project: {
          ...project.project,
          description: editForm.description,
          techStack: editForm.techStack.split(',').map(tech => tech.trim()).filter(tech => tech),
          githubLink: editForm.githubLink,
          deploymentLink: editForm.deploymentLink,
          status: editForm.status
        }
      });
      
      toast({
        title: 'Project Updated!',
        description: 'Your project details have been saved locally.',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive'
      });
    }
  };

  const generateAvatar = (member) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.email || member.name)}`;
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Project - SyncUp</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-400">Loading project details...</div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Helmet>
          <title>Project Not Found - SyncUp</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center text-center">
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Project not found</h2>
            <p className="text-gray-400 mb-6">
              Debug info: User ID: {user?._id}, Hackathon ID: {hackathonId}
            </p>
            <Link to="/projects" className="text-blue-400 hover:underline">
              Go back to projects
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project?.projectName || 'Project Room'} - SyncUp</title>
        <meta name="description" content={`Collaborate on ${project?.projectName || 'your project'}. Access the Kanban board, chat, and notes.`} />
      </Helmet>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/projects" className="flex items-center text-blue-400 hover:text-blue-300 mb-6">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Projects
            </Link>
          </motion.div>

          {/* Project Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 rounded-2xl mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-white">
                    {project.projectName || `${project.teamName} Project`}
                  </h1>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-gray-400">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>{project.hackathonName}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Team: {project.teamName}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Joined: {new Date(project.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Project Name</Label>
                      <Input
                        id="edit-name"
                        value={editForm.projectName}
                        onChange={(e) => setEditForm({...editForm, projectName: e.target.value})}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <textarea
                        id="edit-description"
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-tech">Tech Stack</Label>
                      <Input
                        id="edit-tech"
                        value={editForm.techStack}
                        onChange={(e) => setEditForm({...editForm, techStack: e.target.value})}
                        placeholder="React, Node.js, MongoDB"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-github">GitHub Link</Label>
                        <Input
                          id="edit-github"
                          value={editForm.githubLink}
                          onChange={(e) => setEditForm({...editForm, githubLink: e.target.value})}
                          placeholder="https://github.com/..."
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-deployment">Deployment Link</Label>
                        <Input
                          id="edit-deployment"
                          value={editForm.deploymentLink}
                          onChange={(e) => setEditForm({...editForm, deploymentLink: e.target.value})}
                          placeholder="https://your-app.vercel.app"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProject} className="glass-button">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(false)} 
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.project?.description && (
                      <p className="text-gray-300">{project.project.description}</p>
                    )}
                    
                    {project.project?.techStack && project.project.techStack.length > 0 && (
                      <div>
                        <h3 className="text-white font-medium mb-2">Tech Stack:</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.project.techStack.map((tech, idx) => (
                            <span key={idx} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      {project.project?.githubLink && (
                        <a
                          href={project.project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
                      )}
                      {project.project?.deploymentLink && (
                        <a
                          href={project.project.deploymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div className="lg:w-80">
                <h3 className="text-white font-medium mb-4">Team Members ({project.teamMembers?.length || 0})</h3>
                <div className="space-y-3">
                  {project.teamMembers?.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Avatar className="border-2 border-slate-800">
                        <AvatarImage src={generateAvatar(member)} alt={member.name} />
                        <AvatarFallback>{member.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-gray-400 text-sm">{member.email}</p>
                        {project.isTeamLeader && member.email === user?.email && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Leader</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="kanban" className="space-y-6">
              <TabsList className="glass-card p-1 bg-white/5 border border-white/10">
                <TabsTrigger value="kanban" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Kanban Board
                </TabsTrigger>
                <TabsTrigger value="code" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                  <Code className="h-4 w-4 mr-2" />
                  Workspace
                </TabsTrigger>
                <TabsTrigger value="chat" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chatroom
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Notes & Links
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="kanban">
                <KanbanBoard />
              </TabsContent>
              <TabsContent value="code">
                <CollaborativeWorkspace projectId={hackathonId} />
              </TabsContent>
              <TabsContent value="chat">
                <ChatRoom />
              </TabsContent>
              <TabsContent value="notes">
                <NotesLinks />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProjectRoom;