import argparse
import json
import os
from graph import full_career_development_workflow, quick_skill_analysis_workflow
from common import load_json_data

def main():
    parser = argparse.ArgumentParser(description="Career & Skill Development Agent CLI")
    
    # Input options
    parser.add_argument("--github", help="GitHub username for analysis")
    parser.add_argument("--resume", help="Path to resume text file")
    parser.add_argument("--linkedin", help="LinkedIn profile URL (demo only)")
    
    # Workflow options
    parser.add_argument("--target-role", help="Target career role")
    parser.add_argument("--quick", action="store_true", help="Quick skill analysis only")
    parser.add_argument("--user-id", default="cli-user", help="User ID for session")
    
    # Output options
    parser.add_argument("--output", help="Output file for results (JSON)")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Determine input type and data
    input_type = None
    input_data = None
    
    if args.github:
        input_type = "github"
        input_data = args.github
    elif args.resume:
        input_type = "resume"
        if not os.path.exists(args.resume):
            print(f"Error: Resume file '{args.resume}' not found.")
            return
        
        # For PDF files, pass the file path; for text files, read the content
        if args.resume.lower().endswith('.pdf'):
            input_data = args.resume  # Pass file path for PDF processing
        else:
            try:
                with open(args.resume, 'r', encoding='utf-8') as f:
                    input_data = f.read()
            except UnicodeDecodeError:
                print(f"Error: Could not read '{args.resume}' as text. For PDF files, use .pdf extension.")
                return
    elif args.linkedin:
        input_type = "linkedin"
        input_data = args.linkedin
    else:
        print("Error: Please provide either --github, --resume, or --linkedin")
        parser.print_help()
        return
    
    print(f"🚀 Career & Skill Development Agent")
    print(f"📊 Analyzing {input_type}: {input_data}")
    
    try:
        if args.quick:
            # Quick skill analysis only
            print("⚡ Running quick skill analysis...")
            result = quick_skill_analysis_workflow(input_data, input_type)
            
            if args.verbose:
                print("\n📋 Execution Trace:")
                for step in result.get("trace", []):
                    print(f"  • {step}")
            
            if result.get("skill_profile"):
                profile = result["skill_profile"]
                print(f"\n✅ Analysis Complete!")
                print(f"📊 Skills Found: {len(profile['skills'])}")
                print(f"💼 Experience: {profile['total_experience_years']:.1f} years")
                
                if profile.get("github_repos"):
                    print(f"🐙 GitHub Repos: {profile['github_repos']}")
                
                print(f"\n🎯 Top Skills:")
                for skill in profile["skills"][:5]:
                    print(f"  • {skill['name']} ({skill['category']}) - Level {skill['proficiency']}/10")
            else:
                print("❌ Could not analyze profile")
        
        else:
            # Full workflow
            if not args.target_role:
                print("Error: --target-role is required for full workflow")
                return
            
            print(f"🎯 Target Role: {args.target_role}")
            print("🔄 Running full career development workflow...")
            
            result = full_career_development_workflow(
                input_data, input_type, args.target_role, args.user_id
            )
            
            if args.verbose:
                print("\n📋 Execution Trace:")
                for step in result.trace:
                    print(f"  • {step}")
            
            print(f"\n✅ Workflow Complete!")
            
            # Display results
            if result.skill_profile:
                print(f"\n👤 Skill Profile:")
                print(f"  📊 Skills: {len(result.skill_profile.skills)}")
                print(f"  💼 Experience: {result.skill_profile.total_experience_years:.1f} years")
            
            if result.learning_path:
                lp = result.learning_path
                print(f"\n🎯 Learning Path:")
                print(f"  📈 Current Match: {lp.current_skill_match:.1%}")
                print(f"  ⏱️  Timeline: {lp.timeline_weeks} weeks")
                print(f"  🎯 Skill Gaps: {len(lp.skill_gaps)}")
                if lp.skill_gaps:
                    print(f"     • {', '.join(lp.skill_gaps[:3])}")
            
            if result.portfolio_projects:
                print(f"\n💼 Portfolio Projects: {len(result.portfolio_projects)}")
                for project in result.portfolio_projects[:2]:
                    print(f"  🚀 {project.title}")
                    print(f"     Tech: {', '.join(project.tech_stack[:3])}")
            
            if result.mentor_matches:
                print(f"\n👥 Mentor Matches: {len(result.mentor_matches)}")
                for match in result.mentor_matches[:3]:
                    print(f"  👤 {match.mentor.name} ({match.compatibility_score:.1%} match)")
                    print(f"     Expertise: {', '.join(match.mentor.expertise[:3])}")
        
        # Save output if requested
        if args.output:
            output_data = result.model_dump() if hasattr(result, 'model_dump') else result
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, default=str)
            print(f"\n💾 Results saved to {args.output}")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if args.verbose:
            import traceback
            traceback.print_exc()

def demo_commands():
    """Print example CLI commands"""
    print("🚀 Career & Skill Development Agent - Demo Commands")
    print("\n📊 Quick Skill Analysis:")
    print("  python run_cli.py --github octocat --quick")
    print("  python run_cli.py --resume resume.txt --quick --verbose")
    
    print("\n🎯 Full Career Development:")
    print("  python run_cli.py --github octocat --target-role 'AI Engineer'")
    print("  python run_cli.py --resume resume.txt --target-role 'Full Stack Developer' --output results.json")
    
    print("\n🔍 Available Target Roles:")
    roles_data = load_json_data("career_agent/data/mock_roles.json")
    for role in roles_data[:5]:
        print(f"  • {role['title']}")
    print(f"  ... and {len(roles_data) - 5} more")

if __name__ == "__main__":
    if len(os.sys.argv) == 1:
        demo_commands()
    else:
        main()