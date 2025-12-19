import streamlit as st
import json
import uuid
import os
import pandas as pd
from graph import get_career_graph, full_career_development_workflow, quick_skill_analysis_workflow
from common import CareerAgentState, load_json_data

# Optional imports for enhanced visualization
try:
    import graphviz
    HAS_GRAPHVIZ = True
except ImportError:
    HAS_GRAPHVIZ = False

try:
    import plotly.express as px
    import plotly.graph_objects as go
    HAS_PLOTLY = True
except ImportError:
    HAS_PLOTLY = False

st.set_page_config(page_title="Career & Skill Development Agent", layout="wide")
st.title("Career & Skill Development Agent")

# Initialize session state
if "thread_id" not in st.session_state:
    st.session_state["thread_id"] = "default"

if "career_state" not in st.session_state:
    st.session_state["career_state"] = None

# Sidebar for session management
with st.sidebar:
    st.header("Session Control")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("New Session"):
            st.session_state["thread_id"] = str(uuid.uuid4())
            st.session_state["career_state"] = None
            st.success("New session started!")
    
    with col2:
        if st.button("Reset"):
            st.session_state["career_state"] = None
            st.success("Session reset!")
    
    st.markdown(f"**Session ID:** `{st.session_state['thread_id'][:8]}...`")
    
    # Agent workflow visualization
    st.header("Workflow Status")
    if st.session_state["career_state"]:
        state = st.session_state["career_state"]
        progress_steps = ["input", "profile", "learning_path", "portfolio", "mentorship", "complete"]
        current_idx = progress_steps.index(state.current_step) if state.current_step in progress_steps else 0
        progress = (current_idx + 1) / len(progress_steps)
        st.progress(progress)
        st.write(f"Current Step: **{state.current_step.title()}**")

# Main content tabs
tabs = st.tabs(["Profile Analyzer", "Skill Graph", "Learning Path"])

# Tab 1: Profile Analyzer
with tabs[0]:
    st.header("Profile Analyzer")
    st.write("Upload your resume or connect your GitHub profile to analyze your skills and experience.")
    
    input_method = st.radio(
        "Choose input method:",
        ["Upload Resume", "GitHub Profile"],
        horizontal=True
    )
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        if input_method == "Upload Resume":
            uploaded_file = st.file_uploader("Upload your resume", type=['txt', 'pdf', 'md'])
            if uploaded_file is not None:
                # Handle different file types
                if uploaded_file.type == "text/plain":
                    resume_text = str(uploaded_file.read(), "utf-8")
                    st.text_area("Resume Content Preview", resume_text[:500] + "...", height=150)
                elif uploaded_file.type == "application/pdf":
                    # Save uploaded PDF temporarily
                    import tempfile
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                        tmp_file.write(uploaded_file.read())
                        tmp_file_path = tmp_file.name
                    
                    # Extract text from PDF
                    from common import extract_text_from_file
                    pdf_result = extract_text_from_file(tmp_file_path)
                    
                    # Clean up temp file
                    os.unlink(tmp_file_path)
                    
                    if "error" in pdf_result:
                        st.error(f"PDF Error: {pdf_result['error']}")
                        resume_text = None
                    else:
                        resume_text = pdf_result["text"]
                        st.success(f"PDF processed: {pdf_result.get('pages', 0)} pages, {pdf_result.get('characters', 0)} characters")
                        st.text_area("Resume Content Preview", resume_text[:500] + "...", height=150)
                else:
                    st.error("Unsupported file type. Please upload a PDF or text file.")
                    resume_text = None
                
                # Target role selection for enhanced analysis
                target_roles = ["Software Engineer", "AI Engineer", "Data Scientist", "Machine Learning Engineer", "Full Stack Developer", "DevOps Engineer", "Product Manager"]
                selected_role = st.selectbox("Target Role (for ATS analysis):", target_roles, index=1)
                
                col_analyze1, col_analyze2 = st.columns(2)
                with col_analyze1:
                    basic_analysis = st.button("Basic Analysis")
                with col_analyze2:
                    enhanced_analysis = st.button("Enhanced ATS Analysis")
                
                if (basic_analysis or enhanced_analysis) and resume_text:
                    analysis_type = "Enhanced ATS Analysis" if enhanced_analysis else "Basic Analysis"
                    with st.spinner(f"Running {analysis_type}..."):
                        try:
                            if enhanced_analysis:
                                from common import enhanced_resume_analysis_workflow
                                result = enhanced_resume_analysis_workflow(resume_text, "resume", selected_role)
                            else:
                                result = quick_skill_analysis_workflow(resume_text, "resume")
                            if result and not result.get("error"):
                                st.success("Resume analyzed successfully!")
                                
                                # Display extracted resume data in your requested format
                                resume_data = result.get("resume_data", {})
                                if resume_data:
                                    st.subheader("Extracted Resume Information")
                                    
                                    # Basic info
                                    col_a, col_b = st.columns(2)
                                    with col_a:
                                        st.write(f"**Name:** {resume_data.get('name', 'Not provided')}")
                                        st.write(f"**Email:** {resume_data.get('email', 'Not provided')}")
                                    with col_b:
                                        if resume_data.get('github'):
                                            st.write(f"**GitHub:** [{resume_data['github']}]({resume_data['github']})")
                                        if resume_data.get('linkedin'):
                                            st.write(f"**LinkedIn:** [{resume_data['linkedin']}]({resume_data['linkedin']})")
                                    
                                    # Career summary
                                    if resume_data.get('career_summary'):
                                        st.info(f"**Summary:** {resume_data['career_summary']}")
                                    
                                    # Skills in your format
                                    skills = resume_data.get("skills", {})
                                    if skills:
                                        st.subheader("Skills")
                                        col_c, col_d = st.columns(2)
                                        
                                        with col_c:
                                            if skills.get('languages'):
                                                st.write("**Programming Languages:**")
                                                for lang in skills['languages']:
                                                    st.write(f"• {lang}")
                                            
                                            if skills.get('frameworks'):
                                                st.write("**Frameworks:**")
                                                for fw in skills['frameworks']:
                                                    st.write(f"• {fw}")
                                        
                                        with col_d:
                                            if skills.get('tools'):
                                                st.write("**Tools:**")
                                                for tool in skills['tools']:
                                                    st.write(f"• {tool}")
                                            
                                            if skills.get('soft_skills'):
                                                st.write("**Soft Skills:**")
                                                for skill in skills['soft_skills']:
                                                    st.write(f"• {skill}")
                                    
                                    # Experience
                                    experience = resume_data.get("experience", [])
                                    if experience:
                                        st.subheader("Experience")
                                        for exp in experience:
                                            st.write(f"**{exp.get('role', 'Unknown Role')}** at {exp.get('organization', 'Unknown Organization')}")
                                            st.write(f"*Duration:* {exp.get('duration', 'Unknown Duration')}")
                                            if exp.get('skills_used'):
                                                st.write(f"*Skills Used:* {', '.join(exp['skills_used'])}")
                                            st.write("---")
                                    
                                    # Projects
                                    projects = resume_data.get("projects", [])
                                    if projects:
                                        st.subheader("Projects")
                                        for project in projects:
                                            st.write(f"**{project.get('title', 'Untitled Project')}**")
                                            st.write(f"*Description:* {project.get('description', 'No description')}")
                                            if project.get('tech_stack'):
                                                st.write(f"*Tech Stack:* {', '.join(project['tech_stack'])}")
                                            if project.get('impact'):
                                                st.write(f"*Impact:* {project['impact']}")
                                            st.write("---")
                                    
                                    # Education
                                    education = resume_data.get("education", [])
                                    if education:
                                        st.subheader("Education")
                                        for edu in education:
                                            st.write(f"• **{edu.get('degree', 'Unknown Degree')}** from {edu.get('institution', 'Unknown Institution')} ({edu.get('year', 'Unknown Year')})")
                                    
                                    # Certifications and Achievements
                                    col_e, col_f = st.columns(2)
                                    with col_e:
                                        certifications = resume_data.get("certifications", [])
                                        if certifications:
                                            st.subheader("Certifications")
                                            for cert in certifications:
                                                st.write(f"• {cert}")
                                    
                                    with col_f:
                                        achievements = resume_data.get("achievements", [])
                                        if achievements:
                                            st.subheader("Achievements")
                                            for achievement in achievements:
                                                st.write(f"• {achievement}")
                                    
                                    # Raw JSON (collapsible)
                                    with st.expander("View Raw JSON Data"):
                                        st.json(resume_data)
                                
                                # Display skill profile metrics
                                skill_profile = result.get("skill_profile")
                                if skill_profile:
                                    st.subheader("Analysis Metrics")
                                    col_g, col_h, col_i = st.columns(3)
                                    with col_g:
                                        st.metric("Total Skills", len(skill_profile.get("skills", [])))
                                    with col_h:
                                        st.metric("Experience Entries", len(skill_profile.get("experiences", [])))
                                    with col_i:
                                        st.metric("Est. Experience Years", f"{skill_profile.get('total_experience_years', 0):.1f}")
                                
                                # Enhanced Analysis Display
                                if enhanced_analysis and "enhanced_analysis" in result:
                                    enhanced = result["enhanced_analysis"]
                                    
                                    # ATS Score Section
                                    st.subheader("ATS Score Analysis")
                                    ats_score = enhanced.get("ats_score", {})
                                    overall_score = ats_score.get("overall_score", 0)
                                    
                                    # Score display with color coding
                                    score_color = "🟢" if overall_score >= 80 else "🟡" if overall_score >= 60 else "🔴"
                                    st.metric("Overall ATS Score", f"{overall_score}/100", delta=f"{score_color}")
                                    
                                    # Section scores
                                    section_scores = ats_score.get("section_scores", {})
                                    if section_scores:
                                        st.write("**Section Breakdown:**")
                                        cols = st.columns(3)
                                        for i, (section, score) in enumerate(section_scores.items()):
                                            with cols[i % 3]:
                                                status = "🟢" if score >= 80 else "🟡" if score >= 60 else "🔴"
                                                st.write(f"{status} {section.replace('_', ' ').title()}: {score}/100")
                                    
                                    # Keywords analysis
                                    col_kw1, col_kw2 = st.columns(2)
                                    with col_kw1:
                                        keywords_found = ats_score.get("keywords_found", [])
                                        if keywords_found:
                                            st.write("**Keywords Found:**")
                                            st.write(", ".join(keywords_found[:8]))
                                    
                                    with col_kw2:
                                        keywords_missing = ats_score.get("keywords_missing", [])
                                        if keywords_missing:
                                            st.write("**Missing Keywords:**")
                                            st.write(", ".join(keywords_missing[:8]))
                                    
                                    # Quick improvements
                                    improvements = ats_score.get("improvements", [])
                                    if improvements:
                                        st.write("**Quick Improvements:**")
                                        for improvement in improvements[:3]:
                                            st.write(f"• {improvement}")
                                    
                                    # Section-by-section enhancements
                                    st.subheader("Section Enhancement Guide")
                                    section_enhancements = enhanced.get("section_enhancements", [])
                                    
                                    for enhancement in section_enhancements:
                                        section_name = enhancement.get("section_name", "Unknown")
                                        current_score = enhancement.get("current_score", 0)
                                        
                                        with st.expander(f"🔹 {section_name} (Score: {current_score}/100)"):
                                            
                                            # ATS Optimization Tips
                                            ats_tips = enhancement.get("ats_optimization_tips", [])
                                            if ats_tips:
                                                st.write("**ATS Optimization:**")
                                                for tip in ats_tips[:3]:
                                                    st.write(f"• {tip}")
                                            
                                            # Immediate Improvements
                                            improvements = enhancement.get("improvements", [])
                                            if improvements:
                                                st.write("**Immediate Improvements:**")
                                                for improvement in improvements[:3]:
                                                    st.write(f"• {improvement}")
                                            
                                            # Skill Development
                                            skill_suggestions = enhancement.get("skill_development_suggestions", [])
                                            if skill_suggestions:
                                                st.write("**Skill Development:**")
                                                for suggestion in skill_suggestions[:3]:
                                                    st.write(f"• {suggestion}")
                                            
                                            # Future Learning Paths
                                            future_paths = enhancement.get("future_learning_paths", [])
                                            if future_paths:
                                                st.write("**Future Learning Paths:**")
                                                for path in future_paths[:3]:
                                                    st.write(f"• {path}")
                                    
                                    # Overall Recommendations
                                    overall_recommendations = enhanced.get("overall_recommendations", [])
                                    if overall_recommendations:
                                        st.subheader("Overall Recommendations")
                                        for i, rec in enumerate(overall_recommendations, 1):
                                            st.write(f"{i}. {rec}")
                                
                                # Show execution trace
                                with st.expander("Analysis Details"):
                                    for step in result.get("trace", []):
                                        st.write(f"• {step}")
                                
                                # Store results in session state for skill graph
                                st.session_state["last_analysis"] = result
                                st.session_state["analysis_type"] = "Enhanced" if enhanced_analysis else "Basic"
                                st.info("Check the 'Skill Graph' tab for detailed visualizations!")
                            else:
                                error_msg = result.get("error", "Could not analyze resume. Please check the content and try again.")
                                st.error(f"{error_msg}")
                        except Exception as e:
                            st.error(f"Error analyzing resume: {str(e)}")
                            st.write("Please try again or check your file format.")
        
        elif input_method == "GitHub Profile":
            github_username = st.text_input("Enter GitHub username", placeholder="octocat")
            
            col_analyze1, col_analyze2 = st.columns(2)
            with col_analyze1:
                basic_github = st.button("Basic GitHub Analysis")
            with col_analyze2:
                enhanced_github = st.button("Enhanced GitHub Analysis")
            
            if (basic_github or enhanced_github) and github_username:
                analysis_type = "Enhanced GitHub Analysis" if enhanced_github else "Basic GitHub Analysis"
                with st.spinner(f"Running {analysis_type} for {github_username}..."):
                    try:
                        if enhanced_github:
                            # Use enhanced GitHub analyzer
                            from common import extract_github_data
                            github_result = extract_github_data(github_username)
                            
                            if 'error' in github_result:
                                st.error(f"{github_result['error']}")
                            elif 'enhanced_analysis' in github_result:
                                st.success("Enhanced GitHub analysis completed!")
                                
                                enhanced_data = github_result['enhanced_analysis']
                                
                                # 1️⃣ Profile Overview
                                st.subheader("Profile Overview")
                                profile_summary = enhanced_data.get('profile_summary', {})
                                
                                col_p1, col_p2, col_p3, col_p4 = st.columns(4)
                                with col_p1:
                                    st.metric("Followers", profile_summary.get('followers', 0))
                                with col_p2:
                                    st.metric("Public Repos", profile_summary.get('public_repos', 0))
                                with col_p3:
                                    st.metric("Total Stars", profile_summary.get('total_stars', 0))
                                with col_p4:
                                    contribution_level = profile_summary.get('contribution_level', 'Unknown')
                                    st.metric("Activity Level", contribution_level)
                                
                                # Display profile info
                                if profile_summary.get('name'):
                                    st.write(f"**Name:** {profile_summary['name']} (@{profile_summary.get('username', github_username)})")
                                if profile_summary.get('bio'):
                                    st.info(f"**Bio:** {profile_summary['bio']}")
                                
                                # 2️⃣ Tech Stack Analysis
                                st.subheader("Tech Stack Analysis")
                                tech_stack = enhanced_data.get('tech_stack', {})
                                
                                col_t1, col_t2 = st.columns(2)
                                with col_t1:
                                    languages = tech_stack.get('top_languages', [])
                                    if languages:
                                        st.write("**Programming Languages:**")
                                        for lang in languages[:8]:
                                            st.write(f"• {lang}")
                                    
                                    frameworks = tech_stack.get('frameworks', [])
                                    if frameworks:
                                        st.write("**Frameworks:**")
                                        for fw in frameworks[:6]:
                                            st.write(f"• {fw}")
                                
                                with col_t2:
                                    devops_tools = tech_stack.get('devops_tools', [])
                                    if devops_tools:
                                        st.write("**DevOps Tools:**")
                                        for tool in devops_tools[:6]:
                                            st.write(f"• {tool}")
                                    
                                    ml_tools = tech_stack.get('machine_learning_tools', [])
                                    if ml_tools:
                                        st.write("**ML/AI Tools:**")
                                        for tool in ml_tools[:6]:
                                            st.write(f"• {tool}")
                                
                                # 3️⃣ Project Analysis
                                st.subheader("Project Analysis")
                                project_analysis = enhanced_data.get('project_analysis', [])
                                
                                if project_analysis:
                                    # Show top projects
                                    for i, project in enumerate(project_analysis[:3]):
                                        with st.expander(f"{project.get('repo_name', 'Unknown')} ({project.get('stars', 0)} ⭐)"):
                                            col_pr1, col_pr2 = st.columns(2)
                                            
                                            with col_pr1:
                                                st.write(f"**Description:** {project.get('description', 'No description')}")
                                                st.write(f"**Language:** {project.get('language', 'Unknown')}")
                                                st.write(f"**Project Type:** {project.get('project_type', 'General')}")
                                            
                                            with col_pr2:
                                                st.write(f"**README Quality:** {project.get('readme_quality', 'Unknown')}")
                                                st.write(f"**Commit Frequency:** {project.get('commit_frequency', 'Unknown')}")
                                                st.write(f"**Collaboration:** {project.get('collaboration', 'Unknown')}")
                                                st.write(f"**Forks:** {project.get('forks', 0)}")
                                else:
                                    st.info("No detailed project analysis available.")
                                
                                # 4️⃣ Coding Behavior
                                st.subheader("Coding Behavior")
                                coding_behavior = enhanced_data.get('coding_behavior', {})
                                
                                col_cb1, col_cb2 = st.columns(2)
                                with col_cb1:
                                    st.write(f"**Activity Trend:** {coding_behavior.get('activity_trend', 'Unknown')}")
                                    st.write(f"**Repository Ratio:** {coding_behavior.get('repo_origin_ratio', 'Unknown')}")
                                
                                with col_cb2:
                                    st.write(f"**Monthly Commits:** ~{coding_behavior.get('average_commits_per_month', 0)}")
                                    st.write(f"**Most Active Day:** {coding_behavior.get('most_active_day', 'Unknown')}")
                                
                                # 5️⃣ Collaboration Metrics
                                st.subheader("Collaboration Metrics")
                                collaboration = enhanced_data.get('collaboration_metrics', {})
                                
                                col_c1, col_c2, col_c3 = st.columns(3)
                                with col_c1:
                                    collab_score = collaboration.get('collaboration_score', 0)
                                    st.metric("Collaboration Score", f"{collab_score:.2f}")
                                with col_c2:
                                    maintained = collaboration.get('maintained_repos', 0)
                                    st.metric("Maintained Repos", maintained)
                                with col_c3:
                                    contributed = collaboration.get('contributed_to_others', 0)
                                    st.metric("Contributions", contributed)
                                
                                # 6️⃣ Insights & Recommendations
                                st.subheader("Insights & Recommendations")
                                insights = enhanced_data.get('insights', {})
                                
                                col_i1, col_i2 = st.columns(2)
                                with col_i1:
                                    strengths = insights.get('strengths', [])
                                    if strengths:
                                        st.write("**✅ Strengths:**")
                                        for strength in strengths:
                                            st.write(f"• {strength}")
                                
                                with col_i2:
                                    improvements = insights.get('improvements', [])
                                    if improvements:
                                        st.write("**🔧 Areas for Improvement:**")
                                        for improvement in improvements:
                                            st.write(f"• {improvement}")
                                
                                # 7️⃣ Career Fit
                                st.subheader("Career Fit Analysis")
                                career_fit = enhanced_data.get('career_fit', {})
                                
                                col_cf1, col_cf2 = st.columns(2)
                                with col_cf1:
                                    readiness = career_fit.get('readiness_level', 'Unknown')
                                    readiness_color = "🟢" if readiness == "High" else "🟡" if readiness == "Medium" else "🔴"
                                    st.write(f"**Readiness Level:** {readiness_color} {readiness}")
                                
                                with col_cf2:
                                    suggested_roles = career_fit.get('suggested_roles', [])
                                    if suggested_roles:
                                        st.write(f"**Suggested Roles:** {', '.join(suggested_roles)}")
                                    else:
                                        st.write("**Suggested Roles:** Continue building foundational skills")
                                
                                # Store enhanced results
                                # Convert enhanced analysis to compatible format for existing workflow
                                compatible_result = {
                                    "github_data": github_result,
                                    "skill_profile": {
                                        "skills": [{"name": lang, "category": "programming", "proficiency": 7} for lang in languages],
                                        "github_repos": profile_summary.get('public_repos', 0),
                                        "github_languages": languages,
                                        "total_experience_years": len(languages) * 1.5
                                    },
                                    "enhanced_github_analysis": enhanced_data,
                                    "trace": [f"Enhanced GitHub analysis completed for {github_username}"]
                                }
                                
                                st.session_state["last_analysis"] = compatible_result
                                st.session_state["analysis_type"] = "Enhanced GitHub Analysis"
                                
                                # Raw data view
                                with st.expander("View Complete Analysis JSON"):
                                    st.json(enhanced_data)
                                
                                st.info("Check the 'Skill Graph' and 'Learning Path' tabs for more insights!")
                            
                            else:
                                # Fallback to basic analysis
                                st.warning("Enhanced analysis not available, showing basic analysis")
                                result = quick_skill_analysis_workflow(github_username, "github")
                                if result.get("skill_profile") is not None:
                                    st.success("Basic GitHub profile analyzed!")
                                    
                                    profile = result["skill_profile"]
                                    col_a, col_b = st.columns(2)
                                    with col_a:
                                        st.metric("Total Skills", len(profile.get("skills", [])))
                                        st.metric("GitHub Repos", profile.get("github_repos", 0))
                                    with col_b:
                                        st.metric("Experience Years", f"{profile.get('total_experience_years', 0):.1f}")
                                        st.metric("Languages", len(profile.get("github_languages", [])))
                                    
                                    st.session_state["last_analysis"] = result
                                    st.session_state["analysis_type"] = "Basic GitHub Analysis"
                        
                        else:
                            # Basic GitHub analysis
                            result = quick_skill_analysis_workflow(github_username, "github")
                            if result.get("skill_profile") is not None:
                                st.success("✅ GitHub profile analyzed successfully!")
                                
                                # Display results nicely
                                profile = result["skill_profile"]
                                
                                col_a, col_b = st.columns(2)
                                with col_a:
                                    st.metric("Total Skills", len(profile.get("skills", [])))
                                    st.metric("GitHub Repos", profile.get("github_repos", 0))
                                
                                with col_b:
                                    st.metric("Experience Years", f"{profile.get('total_experience_years', 0):.1f}")
                                    st.metric("Languages", len(profile.get("github_languages", [])))
                                
                                # Skills breakdown
                                if profile.get("skills"):
                                    skills_df = pd.DataFrame(profile["skills"])
                                    if HAS_PLOTLY:
                                        fig = px.bar(skills_df, x="name", y="proficiency", color="category",
                                                   title="Skill Proficiency Levels")
                                        st.plotly_chart(fig, use_container_width=True)
                                    else:
                                        st.dataframe(skills_df)
                                else:
                                    st.info("No programming skills detected from GitHub repositories.")
                                
                                # Show execution trace
                                with st.expander("Analysis Details"):
                                    for step in result.get("trace", []):
                                        st.write(f"• {step}")
                                
                                # Store results in session state for skill graph
                                st.session_state["last_analysis"] = result
                                st.session_state["analysis_type"] = "Basic GitHub Analysis"
                                st.info("Check the 'Skill Graph' tab for detailed visualizations!")
                            else:
                                st.error("Could not analyze GitHub profile. Please check the username.")
                    
                    except Exception as e:
                        st.error(f"Error analyzing GitHub profile: {str(e)}")
                        st.write("Please try again or check your internet connection.")
        
        else:  # LinkedIn
            st.info("LinkedIn integration is not available in this demo. Please use GitHub or resume upload.")
    
    with col2:
        st.markdown("### Tips")
        st.markdown("""
        - **Resume**: Upload PDF or text files for comprehensive analysis
        - **GitHub**: Enhanced analysis provides detailed insights including:
          - Tech stack analysis
          - Project quality assessment
          - Coding behavior patterns
          - Career fit recommendations
        - **Enhanced Analysis**: Includes ATS scoring and improvement suggestions
        - **Skills**: Automatically detects languages, frameworks, and tools
        """)

# Tab 2: Skill Graph
with tabs[1]:
    st.header("Skill Graph & Analysis")
    
    # Check if we have analysis results
    if "last_analysis" in st.session_state and st.session_state["last_analysis"]:
        result = st.session_state["last_analysis"]
        analysis_type = st.session_state.get("analysis_type", "Basic")
        
        st.info(f"Showing {analysis_type} Analysis Results")
        
        # Get resume data and skill profile
        resume_data = result.get("resume_data", {})
        skill_profile = result.get("skill_profile", {})
        
        if resume_data and resume_data.get("skills"):
            skills_data = resume_data["skills"]
            
            # Overview metrics
            st.subheader("Skills Overview")
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Programming Languages", len(skills_data.get("languages", [])))
            with col2:
                st.metric("Frameworks", len(skills_data.get("frameworks", [])))
            with col3:
                st.metric("Tools", len(skills_data.get("tools", [])))
            with col4:
                st.metric("Soft Skills", len(skills_data.get("soft_skills", [])))
            
            # Skill Distribution Charts
            st.subheader("Skill Distribution")
            
            # Create skill distribution data
            skill_categories = {
                "Programming Languages": len(skills_data.get("languages", [])),
                "Frameworks": len(skills_data.get("frameworks", [])),
                "Tools": len(skills_data.get("tools", [])),
                "Soft Skills": len(skills_data.get("soft_skills", []))
            }
            
            col_chart1, col_chart2 = st.columns(2)
            
            with col_chart1:
                if HAS_PLOTLY and any(skill_categories.values()):
                    # Pie chart for skill distribution
                    fig_pie = px.pie(
                        values=list(skill_categories.values()),
                        names=list(skill_categories.keys()),
                        title="Skills by Category",
                        color_discrete_sequence=px.colors.qualitative.Set3
                    )
                    fig_pie.update_traces(textposition='inside', textinfo='percent+label')
                    st.plotly_chart(fig_pie, use_container_width=True)
                else:
                    st.bar_chart(skill_categories)
            
            with col_chart2:
                if HAS_PLOTLY and any(skill_categories.values()):
                    # Bar chart for skill counts
                    fig_bar = px.bar(
                        x=list(skill_categories.keys()),
                        y=list(skill_categories.values()),
                        title="Skill Count by Category",
                        color=list(skill_categories.values()),
                        color_continuous_scale="viridis"
                    )
                    fig_bar.update_layout(showlegend=False)
                    st.plotly_chart(fig_bar, use_container_width=True)
                else:
                    st.bar_chart(skill_categories)
            
            # Detailed Skills Breakdown
            st.subheader("Detailed Skills Breakdown")
            
            # Create tabs for each skill category
            skill_tabs = st.tabs(["Programming", "Frameworks", "Tools", "Soft Skills"])
            
            with skill_tabs[0]:
                languages = skills_data.get("languages", [])
                if languages:
                    st.write("**Programming Languages:**")
                    
                    # Create a more detailed view
                    lang_cols = st.columns(min(len(languages), 4))
                    for i, lang in enumerate(languages):
                        with lang_cols[i % 4]:
                            st.markdown(f"""
                            <div style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin: 5px; text-align: center; background-color: #f8f9fa;">
                                <h4 style="margin: 0; color: #2E86AB;">{lang}</h4>
                            </div>
                            """, unsafe_allow_html=True)
                    
                    # Language popularity chart (if plotly available)
                    if HAS_PLOTLY and len(languages) > 1:
                        # Create mock proficiency data for visualization
                        lang_proficiency = {lang: len(lang) * 10 + 50 for lang in languages}  # Mock data
                        
                        fig_lang = px.bar(
                            x=list(lang_proficiency.keys()),
                            y=list(lang_proficiency.values()),
                            title="Programming Language Proficiency (Estimated)",
                            color=list(lang_proficiency.values()),
                            color_continuous_scale="blues"
                        )
                        st.plotly_chart(fig_lang, use_container_width=True)
                else:
                    st.info("No programming languages detected.")
            
            with skill_tabs[1]:
                frameworks = skills_data.get("frameworks", [])
                if frameworks:
                    st.write("**Frameworks & Libraries:**")
                    
                    # Group frameworks by type
                    web_frameworks = [f for f in frameworks if any(web in f.lower() for web in ['react', 'angular', 'vue', 'flask', 'django', 'express'])]
                    ml_frameworks = [f for f in frameworks if any(ml in f.lower() for ml in ['tensorflow', 'pytorch', 'scikit', 'keras', 'pandas', 'numpy'])]
                    other_frameworks = [f for f in frameworks if f not in web_frameworks and f not in ml_frameworks]
                    
                    if web_frameworks:
                        st.markdown("**Web Frameworks:**")
                        st.write(", ".join(web_frameworks))
                    
                    if ml_frameworks:
                        st.markdown("**ML/AI Frameworks:**")
                        st.write(", ".join(ml_frameworks))
                    
                    if other_frameworks:
                        st.markdown("**Other Frameworks:**")
                        st.write(", ".join(other_frameworks))
                    
                    # Framework usage chart
                    if HAS_PLOTLY and len(frameworks) > 1:
                        framework_data = {
                            "Web Frameworks": len(web_frameworks),
                            "ML/AI Frameworks": len(ml_frameworks),
                            "Other Frameworks": len(other_frameworks)
                        }
                        framework_data = {k: v for k, v in framework_data.items() if v > 0}
                        
                        if framework_data:
                            fig_fw = px.pie(
                                values=list(framework_data.values()),
                                names=list(framework_data.keys()),
                                title="Framework Distribution by Type"
                            )
                            st.plotly_chart(fig_fw, use_container_width=True)
                else:
                    st.info("No frameworks detected.")
            
            with skill_tabs[2]:
                tools = skills_data.get("tools", [])
                if tools:
                    st.write("**Tools & Technologies:**")
                    
                    # Categorize tools
                    dev_tools = [t for t in tools if any(dev in t.lower() for dev in ['git', 'docker', 'kubernetes', 'jenkins', 'vscode', 'ide'])]
                    cloud_tools = [t for t in tools if any(cloud in t.lower() for cloud in ['aws', 'azure', 'gcp', 'cloud', 'heroku'])]
                    db_tools = [t for t in tools if any(db in t.lower() for db in ['sql', 'mongo', 'redis', 'postgres', 'mysql', 'database'])]
                    other_tools = [t for t in tools if t not in dev_tools and t not in cloud_tools and t not in db_tools]
                    
                    col_tools1, col_tools2 = st.columns(2)
                    
                    with col_tools1:
                        if dev_tools:
                            st.markdown("**Development Tools:**")
                            for tool in dev_tools:
                                st.write(f"• {tool}")
                        
                        if cloud_tools:
                            st.markdown("**Cloud Platforms:**")
                            for tool in cloud_tools:
                                st.write(f"• {tool}")
                    
                    with col_tools2:
                        if db_tools:
                            st.markdown("**Databases:**")
                            for tool in db_tools:
                                st.write(f"• {tool}")
                        
                        if other_tools:
                            st.markdown("**Other Tools:**")
                            for tool in other_tools:
                                st.write(f"• {tool}")
                else:
                    st.info("No tools detected.")
            
            with skill_tabs[3]:
                soft_skills = skills_data.get("soft_skills", [])
                if soft_skills:
                    st.write("**Soft Skills:**")
                    
                    # Display soft skills in a grid
                    soft_cols = st.columns(min(len(soft_skills), 3))
                    for i, skill in enumerate(soft_skills):
                        with soft_cols[i % 3]:
                            st.markdown(f"""
                            <div style="padding: 15px; border: 2px solid #4CAF50; border-radius: 10px; margin: 5px; text-align: center; background-color: #E8F5E8;">
                                <h5 style="margin: 0; color: #2E7D32;">{skill}</h5>
                            </div>
                            """, unsafe_allow_html=True)
                    
                    # Soft skills importance (mock data for visualization)
                    if HAS_PLOTLY and len(soft_skills) > 1:
                        importance_scores = {skill: 80 + (i * 5) % 20 for i, skill in enumerate(soft_skills)}
                        
                        fig_soft = px.bar(
                            x=list(importance_scores.keys()),
                            y=list(importance_scores.values()),
                            title="Soft Skills Importance (Industry Average)",
                            color=list(importance_scores.values()),
                            color_continuous_scale="greens"
                        )
                        fig_soft.update_layout(yaxis_title="Importance Score", showlegend=False)
                        st.plotly_chart(fig_soft, use_container_width=True)
                else:
                    st.info("No soft skills detected.")
            
            # Skill Gap Analysis (if enhanced analysis available)
            if analysis_type == "Enhanced" and "enhanced_analysis" in result:
                enhanced = result["enhanced_analysis"]
                ats_score = enhanced.get("ats_score", {})
                
                st.subheader("Skill Gap Analysis")
                
                keywords_missing = ats_score.get("keywords_missing", [])
                keywords_found = ats_score.get("keywords_found", [])
                
                col_gap1, col_gap2 = st.columns(2)
                
                with col_gap1:
                    if keywords_found:
                        st.markdown("**Strong Keywords Found:**")
                        for keyword in keywords_found[:8]:
                            st.markdown(f"<span style='background-color: #D4EDDA; padding: 3px 8px; border-radius: 3px; margin: 2px; display: inline-block;'>{keyword}</span>", unsafe_allow_html=True)
                
                with col_gap2:
                    if keywords_missing:
                        st.markdown("**Missing Keywords to Add:**")
                        for keyword in keywords_missing[:8]:
                            st.markdown(f"<span style='background-color: #F8D7DA; padding: 3px 8px; border-radius: 3px; margin: 2px; display: inline-block;'>{keyword}</span>", unsafe_allow_html=True)
                
                # Skill development recommendations
                section_enhancements = enhanced.get("section_enhancements", [])
                skills_enhancement = next((s for s in section_enhancements if s.get("section_name") == "Skills"), None)
                
                if skills_enhancement:
                    st.subheader("Skill Development Recommendations")
                    
                    skill_suggestions = skills_enhancement.get("skill_development_suggestions", [])
                    future_paths = skills_enhancement.get("future_learning_paths", [])
                    
                    col_rec1, col_rec2 = st.columns(2)
                    
                    with col_rec1:
                        if skill_suggestions:
                            st.markdown("**Immediate Skill Development:**")
                            for suggestion in skill_suggestions[:5]:
                                st.write(f"• {suggestion}")
                    
                    with col_rec2:
                        if future_paths:
                            st.markdown("**Future Learning Paths:**")
                            for path in future_paths[:5]:
                                st.write(f"• {path}")
        
        else:
            st.warning("No skills data found in the analysis. Please run the analysis in the Profile Analyzer tab first.")
    
    else:
        st.info("Please analyze your resume in the 'Profile Analyzer' tab first to see detailed skill visualizations here.")
        
        # Show sample visualization
        st.subheader("Sample Skill Visualization")
        st.write("This is what you'll see after analyzing your resume:")
        
        # Sample data for demonstration
        sample_skills = {
            "Programming Languages": 4,
            "Frameworks": 6,
            "Tools": 5,
            "Soft Skills": 3
        }
        
        if HAS_PLOTLY:
            fig_sample = px.pie(
                values=list(sample_skills.values()),
                names=list(sample_skills.keys()),
                title="Sample: Skills by Category"
            )
            st.plotly_chart(fig_sample, use_container_width=True)
        else:
            st.bar_chart(sample_skills)

# Tab 3: Learning Path
with tabs[2]:
    st.header("Learning Path Generator")
    st.write("Generate personalized learning roadmaps based on your current skills and target career goals.")
    
    # Load roles data
    roles_data = load_json_data("career_agent/data/mock_roles.json")
    role_options = [role["title"] for role in roles_data] if roles_data else [
        "AI Engineer", "Data Scientist", "Full Stack Developer", "DevOps Engineer", 
        "Mobile Developer", "Product Manager", "UX Designer", "Backend Developer"
    ]
    
    # Main interface
    col_main, col_sidebar = st.columns([3, 1])
    
    with col_main:
        # Target role selection
        st.subheader("Choose Your Target Role")
        target_role = st.selectbox(
            "Select the role you want to pursue:",
            [""] + role_options,
            help="Choose a career role to get a personalized learning path"
        )
        
        if target_role:
            # Show role details
            role_info = next((r for r in roles_data if r["title"] == target_role), None) if roles_data else None
            
            if role_info:
                st.info(f"**{target_role}**: {role_info['description']}")
                
                # Role requirements
                col_req, col_pref = st.columns(2)
                with col_req:
                    st.markdown("**🔧 Required Skills:**")
                    for skill in role_info["required_skills"]:
                        st.markdown(f"• {skill.title()}")
                
                with col_pref:
                    st.markdown("**Preferred Skills:**")
                    for skill in role_info.get("preferred_skills", []):
                        st.markdown(f"• {skill.title()}")
                
                st.markdown(f"**Experience Level:** {role_info['experience_level'].title()}")
            
            # Input method selection
            st.subheader("Choose Analysis Method")
            input_method = st.radio(
                "How would you like to analyze your current skills?",
                [
                    "-> Use Previous Resume Analysis",
                    "-> Analyze GitHub Profile", 
                    "-> Manual Skill Input"
                ],
                horizontal=True
            )
            
            # Input handling based on method
            input_data = None
            input_type = None
            manual_skills = []
            
            if input_method == "Use Previous Resume Analysis":
                if "last_analysis" in st.session_state and st.session_state["last_analysis"]:
                    st.success("Using previous resume analysis data")
                    input_data = "previous_analysis"
                    input_type = "resume"
                else:
                    st.warning("No previous analysis found. Please analyze your resume in the Profile Analyzer tab first.")
            
            elif input_method == "Analyze GitHub Profile":
                github_username = st.text_input(
                    "Enter your GitHub username:",
                    placeholder="e.g., octocat",
                    help="We'll analyze your repositories to understand your skills"
                )
                if github_username:
                    input_data = github_username
                    input_type = "github"
            
            elif input_method == "Manual Skill Input":
                st.markdown("**Enter your current skills (one per line):**")
                skills_text = st.text_area(
                    "Current Skills:",
                    placeholder="Python\nJavaScript\nReact\nMachine Learning\n...",
                    height=150,
                    help="List your current technical skills, one per line"
                )
                if skills_text:
                    manual_skills = [skill.strip() for skill in skills_text.split('\n') if skill.strip()]
                    st.write(f"**Skills entered:** {len(manual_skills)}")
                    if manual_skills:
                        st.write(", ".join(manual_skills[:10]) + ("..." if len(manual_skills) > 10 else ""))
            
            # Generate learning path button
            if st.button("Generate Personalized Learning Path", type="primary"):
                if not target_role:
                    st.error("Please select a target role first.")
                elif input_method == "Use Previous Resume Analysis" and not input_data:
                    st.error("No previous analysis found. Please analyze your resume first.")
                elif input_method == "Analyze GitHub Profile" and not github_username:
                    st.error("Please enter your GitHub username.")
                elif input_method == "Manual Skill Input" and not manual_skills:
                    st.error("Please enter your current skills.")
                else:
                    with st.spinner(f"Generating learning path for {target_role}..."):
                        try:
                            # Generate learning path based on input method
                            if input_method == "📄 Use Previous Resume Analysis":
                                # Use existing analysis data
                                if "last_analysis" in st.session_state:
                                    previous_result = st.session_state["last_analysis"]
                                    resume_data = previous_result.get("resume_data", {})
                                    
                                    # Create enhanced analysis for learning path
                                    from common import enhanced_resume_analysis_workflow
                                    result = enhanced_resume_analysis_workflow(
                                        json.dumps(resume_data), "resume", target_role
                                    )
                                else:
                                    st.error("Previous analysis data not found.")
                                    result = None
                            
                            elif input_method == "Analyze GitHub Profile":
                                # Analyze GitHub profile
                                from common import enhanced_resume_analysis_workflow
                                result = enhanced_resume_analysis_workflow(
                                    github_username, "github", target_role
                                )
                            
                            elif input_method == "Manual Skill Input":
                                # Create mock resume from manual skills
                                mock_resume = f"""
                                Skills: {', '.join(manual_skills)}
                                Target Role: {target_role}
                                """
                                from common import enhanced_resume_analysis_workflow
                                result = enhanced_resume_analysis_workflow(
                                    mock_resume, "resume", target_role
                                )
                            
                            if result and not result.get("error"):
                                # Store learning path results
                                st.session_state["learning_path_result"] = result
                                st.session_state["target_role"] = target_role
                                st.success(f"Learning path generated for {target_role}!")
                                st.rerun()
                            else:
                                st.error(f"Failed to generate learning path: {result.get('error', 'Unknown error')}")
                        
                        except Exception as e:
                            st.error(f"Error generating learning path: {str(e)}")
    
    with col_sidebar:
        st.markdown("### Tips")
        st.markdown("""
        **For best results:**
        - Use resume analysis if you've already uploaded your resume
        - GitHub analysis works great for developers
        - Manual input gives you full control over your skill list
        
        **Learning paths include:**
        - Skill gap analysis
        - Recommended courses
        - Project suggestions
        - Timeline estimates
        """)
        
        # Quick role info
        if target_role and roles_data:
            role_info = next((r for r in roles_data if r["title"] == target_role), None)
            if role_info:
                st.markdown("### Role Summary")
                st.markdown(f"**Level:** {role_info['experience_level'].title()}")
                st.markdown(f"**Key Skills:** {len(role_info['required_skills'])} required")
                st.markdown(f"**Bonus Skills:** {len(role_info.get('preferred_skills', []))} preferred")
    
    # Display learning path results
    if "learning_path_result" in st.session_state and st.session_state["learning_path_result"]:
        result = st.session_state["learning_path_result"]
        target_role = st.session_state.get("target_role", "Unknown Role")
        
        st.markdown("---")
        st.subheader(f"Learning Path for {target_role}")
        
        # Enhanced analysis results
        if "enhanced_analysis" in result:
            enhanced = result["enhanced_analysis"]
            ats_score = enhanced.get("ats_score", {})
            
            # Key metrics
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                overall_score = ats_score.get("overall_score", 0)
                st.metric("Readiness Score", f"{overall_score}/100", 
                         delta="Good" if overall_score >= 70 else "Needs Work")
            
            with col2:
                keywords_found = len(ats_score.get("keywords_found", []))
                st.metric("Skills Match", f"{keywords_found}", delta="skills found")
            
            with col3:
                keywords_missing = len(ats_score.get("keywords_missing", []))
                st.metric("Skills to Learn", f"{keywords_missing}", delta="gaps identified")
            
            with col4:
                estimated_weeks = keywords_missing * 4  # 4 weeks per skill
                st.metric("Est. Timeline", f"{estimated_weeks} weeks", delta=f"{estimated_weeks//4} months")
            
            # Skill gap analysis
            st.subheader("Skill Gap Analysis")
            
            col_found, col_missing = st.columns(2)
            
            with col_found:
                keywords_found_list = ats_score.get("keywords_found", [])
                if keywords_found_list:
                    st.markdown("**Skills You Have:**")
                    for skill in keywords_found_list[:8]:
                        st.markdown(f"<span style='background-color: #D4EDDA; padding: 3px 8px; border-radius: 3px; margin: 2px; display: inline-block;'>{skill}</span>", unsafe_allow_html=True)
                else:
                    st.info("No matching skills found. Consider starting with fundamentals.")
            
            with col_missing:
                keywords_missing_list = ats_score.get("keywords_missing", [])
                if keywords_missing_list:
                    st.markdown("**Skills to Develop:**")
                    for skill in keywords_missing_list[:8]:
                        st.markdown(f"<span style='background-color: #F8D7DA; padding: 3px 8px; border-radius: 3px; margin: 2px; display: inline-block;'>{skill}</span>", unsafe_allow_html=True)
                else:
                    st.success("Great! You have all the key skills for this role.")
            
            # Learning recommendations by section
            section_enhancements = enhanced.get("section_enhancements", [])
            skills_enhancement = next((s for s in section_enhancements if s.get("section_name") == "Skills"), None)
            
            if skills_enhancement:
                st.subheader("Personalized Learning Plan")
                
                # Create learning path tabs
                learning_tabs = st.tabs(["Immediate Focus", "Skill Development", "Future Growth"])
                
                with learning_tabs[0]:
                    st.markdown("**Priority skills to develop first:**")
                    improvements = skills_enhancement.get("improvements", [])
                    ats_tips = skills_enhancement.get("ats_optimization_tips", [])
                    
                    if improvements or ats_tips:
                        for i, tip in enumerate((improvements + ats_tips)[:5], 1):
                            st.markdown(f"{i}. {tip}")
                    else:
                        st.info("You're well-prepared! Focus on advanced topics and specialization.")
                
                with learning_tabs[1]:
                    st.markdown("**Recommended learning path:**")
                    skill_suggestions = skills_enhancement.get("skill_development_suggestions", [])
                    
                    if skill_suggestions:
                        for i, suggestion in enumerate(skill_suggestions[:6], 1):
                            with st.expander(f"Step {i}: {suggestion.split('.')[0] if '.' in suggestion else suggestion[:50]}..."):
                                st.write(suggestion)
                                
                                # Add mock learning resources
                                st.markdown("**Recommended Resources:**")
                                st.markdown("• Online Course (4-6 weeks)")
                                st.markdown("• Documentation & Tutorials")
                                st.markdown("• Hands-on Projects")
                                st.markdown("• Community & Forums")
                    else:
                        st.info("Continue building on your existing strong foundation.")
                
                with learning_tabs[2]:
                    st.markdown("**Long-term career development:**")
                    future_paths = skills_enhancement.get("future_learning_paths", [])
                    
                    if future_paths:
                        for i, path in enumerate(future_paths[:4], 1):
                            st.markdown(f"**{i}. {path.split(':')[0] if ':' in path else 'Advanced Development'}**")
                            st.markdown(f"   {path}")
                            st.markdown("")
                    else:
                        st.info("Focus on leadership, specialization, and advanced technical skills.")
            
            # Action items
            st.subheader("Next Steps")
            
            next_steps = [
                f"Start with the highest priority skill: **{keywords_missing_list[0] if keywords_missing_list else 'Advanced topics'}**",
                "Set up a learning schedule (2-3 hours per week recommended)",
                "Join relevant communities and forums for support",
                "Build projects to practice new skills",
                "Update your resume as you learn new skills",
                "Consider getting certifications in key areas"
            ]
            
            for i, step in enumerate(next_steps, 1):
                st.markdown(f"{i}. {step}")
            
            # Progress tracking
            st.subheader("Track Your Progress")
            st.info("**Pro Tip:** Come back and re-run this analysis as you learn new skills to see your progress and get updated recommendations!")
            
            if st.button("Clear Learning Path", help="Clear current results to generate a new path"):
                if "learning_path_result" in st.session_state:
                    del st.session_state["learning_path_result"]
                if "target_role" in st.session_state:
                    del st.session_state["target_role"]
                st.rerun()
        
        else:
            st.error("Enhanced analysis data not available. Please try generating the learning path again.")
    
    elif target_role:
        st.info("Select your analysis method and click 'Generate Learning Path' to get started!")
    else:
        # Show sample learning paths for inspiration
        st.subheader("Sample Learning Paths")
        st.write("Here are some popular career paths to inspire your journey:")
        
        sample_paths = [
            {
                "role": "AI Engineer",
                "timeline": "6-12 months",
                "key_skills": ["Python", "Machine Learning", "TensorFlow", "Data Science"],
                "description": "Build and deploy AI systems"
            },
            {
                "role": "Full Stack Developer", 
                "timeline": "4-8 months",
                "key_skills": ["JavaScript", "React", "Node.js", "Databases"],
                "description": "Create complete web applications"
            },
            {
                "role": "Data Scientist",
                "timeline": "6-10 months", 
                "key_skills": ["Python", "Statistics", "Pandas", "Machine Learning"],
                "description": "Extract insights from data"
            }
        ]
        
        cols = st.columns(len(sample_paths))
        for i, path in enumerate(sample_paths):
            with cols[i]:
                st.markdown(f"**{path['role']}**")
                st.markdown(f"->{path['timeline']}")
                st.markdown(f"->{', '.join(path['key_skills'][:2])}...")
                st.markdown(f"->{path['description']}")
                if st.button(f"Choose {path['role']}", key=f"sample_{i}"):
                    st.session_state["selected_role"] = path['role']
                    st.rerun()

# # Tab 4: Portfolio Builder
# with tabs[3]:
#     st.header("Portfolio Builder")
    
#     if st.session_state["career_state"] and st.session_state["career_state"].portfolio_projects:
#         projects = st.session_state["career_state"].portfolio_projects
        
#         st.success(f"Generated {len(projects)} portfolio project ideas!")
        
#         for i, project in enumerate(projects):
#             with st.expander(f"{project.title}"):
#                 col1, col2 = st.columns([2, 1])
                
#                 with col1:
#                     st.markdown(f"**Description:** {project.description}")
#                     st.markdown(f"**Problem:** {project.problem_statement}")
#                     st.markdown(f"**Impact:** {project.impact}")
                
#                 with col2:
#                     st.markdown(f"**Category:** {project.category}")
#                     st.markdown("**Tech Stack:**")
#                     for tech in project.tech_stack:
#                         st.markdown(f"• {tech}")
                
#                 # Action buttons
#                 col_a, col_b, col_c = st.columns(3)
#                 with col_a:
#                     if st.button(f"Copy Description", key=f"copy_{i}"):
#                         st.success("Description copied to clipboard!")
#                 with col_b:
#                     if st.button(f"Generate GitHub Template", key=f"github_{i}"):
#                         st.info("GitHub template generation feature coming soon!")
#                 with col_c:
#                     if st.button(f"Add to Portfolio", key=f"add_{i}"):
#                         st.success("Added to your portfolio!")
    
#     else:
#         st.info("Please complete the learning path generation to get portfolio suggestions.")
        
#         # Manual project builder
#         st.subheader("Manual Project Builder")
#         with st.form("manual_project"):
#             project_title = st.text_input("Project Title")
#             project_desc = st.text_area("Project Description")
#             tech_stack = st.text_input("Tech Stack (comma-separated)")
            
#             if st.form_submit_button("Add Project"):
#                 st.success("Project added to your portfolio!")

# # Tab 5: Mentorship Hub
# with tabs[4]:
#     st.header("Mentorship Hub")
    
#     if st.session_state["career_state"] and st.session_state["career_state"].mentor_matches:
#         matches = st.session_state["career_state"].mentor_matches
        
#         st.success(f"✅ Found {len(matches)} mentor matches!")
        
#         # Display mentor matches
#         for match in matches:
#             mentor = match.mentor
            
#             with st.container():
#                 col1, col2, col3 = st.columns([1, 2, 1])
                
#                 with col1:
#                     # Mentor avatar (placeholder)
#                     st.markdown(f"### 👤 {mentor.name}")
#                     st.markdown(f"⭐ **{mentor.rating}/5.0**")
                    
#                     # Compatibility score
#                     score_color = "green" if match.compatibility_score > 0.7 else "orange" if match.compatibility_score > 0.4 else "red"
#                     st.markdown(f"🎯 **Match: {match.compatibility_score:.1%}**")
                
#                 with col2:
#                     st.markdown(f"**Bio:** {mentor.bio}")
#                     st.markdown(f"**Expertise:** {', '.join(mentor.expertise[:5])}")
#                     st.markdown(f"**Matching Skills:** {', '.join(match.matching_skills)}")
#                     st.markdown(f"**Why this match:** {match.reason}")
                
#                 with col3:
#                     availability_color = {"high": "🟢", "medium": "🟡", "low": "🔴"}[mentor.availability]
#                     st.markdown(f"**Availability:** {availability_color} {mentor.availability.title()}")
#                     st.markdown(f"**Contact:** {mentor.contact_method}")
                    
#                     if st.button(f"💬 Connect", key=f"connect_{mentor.id}"):
#                         st.success(f"Connection request sent to {mentor.name}!")
                
#                 st.divider()
    
#     else:
#         st.info("👆 Please complete your skill analysis and learning path to get mentor recommendations.")
        
#         # Browse all mentors
#         st.subheader("🔍 Browse All Mentors")
#         mentors_data = load_json_data("career_agent/data/mock_mentors.json")
        
#         if mentors_data:
#             # Filter options
#             col1, col2 = st.columns(2)
#             with col1:
#                 expertise_filter = st.multiselect(
#                     "Filter by expertise:",
#                     options=list(set(skill for mentor in mentors_data for skill in mentor["expertise"]))
#                 )
#             with col2:
#                 availability_filter = st.selectbox("Filter by availability:", ["All", "High", "Medium", "Low"])
            
#             # Display filtered mentors
#             filtered_mentors = mentors_data
#             if expertise_filter:
#                 filtered_mentors = [m for m in filtered_mentors if any(skill in m["expertise"] for skill in expertise_filter)]
#             if availability_filter != "All":
#                 filtered_mentors = [m for m in filtered_mentors if m["availability"] == availability_filter.lower()]
            
#             for mentor in filtered_mentors[:5]:  # Show top 5
#                 with st.expander(f"👤 {mentor['name']} - {mentor['rating']}⭐"):
#                     st.markdown(f"**Bio:** {mentor['bio']}")
#                     st.markdown(f"**Expertise:** {', '.join(mentor['expertise'])}")
#                     st.markdown(f"**Availability:** {mentor['availability'].title()}")

# Footer with workflow visualization
if st.session_state["career_state"]:
    st.markdown("---")
    st.subheader("Workflow Visualization")
    
    # Create a simple workflow diagram
    if HAS_GRAPHVIZ:
        dot = graphviz.Digraph()
        dot.node("Input", "Input Analysis", shape="box", style="filled", color="lightblue")
        dot.node("Profile", "Skill Profile", shape="box", style="filled", color="lightgreen")
        dot.node("Learning", "Learning Path", shape="box", style="filled", color="lightyellow")
        dot.node("Portfolio", "Portfolio", shape="box", style="filled", color="lightpink")
        dot.node("Mentors", "Mentors", shape="box", style="filled", color="lightcoral")
        
        dot.edge("Input", "Profile")
        dot.edge("Profile", "Learning")
        dot.edge("Learning", "Portfolio")
        dot.edge("Portfolio", "Mentors")
        
        st.graphviz_chart(dot)
    else:
        st.info("Input Analysis → Skill Profile → Learning Path → Portfolio → Mentors")
    
    # Show trace
    with st.expander("Execution Trace"):
        for step in st.session_state["career_state"].trace:
            st.markdown(f"• {step}")