#!/usr/bin/env python3
"""
Simple test to verify the career agent workflow
"""

import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

def main():
    print("🧪 Simple Career Agent Test")
    print("=" * 30)
    
    try:
        from common import CareerAgentState, process_input_node, create_skill_profile_node
        from graph import build_career_workflow
        
        print("✅ Imports successful")
        
        # Test basic state creation
        state = CareerAgentState(
            user_id="test",
            input_type="resume",
            input_data="Test resume with Python and JavaScript skills"
        )
        print("✅ State creation successful")
        
        # Test individual node
        result_state = process_input_node(state)
        print(f"✅ Input processing successful: {result_state.current_step}")
        
        # Test workflow building
        workflow_builder = build_career_workflow()
        print("✅ Workflow building successful")
        
        # Test compilation (without checkpointing)
        try:
            workflow = workflow_builder.compile()
            print("✅ Workflow compilation successful")
            
            # Test simple invoke
            test_state = CareerAgentState(
                user_id="test",
                input_type="resume", 
                input_data="Sample resume: Python developer with 3 years experience"
            )
            
            result = workflow.invoke(test_state)
            print(f"✅ Workflow execution successful")
            print(f"   Final step: {result.current_step}")
            print(f"   Trace steps: {len(result.trace)}")
            
            if result.skill_profile:
                print(f"   Skills found: {len(result.skill_profile.skills)}")
            
        except Exception as e:
            print(f"❌ Workflow execution failed: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    print(f"\n{'🎉 All tests passed!' if success else '❌ Tests failed'}")
    sys.exit(0 if success else 1)