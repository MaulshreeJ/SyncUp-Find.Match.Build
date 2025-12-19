import os
import json
import re
import requests
from typing import Dict, List, Any, Optional, Literal, Union
from pydantic import BaseModel, Field
from dataclasses import dataclass
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv


try:
    import fitz  # PyMuPDF for PDF text extraction
    HAS_PDF_SUPPORT = True
except ImportError:
    HAS_PDF_SUPPORT = False

load_dotenv()



class Skill(BaseModel):
    name: str
    category: Literal["programming", "framework", "tool", "soft_skill"]
    proficiency: int = Field(ge=1, le=10, description="Skill level 1-10")
    years_experience: Optional[float] = None

class Experience(BaseModel):
    title: str
    company: Optional[str] = None
    duration_months: Optional[int] = None
    description: str
    skills_used: List[str] = []

class SkillProfile(BaseModel):
    user_id: str
    skills: List[Skill]
    experiences: List[Experience]
    total_experience_years: float = 0.0
    github_repos: Optional[int] = None
    github_languages: List[str] = []

class LearningResource(BaseModel):
    title: str
    type: Literal["course", "project", "book", "tutorial", "certification"]
    url: Optional[str] = None
    duration_weeks: Optional[int] = None
    difficulty: Literal["beginner", "intermediate", "advanced"]
    skills_covered: List[str] = []

class LearningPath(BaseModel):
    role: str
    timeline_weeks: int
    current_skill_match: float = Field(ge=0, le=1, description="How well current skills match target role")
    milestones: List[str]
    resources: List[LearningResource]
    skill_gaps: List[str] = []

class PortfolioProject(BaseModel):
    title: str
    description: str
    tech_stack: List[str]
    problem_statement: str
    impact: str
    github_link: Optional[str] = None
    demo_link: Optional[str] = None
    category: str = "hackathon"

class Mentor(BaseModel):
    id: str
    name: str
    expertise: List[str]
    availability: Literal["high", "medium", "low"]
    rating: float = Field(ge=1, le=5)
    bio: str
    contact_method: str = "platform"

class MentorMatch(BaseModel):
    mentor: Mentor
    compatibility_score: float = Field(ge=0, le=1)
    matching_skills: List[str]
    reason: str

class CareerRole(BaseModel):
    title: str
    required_skills: List[str]
    preferred_skills: List[str] = []
    experience_level: Literal["entry", "mid", "senior"]
    description: str



class CareerAgentState(BaseModel):
    user_id: str = "default"
    input_type: Optional[Literal["github", "linkedin", "resume"]] = None
    input_data: Optional[str] = None
    
    # Processing results
    skill_profile: Optional[SkillProfile] = None
    target_role: Optional[str] = None
    learning_path: Optional[LearningPath] = None
    portfolio_projects: List[PortfolioProject] = []
    mentor_matches: List[MentorMatch] = []
    
    # Workflow state
    current_step: str = "input"
    iterations: int = 0
    max_iterations: int = 5
    
    # Output
    output: Dict[str, Any] = {}
    trace: List[str] = []

# ============ Utility Functions ============

def load_json_data(path: str) -> List[Dict[str, Any]]:
    """Load JSON data from file"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def _use_gemini() -> bool:
    return bool(os.getenv("GOOGLE_API_KEY"))

def _use_openai() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))

@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=1, max=4))
def call_llm(prompt: str) -> str:
    """Call Gemini if available, else OpenAI, else mock LLM."""
    if _use_gemini():
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        model = genai.GenerativeModel(model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
        resp = model.generate_content(prompt)
        return getattr(resp, "text", "") or "[Gemini returned empty]"
    if _use_openai():
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        resp = client.chat.completions.create(model=model, messages=[{"role": "user", "content": prompt}])
        return resp.choices[0].message.content
    # Mock fallback
    return f"[mock-llm] {prompt[:160]}..."


def extract_text_from_pdf(pdf_path: str) -> Dict[str, Any]:
    """Extract readable text from a PDF file."""
    if not HAS_PDF_SUPPORT:
        return {"error": "PDF support not available. Install PyMuPDF: pip install PyMuPDF"}
    
    try:
        text = ""
        pdf = fitz.open(pdf_path)
        page_count = len(pdf)
        
        for page_num in range(page_count):
            page = pdf[page_num]
            page_text = page.get_text("text")
            if page_text.strip():
                text += f"\n--- Page {page_num + 1} ---\n{page_text}"
        
        pdf.close()
        
        if not text.strip():
            return {"error": "No readable text found in PDF"}
        
        return {
            "text": text.strip(),
            "pages": page_count,
            "characters": len(text)
        }
    except Exception as e:
        return {"error": f"Error reading PDF: {str(e)}"}

def extract_text_from_file(file_path: str) -> Dict[str, Any]:
    """Extract text from various file formats"""
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}
    
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_ext in ['.txt', '.md']:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            return {
                "text": text,
                "characters": len(text)
            }
        except Exception as e:
            return {"error": f"Error reading text file: {str(e)}"}
    else:
        return {"error": f"Unsupported file format: {file_ext}. Supported: .pdf, .txt, .md"}

# ============ Core Processing Functions ============

def extract_github_data(username: str) -> Dict[str, Any]:
    """Extract comprehensive data from GitHub profile using enhanced analyzer"""
    try:
        # Import the enhanced analyzer
        from enhanced_github_analyzer import EnhancedGitHubAnalyzer
        
        # Initialize analyzer (can add GitHub token from environment if available)
        github_token = os.getenv("GITHUB_TOKEN")
        analyzer = EnhancedGitHubAnalyzer(github_token)
        
        # Get comprehensive analysis
        analysis_result = analyzer.analyze_profile(username)
        
        if 'error' in analysis_result:
            # Fallback to basic extraction if enhanced analysis fails
            return _extract_basic_github_data(username)
        
        # Transform enhanced analysis to match expected format while preserving all data
        profile_summary = analysis_result.get('profile_summary', {})
        tech_stack = analysis_result.get('tech_stack', {})
        
        return {
            # Basic compatibility fields
            "name": profile_summary.get("name", profile_summary.get("username", username)),
            "bio": profile_summary.get("bio", ""),
            "public_repos": profile_summary.get("public_repos", 0),
            "languages": tech_stack.get("top_languages", []),
            "repos": [],  # Will be populated from project_analysis if needed
            
            # Enhanced analysis data
            "enhanced_analysis": analysis_result,
            "profile_summary": profile_summary,
            "tech_stack": tech_stack,
            "project_analysis": analysis_result.get('project_analysis', []),
            "coding_behavior": analysis_result.get('coding_behavior', {}),
            "collaboration_metrics": analysis_result.get('collaboration_metrics', {}),
            "insights": analysis_result.get('insights', {}),
            "career_fit": analysis_result.get('career_fit', {}),
            
            # Additional metrics for compatibility
            "total_stars": profile_summary.get("total_stars", 0),
            "total_forks": profile_summary.get("total_forks", 0),
            "followers": profile_summary.get("followers", 0),
            "contribution_level": profile_summary.get("contribution_level", "Unknown")
        }
        
    except ImportError:
        # Fallback if enhanced analyzer is not available
        return _extract_basic_github_data(username)
    except Exception as e:
        return {"error": f"GitHub analysis error: {str(e)}"}

def _extract_basic_github_data(username: str) -> Dict[str, Any]:
    """Fallback basic GitHub data extraction"""
    try:
        user_url = f"https://api.github.com/users/{username}"
        repos_url = f"https://api.github.com/users/{username}/repos"
        
        user_resp = requests.get(user_url, timeout=10)
        repos_resp = requests.get(repos_url, timeout=10)
        
        if user_resp.status_code != 200 or repos_resp.status_code != 200:
            return {"error": "Failed to fetch GitHub data"}
        
        user_data = user_resp.json()
        repos_data = repos_resp.json()
        
        languages = set()
        for repo in repos_data[:20]:
            if repo.get("language"):
                languages.add(repo["language"])
        
        return {
            "name": user_data.get("name", username),
            "bio": user_data.get("bio", ""),
            "public_repos": user_data.get("public_repos", 0),
            "languages": list(languages),
            "repos": repos_data[:10],
            "followers": user_data.get("followers", 0),
            "total_stars": sum(repo.get("stargazers_count", 0) for repo in repos_data),
            "contribution_level": "Basic Analysis"
        }
    except Exception as e:
        return {"error": f"GitHub API error: {str(e)}"}

def parse_resume_text(resume_text: str) -> Dict[str, Any]:
    """Parse resume text using LLM with structured output format"""
    prompt = f"""
    Parse this resume and extract structured information in the EXACT JSON format below:

    Resume Text:
    {resume_text}

    Return a JSON object with this EXACT structure:
    {{
        "name": "Full Name",
        "email": "email@example.com",
        "education": [
            {{
                "degree": "Degree Name",
                "institution": "University Name", 
                "year": "Graduation Year"
            }}
        ],
        "skills": {{
            "languages": ["Python", "JavaScript", "etc"],
            "frameworks": ["React", "TensorFlow", "etc"],
            "tools": ["Git", "Docker", "etc"],
            "soft_skills": ["Leadership", "Communication", "etc"]
        }},
        "projects": [
            {{
                "title": "Project Name",
                "description": "Brief description",
                "tech_stack": ["Technology1", "Technology2"],
                "impact": "Achievement or result"
            }}
        ],
        "experience": [
            {{
                "role": "Job Title",
                "organization": "Company Name",
                "duration": "Time Period",
                "skills_used": ["Skill1", "Skill2"]
            }}
        ],
        "certifications": ["Certification names"],
        "achievements": ["Notable achievements"],
        "github": "GitHub URL if mentioned",
        "linkedin": "LinkedIn URL if mentioned",
        "career_summary": "Brief professional summary"
    }}

    Extract all available information. If a field is not found, use empty array [] or empty string "".
    Return ONLY the JSON object, no additional text.
    """
    
    try:
        response = call_llm(prompt)
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            parsed_data = json.loads(json_match.group())
            
            # Ensure all required fields exist
            required_structure = {
                "name": "",
                "email": "",
                "education": [],
                "skills": {
                    "languages": [],
                    "frameworks": [],
                    "tools": [],
                    "soft_skills": []
                },
                "projects": [],
                "experience": [],
                "certifications": [],
                "achievements": [],
                "github": "",
                "linkedin": "",
                "career_summary": ""
            }
            
            # Merge parsed data with required structure
            for key, default_value in required_structure.items():
                if key not in parsed_data:
                    parsed_data[key] = default_value
            
            return parsed_data
            
        return {"error": "Could not parse resume - no JSON found in response"}
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON in resume parsing: {str(e)}"}
    except Exception as e:
        return {"error": f"Resume parsing error: {str(e)}"}

def calculate_skill_compatibility(user_skills: List[str], role_skills: List[str]) -> float:
    """Calculate compatibility between user skills and role requirements"""
    if not role_skills:
        return 0.0
    user_skills_lower = [s.lower() for s in user_skills]
    role_skills_lower = [s.lower() for s in role_skills]
    matches = sum(1 for skill in role_skills_lower if skill in user_skills_lower)
    return matches / len(role_skills_lower)

def score_mentor_compatibility(user_profile: SkillProfile, mentor: Mentor, target_skills: List[str]) -> float:
    """Score mentor compatibility based on skills and target learning areas"""
    user_skills = [s.name.lower() for s in user_profile.skills]
    mentor_expertise = [e.lower() for e in mentor.expertise]
    target_skills_lower = [s.lower() for s in target_skills]
    target_overlap = sum(1 for skill in target_skills_lower if skill in mentor_expertise)
    target_score = target_overlap / len(target_skills_lower) if target_skills_lower else 0
    skill_gap_bonus = sum(1 for skill in mentor_expertise if skill not in user_skills) * 0.1
    availability_multiplier = {"high": 1.0, "medium": 0.8, "low": 0.6}[mentor.availability]
    final_score = (target_score + skill_gap_bonus) * availability_multiplier
    return min(final_score, 1.0)


def process_input_node(state: CareerAgentState) -> CareerAgentState:
    """Process different types of input (GitHub, LinkedIn, Resume)"""
    state.trace.append(f"Processing {state.input_type} input")

    if state.input_type == "github":
        github_data = extract_github_data(state.input_data)
        if "error" not in github_data:
            state.output["github_data"] = github_data
            state.trace.append(f"Successfully extracted GitHub data for {state.input_data}")
        else:
            state.output["error"] = github_data["error"]

    elif state.input_type == "resume":
        resume_text = state.input_data
        
        # Check if input is a file path
        if isinstance(resume_text, str) and os.path.exists(resume_text):
            file_result = extract_text_from_file(resume_text)
            if "error" in file_result:
                state.output["error"] = file_result["error"]
                return state
            
            resume_text = file_result["text"]
            file_info = f"Extracted from file: {file_result.get('characters', 0)} characters"
            if "pages" in file_result:
                file_info += f", {file_result['pages']} pages"
            state.trace.append(file_info)

        # Parse the resume text
        resume_data = parse_resume_text(resume_text)
        if "error" not in resume_data:
            state.output["resume_data"] = resume_data
            state.trace.append("Successfully parsed resume text")
        else:
            state.output["error"] = resume_data["error"]

    elif state.input_type == "linkedin":
        state.output["linkedin_data"] = {"note": "LinkedIn parsing not implemented in demo"}
        state.trace.append("LinkedIn parsing placeholder")

    state.current_step = "profile"
    return state

def create_skill_profile_node(state: CareerAgentState) -> CareerAgentState:
    """Generate skill profile from processed input"""
    state.trace.append("Creating skill profile")
    skills, experiences, github_repos, github_languages = [], [], 0, []

    if "github_data" in state.output:
        github_data = state.output["github_data"]
        github_repos = github_data.get("public_repos", 0)
        github_languages = github_data.get("languages", [])
        for lang in github_languages:
            skills.append(Skill(name=lang, category="programming", proficiency=min(8, max(3, github_repos // 2))))

    if "resume_data" in state.output:
        resume_data = state.output["resume_data"]
        
        # Handle new structured skills format
        if isinstance(resume_data.get("skills"), dict):
            skill_categories = resume_data["skills"]
            for lang in skill_categories.get("languages", []):
                if not any(s.name.lower() == lang.lower() for s in skills):
                    skills.append(Skill(name=lang, category="programming", proficiency=6))
            for fw in skill_categories.get("frameworks", []):
                if not any(s.name.lower() == fw.lower() for s in skills):
                    skills.append(Skill(name=fw, category="framework", proficiency=6))
            for tool in skill_categories.get("tools", []):
                if not any(s.name.lower() == tool.lower() for s in skills):
                    skills.append(Skill(name=tool, category="tool", proficiency=6))
            for soft in skill_categories.get("soft_skills", []):
                if not any(s.name.lower() == soft.lower() for s in skills):
                    skills.append(Skill(name=soft, category="soft_skill", proficiency=6))
        else:
            # Handle old format
            for skill_name in resume_data.get("skills", []):
                if not any(s.name.lower() == skill_name.lower() for s in skills):
                    category = "programming" if any(lang in skill_name.lower() for lang in ["python", "java", "javascript", "c++", "go", "rust"]) else "tool"
                    skills.append(Skill(name=skill_name, category=category, proficiency=6))
        
        # Handle experience
        for exp in resume_data.get("experience", []):
            description = exp.get("description", "")
            if isinstance(description, list):
                description = ". ".join(description)
            experiences.append(Experience(
                title=exp.get("role", exp.get("title", "")), 
                company=exp.get("organization", exp.get("company", "")), 
                description=description, 
                skills_used=exp.get("skills_used", exp.get("skills", []))
            ))

    profile = SkillProfile(
        user_id=state.user_id,
        skills=skills,
        experiences=experiences,
        github_repos=github_repos,
        github_languages=github_languages,
        total_experience_years=len(experiences) * 1.5
    )
    
    state.skill_profile = profile
    state.current_step = "learning_path"
    state.trace.append(f"Created profile with {len(skills)} skills and {len(experiences)} experiences")
    return state

def generate_learning_path_node(state: CareerAgentState) -> CareerAgentState:
    """Generate personalized learning path for target role"""
    state.trace.append(f"Generating learning path for {state.target_role}")
    if not state.skill_profile or not state.target_role:
        state.output["error"] = "Missing skill profile or target role"
        return state
    roles_data = load_json_data("career_agent/data/mock_roles.json")
    target_role_data = next((r for r in roles_data if r["title"].lower() == state.target_role.lower()), None)
    if not target_role_data:
        target_role_data = {"title": state.target_role, "required_skills": ["programming", "problem-solving", "communication"], "preferred_skills": []}
    user_skills = [s.name for s in state.skill_profile.skills]
    required_skills = target_role_data["required_skills"]
    skill_match = calculate_skill_compatibility(user_skills, required_skills)
    skill_gaps = [skill for skill in required_skills if skill.lower() not in [s.lower() for s in user_skills]]
    resources = [LearningResource(title=f"Learn {gap}", type="course", duration_weeks=4, difficulty="intermediate", skills_covered=[gap]) for gap in skill_gaps[:5]]
    learning_path = LearningPath(role=state.target_role, timeline_weeks=len(skill_gaps) * 4, current_skill_match=skill_match, milestones=[f"Master {gap}" for gap in skill_gaps], resources=resources, skill_gaps=skill_gaps)
    state.learning_path = learning_path
    state.current_step = "portfolio"
    state.trace.append(f"Generated learning path with {len(resources)} resources")
    return state

def build_portfolio_node(state: CareerAgentState) -> CareerAgentState:
    """Generate portfolio project suggestions"""
    state.trace.append("Building portfolio suggestions")
    if not state.skill_profile:
        return state
    user_skills = [s.name for s in state.skill_profile.skills]
    projects = []
    if any("python" in s.lower() for s in user_skills):
        projects.append(PortfolioProject(title="AI-Powered Data Analysis Tool", description="Build a web application that analyzes datasets using machine learning", tech_stack=["Python", "Streamlit", "Pandas", "Scikit-learn"], problem_statement="Data analysis is complex for non-technical users", impact="Democratizes data insights for business users", category="AI/ML"))
    if any("javascript" in s.lower() or "react" in s.lower() for s in user_skills):
        projects.append(PortfolioProject(title="Real-time Collaboration Platform", description="Build a real-time collaborative workspace like Figma", tech_stack=["React", "Node.js", "Socket.io", "MongoDB"], problem_statement="Remote teams need better collaboration tools", impact="Improves team productivity by 40%", category="Web Development"))
    projects.append(PortfolioProject(title="Personal Productivity Assistant", description="AI-powered task management and scheduling system", tech_stack=user_skills[:4] if len(user_skills) >= 4 else user_skills, problem_statement="People struggle with time management and productivity", impact="Increases personal productivity and reduces stress", category="Productivity"))
    state.portfolio_projects = projects
    state.current_step = "mentorship"
    state.trace.append(f"Generated {len(projects)} portfolio project ideas")
    return state

def match_mentors_node(state: CareerAgentState) -> CareerAgentState:
    """Match user with suitable mentors"""
    state.trace.append("Matching with mentors")
    if not state.skill_profile:
        return state
    mentors_data = load_json_data("career_agent/data/mock_mentors.json")
    mentors = [Mentor(**m) for m in mentors_data]
    target_skills = state.learning_path.skill_gaps if state.learning_path else []
    if not target_skills:
        target_skills = [s.name for s in state.skill_profile.skills]
    matches = []
    for mentor in mentors:
        score = score_mentor_compatibility(state.skill_profile, mentor, target_skills)
        if score > 0.2:
            matching_skills = [skill for skill in mentor.expertise if skill.lower() in [s.lower() for s in target_skills]]
            matches.append(MentorMatch(mentor=mentor, compatibility_score=score, matching_skills=matching_skills, reason=f"Expert in {', '.join(matching_skills[:3])}"))
    matches.sort(key=lambda x: x.compatibility_score, reverse=True)
    state.mentor_matches = matches[:5]
    state.current_step = "complete"
    state.trace.append(f"Found {len(matches)} mentor matches")
    return state

# ============ ATS Analysis & Enhancement Functions ============

class ATSScore(BaseModel):
    overall_score: float = Field(ge=0, le=100, description="Overall ATS score 0-100")
    section_scores: Dict[str, float] = {}
    improvements: List[str] = []
    keywords_missing: List[str] = []
    keywords_found: List[str] = []

class SectionEnhancement(BaseModel):
    section_name: str
    current_score: float = Field(ge=0, le=100)
    improvements: List[str] = []
    skill_development_suggestions: List[str] = []
    ats_optimization_tips: List[str] = []
    future_learning_paths: List[str] = []

class EnhancedResumeAnalysis(BaseModel):
    resume_data: Dict[str, Any]
    ats_score: ATSScore
    section_enhancements: List[SectionEnhancement] = []
    overall_recommendations: List[str] = []

def analyze_ats_score(resume_data: Dict[str, Any], target_role: str = "Software Engineer") -> ATSScore:
    """Analyze ATS score for the resume"""
    
    prompt = f"""
    Analyze this resume for ATS (Applicant Tracking System) compatibility and scoring for a {target_role} position.
    
    Resume Data:
    {json.dumps(resume_data, indent=2)}
    
    Provide ATS analysis in this JSON format:
    {{
        "overall_score": 85,
        "section_scores": {{
            "contact_info": 90,
            "skills": 80,
            "experience": 85,
            "education": 75,
            "projects": 70,
            "keywords": 65
        }},
        "improvements": [
            "Add more industry-specific keywords",
            "Include quantifiable achievements",
            "Use standard section headers"
        ],
        "keywords_missing": ["API", "Database", "Testing"],
        "keywords_found": ["Python", "JavaScript", "Git"]
    }}
    
    Consider:
    - Keyword density and relevance
    - Section formatting and headers
    - Quantifiable achievements
    - Industry-standard terminology
    - Contact information completeness
    - Skills alignment with role
    
    Return only the JSON object.
    """
    
    try:
        response = call_llm(prompt)
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            ats_data = json.loads(json_match.group())
            return ATSScore(**ats_data)
        return ATSScore(overall_score=50, improvements=["Could not analyze ATS score"])
    except Exception as e:
        return ATSScore(overall_score=50, improvements=[f"ATS analysis error: {str(e)}"])

def generate_section_enhancements(resume_data: Dict[str, Any], target_role: str = "Software Engineer") -> List[SectionEnhancement]:
    """Generate detailed enhancement suggestions for each resume section"""
    
    sections = [
        ("Contact Information", resume_data.get("name", "") + " " + resume_data.get("email", "")),
        ("Skills", json.dumps(resume_data.get("skills", {}))),
        ("Experience", json.dumps(resume_data.get("experience", []))),
        ("Education", json.dumps(resume_data.get("education", []))),
        ("Projects", json.dumps(resume_data.get("projects", []))),
        ("Certifications", json.dumps(resume_data.get("certifications", []))),
        ("Achievements", json.dumps(resume_data.get("achievements", [])))
    ]
    
    enhancements = []
    
    for section_name, section_data in sections:
        if not section_data or section_data in ['""', '[]', '{}']:
            continue
            
        prompt = f"""
        Analyze this resume section for a {target_role} position and provide enhancement suggestions.
        
        Section: {section_name}
        Data: {section_data}
        
        Provide analysis in this JSON format:
        {{
            "section_name": "{section_name}",
            "current_score": 75,
            "improvements": [
                "Add specific metrics and numbers",
                "Use action verbs",
                "Include relevant keywords"
            ],
            "skill_development_suggestions": [
                "Learn advanced Python frameworks",
                "Get AWS certification",
                "Practice system design"
            ],
            "ats_optimization_tips": [
                "Use standard job titles",
                "Include industry keywords",
                "Format consistently"
            ],
            "future_learning_paths": [
                "Machine Learning specialization",
                "Cloud architecture certification",
                "Leadership and management skills"
            ]
        }}
        
        Focus on:
        - ATS optimization (keywords, formatting)
        - Skill development opportunities
        - Future career growth paths
        - Quantifiable improvements
        - Industry best practices
        
        Return only the JSON object.
        """
        
        try:
            response = call_llm(prompt)
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                enhancement_data = json.loads(json_match.group())
                enhancements.append(SectionEnhancement(**enhancement_data))
        except Exception as e:
            enhancements.append(SectionEnhancement(
                section_name=section_name,
                current_score=50,
                improvements=[f"Analysis error: {str(e)}"]
            ))
    
    return enhancements

def generate_enhanced_resume_analysis(resume_data: Dict[str, Any], target_role: str = "Software Engineer") -> EnhancedResumeAnalysis:
    """Generate comprehensive resume analysis with ATS scoring and enhancement suggestions"""
    
    # Generate ATS score
    ats_score = analyze_ats_score(resume_data, target_role)
    
    # Generate section enhancements
    section_enhancements = generate_section_enhancements(resume_data, target_role)
    
    # Generate overall recommendations
    overall_recommendations = [
        f"Current ATS Score: {ats_score.overall_score}/100 - {'Excellent' if ats_score.overall_score >= 80 else 'Good' if ats_score.overall_score >= 60 else 'Needs Improvement'}",
        "Focus on adding quantifiable achievements with specific metrics",
        "Ensure all sections use industry-standard keywords",
        "Consider adding missing skills identified in the analysis",
        "Regularly update your resume with new projects and certifications"
    ]
    
    return EnhancedResumeAnalysis(
        resume_data=resume_data,
        ats_score=ats_score,
        section_enhancements=section_enhancements,
        overall_recommendations=overall_recommendations
    )

# ============ Enhanced Workflow Functions ============

def enhanced_resume_analysis_workflow(input_data: str, input_type: str, target_role: str = "Software Engineer") -> Dict[str, Any]:
    """Enhanced workflow that includes ATS analysis and improvement suggestions"""
    
    # Import here to avoid circular imports
    from graph import quick_skill_analysis_workflow
    
    # First run the basic analysis
    basic_result = quick_skill_analysis_workflow(input_data, input_type)
    
    if basic_result.get("error"):
        return basic_result
    
    resume_data = basic_result.get("resume_data", {})
    if not resume_data:
        return {"error": "No resume data found for enhancement analysis"}
    
    try:
        # Generate enhanced analysis
        enhanced_analysis = generate_enhanced_resume_analysis(resume_data, target_role)
        
        # Combine results
        return {
            **basic_result,
            "enhanced_analysis": enhanced_analysis.model_dump(),
            "target_role": target_role
        }
    except Exception as e:
        return {
            **basic_result,
            "enhancement_error": f"Could not generate enhancements: {str(e)}"
        }