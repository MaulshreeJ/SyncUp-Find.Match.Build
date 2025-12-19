#!/usr/bin/env python3
"""
Clear Streamlit cache and test fresh
"""

import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

def clear_cache_and_test():
    """Clear cache and run a fresh test"""
    print("🧹 Clearing Streamlit Cache and Testing Fresh")
    print("=" * 45)
    
    try:
        # Import streamlit to clear cache
        import streamlit as st
        
        # Clear all caches
        st.cache_data.clear()
        st.cache_resource.clear()
        print("✅ Streamlit cache cleared")
        
    except ImportError:
        print("ℹ️ Streamlit not available for cache clearing")
    
    # Test fresh workflow
    try:
        from graph import quick_skill_analysis_workflow
        
        print("\n🧪 Testing Fresh Workflow...")
        result = quick_skill_analysis_workflow("octocat", "github")
        
        if result.get("skill_profile"):
            profile = result["skill_profile"]
            skills_count = len(profile.get("skills", []))
            
            print(f"✅ Fresh test successful!")
            print(f"   Skills found: {skills_count}")
            print(f"   GitHub repos: {profile.get('github_repos', 0)}")
            
            if skills_count > 0:
                print(f"\n🎯 Skills that should display:")
                for skill in profile["skills"]:
                    print(f"   • {skill['name']} - Level {skill['proficiency']}/10")
            
            return True
        else:
            print("❌ Fresh test failed")
            return False
            
    except Exception as e:
        print(f"❌ Fresh test error: {e}")
        return False

if __name__ == "__main__":
    success = clear_cache_and_test()
    
    if success:
        print(f"\n🎉 CACHE CLEARED - STREAMLIT SHOULD WORK NOW!")
        print(f"   1. Restart Streamlit server")
        print(f"   2. Refresh browser (Ctrl+F5)")
        print(f"   3. Try analyzing 'octocat' again")
    else:
        print(f"\n❌ Issue persists - check error messages above")