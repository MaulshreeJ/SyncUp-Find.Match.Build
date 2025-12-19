import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { getUserHackathons, addOrUpdateProject } from '@/api/projects';

const CreateProjectModal = ({ isOpen, setIsOpen, onProjectUpdate }) => {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [deploymentLink, setDeploymentLink] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHackathons, setFetchingHackathons] = useState(false);

  // Fetch user's joined hackathons when modal opens
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchUserHackathons();
    }
  }, [isOpen, user]);

  const fetchUserHackathons = async () => {
    try {
      setFetchingHackathons(true);
      const response = await getUserHackathons(user._id);
      setHackathons(response.hackathons || []);
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your hackathons',
        variant: 'destructive'
      });
    } finally {
      setFetchingHackathons(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectName.trim() || !selectedHackathon) {
      toast({
        title: 'Missing information',
        description: 'Please provide a project name and select a hackathon.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const projectData = {
        hackathonId: selectedHackathon,
        projectName: projectName.trim(),
        description: description.trim(),
        techStack: techStack.split(',').map(tech => tech.trim()).filter(tech => tech),
        githubLink: githubLink.trim(),
        deploymentLink: deploymentLink.trim(),
        status: 'Planning'
      };

      await addOrUpdateProject(projectData);
      
      toast({
        title: 'Project Created!',
        description: `"${projectName}" has been successfully created.`,
      });

      // Reset form
      resetForm();
      setIsOpen(false);
      
      // Notify parent to refresh projects
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProjectName('');
    setDescription('');
    setTechStack('');
    setGithubLink('');
    setDeploymentLink('');
    setSelectedHackathon('');
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">Create a New Project</DialogTitle>
          <DialogDescription>
            Add project details for one of your joined hackathons.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="hackathon">Select Hackathon *</Label>
            <Select 
              onValueChange={setSelectedHackathon} 
              value={selectedHackathon}
              disabled={fetchingHackathons}
            >
              <SelectTrigger id="hackathon" className="w-full bg-white/5 border-white/10">
                <SelectValue placeholder={
                  fetchingHackathons ? "Loading hackathons..." : 
                  hackathons.length === 0 ? "No hackathons joined yet" :
                  "Select a hackathon"
                } />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                {hackathons.map((hackathon) => (
                  <SelectItem 
                    key={hackathon.id} 
                    value={hackathon.id} 
                    className="cursor-pointer hover:bg-white/10"
                  >
                    <div className="flex flex-col">
                      <span>{hackathon.name}</span>
                      <span className="text-xs text-gray-400">Team: {hackathon.teamName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hackathons.length === 0 && !fetchingHackathons && (
              <p className="text-xs text-gray-400">
                Join a hackathon first to create projects
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., AI-Powered Code Reviewer"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project idea..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tech-stack">Tech Stack</Label>
            <Input
              id="tech-stack"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React, Node.js, MongoDB (comma separated)"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="github-link">GitHub Repository</Label>
            <Input
              id="github-link"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deployment-link">Deployment Link</Label>
            <Input
              id="deployment-link"
              value={deploymentLink}
              onChange={(e) => setDeploymentLink(e.target.value)}
              placeholder="https://your-project.vercel.app"
              className="bg-white/5 border-white/10"
            />
          </div>
        </form>
        
        <DialogFooter>
          <Button 
            onClick={handleClose} 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="glass-button"
            disabled={loading || !projectName.trim() || !selectedHackathon}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;