import Hackathon from "../models/Hackathon.js";
import asyncHandler from "express-async-handler";

// @desc    Get Kanban board for a hackathon
// @route   GET /api/kanban/:hackathonId
// @access  Private
export const getKanbanBoard = asyncHandler(async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Convert Maps to objects for JSON response
    const kanbanData = {
      tasks: Object.fromEntries(hackathon.kanban?.tasks || new Map()),
      columns: Object.fromEntries(hackathon.kanban?.columns || new Map()),
      columnOrder: hackathon.kanban?.columnOrder || ['todo', 'inProgress', 'done']
    };

    res.json({ kanban: kanbanData });
  } catch (error) {
    console.error("Error fetching kanban:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Update Kanban board
// @route   PUT /api/kanban/:hackathonId
// @access  Private
export const updateKanbanBoard = asyncHandler(async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { tasks, columns, columnOrder } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Convert objects to Maps for storage
    hackathon.kanban = {
      tasks: new Map(Object.entries(tasks || {})),
      columns: new Map(Object.entries(columns || {})),
      columnOrder: columnOrder || ['todo', 'inProgress', 'done']
    };

    await hackathon.save();

    res.json({ message: "Kanban updated successfully", success: true });
  } catch (error) {
    console.error("Error updating kanban:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Add task to Kanban
// @route   POST /api/kanban/:hackathonId/task
// @access  Private
export const addTask = asyncHandler(async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { columnId, content, assignee } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const taskId = `task-${Date.now()}`;
    const newTask = {
      id: taskId,
      content,
      assignee: assignee || null,
      createdAt: new Date()
    };

    // Initialize kanban if it doesn't exist
    if (!hackathon.kanban) {
      hackathon.kanban = {
        tasks: new Map(),
        columns: new Map([
          ['todo', { id: 'todo', title: 'To Do', taskIds: [] }],
          ['inProgress', { id: 'inProgress', title: 'In Progress', taskIds: [] }],
          ['done', { id: 'done', title: 'Done', taskIds: [] }]
        ]),
        columnOrder: ['todo', 'inProgress', 'done']
      };
    }

    // Add task
    hackathon.kanban.tasks.set(taskId, newTask);

    // Add task ID to column
    const column = hackathon.kanban.columns.get(columnId);
    if (column) {
      column.taskIds.push(taskId);
      hackathon.kanban.columns.set(columnId, column);
    }

    await hackathon.save();

    res.json({ message: "Task added successfully", task: newTask, success: true });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
