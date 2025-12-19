#!/usr/bin/env python3

"""
Show GitHub JSON extraction example
"""

import json

def show_github_json_example():
    """Show example of GitHub JSON extraction"""
    
    print("🐙 GITHUB PROFILE JSON EXTRACTION")
    print("=" * 50)
    
    # Example of what gets extracted from GitHub API
    github_extraction_example = {
        "name": "Devika Malik",
        "bio": "AI Engineer passionate about machine learning and web development",
        "public_repos": 15,
        "languages": [
            "Python",
            "JavaScript", 
            "TypeScript",
            "Java",
            "C++",
            "HTML",
            "CSS"
        ],
        "repos": [
            {
                "name": "deepfake-detection",
                "description": "CNN-based deepfake detection system",
                "language": "Python",
                "stargazers_count": 45,
                "forks_count": 12,
                "html_url": "https://github.com/devikamalik/deepfake-detection"
            },
            {
                "name": "react-portfolio",
                "description": "Personal portfolio website built with React",
                "language": "JavaScript",
                "stargazers_count": 23,
                "forks_count": 8,
                "html_url": "https://github.com/devikamalik/react-portfolio"
            },
            {
                "name": "ml-algorithms",
                "description": "Implementation of machine learning algorithms from scratch",
                "language": "Python",
                "stargazers_count": 67,
                "forks_count": 19,
                "html_url": "https://github.com/devikamalik/ml-algorithms"
            }
        ]
    }
    
    print("📊 GITHUB API EXTRACTION RESULT:")
    print(json.dumps(github_extraction_example, indent=2))
    
    print(f"\n🔄 PROCESSING INTO SKILL PROFILE:")
    
    # Show how this gets converted to skill profile
    skill_profile_result = {
        "user_id": "github_devikamalik",
        "skills": [
            {
                "name": "Python",
                "category": "programming",
                "proficiency": 8,
                "years_experience": None
            },
            {
                "name": "JavaScript", 
                "category": "programming",
                "proficiency": 7,
                "years_experience": None
            },
            {
                "name": "TypeScript",
                "category": "programming", 
                "proficiency": 6,
                "years_experience": None
            },
            {
                "name": "Java",
                "category": "programming",
                "proficiency": 5,
                "years_experience": None
            }
        ],
        "experiences": [],
        "total_experience_years": 2.5,
        "github_repos": 15,
        "github_languages": ["Python", "JavaScript", "TypeScript", "Java", "C++", "HTML", "CSS"]
    }
    
    print("📋 RESULTING SKILL PROFILE:")
    print(json.dumps(skill_profile_result, indent=2))
    
    print(f"\n📈 ENHANCED ANALYSIS RESULT:")
    
    # Show final resume data format
    final_resume_data = {
        "name": "Devika Malik",
        "email": "",
        "education": [],
        "skills": {
            "languages": ["Python", "JavaScript", "TypeScript", "Java"],
            "frameworks": [],
            "tools": ["Git"],
            "soft_skills": []
        },
        "projects": [
            {
                "title": "Deepfake Detection System",
                "description": "CNN-based deepfake detection using Python and TensorFlow",
                "tech_stack": ["Python", "TensorFlow", "OpenCV"],
                "impact": "45 GitHub stars, 12 forks"
            }
        ],
        "experience": [],
        "certifications": [],
        "achievements": ["15 public repositories", "67 stars on ML algorithms project"],
        "github": "https://github.com/devikamalik",
        "linkedin": "",
        "career_summary": "AI Engineer passionate about machine learning and web development"
    }
    
    print("📄 FINAL RESUME DATA FORMAT:")
    print(json.dumps(final_resume_data, indent=2))
    
    print(f"\n🎯 KEY EXTRACTION POINTS:")
    print("• Name: From GitHub profile display name")
    print("• Bio: Becomes career summary")
    print("• Languages: Extracted from repository primary languages")
    print("• Projects: Generated from notable repositories")
    print("• Skills: Languages categorized as programming skills")
    print("• Proficiency: Estimated based on repository count and activity")
    print("• Achievements: Repository statistics (stars, forks)")

if __name__ == "__main__":
    show_github_json_example()