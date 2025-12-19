import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ChevronRight, Folder, CheckCircle, Loader, Clock, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const ProjectCard = ({ project, index }) => {
  const getStatusChip = (status) => {
    switch (status) {
      case 'Planning':
        return (
          <div className="flex items-center text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
      case 'In Progress':
        return (
          <div className="flex items-center text-xs font-medium text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">
            <Loader className="h-3 w-3 mr-1 animate-spin" />
            {status}
          </div>
        );
      case 'Completed':
        return (
          <div className="flex items-center text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
      case 'Submitted':
        return (
          <div className="flex items-center text-xs font-medium text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
            <Play className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
      default:
        return (
          <div className="flex items-center text-xs font-medium text-gray-400 bg-gray-500/20 px-2 py-1 rounded-full">
            {status}
          </div>
        );
    }
  };

  // Generate avatar for team members
  const generateAvatar = (member) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.email || member.name)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="hackathon-card p-6 rounded-2xl flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">
            {project.projectName || `${project.teamName} Project`}
          </h3>
          {getStatusChip(project.project?.status || 'Planning')}
        </div>
        
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <Folder className="h-4 w-4 mr-2" />
          <span>{project.hackathonName}</span>
        </div>
        
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <Users className="h-4 w-4 mr-2" />
          <span>Team: {project.team?.name || 'No Team'}</span>
        </div>

        {project.hackathonLocation && (
          <div className="text-gray-400 text-xs mb-2">
            📍 {project.hackathonLocation}
          </div>
        )}

        {project.hackathonPrize && (
          <div className="text-yellow-400 text-xs mb-4">
            🏆 {project.hackathonPrize}
          </div>
        )}
        
        <div className="flex items-center text-gray-400 text-sm mb-4">
          <Users className="h-4 w-4 mr-2" />
          <span>{project.team?.members?.length || 0} Team Members</span>
        </div>
        
        <div className="flex -space-x-2">
          {project.team?.members?.slice(0, 4).map((member, idx) => (
            <Avatar key={idx} className="border-2 border-slate-800">
              <AvatarImage src={generateAvatar(member)} alt={member.name} />
              <AvatarFallback>{member.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          ))}
          {project.team?.members?.length > 4 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 border-2 border-slate-800 text-xs text-white">
              +{project.team.members.length - 4}
            </div>
          )}
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
  );
};

export default ProjectCard;