"""
Test script to verify all imports work correctly
"""

import sys
from pathlib import Path

# Add paths
career_agent_path = str(Path(__file__).parent / "career_agent")
agentic_zip_path = str(Path(__file__).parent / "agentic_zip")

sys.path.insert(0, career_agent_path)
sys.path.insert(1, agentic_zip_path)

print("Testing imports...")
print("=" * 50)

# Test career agent imports
try:
    from graph import full_career_development_workflow
    from common import extract_github_data, enhanced_resume_analysis_workflow
    print("✅ Career agent imports successful")
except ImportError as e:
    print(f"❌ Career agent import failed: {e}")

# Test matcher agent imports
sys.path.insert(0, agentic_zip_path)
try:
    import graph as matcher_graph
    import common as matcher_common
    print("✅ Matcher agent imports successful")
except ImportError as e:
    print(f"❌ Matcher agent import failed: {e}")

print("=" * 50)
print("Import test complete!")
