import Hackathon from "../models/Hackathon.js";
import asyncHandler from "express-async-handler";

// @desc    Get workspace files for a project
// @route   GET /api/workspace/:projectId
// @access  Private
export const getWorkspaceFiles = asyncHandler(async (req, res) => {
  try {
    const { projectId } = req.params; // This is actually hackathonId

    const hackathon = await Hackathon.findById(projectId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Initialize workspace if it doesn't exist
    if (!hackathon.workspace) {
      hackathon.workspace = {
        files: [
          {
            fileName: 'index.js',
            content: '// Welcome to your collaborative workspace!\nconsole.log("Hello Team!");',
            language: 'javascript',
            lastModified: new Date(),
            lastModifiedBy: 'system'
          },
          {
            fileName: 'README.md',
            content: '# Team Project\n\nStart building something amazing!',
            language: 'markdown',
            lastModified: new Date(),
            lastModifiedBy: 'system'
          }
        ],
        activeUsers: []
      };
      await hackathon.save();
    }

    // Convert array to object for JSON response
    const files = hackathon.workspace.files || [];
    const filesObject = {};
    files.forEach(file => {
      filesObject[file.fileName] = {
        content: file.content,
        language: file.language,
        lastModified: file.lastModified,
        lastModifiedBy: file.lastModifiedBy
      };
    });

    console.log('✅ Returning workspace files:', Object.keys(filesObject));
    res.json({ 
      files: filesObject,
      projectId 
    });
  } catch (error) {
    console.error("Error fetching workspace files:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Save/update a file in workspace
// @route   PUT /api/workspace/:projectId/file
// @access  Private
export const saveWorkspaceFile = asyncHandler(async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileName, content, language } = req.body;

    const hackathon = await Hackathon.findById(projectId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Initialize workspace if it doesn't exist
    if (!hackathon.workspace) {
      hackathon.workspace = {
        files: [],
        activeUsers: []
      };
    }

    // Ensure files is an array
    if (!Array.isArray(hackathon.workspace.files)) {
      hackathon.workspace.files = [];
    }

    // Update or create file
    const fileIndex = hackathon.workspace.files.findIndex(f => f.fileName === fileName);
    
    const fileData = {
      fileName,
      content,
      language: language || getLanguageFromFileName(fileName),
      lastModified: new Date(),
      lastModifiedBy: req.user?.name || 'Unknown'
    };

    if (fileIndex >= 0) {
      // Update existing file
      hackathon.workspace.files[fileIndex] = fileData;
    } else {
      // Add new file
      hackathon.workspace.files.push(fileData);
    }

    await hackathon.save();

    console.log(`✅ File saved: ${fileName} in hackathon ${projectId}`);
    res.json({ 
      message: "File saved successfully",
      fileName,
      success: true 
    });
  } catch (error) {
    console.error("Error saving workspace file:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Delete a file from workspace
// @route   DELETE /api/workspace/:projectId/file/:fileName
// @access  Private
export const deleteWorkspaceFile = asyncHandler(async (req, res) => {
  try {
    const { projectId, fileName } = req.params;

    const hackathon = await Hackathon.findById(projectId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const files = hackathon.workspace?.files;
    if (!files || !Array.isArray(files)) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const fileIndex = files.findIndex(f => f.fileName === fileName);
    if (fileIndex === -1) {
      return res.status(404).json({ message: "File not found" });
    }

    // Remove the file
    files.splice(fileIndex, 1);
    await hackathon.save();

    console.log(`✅ File deleted: ${fileName} from hackathon ${projectId}`);
    res.json({ 
      message: "File deleted successfully",
      fileName,
      success: true 
    });
  } catch (error) {
    console.error("Error deleting workspace file:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Update active user status in workspace
// @route   POST /api/workspace/:projectId/active
// @access  Private
export const updateActiveUser = asyncHandler(async (req, res) => {
  try {
    const { projectId } = req.params;
    const { currentFile } = req.body;

    const hackathon = await Hackathon.findById(projectId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Initialize workspace if needed
    if (!hackathon.workspace) {
      hackathon.workspace = {
        files: [],
        activeUsers: []
      };
    }

    const activeUsers = hackathon.workspace.activeUsers;
    if (!Array.isArray(activeUsers)) {
      hackathon.workspace.activeUsers = [];
    }

    const userId = req.user._id.toString();
    const userIndex = activeUsers.findIndex(u => u.userId === userId);
    const userData = {
      userId,
      userName: req.user.name,
      currentFile,
      lastSeen: new Date()
    };

    if (userIndex >= 0) {
      activeUsers[userIndex] = userData;
    } else {
      activeUsers.push(userData);
    }

    await hackathon.save();

    res.json({ 
      message: "Active user updated",
      success: true 
    });
  } catch (error) {
    console.error("Error updating active user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Helper function to detect language from file extension
function getLanguageFromFileName(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'shell',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  return languageMap[ext] || 'plaintext';
}
