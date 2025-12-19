#!/usr/bin/env python3

"""
Simple script to show GitHub JSON extraction structure
"""

import json
from common import extract_github_data

def show_github_json_structure():
    """Show the GitHub JSON structure with a test profile"""
    
    print("🐙 GITHUB PROFILE JSON STRUCTURE")
    print("=" * 50)
    
    # Test with GitHub's official test account
    username = "octocat"
    
    print(f"📊 Testing with GitHub username: {username}")
    print("-" * 30)
    
    try:
        # Extract GitHub data
        github_data = extract_github_data(username)
        
        if "error" in github_data:
            print(f"❌ Error: {github_data['error']}")
            
            # Show expected structure instead
            print("\n📋 EXPECTED GITHUB JSON STRUCTURE:")
            expected_structure = {
                "name": "The Octocat",
                "bio": "GitHub mascot description",
                "public_repos": 8,
                "languages": ["C", "Assembly", "C++"],
                "repos": [
                    {
                        "name": "Hello-World",
                        "description": "My first repository on GitHub!",
                        "language": "C",
                        "stargazers_count": 2000,
                        "forks_count": 1500,
                        "html_url": "https://github.com/octocat/Hello-World"
                    }
                ]
            }
            print(json.dumps(expected_structure, indent=2))
            
        else:
            print("✅ GitHub data extracted successfully!")
            print("\n📋 ACTUAL GITHUB JSON STRUCTURE:")
            print(json.dumps(github_data, indent=2))
            
            # Analyze the structure
            print(f"\n📊 DATA ANALYSIS:")
            print(f"   • Name: {github_data.get('name', 'Not provided')}")
            print(f"   • Bio: {github_data.get('bio', 'Not provided')}")
            print(f"   • Public Repos: {github_data.get('public_repos', 0)}")
            print(f"   • Languages Found: {len(github_data.get('languages', []))}")
            print(f"   • Languages: {', '.join(github_data.get('languages', []))}")
            print(f"   • Repositories Analyzed: {len(github_data.get('repos', []))}")
            
            # Show first repository structure
            repos = github_data.get('repos', [])
            if repos:
                print(f"\n📁 SAMPLE REPOSITORY STRUCTURE:")
                sample_repo = repos[0]
                repo_structure = {
                    "name": sample_repo.get("name"),
                    "description": sample_repo.get("description"),
                    "language": sample_repo.get("language"),
                    "stargazers_count": sample_repo.get("stargazers_count"),
                    "forks_count": sample_repo.get("forks_count"),
                    "html_url": sample_repo.get("html_url")
                }
                print(json.dumps(repo_structure, indent=2))
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        
        # Show the expected structure
        print("\n📋 GITHUB JSON STRUCTURE (EXPECTED):")
        structure_doc = {
            "name": "string - User's display name",
            "bio": "string - User's bio/description", 
            "public_repos": "number - Count of public repositories",
            "languages": ["array", "of", "programming", "languages"],
            "repos": [
                {
                    "name": "string - Repository name",
                    "description": "string - Repository description",
                    "language": "string - Primary programming language",
                    "stargazers_count": "number - GitHub stars",
                    "forks_count": "number - Repository forks",
                    "updated_at": "string - Last update timestamp",
                    "html_url": "string - Repository URL",
                    "size": "number - Repository size in KB",
                    "default_branch": "string - Main branch name"
                }
            ]
        }
        print(json.dumps(structure_doc, indent=2))
    
    print(f"\n🔄 HOW THIS GETS PROCESSED:")
    print("1. GitHub API calls fetch user profile + repositories")
    print("2. Languages are extracted from each repository's 'language' field")
    print("3. Duplicate languages are removed to create unique skill list")
    print("4. Repository count influences estimated skill proficiency")
    print("5. All languages are categorized as 'programming' skills")
    print("6. Data flows into the skill profile creation system")
    
    print(f"\n📊 FINAL SKILL PROFILE STRUCTURE:")
    skill_profile_structure = {
        "user_id": "string - Generated user identifier",
        "skills": [
            {
                "name": "string - Programming language name",
                "category": "programming",
                "proficiency": "number - Estimated 1-10 scale",
                "years_experience": "null - Not available from GitHub"
            }
        ],
        "experiences": "array - Empty for GitHub analysis",
        "total_experience_years": "number - Estimated from repo count",
        "github_repos": "number - Public repository count",
        "github_languages": "array - List of programming languages"
    }
    print(json.dumps(skill_profile_structure, indent=2))

if __name__ == "__main__":
    show_github_json_structure()