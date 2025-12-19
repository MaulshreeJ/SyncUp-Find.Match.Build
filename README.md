# SyncUp - Hackathon Collaboration Platform

A comprehensive platform for hackathon team formation, project collaboration, and skill development with AI-powered coaching.

##  Features

### Core Features
- **User Authentication & Profiles** - Secure registration and login system
- **Hackathon Explorer** - Browse and join upcoming hackathons
- **Team Matchmaking** - Find teammates based on skills and interests
- **Real-time Collaboration** - Live code editor with Monaco Editor
- **Direct Messaging** - LinkedIn-style messaging system
- **AI Coach** - Personalized guidance and recommendations
- **Project Management** - Kanban boards, notes, and links
- **Learning Hub** - Curated resources for skill development
- **Admin Dashboard** - Complete platform management

### Advanced Features
- **Socket.IO Real-time Updates** - Live collaboration and messaging
- **AI-Powered Recommendations** - Smart teammate matching and project ideas
- **Multi-role Team System** - Leaders, members, and role management
- **Invite Code System** - Easy team joining with unique codes
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Monaco Editor** - VS Code-like code editor
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

### AI Services
- **Python FastAPI** - AI service backend
- **Google Gemini AI** - Large language model
- **LangGraph** - AI workflow orchestration
- **Custom AI Agents** - Career coaching and team matching

##  Project Structure

```
syncup-platform/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Page components
│   ├── contexts/                 # React contexts (Auth, etc.)
│   ├── api/                      # API service functions
│   └── assets/                   # Static assets
├── backend/                      # Node.js backend
│   ├── controllers/              # Route controllers
│   ├── models/                   # MongoDB models
│   ├── routes/                   # API routes
│   ├── middleware/               # Custom middleware
│   ├── config/                   # Configuration files
│   └── scripts/                  # Database seeding scripts
├── python_agent_service/         # AI services
│   ├── career_agent/             # Career coaching AI
│   ├── agentic_zip/              # Team matching AI
│   └── main.py                   # FastAPI main application
└── docs/                         # Documentation files
```

##  Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- MongoDB (local or cloud)

### Video Demonstration (AI Agent Walkthrough)

Watch the full video demonstration showcasing the **AI-powered agents** used in **SyncUp** — including **career coaching**, **intelligent team matchmaking**, and **real-time project guidance**.

**Drive Link:**  
 https://drive.google.com/file/d/1aguw3Tmxeq1Zrxe9P2-BCP5UGLUNalNh/view?usp=drivesdk

> The demo highlights:
> - AI Career Coach in action
> - Team Matching Agent recommendations
> - Agent-driven collaboration workflow
> - Practical usage during a live hackathon scenario


### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/syncup-platform.git
   cd syncup-platform
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Install Python dependencies**
   ```bash
   cd python_agent_service
   pip install -r requirements.txt
   cd ..
   ```

5. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/syncup
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   PYTHON_SERVICE_URL=http://localhost:8000
   ```

   Create `python_agent_service/.env`:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   NODE_API_URL=http://localhost:5000
   ```

6. **Seed the database**
   ```bash
   cd backend
   node scripts/seedHackathons.js
   node scripts/seedResources.js
   node scripts/seedAdmin.js
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Python AI service**
   ```bash
   cd python_agent_service
   python main.py
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - AI Service: http://localhost:8000

##  Usage

### For Participants
1. **Register** for an account
2. **Browse hackathons** in the Explorer
3. **Join hackathons** and create/join teams
4. **Collaborate** in real-time using the project workspace
5. **Get AI coaching** for project ideas and strategies
6. **Message teammates** directly

### For Organizers
1. **Create hackathons** through the admin panel
2. **Manage participants** and teams
3. **Monitor platform** usage and engagement

### For Admins
1. **Full platform control** through admin dashboard
2. **User management** and moderation
3. **Content management** for resources and announcements

##  AI Features

### Career Coach
- Personalized project recommendations
- Skill development guidance
- Resume analysis and feedback
- GitHub profile insights

### Team Matcher
- Smart teammate recommendations
- Skill complementarity analysis
- Team formation strategies
- Collaboration tips

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Hackathons
- `GET /api/hackathons` - List all hackathons
- `POST /api/hackathons/:id/register` - Register for hackathon
- `POST /api/hackathons/:id/team/create` - Create team
- `POST /api/hackathons/:id/team/join` - Join team

### Messages
- `GET /api/messages` - Get conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages/:userId` - Send message

### AI Services
- `POST /api/ai/coach` - Career coaching
- `POST /api/ai/matcher` - Team matching
- `POST /api/ai/resume/analyze` - Resume analysis

##  Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Deploy backend/ folder
```

### Python Service (Railway/Render)
```bash
# Set environment variables
# Deploy python_agent_service/ folder
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Google Gemini AI** for powering the AI coaching features
- **MongoDB** for the flexible database solution
- **Socket.IO** for real-time communication
- **React** and **Vite** for the modern frontend experience

##  Support

For support, email support@syncup.ai or join our Discord community.



---

Built with ❤️ for the hackathon community
