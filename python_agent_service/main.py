"""
FastAPI Microservice for SyncUp AI Agents
Exposes both Career Agent and Matcher Agent workflows
Uses real MongoDB data via Node.js API
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import sys
import os
from pathlib import Path

# Import agent tools for database access
from tools import agent_tools
from pdf_utils import extract_text_from_pdf

# Add agent folders to path - IMPORTANT: Order matters!
career_agent_path = str(Path(__file__).parent / "career_agent")
agentic_zip_path = str(Path(__file__).parent / "agentic_zip")

# Insert career_agent first so its modules take precedence
sys.path.insert(0, career_agent_path)
sys.path.insert(1, agentic_zip_path)

# Import career agent workflows
try:
    from graph import (
        full_career_development_workflow,
        quick_skill_analysis_workflow,
        enhanced_resume_analysis_graph_workflow
    )
    from common import extract_github_data, enhanced_resume_analysis_workflow
    career_agent_imported = True
except ImportError as e:
    print(f"Warning: Could not import career agent: {e}")
    career_agent_imported = False

# Now switch to agentic_zip for matcher imports
sys.path.insert(0, agentic_zip_path)

# Import matcher agent workflows
try:
    import graph as matcher_graph
    import common as matcher_common
    matcher_agent_imported = True
except ImportError as e:
    print(f"Warning: Could not import matcher agent: {e}")
    matcher_agent_imported = False

app = FastAPI(title="SyncUp AI Agent Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Request/Response Models ============

class CareerCoachRequest(BaseModel):
    message: str
    user: Dict[str, Any]

class MatcherRequest(BaseModel):
    user_profile: Dict[str, Any]
    candidates: Optional[List[Dict[str, Any]]] = None
    action: str = "matchmake"  # matchmake, mentor, hackathon

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_role: str = "Software Engineer"
    user_id: str = "default"

class GitHubAnalysisRequest(BaseModel):
    username: str

class FullWorkflowRequest(BaseModel):
    input_data: str
    input_type: str  # "resume" or "github"
    target_role: str
    user_id: str = "default"

class HackathonWorkflowRequest(BaseModel):
    duration: str
    user_skills: List[str]
    required_skills: List[str]
    goal: str
    max_iterations: int = 5

# ============ Career Agent Endpoints ============

@app.post("/api/agent/coach")
async def career_coach(request: CareerCoachRequest):
    """
    Career Coach - Provides conversational AI coaching and guidance
    Uses the career agent's full workflow capabilities
    USES REAL DATABASE DATA via Node.js API
    """
    if not career_agent_imported:
        raise HTTPException(status_code=503, detail="Career agent not available")
    
    try:
        user = request.user
        message = request.message
        
        print(f"[DEBUG] Received message: {message[:100]}...")
        print(f"[DEBUG] User ID: {user.get('id')}")
        
        # Get real user data from database
        user_id = user.get("id")
        if user_id:
            db_user = agent_tools.get_user_profile(user_id)
            user_projects = agent_tools.get_user_projects(user_id)
            user_hackathons = agent_tools.get_user_hackathons(user_id)
            user_connections = agent_tools.get_user_connections(user_id)
            
            # Enrich user context with real DB data
            user["db_profile"] = db_user
            user["projects"] = user_projects
            user["hackathons"] = user_hackathons
            user["connections"] = user_connections
            user["connection_count"] = len(user_connections)
        
        # Determine if this is a workflow request or simple chat
        message_lower = message.lower()
        
        print(f"[DEBUG] Message contains 'resume': {'resume' in message_lower}")
        print(f"[DEBUG] Message contains 'analyze': {'analyze' in message_lower}")
        
        # Check if user wants resume analysis
        # The resume text is in the message itself after "suggestions:"
        if "resume" in message_lower and "analyze" in message_lower:
            # Extract resume text from message (it comes after the prompt)
            resume_text = None
            if "suggestions:" in message or "suggestions:\n\n" in message:
                # Resume text is after the prompt
                parts = message.split("suggestions:", 1)
                if len(parts) > 1:
                    resume_text = parts[1].strip()
            
            # If no resume in message, check user profile
            if not resume_text:
                resume_text = user.get("resume_text")
            
            if resume_text:
                print(f"[DEBUG] Analyzing resume, length: {len(resume_text)}")
                # Use the default chat handler with resume analysis context
                # This will use call_llm which works
                from common import call_llm
                
                analysis_prompt = f"""
You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.

Analyze this resume and provide a WELL-STRUCTURED analysis using this EXACT format:

# 📊 Resume ATS Analysis

## 🎯 Overall ATS Score: [X/100]
[One sentence summary of overall assessment]

---

## ✅ Key Strengths
1. **[Strength Title]**: [Specific detail with evidence from resume]
2. **[Strength Title]**: [Specific detail with evidence from resume]
3. **[Strength Title]**: [Specific detail with evidence from resume]

---

## ⚠️ Areas for Improvement
1. **[Issue Title]**: [Specific problem and why it matters]
2. **[Issue Title]**: [Specific problem and why it matters]
3. **[Issue Title]**: [Specific problem and why it matters]

---

## 🔑 Keyword Analysis

### ✓ Keywords Present
[List relevant keywords found in the resume]

### ✗ Keywords Missing
[List important keywords that should be added for target roles]

---

## 📝 Formatting Assessment
- **Structure**: [Assessment]
- **Readability**: [Assessment]
- **ATS Compatibility**: [Assessment]

---

## 🎯 Priority Action Items

### 🔴 High Priority (Fix Immediately)
1. [Specific action with clear instructions]
2. [Specific action with clear instructions]

### 🟡 Medium Priority (Important)
1. [Specific action with clear instructions]
2. [Specific action with clear instructions]

### 🟢 Low Priority (Nice to Have)
1. [Specific action with clear instructions]

---

## 💡 Final Recommendation
[2-3 sentences with overall guidance and encouragement]

---

RESUME TEXT:
{resume_text}

Provide your structured analysis following the format above EXACTLY:
"""
                
                reply = call_llm(analysis_prompt)
                
                return {
                    "type": "resume_analysis",
                    "reply": reply,
                    "message": reply
                }
        
        # Check if user wants GitHub analysis
        elif "github" in message_lower and ("analyze" in message_lower or "profile" in message_lower):
            if user.get("github_username"):
                result = extract_github_data(user["github_username"])
                return {
                    "type": "github_analysis",
                    "result": result,
                    "message": f"I've analyzed the GitHub profile for {user['github_username']}:"
                }
        
        # Check if user wants teammates (USES REAL DB DATA)
        elif any(word in message_lower for word in ["teammate", "team member", "find team", "team match"]):
            # Extract required skills from message or use user's skills
            user_skills = user.get("skills", [])
            
            # Find real teammates from database
            teammates = agent_tools.find_teammates(
                user_id=user_id,
                required_skills=user_skills
            )
            
            if teammates:
                # Use AI to provide reasoning for matches
                from common import call_llm
                
                teammates_summary = ""
                for i, teammate in enumerate(teammates[:5], 1):
                    teammates_summary += f"\n{i}. {teammate['name']} (Match: {teammate['match_score']}/10)"
                    teammates_summary += f"\n   Skills: {', '.join(teammate.get('skills', [])[:5])}"
                    teammates_summary += f"\n   Complements: {', '.join(teammate.get('complement_skills', []))}"
                    if teammate.get('bio'):
                        teammates_summary += f"\n   Bio: {teammate['bio'][:80]}"
                
                ai_prompt = f"""
You are the SyncUp AI Coach. I found {len(teammates)} potential teammates from our REAL database.

USER'S PROFILE:
- Skills: {', '.join(user_skills)}
- Looking for: Teammates for hackathon/project

CANDIDATES FROM DATABASE:{teammates_summary}

Provide a brief analysis (2-3 paragraphs):
1. Explain why these are good matches based on complementary skills
2. Suggest potential roles for each person
3. Recommend which 2-3 to reach out to first and why

Be specific and evidence-based. Reference their actual skills.
"""
                
                ai_analysis = call_llm(ai_prompt)
                
                response = f"**Found {len(teammates)} Real Teammates from Database**\n\n{ai_analysis}\n\n**Detailed Matches:**\n"
                for i, teammate in enumerate(teammates[:5], 1):
                    response += f"\n{i}. **{teammate['name']}** (Match: {teammate['match_score']}/10)"
                    response += f"\n   • Skills: {', '.join(teammate.get('skills', [])[:5])}"
                    response += f"\n   • Complements: {', '.join(teammate.get('complement_skills', []))}"
                    if teammate.get('bio'):
                        response += f"\n   • {teammate['bio'][:100]}"
                    response += "\n"
                
                return {
                    "type": "team_matching",
                    "teammates": teammates,
                    "message": response,
                    "ai_analysis": ai_analysis
                }
            else:
                # Even with no perfect match, suggest best available
                all_users = agent_tools.get_all_users(exclude_id=user_id)
                
                if all_users:
                    response = f"I didn't find perfect matches, but here are {len(all_users[:3])} users from our database who might still work:\n\n"
                    for i, user_candidate in enumerate(all_users[:3], 1):
                        response += f"{i}. **{user_candidate['name']}**\n"
                        response += f"   - Skills: {', '.join(user_candidate.get('skills', [])[:5])}\n"
                        if user_candidate.get('bio'):
                            response += f"   - Bio: {user_candidate['bio'][:100]}\n"
                        response += "\n"
                    response += "\n**Recommendation**: Consider reaching out to discuss your project goals. Sometimes the best teams form from diverse backgrounds!"
                else:
                    response = "No users found in the database yet. As more people join SyncUp, I'll be able to suggest better matches!"
                
                return {
                    "type": "team_matching",
                    "teammates": all_users[:3] if all_users else [],
                    "message": response
                }
        
        # Check if user wants full career workflow
        elif any(word in message_lower for word in ["career path", "learning path", "mentor", "portfolio"]):
            # Run full career development workflow
            input_data = user.get("resume_text") or user.get("github_username", "")
            input_type = "resume" if user.get("resume_text") else "github"
            target_role = user.get("target_role", "Software Engineer")
            
            result = full_career_development_workflow(
                input_data=input_data,
                input_type=input_type,
                target_role=target_role,
                user_id=user.get("id", "default")
            )
            
            return {
                "type": "full_workflow",
                "result": {
                    "skill_profile": result.skill_profile.model_dump() if result.skill_profile else None,
                    "learning_path": result.learning_path.model_dump() if result.learning_path else None,
                    "portfolio_projects": [p.model_dump() for p in result.portfolio_projects],
                    "mentor_matches": [m.model_dump() for m in result.mentor_matches],
                    "trace": result.trace
                },
                "message": "I've created a complete career development plan for you:"
            }
        
        # Default: Simple conversational response with DB context
        else:
            print("[DEBUG] Entering default chat response handler")
            # Use real DB data for context
            user_context = {
                "name": user.get("name", ""),
                "skills": user.get("skills", []),
                "bio": user.get("bio", ""),
                "experience": user.get("experience", ""),
                "projects_count": len(user.get("projects", [])),
                "hackathons_count": len(user.get("hackathons", [])),
                "connections_count": user.get("connection_count", 0)
            }
            
            # Generate contextual response with real data
            from common import call_llm
            
            # Get detailed project and hackathon info if available
            projects_detail = ""
            if user.get("projects"):
                projects_detail = "\n\nUser's Projects:"
                for proj in user["projects"][:3]:
                    projects_detail += f"\n- {proj.get('name', 'Unnamed')}: {proj.get('description', 'No description')}"
                    if proj.get('techStack'):
                        projects_detail += f" (Tech: {', '.join(proj['techStack'][:3])})"
            
            hackathons_detail = ""
            if user.get("hackathons"):
                hackathons_detail = "\n\nUser's Hackathons:"
                for hack in user["hackathons"][:3]:
                    hackathons_detail += f"\n- {hack.get('name', 'Unnamed')}: {hack.get('theme', 'No theme')}"
            
            context_str = f"""
You are the SyncUp AI Coach, a multi-role Agentic AI assistant.

REAL DATABASE DATA FOR THIS USER:
- Name: {user_context['name']}
- Skills: {', '.join(user_context['skills']) if user_context['skills'] else 'Not specified'}
- Bio: {user_context['bio']}
- Experience: {user_context['experience']}
- Projects: {user_context['projects_count']} projects in database
- Hackathons: {user_context['hackathons_count']} hackathons participated
- Connections: {user_context['connections_count']} connections{projects_detail}{hackathons_detail}

User Question: {message}

YOUR RESPONSIBILITIES:
1. Provide evidence-based guidance using the REAL data above
2. Be specific - reference their actual projects, hackathons, and skills
3. Give actionable advice, not generic motivation
4. If suggesting next steps, base it on their history
5. Use proper formatting with headers, bullet points, and spacing

FORMATTING GUIDELINES:
- Use **bold** for important terms and names
- Use bullet points (•) for lists
- Use numbered lists (1., 2., 3.) for steps
- Add proper spacing between sections
- Use ## for major sections when appropriate
- Keep paragraphs concise and well-spaced

Respond as the SyncUp AI Coach with proper formatting:
"""
            
            reply = call_llm(context_str)
            
            print(f"[DEBUG] LLM Reply length: {len(reply)}")
            print(f"[DEBUG] LLM Reply preview: {reply[:200]}")
            
            response_data = {
                "type": "chat",
                "reply": reply,
                "message": reply,
                "user_stats": user_context
            }
            
            print(f"[DEBUG] Returning response with keys: {response_data.keys()}")
            
            return response_data
            
    except Exception as e:
        print(f"[ERROR] Career coach exception: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Career coach error: {str(e)}")

@app.post("/api/agent/resume/analyze")
async def analyze_resume(request: ResumeAnalysisRequest):
    """
    Analyze resume with ATS scoring and enhancement suggestions
    """
    if not career_agent_imported:
        raise HTTPException(status_code=503, detail="Resume analysis not available")
    
    try:
        result = enhanced_resume_analysis_workflow(
            input_data=request.resume_text,
            input_type="resume",
            target_role=request.target_role
        )
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis error: {str(e)}")

class PdfBase64Request(BaseModel):
    pdf_base64: str
    filename: str

@app.post("/api/agent/pdf/extract")
async def extract_pdf_text(file: UploadFile = File(...)):
    """
    Extract text from uploaded PDF file
    Returns extracted text for further processing
    """
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read PDF bytes
        pdf_bytes = await file.read()
        
        # Extract text
        result = extract_text_from_pdf(pdf_bytes)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=f"PDF extraction failed: {result.get('error', 'Unknown error')}")
        
        return {
            "success": True,
            "text": result["text"],
            "page_count": result["page_count"],
            "metadata": result["metadata"],
            "filename": file.filename
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing error: {str(e)}")

@app.post("/api/agent/pdf/extract-base64")
async def extract_pdf_text_base64(request: PdfBase64Request):
    """
    Extract text from base64-encoded PDF
    Alternative endpoint for easier integration
    """
    try:
        import base64
        
        # Decode base64 to bytes
        pdf_bytes = base64.b64decode(request.pdf_base64)
        
        # Extract text
        result = extract_text_from_pdf(pdf_bytes)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=f"PDF extraction failed: {result.get('error', 'Unknown error')}")
        
        return {
            "success": True,
            "text": result["text"],
            "page_count": result["page_count"],
            "metadata": result["metadata"],
            "filename": request.filename
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing error: {str(e)}")

@app.post("/api/agent/resume/analyze-pdf")
async def analyze_resume_pdf(
    file: UploadFile = File(...),
    target_role: str = "Software Engineer"
):
    """
    Upload PDF resume and get automatic ATS analysis
    Combines PDF extraction + resume analysis in one call
    """
    if not career_agent_imported:
        raise HTTPException(status_code=503, detail="Resume analysis not available")
    
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read and extract PDF
        pdf_bytes = await file.read()
        extraction_result = extract_text_from_pdf(pdf_bytes)
        
        if not extraction_result["success"]:
            raise HTTPException(
                status_code=400, 
                detail=f"PDF extraction failed: {extraction_result.get('error', 'Unknown error')}"
            )
        
        resume_text = extraction_result["text"]
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from PDF")
        
        # Analyze the extracted resume text
        analysis_result = enhanced_resume_analysis_workflow(
            input_data=resume_text,
            input_type="resume",
            target_role=target_role
        )
        
        return {
            "success": True,
            "filename": file.filename,
            "page_count": extraction_result["page_count"],
            "text_length": len(resume_text),
            "analysis": analysis_result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis error: {str(e)}")

@app.post("/api/agent/github/analyze")
async def analyze_github(request: GitHubAnalysisRequest):
    """
    Comprehensive GitHub profile analysis
    """
    if not career_agent_imported:
        raise HTTPException(status_code=503, detail="GitHub analysis not available")
    
    try:
        result = extract_github_data(request.username)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub analysis error: {str(e)}")

@app.post("/api/agent/workflow/full")
async def full_workflow(request: FullWorkflowRequest):
    """
    Complete career development workflow
    """
    if not career_agent_imported:
        raise HTTPException(status_code=503, detail="Full workflow not available")
    
    try:
        result = full_career_development_workflow(
            input_data=request.input_data,
            input_type=request.input_type,
            target_role=request.target_role,
            user_id=request.user_id
        )
        
        return {
            "success": True,
            "result": {
                "skill_profile": result.skill_profile.model_dump() if result.skill_profile else None,
                "learning_path": result.learning_path.model_dump() if result.learning_path else None,
                "portfolio_projects": [p.model_dump() for p in result.portfolio_projects],
                "mentor_matches": [m.model_dump() for m in result.mentor_matches],
                "trace": result.trace,
                "current_step": result.current_step
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow error: {str(e)}")

# ============ Matcher Agent Endpoints ============

@app.post("/api/agent/matcher")
async def matcher_agent(request: MatcherRequest):
    """
    Matcher Agent - Team matching, mentor recommendations, hackathon workflows
    USES REAL DATABASE DATA via Node.js API
    """
    if not matcher_agent_imported:
        raise HTTPException(status_code=503, detail="Matcher agent not available")
    
    try:
        action = request.action
        user_profile = request.user_profile
        user_id = user_profile.get("user_id")
        
        if action == "matchmake":
            # Team matchmaking using REAL DATABASE
            user_skills = user_profile.get("skills", [])
            desired_skills = user_profile.get("desired_skills", user_skills)
            
            # Find real teammates from database
            teammates = agent_tools.find_teammates(
                user_id=user_id,
                required_skills=desired_skills
            )
            
            # Format as MatchResult
            candidates = []
            for teammate in teammates:
                candidates.append({
                    "id": teammate["id"],
                    "name": teammate["name"],
                    "match_score": teammate["match_score"],
                    "complement_skills": teammate["complement_skills"]
                })
            
            return {
                "type": "matchmake",
                "result": {
                    "type": "matchmake",
                    "query": {
                        "skills": user_skills,
                        "desired": desired_skills
                    },
                    "candidates": candidates,
                    "trace": {
                        "steps": [
                            "Fetched user skills from database",
                            f"Searched {len(teammates)} users in database",
                            "Calculated complementary skill matches",
                            f"Returned top {len(candidates)} candidates"
                        ]
                    }
                }
            }
        
        elif action == "mentor":
            # Mentor recommendations
            goal = user_profile.get("goal", "General career guidance")
            mentors_path = str(Path(__file__).parent / "agentic_zip" / "data" / "mock_mentors.json")
            result = matcher_common.tool_mentor(goal, mentors_path)
            
            return {
                "type": "mentor",
                "result": result.model_dump()
            }
        
        elif action == "chat":
            # Conversational agent
            graph = matcher_graph.get_graph()
            user_input = user_profile.get("message", "Hello")
            
            ctx = {
                "users_path": str(Path(__file__).parent / "agentic_zip" / "data" / "mock_users.json"),
                "mentors_path": str(Path(__file__).parent / "agentic_zip" / "data" / "mock_mentors.json")
            }
            
            input_state = {"user_input": user_input, "context": ctx}
            result = graph.invoke(input_state, config={"configurable": {"thread_id": user_profile.get("user_id", "default")}})
            
            return {
                "type": "chat",
                "result": result.get("output", {})
            }
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown action: {action}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matcher agent error: {str(e)}")

@app.post("/api/agent/hackathon/workflow")
async def hackathon_workflow(request: HackathonWorkflowRequest):
    """
    Complete hackathon workflow - team matching, project ideas, evaluation, strategy
    """
    if not matcher_agent_imported:
        raise HTTPException(status_code=503, detail="Hackathon workflow not available")
    
    try:
        # Build hackathon graph
        graph = matcher_graph.build_hackathon_graph()
        
        # Create initial state
        state = matcher_common.HackathonState(
            duration=request.duration,
            user_skills=request.user_skills,
            required_skills=request.required_skills,
            goal=request.goal,
            max_iterations=request.max_iterations
        )
        
        # Run workflow
        result = graph.invoke(state.model_dump())
        
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hackathon workflow error: {str(e)}")

# ============ Health Check ============

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SyncUp AI Agent Service"}

@app.get("/")
async def root():
    return {
        "service": "SyncUp AI Agent Service",
        "version": "1.0.0",
        "endpoints": {
            "career_coach": "/api/agent/coach",
            "matcher": "/api/agent/matcher",
            "resume_analysis": "/api/agent/resume/analyze",
            "resume_pdf_analysis": "/api/agent/resume/analyze-pdf",
            "pdf_extraction": "/api/agent/pdf/extract",
            "github_analysis": "/api/agent/github/analyze",
            "full_workflow": "/api/agent/workflow/full",
            "hackathon_workflow": "/api/agent/hackathon/workflow"
        },
        "features": {
            "pdf_extraction": "Automatic PDF text extraction using PyMuPDF",
            "resume_analysis": "ATS scoring and enhancement suggestions",
            "team_matching": "Real database-driven teammate recommendations",
            "career_coaching": "Multi-role AI assistant with evidence-based guidance"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
