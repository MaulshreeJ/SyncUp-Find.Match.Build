import React, { createContext, useContext, useState, useEffect } from 'react';
import { teammatesData } from '@/data/teamMatchmaking';

const ProjectContext = createContext();

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};

const initialProjects = [
    {
        id: 'proj-1',
        name: 'AI-Powered Code Reviewer',
        hackathon: 'AI Innovation Challenge 2024',
        status: 'In Progress',
        team: [teammatesData[0], teammatesData[1]],
    },
    {
        id: 'proj-2',
        name: 'Eco-Friendly Route Planner',
        hackathon: 'Green Tech Hackathon',
        status: 'Completed',
        team: [teammatesData[2], teammatesData[3], teammatesData[4]],
    },
];

const initialTasks = {
    'task-1': { id: 'task-1', content: 'Set up project structure', assignee: teammatesData[0] },
    'task-2': { id: 'task-2', content: 'Design landing page UI', assignee: teammatesData[4] },
    'task-3': { id: 'task-3', content: 'Develop authentication flow', assignee: teammatesData[0] },
    'task-4': { id: 'task-4', content: 'Implement ML model for routing', assignee: teammatesData[1] },
    'task-5': { id: 'task-5', content: 'Create database schema', assignee: teammatesData[3] },
};

const initialColumns = {
    'column-1': {
        id: 'column-1',
        title: 'To Do',
        taskIds: ['task-1', 'task-2', 'task-5'],
    },
    'column-2': {
        id: 'column-2',
        title: 'In Progress',
        taskIds: ['task-3'],
    },
    'column-3': {
        id: 'column-3',
        title: 'Done',
        taskIds: ['task-4'],
    },
};
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(initialProjects);
  const [kanbanData, setKanbanData] = useState({
    tasks: initialTasks,
    columns: initialColumns,
    columnOrder: ['column-1', 'column-2', 'column-3'],
  });

  // Optional: sync with localStorage after first render
  useEffect(() => {
    const storedProjects = localStorage.getItem('syncup_projects');
    if (storedProjects) setProjects(JSON.parse(storedProjects));

    const storedKanban = localStorage.getItem('syncup_kanban_data');
    if (storedKanban) setKanbanData(JSON.parse(storedKanban));
  }, []);

  useEffect(() => {
    localStorage.setItem('syncup_projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (project) => {
    setProjects([...projects, project]);
  };

  const updateKanbanData = (newKanbanData) => {
    setKanbanData(newKanbanData);
  };
  useEffect(() => {
  localStorage.setItem('syncup_kanban_data', JSON.stringify(kanbanData));
}, [kanbanData]);


  return (
    <ProjectContext.Provider value={{ projects, addProject, kanbanData, updateKanbanData }}>
      {children}
    </ProjectContext.Provider>
  );
};