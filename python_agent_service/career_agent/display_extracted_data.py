#!/usr/bin/env python3

import json
import streamlit as st
from typing import Dict, Any

def display_extracted_resume_data(parsed_data: Dict[str, Any]):
    """Display extracted resume data in a clean, organized format"""
    
    if not parsed_data or 'error' in parsed_data:
        st.error(f"Error in parsed data: {parsed_data.get('error', 'Unknown error')}")
        return
    
    # Header with name and contact
    st.markdown("## 📋 Extracted Resume Data")
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"**Name:** {parsed_data.get('name', 'Not provided')}")
        st.markdown(f"**Email:** {parsed_data.get('email', 'Not provided')}")
    
    with col2:
        if parsed_data.get('github'):
            st.markdown(f"**GitHub:** [{parsed_data['github']}]({parsed_data['github']})")
        if parsed_data.get('linkedin'):
            st.markdown(f"**LinkedIn:** [{parsed_data['linkedin']}]({parsed_data['linkedin']})")
    
    # Career Summary
    if parsed_data.get('career_summary'):
        st.markdown("### 💼 Career Summary")
        st.info(parsed_data['career_summary'])
    
    # Education
    education = parsed_data.get('education', [])
    if education:
        st.markdown("### 🎓 Education")
        for edu in education:
            st.markdown(f"- **{edu.get('degree', 'Unknown Degree')}** from {edu.get('institution', 'Unknown Institution')} ({edu.get('year', 'Unknown Year')})")
    
    # Skills
    skills = parsed_data.get('skills', {})
    if skills:
        st.markdown("### 🛠️ Skills")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if skills.get('languages'):
                st.markdown("**Programming Languages:**")
                for lang in skills['languages']:
                    st.markdown(f"- {lang}")
            
            if skills.get('frameworks'):
                st.markdown("**Frameworks:**")
                for fw in skills['frameworks']:
                    st.markdown(f"- {fw}")
        
        with col2:
            if skills.get('tools'):
                st.markdown("**Tools:**")
                for tool in skills['tools']:
                    st.markdown(f"- {tool}")
            
            if skills.get('soft_skills'):
                st.markdown("**Soft Skills:**")
                for skill in skills['soft_skills']:
                    st.markdown(f"- {skill}")
    
    # Experience
    experience = parsed_data.get('experience', [])
    if experience:
        st.markdown("### 💼 Experience")
        for exp in experience:
            st.markdown(f"**{exp.get('role', 'Unknown Role')}** at {exp.get('organization', 'Unknown Organization')}")
            st.markdown(f"*Duration:* {exp.get('duration', 'Unknown Duration')}")
            if exp.get('skills_used'):
                st.markdown(f"*Skills Used:* {', '.join(exp['skills_used'])}")
            st.markdown("---")
    
    # Projects
    projects = parsed_data.get('projects', [])
    if projects:
        st.markdown("### 🚀 Projects")
        for project in projects:
            st.markdown(f"**{project.get('title', 'Untitled Project')}**")
            st.markdown(f"*Description:* {project.get('description', 'No description')}")
            if project.get('tech_stack'):
                st.markdown(f"*Tech Stack:* {', '.join(project['tech_stack'])}")
            if project.get('impact'):
                st.markdown(f"*Impact:* {project['impact']}")
            st.markdown("---")
    
    # Certifications
    certifications = parsed_data.get('certifications', [])
    if certifications:
        st.markdown("### 🏆 Certifications")
        for cert in certifications:
            st.markdown(f"- {cert}")
    
    # Achievements
    achievements = parsed_data.get('achievements', [])
    if achievements:
        st.markdown("### 🌟 Achievements")
        for achievement in achievements:
            st.markdown(f"- {achievement}")
    
    # Raw JSON (collapsible)
    with st.expander("📄 View Raw JSON Data"):
        st.json(parsed_data)

def main():
    """Test the display function"""
    st.title("Resume Data Display Test")
    
    # Sample data in your requested format
    sample_data = {
        "name": "Devika Malik",
        "email": "devika.malik@gmail.com",
        "education": [
            {
                "degree": "B.Tech in Computer Science (AI)",
                "institution": "Chitkara University",
                "year": "2027"
            }
        ],
        "skills": {
            "languages": ["Python", "C++", "JavaScript"],
            "frameworks": ["TensorFlow", "React", "Flask", "LangGraph"],
            "tools": ["Git", "SQLite", "Docker"],
            "soft_skills": ["Leadership", "Teamwork", "Communication"]
        },
        "projects": [
            {
                "title": "Deepfake Detection using CNNs",
                "description": "Classified real vs fake images using TensorFlow.",
                "tech_stack": ["Python", "TensorFlow", "OpenCV"],
                "impact": "Achieved 92% accuracy."
            }
        ],
        "experience": [
            {
                "role": "AI Intern",
                "organization": "Evolve AI",
                "duration": "June 2024 – Aug 2024",
                "skills_used": ["NLP", "Python", "LLMs"]
            }
        ],
        "certifications": ["Coursera ML by Andrew Ng"],
        "achievements": ["Top 5 in Evolve AI Hackathon 2024"],
        "github": "https://github.com/devikamalik",
        "linkedin": "https://linkedin.com/in/devika-malik",
        "career_summary": "Aspiring AI Engineer passionate about NLP and generative AI."
    }
    
    display_extracted_resume_data(sample_data)

if __name__ == "__main__":
    main()