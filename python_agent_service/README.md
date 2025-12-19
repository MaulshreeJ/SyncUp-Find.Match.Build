# SyncUp Python AI Agent Service

FastAPI microservice that exposes both Career Agent and Matcher Agent workflows.

## Setup

### 1. Install Dependencies

```bash
cd python_agent_service
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file (already created):
```env
GOOGLE_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Start Service

```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

Service will run on: `http://localhost:8000`

## API Endpoints

### Career Agent Endpoints

- `POST /api/agent/coach` - Career coaching with full workflow
- `POST /api/agent/resume/analyze` - Resume ATS analysis
- `POST /api/agent/github/analyze` - GitHub profile analysis
- `POST /api/agent/workflow/full` - Complete career development workflow

### Matcher Agent Endpoints

- `POST /api/agent/matcher` - Team matching and mentor recommendations
- `POST /api/agent/hackathon/workflow` - Complete hackathon workflow

### Health Check

- `GET /health` - Service health status
- `GET /` - API documentation

## Architecture

```
python_agent_service/
├── main.py                    # FastAPI app
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
├── career_agent/              # Career development agent
│   ├── graph.py              # LangGraph workflows
│   ├── common.py             # Core functions
│   ├── enhanced_github_analyzer.py
│   └── data/                 # Mock data
└── agentic_zip/              # Matcher agent
    ├── graph.py              # LangGraph workflows
    ├── common.py             # Matching logic
    └── data/                 # Mock users/mentors
```

## Integration with Node.js Backend

The Node.js backend (`backend/services/agentService.js`) calls this Python service:

```javascript
const response = await fetch('http://localhost:8000/api/agent/coach', {
  method: 'POST',
  body: JSON.stringify({ message, user })
});
```

## Testing

Test the service directly:

```bash
curl -X POST http://localhost:8000/api/agent/coach \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "user": {"name": "Test", "skills": ["Python"]}}'
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8000   # Windows
```

### Import Errors
Make sure you're in the `python_agent_service` directory when running.

### Gemini API Errors
Check your `GOOGLE_API_KEY` in `.env` file.
