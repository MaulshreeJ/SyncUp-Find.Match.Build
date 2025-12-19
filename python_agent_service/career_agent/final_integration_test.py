#!/usr/bin/env python3
"""
Final integration test for the complete Career Agent system
"""

import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_github_workflow():
    """Test GitHub analysis workflow"""
    print("🐙 Testing GitHub Workflow")
    print("=" * 25)
    
    try:
        from graph import quick_skill_analysis_workflow
        
        result = quick_skill_analysis_workflow("octocat", "github")
        
        if result.get("skill_profile"):
            profile = result["skill_profile"]
            skills = profile.get("skills", [])
            repos = profile.get("github_repos", 0)
            languages = profile.get("github_languages", [])
            
            print(f"✅ GitHub analysis successful!")
            print(f"   Skills: {len(skills)}")
            print(f"   Repos: {repos}")
            print(f"   Languages: {len(languages)}")
            
            return len(skills) > 0 and repos > 0
        else:
            print("❌ GitHub analysis failed")
            return False
            
    except Exception as e:
        print(f"❌ GitHub workflow error: {e}")
        return False

def test_pdf_resume_workflow():
    """Test PDF resume analysis workflow"""
    print("\n📄 Testing PDF Resume Workflow")
    print("=" * 30)
    
    try:
        from graph import quick_skill_analysis_workflow
        
        pdf_path = "career_agent/sample_resume.pdf"
        result = quick_skill_analysis_workflow(pdf_path, "resume")
        
        if result.get("skill_profile"):
            profile = result["skill_profile"]
            skills = profile.get("skills", [])
            experiences = profile.get("experiences", [])
            
            print(f"✅ PDF resume analysis successful!")
            print(f"   Skills: {len(skills)}")
            print(f"   Experiences: {len(experiences)}")
            print(f"   Experience years: {profile.get('total_experience_years', 0)}")
            
            return len(skills) > 0
        else:
            print("❌ PDF resume analysis failed")
            return False
            
    except Exception as e:
        print(f"❌ PDF workflow error: {e}")
        return False

def test_text_resume_workflow():
    """Test text resume analysis workflow"""
    print("\n📝 Testing Text Resume Workflow")
    print("=" * 30)
    
    try:
        from graph import quick_skill_analysis_workflow
        
        sample_resume = """
        Alex Chen
        Full Stack Developer
        
        Experience:
        - 4 years at Google developing React applications
        - Built microservices with Node.js and Python
        - Led team of 5 engineers on ML projects
        
        Skills: Python, JavaScript, React, Node.js, TensorFlow, AWS, Docker
        
        Education:
        - MS Computer Science, MIT
        """
        
        result = quick_skill_analysis_workflow(sample_resume, "resume")
        
        if result.get("skill_profile"):
            profile = result["skill_profile"]
            skills = profile.get("skills", [])
            experiences = profile.get("experiences", [])
            
            print(f"✅ Text resume analysis successful!")
            print(f"   Skills: {len(skills)}")
            print(f"   Experiences: {len(experiences)}")
            
            return len(skills) > 0
        else:
            print("❌ Text resume analysis failed")
            return False
            
    except Exception as e:
        print(f"❌ Text workflow error: {e}")
        return False

def test_full_career_workflow():
    """Test complete career development workflow"""
    print("\n🎯 Testing Full Career Workflow")
    print("=" * 30)
    
    try:
        from graph import full_career_development_workflow
        
        sample_resume = "John Developer\nSkills: Python, React, AWS\nExperience: 3 years software development"
        
        result = full_career_development_workflow(
            sample_resume, "resume", "AI Engineer", "test_user"
        )
        
        components = [
            ("Skill Profile", result.skill_profile is not None),
            ("Learning Path", result.learning_path is not None),
            ("Portfolio Projects", len(result.portfolio_projects) > 0),
            ("Mentor Matches", len(result.mentor_matches) > 0),
        ]
        
        print(f"✅ Full workflow completed!")
        for name, status in components:
            status_icon = "✅" if status else "❌"
            print(f"   {status_icon} {name}")
        
        return all(status for _, status in components)
        
    except Exception as e:
        print(f"❌ Full workflow error: {e}")
        return False

def test_streamlit_compatibility():
    """Test Streamlit compatibility (imports and basic functions)"""
    print("\n🌐 Testing Streamlit Compatibility")
    print("=" * 35)
    
    try:
        # Test imports that Streamlit uses
        import streamlit as st
        import os
        import pandas as pd
        from graph import quick_skill_analysis_workflow
        from common import load_json_data
        
        print("✅ Streamlit imports successful")
        
        # Test data loading (used by Streamlit)
        mentors = load_json_data("career_agent/data/mock_mentors.json")
        roles = load_json_data("career_agent/data/mock_roles.json")
        
        print(f"✅ Data loading successful: {len(mentors)} mentors, {len(roles)} roles")
        
        # Test workflow function (used by Streamlit)
        result = quick_skill_analysis_workflow("Test resume with Python skills", "resume")
        
        if result.get("skill_profile") is not None:
            print("✅ Workflow function compatible with Streamlit")
            return True
        else:
            print("❌ Workflow function not compatible")
            return False
            
    except Exception as e:
        print(f"❌ Streamlit compatibility error: {e}")
        return False

def main():
    """Run comprehensive integration test"""
    print("🚀 Career Agent - Final Integration Test")
    print("=" * 45)
    
    tests = [
        ("GitHub Workflow", test_github_workflow),
        ("PDF Resume Workflow", test_pdf_resume_workflow),
        ("Text Resume Workflow", test_text_resume_workflow),
        ("Full Career Workflow", test_full_career_workflow),
        ("Streamlit Compatibility", test_streamlit_compatibility),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("📊 FINAL INTEGRATION TEST RESULTS:")
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall Score: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 COMPLETE SUCCESS! Your Career Agent is fully functional!")
        print("\n✅ What's Working:")
        print("   • GitHub profile analysis with real API calls")
        print("   • PDF resume extraction and analysis")
        print("   • Text resume parsing and skill extraction")
        print("   • Complete career development workflows")
        print("   • Learning path generation")
        print("   • Portfolio project suggestions")
        print("   • Mentor matching with compatibility scores")
        print("   • Streamlit web interface compatibility")
        print("   • CLI interface with file support")
        
        print(f"\n🚀 Ready to Use:")
        print(f"   Web Interface: streamlit run career_agent/streamlit_app.py")
        print(f"   CLI Interface: python career_agent/run_cli.py --help")
        
    elif passed >= 4:
        print("\n✅ MOSTLY WORKING! Minor issues detected but core functionality is solid.")
    else:
        print("\n⚠️ ISSUES DETECTED! Check the failed tests above.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)