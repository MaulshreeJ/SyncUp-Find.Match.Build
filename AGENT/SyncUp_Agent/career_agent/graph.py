from typing import Dict, Any, TypedDict
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3
import os

from common import (
    CareerAgentState,
    process_input_node,
    create_skill_profile_node,
    generate_learning_path_node,
    build_portfolio_node,
    match_mentors_node
)

def build_career_workflow() -> StateGraph:
    """Build the career development workflow"""
    builder = StateGraph(CareerAgentState)
    
    # Add nodes
    builder.add_node("input_processor", process_input_node)
    builder.add_node("skill_profiler", create_skill_profile_node)
    builder.add_node("learning_path_generator", generate_learning_path_node)
    builder.add_node("portfolio_builder", build_portfolio_node)
    builder.add_node("mentor_matcher", match_mentors_node)
    
    # Set entry point
    builder.set_entry_point("input_processor")
    
    # Add simple linear edges
    builder.add_edge("input_processor", "skill_profiler")
    builder.add_edge("skill_profiler", "learning_path_generator")
    builder.add_edge("learning_path_generator", "portfolio_builder")
    builder.add_edge("portfolio_builder", "mentor_matcher")
    builder.add_edge("mentor_matcher", END)
    
    return builder

def get_career_graph():
    """Get compiled career development graph with checkpointing"""
    # Create SQLite connection for checkpointing
    db_path = "checkpoints.sqlite"
    
    conn = sqlite3.connect(db_path, check_same_thread=False)
    checkpointer = SqliteSaver(conn)
    
    workflow = build_career_workflow().compile(checkpointer=checkpointer)
    return workflow

# ============ Specialized Workflows ============

def quick_skill_analysis_workflow(input_data: str, input_type: str) -> Dict[str, Any]:
    """Quick workflow for skill analysis only"""
    # Build a simple workflow without checkpointing for quick analysis
    builder = StateGraph(CareerAgentState)
    builder.add_node("input_processor", process_input_node)
    builder.add_node("skill_profiler", create_skill_profile_node)
    builder.set_entry_point("input_processor")
    builder.add_edge("input_processor", "skill_profiler")
    builder.add_edge("skill_profiler", END)
    
    # Compile without checkpointing to avoid LangSmith issues
    workflow = builder.compile()
    
    state = CareerAgentState(
        user_id="quick_analysis",
        input_type=input_type,
        input_data=input_data
    )
    
    try:
        # Run the workflow
        result_dict = workflow.invoke(state, config={"configurable": {"thread_id": "quick"}})
        
        # Convert back to state object
        result_state = CareerAgentState(**result_dict)
        
        return {
            "skill_profile": result_state.skill_profile.model_dump() if result_state.skill_profile else None,
            "resume_data": result_state.output.get("resume_data", {}),
            "trace": result_state.trace
        }
    except Exception as e:
        return {
            "error": f"Workflow execution failed: {str(e)}",
            "skill_profile": None,
            "resume_data": {},
            "trace": [f"Error: {str(e)}"]
        }

def full_career_development_workflow(
    input_data: str, 
    input_type: str, 
    target_role: str,
    user_id: str = "default"
) -> CareerAgentState:
    """Complete career development workflow"""
    graph = get_career_graph()
    
    state = CareerAgentState(
        user_id=user_id,
        input_type=input_type,
        input_data=input_data,
        target_role=target_role
    )
    
    result_dict = graph.invoke(state, config={"configurable": {"thread_id": user_id}})
    
    # Convert back to state object
    return CareerAgentState(**result_dict)

# ============ Enhanced Analysis Workflows ============

def enhanced_resume_analysis_graph_workflow(
    input_data: str, 
    input_type: str, 
    target_role: str = "Software Engineer"
) -> Dict[str, Any]:
    """Enhanced workflow with ATS analysis and improvement suggestions"""
    from common import enhanced_resume_analysis_workflow
    
    return enhanced_resume_analysis_workflow(input_data, input_type, target_role)