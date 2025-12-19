import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getKanbanBoard, updateKanbanBoard, addTask as addTaskAPI } from "@/api/kanban";

const KanbanBoard = () => {
  const { teamId, projectId } = useParams();
  const hackathonId = teamId || projectId;
  const [kanbanData, setKanbanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState({});

  useEffect(() => {
    const loadKanban = async () => {
      if (!hackathonId) return;
      try {
        setLoading(true);
        const data = await getKanbanBoard(hackathonId);
        setKanbanData(data);
      } catch (error) {
        console.error('Failed to load kanban:', error);
        toast({
          title: 'Error',
          description: 'Failed to load Kanban board',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    loadKanban();
  }, [hackathonId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = kanbanData.columns[source.droppableId];
    const finish = kanbanData.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, taskIds: newTaskIds };
      const newState = {
        ...kanbanData,
        columns: { ...kanbanData.columns, [newColumn.id]: newColumn },
      };
      setKanbanData(newState);
      
      // Save to backend
      try {
        await updateKanbanBoard(hackathonId, newState);
      } catch (error) {
        console.error('Failed to save kanban:', error);
      }
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    const newState = {
      ...kanbanData,
      columns: {
        ...kanbanData.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    setKanbanData(newState);
    
    // Save to backend
    try {
      await updateKanbanBoard(hackathonId, newState);
    } catch (error) {
      console.error('Failed to save kanban:', error);
    }
  };

  const addTask = async (columnId) => {
    if (!newTaskText[columnId]?.trim()) return;

    try {
      await addTaskAPI(hackathonId, columnId, newTaskText[columnId]);
      
      // Reload kanban
      const data = await getKanbanBoard(hackathonId);
      setKanbanData(data);
      setNewTaskText({ ...newTaskText, [columnId]: "" });
      
      toast({
        title: 'Task Added!',
        description: 'Your task has been added to the board.'
      });
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({
        title: 'Error',
        description: 'Failed to add task',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-3 text-gray-400">Loading Kanban board...</span>
      </div>
    );
  }

  if (!kanbanData) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>Failed to load Kanban board</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kanbanData.columnOrder.map((columnId) => {
          const column = kanbanData.columns[columnId];
          const tasks = column.taskIds.map((taskId) => kanbanData.tasks[taskId]);

          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="kanban-column rounded-2xl p-4 flex flex-col h-full bg-slate-900">
                <h3 className="text-lg font-bold text-white p-2 mb-4">
                  {column.title}
                </h3>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-grow p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? "bg-white/10" : ""
                      }`}
                    >
                      {tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card p-4 mb-4 rounded-xl ${
                                snapshot.isDragging ? "shadow-lg" : ""
                              }`}
                            >
                              <p className="text-white text-sm mb-3">
                                {task.content}
                              </p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center text-xs text-gray-400">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>Mar 28</span>
                                </div>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={task.assignee?.avatar}
                                    alt={task.assignee?.name}
                                  />
                                  <AvatarFallback>
                                    {task.assignee?.name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task Input */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskText[columnId] || ""}
                    onChange={(e) =>
                      setNewTaskText({ ...newTaskText, [columnId]: e.target.value })
                    }
                    placeholder="Add a task..."
                    className="flex-1 px-2 py-1 text-black rounded-md focus:outline-none"
                  />
                  <button
                    onClick={() => addTask(columnId)}
                    className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;